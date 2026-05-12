export const ACADEMY_CATEGORIES = [
  "Start Here",
  "Operator Training",
  "SOURCE Education",
  "Drone Safety",
  "Field Operations",
  "Enterprise Playbooks",
  "SOP Library",
  "Certification",
];

export const ACADEMY_CERTIFICATION_STATUSES = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  READY_FOR_FIELD_REVIEW: "Ready for Field Review",
  CERTIFIED: "Certified",
};

const academyVideo = (lessonId) => `/training-videos/academy/generated/${lessonId}.webm`;

export const academySeedModules = [
  {
    id: "academy-start-here",
    slug: "start-here",
    title: "Start Here: Harvest Drone OS Academy",
    description: "Orientation for operators, managers, and enterprise stakeholders using Harvest Drone OS.",
    category: "Start Here",
    estimatedMinutes: 18,
    assignedRoles: ["operator", "dealer", "network_manager", "admin"],
    certificationRequired: true,
    sortOrder: 1,
    lessons: [
      {
        id: "academy-start-here-1",
        title: "How the Academy works",
        description: "Understand assigned modules, SOP evidence, completion tracking, and field review requirements.",
        estimatedMinutes: 8,
        videoUrl: academyVideo("academy-start-here-1"),
        contentPath: "content/training/academy/00-academy-overview.mdx",
        content:
          "Harvest Drone OS Academy is the operating training hub for safe, documented drone application work. Operators complete assigned modules, review SOPs, pass readiness gates, and move toward field review before certification.",
      },
      {
        id: "academy-start-here-2",
        title: "Your certification path",
        description: "See how training progress turns into certification readiness.",
        estimatedMinutes: 10,
        videoUrl: academyVideo("academy-start-here-2"),
        contentPath: "content/training/academy/01-certification-path.mdx",
        content:
          "Certification moves from Not Started to In Progress, then Ready for Field Review after training completion. A lead operator or admin moves the operator to Certified after field review.",
      },
    ],
    resources: [
      { id: "resource-academy-map", title: "Academy onboarding map", type: "PDF", category: "Field Guides", url: "/docs/rdo-pilot-readiness-checklist.md" },
    ],
    completionChecklist: ["Review dashboard", "Open assigned module", "Understand certification states"],
    moduleQuiz: [
      {
        question: "What has to happen before a pilot can be treated as field-ready in Harvest Drone OS?",
        options: ["Assigned lessons and module quiz gates must be passed with evidence.", "The pilot opens the Academy once.", "An admin verbally approves the pilot without a record."],
        correctIndex: 0,
      },
      {
        question: "Where should Academy completion be saved?",
        options: ["Against the selected pilot training record.", "Only in the browser tab title.", "Only in a one-time chat note."],
        correctIndex: 0,
      },
    ],
  },
  {
    id: "academy-operator-foundations",
    slug: "operator-foundations",
    title: "Hylio Operator Foundations",
    description: "Core operator onboarding linked to the Harvest-authored Hylio training content already in the repo.",
    category: "Operator Training",
    estimatedMinutes: 92,
    assignedRoles: ["operator", "dealer", "admin"],
    certificationRequired: true,
    sortOrder: 2,
    lessons: [
      {
        id: "academy-operator-foundations-1",
        title: "Harvest Drone operating model",
        description: "Training as an operating gate for safe, documented Hylio work.",
        estimatedMinutes: 18,
        videoUrl: academyVideo("academy-operator-foundations-1"),
        contentPath: "content/training/hylio/00-orientation.mdx",
        content:
          "Harvest-qualified operators are expected to stop work when legal, aircraft, weather, chemical, or site conditions are not ready.",
      },
      {
        id: "academy-operator-foundations-2",
        title: "Compliance foundations",
        description: "Part 107, Part 137, 44807, Remote ID, pesticide licensing, and credential evidence.",
        estimatedMinutes: 40,
        videoUrl: academyVideo("academy-operator-foundations-2"),
        contentPath: "content/training/hylio/01-compliance-foundations.mdx",
        content:
          "Operators must verify current federal, state, tribal, territorial, pesticide, insurance, and aircraft requirements before assignment.",
      },
      {
        id: "academy-operator-foundations-3",
        title: "Aircraft and GroundLink overview",
        description: "Hardware handling, official Hylio references, and Harvest evidence expectations.",
        estimatedMinutes: 34,
        videoUrl: academyVideo("academy-operator-foundations-3"),
        contentPath: "content/training/hylio/02-hylio-hardware-groundlink.mdx",
        content:
          "Use official Hylio materials for hardware specifics while Harvest OS tracks readiness, evidence, and supervisor signoff.",
      },
    ],
    resources: [
      { id: "resource-hylio-course", title: "Full Hylio Operator Foundations course", type: "Course", category: "Operator Training", url: "/training/courses/hylio-operator-foundations" },
      { id: "resource-operator-qualification", title: "Operator Qualification Gate", type: "Review", category: "Certification", url: "/training/qualification" },
    ],
    completionChecklist: ["Operating model reviewed", "Compliance foundations reviewed", "Aircraft overview reviewed"],
    moduleQuiz: [
      {
        question: "What is the operator's responsibility when legal, aircraft, weather, chemical, or site conditions are unclear?",
        options: ["Stop work and escalate before field operations continue.", "Launch and document it afterward.", "Ask the customer to decide in the field."],
        correctIndex: 0,
      },
      {
        question: "Which evidence belongs in the operator qualification record?",
        options: ["Training, credentials, aircraft readiness, and supervisor signoff.", "Only the pilot's preferred drone model.", "Only the last job invoice."],
        correctIndex: 0,
      },
    ],
  },
  {
    id: "academy-drone-safety",
    slug: "drone-safety-compliance",
    title: "Drone Safety & Compliance",
    description: "Part 107 readiness, aircraft registration, Remote ID, site safety, and pre-flight discipline.",
    category: "Drone Safety",
    estimatedMinutes: 55,
    assignedRoles: ["operator", "dealer", "admin"],
    certificationRequired: true,
    sortOrder: 3,
    lessons: [
      {
        id: "academy-drone-safety-1",
        title: "Commercial drone operating rules",
        description: "What operators must verify before commercial agricultural UAS work.",
        estimatedMinutes: 16,
        videoUrl: academyVideo("academy-drone-safety-1"),
        contentPath: "content/training/academy/02-commercial-drone-operating-rules.mdx",
        content:
          "Operators must keep Part 107 current, follow site-specific flight controls, document aircraft readiness, and stop work when weather, aircraft, product, or personnel conditions are not safe.",
      },
      {
        id: "academy-drone-safety-2",
        title: "Pre-flight checklist discipline",
        description: "The checklist is an operating control, not a paperwork step.",
        estimatedMinutes: 18,
        videoUrl: academyVideo("academy-drone-safety-2"),
        contentPath: "content/training/academy/03-preflight-discipline.mdx",
        content:
          "Pre-flight review confirms aircraft condition, batteries, payload, field boundaries, obstacles, weather, emergency landing zones, and communication plan before launch.",
      },
      {
        id: "academy-drone-safety-3",
        title: "Emergency stop-work criteria",
        description: "When to pause, land, isolate the area, and escalate.",
        estimatedMinutes: 21,
        videoUrl: academyVideo("academy-drone-safety-3"),
        contentPath: "content/training/academy/04-emergency-stop-work.mdx",
        content:
          "Operators pause or abort when aircraft state is uncertain, wind exceeds limits, people enter the work area, product label constraints are not met, or equipment behaves abnormally.",
      },
    ],
    resources: [
      { id: "resource-preflight-sop", title: "Drone Pre-Flight SOP", type: "SOP", category: "SOPs & Procedures", url: "/training/checklists/hylio-preflight-checklist" },
      { id: "resource-emergency-sop", title: "Emergency Procedures", type: "SOP", category: "Safety Documents", url: "/training/checklists/emergency-response" },
    ],
    completionChecklist: ["Part 107 status reviewed", "Pre-flight SOP reviewed", "Emergency criteria acknowledged"],
    moduleQuiz: [
      {
        question: "What does a mission-specific pre-flight checklist prove?",
        options: ["This aircraft, payload, field, weather, and communication plan were checked before launch.", "The pilot completed training sometime this season.", "The drone was purchased from an approved vendor."],
        correctIndex: 0,
      },
      {
        question: "What should an operator do when people enter the work area or aircraft behavior becomes abnormal?",
        options: ["Pause or abort, land safely when possible, and escalate.", "Keep flying until the tank is empty.", "Disable the checklist and continue."],
        correctIndex: 0,
      },
    ],
  },
  {
    id: "academy-field-ops",
    slug: "field-operations-basics",
    title: "Field Operations Basics",
    description: "Field mapping, weather decisions, product application windows, and job closeout.",
    category: "Field Operations",
    estimatedMinutes: 64,
    assignedRoles: ["operator", "dealer", "admin"],
    certificationRequired: true,
    sortOrder: 4,
    lessons: [
      {
        id: "academy-field-ops-1",
        title: "Field mapping and boundaries",
        description: "Create accurate field maps for safe and effective coverage.",
        estimatedMinutes: 14,
        videoUrl: academyVideo("academy-field-ops-1"),
        contentPath: "content/training/academy/05-field-mapping-boundaries.mdx",
        content:
          "Accurate field maps include boundary confirmation, obstacle marking, sensitive areas, buffer zones, product constraints, and safe access/staging locations.",
      },
      {
        id: "academy-field-ops-2",
        title: "Weather and drift review",
        description: "Evaluate wind, precipitation, inversion risk, and label restrictions.",
        estimatedMinutes: 18,
        videoUrl: academyVideo("academy-field-ops-2"),
        contentPath: "content/training/academy/06-weather-drift-review.mdx",
        content:
          "Weather review protects crop quality, neighbors, operators, and the customer relationship. Wind, gusts, precipitation, temperature, humidity, and inversion risk are recorded before application.",
      },
      {
        id: "academy-field-ops-3",
        title: "Application closeout",
        description: "Capture acres, product, weather, anomalies, and post-flight inspection.",
        estimatedMinutes: 16,
        videoUrl: academyVideo("academy-field-ops-3"),
        contentPath: "content/training/academy/07-application-closeout.mdx",
        content:
          "Closeout creates the audit trail: flight duration, actual acres sprayed, product applied, weather, anomalies, maintenance issues, and post-flight checklist completion.",
      },
    ],
    resources: [
      { id: "resource-weather-guide", title: "Weather Minimums Guide", type: "PDF", category: "Field Guides", url: "/training/checklists/drift-weather-review" },
      { id: "resource-postflight", title: "Post-Flight Checklist", type: "SOP", category: "SOPs & Procedures", url: "/training/checklists/hylio-postflight-checklist" },
    ],
    completionChecklist: ["Boundary workflow reviewed", "Weather gate reviewed", "Post-flight closeout reviewed"],
    moduleQuiz: [
      {
        question: "What should a field map include before an application mission launches?",
        options: ["Boundaries, obstacles, no-spray areas, buffers, and safe staging/access locations.", "Only the grower's last name.", "Only the nearest town."],
        correctIndex: 0,
      },
      {
        question: "Why is closeout required after an application?",
        options: ["It creates the flight, product, weather, anomaly, and inspection audit trail.", "It replaces the pre-flight checklist.", "It lets the operator skip weather recording next time."],
        correctIndex: 0,
      },
    ],
  },
  {
    id: "academy-source",
    slug: "source-education",
    title: "SOURCE Product Education",
    description: "How SOURCE fits into the Harvest Drone sales and education workflow.",
    category: "SOURCE Education",
    estimatedMinutes: 42,
    assignedRoles: ["operator", "dealer", "network_manager", "admin"],
    certificationRequired: false,
    sortOrder: 5,
    lessons: [
      {
        id: "academy-source-1",
        title: "SOURCE mode of action",
        description: "A practical explanation for operators and grower-facing teams.",
        estimatedMinutes: 15,
        videoUrl: academyVideo("academy-source-1"),
        contentPath: "content/training/academy/08-source-mode-of-action.mdx",
        content:
          "SOURCE education helps teams explain biological nutrient efficiency, field fit, expectations, and when to route questions to agronomy support.",
      },
      {
        id: "academy-source-2",
        title: "Sample and acre review workflow",
        description: "How SOURCE education connects to lead capture and follow-up.",
        estimatedMinutes: 13,
        videoUrl: academyVideo("academy-source-2"),
        contentPath: "content/training/academy/09-source-acre-review-workflow.mdx",
        content:
          "Harvest Drone OS connects SOURCE education to grower funnel activity, acre reviews, order readiness, and follow-up tasks.",
      },
    ],
    resources: [
      { id: "resource-source-mode", title: "SOURCE Mode of Action", type: "PDF", category: "SOURCE Education", url: "/source" },
      { id: "resource-source-tank", title: "SOURCE Tank Mix Guidelines", type: "PDF", category: "SOURCE Education", url: "/docs/source-acre-review-design-system.md" },
    ],
    completionChecklist: ["SOURCE positioning reviewed", "Grower workflow reviewed"],
    moduleQuiz: [
      {
        question: "What is the safest way for operators to handle technical agronomy questions about SOURCE?",
        options: ["Explain field fit at a high level and route technical claims to agronomy support.", "Make unsupported yield guarantees.", "Ignore the question until after application."],
        correctIndex: 0,
      },
      {
        question: "What should an acre review become before field work is scheduled?",
        options: ["A clear next action with crop, acres, timing, owner, and follow-up captured.", "A mission with no product or timing details.", "A generic marketing note only."],
        correctIndex: 0,
      },
    ],
  },
  {
    id: "academy-enterprise",
    slug: "enterprise-playbooks",
    title: "Enterprise Deployment Playbooks",
    description: "Operating model, RDO-style rollout, network reporting, and executive compliance views.",
    category: "Enterprise Playbooks",
    estimatedMinutes: 46,
    assignedRoles: ["dealer", "network_manager", "admin"],
    certificationRequired: false,
    sortOrder: 6,
    lessons: [
      {
        id: "academy-enterprise-1",
        title: "Enterprise drone division operating model",
        description: "How an enterprise team runs fleet, operators, schedule, records, and support.",
        estimatedMinutes: 20,
        videoUrl: academyVideo("academy-enterprise-1"),
        contentPath: "content/training/academy/10-enterprise-drone-division-model.mdx",
        content:
          "Enterprise drone programs need standardized training, aircraft readiness, field scheduling, compliance records, support workflows, and executive reporting.",
      },
      {
        id: "academy-enterprise-2",
        title: "RDO pilot rollout checklist",
        description: "A staged rollout from demo readiness to live pilot operations.",
        estimatedMinutes: 18,
        videoUrl: academyVideo("academy-enterprise-2"),
        contentPath: "content/training/academy/11-rdo-pilot-rollout-checklist.mdx",
        content:
          "A pilot rollout starts with qualified operators, ready aircraft, selected fields, confirmed product windows, compliance record workflow, and management reporting.",
      },
    ],
    resources: [
      { id: "resource-enterprise-demo", title: "RDO Enterprise Demo Runbook", type: "Guide", category: "Enterprise Deployment", url: "/docs/rdo-enterprise-demo-runbook.md" },
      { id: "resource-demo-script", title: "RDO Demo Script", type: "Guide", category: "Enterprise Deployment", url: "/docs/rdo-demo-script.md" },
    ],
    completionChecklist: ["Operating model reviewed", "Pilot rollout steps reviewed"],
    moduleQuiz: [
      {
        question: "What has to be visible for an enterprise drone division to operate safely?",
        options: ["Fleet status, pilot training, mission readiness, compliance records, and support lanes.", "Only a public landing page.", "Only the number of drones purchased."],
        correctIndex: 0,
      },
      {
        question: "When should an enterprise pilot rollout expand?",
        options: ["After assignment, launch, closeout, and reporting work repeatably on a small pilot.", "Before blockers are documented.", "Immediately after the first sales call."],
        correctIndex: 0,
      },
    ],
  },
  {
    id: "academy-sop-library",
    slug: "sop-library",
    title: "SOP Library",
    description: "Pre-flight, post-flight, chemical handling, battery handling, emergency response, and drift management.",
    category: "SOP Library",
    estimatedMinutes: 38,
    assignedRoles: ["operator", "dealer", "network_manager", "admin"],
    certificationRequired: true,
    sortOrder: 7,
    lessons: [
      {
        id: "academy-sop-1",
        title: "Core SOP review",
        description: "The procedures every operator must know before field operations.",
        estimatedMinutes: 20,
        videoUrl: academyVideo("academy-sop-1"),
        contentPath: "content/training/academy/12-core-sop-review.mdx",
        content:
          "Core SOPs define how operators inspect aircraft, handle batteries, mix/load products, manage drift, respond to emergencies, and close out jobs.",
      },
    ],
    resources: [
      { id: "resource-chemical-sop", title: "Chemical Handling & Mixing SOP", type: "SOP", category: "SOPs & Procedures", url: "/training/checklists/chemical-mixing-loading" },
      { id: "resource-battery-sop", title: "Battery Maintenance Guide", type: "SOP", category: "Maintenance", url: "/training/checklists/battery-handling" },
      { id: "resource-drift-sop", title: "Drift Management Best Practices", type: "SOP", category: "Field Guides", url: "/training/checklists/drift-weather-review" },
    ],
    completionChecklist: ["All core SOPs opened", "Stop-work criteria acknowledged"],
    moduleQuiz: [
      {
        question: "Which SOPs apply before a spray mission launches?",
        options: ["Pre-flight, weather/drift, chemical handling, battery, and communication SOPs.", "Only post-flight closeout.", "Only invoice approval."],
        correctIndex: 0,
      },
      {
        question: "What should an operator do when a core SOP gate fails?",
        options: ["Stop, correct or escalate the issue, and document the blocker.", "Override silently.", "Launch and resolve it after the job."],
        correctIndex: 0,
      },
    ],
  },
  {
    id: "academy-certification",
    slug: "operator-certification",
    title: "Operator Certification",
    description: "Final knowledge check, field review scheduling, and certification status tracking.",
    category: "Certification",
    estimatedMinutes: 35,
    assignedRoles: ["operator", "dealer", "admin"],
    certificationRequired: true,
    sortOrder: 8,
    lessons: [
      {
        id: "academy-certification-1",
        title: "Certification readiness review",
        description: "Confirm completion, credentials, SOPs, and field review readiness.",
        estimatedMinutes: 18,
        videoUrl: academyVideo("academy-certification-1"),
        contentPath: "content/training/academy/13-certification-readiness-review.mdx",
        content:
          "Operators become Ready for Field Review when assigned certification-required modules are complete. Certification is granted after field review by authorized leadership.",
      },
    ],
    resources: [
      { id: "resource-certification-checklist", title: "Pilot Readiness Checklist", type: "Checklist", category: "Certification", url: "/docs/rdo-pilot-readiness-checklist.md" },
    ],
    completionChecklist: ["Assigned modules complete", "Credentials checked", "Field review requested"],
    moduleQuiz: [
      {
        question: "What does Academy certification mean in the mission workflow?",
        options: ["The pilot passed training and review evidence, but each mission still runs live readiness gates.", "The pilot can bypass weather and aircraft checks.", "The pilot no longer needs current credentials."],
        correctIndex: 0,
      },
      {
        question: "When should a pilot become Certified?",
        options: ["After required training, module quizzes, credentials, and field review are complete.", "After watching one video.", "After scheduling a mission once."],
        correctIndex: 0,
      },
    ],
  },
];

