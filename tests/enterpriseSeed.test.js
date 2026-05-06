import assert from "node:assert/strict";
import {
  buildRdoEnterpriseSeed,
  validateEnterpriseSeed,
} from "../shared/enterpriseSeed.js";

function run(name, callback) {
  try {
    callback();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

run("builds a deterministic RDO enterprise seed package", () => {
  const first = buildRdoEnterpriseSeed();
  const second = buildRdoEnterpriseSeed();

  assert.equal(first.metadata.seedMode, "repeatable_demo_seed");
  assert.equal(first.organizations[0].name, "R.D. Offutt Farms");
  assert.match(first.organizations[0].id, uuidPattern);
  assert.deepEqual(first, second);
});

run("exports linked rows for the enterprise pilot workflow", () => {
  const seed = buildRdoEnterpriseSeed();

  assert.equal(seed.enterpriseDivisions.length, 1);
  assert.ok(seed.farmLocations.length >= 2);
  assert.ok(seed.fields.length >= 3);
  assert.ok(seed.enterpriseOperators.length >= 3);
  assert.ok(seed.aircraft.length >= 3);
  assert.ok(seed.applicationJobs.length >= 3);
  assert.ok(seed.applicationRecords.length >= 2);
  assert.ok(seed.maintenanceRecords.length >= 3);
  assert.ok(seed.supportTickets.length >= 3);
  assert.ok(seed.performanceMetrics.length >= 4);
});

run("includes persisted readiness snapshots for the blocked rescue pass", () => {
  const seed = buildRdoEnterpriseSeed({ now: new Date("2026-05-05") });
  const blockedJob = seed.applicationJobs.find((job) => job.source_slug === "rdo-job-002");

  assert.equal(blockedJob.readiness_snapshot.ready, false);
  assert.ok(blockedJob.readiness_snapshot.blockers.some((blocker) => blocker.includes("Hylio practical")));
  assert.ok(blockedJob.readiness_snapshot.blockers.some((blocker) => blocker.includes("Aircraft calibration is overdue")));
});

run("validates relational integrity before a fixture is loaded", () => {
  const seed = buildRdoEnterpriseSeed();
  const validation = validateEnterpriseSeed(seed);

  assert.equal(validation.valid, true);
  assert.deepEqual(validation.errors, []);
});
