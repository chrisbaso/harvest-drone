export const INTEGRATION_PROVIDERS = [
  {
    provider: "google",
    label: "Google Workspace",
    description: "Read-only Gmail and Calendar signals for the Daily Ops Brief.",
    requiredEnvVars: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REDIRECT_URI", "GOOGLE_TOKEN_ENCRYPTION_KEY"],
    optionalEnvVars: ["DAILY_OPS_TIMEZONE"],
    connectedSignals: ["lastSyncTime"],
    testable: false,
  },
  {
    provider: "jobber",
    label: "Jobber",
    description: "Source of truth for clients, requests, quotes, jobs, schedules, and invoices.",
    requiredEnvVars: ["JOBBER_ACCESS_TOKEN", "JOBBER_CLIENT_SECRET"],
    optionalEnvVars: ["JOBBER_GRAPHQL_URL", "JOBBER_WEBHOOK_SECRET"],
    connectedSignals: ["lastWebhookReceived", "lastSyncTime"],
    testable: true,
  },
  {
    provider: "quickbooks",
    label: "QuickBooks",
    description: "Accounting and financial reporting through Jobber's QuickBooks Online sync.",
    requiredEnvVars: [],
    optionalEnvVars: ["QUICKBOOKS_REPORTING_ENABLED"],
    connectedSignals: [],
    testable: false,
    strategyOnly: true,
  },
  {
    provider: "twilio",
    label: "Twilio",
    description: "SMS autoresponders, job reminders, status callbacks, and customer replies.",
    requiredEnvVars: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_FROM_NUMBER"],
    optionalEnvVars: ["ENABLE_REAL_SMS", "TWILIO_ENABLE_REAL_SEND", "TWILIO_STATUS_CALLBACK_URL"],
    connectedSignals: ["lastWebhookReceived", "lastSyncTime"],
    testable: true,
  },
  {
    provider: "slack",
    label: "Slack",
    description: "Internal alerts for leads, Jobber events, SMS replies, and readiness blockers.",
    requiredEnvVars: ["SLACK_DAILY_OPS_WEBHOOK_URL"],
    optionalEnvVars: ["SLACK_WEBHOOK_URL", "SLACK_DEFAULT_CHANNEL", "DAILY_OPS_ENABLE_SLACK"],
    connectedSignals: ["lastSyncTime"],
    testable: true,
  },
  {
    provider: "internal",
    label: "Harvest OS modules",
    description: "Drone/ag intelligence layer for RDO readiness, fleet, training, records, and reporting.",
    requiredEnvVars: ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"],
    optionalEnvVars: ["APP_BASE_URL"],
    connectedSignals: ["lastSyncTime"],
    testable: false,
  },
];

const SECRET_NAME_PATTERN = /(secret|token|key|password|authorization|webhook_url|auth)/i;
const MAX_SUMMARY_DEPTH = 3;
const MAX_ARRAY_ITEMS = 8;
const MAX_OBJECT_KEYS = 24;

function hasEnv(env, key) {
  return Boolean(String(env?.[key] || "").trim());
}

function resolveStatus(definition, env, summary) {
  if (definition.strategyOnly) {
    return hasEnv(env, "QUICKBOOKS_REPORTING_ENABLED") ? "configured" : "not_configured";
  }

  const missingRequired = definition.requiredEnvVars.filter((key) => !hasEnv(env, key));
  const slackFallbackConfigured =
    definition.provider === "slack" && !hasEnv(env, "SLACK_DAILY_OPS_WEBHOOK_URL") && hasEnv(env, "SLACK_WEBHOOK_URL");

  if (summary?.recentErrors?.length) {
    return "error";
  }

  if (slackFallbackConfigured) {
    const hasConnectedSignal = definition.connectedSignals.some((key) => Boolean(summary?.[key]));
    return hasConnectedSignal ? "connected" : "configured";
  }

  if (missingRequired.length === definition.requiredEnvVars.length && missingRequired.length > 0) {
    return "not_configured";
  }

  if (missingRequired.length > 0) {
    return "error";
  }

  const hasConnectedSignal = definition.connectedSignals.some((key) => Boolean(summary?.[key]));
  return hasConnectedSignal ? "connected" : "configured";
}

