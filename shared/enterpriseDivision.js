import {
  CREDENTIAL_TYPES,
  assessments,
  checklistTemplates,
  computeHylioJobReadiness,
  flattenLessons,
  practicalEvaluationTemplates,
  trainingCourses,
} from "./trainingProgram.js";

const foundationLessonIds = flattenLessons(trainingCourses)
  .filter((lesson) => lesson.courseSlug === "hylio-operator-foundations" && lesson.required)
  .map((lesson) => lesson.id);

const passedAssessments = assessments.map((assessment) => ({
  assessmentId: assessment.id,
  score: 92,
  passed: true,
  attemptedAt: "2026-04-18",
}));

const passedPracticals = practicalEvaluationTemplates.map((template) => ({
  templateId: template.id,
  status: "passed",
  evaluator: "Lead operator signoff",
  evaluatedAt: "2026-04-22",
}));

function credential(type, overrides = {}) {
  return {
    id: `${type.toLowerCase()}-${overrides.state || "global"}`,
    type,
    status: "verified",
    verifiedAt: "2026-04-15",
    expiresAt: "2027-04-15",
    ...overrides,
  };
}

export const rdoEnterpriseDemo = {
  organization: {
    id: "rdo",
    name: "R.D. Offutt Farms",
    shortName: "RDO",
    type: "enterprise_grower",
    headquarters: "Fargo, North Dakota",
    operatingStates: ["North Dakota", "Minnesota"],
    ownerPositioning:
      "RDO owns the internal drone application capability. Harvest provides implementation, OS, training workflow, support, maintenance process, and operating assistance.",
    division: {
      id: "rdo-division",
      name: "RDO Hylio Drone Application Division",
      cropFocus: "Potatoes",
      operatingModel: "Internal enterprise drone division with Harvest implementation support",
      aircraftFamily: "Hylio aircraft",
      status: "Implementation sprint",
      readinessTargetDate: "2026-05-20",
    },
  },
  blueprint: {
    id: "rdo-blueprint-2026",
    phase: "Readiness validation",
    steps: [
      { id: "discovery", title: "Division design", status: "complete", owner: "Harvest + RDO operations" },
      { id: "equipment", title: "Aircraft, payload, batteries, trailer, and spares plan", status: "complete", owner: "RDO equipment lead" },
      { id: "training", title: "Operator training and Harvest qualification workflow", status: "in_progress", owner: "Harvest training lead" },
      { id: "sops", title: "State-aware SOPs and checklists", status: "in_progress", owner: "RDO compliance" },
      { id: "calendar", title: "Potato spray calendar and dispatch readiness", status: "active", owner: "RDO crop managers" },
      { id: "reporting", title: "Application records, maintenance, ROI reporting", status: "queued", owner: "Harvest success" },
    ],
  },
  farmLocations: [
    { id: "farm-grand-forks", name: "Grand Forks Valley Unit", state: "North Dakota", county: "Grand Forks" },
    { id: "farm-park-rapids", name: "Park Rapids Unit", state: "Minnesota", county: "Hubbard" },
  ],
  fields: [
    { id: "field-gf-12", locationId: "farm-grand-forks", name: "GF Potato 12", acres: 128, crop: "Potatoes" },
    { id: "field-gf-18", locationId: "farm-grand-forks", name: "GF Potato 18", acres: 96, crop: "Potatoes" },
    { id: "field-pr-7", locationId: "farm-park-rapids", name: "PR Potato 7", acres: 112, crop: "Potatoes" },
  ],
  cropSeasons: [
    { id: "season-2026-potatoes", crop: "Potatoes", year: 2026, stage: "In-season foliar program" },
  ],
  complianceRules: [
    {
      id: "nd-potato-pesticide",
      state: "North Dakota",
      operationType: "pesticide_application",
      payloadType: "liquid",
      requiredCredentialTypes: [CREDENTIAL_TYPES.PESTICIDE_APPLICATOR_LICENSE],
      categoryLabel: "State/category pesticide applicator credential tracked and verified",
    },
    {
      id: "mn-potato-pesticide",
      state: "Minnesota",
      operationType: "pesticide_application",
      payloadType: "liquid",
      requiredCredentialTypes: [CREDENTIAL_TYPES.PESTICIDE_APPLICATOR_LICENSE],
      categoryLabel: "State/category pesticide applicator credential tracked and verified",
    },
  ],
  operators: [
    {
      id: "rdo-operator-ada",
      name: "Ada Miller",
      role: "Lead Operator",
      base: "Grand Forks Valley Unit",
      state: "North Dakota",
      aircraftModels: ["Hylio AG-272", "Hylio AG-230"],
      payloadTypes: ["liquid", "granular"],
      completedLessons: foundationLessonIds,
      assessmentAttempts: passedAssessments,
      practicalEvaluations: passedPracticals,
      credentials: [
        credential(CREDENTIAL_TYPES.FAA_PART_107),
        credential(CREDENTIAL_TYPES.FAA_PART_107_RECENCY),
        credential(CREDENTIAL_TYPES.HYLIO_ONBOARDING, { aircraftModel: "Hylio AG-272", payloadType: "liquid" }),
        credential(CREDENTIAL_TYPES.HARVEST_INTERNAL_QUALIFICATION),
        credential(CREDENTIAL_TYPES.PESTICIDE_APPLICATOR_LICENSE, { state: "North Dakota", category: "Ag aerial application" }),
        credential(CREDENTIAL_TYPES.PESTICIDE_APPLICATOR_LICENSE, { state: "Minnesota", category: "Ag aerial application" }),
      ],
    },
    {
      id: "rdo-operator-ben",
      name: "Ben Castillo",
      role: "Operator trainee",
      base: "Grand Forks Valley Unit",
      state: "North Dakota",
      aircraftModels: ["Hylio AG-272"],
      payloadTypes: ["liquid"],
      completedLessons: foundationLessonIds.slice(0, 9),
      assessmentAttempts: passedAssessments.slice(0, 2),
      practicalEvaluations: passedPracticals.slice(0, 3),
      credentials: [
        credential(CREDENTIAL_TYPES.FAA_PART_107),
        credential(CREDENTIAL_TYPES.FAA_PART_107_RECENCY),
        credential(CREDENTIAL_TYPES.HYLIO_ONBOARDING, { aircraftModel: "Hylio AG-272", payloadType: "liquid" }),
        credential(CREDENTIAL_TYPES.HARVEST_INTERNAL_QUALIFICATION),
      ],
    },
    {
      id: "rdo-operator-cara",
      name: "Cara Nguyen",
      role: "Backup Operator",
      base: "Park Rapids Unit",
      state: "Minnesota",
      aircraftModels: ["Hylio AG-230"],
      payloadTypes: ["liquid"],
      completedLessons: foundationLessonIds,
      assessmentAttempts: passedAssessments,
      practicalEvaluations: passedPracticals,
      credentials: [
        credential(CREDENTIAL_TYPES.FAA_PART_107, { expiresAt: "2026-04-30" }),
        credential(CREDENTIAL_TYPES.FAA_PART_107_RECENCY),
        credential(CREDENTIAL_TYPES.HYLIO_ONBOARDING, { aircraftModel: "Hylio AG-230", payloadType: "liquid" }),
        credential(CREDENTIAL_TYPES.HARVEST_INTERNAL_QUALIFICATION),
        credential(CREDENTIAL_TYPES.PESTICIDE_APPLICATOR_LICENSE, { state: "Minnesota", category: "Ag aerial application" }),
      ],
    },
  ],
  aircraft: [
    {
      id: "rdo-aircraft-1",
      tailNumber: "RDO-HY-01",
      model: "Hylio AG-272",
      status: "active",
      locationId: "farm-grand-forks",
      registrationStatus: "verified",
      remoteIdStatus: "verified",
      maintenanceBlocked: false,
      readiness: {
        calibrationStatus: "current",
        batteryChecklistStatus: "complete",
        lastInspectionAt: "2026-05-03",
      },
    },
    {
      id: "rdo-aircraft-2",
      tailNumber: "RDO-HY-02",
      model: "Hylio AG-272",
      status: "active",
      locationId: "farm-grand-forks",
      registrationStatus: "verified",
      remoteIdStatus: "verified",
      maintenanceBlocked: true,
      readiness: {
        calibrationStatus: "overdue",
        batteryChecklistStatus: "incomplete",
        lastInspectionAt: "2026-04-25",
      },
    },
    {
      id: "rdo-aircraft-3",
      tailNumber: "RDO-HY-03",
      model: "Hylio AG-230",
      status: "active",
      locationId: "farm-park-rapids",
      registrationStatus: "verified",
      remoteIdStatus: "verified",
      maintenanceBlocked: false,
      readiness: {
        calibrationStatus: "current",
        batteryChecklistStatus: "complete",
        lastInspectionAt: "2026-05-04",
      },
    },
  ],
  sprayPrograms: [
    {
      id: "rdo-potato-foliar-2026",
      cropSeasonId: "season-2026-potatoes",
      name: "2026 potato in-season foliar and crop protection program",
      operationType: "pesticide_application",
      configurableBy: ["state", "aircraft", "payload", "operation type"],
    },
  ],
  sprayWindows: [
    {
      id: "rdo-window-001",
      programId: "rdo-potato-foliar-2026",
      title: "Early blight preventative window",
      dateRange: "May 6-8, 2026",
      state: "North Dakota",
      fieldIds: ["field-gf-12"],
      weather: "Low wind morning window",
      status: "ready",
      jobIds: ["rdo-job-001"],
    },
    {
      id: "rdo-window-002",
      programId: "rdo-potato-foliar-2026",
      title: "Tight canopy rescue window",
      dateRange: "May 9-10, 2026",
      state: "North Dakota",
      fieldIds: ["field-gf-18"],
      weather: "Narrow wind shift, needs morning dispatch",
      status: "blocked",
      jobIds: ["rdo-job-002"],
    },
    {
      id: "rdo-window-003",
      programId: "rdo-potato-foliar-2026",
      title: "Minnesota foliar pass",
      dateRange: "May 12-13, 2026",
      state: "Minnesota",
      fieldIds: ["field-pr-7"],
      weather: "Scouting hold",
      status: "watching",
      jobIds: ["rdo-job-003"],
    },
  ],
  applicationJobs: [
    {
      id: "rdo-job-001",
      title: "GF Potato 12 foliar application",
      fieldId: "field-gf-12",
      state: "North Dakota",
      aircraftModel: "Hylio AG-272",
      aircraftId: "rdo-aircraft-1",
      assignedOperatorId: "rdo-operator-ada",
      payloadType: "liquid",
      operationType: "pesticide_application",
      requiresMedical: false,
      acres: 128,
      requiredChecklistSlugs: ["preflight", "drift-weather-review", "chemical-mixing-loading"],
      completedChecklistSlugs: ["preflight", "drift-weather-review", "chemical-mixing-loading"],
      documentsAttached: true,
      weatherAcknowledged: true,
      priorRecordsOverdue: false,
      status: "ready_to_dispatch",
    },
    {
      id: "rdo-job-002",
      title: "GF Potato 18 rescue pass",
      fieldId: "field-gf-18",
      state: "North Dakota",
      aircraftModel: "Hylio AG-272",
      aircraftId: "rdo-aircraft-2",
      assignedOperatorId: "rdo-operator-ben",
      payloadType: "liquid",
      operationType: "pesticide_application",
      requiresMedical: false,
      acres: 96,
      requiredChecklistSlugs: ["preflight", "drift-weather-review", "chemical-mixing-loading"],
      completedChecklistSlugs: ["drift-weather-review"],
      documentsAttached: false,
      weatherAcknowledged: true,
      priorRecordsOverdue: false,
      status: "blocked",
    },
    {
      id: "rdo-job-003",
      title: "PR Potato 7 foliar application",
      fieldId: "field-pr-7",
      state: "Minnesota",
      aircraftModel: "Hylio AG-230",
      aircraftId: "rdo-aircraft-3",
      assignedOperatorId: "rdo-operator-cara",
      payloadType: "liquid",
      operationType: "pesticide_application",
      requiresMedical: false,
      acres: 112,
      requiredChecklistSlugs: ["preflight", "drift-weather-review", "chemical-mixing-loading"],
      completedChecklistSlugs: ["preflight"],
      documentsAttached: true,
      weatherAcknowledged: false,
      priorRecordsOverdue: false,
      status: "watching",
    },
  ],
  applicationRecords: [
    {
      id: "rdo-record-001",
      jobId: "rdo-job-000",
      field: "GF Potato 4",
      completedAt: "2026-05-02",
      acresApplied: 141,
      operator: "Ada Miller",
      aircraft: "RDO-HY-01",
      status: "closed",
      attachments: ["application log", "weather acknowledgement", "postflight checklist"],
    },
    {
      id: "rdo-record-002",
      jobId: "rdo-job-00a",
      field: "PR Potato 2",
      completedAt: "2026-05-04",
      acresApplied: 87,
      operator: "Cara Nguyen",
      aircraft: "RDO-HY-03",
      status: "reviewed",
      attachments: ["application log", "label reference", "cleanout notes"],
    },
  ],
  maintenanceRecords: [
    { id: "maint-001", aircraftId: "rdo-aircraft-1", title: "50-hour inspection", status: "complete", due: "2026-05-18" },
    { id: "maint-002", aircraftId: "rdo-aircraft-2", title: "Spray calibration overdue", status: "blocking", due: "2026-05-04" },
    { id: "maint-003", aircraftId: "rdo-aircraft-2", title: "Battery set B inspection", status: "open", due: "2026-05-05" },
  ],
  supportTickets: [
    { id: "ticket-1042", title: "AG-272 pump calibration variance", status: "open", priority: "High", owner: "Harvest support" },
    { id: "ticket-1043", title: "Official Hylio training material link review", status: "waiting_on_vendor", priority: "Normal", owner: "RDO training lead" },
    { id: "ticket-1044", title: "Minnesota credential review for backup operator", status: "open", priority: "Normal", owner: "RDO compliance" },
  ],
  performanceMetrics: [
    { id: "metric-acres", label: "Acres applied", value: "228", period: "May 1-5" },
    { id: "metric-readiness", label: "Ready jobs", value: "1 of 3", period: "Next 7 days" },
    { id: "metric-utilization", label: "Aircraft utilization", value: "42%", period: "Launch month" },
    { id: "metric-roi", label: "Estimated avoided outsource cost", value: "$8,420", period: "Demo model" },
  ],
};

