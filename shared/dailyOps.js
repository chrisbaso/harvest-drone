export const OPS_SOURCES = ["gmail", "calendar", "jobber", "twilio", "slack", "internal"];
export const OPS_PRIORITIES = ["low", "normal", "high", "urgent"];
export const OPS_STATUSES = ["open", "assigned", "resolved", "ignored"];

export const OPS_LOOP_TYPES = [
  "customer_reply_needed",
  "quote_needed",
  "job_scheduling_needed",
  "invoice_followup",
  "calendar_followup",
  "rdo_followup",
  "maintenance_issue",
  "support_issue",
  "internal_admin_task",
  "unknown_review_needed",
];

const CLASSIFICATION_RULES = [
  {
    type: "maintenance_issue",
    priority: "urgent",
    patterns: [/\bmaintenance\b/i, /\brepair\b/i, /\bbroken\b/i, /\bdown\b/i, /\bpump\b/i, /\bbattery\b/i],
    action: "Confirm aircraft or support impact, then route the issue to the operations owner.",
  },
  {
    type: "support_issue",
    priority: "high",
    patterns: [/\bsupport\b/i, /\bhelp desk\b/i, /\bissue\b/i, /\bnot working\b/i, /\bblocked\b/i],
    action: "Open or update the support ticket and assign the next owner before the blocker ages.",
  },
  {
    type: "invoice_followup",
    priority: "high",
    patterns: [/\binvoice\b/i, /\bpayment\b/i, /\bquickbooks\b/i, /\bbilling\b/i, /\bpaid\b/i],
    action: "Check Jobber and accounting status before drafting the invoice follow-up.",
  },
  {
    type: "quote_needed",
    priority: "high",
    patterns: [/\bquote\b/i, /\bestimate\b/i, /\bproposal\b/i, /\bprice\b/i, /\bpricing\b/i],
    action: "Prepare a quote or confirm what details are still needed before quoting.",
  },
  {
    type: "rdo_followup",
    priority: "high",
    patterns: [/\brdo\b/i, /\bhylio\b/i, /\bsource\b/i, /\benterprise\b/i],
    action: "Review the enterprise context and prepare a concise follow-up for the owner.",
  },
  {
    type: "job_scheduling_needed",
    priority: "high",
    patterns: [/\bschedule\b/i, /\breschedule\b/i, /\bbook\b/i, /\bavailability\b/i, /\bcalendar\b/i],
    action: "Check availability, weather/application constraints, and Jobber schedule before replying.",
  },
  {
    type: "calendar_followup",
    priority: "normal",
    patterns: [/\bmeeting\b/i, /\bcall\b/i, /\bappointment\b/i, /\btomorrow\b/i, /\btoday\b/i],
    action: "Confirm the calendar item and prepare any agenda or customer follow-up needed.",
  },
  {
    type: "customer_reply_needed",
    priority: "normal",
    patterns: [/\bcan you\b/i, /\bplease\b/i, /\bfollowing up\b/i, /\bcall me\b/i, /\binterested\b/i],
    action: "Draft a helpful response and assign the follow-up to an admin before anything is sent.",
  },
  {
    type: "internal_admin_task",
    priority: "normal",
    patterns: [/\badmin\b/i, /\bpaperwork\b/i, /\bpermit\b/i, /\blicense\b/i, /\binsurance\b/i],
    action: "Assign the internal task and add a due date if the request has timing pressure.",
  },
];