export const academySeedComments = [
  {
    id: "comment-wind-speed",
    moduleId: "academy-field-ops",
    author: "John D.",
    role: "Operator",
    text: "What wind speed is considered too high for safe application?",
    replies: [
      {
        id: "reply-wind-speed",
        author: "Sarah M.",
        role: "Lead Operator",
        text: "Use the mission/product limit. For most demo spray missions we stop at 10 mph sustained or if gusts create drift risk.",
      },
    ],
    pinned: true,
  },
  {
    id: "comment-preflight-evidence",
    moduleId: "academy-drone-safety",
    author: "Tom K.",
    role: "Dealer Manager",
    text: "Do we need a separate checklist for every launch?",
    replies: [
      {
        id: "reply-preflight-evidence",
        author: "Harvest Ops",
        role: "Admin",
        text: "Yes. The readiness gate expects pre-flight confirmation for the specific mission being launched.",
      },
    ],
    pinned: false,
  },
];

export function getAssignedAcademyModules({ role = "operator", modules = academySeedModules } = {}) {
  return modules
    .filter((module) => !module.assignedRoles?.length || module.assignedRoles.includes(role) || role === "admin")
    .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
}

function normalizeQuizPassingScore(score) {
  const numericScore = Number(score);
  if (!Number.isFinite(numericScore)) return 80;
  return Math.min(100, Math.max(1, Math.round(numericScore)));
}

