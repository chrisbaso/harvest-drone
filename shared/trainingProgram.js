export const QUALIFICATION_LEVELS = {
  OBSERVER: "OBSERVER",
  TRAINEE: "TRAINEE",
  QUALIFIED_OPERATOR: "QUALIFIED_OPERATOR",
  LEAD_OPERATOR: "LEAD_OPERATOR",
  CHIEF_PILOT_OR_ADMIN: "CHIEF_PILOT_OR_ADMIN",
};

export const CREDENTIAL_TYPES = {
  FAA_PART_107: "FAA_PART_107",
  FAA_PART_107_RECENCY: "FAA_PART_107_RECENCY",
  FAA_PART_137_AAOC: "FAA_PART_137_AAOC",
  FAA_44807_EXEMPTION: "FAA_44807_EXEMPTION",
  DRONE_REGISTRATION: "DRONE_REGISTRATION",
  REMOTE_ID: "REMOTE_ID",
  PESTICIDE_APPLICATOR_LICENSE: "PESTICIDE_APPLICATOR_LICENSE",
  MEDICAL_CERTIFICATE: "MEDICAL_CERTIFICATE",
  INSURANCE: "INSURANCE",
  HYLIO_ONBOARDING: "HYLIO_ONBOARDING",
  HARVEST_INTERNAL_QUALIFICATION: "HARVEST_INTERNAL_QUALIFICATION",
  OTHER: "OTHER",
};

export const LESSON_TYPES = {
  ARTICLE: "article",
  VIDEO: "video",
  EXTERNAL_LINK: "external_link",
  CHECKLIST: "checklist",
  SCENARIO: "scenario",
  FILE_DOWNLOAD: "file_download",
};

