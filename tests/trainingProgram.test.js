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
