import { createHash } from "node:crypto";
import {
  getApplicationJobReadiness,
  rdoEnterpriseDemo,
} from "./enterpriseDivision.js";

const SEED_NAMESPACE = "harvest-drone-enterprise-demo";

function uuidFor(value) {
  const bytes = createHash("sha1").update(`${SEED_NAMESPACE}:${value}`).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function sourceMeta(source) {
  return {
    source_slug: source.id,
    source_fixture: "rdo_enterprise_demo",
  };
}

function mapById(items) {
  return new Map(items.map((item) => [item.source_slug, item.id]));
}

function requireId(map, sourceSlug, label) {
  const id = map.get(sourceSlug);

  if (!id) {
    throw new Error(`Missing ${label} id for source slug ${sourceSlug}`);
  }

  return id;
}

function buildReadinessSnapshot(job, now) {
  const readiness = getApplicationJobReadiness({
    orgId: rdoEnterpriseDemo.organization.id,
    jobId: job.id,
    operatorId: job.assignedOperatorId,
    aircraftId: job.aircraftId,
    now,
  });

  return {
    ready: readiness.ready,
    blockers: readiness.blockers,
    warnings: readiness.warnings,
    checked_at: now.toISOString(),
  };
}

export function buildRdoEnterpriseSeed({ now = new Date("2026-05-05T12:00:00.000Z") } = {}) {
  const demo = rdoEnterpriseDemo;
  const organization = {
    id: uuidFor(demo.organization.id),
    name: demo.organization.name,
    short_name: demo.organization.shortName,
    organization_type: demo.organization.type,
    headquarters: demo.organization.headquarters,
    operating_states: demo.organization.operatingStates,
    metadata: {
      source_slug: demo.organization.id,
      owner_positioning: demo.organization.ownerPositioning,
      source_fixture: "rdo_enterprise_demo",
    },
  };
  const organizationId = organization.id;

  const enterpriseDivisions = [
    {
      id: uuidFor(demo.organization.division.id),
      organization_id: organizationId,
      name: demo.organization.division.name,
      crop_focus: demo.organization.division.cropFocus,
      operating_model: demo.organization.division.operatingModel,
      aircraft_family: demo.organization.division.aircraftFamily,
      status: demo.organization.division.status,
      readiness_target_date: demo.organization.division.readinessTargetDate,
      metadata: sourceMeta(demo.organization.division),
    },
  ];

  const divisionId = enterpriseDivisions[0].id;

  const divisionBlueprints = [
    {
      id: uuidFor(demo.blueprint.id),
      division_id: divisionId,
      phase: demo.blueprint.phase,
      steps: demo.blueprint.steps,
      assumptions: [
        "Demo fixture only; not live RDO production data",
        "Credential requirements must be configured from current official sources before pilot use",
      ],
      ...sourceMeta(demo.blueprint),
    },
  ];

  const farmLocations = demo.farmLocations.map((location) => ({
    id: uuidFor(location.id),
    organization_id: organizationId,
    name: location.name,
    state: location.state,
    county: location.county,
    metadata: sourceMeta(location),
    source_slug: location.id,
  }));
  const farmLocationIds = mapById(farmLocations);

  const fields = demo.fields.map((field) => ({
    id: uuidFor(field.id),
    organization_id: organizationId,
    farm_location_id: requireId(farmLocationIds, field.locationId, "farm location"),
    name: field.name,
    crop: field.crop,
    acres: field.acres,
    boundary_geojson: null,
    metadata: sourceMeta(field),
    source_slug: field.id,
  }));
  const fieldIds = mapById(fields);

  const cropSeasons = demo.cropSeasons.map((season) => ({
    id: uuidFor(season.id),
    organization_id: organizationId,
    crop: season.crop,
    season_year: season.year,
    stage: season.stage,
    metadata: sourceMeta(season),
    source_slug: season.id,
  }));
  const cropSeasonIds = mapById(cropSeasons);

  const sprayPrograms = demo.sprayPrograms.map((program) => ({
    id: uuidFor(program.id),
    organization_id: organizationId,
    crop_season_id: requireId(cropSeasonIds, program.cropSeasonId, "crop season"),
    name: program.name,
    operation_type: program.operationType,
    compliance_config: {
      configurable_by: program.configurableBy,
      rules: demo.complianceRules,
    },
    source_slug: program.id,
  }));
  const sprayProgramIds = mapById(sprayPrograms);

  const sprayWindows = demo.sprayWindows.map((window) => ({
    id: uuidFor(window.id),
    spray_program_id: requireId(sprayProgramIds, window.programId, "spray program"),
    title: window.title,
    starts_at: null,
    ends_at: null,
    state: window.state,
    status: window.status,
    weather_summary: window.weather,
    field_ids: window.fieldIds.map((fieldId) => requireId(fieldIds, fieldId, "field")),
    readiness_snapshot: {},
    source_slug: window.id,
  }));
  const sprayWindowIds = mapById(sprayWindows);

  const enterpriseOperators = demo.operators.map((operator) => ({
    id: uuidFor(operator.id),
    organization_id: organizationId,
    name: operator.name,
    role: operator.role,
    base_location_id: null,
    state: operator.state,
    aircraft_models: operator.aircraftModels,
    payload_types: operator.payloadTypes,
    training_snapshot: {
      completed_lessons: operator.completedLessons,
      assessment_attempts: operator.assessmentAttempts,
      practical_evaluations: operator.practicalEvaluations,
    },
    source_slug: operator.id,
  }));
  const operatorIds = mapById(enterpriseOperators);

  const operatorCredentials = demo.operators.flatMap((operator) =>
    operator.credentials.map((credential, index) => ({
      id: uuidFor(`${operator.id}-credential-${index}-${credential.type}-${credential.state || "global"}`),
      operator_id: requireId(operatorIds, operator.id, "operator"),
      credential_type: credential.type,
      status: credential.status,
      state: credential.state,
      category: credential.category,
      aircraft_model: credential.aircraftModel,
      payload_type: credential.payloadType,
      verified_at: credential.verifiedAt || null,
      expires_at: credential.expiresAt || null,
      evidence_url: credential.evidenceUrl || null,
      metadata: {
        source_fixture: "rdo_enterprise_demo",
        credential_tracked_only: true,
      },
      source_slug: `${operator.id}-${credential.type}-${credential.state || "global"}-${index}`,
    })),
  );

  const aircraft = demo.aircraft.map((item) => ({
    id: uuidFor(item.id),
    organization_id: organizationId,
    tail_number: item.tailNumber,
    model: item.model,
    status: item.status,
    registration_status: item.registrationStatus,
    remote_id_status: item.remoteIdStatus,
    maintenance_blocked: item.maintenanceBlocked,
    readiness: item.readiness,
    source_slug: item.id,
  }));
  const aircraftIds = mapById(aircraft);

  const applicationJobs = demo.applicationJobs.map((job) => ({
    id: uuidFor(job.id),
    organization_id: organizationId,
    spray_window_id: requireId(
      sprayWindowIds,
      demo.sprayWindows.find((window) => window.jobIds.includes(job.id))?.id,
      "spray window",
    ),
    field_id: requireId(fieldIds, job.fieldId, "field"),
    assigned_operator_id: requireId(operatorIds, job.assignedOperatorId, "operator"),
    aircraft_id: requireId(aircraftIds, job.aircraftId, "aircraft"),
    title: job.title,
    status: job.status,
    operation_type: job.operationType,
    payload_type: job.payloadType,
    state: job.state,
    acres: job.acres,
    required_checklist_slugs: job.requiredChecklistSlugs,
    completed_checklist_slugs: job.completedChecklistSlugs,
    documents_attached: job.documentsAttached,
    weather_acknowledged: job.weatherAcknowledged,
    prior_records_overdue: job.priorRecordsOverdue,
    readiness_snapshot: buildReadinessSnapshot(job, now),
    source_slug: job.id,
  }));
  const applicationJobIds = mapById(applicationJobs);

  const applicationRecords = demo.applicationRecords.map((record) => ({
    id: uuidFor(record.id),
    application_job_id: applicationJobIds.get(record.jobId) || null,
    organization_id: organizationId,
    completed_at: record.completedAt,
    acres_applied: record.acresApplied,
    operator_id: null,
    aircraft_id: null,
    status: record.status,
    record_payload: {
      field: record.field,
      operator: record.operator,
      aircraft: record.aircraft,
    },
    attachments: record.attachments,
    source_slug: record.id,
  }));

  const maintenanceRecords = demo.maintenanceRecords.map((record) => ({
    id: uuidFor(record.id),
    aircraft_id: requireId(aircraftIds, record.aircraftId, "aircraft"),
    title: record.title,
    status: record.status,
    due_at: record.due,
    notes: null,
    metadata: sourceMeta(record),
    source_slug: record.id,
  }));

  const supportTickets = demo.supportTickets.map((ticket) => ({
    id: uuidFor(ticket.id),
    organization_id: organizationId,
    aircraft_id: null,
    title: ticket.title,
    status: ticket.status,
    priority: ticket.priority,
    owner: ticket.owner,
    metadata: sourceMeta(ticket),
    source_slug: ticket.id,
  }));

  const performanceMetrics = demo.performanceMetrics.map((metric) => ({
    id: uuidFor(metric.id),
    organization_id: organizationId,
    metric_key: metric.id,
    label: metric.label,
    metric_value: metric.value,
    period_label: metric.period,
    metadata: sourceMeta(metric),
    source_slug: metric.id,
  }));

  return {
    metadata: {
      seedMode: "repeatable_demo_seed",
      sourceFixture: "rdo_enterprise_demo",
      generatedAt: now.toISOString(),
      disclaimer: "Demo fixture for RDO pilot conversations; not live RDO production data.",
    },
    organizations: [organization],
    enterpriseDivisions,
    divisionBlueprints,
    farmLocations,
    fields,
    cropSeasons,
    sprayPrograms,
    sprayWindows,
    enterpriseOperators,
    operatorCredentials,
    aircraft,
    applicationJobs,
    applicationRecords,
    maintenanceRecords,
    supportTickets,
    performanceMetrics,
  };
}

export function validateEnterpriseSeed(seed) {
  const errors = [];
  const organizationIds = new Set(seed.organizations.map((row) => row.id));
  const operatorIds = new Set(seed.enterpriseOperators.map((row) => row.id));
  const aircraftIds = new Set(seed.aircraft.map((row) => row.id));
  const fieldIds = new Set(seed.fields.map((row) => row.id));
  const sprayWindowIds = new Set(seed.sprayWindows.map((row) => row.id));

  seed.applicationJobs.forEach((job) => {
    if (!organizationIds.has(job.organization_id)) errors.push(`${job.source_slug} has invalid organization_id`);
    if (!operatorIds.has(job.assigned_operator_id)) errors.push(`${job.source_slug} has invalid assigned_operator_id`);
    if (!aircraftIds.has(job.aircraft_id)) errors.push(`${job.source_slug} has invalid aircraft_id`);
    if (!fieldIds.has(job.field_id)) errors.push(`${job.source_slug} has invalid field_id`);
    if (!sprayWindowIds.has(job.spray_window_id)) errors.push(`${job.source_slug} has invalid spray_window_id`);
    if (!job.readiness_snapshot || !Array.isArray(job.readiness_snapshot.blockers)) {
      errors.push(`${job.source_slug} is missing readiness_snapshot.blockers`);
    }
  });

  seed.operatorCredentials.forEach((credential) => {
    if (!operatorIds.has(credential.operator_id)) {
      errors.push(`${credential.source_slug} has invalid operator_id`);
    }
  });

  seed.maintenanceRecords.forEach((record) => {
    if (!aircraftIds.has(record.aircraft_id)) {
      errors.push(`${record.source_slug} has invalid aircraft_id`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