export const enterpriseRoutes = [
  { label: "Dashboard", path: "/enterprise/rdo/division" },
  { label: "Blueprint", path: "/enterprise/rdo/blueprint" },
  { label: "Spray Calendar", path: "/enterprise/rdo/spray-calendar" },
  { label: "Operators", path: "/enterprise/rdo/operators" },
  { label: "Fleet", path: "/enterprise/rdo/fleet" },
  { label: "Readiness", path: "/enterprise/rdo/readiness" },
  { label: "Records", path: "/enterprise/rdo/application-records" },
  { label: "Support", path: "/enterprise/rdo/support" },
  { label: "Performance", path: "/enterprise/rdo/performance" },
];

export const enterpriseDemoMetadata = {
  dataMode: "demo_fixture",
  label: "RDO guided pilot demo fixture",
  disclaimer:
    "This is not live RDO production data. It is a Harvest Drone OS pilot fixture for demonstrating the Enterprise Drone Division launch workflow.",
};

const rdoDemoPath = [
  {
    id: "division-command-center",
    route: "/enterprise/rdo/division",
    title: "Open the division command center",
    talkTrack:
      "Frame Harvest OS as the operating center for an RDO-owned drone application division.",
    successCue: "RDO can see people, aircraft, jobs, support load, and next spray window in one place.",
  },
  {
    id: "blueprint",
    route: "/enterprise/rdo/blueprint",
    title: "Show the division blueprint",
    talkTrack:
      "Explain that the pilot is an implementation program: equipment, training, SOPs, dispatch, records, and reporting.",
    successCue: "The conversation shifts from buying software to standing up an internal capability.",
  },
  {
    id: "spray-calendar",
    route: "/enterprise/rdo/spray-calendar",
    title: "Review the potato spray calendar",
    talkTrack:
      "Use repeated spray windows to show why readiness has to be known before dispatch pressure hits.",
    successCue: "Ready, blocked, and watching windows are visible before the field team mobilizes.",
  },
  {
    id: "readiness-gate",
    route: "/enterprise/rdo/readiness",
    title: "Block the wrong assignment",
    talkTrack:
      "Select the blocked rescue pass and show that Harvest blocks unsafe or non-compliant assignments before dispatch.",
    successCue: "The blocker list is specific, operational, and fixable.",
    focus: {
      jobId: "rdo-job-002",
      operatorId: "rdo-operator-ben",
      aircraftId: "rdo-aircraft-2",
    },
  },
  {
    id: "operators",
    route: "/enterprise/rdo/operators",
    title: "Trace readiness back to operators",
    talkTrack:
      "Show mixed operator readiness and open a profile if RDO asks where the blockers come from.",
    successCue: "Training, practical signoff, and tracked credentials connect to job assignment.",
  },
  {
    id: "fleet",
    route: "/enterprise/rdo/fleet",
    title: "Trace readiness back to aircraft",
    talkTrack:
      "Show that aircraft, calibration, battery checks, registration, and maintenance state matter to dispatch.",
    successCue: "RDO sees aircraft readiness as part of the same operating system.",
  },
  {
    id: "application-records",
    route: "/enterprise/rdo/application-records",
    title: "Show completed application records",
    talkTrack:
      "Demonstrate that the operating record continues after the flight, not just before assignment.",
    successCue: "Completed work has operator, aircraft, acres, date, status, and attachment context.",
  },
  {
    id: "support",
    route: "/enterprise/rdo/support",
    title: "Review maintenance and support",
    talkTrack:
      "Show the Harvest assistance queue and maintenance items that keep the division operating.",
    successCue: "Support work is visible alongside readiness instead of living in side channels.",
  },
  {
    id: "performance",
    route: "/enterprise/rdo/performance",
    title: "Close on operating performance",
    talkTrack:
      "End with acres, utilization, ready jobs, and avoided outsource cost as the first reporting layer.",
    successCue: "RDO leaves with a practical pilot scorecard.",
  },
];