export const trainingCourses = [
  {
    slug: "hylio-operator-foundations",
    title: "Hylio Operator Foundations",
    audience: "Operators, leads, compliance admins",
    status: "published",
    estimatedDurationMinutes: 420,
    description:
      "Harvest-authored foundation course for operators preparing to work inside the Hylio / AgroSol job flow.",
    modules: [
      {
        slug: "operating-model",
        title: "Harvest Drone operating model and safety culture",
        lessons: [
          {
            id: "hylio-foundations-operating-model",
            title: "Harvest Drone operating model",
            type: LESSON_TYPES.ARTICLE,
            required: true,
            officialMaterialRequired: false,
            minutes: 18,
            content:
              "Harvest-qualified operators are expected to stop work when legal, aircraft, weather, chemical, or site conditions are not ready. This lesson frames training as an operating gate, not a one-time content library.",
          },
        ],
      },
      {
        slug: "compliance-foundations",
        title: "Compliance foundations: Part 107, Part 137, 44807, Remote ID, pesticide licensing",
        lessons: [
          {
            id: "hylio-foundations-compliance",
            title: "Compliance foundations",
            type: LESSON_TYPES.ARTICLE,
            required: true,
            minutes: 40,
            officialMaterialRequired: true,
            officialLink: "https://www.hyl.io/faa-information",
            content:
              "Review the operating documents that may apply to agricultural UAS work. Harvest OS tracks readiness and internal qualification only; FAA, state, tribal, territorial, and insurance requirements must be verified from current sources.",
          },
        ],
        assessmentId: "compliance-foundations",
      },
      {
        slug: "hylio-hardware-groundlink",
        title: "Hylio hardware, GroundLink, and aircraft overview",
        lessons: [
          {
            id: "hylio-foundations-hardware",
            title: "Aircraft and GroundLink overview",
            type: LESSON_TYPES.EXTERNAL_LINK,
            required: true,
            minutes: 35,
            officialMaterialRequired: true,
            officialLink: "https://www.hyl.io/learn",
            content:
              "Use official Hylio materials for hardware handling and maintenance specifics. Harvest adds job-readiness expectations, evidence capture, and supervisor signoff requirements.",
          },
        ],
      },
      {
        slug: "agrosol-mission-planning",
        title: "AgroSol mission planning workflow",
        lessons: [
          {
            id: "hylio-foundations-agrosol",
            title: "AgroSol treatment plan workflow",
            type: LESSON_TYPES.SCENARIO,
            required: true,
            minutes: 45,
            officialMaterialRequired: true,
            officialLink: "https://www.hyl.io/agrosolgcs",
            content:
              "Practice translating a Harvest job into a bounded field plan: field boundary, obstacles, payload type, rate, altitude, speed, swath, flight angle, caution zones, and application-data review.",
          },
        ],
        assessmentId: "agrosol-mission-planning",
      },
      {
        slug: "field-safety",
        title: "Field safety, site survey, obstacles, bystanders, roads, livestock, utilities",
        lessons: [
          {
            id: "hylio-foundations-field-safety",
            title: "Site survey and stop-work criteria",
            type: LESSON_TYPES.CHECKLIST,
            required: true,
            minutes: 35,
            checklistSlug: "drift-weather-review",
            content:
              "Walk the site before operations. Confirm people, animals, roads, buildings, utilities, water, neighboring fields, and access routes are accounted for before launch.",
          },
        ],
      },
      {
        slug: "weather-drift",
        title: "Weather, wind, drift, inversions, abort criteria",
        lessons: [
          {
            id: "hylio-foundations-weather-drift",
            title: "Weather and drift review",
            type: LESSON_TYPES.ARTICLE,
            required: true,
            minutes: 30,
            content:
              "Operators must verify wind, temperature, inversion risk, label constraints, neighboring sensitive areas, and Harvest abort criteria before starting or resuming application.",
          },
        ],
      },
      {
        slug: "chemical-handling",
        title: "Chemical label, PPE, mixing/loading, spill response",
        lessons: [
          {
            id: "hylio-foundations-chemical-handling",
            title: "Chemical handling and label discipline",
            type: LESSON_TYPES.CHECKLIST,
            required: true,
            minutes: 38,
            checklistSlug: "chemical-mixing-loading",
            content:
              "Harvest SOPs require label review, PPE confirmation, mixing/loading controls, spill kit readiness, rinse/cleanup plan, and application record capture.",
          },
        ],
      },
      {
        slug: "battery-safety",
        title: "Batteries, charging, transport, and fire response",
        lessons: [
          {
            id: "hylio-foundations-batteries",
            title: "Battery handling refresh",
            type: LESSON_TYPES.CHECKLIST,
            required: true,
            minutes: 30,
            checklistSlug: "battery-handling",
            content:
              "Inspect, charge, transport, stage, and quarantine batteries under Harvest SOPs and manufacturer guidance. Damaged or abnormal batteries block assignment.",
          },
        ],
      },
      {
        slug: "maintenance-logs",
        title: "Maintenance, calibration, cleaning, and logs",
        lessons: [
          {
            id: "hylio-foundations-maintenance",
            title: "Maintenance and calibration logs",
            type: LESSON_TYPES.ARTICLE,
            required: true,
            minutes: 32,
            content:
              "Each aircraft and payload configuration needs inspection, calibration evidence, cleaning logs, and maintenance status before being cleared for a Harvest job.",
          },
        ],
      },
      {
        slug: "emergency-procedures",
        title: "Emergency procedures: lost link, flyaway, manual override, emergency landing",
        lessons: [
          {
            id: "hylio-foundations-emergency-procedures",
            title: "Abnormal and emergency events",
            type: LESSON_TYPES.SCENARIO,
            required: true,
            minutes: 45,
            checklistSlug: "emergency-response",
            content:
              "Operators must know when to pause, abort, land, isolate an area, notify a supervisor, preserve logs, and trigger incident-based retraining.",
          },
        ],
        assessmentId: "emergency-procedures",
      },
      {
        slug: "harvest-job-workflow",
        title: "Harvest job workflow: intake, readiness, application records, postflight, closeout",
        lessons: [
          {
            id: "hylio-foundations-job-workflow",
            title: "From intake to closeout",
            type: LESSON_TYPES.ARTICLE,
            required: true,
            minutes: 35,
            content:
              "Harvest work flows from grower intake to field plan, readiness check, application, records, billing/support, and recurrent review triggers.",
          },
        ],
      },
      {
        slug: "final-assessment",
        title: "Final knowledge assessment",
        lessons: [
          {
            id: "hylio-foundations-final-assessment",
            title: "Foundations completion review",
            type: LESSON_TYPES.ARTICLE,
            required: true,
            minutes: 15,
            content:
              "Confirm that all required lessons, assessments, credentials, and practical signoff requests are complete before moving into supervised field work.",
          },
        ],
      },
    ],
  },
  {
    slug: "hylio-practical-qualification",
    title: "Hylio Practical Qualification",
    audience: "Trainees, lead operators, chief pilots",
    status: "published",
    estimatedDurationMinutes: 360,
    description:
      "Hands-on practicum templates for lead operator signoff before responsible Hylio job assignment.",
    modules: [
      "Equipment unload and setup",
      "Preflight checklist",
      "AgroSol dry-run mission",
      "Spray/spreader system inspection",
      "Supervised flight",
      "Refill workflow",
      "Postflight cleaning and logs",
      "Lead operator signoff",
    ].map((title, index) => ({
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      title,
      lessons: [
        {
          id: `hylio-practical-${index + 1}`,
          title,
          type: index === 1 ? LESSON_TYPES.CHECKLIST : LESSON_TYPES.ARTICLE,
          required: true,
          minutes: 45,
          checklistSlug: index === 1 ? "preflight" : index === 6 ? "postflight" : undefined,
          content:
            "Complete this task under direct supervision. Evidence and notes should be attached to the practical rubric before a lead operator signs the item.",
        },
      ],
    })),
  },
  {
    slug: "hylio-recurrent-training",
    title: "Hylio Recurrent Training",
    audience: "Qualified operators and leads",
    status: "published",
    estimatedDurationMinutes: 150,
    description:
      "Annual, incident-triggered, and change-triggered refreshers for active Hylio operators.",
    modules: ["Safety refresh", "Battery refresh", "Compliance refresh", "Incident learnings", "SOP changes", "Recurrent quiz"].map(
      (title, index) => ({
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        title,
        lessons: [
          {
            id: `hylio-recurrent-${index + 1}`,
            title,
            type: index === 5 ? LESSON_TYPES.SCENARIO : LESSON_TYPES.ARTICLE,
            required: true,
            minutes: 25,
            content:
              "Review current Harvest SOPs, recent incidents or near misses, and any Hylio software, firmware, aircraft, or payload changes before returning to active assignment.",
          },
        ],
      }),
    ),
  },
];

