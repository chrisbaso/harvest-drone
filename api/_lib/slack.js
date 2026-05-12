import { logIntegrationEvent } from "./integrationEvents.js";

const ALERT_LABELS = {
  new_lead: "New lead",
  customer_sms_reply: "Customer SMS reply",
  new_jobber_job: "New Jobber job",
  quote_followup_due: "Quote follow-up due",
  job_completed_not_invoiced: "Job completed not invoiced",
  maintenance_issue: "Maintenance issue",
  rdo_followup: "RDO follow-up",
  readiness_blocker: "Readiness blocker",
  integration_error: "Integration error",
  integration_test: "Integration test",
  daily_ops_brief: "Harvest Daily Ops Brief",
};

function fieldBlockValue(value) {
  return String(value ?? "-").slice(0, 1800);
}

export function buildSlackAlertPayload({ type, message, context = {}, channel = null }) {
  const label = ALERT_LABELS[type] || ALERT_LABELS.integration_test;
  const fields = Object.entries(context)
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .slice(0, 8)
    .map(([key, value]) => ({
      type: "mrkdwn",
      text: `*${key.replaceAll("_", " ")}*\n${fieldBlockValue(value)}`,
    }));

  return {
    ...(channel ? { channel } : {}),
    text: `${label}: ${message}`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: label,
          emoji: false,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: fieldBlockValue(message),
        },
      },
      ...(fields.length
        ? [
            {
              type: "section",
              fields,
            },
          ]
        : []),
    ],
  };
}

export async function sendSlackAlert({
  type = "integration_test",
  message,
  context = {},
  channel = process.env.SLACK_DEFAULT_CHANNEL || null,
  env = process.env,
  fetchImpl = fetch,
  supabase = null,
} = {}) {
  if (!message) {
    throw new Error("Slack alert message is required.");
  }

  const webhookUrl = String(env.SLACK_WEBHOOK_URL || "").trim();
  const payload = buildSlackAlertPayload({ type, message, context, channel });

  if (!webhookUrl) {
    await logIntegrationEvent(
      {
        provider: "slack",
        eventType: "slack_alert_skipped",
        status: "skipped",
        payload: { type, message, context },
        errorMessage: "SLACK_WEBHOOK_URL is not configured.",
      },
      { supabase },
    ).catch(() => null);

    return {
      sent: false,
      status: "skipped",
      reason: "SLACK_WEBHOOK_URL is not configured.",
      payload,
    };
  }

  const response = await fetchImpl(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    await logIntegrationEvent(
      {
        provider: "slack",
        eventType: "slack_alert_failed",
        status: "error",
        payload: { type, message, context },
        errorMessage: text || `Slack webhook failed with ${response.status}.`,
      },
      { supabase },
    ).catch(() => null);

    throw new Error(text || "Slack webhook failed.");
  }

  await logIntegrationEvent(
    {
      provider: "slack",
      eventType: "slack_alert_sent",
      status: "sent",
      payload: { type, message, context },
      processedAt: new Date().toISOString(),
    },
    { supabase },
  ).catch(() => null);

  return {
    sent: true,
    status: "sent",
    payload,
  };
}

export function buildSlackDailyOpsBriefPayload({ brief, channel = null }) {
  const counts = brief?.summary?.counts || brief?.counts || {};
  const priorityItems = brief?.summary?.priorityItems || brief?.priorityItems || [];
  const date = brief?.brief_date || brief?.date || new Date().toISOString().slice(0, 10);
  const nextActions = brief?.summary?.recommendedNextActions || brief?.recommendedNextActions || [];
  const lines = [
    `*Date:* ${date}`,
    `*Calendar:* ${counts.todayEvents || 0} today, ${counts.tomorrowEvents || 0} tomorrow`,
    `*Open loops:* ${counts.openLoops || 0} total, ${counts.priorityItems || 0} high priority`,
    `*Follow-ups:* ${counts.emailFollowUps || 0} email, ${counts.smsReplies || 0} SMS, ${counts.jobberFollowUps || 0} Jobber`,
  ];

  const priorityText = priorityItems.length
    ? priorityItems
        .slice(0, 8)
        .map((item) => `*${item.priority || "normal"}* - ${item.title || "Review item"} (${item.source || "internal"})`)
        .join("\n")
    : "No urgent or high-priority loops in the current brief.";

  const actionText = nextActions.length
    ? nextActions
        .slice(0, 8)
        .map((item) => `- ${item.action || item.title || "Review item"}`)
        .join("\n")
    : "Review the admin dashboard for lower-priority loops.";

  return {
    ...(channel ? { channel } : {}),
    text: `Harvest Daily Ops Brief: ${date}`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "Harvest Daily Ops Brief",
          emoji: false,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: lines.join("\n"),
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Priority items*\n${fieldBlockValue(priorityText)}`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Recommended next actions*\n${fieldBlockValue(actionText)}`,
        },
      },
    ],
  };
}

export async function sendSlackDailyOpsBrief({
  brief,
  channel = process.env.SLACK_DAILY_OPS_CHANNEL || process.env.SLACK_DEFAULT_CHANNEL || null,
  env = process.env,
  fetchImpl = fetch,
  supabase = null,
} = {}) {
  const enabled = String(env.DAILY_OPS_ENABLE_SLACK || "").toLowerCase() === "true";
  const webhookUrl = String(env.SLACK_DAILY_OPS_WEBHOOK_URL || env.SLACK_WEBHOOK_URL || "").trim();
  const payload = buildSlackDailyOpsBriefPayload({ brief, channel });

  if (!enabled) {
    await logIntegrationEvent(
      {
        provider: "slack",
        eventType: "daily_ops_brief_slack_skipped",
        status: "skipped",
        payload: { reason: "DAILY_OPS_ENABLE_SLACK is not true", date: brief?.brief_date || brief?.date },
      },
      { supabase },
    ).catch(() => null);

    return {
      sent: false,
      status: "skipped",
      reason: "Set DAILY_OPS_ENABLE_SLACK=true to post daily ops briefs.",
      payload,
    };
  }

  if (!webhookUrl) {
    await logIntegrationEvent(
      {
        provider: "slack",
        eventType: "daily_ops_brief_slack_skipped",
        status: "skipped",
        payload: { date: brief?.brief_date || brief?.date },
        errorMessage: "SLACK_DAILY_OPS_WEBHOOK_URL or SLACK_WEBHOOK_URL is not configured.",
      },
      { supabase },
    ).catch(() => null);

    return {
      sent: false,
      status: "skipped",
      reason: "Slack daily ops webhook is not configured.",
      payload,
    };
  }

  const response = await fetchImpl(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    await logIntegrationEvent(
      {
        provider: "slack",
        eventType: "daily_ops_brief_slack_failed",
        status: "error",
        payload: { date: brief?.brief_date || brief?.date },
        errorMessage: text || `Slack webhook failed with ${response.status}.`,
      },
      { supabase },
    ).catch(() => null);

    throw new Error(text || "Slack daily ops webhook failed.");
  }

  await logIntegrationEvent(
    {
      provider: "slack",
      eventType: "daily_ops_brief_slack_sent",
      status: "sent",
      payload: { date: brief?.brief_date || brief?.date },
      processedAt: new Date().toISOString(),
    },
    { supabase },
  ).catch(() => null);

  return {
    sent: true,
    status: "sent",
    payload,
  };
}
