import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  enterpriseDemoMetadata,
  getApplicationJobReadiness,
  getEnterpriseDemoPath,
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

run("publishes a guided RDO demo path with clear fixture labeling", () => {
  const path = getEnterpriseDemoPath("rdo");

  assert.equal(enterpriseDemoMetadata.dataMode, "demo_fixture");
  assert.match(enterpriseDemoMetadata.disclaimer, /not live RDO production data/i);
  assert.deepEqual(
    path.map((step) => step.route),
    [
      "/enterprise/rdo/division",
      "/enterprise/rdo/blueprint",
      "/enterprise/rdo/spray-calendar",
      "/enterprise/rdo/readiness",
      "/enterprise/rdo/operators",
      "/enterprise/rdo/fleet",
      "/enterprise/rdo/application-records",
      "/enterprise/rdo/support",
      "/enterprise/rdo/performance",
    ],
  );
  assert.ok(path.every((step) => step.talkTrack && step.successCue));
});

run("anchors the live demo on the blocked RDO rescue pass readiness moment", () => {
  const readinessStep = getEnterpriseDemoPath("rdo").find((step) => step.id === "readiness-gate");
  const readiness = getApplicationJobReadiness({
    orgId: "rdo",
    jobId: readinessStep.focus.jobId,
    operatorId: readinessStep.focus.operatorId,
    aircraftId: readinessStep.focus.aircraftId,
    now: new Date("2026-05-05"),
  });

  assert.equal(readinessStep.focus.jobId, "rdo-job-002");
  assert.equal(readiness.ready, false);
  assert.ok(readiness.blockers.some((blocker) => blocker.includes("Hylio practical")));
  assert.ok(readiness.blockers.some((blocker) => blocker.includes("North Dakota")));
  assert.ok(readiness.blockers.some((blocker) => blocker.includes("Aircraft calibration is overdue")));
  assert.ok(readiness.blockers.some((blocker) => blocker.includes("Battery inspection checklist is incomplete")));
});

run("keeps AdminGate aligned with the active AuthContext contract", () => {
  const adminGateSource = readFileSync("src/components/AdminGate.jsx", "utf8");

  assert.ok(!adminGateSource.includes("isAuthLoading"));
  assert.ok(adminGateSource.includes("isLoading"));
  assert.ok(adminGateSource.includes("await signIn(email, password)"));
  assert.ok(adminGateSource.includes("await signUp({ email, password })"));
});