export function getAcademyModuleQuizIssues(module = {}) {
  const questions = Array.isArray(module.moduleQuiz) ? module.moduleQuiz : [];
  const issues = [];

  if (questions.length === 0) {
    issues.push("Add at least one module quiz question.");
  }

  questions.forEach((question, questionIndex) => {
    const label = `Question ${questionIndex + 1}`;
    const options = Array.isArray(question.options) ? question.options : [];

    if (!String(question.question || "").trim()) {
      issues.push(`${label} is missing question text.`);
    }

    if (options.length < 2) {
      issues.push(`${label} needs at least two answer options.`);
    }

    if (options.some((option) => !String(option || "").trim())) {
      issues.push(`${label} has a blank answer option.`);
    }

    if (!Number.isInteger(question.correctIndex) || question.correctIndex < 0 || question.correctIndex >= options.length) {
      issues.push(`${label} has no valid correct answer selected.`);
    }
  });

  return issues;
}

export function scoreAcademyModuleQuiz(module = {}, answers = {}) {
  const questions = Array.isArray(module.moduleQuiz) ? module.moduleQuiz : [];
  const passingScorePct = normalizeQuizPassingScore(module.moduleQuizPassingScorePct || 80);
  const issues = getAcademyModuleQuizIssues(module);
  const correctCount = questions.filter((question, index) => Number(answers[index]) === question.correctIndex).length;
  const totalQuestions = questions.length;
  const percentage = totalQuestions ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return {
    correctCount,
    totalQuestions,
    percentage,
    passingScorePct,
    valid: issues.length === 0,
    issues,
    passed: issues.length === 0 && totalQuestions > 0 && percentage >= passingScorePct,
  };
}

