import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  buildDraftRecommendation,
  classifyOpsText,
  createOpsLoopCandidate,
  summarizeDailyOpsBrief,
} from "../shared/dailyOps.js";
import {
  createLocalDailyOpsSnapshot,
  getDailyOpsBrief,
} from "../src/lib/dailyOpsApi.js";

async function run(name, callback) {
  try {
    await callback();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

await run("classification detects customer reply, scheduling, invoice, and RDO follow-up signals", () => {
  assert.equal(
    classifyOpsText("Can you please send the quote for SOURCE acres this week?"),
    "quote_needed",
  );
  assert.equal(classifyOpsText("We need to reschedule tomorrow's spray job."), "job_scheduling_needed");
  assert.equal(classifyOpsText("Following up on the invoice from last application."), "invoice_followup");
  assert.equal(classifyOpsText("RDO wants an update on Hylio enterprise readiness."), "rdo_followup");
  assert.equal(classifyOpsText("The pump has a maintenance issue after yesterday."), "maintenance_issue");
});

await run("open-loop candidates normalize priority, source, title, and draft recommendation", () => {
  const loop = createOpsLoopCandidate({
    source: "gmail",
    sourceExternalId: "msg_123",
    fromName: "Prairie Farms",
    fromEmail: "ops@prairie.example",
    subject: "Can you send the quote?",
    body: "Can you send the quote for the soybean acres?",
    receivedAt: "2026-05-06T12:00:00.000Z",
  });

  assert.equal(loop.source, "gmail");
  assert.equal(loop.source_external_id, "msg_123");
  assert.equal(loop.related_contact_name, "Prairie Farms");
  assert.equal(loop.related_contact_email, "ops@prairie.example");
  assert.equal(loop.loop_type, "quote_needed");
  assert.equal(loop.priority, "high");
  assert.equal(loop.status, "open");
  assert.equal(loop.title, "Can you send the quote?");
  assert.match(loop.suggested_next_action, /Prepare a quote/i);
  assert.match(loop.draft_response, /Hi Prairie Farms/i);
});

await run("daily brief summary groups items by operational category", () => {
  const brief = summarizeDailyOpsBrief({
    date: "2026-05-06",
    todayEvents: [{ id: "event_1" }],
    tomorrowEvents: [{ id: "event_2" }, { id: "event_3" }],
    loops: [
      { id: "loop_1", source: "gmail", loop_type: "customer_reply_needed", priority: "normal" },
      { id: "loop_2", source: "twilio", loop_type: "customer_reply_needed", priority: "urgent" },
      { id: "loop_3", source: "jobber", loop_type: "quote_needed", priority: "high" },
      { id: "loop_4", source: "internal", loop_type: "rdo_followup", priority: "high" },
    ],
  });

  assert.equal(brief.counts.todayEvents, 1);
  assert.equal(brief.counts.tomorrowEvents, 2);
  assert.equal(brief.counts.emailFollowUps, 1);
  assert.equal(brief.counts.smsReplies, 1);
  assert.equal(brief.counts.jobberFollowUps, 1);
  assert.equal(brief.counts.rdoEnterpriseItems, 1);
  assert.equal(brief.priorityItems.length, 3);
});

await run("draft recommendations are explicit drafts and never auto-send instructions", () => {
  const draft = buildDraftRecommendation({
    loopType: "customer_reply_needed",
    contactName: "Taylor",
    summary: "Customer asked for a call today.",
  });

  assert.match(draft, /^Draft only/i);
  assert.equal(/send automatically|auto-send/i.test(draft), false);
});

await run("daily ops migration creates the open-loop and brief tables", () => {
  const sql = readFileSync("supabase/migrations/20260506100000_daily_ops_agent.sql", "utf8");

  [
    "ops_loops",
    "ops_daily_brief",
    "ops_brief_item",
    "integration_account",
  ].forEach((tableName) => {
    assert.match(sql, new RegExp(`create table if not exists public\\.${tableName}`, "i"));
  });

  assert.match(sql, /source text not null check \(source in \('gmail', 'calendar', 'jobber', 'twilio', 'slack', 'internal'\)\)/i);
  assert.match(sql, /priority text not null default 'normal'/i);
  assert.match(sql, /status text not null default 'open'/i);
  assert.match(sql, /'support_issue'/i);
  assert.match(sql, /token_ciphertext text/i);
});

await run("Daily Ops API client falls back to local demo data when Vite serves API source", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response("import { generateDailyOpsBrief } from '../_lib/dailyOpsAgent.js';", {
      status: 200,
      headers: { "Content-Type": "application/javascript" },
    });

  try {
    const snapshot = await getDailyOpsBrief();
    const localSnapshot = createLocalDailyOpsSnapshot();

    assert.equal(snapshot.mode, "local_demo");
    assert.equal(snapshot.brief.summary.counts.openLoops, localSnapshot.brief.summary.counts.openLoops);
    assert.equal(Array.isArray(snapshot.loops), true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