export function getEnterpriseDemoPath(orgId = "rdo") {
  return rdoDemoPath.map((step) => ({
    ...step,
    route: step.route.replace("/rdo/", `/${orgId}/`),
  }));
}

export function getEnterpriseOrganization(orgId = "rdo") {
  return orgId === "rdo" ? rdoEnterpriseDemo.organization : rdoEnterpriseDemo.organization;
}

export function getEnterpriseDemo(orgId = "rdo") {
  return orgId === "rdo" ? rdoEnterpriseDemo : rdoEnterpriseDemo;
}

export function getAircraftById(orgId, aircraftId) {
  return getEnterpriseDemo(orgId).aircraft.find((aircraft) => aircraft.id === aircraftId);
}

export function getOperatorById(orgId, operatorId) {
  return getEnterpriseDemo(orgId).operators.find((operator) => operator.id === operatorId);
}

export function getApplicationJob(orgId, jobId) {
  return getEnterpriseDemo(orgId).applicationJobs.find((job) => job.id === jobId);
}

function buildJobForReadiness(job, aircraft) {
  return {
    ...job,
    aircraft: aircraft
      ? {
          status: aircraft.status,
          registrationStatus: aircraft.registrationStatus,
          remoteIdStatus: aircraft.remoteIdStatus,
          maintenanceBlocked: aircraft.maintenanceBlocked,
        }
      : job.aircraft,
  };
}

