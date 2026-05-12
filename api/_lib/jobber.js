import crypto from "node:crypto";
import {
  logIntegrationEvent,
  markIntegrationEventProcessed,
} from "./integrationEvents.js";
import { sendSlackAlert } from "./slack.js";

export const JOBBER_GRAPHQL_URL = "https://api.getjobber.com/api/graphql";

const TOPIC_EVENT_TYPES = {
  CLIENT_CREATE: "client_created",
  CLIENT_UPDATE: "client_updated",
  REQUEST_CREATE: "request_created",
  QUOTE_CREATE: "quote_created",
  QUOTE_UPDATE: "quote_updated",
  JOB_CREATE: "job_created",
  JOB_UPDATE: "job_updated",
  INVOICE_CREATE: "invoice_created",
  INVOICE_UPDATE: "invoice_updated",
};

function getJobberConfig(env = process.env) {
  return {
    accessToken: String(env.JOBBER_ACCESS_TOKEN || "").trim(),
    clientSecret: String(env.JOBBER_CLIENT_SECRET || env.JOBBER_WEBHOOK_SECRET || "").trim(),
    graphqlUrl: String(env.JOBBER_GRAPHQL_URL || JOBBER_GRAPHQL_URL).trim(),
  };
}

export function normalizeJobberWebhookTopic(topic) {
  return TOPIC_EVENT_TYPES[String(topic || "").trim().toUpperCase()] || "jobber_webhook_received";
}

export function getJobberExternalId(payload = {}) {
  return (
    payload?.itemId ||
    payload?.id ||
    payload?.webHookEvent?.itemId ||
    payload?.webHookEvent?.id ||
    payload?.data?.id ||
    payload?.data?.node?.id ||
    null
  );
}

export function verifyJobberWebhookSignature({
  rawBody,
  signature,
  secret = getJobberConfig().clientSecret,
}) {
  if (!secret || !signature || !rawBody) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("base64");

  if (Buffer.byteLength(expected) !== Buffer.byteLength(signature)) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export async function jobberGraphqlRequest({
  query,
  variables = {},
  env = process.env,
  fetchImpl = fetch,
} = {}) {
  const config = getJobberConfig(env);

  if (!query) {
    throw new Error("Jobber GraphQL query is required.");
  }

  if (!config.accessToken) {
    throw new Error("JOBBER_ACCESS_TOKEN is not configured.");
  }

  const response = await fetchImpl(config.graphqlUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || result?.errors?.length) {
    throw new Error(result?.errors?.[0]?.message || `Jobber GraphQL failed with ${response.status}.`);
  }

  return result.data;
}

export async function upsertIntegrationExternalLink({
  provider = "jobber",
  externalResourceType,
  externalId,
  localTable = null,
  localId = null,
  metadata = {},
  supabase,
}) {
  if (!supabase || !externalResourceType || !externalId) {
    return null;
  }

  const { data, error } = await supabase
    .from("integration_external_links")
    .upsert(
      {
        provider,
        external_resource_type: externalResourceType,
        external_id: externalId,
        local_table: localTable,
        local_id: localId,
        metadata,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "provider,external_resource_type,external_id" },
    )
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function syncJobberClients({ first = 25, env = process.env, fetchImpl = fetch, supabase }) {
  const data = await jobberGraphqlRequest({
    env,
    fetchImpl,
    query: `
      query HarvestDroneJobberClients($first: Int!) {
        clients(first: $first) {
          nodes {
            id
            name
            emails { address }
            phones { number }
          }
        }
      }
    `,
    variables: { first },
  });

  const clients = data?.clients?.nodes || [];

  await Promise.all(
    clients.map((client) =>
      upsertIntegrationExternalLink({
        provider: "jobber",
        externalResourceType: "client",
        externalId: client.id,
        metadata: {
          name: client.name,
          email: client.emails?.[0]?.address || null,
          phone: client.phones?.[0]?.number || null,
        },
        supabase,
      }),
    ),
  );

  await logIntegrationEvent({
    provider: "jobber",
    eventType: "client_sync",
    status: "processed",
    payload: { count: clients.length },
    processedAt: new Date().toISOString(),
  }, { supabase });

  return clients;
}

export async function syncJobberJobs({ first = 25, env = process.env, fetchImpl = fetch, supabase }) {
  const data = await jobberGraphqlRequest({
    env,
    fetchImpl,
    query: `
      query HarvestDroneJobberJobs($first: Int!) {
        jobs(first: $first) {
          nodes {
            id
            title
            jobNumber
            status
            client { id name }
          }
        }
      }
    `,
    variables: { first },
  });

  const jobs = data?.jobs?.nodes || [];

  await Promise.all(
    jobs.map((job) =>
      upsertIntegrationExternalLink({
        provider: "jobber",
        externalResourceType: "job",
        externalId: job.id,
        metadata: {
          title: job.title,
          jobNumber: job.jobNumber,
          status: job.status,
          clientId: job.client?.id || null,
          clientName: job.client?.name || null,
        },
        supabase,
      }),
    ),
  );

  await logIntegrationEvent({
    provider: "jobber",
    eventType: "job_sync",
    status: "processed",
    payload: { count: jobs.length },
    processedAt: new Date().toISOString(),
  }, { supabase });

  return jobs;
}

export async function handleJobberWebhook({ payload, rawBody = "", signature = "", env = process.env, supabase }) {
  const config = getJobberConfig(env);

  if (config.clientSecret && signature && rawBody) {
    const isValid = verifyJobberWebhookSignature({
      rawBody,
      signature,
      secret: config.clientSecret,
    });

    if (!isValid) {
      throw new Error("Invalid Jobber webhook signature.");
    }
  }

  const topic = payload?.topic || payload?.webHookEvent?.topic || payload?.event || "unknown";
  const eventType = normalizeJobberWebhookTopic(topic);
  const externalId = getJobberExternalId(payload);
  const event = await logIntegrationEvent({
    provider: "jobber",
    eventType: `jobber_${eventType}_webhook`,
    externalId,
    status: "received",
    payload,
  }, { supabase });

  try {
    if (externalId) {
      const resourceType = eventType.split("_")[0] || "record";
      await upsertIntegrationExternalLink({
        provider: "jobber",
        externalResourceType: resourceType,
        externalId,
        metadata: {
          topic,
          eventType,
          receivedAt: new Date().toISOString(),
        },
        supabase,
      });
    }

    if (["job_created", "job_updated"].includes(eventType)) {
      await sendSlackAlert({
        type: "new_jobber_job",
        message: "Jobber job event received. Review drone readiness and scheduling fit in Harvest OS.",
        context: {
          topic,
          jobberId: externalId,
        },
        supabase,
      });
    }

    if (eventType === "invoice_created") {
      await sendSlackAlert({
        type: "job_completed_not_invoiced",
        message: "Jobber invoice event received. Keep accounting in QuickBooks through Jobber sync.",
        context: {
          topic,
          jobberId: externalId,
        },
        supabase,
      });
    }

    await markIntegrationEventProcessed(event.id, { status: "processed", supabase });
  } catch (error) {
    await markIntegrationEventProcessed(event.id, {
      status: "error",
      errorMessage: error.message || "Jobber webhook processing failed.",
      supabase,
    }).catch(() => null);
    throw error;
  }

  return {
    eventType,
    externalId,
  };
}
