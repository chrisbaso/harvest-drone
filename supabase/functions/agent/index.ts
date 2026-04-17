import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { upsertContact } from "../_shared/mailchimp.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const MAILCHIMP_API_KEY = Deno.env.get("MAILCHIMP_API_KEY");
const MAILCHIMP_SERVER = Deno.env.get("MAILCHIMP_SERVER_PREFIX");
const MAILCHIMP_LIST_ID = Deno.env.get("MAILCHIMP_LIST_ID");

if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error("Missing required environment variables for the agent function.");
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, apikey, x-client-info",
};

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const READ_TABLES: Record<string, string[]> = {
  grower_leads: ["id", "first_name", "email", "state", "acres", "crop_type", "status", "created_at", "notes"],
  operator_leads: ["id", "first_name", "email", "state", "company_name", "weekly_capacity", "status", "created_at", "notes"],
  source_orders: ["id", "first_name", "email", "state", "acres", "product", "estimated_total", "status", "created_at"],
  crm_leads: ["id", "first_name", "email", "state", "lead_type", "acres", "stage", "route_type", "owner", "source", "notes", "created_at", "updated_at"],
  jobs: ["id", "title", "state", "crop_type", "acres", "status", "assigned_to", "notes", "created_at"],
  drip_enrollments: ["id", "lead_type", "email", "first_name", "current_step", "status", "enrolled_at", "last_sent_at", "next_send_at", "completed_at", "updated_at"],
};

const READ_OPERATORS = new Set(["eq", "neq", "gt", "gte", "lt", "lte", "like", "ilike", "is"]);

const ACTION_SPECS = {
  update_crm_lead_stage: { actionLabel: "Update CRM lead stage", table: "crm_leads", lookupColumns: ["id", "email", "first_name", "state", "lead_type", "stage"], allowedUpdates: { stage: ["new", "contacted", "qualified", "call_scheduled", "closed_won", "closed_lost"] } },
  assign_crm_lead_owner: { actionLabel: "Assign CRM lead owner", table: "crm_leads", lookupColumns: ["id", "email", "first_name", "state", "lead_type", "owner"], allowedUpdates: { owner: "text" } },
  update_drip_enrollment_status: { actionLabel: "Update drip enrollment status", table: "drip_enrollments", lookupColumns: ["id", "email", "first_name", "lead_type", "status"], allowedUpdates: { status: ["active", "paused", "completed"] } },
  update_source_order_status: { actionLabel: "Update SOURCE order status", table: "source_orders", lookupColumns: ["id", "email", "first_name", "state", "status"], allowedUpdates: { status: ["pending", "paid", "cancelled", "refunded"] } },
} as const;

type ActionType = keyof typeof ACTION_SPECS;
type ChatMessage = { role: string; content: string };
type PlannedQuery = { table: string; select?: string; filters?: Array<{ column: string; operator: string; value: unknown }>; order?: { column: string; ascending?: boolean }; limit?: number; count?: boolean; aggregate?: string | { type?: string; column?: string }; aggregateColumn?: string };
type QueryPlan = { queries?: PlannedQuery[]; description?: string };
type ActionPlan = { actionType: ActionType; lookup: { filters: Array<{ column: string; operator: string; value: unknown }> }; updates: Record<string, unknown>; reason?: string; responseIntro?: string; confirmationMessage?: string };
type PendingAction = { actionType: ActionType; actionLabel: string; table: string; recordId: string; targetSummary: string; updateSummary: string; confirmationMessage: string; reason: string; requestMessage: string; updates: Record<string, unknown> };

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...corsHeaders } });
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

function cleanJsonResponse(value: string) {
  return value.replace(/```json?/g, "").replace(/```/g, "").trim();
}

function formatHistory(history: ChatMessage[] = []) {
  return history.slice(-10).map((item) => `${item.role}: ${item.content}`).join("\n");
}

function isReadColumnAllowed(table: string, column?: string | null) {
  return Boolean(column && READ_TABLES[table]?.includes(column));
}

function sanitizeSelect(table: string, select = "*") {
  if (select === "*") return "*";
  const columns = select.split(",").map((column) => column.trim()).filter((column) => isReadColumnAllowed(table, column));
  return columns.length > 0 ? columns.join(",") : "*";
}

