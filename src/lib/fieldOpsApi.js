import {
  FIELD_OPS_DEMO_ORG_ID,
  buildLeadOpsConversion,
  createDefaultChecklist,
  createDemoFieldOpsState,
} from "../../shared/fieldOps";
import { supabase } from "./supabase";

const STORAGE_KEY = "harvest_drone_field_ops_state_v1";

const ENTITY_CONFIG = {
  clients: { table: "clients", stateKey: "clients", idPrefix: "ops-client" },
  farms: { table: "farms", stateKey: "farms", idPrefix: "ops-farm" },
  fields: { table: "fields", stateKey: "fields", idPrefix: "ops-field" },
  services: { table: "services", stateKey: "services", idPrefix: "ops-service" },
  operatorProfiles: { table: "operator_profiles", stateKey: "operatorProfiles", idPrefix: "ops-operator" },
  jobs: { table: "ops_jobs", stateKey: "jobs", idPrefix: "ops-job" },
  jobNotes: { table: "job_notes", stateKey: "jobNotes", idPrefix: "ops-note", hasUpdatedAt: false },
  jobChecklists: { table: "job_checklists", stateKey: "jobChecklists", idPrefix: "ops-checklist" },
  jobStatusHistory: { table: "job_status_history", stateKey: "jobStatusHistory", idPrefix: "ops-history", hasUpdatedAt: false },
  jobAttachments: { table: "job_attachments", stateKey: "jobAttachments", idPrefix: "ops-attachment", hasUpdatedAt: false },
  jobberLinks: { table: "jobber_links", stateKey: "jobberLinks", idPrefix: "ops-jobber-link" },
  fleetAssets: { table: "fleet_assets", stateKey: "fleetAssets", idPrefix: "ops-drone" },
  fleetLocationEvents: { table: "fleet_location_events", stateKey: "fleetLocationEvents", idPrefix: "ops-location", hasUpdatedAt: false },
};

function isBrowser() {
  return typeof window !== "undefined";
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
}

