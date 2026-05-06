import { buildIntegrationStatusCards } from "../../shared/integrationStack.js";
import { getSupabaseServerClient } from "../_lib/serverSupabase.js";
import {
  getIntegrationAdminSnapshot,
  logIntegrationEvent,
} from "../_lib/integrationEvents.js";
import { jobberGraphqlRequest } from "../_lib/jobber.js";
import { sendSlackAlert } from "../_lib/slack.js";
import { sendSmsMessage } from "../_lib/twilio.js";

function isDevelopmentEnvironment() {
  return process.env.NODE_ENV !== "production" && process.env.VERCEL_ENV !== "production";
}

async function getSnapshot() {
  try {
    const supabase = getSupabaseServerClient();
    return {
      ...(await getIntegrationAdminSnapshot({ supabase })),
      mode: "supabase",
    };
  } catch (error) {
    return {
      integrations: buildIntegrationStatusCards({ env: process.env }),
      recentEvents: [],
      mode: "configuration_only",
      warning:
        error.message ||
        "Supabase is not configured, so only environment configuration status is available.",
    };
  }
}

async function handleTestAction(provider) {
  const supabase = (() => {
    try {
      return getSupabaseServerClient();
    } catch (_error) {
      return null;
    }
  })();

  if (provider === "slack") {
    if (!isDevelopmentEnvironment()) {
      return {
        status: "blocked",
        message: "Slack test alerts are only enabled outside production.",
      };
    }

    return sendSlackAlert({
      type: "integration_test",
      message: "Harvest Drone integration test from the admin dashboard.",
      context: {
        source: "/admin/integrations",
        environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "local",
      },
      supabase,
    });
  }

  if (provider === "twilio") {
    const result = await sendSmsMessage({
      to: process.env.TWILIO_TEST_TO_NUMBER || process.env.TWILIO_FROM_NUMBER || "+15555550123",
      body: "Harvest Drone integration dry-run test.",
      supabase,
    });

    await logIntegrationEvent({
      provider: "twilio",
      eventType: "sms_admin_test",
      status: result.status,
      payload: {
        sent: result.sent,
        status: result.status,
        reason: result.reason,
      },
      processedAt: new Date().toISOString(),
    }, { supabase }).catch(() => null);

    return result;
  }

  if (provider === "jobber") {
    const result = await jobberGraphqlRequest({
      query: "query HarvestDroneJobberHealth { __typename }",
    });

    await logIntegrationEvent({
      provider: "jobber",
      eventType: "jobber_admin_test",
      status: "processed",
      payload: result,
      processedAt: new Date().toISOString(),
    }, { supabase }).catch(() => null);

    return {
      status: "ok",
      responseType: result?.__typename || null,
    };
  }

  return {
    status: "skipped",
    message: "No safe admin test is available for this integration.",
  };
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const snapshot = await getSnapshot();
    return res.status(200).json(snapshot);
  }

  if (req.method === "POST") {
    const provider = req.body?.provider;

    if (!provider) {
      return res.status(400).json({ error: "Missing integration provider." });
    }

    try {
      const result = await handleTestAction(provider);
      const snapshot = await getSnapshot();

      return res.status(200).json({
        result,
        ...snapshot,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message || "Integration test failed." });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed." });
}
