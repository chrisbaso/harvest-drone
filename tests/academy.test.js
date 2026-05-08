import assert from "node:assert/strict";
import {
  ACADEMY_CERTIFICATION_STATUSES,
  academySeedModules,
  computeAcademyCertification,
  getAcademyCategoryCounts,
  getAcademyModuleProgress,
  getAssignedAcademyModules,
} from "../shared/academy.js";

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
});

run("computes module progress from completed lesson ids", () => {
  const module = academySeedModules.find((item) => item.slug === "drone-safety-compliance");
  const progress = getAcademyModuleProgress(module, {
    completedLessonIds: [module.lessons[0].id],
  });

  assert.equal(progress.completedLessons, 1);
  assert.equal(progress.totalLessons, module.lessons.length);
  assert.equal(progress.percentage, Math.round((1 / module.lessons.length) * 100));
});

run("computes certification status from assigned module completion", () => {
  const notStarted = computeAcademyCertification({
    modules: academySeedModules,
    completedLessonIds: [],
  });
  assert.equal(notStarted.status, ACADEMY_CERTIFICATION_STATUSES.NOT_STARTED);

  const allLessonIds = academySeedModules.flatMap((module) => module.lessons.map((lesson) => lesson.id));
  const ready = computeAcademyCertification({
    modules: academySeedModules,
    completedLessonIds: allLessonIds,
  });
  assert.equal(ready.status, ACADEMY_CERTIFICATION_STATUSES.READY_FOR_FIELD_REVIEW);

  const certified = computeAcademyCertification({
    modules: academySeedModules,
    completedLessonIds: allLessonIds,
    fieldReviewPassed: true,
  });
  assert.equal(certified.status, ACADEMY_CERTIFICATION_STATUSES.CERTIFIED);
});

run("filters assigned academy modules by operator role and category counts", () => {
  const assigned = getAssignedAcademyModules({ role: "operator" });
  const counts = getAcademyCategoryCounts(assigned);

  assert.ok(assigned.length >= 4);
  assert.ok(counts["Operator Training"] >= 1);
  assert.ok(counts["SOP Library"] >= 1);
});
