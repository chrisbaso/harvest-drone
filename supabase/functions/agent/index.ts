import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const ALLOWED_TABLES: Record<string, string[]> = {
  grower_leads: ["id", "first_name", "email", "state", "acres", "crop_type", "status", "created_at"],
  operator_leads: ["id", "first_name", "email", "state", "company_name", "weekly_capacity", "status", "created_at"],
  source_orders: [
    "id",
    "first_name",
    "email",
    "state",
    "acres",
    "product",
    "estimated_total",
    "status",
    "created_at",
    "invoice_reminder_sent",
  ],
  crm_leads: ["id", "first_name", "email", "state", "lead_type", "acres", "stage", "source", "created_at"],
  jobs: ["id", "title", "state", "crop_type", "acres", "status", "assigned_operator_id", "created_at"],
  drip_enrollments: [
    "id",
    "lead_type",
    "email",
    "first_name",
    "current_step",
    "status",
    "enrolled_at",
    "last_sent_at",
    "next_send_at",
  ],
};

const ALLOWED_OPERATORS = new Set(["eq", "neq", "gt", "gte", "lt", "lte", "like", "ilike", "is"]);

type ChatMessage = {
  role: string;
  content: string;
};

type QueryPlan = {
  queries?: PlannedQuery[];
  description?: string;
};

type PlannedQuery = {
  table: string;
  select?: string;
  filters?: Array<{ column: string; operator: string; value: unknown }>;
  order?: { column: string; ascending?: boolean };
  limit?: number;
  count?: boolean;
  aggregate?: string | { type?: string; column?: string };
  aggregateColumn?: string;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

function cleanJsonResponse(value: string) {
  return value.replace(/```json?/g, "").replace(/```/g, "").trim();
}

function formatHistory(history: ChatMessage[] = []) {
  return history
    .slice(-10)
    .map((item) => `${item.role}: ${item.content}`)
    .join("\n");
}

function normalizeAggregate(query: PlannedQuery) {
  if (!query.aggregate) {
    return null;
  }

  if (typeof query.aggregate === "string") {
    return {
      type: query.aggregate,
      column: query.aggregateColumn || null,
    };
  }

  return {
    type: query.aggregate.type || null,
    column: query.aggregate.column || query.aggregateColumn || null,
  };
}

function isAllowedColumn(table: string, column?: string | null) {
  return Boolean(column && ALLOWED_TABLES[table]?.includes(column));
}

function sanitizeSelect(table: string, select = "*") {
  if (select === "*") {
    return "*";
  }

  const columns = select
    .split(",")
    .map((column) => column.trim())
    .filter((column) => isAllowedColumn(table, column));

  return columns.length > 0 ? columns.join(",") : "*";
}

async function callOpenAI(
  messages: ChatMessage[],
  model = "gpt-4o-mini",
  maxTokens = 1000,
) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature: 0.3,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "OpenAI API error");
  }

  return data.choices?.[0]?.message?.content?.trim() || "";
}