function createLocalId(prefix) {
  const suffix = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${suffix}`;
}

function nowIso() {
  return new Date().toISOString();
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function isMissingTableError(error) {
  return error?.code === "42P01" || /relation .* does not exist|schema cache/i.test(error?.message || "");
}

function loadLocalState() {
  if (!isBrowser()) {
    return createDemoFieldOpsState();
  }

  const stored = safeJsonParse(window.localStorage.getItem(STORAGE_KEY));
  if (stored?.jobs?.length) {
    return saveLocalState({ ...mergeLocalMapDemoData(stored), mode: stored.mode || "local" });
  }

  const seeded = createDemoFieldOpsState();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

function saveLocalState(state) {
  const nextState = { ...state, mode: state.mode === "demo" ? "demo" : "local" };
  if (isBrowser()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  }
  return nextState;
}

function mergeLocalMapDemoData(state) {
  const demoState = createDemoFieldOpsState();
  const demoFarms = new Map((demoState.farms || []).map((farm) => [farm.id, farm]));
  const demoFields = new Map((demoState.fields || []).map((field) => [field.id, field]));
  const demoJobs = new Map((demoState.jobs || []).map((job) => [job.id, job]));
  const demoAssets = new Map((demoState.fleetAssets || []).map((asset) => [asset.id, asset]));
  const existingAssets = new Set((state.fleetAssets || []).map((asset) => asset.id));
  const existingEvents = new Set((state.fleetLocationEvents || []).map((event) => event.id));

  return {
    ...state,
    farms: (state.farms || []).map((farm) => {
      const demo = demoFarms.get(farm.id);
      if (!demo) return farm;
      return {
        ...farm,
        latitude: farm.latitude ?? demo.latitude ?? null,
        longitude: farm.longitude ?? demo.longitude ?? null,
      };
    }),
    fields: (state.fields || []).map((field) => {
      const demo = demoFields.get(field.id);
      if (!demo) return field;
      return {
        ...field,
        boundary_geojson: field.boundary_geojson || demo.boundary_geojson || null,
        notes: field.notes || demo.notes || null,
      };
    }),
    jobs: (state.jobs || []).map((job) => {
      const demo = demoJobs.get(job.id);
      if (!demo?.metadata_json) return job;
      const currentMetadata = typeof job.metadata_json === "string" ? safeJsonParse(job.metadata_json) || {} : job.metadata_json || {};
      const demoMetadata = demo.metadata_json || {};
      return {
        ...job,
        metadata_json: {
          ...currentMetadata,
          hazards: currentMetadata.hazards || demoMetadata.hazards || undefined,
          map: currentMetadata.map || demoMetadata.map || undefined,
        },
      };
    }),
    fleetAssets: [
      ...(state.fleetAssets || []).map((asset) => {
        const demo = demoAssets.get(asset.id);
        if (!demo) return asset;
        return {
          ...demo,
          ...asset,
          last_latitude: asset.last_latitude ?? demo.last_latitude ?? null,
          last_longitude: asset.last_longitude ?? demo.last_longitude ?? null,
          last_seen_at: asset.last_seen_at || demo.last_seen_at || null,
        };
      }),
      ...(demoState.fleetAssets || []).filter((asset) => !existingAssets.has(asset.id)),
    ],
    fleetLocationEvents: [
      ...(state.fleetLocationEvents || []),
      ...(demoState.fleetLocationEvents || []).filter((event) => !existingEvents.has(event.id)),
    ],
  };
}

function getEntityConfig(entity) {
  const config = ENTITY_CONFIG[entity];
  if (!config) {
    throw new Error(`Unknown field ops entity: ${entity}`);
  }
  return config;
}

function getOrganizationId(state, profile) {
  return (
    profile?.enterprise_organization_id ||
    profile?.organization_id ||
    state?.organizationId ||
    state?.organizations?.[0]?.id ||
    state?.clients?.[0]?.organization_id ||
    state?.jobs?.[0]?.organization_id ||
    FIELD_OPS_DEMO_ORG_ID
  );
}

function stripDerivedFields(record) {
  const {
    client,
    farm,
    field,
    operator,
    client_name,
    farm_name,
    field_name,
    operator_name,
    ...rest
  } = record || {};
  return rest;
}

function prepareSupabasePayload(record, { keepId = false } = {}) {
  const payload = stripDerivedFields({ ...record });
  if (!keepId || !isUuid(payload.id)) {
    delete payload.id;
  }
  return payload;
}

function replaceById(items, id, row) {
  return (items || []).map((item) => (item.id === id ? row : item));
}

function appendEntity(state, entity, row) {
  const config = getEntityConfig(entity);
  return {
    ...state,
    [config.stateKey]: [...(state[config.stateKey] || []), row],
  };
}

function replaceEntity(state, entity, id, row) {
  const config = getEntityConfig(entity);
  return {
    ...state,
    [config.stateKey]: replaceById(state[config.stateKey] || [], id, row),
  };
}

function shouldUseLocal(context = {}) {
  return context.state?.mode === "local" || context.state?.mode === "demo" || context.profile?.is_demo;
}

async function loadSupabaseState() {
  const [
    organizationsResponse,
    clientsResponse,
    farmsResponse,
    fieldsResponse,
    servicesResponse,
    operatorsResponse,
    jobsResponse,
    notesResponse,
    checklistsResponse,
    historyResponse,
    attachmentsResponse,
    linksResponse,
  ] = await Promise.all([
    supabase.from("organizations").select("id, name, short_name").order("created_at", { ascending: true }).limit(20),
    supabase.from("clients").select("*").order("updated_at", { ascending: false }),
    supabase.from("farms").select("*").order("updated_at", { ascending: false }),
    supabase.from("fields").select("id, organization_id, farm_id, name, crop, crop_type, acres, boundary_geojson, notes, created_at, updated_at").order("name"),
    supabase.from("services").select("*").order("name"),
    supabase.from("operator_profiles").select("*").order("name"),
    supabase.from("ops_jobs").select("*").order("scheduled_start", { ascending: true, nullsFirst: false }).order("created_at", { ascending: false }),
    supabase.from("job_notes").select("*").order("created_at", { ascending: false }).limit(500),
    supabase.from("job_checklists").select("*").order("created_at", { ascending: true }),
    supabase.from("job_status_history").select("*").order("changed_at", { ascending: false }).limit(500),
    supabase.from("job_attachments").select("*").order("created_at", { ascending: false }).limit(200),
    supabase.from("jobber_links").select("*").order("updated_at", { ascending: false }).limit(200),
  ]);

  const error = [
    organizationsResponse,
    clientsResponse,
    farmsResponse,
    fieldsResponse,
    servicesResponse,
    operatorsResponse,
    jobsResponse,
    notesResponse,
    checklistsResponse,
    historyResponse,
    attachmentsResponse,
    linksResponse,
  ].find((response) => response.error)?.error;

  if (error) {
    throw new Error(error.message || "Unable to load field operations data.");
  }

  const organizationId =
    organizationsResponse.data?.[0]?.id ||
    clientsResponse.data?.[0]?.organization_id ||
    jobsResponse.data?.[0]?.organization_id ||
    FIELD_OPS_DEMO_ORG_ID;

  const [fleetAssetsResponse, fleetEventsResponse] = await Promise.all([
    supabase.from("fleet_assets").select("*").order("name"),
    supabase.from("fleet_location_events").select("*").order("captured_at", { ascending: false }).limit(500),
  ]);

  const fleetWarning = [fleetAssetsResponse, fleetEventsResponse]
    .map((response) => response.error)
    .find((error) => error && !isMissingTableError(error));

  if (fleetWarning) {
    throw new Error(fleetWarning.message || "Unable to load field operations fleet tracking data.");
  }

  return {
    mode: "supabase",
    organizationId,
    organizations: organizationsResponse.data || [],
    clients: clientsResponse.data || [],
    farms: farmsResponse.data || [],
    fields: fieldsResponse.data || [],
    services: servicesResponse.data || [],
    operatorProfiles: operatorsResponse.data || [],
    operators: operatorsResponse.data || [],
    jobs: jobsResponse.data || [],
    jobNotes: notesResponse.data || [],
    jobChecklists: checklistsResponse.data || [],
    jobStatusHistory: historyResponse.data || [],
    jobAttachments: attachmentsResponse.data || [],
    activityLog: [],
    jobberLinks: linksResponse.data || [],
    fleetAssets: fleetAssetsResponse.error ? [] : fleetAssetsResponse.data || [],
    fleetLocationEvents: fleetEventsResponse.error ? [] : fleetEventsResponse.data || [],
  };
}

export async function loadFieldOpsState(profile) {
  if (profile?.is_demo) {
    return loadLocalState();
  }

  try {
    return await loadSupabaseState();
  } catch (error) {
    const localState = loadLocalState();
    return {
      ...localState,
      mode: "local",
      warning: error.message || "Using local field ops demo data because Supabase data is unavailable.",
    };
  }
}

export async function createFieldOpsRecord(entity, values, context = {}) {
  const config = getEntityConfig(entity);
  const organizationId = getOrganizationId(context.state, context.profile);
  const timestamp = nowIso();
  const baseRecord = {
    organization_id: organizationId,
    ...values,
    created_at: values.created_at || timestamp,
  };
  if (config.hasUpdatedAt !== false) {
    baseRecord.updated_at = values.updated_at || timestamp;
  }

  if (shouldUseLocal(context)) {
    const row = {
      id: values.id || createLocalId(config.idPrefix),
      ...baseRecord,
    };
    return {
      row,
      state: saveLocalState(appendEntity(context.state || loadLocalState(), entity, row)),
    };
  }

  const { data, error } = await supabase
    .from(config.table)
    .insert(prepareSupabasePayload(baseRecord))
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    row: data,
    state: appendEntity(context.state, entity, data),
  };
}

export async function updateFieldOpsRecord(entity, id, updates, context = {}) {
  const config = getEntityConfig(entity);
  const timestamp = nowIso();
  const updatePayload = {
    ...updates,
  };
  if (config.hasUpdatedAt !== false) {
    updatePayload.updated_at = updates.updated_at || timestamp;
  }

  if (shouldUseLocal(context)) {
    const current = (context.state?.[config.stateKey] || []).find((item) => item.id === id);
    const row = { ...current, ...updatePayload };
    return {
      row,
      state: saveLocalState(replaceEntity(context.state || loadLocalState(), entity, id, row)),
    };
  }

  const { data, error } = await supabase
    .from(config.table)
    .update(prepareSupabasePayload(updatePayload))
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    row: data,
    state: replaceEntity(context.state, entity, id, data),
  };
}

export async function createFieldOpsJob(values, context = {}) {
  const organizationId = getOrganizationId(context.state, context.profile);
  const timestamp = nowIso();
  const jobValues = {
    organization_id: organizationId,
    status: "new_request",
    priority: "normal",
    invoice_needed: false,
    source_interest: false,
    ...values,
    created_at: values.created_at || timestamp,
    updated_at: values.updated_at || timestamp,
  };

  if (shouldUseLocal(context)) {
    const job = {
      id: values.id || createLocalId("ops-job"),
      ...jobValues,
    };
    const checklists = [
      createDefaultChecklist("pre_flight", { jobId: job.id, organizationId, now: timestamp, id: createLocalId("ops-checklist") }),
      createDefaultChecklist("product", { jobId: job.id, organizationId, now: timestamp, id: createLocalId("ops-checklist") }),
      createDefaultChecklist("weather", { jobId: job.id, organizationId, now: timestamp, id: createLocalId("ops-checklist") }),
      createDefaultChecklist("completion", { jobId: job.id, organizationId, now: timestamp, id: createLocalId("ops-checklist") }),
    ];
    const history = {
      id: createLocalId("ops-history"),
      organization_id: organizationId,
      job_id: job.id,
      old_status: null,
      new_status: job.status,
      changed_by: context.profile?.id || null,
      changed_at: timestamp,
    };
    const state = saveLocalState({
      ...(context.state || loadLocalState()),
      jobs: [...(context.state?.jobs || []), job],
      jobChecklists: [...(context.state?.jobChecklists || []), ...checklists],
      jobStatusHistory: [...(context.state?.jobStatusHistory || []), history],
    });
    return { row: job, state };
  }

  const { data: job, error } = await supabase
    .from("ops_jobs")
    .insert(prepareSupabasePayload(jobValues))
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const checklistRows = ["pre_flight", "product", "weather", "completion"].map((type) =>
    prepareSupabasePayload(createDefaultChecklist(type, { jobId: job.id, organizationId, now: timestamp })),
  );
  const historyRow = {
    organization_id: organizationId,
    job_id: job.id,
    old_status: null,
    new_status: job.status,
    changed_by: isUuid(context.profile?.id) ? context.profile.id : null,
    changed_at: timestamp,
  };

  const [checklistsResponse, historyResponse] = await Promise.all([
    supabase.from("job_checklists").insert(checklistRows).select("*"),
    supabase.from("job_status_history").insert(historyRow).select("*").single(),
  ]);

  if (checklistsResponse.error || historyResponse.error) {
    throw new Error(checklistsResponse.error?.message || historyResponse.error?.message);
  }

  return {
    row: job,
    state: {
      ...context.state,
      jobs: [...(context.state?.jobs || []), job],
      jobChecklists: [...(context.state?.jobChecklists || []), ...(checklistsResponse.data || [])],
      jobStatusHistory: [historyResponse.data, ...(context.state?.jobStatusHistory || [])],
    },
  };
}

export async function updateFieldOpsJob(jobId, updates, context = {}) {
  const currentJob = (context.state?.jobs || []).find((job) => job.id === jobId);
  const statusChanged = updates.status && updates.status !== currentJob?.status;
  const result = await updateFieldOpsRecord("jobs", jobId, updates, context);

  if (!statusChanged) {
    return result;
  }

  const history = {
    organization_id: result.row.organization_id,
    job_id: jobId,
    old_status: currentJob?.status || null,
    new_status: updates.status,
    changed_by: isUuid(context.profile?.id) ? context.profile.id : null,
    changed_at: nowIso(),
  };

  if (shouldUseLocal(context)) {
    const row = { id: createLocalId("ops-history"), ...history, changed_by: context.profile?.id || null };
    const state = saveLocalState({
      ...result.state,
      jobStatusHistory: [row, ...(result.state.jobStatusHistory || [])],
    });
    return { ...result, state };
  }

  const { data, error } = await supabase.from("job_status_history").insert(history).select("*").single();
  if (error) {
    throw new Error(error.message);
  }

  return {
    ...result,
    state: {
      ...result.state,
      jobStatusHistory: [data, ...(result.state.jobStatusHistory || [])],
    },
  };
}

export async function addFieldOpsJobNote(jobId, note, context = {}) {
  const job = (context.state?.jobs || []).find((item) => item.id === jobId);
  const values = {
    organization_id: job?.organization_id || getOrganizationId(context.state, context.profile),
    job_id: jobId,
    user_id: isUuid(context.profile?.id) ? context.profile.id : null,
    note: note.note || note,
    visibility: note.visibility || "internal",
    created_at: nowIso(),
  };

  if (shouldUseLocal(context)) {
    values.user_id = context.profile?.id || null;
  }

  return createFieldOpsRecord("jobNotes", values, context);
}

export async function updateFieldOpsChecklist(checklistId, checklist, context = {}) {
  return updateFieldOpsRecord(
    "jobChecklists",
    checklistId,
    {
      items_json: checklist.items_json,
      completed_by: shouldUseLocal(context) ? checklist.completed_by : isUuid(checklist.completed_by) ? checklist.completed_by : null,
      completed_at: checklist.completed_at,
    },
    context,
  );
}

export async function updateFieldOpsJobberReference(jobId, values, context = {}) {
  const jobResult = await updateFieldOpsJob(
    jobId,
    {
      jobber_job_id: values.jobber_job_id || null,
      jobber_request_id: values.jobber_request_id || null,
    },
    context,
  );

  const job = jobResult.row;
  const jobberEntityId = values.jobber_job_id || values.jobber_request_id;
  if (!jobberEntityId && !values.jobber_url) {
    return jobResult;
  }

  const existing = (jobResult.state.jobberLinks || []).find(
    (link) => link.local_entity_type === "job" && link.local_entity_id === jobId,
  );
  const linkValues = {
    organization_id: job.organization_id,
    local_entity_type: "job",
    local_entity_id: jobId,
    jobber_entity_type: values.jobber_job_id ? "job" : "request",
    jobber_entity_id: jobberEntityId || values.jobber_url || "manual",
    jobber_url: values.jobber_url || null,
    sync_status: "manual",
    updated_at: nowIso(),
  };

  if (existing) {
    const linkResult = await updateFieldOpsRecord("jobberLinks", existing.id, linkValues, {
      ...context,
      state: jobResult.state,
    });
    return { row: job, state: linkResult.state };
  }

  const linkResult = await createFieldOpsRecord("jobberLinks", linkValues, {
    ...context,
    state: jobResult.state,
  });
  return { row: job, state: linkResult.state };
}

export async function createOpsJobFromLead(lead, context = {}) {
  const organizationId = getOrganizationId(context.state, context.profile);
  const conversion = buildLeadOpsConversion(lead, {
    organizationId,
    userId: isUuid(context.profile?.id) ? context.profile.id : null,
  });

  const existingJob = (context.state?.jobs || []).find((job) => job.created_from_lead_id === lead.id);
  if (existingJob) {
    return { row: existingJob, state: context.state };
  }

  if (shouldUseLocal(context)) {
    const state = context.state || loadLocalState();
    const checklists = [
      createDefaultChecklist("pre_flight", { jobId: conversion.job.id, organizationId, id: createLocalId("ops-checklist") }),
      createDefaultChecklist("product", { jobId: conversion.job.id, organizationId, id: createLocalId("ops-checklist") }),
      createDefaultChecklist("weather", { jobId: conversion.job.id, organizationId, id: createLocalId("ops-checklist") }),
      createDefaultChecklist("completion", { jobId: conversion.job.id, organizationId, id: createLocalId("ops-checklist") }),
    ];
    const history = {
      id: createLocalId("ops-history"),
      organization_id: organizationId,
      job_id: conversion.job.id,
      old_status: null,
      new_status: conversion.job.status,
      changed_by: context.profile?.id || null,
      changed_at: nowIso(),
    };
    const nextState = saveLocalState({
      ...state,
      clients: [...(state.clients || []), conversion.client],
      farms: [...(state.farms || []), conversion.farm],
      fields: [...(state.fields || []), conversion.field],
      jobs: [...(state.jobs || []), conversion.job],
      jobNotes: [...(state.jobNotes || []), conversion.note],
      jobChecklists: [...(state.jobChecklists || []), ...checklists],
      jobStatusHistory: [history, ...(state.jobStatusHistory || [])],
    });
    return { row: conversion.job, state: nextState };
  }

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .insert(prepareSupabasePayload(conversion.client))
    .select("*")
    .single();
  if (clientError) throw new Error(clientError.message);

  const { data: farm, error: farmError } = await supabase
    .from("farms")
    .insert(prepareSupabasePayload({ ...conversion.farm, client_id: client.id }))
    .select("*")
    .single();
  if (farmError) throw new Error(farmError.message);

  const { data: field, error: fieldError } = await supabase
    .from("fields")
    .insert(prepareSupabasePayload({ ...conversion.field, farm_id: farm.id }))
    .select("id, organization_id, farm_id, name, crop, crop_type, acres, boundary_geojson, notes, created_at, updated_at")
    .single();
  if (fieldError) throw new Error(fieldError.message);

  const jobPayload = {
    ...conversion.job,
    client_id: client.id,
    farm_id: farm.id,
    field_id: field.id,
    created_from_lead_id: isUuid(lead.id) ? lead.id : null,
  };
  const jobResult = await createFieldOpsJob(jobPayload, {
    ...context,
    state: {
      ...context.state,
      clients: [...(context.state?.clients || []), client],
      farms: [...(context.state?.farms || []), farm],
      fields: [...(context.state?.fields || []), field],
    },
  });

  const notePayload = {
    ...conversion.note,
    organization_id: organizationId,
    job_id: jobResult.row.id,
    user_id: isUuid(context.profile?.id) ? context.profile.id : null,
  };
  const noteResult = await createFieldOpsRecord("jobNotes", notePayload, {
    ...context,
    state: jobResult.state,
  });

  return {
    row: jobResult.row,
    state: noteResult.state,
  };
}

function applyFleetCheckin(state, row) {
  const assets = state.fleetAssets || [];
  const nextAssets = row.fleet_asset_id
    ? assets.map((asset) => asset.id === row.fleet_asset_id
      ? {
          ...asset,
          status: row.status || asset.status,
          assigned_operator_id: row.operator_id || asset.assigned_operator_id,
          current_job_id: row.job_id || asset.current_job_id,
          last_latitude: row.latitude ?? asset.last_latitude ?? null,
          last_longitude: row.longitude ?? asset.last_longitude ?? null,
          last_accuracy_meters: row.accuracy_meters ?? asset.last_accuracy_meters ?? null,
          last_seen_at: row.captured_at,
          updated_at: row.captured_at,
        }
      : asset)
    : assets;

  return {
    ...state,
    fleetAssets: nextAssets,
    fleetLocationEvents: [row, ...(state.fleetLocationEvents || [])],
  };
}

export async function createFleetLocationCheckin(values, context = {}) {
  const organizationId = getOrganizationId(context.state, context.profile);
  const timestamp = nowIso();
  const rowValues = {
    organization_id: organizationId,
    fleet_asset_id: values.fleet_asset_id || values.fleetAssetId || null,
    operator_id: values.operator_id || values.operatorId || null,
    job_id: values.job_id || values.jobId || null,
    status: values.status || "on_site",
    latitude: values.latitude ?? null,
    longitude: values.longitude ?? null,
    accuracy_meters: values.accuracy_meters ?? values.accuracyMeters ?? null,
    note: values.note || null,
    source: values.source || "operator_checkin",
    captured_at: values.captured_at || timestamp,
    created_at: timestamp,
  };

  if (shouldUseLocal(context)) {
    const row = { id: values.id || createLocalId("ops-location"), ...rowValues };
    return {
      row,
      state: saveLocalState(applyFleetCheckin(context.state || loadLocalState(), row)),
    };
  }

  const supabaseRow = {
    ...rowValues,
    fleet_asset_id: isUuid(rowValues.fleet_asset_id) ? rowValues.fleet_asset_id : null,
    operator_id: isUuid(rowValues.operator_id) ? rowValues.operator_id : null,
    job_id: isUuid(rowValues.job_id) ? rowValues.job_id : null,
  };

  const { data, error } = await supabase
    .from("fleet_location_events")
    .insert(prepareSupabasePayload(supabaseRow))
    .select("*")
    .single();

  if (error) {
    if (isMissingTableError(error)) {
      const row = { id: values.id || createLocalId("ops-location"), ...rowValues };
      return {
        row,
        state: applyFleetCheckin(context.state || loadLocalState(), row),
        warning: "Fleet tracking tables are not deployed yet; this check-in is temporary for this session.",
      };
    }
    throw new Error(error.message);
  }

  let nextState = applyFleetCheckin(context.state || loadLocalState(), data);
  let warning = null;
  if (data.fleet_asset_id) {
    const { data: updatedAsset, error: assetError } = await supabase
      .from("fleet_assets")
      .update({
        status: data.status,
        assigned_operator_id: data.operator_id,
        current_job_id: data.job_id,
        last_latitude: data.latitude,
        last_longitude: data.longitude,
        last_accuracy_meters: data.accuracy_meters,
        last_seen_at: data.captured_at,
        updated_at: timestamp,
      })
      .eq("id", data.fleet_asset_id)
      .select("*")
      .single();

    if (assetError && !isMissingTableError(assetError)) {
      warning = "Fleet check-in saved, but the drone asset row could not be refreshed yet.";
    }

    if (updatedAsset) {
      nextState = replaceEntity(nextState, "fleetAssets", updatedAsset.id, updatedAsset);
    }
  }

  return { row: data, state: nextState, warning };
}

export function resetLocalFieldOpsState() {
  const seeded = createDemoFieldOpsState();
  return saveLocalState(seeded);
}