function getNextSetupAction(definition, missingEnvVars, status) {
  if (status === "connected") {
    return "Monitor recent events and confirm the integration is creating the right Daily Ops or readiness signals.";
  }

  if (status === "error") {
    return "Review the recent error, verify credentials/webhook configuration, and rerun the safe test if available.";
  }

  if (definition.provider === "quickbooks") {
    return "Keep accounting in QuickBooks through Jobber sync; enable reporting only when leadership metrics need direct accounting context.";
  }

  if (missingEnvVars.length) {
    return `Set ${missingEnvVars.join(", ")} in the environment without exposing secret values.`;
  }

  const actions = {
    google: "Connect a Google Workspace account at /admin/integrations/google for read-only Gmail and Calendar signals.",
    jobber: "Configure Jobber webhooks and run a safe GraphQL health check from the admin dashboard.",
    twilio: "Point the Twilio inbound SMS webhook at /api/twilio/inbound-sms and keep real sending disabled until explicitly approved.",
    slack: "Set DAILY_OPS_ENABLE_SLACK=true only when dev-safe posting is approved; otherwise keep Slack in dry-run/skipped mode.",
    internal: "Apply the operating-layer migrations in an approved dev environment and keep Supabase service keys server-only.",
  };

  return actions[definition.provider] || "Confirm setup requirements and watch integration_events for the next signal.";
}

export function buildIntegrationStatusCards({
  env = {},
  eventSummary = {},
  now = new Date().toISOString(),
} = {}) {
  return INTEGRATION_PROVIDERS.map((definition) => {
    const summary = eventSummary[definition.provider] || {};
    const missingEnvVars = definition.requiredEnvVars.filter((key) => !hasEnv(env, key));

    return {
      provider: definition.provider,
      label: definition.label,
      description: definition.description,
      status: resolveStatus(definition, env, summary),
      requiredEnvVars: definition.requiredEnvVars.map((key) => ({
        key,
        configured: hasEnv(env, key),
      })),
      optionalEnvVars: definition.optionalEnvVars.map((key) => ({
        key,
        configured: hasEnv(env, key),
      })),
      missingEnvVars,
      lastSyncTime: summary.lastSyncTime || null,
      lastWebhookReceived: summary.lastWebhookReceived || null,
      lastEventReceived: summary.lastEventReceived || summary.lastWebhookReceived || summary.lastSyncTime || null,
      recentErrors: summary.recentErrors || [],
      testable: Boolean(definition.testable),
      checkedAt: now,
      nextSetupAction: getNextSetupAction(definition, missingEnvVars, resolveStatus(definition, env, summary)),
    };
  });
}

export function summarizePayload(payload, depth = 0) {
  if (payload === null || payload === undefined) {
    return payload;
  }

  if (typeof payload !== "object") {
    return payload;
  }

  if (depth >= MAX_SUMMARY_DEPTH) {
    return Array.isArray(payload) ? `[array:${payload.length}]` : "[object]";
  }

  if (Array.isArray(payload)) {
    return payload.slice(0, MAX_ARRAY_ITEMS).map((item) => summarizePayload(item, depth + 1));
  }

  return Object.fromEntries(
    Object.entries(payload)
      .slice(0, MAX_OBJECT_KEYS)
      .map(([key, value]) => [
        key,
        SECRET_NAME_PATTERN.test(key) ? "[redacted]" : summarizePayload(value, depth + 1),
      ]),
  );
}

export function normalizeStatusLabel(status) {
  return String(status || "not_configured").replaceAll("_", " ");
}