export function getAcademyModuleProgress(module, progress = {}) {
  const completedLessonIds = new Set(progress.completedLessonIds || []);
  const passedModuleQuizIds = new Set(progress.passedModuleQuizIds || []);
  const totalLessons = module?.lessons?.length || 0;
  const completedLessons = (module?.lessons || []).filter((lesson) => completedLessonIds.has(lesson.id)).length;
  const quizRequired = Boolean(module?.moduleQuiz?.length);
  const quizPassed = !quizRequired || passedModuleQuizIds.has(module.id);
  const totalItems = totalLessons + (quizRequired ? 1 : 0);
  const completedItems = completedLessons + (quizRequired && quizPassed ? 1 : 0);
  const percentage = totalItems ? Math.round((completedItems / totalItems) * 100) : 0;
  const nextLesson = (module?.lessons || []).find((lesson) => !completedLessonIds.has(lesson.id)) || null;

  return {
    completedLessons,
    totalLessons,
    completedItems,
    totalItems,
    percentage,
    nextLesson,
    quizRequired,
    quizPassed,
    complete: totalLessons > 0 && completedLessons === totalLessons && quizPassed,
  };
}

export function computeAcademyCertification({ modules = academySeedModules, completedLessonIds = [], passedModuleQuizIds = [], fieldReviewPassed = false } = {}) {
  const requiredModules = modules.filter((module) => module.certificationRequired);
  const requiredLessonIds = requiredModules.flatMap((module) => module.lessons.map((lesson) => lesson.id));
  const requiredModuleQuizIds = requiredModules.filter((module) => module.moduleQuiz?.length).map((module) => module.id);
  const completedLessons = requiredLessonIds.filter((id) => completedLessonIds.includes(id)).length;
  const completedModuleQuizzes = requiredModuleQuizIds.filter((id) => passedModuleQuizIds.includes(id)).length;
  const completed = completedLessons + completedModuleQuizzes;
  const totalSteps = requiredLessonIds.length + requiredModuleQuizIds.length;
  const percentage = totalSteps ? Math.round((completed / totalSteps) * 100) : 0;

  let status = ACADEMY_CERTIFICATION_STATUSES.NOT_STARTED;
  if (fieldReviewPassed) {
    status = ACADEMY_CERTIFICATION_STATUSES.CERTIFIED;
  } else if (totalSteps > 0 && completed === totalSteps) {
    status = ACADEMY_CERTIFICATION_STATUSES.READY_FOR_FIELD_REVIEW;
  } else if (completed > 0) {
    status = ACADEMY_CERTIFICATION_STATUSES.IN_PROGRESS;
  }

  return {
    status,
    percentage,
    completedSteps: completed,
    totalSteps,
    completedLessonCount: completedLessons,
    requiredLessonCount: requiredLessonIds.length,
    completedModuleQuizCount: completedModuleQuizzes,
    requiredModuleQuizCount: requiredModuleQuizIds.length,
    readyForFieldReview: status === ACADEMY_CERTIFICATION_STATUSES.READY_FOR_FIELD_REVIEW,
    certified: status === ACADEMY_CERTIFICATION_STATUSES.CERTIFIED,
  };
}

