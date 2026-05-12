import assert from "node:assert/strict";
import {
  DEFAULT_CHECKLIST_TEMPLATES,
  FIELD_OPS_FLEET_STATUSES,
  FIELD_OPS_JOB_STATUSES,
  buildLeadOpsConversion,
  createDemoFieldOpsState,
  filterOpsJobs,
  getDailyOpsCommandCenter,
  getFieldOpsRole,
  getFleetTrackingSummary,
  getJobDispatchPacket,
  getJobReadiness,
  getOpsDashboardSummary,
  getVisibleJobsForProfile,
  toggleChecklistItem,
} from "../shared/fieldOps.js";

function run(name, callback) {
  try {
    callback();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

const now = new Date("2026-05-08T12:00:00.000Z");

run("field ops exposes the Harvest Drone job status pipeline", () => {
  assert.deepEqual(
    FIELD_OPS_JOB_STATUSES.map((status) => status.id),
    [
      "new_request",
      "qualified",
      "quoted",
      "scheduled",
      "operator_assigned",
      "pre_flight",
      "in_progress",
      "completed",
      "needs_review",
      "invoice_needed",
      "closed",
      "cancelled",
    ],
  );
});

run("field ops exposes drone fleet tracking statuses", () => {
  assert.deepEqual(
    FIELD_OPS_FLEET_STATUSES.map((status) => status.id),
    ["at_yard", "in_transit", "on_site", "flying", "complete", "offline"],
  );
});

run("dashboard summary counts assignments, invoices, dates, and acres", () => {
  const state = createDemoFieldOpsState({ now });
  const summary = getOpsDashboardSummary(state, { now });

  assert.equal(summary.newRequests, 1);
  assert.equal(summary.needsOperatorAssignment, 2);
  assert.equal(summary.jobsScheduledToday, 2);
  assert.equal(summary.jobsScheduledThisWeek, 5);
  assert.equal(summary.invoiceNeededJobs, 1);
  assert.equal(summary.inProgressJobs, 1);
  assert.equal(summary.completedJobs, 2);
  assert.equal(summary.totalScheduledAcres, 690);
  assert.equal(summary.openAcres, 930);
  assert.equal(summary.completedAcres, 520);
  assert.ok(summary.aiSummary.some((line) => line.includes("2 jobs need operator assignment")));
});

run("job readiness surfaces dispatch blockers and the next best action", () => {
  const state = createDemoFieldOpsState({ now });
  const scheduledJob = state.jobs.find((job) => job.id === "ops-job-003");
  const readiness = getJobReadiness(scheduledJob, state, { now });

  assert.equal(readiness.status, "blocked");
  assert.equal(readiness.nextAction.action, "assign_operator");
  assert.ok(readiness.blockers.some((item) => item.label.includes("operator")));
  assert.ok(readiness.score < 80);
});

run("dispatch packets include the field data operators need before leaving the yard", () => {
  const state = createDemoFieldOpsState({ now });
  const job = state.jobs.find((item) => item.id === "ops-job-002");
  const packet = getJobDispatchPacket(job, state);

  assert.equal(packet.client.name, "Miller Family Farms");
  assert.equal(packet.field.name, "North 220");
  assert.equal(packet.operation.product, "Fungicide - Chlorothalonil");
  assert.equal(packet.flightPlan.windLimitMph, 10);
  assert.ok(packet.loadout.some((item) => item.includes("Charged batteries")));
  assert.ok(packet.sops.some((sop) => sop.label.includes("Chemical")));
});

run("daily command center ranks next actions, workload, loadout, and billing handoff", () => {
  const state = createDemoFieldOpsState({ now });
  const commandCenter = getDailyOpsCommandCenter(state, { now });

  assert.equal(commandCenter.todayJobs.length, 2);
  assert.equal(commandCenter.blockedJobs.length, 2);
  assert.ok(commandCenter.nextActions[0].label.includes("Assign"));
  assert.ok(commandCenter.operatorWorkload.some((operator) => operator.operatorName === "Ada Miller" && operator.acres >= 220));
  assert.ok(commandCenter.loadoutItems.some((item) => item.includes("Chlorothalonil")));
  assert.ok(commandCenter.billingQueue.some((job) => job.id === "ops-job-006"));
});

run("fleet tracking summarizes drone locations, jobs, and stale check-ins", () => {
  const state = createDemoFieldOpsState({ now });
  const fleet = getFleetTrackingSummary(state, { now: new Date("2026-05-09T12:00:00.000Z"), staleMinutes: 30 });

  assert.equal(fleet.trackedAssets.length, 3);
  assert.ok(fleet.flyingAssets.some((asset) => asset.id === "ops-drone-ares-01"));
  assert.ok(fleet.onSiteAssets.some((asset) => asset.id === "ops-drone-ares-02"));
  assert.equal(fleet.trackedAssets.find((asset) => asset.id === "ops-drone-ares-01").currentJob.id, "ops-job-002");
  assert.ok(fleet.trackedAssets.every((asset) => asset.statusLabel));
  assert.ok(fleet.staleAssets.some((asset) => asset.id === "ops-drone-scout-01"));
});

run("job filtering supports status, operator, invoice, client, source interest, and search", () => {
  const state = createDemoFieldOpsState({ now });
  const filtered = filterOpsJobs(state.jobs, {
    status: "invoice_needed",
    invoiceNeeded: "yes",
    sourceInterest: "all",
    search: "miller",
  });

  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].client_id, "ops-client-miller");
});

