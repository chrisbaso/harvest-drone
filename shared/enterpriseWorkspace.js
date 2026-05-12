import { getEnterpriseDemo } from "./enterpriseDivision.js";
import {
  assessments,
  computeHylioJobReadiness,
  practicalEvaluationTemplates,
  trainingCourses,
} from "./trainingProgram.js";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function slugify(value) {
  return String(value || "item")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function nextId(prefix, items, label) {
  const base = `${prefix}-${slugify(label)}`;
  const existing = new Set(items.map((item) => item.id));
  let candidate = base;
  let index = 2;

  while (existing.has(candidate)) {
    candidate = `${base}-${index}`;
    index += 1;
  }

  return candidate;
}

function normalizeArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function migrateModelName(value) {
  if (value === "Hylio AG-272") return "HYL-300 Atlas";
  if (value === "Hylio AG-230") return "HYL-150 Ares";
  return value;
}

function migrateModelText(value) {
  return typeof value === "string"
    ? value
        .replaceAll("Hylio AG-272", "HYL-300 Atlas")
        .replaceAll("Hylio AG-230", "HYL-150 Ares")
        .replaceAll("AG-272", "HYL-300 Atlas")
        .replaceAll("AG-230", "HYL-150 Ares")
    : value;
}

export function migrateEnterpriseDroneModelNames(workspace) {
  const next = clone(workspace);

  if (next.organization?.division) {
    next.organization.division.flagshipAircraftModel = "HYL-300 Atlas";
    next.organization.division.flagshipPositioning =
      "HYL-300 Atlas is the flagship model for large-acre operations because its large size and swarming workflow support enterprise-scale application windows.";
  }

  next.operators = (next.operators || []).map((operator) => ({
    ...operator,
    aircraftModels: (operator.aircraftModels || []).map(migrateModelName),
    credentials: (operator.credentials || []).map((credential) => ({
      ...credential,
      aircraftModel: migrateModelName(credential.aircraftModel),
    })),
  }));

  next.aircraft = (next.aircraft || []).map((aircraft) => ({
    ...aircraft,
    model: migrateModelName(aircraft.model),
  }));

  next.applicationJobs = (next.applicationJobs || []).map((job) => ({
    ...job,
    aircraftModel: migrateModelName(job.aircraftModel),
  }));

  next.supportTickets = (next.supportTickets || []).map((ticket) => ({
    ...ticket,
    title: migrateModelText(ticket.title),
  }));

  return next;
}

function getRequiredFoundationLessonIds() {
  const foundations = trainingCourses.find((course) => course.slug === "hylio-operator-foundations") || trainingCourses[0];
  return (foundations?.modules || [])
    .flatMap((module) => module.lessons || [])
    .filter((lesson) => lesson.required)
    .map((lesson) => lesson.id);
}

function credentialMatches(existing, credential) {
  return (
    existing.type === credential.type &&
    (!credential.state || existing.state === credential.state) &&
    (!credential.aircraftModel || existing.aircraftModel === credential.aircraftModel) &&
    (!credential.payloadType || existing.payloadType === credential.payloadType)
  );
}

function recomputeApplicationJobs(workspace) {
  const next = clone(workspace);
  next.applicationJobs = next.applicationJobs.map((job) => {
    const readiness = readinessForWorkspaceJob(next, job);
    return {
      ...job,
      readiness: {
        ready: readiness.ready,
        blockers: readiness.blockers,
        warnings: readiness.warnings,
      },
      status: readiness.ready ? "ready_to_dispatch" : "blocked",
    };
  });

  return next;
}

export function getWorkspaceApplicationJobReadiness(workspace, jobId, overrides = {}) {
  const now = overrides.now || new Date("2026-05-05T12:00:00.000Z");
  const job = workspace.applicationJobs.find((item) => item.id === jobId);
  if (!job) {
    return {
      ready: false,
      blockers: ["Job record is missing"],
      warnings: [],
      job: null,
      operator: null,
      aircraft: null,
    };
  }

  const candidate = {
    ...job,
    assignedOperatorId: overrides.operatorId || job.assignedOperatorId,
    aircraftId: overrides.aircraftId || job.aircraftId,
  };
  const readiness = readinessForWorkspaceJob(workspace, candidate, now);

  return {
    ...readiness,
    job: candidate,
    operator: workspace.operators.find((item) => item.id === candidate.assignedOperatorId),
    aircraft: workspace.aircraft.find((item) => item.id === candidate.aircraftId),
  };
}

function readinessForWorkspaceJob(workspace, job, now = new Date("2026-05-05T12:00:00.000Z")) {
  const operator = workspace.operators.find((item) => item.id === job.assignedOperatorId);
  const aircraft = workspace.aircraft.find((item) => item.id === job.aircraftId);

  if (!operator || !aircraft) {
    return {
      ready: false,
      blockers: ["Job, operator, or aircraft record is missing"],
      warnings: [],
    };
  }

  const tempWorkspace = clone(workspace);
  tempWorkspace.applicationJobs = [
    ...tempWorkspace.applicationJobs.filter((item) => item.id !== job.id),
    job,
  ];

  const aircraftBlockers = [];

  if (aircraft.readiness?.calibrationStatus === "overdue") {
    aircraftBlockers.push("Aircraft calibration is overdue");
  }

  if (aircraft.readiness?.batteryChecklistStatus !== "complete") {
    aircraftBlockers.push("Battery inspection checklist is incomplete");
  }

  const fixtureLikeJob = {
    ...job,
    aircraft: {
      status: aircraft.status,
      registrationStatus: aircraft.registrationStatus,
      remoteIdStatus: aircraft.remoteIdStatus,
      maintenanceBlocked: aircraft.maintenanceBlocked,
    },
  };

  const base = computeHylioJobReadiness({ operator, job: fixtureLikeJob, now });
  return {
    ...base,
    ready: base.blockers.length + aircraftBlockers.length === 0,
    blockers: [...base.blockers, ...aircraftBlockers],
  };
}

export function createEnterpriseWorkspace(orgId = "rdo") {
  return migrateEnterpriseDroneModelNames(getEnterpriseDemo(orgId));
}

export function getWorkspaceDivisionSummary(workspace) {
  const jobReadiness = workspace.applicationJobs.map((job) =>
    getWorkspaceApplicationJobReadiness(workspace, job.id),
  );
  const readyOperatorIds = new Set(jobReadiness.filter((item) => item.ready).map((item) => item.operator?.id));
  const aircraftReadyCount = workspace.aircraft.filter(
    (aircraft) =>
      aircraft.status === "active" &&
      !aircraft.maintenanceBlocked &&
      aircraft.registrationStatus === "verified" &&
      aircraft.remoteIdStatus === "verified" &&
      aircraft.readiness?.calibrationStatus === "current" &&
      aircraft.readiness?.batteryChecklistStatus === "complete",
  ).length;

  return {
    organizationName: workspace.organization.name,
    divisionName: workspace.organization.division.name,
    operatorReadyCount: readyOperatorIds.size,
    operatorTotal: workspace.operators.length,
    aircraftReadyCount,
    aircraftTotal: workspace.aircraft.length,
    readyJobs: jobReadiness.filter((item) => item.ready).length,
    blockedJobs: jobReadiness.filter((item) => !item.ready).length,
    openSupportTickets: workspace.supportTickets.filter((ticket) => !["closed", "resolved"].includes(ticket.status)).length,
    nextSprayWindow: workspace.sprayWindows[0],
    blockerCount: jobReadiness.reduce((count, item) => count + item.blockers.length, 0),
  };
}

export function addOperator(workspace, input) {
  const next = clone(workspace);
  const operator = {
    id: input.id || nextId("rdo-operator", next.operators, input.name),
    name: input.name,
    role: input.role || "Operator trainee",
    base: input.base || "Pilot location",
    state: input.state || "North Dakota",
    aircraftModels: normalizeArray(input.aircraftModels || input.aircraftModel || "HYL-300 Atlas"),
    payloadTypes: normalizeArray(input.payloadTypes || input.payloadType || "liquid"),
    completedLessons: input.completedLessons || [],
    assessmentAttempts: input.assessmentAttempts || [],
    practicalEvaluations: input.practicalEvaluations || [],
    credentials: input.credentials || [],
    isPilotAdded: true,
  };

  next.operators = [...next.operators, operator];
  return next;
}

export function addAircraft(workspace, input) {
  const next = clone(workspace);
  const aircraft = {
    id: input.id || nextId("rdo-aircraft", next.aircraft, input.tailNumber),
    tailNumber: input.tailNumber,
    model: input.model || "HYL-300 Atlas",
    status: input.status || "active",
    locationId: input.locationId || next.farmLocations[0]?.id,
    registrationStatus: input.registrationStatus || "verified",
    remoteIdStatus: input.remoteIdStatus || "verified",
    maintenanceBlocked: Boolean(input.maintenanceBlocked),
    readiness: {
      calibrationStatus: input.calibrationStatus || "current",
      batteryChecklistStatus: input.batteryChecklistStatus || "complete",
      lastInspectionAt: input.lastInspectionAt || new Date("2026-05-05T12:00:00.000Z").toISOString().slice(0, 10),
    },
    isPilotAdded: true,
  };

  next.aircraft = [...next.aircraft, aircraft];
  return next;
}

export function addApplicationJob(workspace, input) {
  const next = clone(workspace);
  const job = {
    id: input.id || nextId("rdo-job", next.applicationJobs, input.title),
    title: input.title,
    fieldId: input.fieldId || next.fields[0]?.id,
    state: input.state || "North Dakota",
    aircraftModel: input.aircraftModel || "HYL-300 Atlas",
    aircraftId: input.aircraftId,
    assignedOperatorId: input.assignedOperatorId,
    payloadType: input.payloadType || "liquid",
    operationType: input.operationType || "pesticide_application",
    requiresMedical: Boolean(input.requiresMedical),
    acres: Number(input.acres || 0),
    requiredChecklistSlugs: normalizeArray(input.requiredChecklistSlugs || ["preflight", "drift-weather-review"]),
    completedChecklistSlugs: normalizeArray(input.completedChecklistSlugs),
    documentsAttached: Boolean(input.documentsAttached),
    weatherAcknowledged: Boolean(input.weatherAcknowledged),
    priorRecordsOverdue: Boolean(input.priorRecordsOverdue),
    status: "draft",
    isPilotAdded: true,
  };

  const readiness = readinessForWorkspaceJob(next, job);
  job.readiness = {
    ready: readiness.ready,
    blockers: readiness.blockers,
    warnings: readiness.warnings,
  };
  job.status = readiness.ready ? "ready_to_dispatch" : "blocked";

  next.applicationJobs = [...next.applicationJobs, job];
  return next;
}

export function addApplicationRecord(workspace, input) {
  const next = clone(workspace);
  const record = {
    id: input.id || nextId("rdo-record", next.applicationRecords, input.field || input.jobId),
    jobId: input.jobId || null,
    field: input.field || "Pilot field",
    completedAt: input.completedAt || new Date("2026-05-05T12:00:00.000Z").toISOString().slice(0, 10),
    acresApplied: Number(input.acresApplied || 0),
    operator: input.operator || "Unassigned",
    aircraft: input.aircraft || "Aircraft TBD",
    status: input.status || "draft",
    attachments: normalizeArray(input.attachments),
    isPilotAdded: true,
  };

  next.applicationRecords = [...next.applicationRecords, record];
  return next;
}

export function addSupportTicket(workspace, input) {
  const next = clone(workspace);
  const ticket = {
    id: input.id || nextId("ticket", next.supportTickets, input.title),
    title: input.title,
    status: input.status || "open",
    priority: input.priority || "Normal",
    owner: input.owner || "Harvest support",
    isPilotAdded: true,
  };

  next.supportTickets = [...next.supportTickets, ticket];
  return next;
}

export function addOperatorCredential(workspace, operatorId, credentialInput) {
  const next = clone(workspace);
  const operator = next.operators.find((item) => item.id === operatorId);
  if (!operator) return next;

  const credential = {
    type: credentialInput.type,
    status: credentialInput.status || "verified",
    state: credentialInput.state,
    category: credentialInput.category,
    aircraftModel: credentialInput.aircraftModel,
    payloadType: credentialInput.payloadType,
    expiresAt: credentialInput.expiresAt,
    evidenceLabel: credentialInput.evidenceLabel || "Tracked credential evidence",
    verifiedBy: credentialInput.verifiedBy || "Harvest compliance",
    verifiedAt: credentialInput.verifiedAt || new Date("2026-05-05T12:00:00.000Z").toISOString().slice(0, 10),
    isPilotAdded: true,
  };

  operator.credentials = [
    ...(operator.credentials || []).filter((existing) => !credentialMatches(existing, credential)),
    credential,
  ];

  return recomputeApplicationJobs(next);
}

export function markOperatorTrainingComplete(workspace, operatorId, input = {}) {
  const next = clone(workspace);
  const operator = next.operators.find((item) => item.id === operatorId);
  if (!operator) return next;

  operator.completedLessons = Array.from(new Set([...(operator.completedLessons || []), ...getRequiredFoundationLessonIds()]));
  operator.assessmentAttempts = [
    ...(operator.assessmentAttempts || []).filter((attempt) => !assessments.some((assessment) => assessment.id === attempt.assessmentId)),
    ...assessments.map((assessment) => ({
      assessmentId: assessment.id,
      score: input.score || 100,
      passed: true,
      attemptedAt: input.completedAt || new Date("2026-05-05T12:00:00.000Z").toISOString().slice(0, 10),
      isPilotAdded: true,
    })),
  ];

  return recomputeApplicationJobs(next);
}

export function markOperatorPracticalsComplete(workspace, operatorId, input = {}) {
  const next = clone(workspace);
  const operator = next.operators.find((item) => item.id === operatorId);
  if (!operator) return next;

  operator.practicalEvaluations = [
    ...(operator.practicalEvaluations || []).filter(
      (evaluation) => !practicalEvaluationTemplates.some((template) => template.id === evaluation.templateId),
    ),
    ...practicalEvaluationTemplates.map((template) => ({
      templateId: template.id,
      status: "passed",
      evaluatorRole: input.evaluatorRole || "Lead Operator",
      signedAt: input.signedAt || new Date("2026-05-05T12:00:00.000Z").toISOString().slice(0, 10),
      evidenceLabel: input.evidenceLabel || "Harvest practical signoff",
      isPilotAdded: true,
    })),
  ];

  return recomputeApplicationJobs(next);
}

export function markAircraftReady(workspace, aircraftId, input = {}) {
  const next = clone(workspace);
  const aircraft = next.aircraft.find((item) => item.id === aircraftId);
  if (!aircraft) return next;

  aircraft.status = input.status || "active";
  aircraft.registrationStatus = input.registrationStatus || "verified";
  aircraft.remoteIdStatus = input.remoteIdStatus || "verified";
  aircraft.maintenanceBlocked = false;
  aircraft.readiness = {
    ...(aircraft.readiness || {}),
    calibrationStatus: "current",
    batteryChecklistStatus: "complete",
    lastInspectionAt: input.inspectionDate || new Date("2026-05-05T12:00:00.000Z").toISOString().slice(0, 10),
  };

  next.maintenanceRecords = (next.maintenanceRecords || []).map((record) =>
    record.aircraftId === aircraftId && ["blocking", "open"].includes(record.status)
      ? { ...record, status: "complete", completedAt: aircraft.readiness.lastInspectionAt }
      : record,
  );

  return recomputeApplicationJobs(next);
}

export function completeApplicationJobEvidence(workspace, jobId, input = {}) {
  const next = clone(workspace);
  const job = next.applicationJobs.find((item) => item.id === jobId);
  if (!job) return next;

  const checklistSlugs =
    input.completedChecklistSlugs === "all"
      ? job.requiredChecklistSlugs || []
      : normalizeArray(input.completedChecklistSlugs || job.requiredChecklistSlugs || []);

  job.completedChecklistSlugs = Array.from(new Set([...(job.completedChecklistSlugs || []), ...checklistSlugs]));
  if (typeof input.documentsAttached === "boolean") {
    job.documentsAttached = input.documentsAttached;
  }
  if (typeof input.weatherAcknowledged === "boolean") {
    job.weatherAcknowledged = input.weatherAcknowledged;
  }
  job.evidenceUpdatedAt = input.evidenceUpdatedAt || new Date("2026-05-05T12:00:00.000Z").toISOString().slice(0, 10);

  return recomputeApplicationJobs(next);
}
