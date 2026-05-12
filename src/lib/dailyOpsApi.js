async function parseJsonSafely(response) {
  const contentType = response.headers?.get?.("content-type") || "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return await response.json();
  } catch (_error) {
    return null;
  }
}

const LOCAL_LOOPS = [
  {
    id: "local-email-quote",
    source: "gmail",
    source_external_id: "local-email-quote",
    related_contact_name: "Prairie Farms",
    related_contact_email: "ops@prairie.example",
    loop_type: "quote_needed",
    priority: "high",
    title: "Quote request for soybean acres",
    summary: "Customer asked for a SOURCE quote and timing details.",
    suggested_next_action: "Prepare a quote draft and confirm acreage, crop, and target application window.",
    draft_response:
      "Draft only - human approval required before sending:\n\nHi Prairie Farms, thanks for the details. I am reviewing the acres, timing, and application needs so we can prepare the right quote.",
    status: "open",
    due_at: new Date().toISOString(),
  },
  {
    id: "local-sms-reply",
    source: "twilio",
    source_external_id: "local-sms-reply",
    related_contact_phone: "+15555550123",
    loop_type: "customer_reply_needed",
    priority: "urgent",
    title: "Customer SMS reply needs response",
    summary: "Customer asked whether Harvest can call today to reschedule an application.",
    suggested_next_action: "Call or draft a reply after checking the schedule and weather window.",
    draft_response:
      "Draft only - human approval required before sending:\n\nHi, thanks for the scheduling note. I am checking availability and field conditions before confirming the best window.",
    status: "open",
    due_at: new Date().toISOString(),
  },
  {
    id: "local-rdo-followup",
    source: "internal",
    source_external_id: "local-rdo-followup",
    related_contact_name: "RDO Enterprise Team",
    loop_type: "rdo_followup",
    priority: "high",
    title: "RDO readiness follow-up",
    summary: "Enterprise demo follow-up needs a concise Hylio readiness status.",
    suggested_next_action: "Review the RDO demo workspace and prepare an internal status note.",
    status: "assigned",
    due_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
];

function buildLocalSummary() {
  const today = new Date();
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const todayEvents = [
    {
      id: "local-calendar-today",
      summary: "Morning operations review",
      start: today.toISOString(),
      location: "Harvest OS",
    },
  ];
  const tomorrowEvents = [
    {
      id: "local-calendar-tomorrow",
      summary: "RDO enterprise follow-up",
      start: tomorrow.toISOString(),
      location: "Remote",
    },
  ];
  const priorityItems = LOCAL_LOOPS.filter((loop) => ["urgent", "high"].includes(loop.priority));

  return {
    date: today.toISOString().slice(0, 10),
    generatedAt: today.toISOString(),
    todayEvents,
    tomorrowEvents,
    loops: LOCAL_LOOPS,
    priorityItems,
    counts: {
      todayEvents: todayEvents.length,
      tomorrowEvents: tomorrowEvents.length,
      openLoops: LOCAL_LOOPS.length,
      priorityItems: priorityItems.length,
      emailFollowUps: LOCAL_LOOPS.filter((loop) => loop.source === "gmail").length,
      smsReplies: LOCAL_LOOPS.filter((loop) => loop.source === "twilio").length,
      jobberFollowUps: LOCAL_LOOPS.filter((loop) => loop.source === "jobber").length,
      calendarFollowUps: 0,
      rdoEnterpriseItems: LOCAL_LOOPS.filter((loop) => loop.loop_type === "rdo_followup").length,
    },
    recommendedNextActions: priorityItems.map((loop) => ({
      id: loop.id,
      title: loop.title,
      priority: loop.priority,
      source: loop.source,
      action: loop.suggested_next_action,
    })),
    warnings: [
      "Local demo mode: Vite is serving the frontend without Vercel API routes. Run Vercel dev or deploy to use live Supabase integrations.",
    ],
  };
}

export function createLocalDailyOpsSnapshot() {
  const summary = buildLocalSummary();

  return {
    brief: {
      id: "local-daily-ops-brief",
      brief_date: summary.date,
      timezone: "America/Chicago",
      summary,
      slack_status: "not_sent",
      generated_at: summary.generatedAt,
    },
    loops: LOCAL_LOOPS,
    calendarItems: [],
    slackResult: null,
    mode: "local_demo",
  };
}

function createLocalGoogleStatus() {
  return {
    account: null,
    requiredScopes: [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/calendar.readonly",
    ],
    mode: "local_demo",
  };
}

function isViteApiFallback(result, response) {
  if (result) {
    return false;
  }

  const contentType = response.headers?.get?.("content-type") || "";
  return response.ok && !contentType.includes("application/json");
}

export async function getDailyOpsBrief({ date, mode } = {}) {
  const params = new URLSearchParams();

  if (date) params.set("date", date);
  if (mode) params.set("mode", mode);

  const response = await fetch(`/api/admin/daily-ops${params.toString() ? `?${params}` : ""}`);
  const result = await parseJsonSafely(response);

  if (isViteApiFallback(result, response)) {
    return createLocalDailyOpsSnapshot();
  }

  if (!response.ok) {
    throw new Error(result?.error || "Unable to load Daily Ops Brief.");
  }

  return result;
}

export async function sendDailyOpsBriefToSlack({ date } = {}) {
  const response = await fetch("/api/admin/daily-ops", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action: "send_slack", date }),
  });
  const result = await parseJsonSafely(response);

  if (isViteApiFallback(result, response)) {
    return {
      ...createLocalDailyOpsSnapshot(),
      slackResult: {
        sent: false,
        status: "skipped",
        reason: "Local demo mode cannot post Slack briefs from the Vite-only dev server.",
      },
    };
  }

  if (!response.ok) {
    throw new Error(result?.error || "Unable to send Daily Ops Brief to Slack.");
  }

  return result;
}

export async function getOpenLoops({ status = "open,assigned" } = {}) {
  const response = await fetch(`/api/admin/open-loops?status=${encodeURIComponent(status)}`);
  const result = await parseJsonSafely(response);

  if (isViteApiFallback(result, response)) {
    return {
      loops: LOCAL_LOOPS,
      mode: "local_demo",
    };
  }

  if (!response.ok) {
    throw new Error(result?.error || "Unable to load open loops.");
  }

  return result;
}

export async function updateOpenLoop({ id, status, ownerUserId, dueAt }) {
  const response = await fetch("/api/admin/open-loops", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, status, ownerUserId, dueAt }),
  });
  const result = await parseJsonSafely(response);

  if (isViteApiFallback(result, response)) {
    return {
      loop: null,
      loops: LOCAL_LOOPS,
      mode: "local_demo",
    };
  }

  if (!response.ok) {
    throw new Error(result?.error || "Unable to update open loop.");
  }

  return result;
}

export async function getGoogleIntegrationStatus() {
  const response = await fetch("/api/admin/google-oauth");
  const result = await parseJsonSafely(response);

  if (isViteApiFallback(result, response)) {
    return createLocalGoogleStatus();
  }

  if (!response.ok) {
    throw new Error(result?.error || "Unable to load Google Workspace status.");
  }

  return result;
}