export function buildAcademyPilotTrainingRecord({
  pilot = {},
  modules = academySeedModules,
  completedLessonIds = [],
  passedModuleQuizIds = [],
  fieldReviewPassed = false,
  now = new Date(),
} = {}) {
  const certification = computeAcademyCertification({ modules, completedLessonIds, passedModuleQuizIds, fieldReviewPassed });
  const credentials = Array.isArray(pilot.credentials) ? pilot.credentials : [];
  const currentCredentials = credentials.filter((credential) => {
    if (!credential || credential.status !== "verified") return false;
    if (!credential.expiresAt) return true;
    return new Date(credential.expiresAt).getTime() >= now.getTime();
  });
  const practicalEvaluations = Array.isArray(pilot.practicalEvaluations) ? pilot.practicalEvaluations : [];
  const fieldReviewComplete = fieldReviewPassed || practicalEvaluations.some((evaluation) => evaluation.status === "passed");
  const trainingComplete = certification.readyForFieldReview || certification.certified;
  const blockers = [];

  if (!trainingComplete) {
    blockers.push("Academy training path is not complete");
  }

  if (currentCredentials.length === 0) {
    blockers.push("No current verified pilot credentials linked");
  }

  if (trainingComplete && !fieldReviewComplete) {
    blockers.push("Field review has not been completed");
  }

  return {
    pilotId: pilot.id || pilot.operatorId || "unassigned",
    pilotName: pilot.name || pilot.full_name || pilot.email || "Unassigned pilot",
    pilotRole: pilot.role || "Operator",
    state: pilot.state || null,
    certificationStatus: certification.certified
      ? ACADEMY_CERTIFICATION_STATUSES.CERTIFIED
      : certification.readyForFieldReview
        ? ACADEMY_CERTIFICATION_STATUSES.READY_FOR_FIELD_REVIEW
        : certification.status,
    trainingProgressPct: certification.percentage,
    completedLessonCount: certification.completedLessonCount,
    requiredLessonCount: certification.requiredLessonCount,
    completedModuleQuizCount: certification.completedModuleQuizCount,
    requiredModuleQuizCount: certification.requiredModuleQuizCount,
    trainingComplete,
    readyForFieldReview: certification.readyForFieldReview,
    fieldReviewComplete,
    credentialCount: currentCredentials.length,
    availableForAssignmentReview: blockers.length === 0,
    blockers,
    completedLessonIds,
    passedModuleQuizIds,
    updatedAt: now.toISOString(),
  };
}