export const assessments = [
  {
    id: "compliance-foundations",
    title: "Compliance Foundations Quiz",
    passingScore: 80,
    retakesAllowed: true,
    questions: [
      {
        id: "cf-1",
        type: "multiple_choice",
        prompt: "What should Harvest OS say about FAA or state certifications?",
        choices: [
          "Harvest OS issues FAA certification after training completion",
          "Harvest OS tracks uploaded credentials and internal readiness",
          "Harvest OS replaces state pesticide licensing",
          "Harvest OS verifies all legal requirements automatically",
        ],
        correctChoice: 1,
        explanation:
          "The system tracks readiness and internal qualification. It must not claim to issue FAA, state, or pesticide certifications.",
      },
      {
        id: "cf-2",
        type: "true_false",
        prompt: "Pesticide applicator rules should be configurable by state, category, and operation type.",
        choices: ["True", "False"],
        correctChoice: 0,
        explanation:
          "States, territories, and tribes administer certification/recertification, so Harvest rules need configuration.",
      },
      {
        id: "cf-3",
        type: "multiple_choice",
        prompt: "Which item should be tracked for registered drones that must comply with FAA Remote ID rules?",
        choices: ["Remote ID readiness", "Favorite field boundary color", "Fuel tax form", "Customer invoice terms"],
        correctChoice: 0,
        explanation: "Remote ID readiness is a safety and compliance gate for many registered drones.",
      },
    ],
  },
  {
    id: "agrosol-mission-planning",
    title: "AgroSol Mission Planning Scenario Quiz",
    passingScore: 80,
    retakesAllowed: true,
    questions: [
      {
        id: "ag-1",
        type: "scenario",
        prompt:
          "A field boundary is drawn, but a power line and road are not marked. What is the best next step before the plan is released?",
        choices: [
          "Launch and watch carefully",
          "Mark obstacles/caution zones and rerun the preflight review",
          "Skip the site survey because the grower approved the field",
          "Assign the job to a trainee",
        ],
        correctChoice: 1,
        explanation: "Obstacle and bystander controls belong in the plan before launch.",
      },
      {
        id: "ag-2",
        type: "multiple_choice",
        prompt: "Which planning fields should be reviewed for a spray mission?",
        choices: [
          "Altitude, speed, swath, rate, flight angle, boundaries, and caution zones",
          "Only customer name and invoice amount",
          "Only acreage and county",
          "Only drone nickname",
        ],
        correctChoice: 0,
        explanation: "The mission plan must reflect the field, payload, and application constraints.",
      },
    ],
  },
  {
    id: "emergency-procedures",
    title: "Emergency Procedures Quiz",
    passingScore: 80,
    retakesAllowed: true,
    questions: [
      {
        id: "ep-1",
        type: "scenario",
        prompt: "During a mission the operator loses confidence in aircraft state. What should happen?",
        choices: [
          "Continue to preserve schedule",
          "Pause or abort according to SOP and notify the lead/chief pilot as required",
          "Turn off recordkeeping",
          "Ask the grower to decide",
        ],
        correctChoice: 1,
        explanation: "Stop-work authority and emergency SOPs take priority over schedule pressure.",
      },
      {
        id: "ep-2",
        type: "true_false",
        prompt: "An incident, near miss, spill, flyaway, complaint, or equipment damage can trigger retraining.",
        choices: ["True", "False"],
        correctChoice: 0,
        explanation: "Incident-triggered retraining keeps qualification current after abnormal events.",
      },
    ],
  },
];