function normalizeAggregate(query: PlannedQuery) {
  if (!query.aggregate) return null;
  if (typeof query.aggregate === "string") return { type: query.aggregate, column: query.aggregateColumn || null };
  return { type: query.aggregate.type || null, column: query.aggregate.column || query.aggregateColumn || null };
}

function isActionType(value: string): value is ActionType {
  return value in ACTION_SPECS;
}

function applyActionSummary(actionType: ActionType, updates: Record<string, unknown>) {
  if (actionType === "update_crm_lead_stage") return `Move lead to ${String(updates.stage)}`;
  if (actionType === "assign_crm_lead_owner") return `Assign owner to ${String(updates.owner)}`;
  if (actionType === "update_drip_enrollment_status") return `Set enrollment to ${String(updates.status)}`;
  return `Mark SOURCE order as ${String(updates.status)}`;
}

function formatTargetSummary(table: string, record: Record<string, unknown>) {
  if (table === "crm_leads") return `${record.first_name || "Lead"} - ${record.email || "No email"} - ${record.state || "No state"}`;
  if (table === "drip_enrollments") return `${record.first_name || "Enrollment"} - ${record.email || "No email"} - ${record.status || "No status"}`;
  return `${record.first_name || "Order"} - ${record.email || "No email"} - ${record.status || "No status"}`;
}

async function callOpenAI(messages: ChatMessage[], model = "gpt-4o-mini", maxTokens = 1000) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature: 0.3 }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "OpenAI API error");
  return data.choices?.[0]?.message?.content?.trim() || "";
}

