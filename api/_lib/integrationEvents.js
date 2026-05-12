import { buildIntegrationStatusCards, summarizePayload } from "../../shared/integrationStack.js";
import { getSupabaseServerClient } from "./serverSupabase.js";

export const INTEGRATION_EVENT_PROVIDERS = ["gmail", "calendar", "google", "jobber", "quickbooks", "twilio", "slack", "internal"];

function getClient(client) {
  return client || getSupabaseServerClient();
}

function normalizeProvider(provider) {
  return INTEGRATION_EVENT_PROVIDERS.includes(provider) ? provider : "internal";
}

function asIso(value) {
  return value ? new Date(value).toISOString() : null;
}

export function createIntegrationEventRow({
  provider,
  eventType,
  externalId = null,
  status = "received",
  payload = {},
  payloadSummary = null,
  errorMessage = null,
  processedAt = null,
}) {
  return {
    provider: normalizeProvider(provider),
    event_type: eventType || "unknown",
    external_id: externalId || null,
    status,
    payload_summary: payloadSummary || summarizePayload(payload),
    error_message: errorMessage || null,
    processed_at: processedAt || null,
  };
}

export async function logIntegrationEvent(event, { supabase } = {}) {
  const client = getClient(supabase);
  const { data, error } = await client
    .from("integration_events")
    .insert(createIntegrationEventRow(event))
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function markIntegrationEventProcessed(eventId, { status = "processed", errorMessage = null, supabase } = {}) {
  const client = getClient(supabase);
  const { data, error } = await client
    .from("integration_events")
    .update({
      status,
      error_message: errorMessage,
      processed_at: new Date().toISOString(),
    })
    .eq("id", eventId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function listIntegrationEvents({ limit = 30, supabase } = {}) {
  const client = getClient(supabase);
  const { data, error } = await client
    .from("integration_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function getIntegrationEventSummary({ supabase } = {}) {
  const events = await listIntegrationEvents({ limit: 200, supabase });
  const summary = {};

  for (const event of events) {
    const provider = normalizeProvider(event.provider);

    if (!summary[provider]) {
      summary[provider] = {
        lastSyncTime: null,
        lastWebhookReceived: null,
        recentErrors: [],
      };
    }

    if (event.event_type?.includes("webhook") && !summary[provider].lastWebhookReceived) {
      summary[provider].lastWebhookReceived = asIso(event.created_at);
    }

    if (!summary[provider].lastSyncTime && ["processed", "sent", "dry_run", "ok"].includes(event.status)) {
      summary[provider].lastSyncTime = asIso(event.processed_at || event.created_at);
    }

    if (event.status === "error" || event.error_message) {
      summary[provider].recentErrors.push({
        eventType: event.event_type,
        message: event.error_message || "Integration event failed.",
        createdAt: asIso(event.created_at),
      });
    }
  }

  return summary;
}

export async function getIntegrationAdminSnapshot({ env = process.env, supabase } = {}) {
  const eventSummary = await getIntegrationEventSummary({ supabase });
  const recentEvents = await listIntegrationEvents({ limit: 20, supabase });

  return {
    integrations: buildIntegrationStatusCards({ env, eventSummary }),
    recentEvents,
  };
}