export const practicalEvaluationTemplates = [
  "Hylio equipment setup",
  "Hylio preflight",
  "AgroSol mission planning",
  "Dry run",
  "Supervised live operation",
  "Postflight and recordkeeping",
  "Emergency procedure verbal check",
].map((title, index) => ({
  id: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  title,
  items: [
    {
      id: `rubric-${index + 1}-1`,
      label: "Explains the task objective and applicable stop-work criteria",
      required: true,
    },
    {
      id: `rubric-${index + 1}-2`,
      label: "Performs the task without unsafe shortcuts",
      required: true,
    },
    {
      id: `rubric-${index + 1}-3`,
      label: "Captures evidence, notes, and recordkeeping artifacts",
      required: true,
    },
  ],
}));

export const checklistTemplates = [
  {
    slug: "preflight",
    title: "Hylio Preflight Checklist",
    items: [
      "Aircraft, payload, props, arms, fasteners, and spray/spreader components inspected",
      "Batteries inspected, staged, and within operating limits",
      "GroundLink/controller and AgroSol plan verified",
      "Field boundary, obstacles, people, animals, roads, and utilities reviewed",
      "Abort criteria and emergency landing area briefed",
    ],
  },
  {
    slug: "postflight",
    title: "Hylio Postflight Checklist",
    items: [
      "Aircraft powered down and inspected",
      "Application data reviewed and attached to job record",
      "Cleaning, rinse, and disposal steps completed per label/SOP",
      "Maintenance issues logged and blockers created if needed",
      "Customer/job closeout notes completed",
    ],
  },
  {
    slug: "battery-handling",
    title: "Battery Handling SOP",
    items: [
      "Battery exterior and connectors inspected",
      "Charging area clear and monitored",
      "Transport/storage container appropriate",
      "Damaged, hot, swollen, or abnormal batteries quarantined",
      "Fire response equipment location confirmed",
    ],
  },
  {
    slug: "chemical-mixing-loading",
    title: "Chemical Mixing and Loading SOP",
    items: [
      "Current product label reviewed",
      "PPE confirmed before handling",
      "Mix/load area and spill kit ready",
      "Tank/refill process documented",
      "Application record fields ready for closeout",
    ],
  },
  {
    slug: "emergency-response",
    title: "Emergency Response SOP",
    items: [
      "Emergency landing areas identified",
      "Lost link, flyaway, spill, and bystander response reviewed",
      "Lead/chief pilot notification path confirmed",
      "Logs and evidence preservation understood",
      "Incident-triggered retraining rule acknowledged",
    ],
  },
  {
    slug: "drift-weather-review",
    title: "Drift and Weather Review",
    items: [
      "Wind, gusts, temperature, and inversion risk checked",
      "Sensitive areas and neighboring crops reviewed",
      "Label weather/application restrictions confirmed",
      "No-spray/caution zones marked",
      "Weather acknowledgement attached to job",
    ],
  },
].map((checklist) => ({
  ...checklist,
  items: checklist.items.map((label, index) => ({
    id: `${checklist.slug}-${index + 1}`,
    label,
    required: true,
  })),
}));

