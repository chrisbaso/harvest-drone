import assert from "node:assert/strict";
import {
  QUALIFICATION_LEVELS,
  canSignPracticalEvaluation,
  canSignPracticalForOperator,
  canVerifyOperatorCredential,
  computeHylioJobReadiness,
  computeOperatorQualification,
  demoHylioJob,
  demoOperators,
  findAssessment,
  getCourseProgress,
  getOperatorQualificationPlan,
  getQualificationGateChecks,
  getQualificationQueue,
  mapTrainingRowsToOperator,
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

run("includes potato application specialist training with six lessons and quizzes", () => {
  const course = trainingCourses.find((item) => item.slug === "potato-application-specialist");
  const lessons = course?.modules.flatMap((module) => module.lessons) || [];

  assert.equal(course?.title, "Potato Application Specialist");
  assert.deepEqual(course.requiredForJobTypes, ["potato-spraying"]);
  assert.equal(lessons.length, 6);
  assert.ok(lessons.every((lesson) => lesson.quiz?.length >= 1));
});

run("links Hylio drone training lessons to folder content files", () => {
  const hylioCourse = trainingCourses.find((item) => item.slug === "hylio-operator-foundations");
  const hylioLessons = hylioCourse.modules.flatMap((module) => module.lessons);
  const linkedLessons = hylioLessons.filter((lesson) => lesson.contentPath);

  assert.ok(linkedLessons.length >= 10);
  assert.equal(hylioLessons.find((lesson) => lesson.id === "hylio-foundations-operating-model").contentPath, "content/training/hylio/00-orientation.mdx");
  assert.equal(hylioLessons.find((lesson) => lesson.id === "hylio-foundations-agrosol").contentPath, "content/training/hylio/03-agrosol-mission-planning.mdx");
  assert.equal(hylioLessons.find((lesson) => lesson.id === "hylio-foundations-emergency-procedures").contentPath, "content/training/hylio/06-manual-control-emergency-procedures.mdx");
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

run("ordinary operators cannot verify their own credentials", () => {
  const operator = { id: "operator-1", role: "Operator" };
  const lead = { id: "lead-1", role: "Lead Operator" };
  const admin = { id: "admin-1", role: "Admin" };

  assert.equal(canVerifyOperatorCredential({ actor: operator, operator }), false);
  assert.equal(canVerifyOperatorCredential({ actor: lead, operator }), true);
  assert.equal(canVerifyOperatorCredential({ actor: admin, operator }), true);
});

run("practical signoff requires lead/chief/admin authority and a separate subject", () => {
  const lead = { id: "lead-1", role: "Lead Operator" };
  const trainee = { id: "trainee-1", role: "Operator trainee" };

  assert.equal(canSignPracticalForOperator({ actor: lead, operator: trainee }), true);
  assert.equal(canSignPracticalForOperator({ actor: lead, operator: lead }), false);
  assert.equal(canSignPracticalForOperator({ actor: trainee, operator: lead }), false);
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
    job: {
      ...demoHylioJob,
      completedChecklistSlugs: demoHylioJob.requiredChecklistSlugs,
    },
    now: new Date("2026-04-30"),
  });

  assert.equal(readiness.ready, true);
  assert.deepEqual(readiness.blockers, []);
});

run("blocks Hylio assignment when required checklists or documents are incomplete", () => {
  const readiness = computeHylioJobReadiness({
    operator: demoOperators[0],
    job: {
      ...demoHylioJob,
      completedChecklistSlugs: ["drift-weather-review"],
      documentsAttached: false,
    },
    now: new Date("2026-04-30"),
  });

  assert.equal(readiness.ready, false);
  assert.ok(readiness.blockers.some((blocker) => blocker.includes("Required SOP checklist pending")));
  assert.ok(readiness.blockers.some((blocker) => blocker.includes("Required job documents are not attached")));
});

run("builds qualification gate checks across training, credentials, practical, and assignment", () => {
  const gates = getQualificationGateChecks({
    operator: demoOperators[1],
    job: {
      ...demoHylioJob,
      completedChecklistSlugs: ["drift-weather-review"],
    },
    now: new Date("2026-04-30"),
  });

  assert.ok(gates.some((gate) => gate.group === "Training" && gate.status === "blocker"));
  assert.ok(gates.some((gate) => gate.group === "Credentials" && gate.id === "credential-pesticide"));
  assert.ok(gates.some((gate) => gate.group === "Practical" && gate.status === "blocker"));
  assert.ok(gates.some((gate) => gate.group === "Assignment" && gate.id === "job-checklists" && gate.status === "blocker"));
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

run("maps Supabase training rows into the operator readiness shape", () => {
  const operator = mapTrainingRowsToOperator({
    profile: { id: "user-1", full_name: "Real Operator", email: "real@example.com" },
    operatorLead: {
      id: "operator-real",
      first_name: "Real",
      last_name: "Operator",
      state: "Arkansas",
      aircraft_models: ["HYL-300 Atlas"],
      payload_types: ["liquid"],
    },
    enrollments: [
      { status: "active", training_courses: { slug: "hylio-operator-foundations" } },
    ],
    lessonProgress: [
      { status: "completed", training_lessons: { slug: "hylio-foundations-operating-model" } },
      { status: "not_started", training_lessons: { slug: "hylio-foundations-compliance" } },
    ],
    assessmentAttempts: [
      { score: 95, passed: true, created_at: "2026-05-01T12:00:00Z", training_assessments: { slug: "compliance-foundations" } },
    ],
    credentials: [
      {
        credential_type: "FAA_PART_107",
        verification_status: "verified",
        expiration_date: "2027-01-01",
        state_territory: null,
      },
    ],
    practicalEvaluations: [
      { template_slug: "preflight-and-setup", status: "passed", signed_at: "2026-05-02T12:00:00Z" },
    ],
  });

  assert.equal(operator.id, "operator-real");
  assert.equal(operator.name, "Real Operator");
  assert.equal(operator.enrollments[0].courseId, "hylio-operator-foundations");
  assert.deepEqual(operator.completedLessons, ["hylio-foundations-operating-model"]);
  assert.equal(operator.assessmentAttempts[0].assessmentId, "compliance-foundations");
  assert.equal(operator.credentials[0].type, "FAA_PART_107");
  assert.equal(operator.credentials[0].status, "verified");
  assert.equal(operator.practicalEvaluations[0].templateId, "preflight-and-setup");
});
