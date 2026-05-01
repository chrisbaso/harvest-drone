import assert from "node:assert/strict";
import {
  QUALIFICATION_LEVELS,
  canSignPracticalEvaluation,
  computeHylioJobReadiness,
  computeOperatorQualification,
  demoHylioJob,
  demoOperators,
  findAssessment,
  getCourseProgress,
  getOperatorQualificationPlan,
  getQualificationGateChecks,
  getQualificationQueue,
  scoreAssessment,
  trainingCourses,
} from "../shared/trainingProgram.js";

function run(name, callback) {
  try {
    callback();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

run("tracks required course progress", () => {
  const progress = getCourseProgress(demoOperators[1], trainingCourses[0]);
  assert.equal(progress.completed, 2);
  assert.equal(progress.total, 12);
  assert.equal(progress.percentage, 17);
});

run("scores assessments and marks passing attempts", () => {
  const assessment = findAssessment("compliance-foundations");
  const result = scoreAssessment(assessment, {
    "cf-1": 1,
    "cf-2": 0,
    "cf-3": 0,
  });

  assert.equal(result.score, 100);
  assert.equal(result.passed, true);
});

run("only lead/chief/admin roles can sign practical evaluations", () => {
  assert.equal(canSignPracticalEvaluation("Lead Operator"), true);
  assert.equal(canSignPracticalEvaluation("Chief Pilot"), true);
  assert.equal(canSignPracticalEvaluation("Trainee"), false);
});

run("computes qualified operator level for complete demo operator", () => {
  const level = computeOperatorQualification(demoOperators[0], new Date("2026-04-30"));
  assert.equal(level, QUALIFICATION_LEVELS.LEAD_OPERATOR);
});

run("blocks Hylio job assignment when training and credentials are missing", () => {
  const readiness = computeHylioJobReadiness({
    operator: demoOperators[1],
    job: demoHylioJob,
    now: new Date("2026-04-30"),
  });

  assert.equal(readiness.ready, false);
  assert.ok(readiness.blockers.some((blocker) => blocker.includes("Pesticide applicator license for Arkansas")));
  assert.ok(readiness.blockers.some((blocker) => blocker.includes("Hylio practical evaluation")));
});

run("allows Hylio assignment when hard gates pass", () => {
  const readiness = computeHylioJobReadiness({
    operator: demoOperators[0],
    job: demoHylioJob,
    now: new Date("2026-04-30"),
  });

  assert.equal(readiness.ready, true);
  assert.deepEqual(readiness.blockers, []);
});

run("builds qualification gate checks across training, credentials, practical, and assignment", () => {
  const gates = getQualificationGateChecks({
    operator: demoOperators[1],
    job: demoHylioJob,
    now: new Date("2026-04-30"),
  });

  assert.ok(gates.some((gate) => gate.group === "Training" && gate.status === "blocker"));
  assert.ok(gates.some((gate) => gate.group === "Credentials" && gate.id === "credential-pesticide"));
  assert.ok(gates.some((gate) => gate.group === "Practical" && gate.status === "blocker"));
  assert.ok(gates.some((gate) => gate.group === "Assignment" && gate.id === "job-checklists" && gate.status === "warning"));
});

run("qualification plan exposes next actions when operator is not review-ready", () => {
  const plan = getOperatorQualificationPlan({
    operator: demoOperators[1],
    job: demoHylioJob,
    now: new Date("2026-04-30"),
  });

  assert.equal(plan.canRequestReview, false);
  assert.equal(plan.reviewStatus, "NOT_READY");
  assert.ok(plan.counts.blockers > 0);
  assert.ok(plan.nextActions.some((action) => action.action.includes("Schedule supervised field evaluation")));
});

run("qualification queue sorts review-ready operators first", () => {
  const queue = getQualificationQueue(demoOperators, demoHylioJob, new Date("2026-04-30"));

  assert.equal(queue[0].operatorId, demoOperators[0].id);
  assert.equal(queue[0].canRequestReview, true);
  assert.equal(queue[0].canAssignToJob, true);
});