export const demoOperators = [
  {
    id: "operator-ada",
    name: "Ada Miller",
    role: "Lead Operator",
    state: "Arkansas",
    aircraftModels: ["Hylio AG-272"],
    payloadTypes: ["liquid", "granular"],
    completedLessons: [
      "hylio-foundations-operating-model",
      "hylio-foundations-compliance",
      "hylio-foundations-hardware",
      "hylio-foundations-agrosol",
      "hylio-foundations-field-safety",
      "hylio-foundations-weather-drift",
      "hylio-foundations-chemical-handling",
      "hylio-foundations-batteries",
      "hylio-foundations-maintenance",
      "hylio-foundations-emergency-procedures",
      "hylio-foundations-job-workflow",
      "hylio-foundations-final-assessment",
    ],
    assessmentAttempts: [
      { assessmentId: "compliance-foundations", score: 100, passed: true, attemptedAt: "2026-03-12" },
      { assessmentId: "agrosol-mission-planning", score: 100, passed: true, attemptedAt: "2026-03-13" },
      { assessmentId: "emergency-procedures", score: 100, passed: true, attemptedAt: "2026-03-14" },
    ],
    practicalEvaluations: practicalEvaluationTemplates.map((template) => ({
      templateId: template.id,
      status: "passed",
      evaluatorRole: "Chief Pilot",
      signedAt: "2026-03-20",
    })),
    credentials: [
      { type: CREDENTIAL_TYPES.FAA_PART_107, status: "verified", expiresAt: "2027-03-01" },
      { type: CREDENTIAL_TYPES.FAA_PART_107_RECENCY, status: "verified", expiresAt: "2027-03-01" },
      { type: CREDENTIAL_TYPES.PESTICIDE_APPLICATOR_LICENSE, status: "verified", state: "Arkansas", category: "Aerial", expiresAt: "2027-12-31" },
      { type: CREDENTIAL_TYPES.REMOTE_ID, status: "verified", aircraftModel: "Hylio AG-272" },
      { type: CREDENTIAL_TYPES.HYLIO_ONBOARDING, status: "verified", expiresAt: "2027-03-20" },
      { type: CREDENTIAL_TYPES.HARVEST_INTERNAL_QUALIFICATION, status: "verified", expiresAt: "2027-03-20" },
    ],
  },
  {
    id: "operator-beau",
    name: "Beau Carter",
    role: "Trainee",
    state: "Arkansas",
    aircraftModels: ["Hylio AG-272"],
    payloadTypes: ["liquid"],
    completedLessons: ["hylio-foundations-operating-model", "hylio-foundations-compliance"],
    assessmentAttempts: [{ assessmentId: "compliance-foundations", score: 67, passed: false, attemptedAt: "2026-04-08" }],
    practicalEvaluations: [],
    credentials: [
      { type: CREDENTIAL_TYPES.FAA_PART_107, status: "verified", expiresAt: "2027-01-15" },
      { type: CREDENTIAL_TYPES.PESTICIDE_APPLICATOR_LICENSE, status: "missing", state: "Arkansas" },
      { type: CREDENTIAL_TYPES.HARVEST_INTERNAL_QUALIFICATION, status: "expired", expiresAt: "2026-04-16" },
    ],
  },
];

export const demoHylioJob = {
  id: "1842",
  title: "Rice fungicide application",
  state: "Arkansas",
  operationType: "pesticide_application",
  aircraftModel: "Hylio AG-272",
  payloadType: "liquid",
  requiresMedical: false,
  aircraft: {
    status: "active",
    registrationStatus: "verified",
    remoteIdStatus: "verified",
    maintenanceBlocked: false,
  },
  requiredChecklistSlugs: ["preflight", "drift-weather-review", "chemical-mixing-loading"],
  completedChecklistSlugs: ["drift-weather-review"],
  documentsAttached: true,
  weatherAcknowledged: true,
  priorRecordsOverdue: false,
};

export function flattenLessons(courses = trainingCourses) {
  return courses.flatMap((course) =>
    course.modules.flatMap((module, moduleIndex) =>
      module.lessons.map((lesson, lessonIndex) => ({
        ...lesson,
        courseSlug: course.slug,
        courseTitle: course.title,
        moduleSlug: module.slug,
        moduleTitle: module.title,
        order: moduleIndex * 100 + lessonIndex,
      })),
    ),
  );
}

export function findCourse(slug) {
  return trainingCourses.find((course) => course.slug === slug);
}

export function findLesson(id) {
  return flattenLessons().find((lesson) => lesson.id === id);
}

