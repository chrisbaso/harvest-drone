import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  buildIntegrationStatusCards,
  summarizePayload,
} from "../shared/integrationStack.js";
import {
  buildSlackAlertPayload,
} from "../api/_lib/slack.js";
import {
  getSmsOptOutAction,
  sendSmsMessage,
} from "../api/_lib/twilio.js";

function run(name, callback) {
  try {
    callback();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

run("integration status cards never expose configured secret values", () => {
  const cards = buildIntegrationStatusCards({
    env: {
      JOBBER_ACCESS_TOKEN: "jobber-secret",
      JOBBER_CLIENT_SECRET: "jobber-client-secret",
      TWILIO_ACCOUNT_SID: "AC123",
      TWILIO_AUTH_TOKEN: "twilio-secret",
      TWILIO_FROM_NUMBER: "+15555550123",
      SLACK_WEBHOOK_URL: "https://hooks.slack.com/services/secret",
    },
    eventSummary: {
      jobber: {
        lastSyncTime: "2026-05-06T12:00:00.000Z",
        lastWebhookReceived: "2026-05-06T12:30:00.000Z",
        recentErrors: [],
      },
    },
  });

  const serialized = JSON.stringify(cards);

  assert.equal(serialized.includes("jobber-secret"), false);
  assert.equal(serialized.includes("twilio-secret"), false);
  assert.equal(serialized.includes("hooks.slack.com/services/secret"), false);
  assert.equal(cards.find((card) => card.provider === "jobber").status, "connected");
  assert.equal(cards.find((card) => card.provider === "twilio").status, "configured");
  assert.equal(cards.find((card) => card.provider === "quickbooks").status, "not_configured");
});

run("payload summaries redact secrets and keep useful identifiers", () => {
  const summary = summarizePayload({
    id: "evt_123",
    topic: "CLIENT_CREATE",
    token: "secret-token",
    nested: {
      phone: "+15555550123",
      authorization: "Bearer secret",
    },
  });

  assert.equal(summary.id, "evt_123");
  assert.equal(summary.topic, "CLIENT_CREATE");
  assert.equal(summary.token, "[redacted]");
  assert.equal(summary.nested.authorization, "[redacted]");
  assert.equal(summary.nested.phone, "+15555550123");
});

run("Twilio opt-out parser recognizes STOP-style messages", () => {
  assert.equal(getSmsOptOutAction("STOP"), "opt_out");
  assert.equal(getSmsOptOutAction("unsubscribe me please"), "opt_out");
  assert.equal(getSmsOptOutAction("START"), "opt_in");
  assert.equal(getSmsOptOutAction("Can you call me?"), null);
});

run("Twilio send stays in dry-run mode unless explicitly enabled", async () => {
  const result = await sendSmsMessage({
    to: "+15555550123",
    body: "Harvest Drone dry-run check",
    env: {
      TWILIO_ACCOUNT_SID: "AC123",
      TWILIO_AUTH_TOKEN: "token",
      TWILIO_FROM_NUMBER: "+15555550000",
      TWILIO_ENABLE_REAL_SEND: "false",
    },
    fetchImpl: async () => {
      throw new Error("fetch should not be called in dry-run mode");
    },
  });

  assert.equal(result.status, "dry_run");
  assert.equal(result.sent, false);
  assert.equal(result.to, "+15555550123");
});

run("Slack alert payloads are structured by alert type", () => {
  const payload = buildSlackAlertPayload({
    type: "new_jobber_job",
    message: "New application job is ready for readiness review.",
    context: {
      jobberId: "job_123",
      customerName: "Prairie Farms",
    },
  });

  assert.equal(payload.text.includes("New Jobber job"), true);
  assert.equal(payload.blocks.some((block) => JSON.stringify(block).includes("Prairie Farms")), true);
  assert.equal(payload.blocks.some((block) => JSON.stringify(block).includes("job_123")), true);
});

run("integration migration creates event, external link, and SMS log tables", () => {
  const sql = readFileSync("supabase/migrations/20260506090000_operating_stack_integrations.sql", "utf8");

  [
    "integration_events",
    "integration_external_links",
    "sms_message_logs",
    "sms_opt_outs",
  ].forEach((tableName) => {
    assert.match(sql, new RegExp(`create table if not exists public\\.${tableName}`, "i"));
  });

  assert.match(sql, /provider text not null check \(provider in \('gmail', 'calendar', 'google', 'jobber', 'quickbooks', 'twilio', 'slack', 'internal'\)\)/i);
  assert.match(sql, /status text not null default 'received'/i);
  assert.match(sql, /jobber_external_id text/i);
});