async function callMailchimp(endpoint: string) {
  if (!MAILCHIMP_API_KEY || !MAILCHIMP_SERVER) {
    throw new Error("Mailchimp is not configured for the agent.");
  }

  const response = await fetch(`https://${MAILCHIMP_SERVER}.api.mailchimp.com/3.0${endpoint}`, {
    headers: {
      Authorization: "Basic " + btoa(`anystring:${MAILCHIMP_API_KEY}`),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Mailchimp API error");
  }

  return data;
}

async function classifyIntent(message: string) {
  const result = await callOpenAI(
    [
      {
        role: "system",
        content: `Classify this user message into exactly one category. Respond with ONLY the category name, nothing else.

Categories:
- data_query - asking about leads, orders, pipeline, revenue, acres, states, counts, or any business data
- email_stats - asking about email campaigns, open rates, click rates, bounces, unsubscribes, Mailchimp performance
- lead_priority - asking who to call, hot leads, follow-up priorities, engagement levels, lead scoring
- general - greetings, general questions, anything that doesn't fit the above categories`,
      },
      { role: "user", content: message },
    ],
    "gpt-4o-mini",
    20,
  );

  return result.toLowerCase().replace(/[^a-z_]/g, "");
}

async function handleDataQuery(message: string, history: ChatMessage[] = []) {
  const queryPlanText = await callOpenAI(
    [
      {
        role: "system",
        content: `You are a data assistant for Harvest Drone, a precision agriculture company.

You have access to these read-only Supabase tables:
- grower_leads (id, first_name, email, state, acres, crop_type, status, created_at)
- operator_leads (id, first_name, email, state, company_name, weekly_capacity, status, created_at)
- source_orders (id, first_name, email, state, acres, product, estimated_total, status, created_at, invoice_reminder_sent)
- crm_leads (id, first_name, email, state, lead_type, acres, stage, source, created_at)
- jobs (id, title, state, crop_type, acres, status, assigned_operator_id, created_at)
- drip_enrollments (id, lead_type, email, first_name, current_step, status, enrolled_at, last_sent_at, next_send_at)

Given the user's question, respond with a JSON object describing what queries to run. Format:
{
  "queries": [
    {
      "table": "grower_leads",
      "select": "*",
      "filters": [
        { "column": "created_at", "operator": "gte", "value": "2026-04-01" }
      ],
      "order": { "column": "created_at", "ascending": false },
      "limit": 20,
      "count": false,
      "aggregate": null,
      "aggregateColumn": null
    }
  ],
  "description": "What I'm looking up and why"
}

Available filter operators: eq, neq, gt, gte, lt, lte, like, ilike, is
Set "count" to true if the user just wants a count.
Set "aggregate" to "sum" and include "aggregateColumn" if they want a total such as acres or revenue.
Keep the plan read-only. Respond with ONLY valid JSON.`,
      },
      {
        role: "user",
        content: `Conversation context:\n${formatHistory(history)}\n\nUser question:\n${message}`,
      },
    ],
    "gpt-4o-mini",
    600,
  );

  let plan: QueryPlan;

  try {
    plan = JSON.parse(cleanJsonResponse(queryPlanText));
  } catch {
    return "I couldn't map that request to a clean data lookup. Try something tighter like **How many grower leads this week?**, **Show me unpaid SOURCE orders**, or **Total acres across all CRM leads**.";
  }

  const results: unknown[] = [];

  for (const plannedQuery of plan.queries || []) {
    if (!ALLOWED_TABLES[plannedQuery.table]) {
      results.push({ table: plannedQuery.table, error: "Table not allowed." });
      continue;
    }

    const select = sanitizeSelect(plannedQuery.table, plannedQuery.select);
    const aggregate = normalizeAggregate(plannedQuery);
    const shouldCount = Boolean(plannedQuery.count);
    const limit = Math.min(Math.max(plannedQuery.limit || 20, 1), 100);
    const countOptions = shouldCount ? { count: "exact" as const, head: true } : undefined;

    let query = supabase.from(plannedQuery.table).select(
      shouldCount
        ? "id"
        : aggregate?.type === "sum" && isAllowedColumn(plannedQuery.table, aggregate.column)
          ? aggregate.column!
          : select,
      countOptions,
    );

    for (const filter of plannedQuery.filters || []) {
      if (!isAllowedColumn(plannedQuery.table, filter.column) || !ALLOWED_OPERATORS.has(filter.operator)) {
        continue;
      }

      switch (filter.operator) {
        case "eq":
          query = query.eq(filter.column, filter.value);
          break;
        case "neq":
          query = query.neq(filter.column, filter.value);
          break;
        case "gt":
          query = query.gt(filter.column, filter.value);
          break;
        case "gte":
          query = query.gte(filter.column, filter.value);
          break;
        case "lt":
          query = query.lt(filter.column, filter.value);
          break;
        case "lte":
          query = query.lte(filter.column, filter.value);
          break;
        case "like":
          query = query.like(filter.column, String(filter.value));
          break;
        case "ilike":
          query = query.ilike(filter.column, String(filter.value));
          break;
        case "is":
          query = query.is(filter.column, filter.value);
          break;
      }
    }

    if (plannedQuery.order && isAllowedColumn(plannedQuery.table, plannedQuery.order.column)) {
      query = query.order(plannedQuery.order.column, { ascending: plannedQuery.order.ascending ?? false });
    }

    if (!shouldCount) {
      query = query.limit(limit);
    }

    const { data, error, count } = await query;

    if (error) {
      results.push({ table: plannedQuery.table, error: error.message });
      continue;
    }

    if (aggregate?.type === "sum" && aggregate.column && data) {
      const value = data.reduce((sum: number, row: Record<string, unknown>) => {
        return sum + Number(row[aggregate.column as string] || 0);
      }, 0);

      results.push({
        table: plannedQuery.table,
        aggregate: "sum",
        column: aggregate.column,
        value,
        rowCount: data.length,
      });
      continue;
    }

    if (shouldCount) {
      results.push({ table: plannedQuery.table, count: count || 0 });
      continue;
    }

    results.push({
      table: plannedQuery.table,
      data: data || [],
      rowCount: data?.length || 0,
    });
  }

  return callOpenAI(
    [
      {
        role: "system",
        content: `You are a friendly data assistant for Harvest Drone. Format query results into a clear, concise response for Jake.

Rules:
- Lead with the key number or finding
- Use plain language, not technical jargon
- If showing a list of leads, include name, state, acres, and status
- Format numbers with commas
- Format currency with $ and commas
- Keep it brief, under 200 words unless a list is necessary
- If there are no results, say so plainly
- Do not mention SQL, Supabase, or table names
- If useful, you may use simple markdown-style tables
- If a few key metrics stand out, format them as:
Metric: Value
Another Metric: Value`,
      },
      {
        role: "user",
        content: `Conversation context:\n${formatHistory(history)}\n\nUser asked: "${message}"\n\nPlanned lookup: ${plan.description || "No description"}\n\nQuery results:\n${JSON.stringify(results, null, 2)}`,
      },
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
      audience: {
        total_subscribers: audience.stats?.member_count,
        unsubscribes: audience.stats?.unsubscribe_count,
        cleaned: audience.stats?.cleaned_count,
        open_rate: audience.stats?.open_rate,
        click_rate: audience.stats?.click_rate,
      },
      automations: automations.automations?.map((automation: Record<string, unknown>) => ({
        name: (automation.settings as Record<string, unknown> | undefined)?.title,
        status: automation.status,
        emails_sent: automation.emails_sent,
        started: automation.started_at,
      })) || [],
      recent_campaigns: campaigns.campaigns?.map((campaign: Record<string, unknown>) => {
        const settings = (campaign.settings as Record<string, unknown>) || {};
        const reportSummary = (campaign.report_summary as Record<string, unknown>) || {};

        return {
          name: settings.title || settings.subject_line,
          subject: settings.subject_line,
          status: campaign.status,
          sent: campaign.emails_sent,
          opens: reportSummary.opens,
          unique_opens: reportSummary.unique_opens,
          open_rate: reportSummary.open_rate,
          clicks: reportSummary.subscriber_clicks,
          click_rate: reportSummary.click_rate,
          unsubscribes: reportSummary.unsubscribes || 0,
          bounces: reportSummary.bounces || 0,
          send_time: campaign.send_time,
        };
      }) || [],
    };

    return await callOpenAI(
      [
        {
          role: "system",
          content: `You are an email marketing assistant for Harvest Drone. Analyze the Mailchimp data and answer Jake's question.

Rules:
- Express open rates and click rates as percentages
- Compare against benchmarks: 20%+ open rate is good for ag, 2%+ click rate is good
- Flag issues such as high bounces, low opens, or rising unsubscribes
- Keep it actionable and concise
- Focus on the named campaign if Jake asks for one
- Use simple markdown tables if comparing campaigns

Harvest Drone's active campaigns:
- Farm Day list - 6-email reactivation to 789 farm contacts
- Grower welcome - 7-email sequence for new grower funnel leads
- Operator welcome - 5-email sequence for operator leads
- SOURCE order - 2-email confirmation for SOURCE buyers
- Post-purchase - 4-email sequence after payment`,
        },
        {
          role: "user",
          content: `Jake asked: "${message}"\n\nMailchimp data:\n${JSON.stringify(mailchimpData, null, 2)}`,
        },
      ],
      "gpt-4o-mini",
      900,
    );
  } catch (error) {
    return `I couldn't pull Mailchimp stats right now. ${getErrorMessage(error)}`;
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
    grower_leads: growerLeads?.map((lead: Record<string, unknown>) => ({
      name: lead.first_name,
      email: lead.email,
      state: lead.state,
      acres: lead.acres,
      crop: lead.crop_type,
      status: lead.status,
      created: lead.created_at,
    })) || [],
    source_orders: sourceOrders?.map((order: Record<string, unknown>) => ({
      name: order.first_name,
      email: order.email,
      state: order.state,
      acres: order.acres,
      product: order.product,
      total: order.estimated_total,
      status: order.status,
      created: order.created_at,
    })) || [],
    active_enrollments: enrollments?.length || 0,
    mailchimp_engagement: mailchimpMembers.slice(0, 20).map((member) => ({
      email: member.email_address,
      name: (member.merge_fields as Record<string, unknown> | undefined)?.FNAME,
      open_rate: (member.stats as Record<string, unknown> | undefined)?.avg_open_rate,
      click_rate: (member.stats as Record<string, unknown> | undefined)?.avg_click_rate,
      last_activity: member.last_changed,
    })),
  };

  return callOpenAI(
    [
      {
        role: "system",
        content: `You are a sales assistant for Harvest Drone. Help Jake prioritize follow-ups.

Scoring rules:
- Placed a SOURCE order but unpaid = highest priority
- High email engagement (open rate above 40%, any clicks) plus large acreage = high priority
- Recent grower lead from the last 7 days with 500+ acres = medium priority
- Active in an email sequence but no form submission = nurture, not a call yet

Format your response as a prioritized list:
1. Name - state - acres - why they matter - suggested action

Include phone numbers if they exist in the provided data. Keep it actionable. Max 10 leads.`,
      },
      {
        role: "user",
        content: `Jake asked: "${message}"\n\nLead data:\n${JSON.stringify(leadData, null, 2)}`,
      },
    ],
    "gpt-4o-mini",
    1100,
  );
}

async function handleGeneral(message: string) {
  return callOpenAI(
    [
      {
        role: "system",
        content: `You are an AI assistant for Harvest Drone, a precision agriculture company.

You can help with:
- Looking up lead and order data
- Checking email campaign performance
- Prioritizing follow-ups

If Jake asks about something you cannot do yet, tell him that capability is coming in a future update.

Keep responses short, direct, and collegial.`,
      },
      { role: "user", content: message },
    ],
    "gpt-4o-mini",
    300,
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, history } = await req.json();

    if (!message) {
      return jsonResponse({ response: "What do you need?" });
    }

    const intent = await classifyIntent(message);
    let response = "";

    switch (intent) {
      case "data_query":
        response = await handleDataQuery(message, history || []);
        break;
      case "email_stats":
        response = await handleEmailStats(message);
        break;
      case "lead_priority":
        response = await handleLeadPriority(message);
        break;
      default:
        response = await handleGeneral(message);
    }

    return jsonResponse({ response, intent });
  } catch (error) {
    return jsonResponse(
      {
        response: `Something went wrong: ${getErrorMessage(error)}`,
        error: true,
      },
      500,
    );
  }
});