export function findAssessment(id) {
  return assessments.find((assessment) => assessment.id === id);
}

export function scoreAssessment(assessment, answers) {
  const total = assessment.questions.length || 1;
  const correct = assessment.questions.filter((question) => Number(answers[question.id]) === question.correctChoice).length;
  const score = Math.round((correct / total) * 100);

  return {
    correct,
    total,
    score,
    passed: score >= assessment.passingScore,
  };
}

export function isExpired(dateValue, now = new Date()) {
  if (!dateValue) {
    return false;
  }

  const expiration = new Date(dateValue);
  expiration.setHours(23, 59, 59, 999);
  return expiration.getTime() < now.getTime();
}

export function normalizeCredentialStatus(credential, now = new Date()) {
  if (!credential || credential.status === "missing") {
    return "missing";
  }

  if (isExpired(credential.expiresAt, now)) {
    return "expired";
  }

  return credential.status || "pending_review";
}

export function getLatestAttempt(operator, assessmentId) {
  return [...(operator.assessmentAttempts || [])]
    .filter((attempt) => attempt.assessmentId === assessmentId)
    .sort((a, b) => new Date(b.attemptedAt || 0).getTime() - new Date(a.attemptedAt || 0).getTime())[0];
}

export function getCourseProgress(operator, course) {
  const requiredLessons = course.modules.flatMap((module) => module.lessons).filter((lesson) => lesson.required);
  const completed = requiredLessons.filter((lesson) => (operator.completedLessons || []).includes(lesson.id)).length;
  const percentage = requiredLessons.length ? Math.round((completed / requiredLessons.length) * 100) : 0;
  const nextLesson = requiredLessons.find((lesson) => !(operator.completedLessons || []).includes(lesson.id));

  return {
    completed,
    total: requiredLessons.length,
    percentage,
    nextLesson,
  };
}

export function getCredential(operator, type, criteria = {}, now = new Date()) {
  return (operator.credentials || []).find((credential) => {
    const typeMatch = credential.type === type;
    const stateMatch = !criteria.state || !credential.state || credential.state === criteria.state;
    const payloadMatch = !criteria.payloadType || !credential.payloadType || credential.payloadType === criteria.payloadType;
    const modelMatch = !criteria.aircraftModel || !credential.aircraftModel || credential.aircraftModel === criteria.aircraftModel;

    return typeMatch && stateMatch && payloadMatch && modelMatch && normalizeCredentialStatus(credential, now) === "verified";
  });
}

export function canSignPracticalEvaluation(roleOrLevel) {
  return ["Lead Operator", "Chief Pilot", "Admin", "Compliance Admin", QUALIFICATION_LEVELS.LEAD_OPERATOR, QUALIFICATION_LEVELS.CHIEF_PILOT_OR_ADMIN].includes(roleOrLevel);
}

export function hasAllPracticalSignoffs(operator) {
  return practicalEvaluationTemplates.every((template) =>
    (operator.practicalEvaluations || []).some((evaluation) => evaluation.templateId === template.id && evaluation.status === "passed"),
  );
}

export function computeOperatorQualification(operator, now = new Date()) {
  const foundations = findCourse("hylio-operator-foundations");
  const foundationProgress = getCourseProgress(operator, foundations);
  const requiredAssessmentsPassed = assessments.every((assessment) => getLatestAttempt(operator, assessment.id)?.passed);
  const part107Ready = Boolean(getCredential(operator, CREDENTIAL_TYPES.FAA_PART_107, {}, now));
  const harvestReady = Boolean(getCredential(operator, CREDENTIAL_TYPES.HARVEST_INTERNAL_QUALIFICATION, {}, now));
  const hylioReady = Boolean(getCredential(operator, CREDENTIAL_TYPES.HYLIO_ONBOARDING, {}, now));
  const practicalReady = hasAllPracticalSignoffs(operator);

  if (operator.role === "Chief Pilot" || operator.role === "Admin" || operator.role === "Compliance Admin") {
    return QUALIFICATION_LEVELS.CHIEF_PILOT_OR_ADMIN;
  }

  if (operator.role === "Lead Operator" && foundationProgress.percentage === 100 && requiredAssessmentsPassed && practicalReady) {
    return QUALIFICATION_LEVELS.LEAD_OPERATOR;
  }

  if (foundationProgress.percentage === 100 && requiredAssessmentsPassed && practicalReady && part107Ready && harvestReady && hylioReady) {
    return QUALIFICATION_LEVELS.QUALIFIED_OPERATOR;
  }

  if (foundationProgress.percentage > 0 || part107Ready) {
    return QUALIFICATION_LEVELS.TRAINEE;
  }

  return QUALIFICATION_LEVELS.OBSERVER;
}