function normalizeText(...parts) {
  return parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

function normalizeSource(source) {
  return OPS_SOURCES.includes(source) ? source : "internal";
}

function normalizePriority(priority) {
  return OPS_PRIORITIES.includes(priority) ? priority : "normal";
}

function inferTitle({ subject, body, fallback = "Review needed" } = {}) {
  const title = String(subject || "").trim() || String(body || "").trim().split(/[.!?\n]/)[0] || fallback;
  return title.slice(0, 120);
}

function inferContactName({ fromName, relatedContactName, contactName, fromEmail } = {}) {
  return String(fromName || relatedContactName || contactName || fromEmail || "there").trim();
}

export function classifyOpsText(text = "") {
  const value = String(text || "");
  const matchedRule = CLASSIFICATION_RULES.find((rule) =>
    rule.patterns.some((pattern) => pattern.test(value)),
  );

  return matchedRule?.type || "unknown_review_needed";
}

export function getOpsClassificationDetails(loopType) {
  return (
    CLASSIFICATION_RULES.find((rule) => rule.type === loopType) || {
      type: "unknown_review_needed",
      priority: "normal",
      action: "Review the item and decide whether it should become an assigned operations loop.",
    }
  );
}

export function buildDraftRecommendation({ loopType, contactName, summary } = {}) {
  const greetingName = String(contactName || "").trim() || "there";
  const detail = String(summary || "Thanks for reaching out. I am checking the details and will follow up shortly.").trim();

  const bodyByType = {
    customer_reply_needed: `Hi ${greetingName}, thanks for reaching out. I am checking on this now and will get back to you with the next step shortly.`,
    quote_needed: `Hi ${greetingName}, thanks for the details. I am reviewing the acres, timing, and application needs so we can prepare the right quote.`,
    job_scheduling_needed: `Hi ${greetingName}, thanks for the scheduling note. I am checking availability and field conditions before confirming the best window.`,
    invoice_followup: `Hi ${greetingName}, thanks for checking in. I am reviewing the job and invoice status now and will follow up with the correct details.`,
    calendar_followup: `Hi ${greetingName}, thanks. I am confirming the calendar details and will make sure the right next step is covered.`,
    rdo_followup: `Hi ${greetingName}, thanks for the update. I am reviewing the enterprise readiness details and will follow up with a concise status note.`,
    maintenance_issue: `Hi ${greetingName}, thanks for flagging this. I am checking the maintenance impact and will route it to the right operations owner.`,
    support_issue: `Hi ${greetingName}, thanks for flagging this. I am opening a support review and will confirm the next owner shortly.`,
    internal_admin_task: `Hi ${greetingName}, thanks. I am reviewing the admin item and will confirm the next owner and timing.`,
    unknown_review_needed: `Hi ${greetingName}, thanks for the note. I am reviewing the context and will follow up with the next step.`,
  };

  return `Draft only - human approval required before sending:\n\n${bodyByType[loopType] || bodyByType.unknown_review_needed}\n\nContext to verify: ${detail}`;
}

export function createOpsLoopCandidate({
  source = "internal",
  sourceExternalId = null,
  relatedContactName = null,
  relatedContactEmail = null,
  relatedContactPhone = null,
  relatedJobberId = null,
  relatedCustomerId = null,
  fromName = null,
  fromEmail = null,
  fromPhone = null,
  subject = "",
  body = "",
  summary = "",
  receivedAt = null,
  dueAt = null,
  priority = null,
  loopType = null,
  ownerUserId = null,
} = {}) {
  const text = normalizeText(subject, body, summary);
  const inferredType = loopType || classifyOpsText(text);
  const details = getOpsClassificationDetails(inferredType);
  const contactName = inferContactName({
    fromName,
    relatedContactName,
    contactName: relatedContactName,
    fromEmail,
  });
  const normalizedSummary = summary || body || subject || "Review this operations item.";

  return {
    source: normalizeSource(source),
    source_external_id: sourceExternalId || null,
    related_contact_name: contactName === "there" ? null : contactName,
    related_contact_email: relatedContactEmail || fromEmail || null,
    related_contact_phone: relatedContactPhone || fromPhone || null,
    related_jobber_id: relatedJobberId || null,
    related_customer_id: relatedCustomerId || null,
    loop_type: inferredType,
    priority: normalizePriority(priority || details.priority),
    title: inferTitle({ subject, body }),
    summary: String(normalizedSummary).slice(0, 2000),
    suggested_next_action: details.action,
    draft_response: buildDraftRecommendation({
      loopType: inferredType,
      contactName,
      summary: normalizedSummary,
    }),
    owner_user_id: ownerUserId || null,
    status: "open",
    due_at: dueAt || receivedAt || null,
  };
}

export function summarizeDailyOpsBrief({
  date,
  todayEvents = [],
  tomorrowEvents = [],
  loops = [],
  generatedAt = new Date().toISOString(),
} = {}) {
  const openLoops = loops.filter((loop) => !["resolved", "ignored"].includes(loop.status));
  const priorityItems = openLoops.filter((loop) => ["urgent", "high"].includes(loop.priority));

  return {
    date,
    generatedAt,
    todayEvents,
    tomorrowEvents,
    loops: openLoops,
    priorityItems,
    counts: {
      todayEvents: todayEvents.length,
      tomorrowEvents: tomorrowEvents.length,
      openLoops: openLoops.length,
      priorityItems: priorityItems.length,
      emailFollowUps: openLoops.filter((loop) => loop.source === "gmail").length,
      smsReplies: openLoops.filter((loop) => loop.source === "twilio").length,
      jobberFollowUps: openLoops.filter((loop) => loop.source === "jobber").length,
      calendarFollowUps: openLoops.filter((loop) => loop.source === "calendar").length,
      rdoEnterpriseItems: openLoops.filter((loop) => loop.loop_type === "rdo_followup").length,
    },
    recommendedNextActions: priorityItems.slice(0, 8).map((loop) => ({
      id: loop.id || loop.source_external_id || loop.title,
      title: loop.title,
      priority: loop.priority,
      source: loop.source,
      action: loop.suggested_next_action,
    })),
  };
}
