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

const LOCAL_INTEGRATION_EVENTS = [
  {
    id: "local-jobber-webhook",
    provider: "jobber",
    event_type: "jobber_job_created_webhook",
    external_id: "jobber-demo-job-001",
    status: "received",
    payload_summary: {
      topic: "JOB_CREATE",
      note: "Local demo event. Run Vercel dev or deploy to use Supabase-backed events.",
    },
    error_message: null,
    created_at: new Date().toISOString(),
    processed_at: null,
  },
  {
    id: "local-twilio-reply",
    provider: "twilio",
    event_type: "sms_inbound_webhook",
    external_id: "SM_DEMO",
    status: "processed",
    payload_summary: {
      from: "+15555550123",
      bodyPreview: "Can you call me today?",
    },
    error_message: null,
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    processed_at: new Date(Date.now() - 44 * 60 * 1000).toISOString(),
  },
  {
    id: "local-slack-skipped",
    provider: "slack",
    event_type: "daily_ops_brief_slack_skipped",
    external_id: null,
    status: "skipped",
    payload_summary: {
      reason: "DAILY_OPS_ENABLE_SLACK is not true",
    },
    error_message: null,
    created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    processed_at: null,
  },
];

function isViteApiFallback(result, response) {
  if (result) {
    return false;
  }

  const contentType = response.headers?.get?.("content-type") || "";
  return response.ok && !contentType.includes("application/json");
}

export async function getIntegrationAdminData() {
  const response = await fetch("/api/admin/integrations");
  const result = await parseJsonSafely(response);

  if (isViteApiFallback(result, response)) {
    return {
      integrations: [],
      recentEvents: LOCAL_INTEGRATION_EVENTS,
      mode: "local_demo",
      warning: "Local demo mode: run Vercel dev or deploy to use server integration status.",
    };
  }

  if (!response.ok) {
    throw new Error(result?.error || "Unable to load integration status.");
  }

  return {
    integrations: result?.integrations || [],
    recentEvents: result?.recentEvents || [],
    mode: result?.mode || "unknown",
    warning: result?.warning || "",
  };
}

export async function runIntegrationTest(provider) {
  const response = await fetch("/api/admin/integrations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ provider }),
  });
  const result = await parseJsonSafely(response);

  if (isViteApiFallback(result, response)) {
    return {
      integrations: [],
      recentEvents: LOCAL_INTEGRATION_EVENTS,
      result: {
        status: "skipped",
        reason: "Local demo mode cannot run server-side integration tests from the Vite-only dev server.",
      },
      mode: "local_demo",
      warning: "Run Vercel dev or deploy to use safe integration tests.",
    };
  }

  if (!response.ok) {
    throw new Error(result?.error || "Unable to run integration test.");
  }

  return {
    integrations: result?.integrations || [],
    recentEvents: result?.recentEvents || [],
    result: result?.result || null,
    mode: result?.mode || "unknown",
    warning: result?.warning || "",
  };
}

export async function getIntegrationEvents({ limit = 100 } = {}) {
  const response = await fetch(`/api/admin/integration-events?limit=${encodeURIComponent(limit)}`);
  const result = await parseJsonSafely(response);

  if (isViteApiFallback(result, response)) {
    return {
      events: LOCAL_INTEGRATION_EVENTS,
      mode: "local_demo",
      warning: "Local demo mode: run Vercel dev or deploy to use Supabase-backed integration events.",
    };
  }

  if (!response.ok) {
    throw new Error(result?.error || "Unable to load integration events.");
  }

  return {
    events: result?.events || [],
    mode: result?.mode || "unknown",
    warning: result?.warning || "",
  };
}