export function buildAcademyTrainingTranscript({
  pilot = {},
  modules = academySeedModules,
  completedLessonIds = [],
  passedModuleQuizIds = [],
  moduleQuizResults = {},
  fieldReviewPassed = false,
  now = new Date(),
} = {}) {
  let priorModulesComplete = true;
  const moduleRecords = modules.map((module) => {
    const progress = getAcademyModuleProgress(module, { completedLessonIds, passedModuleQuizIds });
    const quizResult = moduleQuizResults[module.id] || {};
    const quizScore = scoreAcademyModuleQuiz(module, quizResult.answers || {});
    const locked = !priorModulesComplete;
    const status = locked
      ? "Locked"
      : progress.complete
        ? "Passed"
        : progress.completedLessons === 0
          ? "Not Started"
          : progress.nextLesson
            ? "In Progress"
            : progress.quizRequired && !progress.quizPassed
              ? "Quiz Required"
              : "In Progress";
    const nextAction = locked
      ? "Complete the previous module first"
      : progress.nextLesson
        ? `Continue lesson: ${progress.nextLesson.title}`
        : progress.quizRequired && !progress.quizPassed
          ? "Pass the module quiz"
          : "Module complete";

    priorModulesComplete = progress.complete;

    return {
      moduleId: module.id,
      slug: module.slug,
      title: module.title,
      category: module.category,
      status,
      locked,
      nextAction,
      percentage: progress.percentage,
      completedLessons: progress.completedLessons,
      totalLessons: progress.totalLessons,
      quizRequired: progress.quizRequired,
      quizPassed: progress.quizPassed,
      quizScorePct: quizResult.attemptedAt ? quizScore.percentage : null,
      quizAttemptCount: Array.isArray(quizResult.attempts) ? quizResult.attempts.length : quizResult.attemptedAt ? 1 : 0,
      passedAt: quizResult.passedAt || null,
      nextLessonId: progress.nextLesson?.id || null,
    };
  });
  const currentModule = moduleRecords.find((module) => !module.locked && module.status !== "Passed") || moduleRecords[moduleRecords.length - 1] || null;
  const certification = computeAcademyCertification({ modules, completedLessonIds, passedModuleQuizIds, fieldReviewPassed });
  const pilotRecord = buildAcademyPilotTrainingRecord({
    pilot,
    modules,
    completedLessonIds,
    passedModuleQuizIds,
    fieldReviewPassed,
    now,
  });

  return {
    pilotId: pilotRecord.pilotId,
    pilotName: pilotRecord.pilotName,
    generatedAt: now.toISOString(),
    certification,
    pilotRecord,
    modules: moduleRecords,
    currentModule,
    nextAction: currentModule?.nextAction || "Training complete",
    passedModuleCount: moduleRecords.filter((module) => module.status === "Passed").length,
    totalModuleCount: moduleRecords.length,
    allModulesPassed: moduleRecords.length > 0 && moduleRecords.every((module) => module.status === "Passed"),
  };
}

export function getAcademyCategoryCounts(modules = academySeedModules) {
  return modules.reduce((counts, module) => {
    counts[module.category] = (counts[module.category] || 0) + 1;
    return counts;
  }, {});
}

export function getAcademyResources(modules = academySeedModules) {
  return modules
    .flatMap((module) => module.resources.map((resource) => ({ ...resource, moduleTitle: module.title, moduleId: module.id })))
    .sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title));
}