export function computeHylioJobReadiness({ operator, job = demoHylioJob, now = new Date() }) {
  const blockers = [];
  const warnings = [];
  const foundations = findCourse("hylio-operator-foundations");
  const foundationProgress = getCourseProgress(operator, foundations);

  if (foundationProgress.percentage < 100) {
    blockers.push(`Hylio Operator Foundations is ${foundationProgress.percentage}% complete`);
  }

  assessments.forEach((assessment) => {
    if (!getLatestAttempt(operator, assessment.id)?.passed) {
      blockers.push(`${assessment.title} has not been passed`);
    }
  });

  if (!hasAllPracticalSignoffs(operator)) {
    blockers.push("Hylio practical evaluation is not fully signed by a Lead Operator or Chief Pilot");
  }

  if (!getCredential(operator, CREDENTIAL_TYPES.FAA_PART_107, {}, now)) {
    blockers.push("FAA Part 107 credential is missing, pending, rejected, or expired");
  }

  if (!getCredential(operator, CREDENTIAL_TYPES.FAA_PART_107_RECENCY, {}, now)) {
    blockers.push("Part 107 recency is missing or expired");
  }

  if (job.operationType === "pesticide_application" && !getCredential(operator, CREDENTIAL_TYPES.PESTICIDE_APPLICATOR_LICENSE, { state: job.state }, now)) {
    blockers.push(`Pesticide applicator license for ${job.state} is missing or not verified`);
  }

  if (job.requiresMedical && !getCredential(operator, CREDENTIAL_TYPES.MEDICAL_CERTIFICATE, {}, now)) {
    blockers.push("Medical certificate is required for this operating profile and is not verified");
  }

  if (!getCredential(operator, CREDENTIAL_TYPES.HYLIO_ONBOARDING, {}, now)) {
    blockers.push("Hylio onboarding/training completion is not verified");
  }

  if (!getCredential(operator, CREDENTIAL_TYPES.HARVEST_INTERNAL_QUALIFICATION, {}, now)) {
    blockers.push("Harvest internal qualification is missing or expired");
  }

  if (!operator.aircraftModels?.includes(job.aircraftModel)) {
    blockers.push(`Operator is not qualified for ${job.aircraftModel}`);
  }

  if (!operator.payloadTypes?.includes(job.payloadType)) {
    blockers.push(`Operator is not qualified for ${job.payloadType} payload work`);
  }

  if (job.aircraft?.status !== "active") {
    blockers.push("Aircraft is not active");
  }

  if (job.aircraft?.registrationStatus !== "verified") {
    blockers.push("Aircraft registration is not verified");
  }

  if (job.aircraft?.remoteIdStatus !== "verified") {
    blockers.push("Aircraft Remote ID readiness is not verified");
  }

  if (job.aircraft?.maintenanceBlocked) {
    blockers.push("Aircraft has an open maintenance blocker");
  }

  const incompleteChecklists = (job.requiredChecklistSlugs || []).filter((slug) => !(job.completedChecklistSlugs || []).includes(slug));
  if (incompleteChecklists.length) {
    warnings.push(`Required SOP checklist pending: ${incompleteChecklists.join(", ")}`);
  }

  if (!job.documentsAttached) {
    warnings.push("Required job documents are not attached");
  }

  if (!job.weatherAcknowledged) {
    blockers.push("Weather/drift precheck has not been acknowledged");
  }

  if (job.priorRecordsOverdue) {
    blockers.push("Postflight/application records from prior jobs are overdue");
  }

  return {
    ready: blockers.length === 0,
    level: computeOperatorQualification(operator, now),
    blockers,
    warnings,
  };
}

export function getExpiringCredentials(operator, now = new Date(), days = 45) {
  const limit = new Date(now);
  limit.setDate(limit.getDate() + days);

  return (operator.credentials || []).filter((credential) => {
    if (!credential.expiresAt) {
      return false;
    }

    const expiresAt = new Date(credential.expiresAt);
    return expiresAt >= now && expiresAt <= limit;
  });
}