function getAircraftBlockers(aircraft) {
  const blockers = [];
  const warnings = [];

  if (!aircraft) {
    return { blockers: ["Aircraft record is missing"], warnings };
  }

  if (aircraft.readiness?.calibrationStatus === "overdue") {
    blockers.push("Aircraft calibration is overdue");
  }

  if (aircraft.readiness?.batteryChecklistStatus !== "complete") {
    blockers.push("Battery inspection checklist is incomplete");
  }

  if (!aircraft.readiness?.lastInspectionAt) {
    warnings.push("Latest aircraft inspection date is not recorded");
  }

  return { blockers, warnings };
}

export function getApplicationJobReadiness({ orgId = "rdo", jobId, operatorId, aircraftId, now = new Date() }) {
  const job = getApplicationJob(orgId, jobId);
  const operator = getOperatorById(orgId, operatorId || job?.assignedOperatorId);
  const aircraft = getAircraftById(orgId, aircraftId || job?.aircraftId);

  if (!job || !operator) {
    return {
      ready: false,
      blockers: ["Job or operator record is missing"],
      warnings: [],
      gates: [],
      operator,
      aircraft,
      job,
    };
  }

  const baseReadiness = computeHylioJobReadiness({
    operator,
    job: buildJobForReadiness(job, aircraft),
    now,
  });
  const aircraftReadiness = getAircraftBlockers(aircraft);
  const blockers = [...baseReadiness.blockers, ...aircraftReadiness.blockers];
  const warnings = [...baseReadiness.warnings, ...aircraftReadiness.warnings];

  return {
    ...baseReadiness,
    ready: blockers.length === 0,
    blockers,
    warnings,
    operator,
    aircraft,
    job,
  };
}