run("operator profiles only see their assigned jobs", () => {
  const state = createDemoFieldOpsState({ now });
  const operatorProfile = {
    role: "operator",
    id: "user-ada",
    email: "ada@harvestdrone.local",
  };
  const visibleJobs = getVisibleJobsForProfile(state, operatorProfile);

  assert.deepEqual(
    visibleJobs.map((job) => job.id).sort(),
    ["ops-job-002", "ops-job-006"],
  );
});

run("checklist item toggling preserves JSON checklist shape and completion state", () => {
  const checklist = {
    checklist_type: "pre_flight",
    items_json: DEFAULT_CHECKLIST_TEMPLATES.pre_flight,
    completed_at: null,
  };
  const updated = toggleChecklistItem(checklist, "weather_checked", true, {
    userId: "user-ada",
    now,
  });

  assert.equal(updated.items_json.find((item) => item.id === "weather_checked").completed, true);
  assert.equal(updated.completed_at, null);

  const completed = updated.items_json.reduce(
    (current, item) => toggleChecklistItem(current, item.id, true, { userId: "user-ada", now }),
    updated,
  );

  assert.equal(completed.completed_by, "user-ada");
  assert.equal(completed.completed_at, now.toISOString());
});

run("lead conversion builds client, farm, field, job, and note payloads", () => {
  const lead = {
    id: "lead-123",
    first_name: "Riley",
    last_name: "Nelson",
    email: "riley@example.com",
    phone: "555-0100",
    farm_name: "Nelson Family Farms",
    state: "MN",
    county: "Lyon",
    zip: "56258",
    estimated_acres: 240,
    acreage_range: "200-500",
    crops: ["Corn", "Soybeans"],
    primary_goal: "Faster fungicide timing",
    decision_timing: "This month",
    notes: "Interested in SOURCE and drone application.",
    source: "Harvest Drone Funnel",
  };

  const conversion = buildLeadOpsConversion(lead, {
    organizationId: "11111111-1111-4111-8111-111111111111",
    userId: "user-admin",
    now,
  });

  assert.equal(conversion.client.email, "riley@example.com");
  assert.equal(conversion.farm.name, "Nelson Family Farms");
  assert.equal(conversion.field.acres, 240);
  assert.equal(conversion.job.created_from_lead_id, "lead-123");
  assert.equal(conversion.job.source_interest, true);
  assert.equal(conversion.job.status, "qualified");
  assert.match(conversion.note.note, /Faster fungicide timing/);
});

run("field ops role helper maps current app roles and optional ops_role", () => {
  assert.equal(getFieldOpsRole({ role: "admin" }), "admin");
  assert.equal(getFieldOpsRole({ role: "network_manager" }), "dispatcher");
  assert.equal(getFieldOpsRole({ role: "dealer" }), "sales");
  assert.equal(getFieldOpsRole({ role: "operator" }), "operator");
  assert.equal(getFieldOpsRole({ role: "dealer", ops_role: "dispatcher" }), "dispatcher");
});