async function callMailchimp(endpoint: string) {
  if (!MAILCHIMP_API_KEY || !MAILCHIMP_SERVER) throw new Error("Mailchimp is not configured for the agent.");
  const response = await fetch(`https://${MAILCHIMP_SERVER}.api.mailchimp.com/3.0${endpoint}`, {
    headers: { Authorization: "Basic " + btoa(`anystring:${MAILCHIMP_API_KEY}`) },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Mailchimp API error");
  return data;
}

async function classifyIntent(message: string) {
  const result = await callOpenAI([{ role: "system", content: `Classify this user message into exactly one category. Respond with ONLY the category name.\n\nCategories:\n- data_query\n- email_stats\n- action_request\n- lead_priority\n- general` }, { role: "user", content: message }], "gpt-4o-mini", 20);
  return result.toLowerCase().replace(/[^a-z_]/g, "");
}

async function handleDataQuery(message: string, history: ChatMessage[] = []) {
  const queryPlanText = await callOpenAI(
    [
      { role: "system", content: `You are a data assistant for Harvest Drone.\n\nUse only these read-only tables:\n- grower_leads\n- operator_leads\n- source_orders\n- crm_leads\n- jobs\n- drip_enrollments\n\nRespond with ONLY valid JSON:\n{"queries":[{"table":"crm_leads","select":"*","filters":[{"column":"state","operator":"eq","value":"Minnesota"}],"order":{"column":"created_at","ascending":false},"limit":20,"count":false,"aggregate":null,"aggregateColumn":null}],"description":"summary"}\n\nAllowed operators: eq, neq, gt, gte, lt, lte, like, ilike, is.` },
      { role: "user", content: `Conversation context:\n${formatHistory(history)}\n\nUser question:\n${message}` },
    ],
    "gpt-4o-mini",
    600,
  );

  let plan: QueryPlan;
  try {
    plan = JSON.parse(cleanJsonResponse(queryPlanText));
  } catch {
    return "I could not map that request to a clean data lookup. Try a tighter question like **How many grower leads this week?**, **Show unpaid SOURCE orders**, or **Total acres across CRM leads**.";
  }

  const results: unknown[] = [];
  for (const plannedQuery of plan.queries || []) {
    if (!READ_TABLES[plannedQuery.table]) {
      results.push({ table: plannedQuery.table, error: "Table not allowed." });
      continue;
    }
    const select = sanitizeSelect(plannedQuery.table, plannedQuery.select);
    const aggregate = normalizeAggregate(plannedQuery);
    const shouldCount = Boolean(plannedQuery.count);
    const limit = Math.min(Math.max(plannedQuery.limit || 20, 1), 100);
    const countOptions = shouldCount ? { count: "exact" as const, head: true } : undefined;
    let query = supabase.from(plannedQuery.table).select(shouldCount ? "id" : aggregate?.type === "sum" && isReadColumnAllowed(plannedQuery.table, aggregate.column) ? aggregate.column! : select, countOptions);

    for (const filter of plannedQuery.filters || []) {
      if (!isReadColumnAllowed(plannedQuery.table, filter.column) || !READ_OPERATORS.has(filter.operator)) continue;
      if (filter.operator === "eq") query = query.eq(filter.column, filter.value);
      if (filter.operator === "neq") query = query.neq(filter.column, filter.value);
      if (filter.operator === "gt") query = query.gt(filter.column, filter.value);
      if (filter.operator === "gte") query = query.gte(filter.column, filter.value);
      if (filter.operator === "lt") query = query.lt(filter.column, filter.value);
      if (filter.operator === "lte") query = query.lte(filter.column, filter.value);
      if (filter.operator === "like") query = query.like(filter.column, String(filter.value));
      if (filter.operator === "ilike") query = query.ilike(filter.column, String(filter.value));
      if (filter.operator === "is") query = query.is(filter.column, filter.value);
    }

    if (plannedQuery.order && isReadColumnAllowed(plannedQuery.table, plannedQuery.order.column)) {
      query = query.order(plannedQuery.order.column, { ascending: plannedQuery.order.ascending ?? false });
    }
    if (!shouldCount) query = query.limit(limit);

    const { data, error, count } = await query;
    if (error) {
      results.push({ table: plannedQuery.table, error: error.message });
      continue;
    }
    if (aggregate?.type === "sum" && aggregate.column && data) {
      const value = data.reduce((sum: number, row: Record<string, unknown>) => sum + Number(row[aggregate.column as string] || 0), 0);
      results.push({ table: plannedQuery.table, aggregate: "sum", column: aggregate.column, value, rowCount: data.length });
      continue;
    }
    if (shouldCount) {
      results.push({ table: plannedQuery.table, count: count || 0 });
      continue;
    }
    results.push({ table: plannedQuery.table, data: data || [], rowCount: data?.length || 0 });
  }

  return callOpenAI(
    [
      { role: "system", content: `You are a friendly data assistant for Harvest Drone. Use plain language, keep it concise, format numbers cleanly, and do not mention SQL or Supabase. You may use simple markdown tables and Metric: Value blocks.` },
      { role: "user", content: `Conversation context:\n${formatHistory(history)}\n\nUser asked: "${message}"\n\nLookup summary: ${plan.description || "No description"}\n\nResults:\n${JSON.stringify(results, null, 2)}` },
    ],
    "gpt-4o-mini",
    900,
  );
}

async function handleEmailStats(message: string) {
  try {
    const [automations, campaigns, audience] = await Promise.all([
      callMailchimp("/automations"),
      callMailchimp("/campaigns?count=10&sort_field=send_time&sort_dir=DESC"),
      MAILCHIMP_LIST_ID ? callMailchimp(`/lists/${MAILCHIMP_LIST_ID}`) : Promise.reject(new Error("Mailchimp list ID missing.")),
    ]);
    const mailchimpData = {
      audience: { total_subscribers: audience.stats?.member_count, unsubscribes: audience.stats?.unsubscribe_count, cleaned: audience.stats?.cleaned_count, open_rate: audience.stats?.open_rate, click_rate: audience.stats?.click_rate },
      automations: automations.automations?.map((automation: Record<string, unknown>) => ({ name: (automation.settings as Record<string, unknown> | undefined)?.title, status: automation.status, emails_sent: automation.emails_sent, started: automation.started_at })) || [],
      recent_campaigns: campaigns.campaigns?.map((campaign: Record<string, unknown>) => {
        const settings = (campaign.settings as Record<string, unknown>) || {};
        const reportSummary = (campaign.report_summary as Record<string, unknown>) || {};
        return { name: settings.title || settings.subject_line, subject: settings.subject_line, status: campaign.status, sent: campaign.emails_sent, opens: reportSummary.opens, unique_opens: reportSummary.unique_opens, open_rate: reportSummary.open_rate, clicks: reportSummary.subscriber_clicks, click_rate: reportSummary.click_rate, unsubscribes: reportSummary.unsubscribes || 0, bounces: reportSummary.bounces || 0, send_time: campaign.send_time };
      }) || [],
    };
    return await callOpenAI(
      [
        { role: "system", content: `You are an email marketing assistant for Harvest Drone. Express open and click rates as percentages, compare against ag benchmarks of 20% opens and 2% clicks, flag issues, and keep it actionable. You may use simple markdown tables.` },
        { role: "user", content: `Jake asked: "${message}"\n\nMailchimp data:\n${JSON.stringify(mailchimpData, null, 2)}` },
      ],
      "gpt-4o-mini",
      900,
    );
  } catch (error) {
    return `I could not pull Mailchimp stats right now. ${getErrorMessage(error)}`;
  }
}

async function handleLeadPriority(message: string) {
  const [{ data: growerLeads }, { data: sourceOrders }, { data: enrollments }] = await Promise.all([
    supabase.from("grower_leads").select("*").order("created_at", { ascending: false }).limit(50),
    supabase.from("source_orders").select("*").order("created_at", { ascending: false }).limit(20),
    supabase.from("drip_enrollments").select("*").eq("status", "active").order("enrolled_at", { ascending: false }).limit(50),
  ]);
  let mailchimpMembers: Record<string, unknown>[] = [];
  try {
    if (MAILCHIMP_LIST_ID) {
      const membersResponse = await callMailchimp(`/lists/${MAILCHIMP_LIST_ID}/members?count=100&sort_field=last_changed&sort_dir=DESC`);
      mailchimpMembers = membersResponse.members || [];
    }
  } catch {
    mailchimpMembers = [];
  }
  const leadData = {
    grower_leads: growerLeads?.map((lead: Record<string, unknown>) => ({ name: lead.first_name, email: lead.email, state: lead.state, acres: lead.acres, crop: lead.crop_type, status: lead.status, created: lead.created_at })) || [],
    source_orders: sourceOrders?.map((order: Record<string, unknown>) => ({ name: order.first_name, email: order.email, state: order.state, acres: order.acres, total: order.estimated_total, status: order.status, created: order.created_at })) || [],
    active_enrollments: enrollments?.length || 0,
    mailchimp_engagement: mailchimpMembers.slice(0, 20).map((member) => ({ email: member.email_address, name: (member.merge_fields as Record<string, unknown> | undefined)?.FNAME, open_rate: (member.stats as Record<string, unknown> | undefined)?.avg_open_rate, click_rate: (member.stats as Record<string, unknown> | undefined)?.avg_click_rate, last_activity: member.last_changed })),
  };
  return callOpenAI(
    [
      { role: "system", content: `You are a sales assistant for Harvest Drone. Prioritize follow-ups with this ranking: unpaid SOURCE orders highest, then highly engaged large-acreage leads, then recent 500+ acre grower leads, then nurture-only leads. Output a practical ranked list, max 10 leads.` },
      { role: "user", content: `Jake asked: "${message}"\n\nLead data:\n${JSON.stringify(leadData, null, 2)}` },
    ],
    "gpt-4o-mini",
    1100,
  );
}

async function planAction(message: string, history: ChatMessage[] = []) {
  const planText = await callOpenAI(
    [
      { role: "system", content: `You are planning a safe internal action for Harvest Drone. Choose exactly one action from this allowlist: update_crm_lead_stage, assign_crm_lead_owner, update_drip_enrollment_status, update_source_order_status.\n\nReturn ONLY JSON:\n{"actionType":"update_crm_lead_stage","lookup":{"filters":[{"column":"email","operator":"eq","value":"someone@example.com"}]},"updates":{"stage":"qualified"},"reason":"short reason","responseIntro":"one sentence","confirmationMessage":"question"}\n\nRules:\n- Use only eq or ilike for lookup operators\n- Only these update values are valid:\n  - stage: new, contacted, qualified, call_scheduled, closed_won, closed_lost\n  - enrollment status: active, paused, completed\n  - source order status: pending, paid, cancelled, refunded\n  - owner: free text\n- Respond with only JSON` },
      { role: "user", content: `Conversation context:\n${formatHistory(history)}\n\nUser request:\n${message}` },
    ],
    "gpt-4o-mini",
    500,
  );

  let plan: ActionPlan;
  try {
    plan = JSON.parse(cleanJsonResponse(planText));
  } catch {
    return { response: "I could not turn that into a safe action plan. Try **assign Emma to Jake**, **move Chris to qualified**, or **mark Sarah's SOURCE order paid**." };
  }
  if (!isActionType(plan.actionType)) {
    return { response: "That request does not map to one of the safe actions I can take yet. For now I can update CRM lead stage, assign lead owner, pause or resume enrollments, and change SOURCE order status." };
  }

  const spec = ACTION_SPECS[plan.actionType];
  const lookupFilters = (plan.lookup?.filters || []).filter((filter) => spec.lookupColumns.includes(filter.column) && ["eq", "ilike"].includes(filter.operator) && String(filter.value || "").trim());
  if (lookupFilters.length === 0) {
    return { response: "I need a clearer target before I can prepare that action. Include an email, a first name plus state, or a more specific identifier." };
  }

  const sanitizedUpdates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(plan.updates || {})) {
    const rule = spec.allowedUpdates[key as keyof typeof spec.allowedUpdates];
    if (!rule) continue;
    if (Array.isArray(rule) && typeof value === "string" && rule.includes(value)) sanitizedUpdates[key] = value;
    if (rule === "text" && typeof value === "string" && value.trim()) sanitizedUpdates[key] = value.trim();
  }
  if (Object.keys(sanitizedUpdates).length === 0) {
    return { response: "I found the action type, but the requested change is not valid yet. Double-check the target status or owner value and try again." };
  }

  let lookupQuery = supabase.from(spec.table).select("*").limit(5);
  for (const filter of lookupFilters) {
    if (filter.operator === "eq") lookupQuery = lookupQuery.eq(filter.column, filter.value);
    if (filter.operator === "ilike") lookupQuery = lookupQuery.ilike(filter.column, String(filter.value));
  }
  const { data: records, error } = await lookupQuery;
  if (error) return { response: `I could not look up the target record: ${error.message}` };
  if (!records || records.length === 0) return { response: "I could not find a matching record for that action. Try using the lead or order email, or add a state to narrow it down." };
  if (records.length > 1) {
    const rows = records.slice(0, 5).map((record) => `| ${record.first_name || "-"} | ${record.email || "-"} | ${record.state || "-"} |`).join("\n");
    return { response: `I found multiple possible matches, so I stopped before any write.\n\n| Name | Email | State |\n| --- | --- | --- |\n${rows}\n\nGive me the email or a more specific identifier and I will rebuild the action safely.` };
  }

  const record = records[0];
  const pendingAction: PendingAction = {
    actionType: plan.actionType,
    actionLabel: spec.actionLabel,
    table: spec.table,
    recordId: String(record.id),
    targetSummary: formatTargetSummary(spec.table, record),
    updateSummary: applyActionSummary(plan.actionType, sanitizedUpdates),
    confirmationMessage: plan.confirmationMessage || `Confirm this ${spec.actionLabel.toLowerCase()}?`,
    reason: plan.reason || "Requested by Jake in the agent workspace.",
    requestMessage: message,
    updates: sanitizedUpdates,
  };

  return {
    response: plan.responseIntro || "I found a safe action plan and have not changed anything yet. Review it below, then confirm if you want me to apply it.",
    pendingAction,
  };
}

async function logAgentAction(params: { pendingAction: PendingAction; status: string; resultSummary?: string; errorMessage?: string }) {
  try {
    await supabase.from("agent_action_logs").insert({
      action_type: params.pendingAction.actionType,
      target_table: params.pendingAction.table,
      target_id: params.pendingAction.recordId,
      target_label: params.pendingAction.targetSummary,
      request_message: params.pendingAction.requestMessage,
      reason: params.pendingAction.reason,
      updates: params.pendingAction.updates,
      status: params.status,
      result_summary: params.resultSummary || null,
      error_message: params.errorMessage || null,
      executed_at: params.status === "completed" ? new Date().toISOString() : null,
    });
  } catch (_error) {
    // Audit logging should not block the underlying confirmed action.
  }
}

async function executeAction(pendingAction: PendingAction) {
  if (!isActionType(pendingAction.actionType)) return "That pending action is not valid anymore.";
  const spec = ACTION_SPECS[pendingAction.actionType];
  const updates = { ...pendingAction.updates } as Record<string, unknown>;
  const nowIso = new Date().toISOString();
  if (spec.table === "crm_leads") updates.updated_at = nowIso;
  if (pendingAction.actionType === "update_drip_enrollment_status") {
    updates.updated_at = nowIso;
    if (updates.status === "completed") updates.completed_at = nowIso;
    if (updates.status === "active") {
      updates.next_send_at = nowIso;
      updates.completed_at = null;
    }
  }
  const { data, error } = await supabase.from(spec.table).update(updates).eq("id", pendingAction.recordId).select("*").single();
  if (error) {
    await logAgentAction({ pendingAction, status: "failed", errorMessage: error.message });
    return `I could not complete that action: ${error.message}`;
  }
  if (pendingAction.actionType === "update_source_order_status" && updates.status === "paid") {
    const mailchimpResult = await upsertContact({
      email: String(data.email || ""),
      firstName: data.first_name ? String(data.first_name) : undefined,
      state: data.state ? String(data.state) : undefined,
      acres: data.acres ? String(data.acres) : undefined,
      tags: ["source-paid"],
    });

    if (!mailchimpResult.success) {
      await logAgentAction({
        pendingAction,
        status: "failed",
        errorMessage: mailchimpResult.error || "Mailchimp tagging failed after updating order status.",
      });
      return `I updated the SOURCE order to paid in Supabase, but I could not add the Mailchimp post-purchase tag: ${mailchimpResult.error || "Unknown Mailchimp error"}`;
    }
  }
  await logAgentAction({ pendingAction, status: "completed", resultSummary: applyActionSummary(pendingAction.actionType, updates) });
  return callOpenAI(
    [
      { role: "system", content: `You are an internal operations assistant for Harvest Drone. Confirm that the action is done, mention the target and new value, and keep it short.` },
      { role: "user", content: `Action label: ${pendingAction.actionLabel}\nTarget: ${pendingAction.targetSummary}\nUpdate summary: ${pendingAction.updateSummary}\nUpdated record:\n${JSON.stringify(data, null, 2)}` },
    ],
    "gpt-4o-mini",
    250,
  );
}

async function handleGeneral(message: string) {
  return callOpenAI(
    [
      { role: "system", content: `You are an AI assistant for Harvest Drone. You can look up data, check email performance, prioritize follow-ups, and prepare a few safe internal actions that always require confirmation before writing. Keep responses short and collegial.` },
      { role: "user", content: message },
    ],
    "gpt-4o-mini",
    300,
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { message, history, confirmation, pendingAction } = await req.json();
    if (confirmation === "confirm" && pendingAction) {
      const response = await executeAction(pendingAction);
      return jsonResponse({ response, intent: "action_request" });
    }
    if (!message) return jsonResponse({ response: "What do you need?" });

    const intent = await classifyIntent(message);
    if (intent === "data_query") return jsonResponse({ response: await handleDataQuery(message, history || []), intent });
    if (intent === "email_stats") return jsonResponse({ response: await handleEmailStats(message), intent });
    if (intent === "lead_priority") return jsonResponse({ response: await handleLeadPriority(message), intent });
    if (intent === "action_request") return jsonResponse({ ...(await planAction(message, history || [])), intent });
    return jsonResponse({ response: await handleGeneral(message), intent });
  } catch (error) {
    return jsonResponse({ response: `Something went wrong: ${getErrorMessage(error)}`, error: true }, 500);
  }
});