export function getSprayWindowReadiness(orgId = "rdo", windowId, now = new Date()) {
  const demo = getEnterpriseDemo(orgId);
  const sprayWindow = demo.sprayWindows.find((window) => window.id === windowId);
  const jobs = (sprayWindow?.jobIds || []).map((jobId) => getApplicationJobReadiness({ orgId, jobId, now }));
  const blockers = jobs.flatMap((jobReadiness) =>
    jobReadiness.blockers.map((blocker) => `${jobReadiness.job?.title || "Job"}: ${blocker}`),
  );

  return {
    sprayWindow,
    ready: jobs.length > 0 && jobs.every((job) => job.ready),
    blockers,
    jobs,
  };
}

export function getDivisionSummary(orgId = "rdo", now = new Date()) {
  const demo = getEnterpriseDemo(orgId);
  const jobReadiness = demo.applicationJobs.map((job) =>
    getApplicationJobReadiness({
      orgId,
      jobId: job.id,
      operatorId: job.assignedOperatorId,
      aircraftId: job.aircraftId,
      now,
    }),
  );
  const readyOperatorIds = new Set(jobReadiness.filter((item) => item.ready).map((item) => item.operator?.id));
  const aircraftReadyCount = demo.aircraft.filter(
    (aircraft) =>
      aircraft.status === "active" &&
      !aircraft.maintenanceBlocked &&
      aircraft.registrationStatus === "verified" &&
      aircraft.remoteIdStatus === "verified" &&
      aircraft.readiness?.calibrationStatus === "current" &&
      aircraft.readiness?.batteryChecklistStatus === "complete",
  ).length;

  return {
    organizationName: demo.organization.name,
    divisionName: demo.organization.division.name,
    operatorReadyCount: readyOperatorIds.size,
    operatorTotal: demo.operators.length,
    aircraftReadyCount,
    aircraftTotal: demo.aircraft.length,
    readyJobs: jobReadiness.filter((item) => item.ready).length,
    blockedJobs: jobReadiness.filter((item) => !item.ready).length,
    openSupportTickets: demo.supportTickets.filter((ticket) => !["closed", "resolved"].includes(ticket.status)).length,
    nextSprayWindow: demo.sprayWindows[0],
    blockerCount: jobReadiness.reduce((count, item) => count + item.blockers.length, 0),
  };
}

export function getChecklistTitle(slug) {
  return checklistTemplates.find((template) => template.slug === slug)?.title || slug;
}
