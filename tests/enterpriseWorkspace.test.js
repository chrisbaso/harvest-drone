import assert from "node:assert/strict";
import {
  addAircraft,
  addApplicationJob,
  addApplicationRecord,
  addOperatorCredential,
  addOperator,
  addSupportTicket,
  completeApplicationJobEvidence,
  markAircraftReady,
  migrateEnterpriseDroneModelNames,
  markOperatorPracticalsComplete,
  markOperatorTrainingComplete,
  createEnterpriseWorkspace,
  getWorkspaceApplicationJobReadiness,
  getWorkspaceDivisionSummary,
} from "../shared/enterpriseWorkspace.js";
import { CREDENTIAL_TYPES } from "../shared/trainingProgram.js";

function run(name, callback) {
  try {
    callback();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

run("creates an editable RDO workspace without mutating the fixture", () => {
  const workspace = createEnterpriseWorkspace("rdo");
  const updated = addOperator(workspace, {
    name: "Pilot User",
    role: "Operator trainee",
    state: "North Dakota",
    base: "Grand Forks Valley Unit",
    aircraftModels: ["HYL-300 Atlas"],
    payloadTypes: ["liquid"],
  });

  assert.equal(workspace.operators.some((operator) => operator.name === "Pilot User"), false);
  assert.equal(updated.operators.some((operator) => operator.name === "Pilot User"), true);
});

run("adds pilot aircraft and marks maintenance-blocked aircraft unavailable", () => {
  const workspace = createEnterpriseWorkspace("rdo");
  const updated = addAircraft(workspace, {
    tailNumber: "RDO-HY-04",
    model: "HYL-300 Atlas",
    status: "active",
    maintenanceBlocked: true,
    calibrationStatus: "current",
    batteryChecklistStatus: "complete",
  });
  const aircraft = updated.aircraft.find((item) => item.tailNumber === "RDO-HY-04");

  assert.equal(aircraft.maintenanceBlocked, true);
  assert.equal(aircraft.readiness.calibrationStatus, "current");
});

run("migrates saved workspaces from legacy AG model names to Ares and Atlas", () => {
  const base = createEnterpriseWorkspace("rdo");
  const legacyWorkspace = {
    ...base,
    organization: {
      ...base.organization,
      division: {
        ...base.organization.division,
        flagshipAircraftModel: "Hylio AG-272",
      },
    },
    operators: [
      {
        id: "legacy-operator",
        aircraftModels: ["Hylio AG-272", "Hylio AG-230"],
        credentials: [
          { type: "HYLIO_ONBOARDING", aircraftModel: "Hylio AG-272" },
          { type: "HYLIO_ONBOARDING", aircraftModel: "Hylio AG-230" },
        ],
      },
    ],
    aircraft: [
      { id: "legacy-aircraft-1", model: "Hylio AG-272" },
      { id: "legacy-aircraft-2", model: "Hylio AG-230" },
    ],
    applicationJobs: [
      { id: "legacy-job-1", aircraftModel: "Hylio AG-272" },
      { id: "legacy-job-2", aircraftModel: "Hylio AG-230" },
    ],
    supportTickets: [
      { id: "legacy-ticket", title: "AG-272 pump calibration variance" },
    ],
  };

  const migrated = migrateEnterpriseDroneModelNames(legacyWorkspace);

  assert.deepEqual(migrated.operators[0].aircraftModels, ["HYL-300 Atlas", "HYL-150 Ares"]);
  assert.equal(migrated.operators[0].credentials[0].aircraftModel, "HYL-300 Atlas");
  assert.equal(migrated.operators[0].credentials[1].aircraftModel, "HYL-150 Ares");
  assert.deepEqual(migrated.aircraft.map((aircraft) => aircraft.model), ["HYL-300 Atlas", "HYL-150 Ares"]);
  assert.deepEqual(migrated.applicationJobs.map((job) => job.aircraftModel), ["HYL-300 Atlas", "HYL-150 Ares"]);
  assert.equal(migrated.organization.division.flagshipAircraftModel, "HYL-300 Atlas");
  assert.match(migrated.supportTickets[0].title, /HYL-300 Atlas/);
});

run("adds application jobs with computed readiness blockers", () => {
  let workspace = createEnterpriseWorkspace("rdo");
  workspace = addApplicationJob(workspace, {
    title: "Pilot blocked job",
    fieldId: "field-gf-18",
    state: "North Dakota",
    aircraftModel: "HYL-300 Atlas",
    aircraftId: "rdo-aircraft-2",
    assignedOperatorId: "rdo-operator-ben",
    payloadType: "liquid",
    operationType: "pesticide_application",
    acres: 44,
    requiredChecklistSlugs: ["preflight", "drift-weather-review"],
    completedChecklistSlugs: [],
    documentsAttached: false,
    weatherAcknowledged: false,
  });
  const job = workspace.applicationJobs.find((item) => item.title === "Pilot blocked job");

  assert.equal(job.status, "blocked");
  assert.equal(job.readiness.ready, false);
  assert.ok(job.readiness.blockers.some((blocker) => blocker.includes("Hylio practical")));
  assert.ok(job.readiness.blockers.some((blocker) => blocker.includes("Aircraft calibration is overdue")));
});

run("adds records and support tickets for pilot workflow tracking", () => {
  let workspace = createEnterpriseWorkspace("rdo");
  workspace = addApplicationRecord(workspace, {
    jobId: "rdo-job-001",
    field: "GF Potato Pilot",
    operator: "Ada Miller",
    aircraft: "RDO-HY-01",
    acresApplied: 32,
    status: "draft",
    attachments: ["application log"],
  });
  workspace = addSupportTicket(workspace, {
    title: "Pilot nozzle inspection",
    priority: "High",
    owner: "Harvest support",
    status: "open",
  });

  assert.ok(workspace.applicationRecords.some((record) => record.field === "GF Potato Pilot"));
  assert.ok(workspace.supportTickets.some((ticket) => ticket.title === "Pilot nozzle inspection"));
});

run("summarizes pilot-added workspace records", () => {
  let workspace = createEnterpriseWorkspace("rdo");
  const before = getWorkspaceDivisionSummary(workspace);
  workspace = addSupportTicket(workspace, {
    title: "Pilot support item",
    priority: "Normal",
    owner: "Harvest support",
    status: "open",
  });
  workspace = addAircraft(workspace, {
    tailNumber: "RDO-HY-05",
    model: "HYL-150 Ares",
    status: "active",
    maintenanceBlocked: false,
  });
  const after = getWorkspaceDivisionSummary(workspace);

  assert.equal(after.openSupportTickets, before.openSupportTickets + 1);
  assert.equal(after.aircraftTotal, before.aircraftTotal + 1);
});

run("tracks operator credential evidence and removes the matching readiness blocker", () => {
  let workspace = createEnterpriseWorkspace("rdo");
  const before = getWorkspaceApplicationJobReadiness(workspace, "rdo-job-002");
  assert.ok(before.blockers.some((blocker) => blocker.includes("Pesticide applicator license for North Dakota")));

  workspace = addOperatorCredential(workspace, "rdo-operator-ben", {
    type: CREDENTIAL_TYPES.PESTICIDE_APPLICATOR_LICENSE,
    status: "verified",
    state: "North Dakota",
    category: "Ag aerial application",
    expiresAt: "2027-12-31",
    evidenceLabel: "ND pesticide license evidence",
  });

  const after = getWorkspaceApplicationJobReadiness(workspace, "rdo-job-002");
  const ben = workspace.operators.find((operator) => operator.id === "rdo-operator-ben");
  assert.ok(ben.credentials.some((credential) => credential.evidenceLabel === "ND pesticide license evidence"));
  assert.equal(after.blockers.some((blocker) => blocker.includes("Pesticide applicator license for North Dakota")), false);
  assert.equal(after.ready, false);
});

run("marks operator training and practical signoff complete for pilot readiness tracking", () => {
  let workspace = createEnterpriseWorkspace("rdo");
  workspace = markOperatorTrainingComplete(workspace, "rdo-operator-ben");
  workspace = markOperatorPracticalsComplete(workspace, "rdo-operator-ben", {
    evaluatorRole: "Chief Pilot",
    signedAt: "2026-05-05",
  });

  const readiness = getWorkspaceApplicationJobReadiness(workspace, "rdo-job-002");
  const ben = workspace.operators.find((operator) => operator.id === "rdo-operator-ben");

  assert.equal(readiness.blockers.some((blocker) => blocker.includes("Hylio Operator Foundations")), false);
  assert.equal(readiness.blockers.some((blocker) => blocker.includes("has not been passed")), false);
  assert.equal(readiness.blockers.some((blocker) => blocker.includes("Hylio practical evaluation")), false);
  assert.ok(ben.practicalEvaluations.every((evaluation) => evaluation.status === "passed"));
});

run("clears aircraft readiness and job evidence blockers without mutating the original workspace", () => {
  const workspace = createEnterpriseWorkspace("rdo");
  let updated = markAircraftReady(workspace, "rdo-aircraft-2", {
    inspectionDate: "2026-05-05",
  });
  updated = completeApplicationJobEvidence(updated, "rdo-job-002", {
    completedChecklistSlugs: ["preflight", "chemical-mixing-loading"],
    documentsAttached: true,
    weatherAcknowledged: true,
  });

  const before = getWorkspaceApplicationJobReadiness(workspace, "rdo-job-002");
  const after = getWorkspaceApplicationJobReadiness(updated, "rdo-job-002");
  const aircraft = updated.aircraft.find((item) => item.id === "rdo-aircraft-2");

  assert.ok(before.blockers.some((blocker) => blocker.includes("Aircraft calibration is overdue")));
  assert.equal(after.blockers.some((blocker) => blocker.includes("Aircraft calibration is overdue")), false);
  assert.equal(after.blockers.some((blocker) => blocker.includes("Battery inspection checklist is incomplete")), false);
  assert.equal(after.blockers.some((blocker) => blocker.includes("Required SOP checklist pending")), false);
  assert.equal(after.blockers.some((blocker) => blocker.includes("Required job documents are not attached")), false);
  assert.equal(aircraft.maintenanceBlocked, false);
  assert.equal(aircraft.readiness.calibrationStatus, "current");
});
