import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  ACADEMY_CERTIFICATION_STATUSES,
  academySeedModules,
  buildAcademyPilotTrainingRecord,
  buildAcademyTrainingTranscript,
  computeAcademyCertification,
  getAcademyCategoryCounts,
  getAcademyModuleQuizIssues,
  getAcademyModuleProgress,
  getAssignedAcademyModules,
  scoreAcademyModuleQuiz,
} from "../shared/academy.js";
import { getAcademyBriefingUrl, getAcademyLessonVerification } from "../src/lib/academyLessonVerification.js";

function run(name, callback) {
  try {
    callback();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

run("seeds academy modules with lessons, resources, checklist, and categories", () => {
  assert.ok(academySeedModules.length >= 6);
  assert.ok(academySeedModules.every((module) => module.title && module.category && module.estimatedMinutes));
  assert.ok(academySeedModules.every((module) => module.lessons.length >= 1));
  assert.ok(academySeedModules.some((module) => module.lessons.some((lesson) => lesson.videoUrl)));
  assert.ok(academySeedModules.some((module) => module.resources.length >= 1));
  assert.ok(academySeedModules.some((module) => module.completionChecklist.length >= 1));
  assert.ok(academySeedModules.every((module) => module.moduleQuiz?.length >= 1));
});

run("computes module progress from completed lesson ids", () => {
  const module = academySeedModules.find((item) => item.slug === "drone-safety-compliance");
  const progress = getAcademyModuleProgress(module, {
    completedLessonIds: [module.lessons[0].id],
  });

  assert.equal(progress.completedLessons, 1);
  assert.equal(progress.totalLessons, module.lessons.length);
  assert.equal(progress.quizRequired, true);
  assert.equal(progress.quizPassed, false);
  assert.equal(progress.percentage, Math.round((1 / (module.lessons.length + 1)) * 100));
});

run("computes certification status from assigned module completion", () => {
  const notStarted = computeAcademyCertification({
    modules: academySeedModules,
    completedLessonIds: [],
  });
  assert.equal(notStarted.status, ACADEMY_CERTIFICATION_STATUSES.NOT_STARTED);

  const requiredModules = academySeedModules.filter((module) => module.certificationRequired);
  const allLessonIds = academySeedModules.flatMap((module) => module.lessons.map((lesson) => lesson.id));
  const allRequiredModuleQuizIds = requiredModules.map((module) => module.id);
  const lessonsOnly = computeAcademyCertification({
    modules: academySeedModules,
    completedLessonIds: allLessonIds,
  });
  assert.equal(lessonsOnly.status, ACADEMY_CERTIFICATION_STATUSES.IN_PROGRESS);

  const ready = computeAcademyCertification({
    modules: academySeedModules,
    completedLessonIds: allLessonIds,
    passedModuleQuizIds: allRequiredModuleQuizIds,
  });
  assert.equal(ready.status, ACADEMY_CERTIFICATION_STATUSES.READY_FOR_FIELD_REVIEW);
  assert.equal(ready.completedModuleQuizCount, allRequiredModuleQuizIds.length);

  const certified = computeAcademyCertification({
    modules: academySeedModules,
    completedLessonIds: allLessonIds,
    passedModuleQuizIds: allRequiredModuleQuizIds,
    fieldReviewPassed: true,
  });
  assert.equal(certified.status, ACADEMY_CERTIFICATION_STATUSES.CERTIFIED);
});

run("scores module quizzes and requires a passing score", () => {
  const module = academySeedModules.find((item) => item.slug === "start-here");
  const passingAnswers = Object.fromEntries(module.moduleQuiz.map((question, index) => [index, question.correctIndex]));
  const failingAnswers = Object.fromEntries(module.moduleQuiz.map((_, index) => [index, index === 0 ? 1 : 0]));

  const passing = scoreAcademyModuleQuiz(module, passingAnswers);
  const failing = scoreAcademyModuleQuiz(module, failingAnswers);

  assert.equal(passing.passed, true);
  assert.equal(passing.percentage, 100);
  assert.equal(failing.passed, false);
  assert.ok(failing.percentage < failing.passingScorePct);
});

run("validates module quiz gate configuration before scoring", () => {
  const invalidModule = {
    id: "invalid-quiz",
    moduleQuizPassingScorePct: 140,
    moduleQuiz: [
      {
        question: "",
        options: ["Correct answer", ""],
        correctIndex: 4,
      },
    ],
  };
  const issues = getAcademyModuleQuizIssues(invalidModule);
  const score = scoreAcademyModuleQuiz(invalidModule, { 0: 0 });

  assert.ok(issues.length >= 3);
  assert.equal(score.valid, false);
  assert.equal(score.passingScorePct, 100);
  assert.equal(score.passed, false);
});

run("filters assigned academy modules by operator role and category counts", () => {
  const assigned = getAssignedAcademyModules({ role: "operator" });
  const counts = getAcademyCategoryCounts(assigned);

  assert.ok(assigned.length >= 4);
  assert.ok(counts["Operator Training"] >= 1);
  assert.ok(counts["SOP Library"] >= 1);
});

run("links every academy lesson to folder content, video briefing, and verification", () => {
  const allLessons = academySeedModules.flatMap((module) => module.lessons.map((lesson) => ({ module, lesson })));

  assert.ok(allLessons.length >= 10);
  assert.ok(allLessons.every(({ lesson }) => lesson.contentPath));
  assert.ok(allLessons.every(({ lesson }) => lesson.videoUrl?.startsWith("/training-videos/academy/")));
  assert.ok(allLessons.every(({ lesson }) => lesson.videoUrl.endsWith(".webm")));
  assert.ok(allLessons.every(({ lesson }) => !lesson.videoUrl.includes("youtube.com")));

  allLessons.forEach(({ module, lesson }) => {
    const verification = getAcademyLessonVerification(lesson, module);
    const briefingUrl = getAcademyBriefingUrl({ lesson, module, verification });
    const publicVideoPath = join("public", lesson.videoUrl.replace(/^\//, ""));

    assert.ok(verification.outcome);
    assert.ok(verification.briefingBeats.length >= 3);
    assert.ok(verification.checks.length >= 1);
    assert.ok(briefingUrl.startsWith("/training-videos/academy/"));
    assert.ok(briefingUrl.endsWith(".webm"));
    assert.ok(existsSync(publicVideoPath), `${publicVideoPath} should exist`);
  });
});

run("builds pilot-tagged training availability records", () => {
  const modules = getAssignedAcademyModules({ role: "operator" });
  const allLessonIds = modules.flatMap((module) => module.lessons.map((lesson) => lesson.id));
  const passedModuleQuizIds = modules.filter((module) => module.moduleQuiz?.length).map((module) => module.id);
  const record = buildAcademyPilotTrainingRecord({
    pilot: {
      id: "pilot-ada",
      name: "Ada Miller",
      role: "Lead Operator",
      credentials: [{ type: "faa_part_107", status: "verified", expiresAt: "2027-01-01" }],
      practicalEvaluations: [{ status: "passed" }],
    },
    modules,
    completedLessonIds: allLessonIds,
    passedModuleQuizIds,
    now: new Date("2026-05-08"),
  });

  assert.equal(record.pilotId, "pilot-ada");
  assert.equal(record.trainingProgressPct, 100);
  assert.equal(record.completedModuleQuizCount, record.requiredModuleQuizCount);
  assert.equal(record.availableForAssignmentReview, true);
  assert.deepEqual(record.blockers, []);

  const blocked = buildAcademyPilotTrainingRecord({
    pilot: { id: "pilot-beau", name: "Beau Carter", credentials: [] },
    modules,
    completedLessonIds: [],
    now: new Date("2026-05-08"),
  });

  assert.equal(blocked.availableForAssignmentReview, false);
  assert.ok(blocked.blockers.includes("Academy training path is not complete"));
  assert.ok(blocked.blockers.includes("No current verified pilot credentials linked"));
});

run("builds a sequential training transcript with next actions and quiz attempts", () => {
  const modules = getAssignedAcademyModules({ role: "operator" });
  const firstModule = modules[0];
  const completedLessonIds = firstModule.lessons.map((lesson) => lesson.id);
  const quizAnswers = Object.fromEntries(firstModule.moduleQuiz.map((question, index) => [index, question.correctIndex]));
  const transcriptBeforeQuiz = buildAcademyTrainingTranscript({
    pilot: { id: "pilot-ada", name: "Ada Miller" },
    modules,
    completedLessonIds,
    moduleQuizResults: {},
    now: new Date("2026-05-08"),
  });

  assert.equal(transcriptBeforeQuiz.currentModule.moduleId, firstModule.id);
  assert.equal(transcriptBeforeQuiz.currentModule.status, "Quiz Required");
  assert.equal(transcriptBeforeQuiz.nextAction, "Pass the module quiz");

  const transcriptAfterQuiz = buildAcademyTrainingTranscript({
    pilot: { id: "pilot-ada", name: "Ada Miller" },
    modules,
    completedLessonIds,
    passedModuleQuizIds: [firstModule.id],
    moduleQuizResults: {
      [firstModule.id]: {
        answers: quizAnswers,
        passed: true,
        passedAt: "2026-05-08T12:00:00.000Z",
        attempts: [{ attemptedAt: "2026-05-08T12:00:00.000Z", scorePct: 100, correctCount: 2, totalQuestions: 2, passed: true }],
      },
    },
    now: new Date("2026-05-08"),
  });

  assert.equal(transcriptAfterQuiz.modules[0].status, "Passed");
  assert.equal(transcriptAfterQuiz.modules[0].quizAttemptCount, 1);
  assert.equal(transcriptAfterQuiz.currentModule.moduleId, modules[1].id);
  assert.equal(transcriptAfterQuiz.nextAction.startsWith("Continue lesson:"), true);
});
