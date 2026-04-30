const COMPLETED_LESSONS_KEY = "harvestTraining.completedLessons";
const ASSESSMENT_ATTEMPTS_KEY = "harvestTraining.assessmentAttempts";
const CHECKLIST_RUNS_KEY = "harvestTraining.checklistRuns";

function readJson(key, fallback) {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}

export function getCompletedLessons() {
  return readJson(COMPLETED_LESSONS_KEY, []);
}

export function markLessonComplete(lessonId) {
  const next = [...new Set([...getCompletedLessons(), lessonId])];
  writeJson(COMPLETED_LESSONS_KEY, next);
  return next;
}

export function getAssessmentAttempts() {
  return readJson(ASSESSMENT_ATTEMPTS_KEY, []);
}

export function saveAssessmentAttempt(attempt) {
  const attempts = [attempt, ...getAssessmentAttempts()];
  writeJson(ASSESSMENT_ATTEMPTS_KEY, attempts);
  return attempts;
}

export function getChecklistRuns() {
  return readJson(CHECKLIST_RUNS_KEY, []);
}

export function saveChecklistRun(run) {
  const runs = [run, ...getChecklistRuns()];
  writeJson(CHECKLIST_RUNS_KEY, runs);
  return runs;
}
