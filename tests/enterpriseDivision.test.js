import assert from "node:assert/strict";
import {
  getApplicationJobReadiness,
  getDivisionSummary,
  getEnterpriseOrganization,
  getSprayWindowReadiness,
  rdoEnterpriseDemo,
} from "../shared/enterpriseDivision.js";

function run(name, callback) {
  try {
    callback();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

run("loads RDO enterprise demo organization", () => {
  const organization = getEnterpriseOrganization("rdo");

  assert.equal(organization.name, "R.D. Offutt Farms");
  assert.equal(organization.division.cropFocus, "Potatoes");
  assert.ok(rdoEnterpriseDemo.sprayWindows.length >= 3);
});

run("summarizes enterprise drone division readiness", () => {
  const summary = getDivisionSummary("rdo", new Date("2026-05-05"));

  assert.equal(summary.organizationName, "R.D. Offutt Farms");
  assert.ok(summary.operatorReadyCount > 0);
  assert.ok(summary.aircraftReadyCount > 0);
  assert.ok(summary.openSupportTickets > 0);
});

run("blocks unsafe RDO job assignment with clear reasons", () => {
  const readiness = getApplicationJobReadiness({
    orgId: "rdo",
    jobId: "rdo-job-002",
    operatorId: "rdo-operator-ben",
    aircraftId: "rdo-aircraft-2",
    now: new Date("2026-05-05"),
  });

  assert.equal(readiness.ready, false);
  assert.ok(readiness.blockers.some((blocker) => blocker.includes("Hylio practical")));
  assert.ok(readiness.blockers.some((blocker) => blocker.includes("North Dakota")));
  assert.ok(readiness.blockers.some((blocker) => blocker.includes("Aircraft calibration is overdue")));
});

run("marks spray windows blocked until jobs are ready under Harvest rules", () => {
  const windowReadiness = getSprayWindowReadiness("rdo", "rdo-window-002", new Date("2026-05-05"));

  assert.equal(windowReadiness.ready, false);
  assert.ok(windowReadiness.blockers.length >= 1);
  assert.ok(windowReadiness.jobs.some((job) => job.ready === false));
});
