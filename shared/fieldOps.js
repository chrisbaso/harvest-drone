export const FIELD_OPS_DEMO_ORG_ID = "33333333-3333-4333-8333-333333333333";

export const FIELD_OPS_JOB_STATUSES = [
  { id: "new_request", label: "New", board: "New" },
  { id: "qualified", label: "Qualified", board: "Qualified" },
  { id: "quoted", label: "Quoted", board: "Quoted" },
  { id: "scheduled", label: "Scheduled", board: "Scheduled" },
  { id: "operator_assigned", label: "Assigned", board: "Scheduled" },
  { id: "pre_flight", label: "Pre-flight", board: "Scheduled" },
  { id: "in_progress", label: "Flying", board: "In Progress" },
  { id: "completed", label: "Done", board: "Completed" },
  { id: "needs_review", label: "Review", board: "Completed" },
  { id: "invoice_needed", label: "Invoice", board: "Invoice Needed" },
  { id: "closed", label: "Closed", board: "Closed" },
  { id: "cancelled", label: "Cancelled", board: "Closed" },
];

export const FIELD_OPS_BOARD_COLUMNS = [
  { id: "new", label: "New", statuses: ["new_request"] },
  { id: "qualified", label: "Qualified", statuses: ["qualified"] },
  { id: "quoted", label: "Quoted", statuses: ["quoted"] },
  { id: "scheduled", label: "Scheduled", statuses: ["scheduled", "operator_assigned", "pre_flight"] },
  { id: "in_progress", label: "In Progress", statuses: ["in_progress", "needs_review"] },
  { id: "completed", label: "Completed", statuses: ["completed"] },
  { id: "invoice_needed", label: "Invoice Needed", statuses: ["invoice_needed"] },
  { id: "closed", label: "Closed", statuses: ["closed", "cancelled"] },
];

export const FIELD_OPS_PRIORITIES = ["low", "normal", "high", "urgent"];

export const FIELD_OPS_FLEET_STATUSES = [
  { id: "at_yard", label: "At yard" },
  { id: "in_transit", label: "In transit" },
  { id: "on_site", label: "On site" },
  { id: "flying", label: "Flying" },
  { id: "complete", label: "Complete" },
  { id: "offline", label: "Offline" },
];

export const DEFAULT_SERVICES = [
  {
    id: "ops-service-drone-application",
    name: "Drone Application",
    description: "Aerial application work for grower fields.",
    default_rate_per_acre: 18,
    active: true,
  },
  {
    id: "ops-service-source-consultation",
    name: "SOURCE Consultation",
    description: "SOURCE acre review and product fit support.",
    default_rate_per_acre: null,
    active: true,
  },
  {
    id: "ops-service-field-scouting",
    name: "Field Scouting",
    description: "Pre-application scouting and field condition review.",
    default_rate_per_acre: 4,
    active: true,
  },
  {
    id: "ops-service-spot-treatment",
    name: "Spot Treatment",
    description: "Targeted treatment for limited-acre problem areas.",
    default_rate_per_acre: 24,
    active: true,
  },
  {
    id: "ops-service-enterprise-support",
    name: "Enterprise Drone Program Support",
    description: "Planning and operating support for larger drone programs.",
    default_rate_per_acre: null,
    active: true,
  },
];

export const DEFAULT_CHECKLIST_TEMPLATES = {
  pre_flight: [
    { id: "drone_inspected", label: "Drone inspected", completed: false },
    { id: "batteries_checked", label: "Batteries checked", completed: false },
    { id: "weather_checked", label: "Weather checked", completed: false },
    { id: "field_location_confirmed", label: "Field location confirmed", completed: false },
    { id: "application_details_confirmed", label: "Product/application details confirmed", completed: false },
    { id: "safety_area_reviewed", label: "Safety area reviewed", completed: false },
    { id: "operator_notes_added", label: "Operator notes added", completed: false },
  ],
  product: [
    { id: "product_label_reviewed", label: "Product label reviewed", completed: false },
    { id: "rate_confirmed", label: "Application rate confirmed", completed: false },
    { id: "mixing_plan_confirmed", label: "Mixing/loading plan confirmed", completed: false },
  ],
  weather: [
    { id: "wind_speed_confirmed", label: "Wind speed confirmed", completed: false },
    { id: "temperature_checked", label: "Temperature checked", completed: false },
    { id: "rain_window_checked", label: "Rain window checked", completed: false },
  ],
  completion: [
    { id: "application_recorded", label: "Application record captured", completed: false },
    { id: "postflight_complete", label: "Post-flight inspection complete", completed: false },
    { id: "completion_notes_added", label: "Completion notes added", completed: false },
  ],
};

const ACTIVE_STATUSES = [
  "new_request",
  "qualified",
  "quoted",
  "scheduled",
  "operator_assigned",
  "pre_flight",
  "in_progress",
  "needs_review",
];

const ASSIGNMENT_READY_STATUSES = ["qualified", "quoted", "scheduled", "operator_assigned", "pre_flight"];
const COMPLETED_STATUSES = ["completed", "invoice_needed", "closed"];
const WEEK_SCHEDULED_STATUSES = ["scheduled", "operator_assigned", "pre_flight", "in_progress"];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function asDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date) {
  const next = startOfDay(date);
  next.setDate(next.getDate() + 1);
  next.setMilliseconds(-1);
  return next;
}

function startOfWeek(date) {
  const next = startOfDay(date);
  const day = next.getDay();
  const diff = (day + 6) % 7;
  next.setDate(next.getDate() - diff);
  return next;
}

function endOfWeek(date) {
  const next = startOfWeek(date);
  next.setDate(next.getDate() + 7);
  next.setMilliseconds(-1);
  return next;
}

function isBetween(dateValue, start, end) {
  const date = asDate(dateValue);
  return Boolean(date && date >= start && date <= end);
}

function numberValue(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function titleCase(value) {
  return String(value || "")
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(" ");
}

function parseAcresFromLead(lead) {
  if (lead?.estimated_acres) return numberValue(lead.estimated_acres);
  if (lead?.acres) return numberValue(lead.acres);
  const match = String(lead?.acreage_range || "").match(/\d[\d,]*/);
  return match ? Number(match[0].replaceAll(",", "")) : null;
}

function arrayText(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  return value || "";
}

function uniqueList(values) {
  const seen = new Set();
  return values.filter((value) => {
    const text = String(value || "").trim();
    const key = text.toLowerCase();
    if (!text || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function parseMetadata(value) {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }
  return typeof value === "object" && !Array.isArray(value) ? value : {};
}

function getJobMetadata(job = {}) {
  return {
    ...parseMetadata(job.operations),
    ...parseMetadata(job.metadata),
    ...parseMetadata(job.metadata_json),
  };
}

function isApplicationWork(job = {}) {
  return /application|treatment|spray|fungicide|herbicide|foliar/i.test(
    `${job.service_type || ""} ${job.application_product || ""}`,
  );
}

function getChecklistForJob(state = {}, jobId, type) {
  return (state.jobChecklists || []).find(
    (checklist) => checklist.job_id === jobId && checklist.checklist_type === type,
  );
}

function isChecklistComplete(checklist) {
  const items = checklist?.items_json || [];
  return Boolean(checklist?.completed_at || (items.length > 0 && items.every((item) => item.completed)));
}

function getJobberLinkForJob(job = {}, state = {}) {
  return (state.jobberLinks || []).find(
    (link) => link.local_entity_type === "job" && link.local_entity_id === job.id,
  );
}

function parseWindLimit(job = {}, metadata = {}) {
  const explicit = metadata.wind_limit_mph || metadata.windLimitMph || metadata.flight_plan?.wind_limit_mph;
  if (explicit) return numberValue(explicit);
  const match = `${job.internal_notes || ""} ${job.notes || ""}`.match(/wind\s*(?:cutoff|limit)?\D{0,12}(\d{1,2})\s*mph/i);
  return match ? numberValue(match[1]) : null;
}

function getWeatherSnapshot(metadata = {}) {
  return metadata.forecast || metadata.weather || metadata.weather_window_details || {};
}

function makeReadinessItem(action, label, detail, severity = "warning") {
  return { action, label, detail, severity };
}

function getOperatorForProfile(state, profile) {
  if (!profile) return null;
  return (state.operatorProfiles || state.operators || []).find((operator) => {
    return (
      (operator.user_id && operator.user_id === profile.id) ||
      (operator.email && profile.email && normalizeText(operator.email) === normalizeText(profile.email)) ||
      operator.id === profile.operator_profile_id
    );
  });
}

export function formatFieldOpsStatus(value) {
  return FIELD_OPS_JOB_STATUSES.find((status) => status.id === value)?.label || titleCase(value || "Unknown");
}

export function formatFieldOpsPriority(value) {
  return titleCase(value || "normal");
}

export function formatFleetStatus(value) {
  return FIELD_OPS_FLEET_STATUSES.find((status) => status.id === value)?.label || titleCase(value || "offline");
}

export function getFieldOpsRole(profile = {}) {
  const explicitRole = normalizeText(profile.ops_role);
  if (["admin", "owner", "dispatcher", "ops_manager", "sales", "lead_manager", "operator"].includes(explicitRole)) {
    if (explicitRole === "owner") return "admin";
    if (explicitRole === "ops_manager") return "dispatcher";
    if (explicitRole === "lead_manager") return "sales";
    return explicitRole;
  }

  if (profile.role === "admin") return "admin";
  if (profile.role === "network_manager") return "dispatcher";
  if (profile.role === "dealer") return "sales";
  if (profile.role === "operator") return "operator";
  return "operator";
}

export function canManageFieldOps(profile = {}) {
  return ["admin", "dispatcher", "sales"].includes(getFieldOpsRole(profile));
}

export function canDispatchFieldOps(profile = {}) {
  return ["admin", "dispatcher"].includes(getFieldOpsRole(profile));
}

export function createDefaultChecklist(type = "pre_flight", overrides = {}) {
  const template = DEFAULT_CHECKLIST_TEMPLATES[type] || DEFAULT_CHECKLIST_TEMPLATES.pre_flight;
  const now = overrides.now ? new Date(overrides.now).toISOString() : new Date().toISOString();

  return {
    id: overrides.id || `${overrides.jobId || "job"}-${type}`,
    organization_id: overrides.organizationId || FIELD_OPS_DEMO_ORG_ID,
    job_id: overrides.jobId || null,
    checklist_type: type,
    items_json: clone(template),
    completed_by: null,
    completed_at: null,
    created_at: now,
    updated_at: now,
  };
}

export function toggleChecklistItem(checklist, itemId, completed, options = {}) {
  const now = options.now ? new Date(options.now).toISOString() : new Date().toISOString();
  const items = (checklist.items_json || []).map((item) =>
    item.id === itemId
      ? {
          ...item,
          completed: Boolean(completed),
          completed_by: completed ? options.userId || item.completed_by || null : null,
          completed_at: completed ? now : null,
        }
      : item,
  );
  const isComplete = items.length > 0 && items.every((item) => item.completed);

  return {
    ...checklist,
    items_json: items,
    completed_by: isComplete ? options.userId || checklist.completed_by || null : null,
    completed_at: isComplete ? now : null,
    updated_at: now,
  };
}

export function createDemoFieldOpsState({ now = new Date() } = {}) {
  const timestamp = new Date(now).toISOString();
  const today9 = new Date(now);
  today9.setHours(9, 0, 0, 0);
  const today12 = new Date(now);
  today12.setHours(12, 0, 0, 0);
  const today14 = new Date(now);
  today14.setHours(14, 0, 0, 0);
  const tomorrow = addDays(today9, 1);
  const yesterday = addDays(today9, -1);
  const twoDaysAgo = addDays(today9, -2);

  const organizationId = FIELD_OPS_DEMO_ORG_ID;
  const makeBoundary = (centerLng, centerLat, width, height, name) => ({
    type: "Feature",
    properties: { name },
    geometry: {
      type: "Polygon",
      coordinates: [[
        [centerLng - width / 2, centerLat - height / 2],
        [centerLng + width / 2, centerLat - height / 2.6],
        [centerLng + width / 2.2, centerLat + height / 2],
        [centerLng - width / 2.4, centerLat + height / 2.3],
        [centerLng - width / 2, centerLat - height / 2],
      ]],
    },
  });
  const clients = [
    {
      id: "ops-client-miller",
      organization_id: organizationId,
      name: "Miller Family Farms",
      company_name: "Miller Family Farms",
      email: "sam@millerfarms.example",
      phone: "555-0101",
      address_line_1: "412 County Road 8",
      city: "Marshall",
      state: "MN",
      zip: "56258",
      notes: "Potato and corn acres. Prefers text before dispatch.",
      source: "Harvest Drone Funnel",
      jobber_client_id: "JB-C-1024",
      created_at: timestamp,
      updated_at: timestamp,
    },
    {
      id: "ops-client-nelson",
      organization_id: organizationId,
      name: "Nelson Ag",
      company_name: "Nelson Ag",
      email: "riley@nelsonag.example",
      phone: "555-0102",
      address_line_1: "88 Prairie View",
      city: "Redwood Falls",
      state: "MN",
      zip: "56283",
      notes: "Interested in SOURCE consultation and spot treatment.",
      source: "Referral",
      jobber_client_id: null,
      created_at: timestamp,
      updated_at: timestamp,
    },
    {
      id: "ops-client-carter",
      organization_id: organizationId,
      name: "Carter Acres",
      company_name: "Carter Acres",
      email: "devon@carteracres.example",
      phone: "555-0103",
      address_line_1: "1930 River Bend Road",
      city: "Willmar",
      state: "MN",
      zip: "56201",
      notes: "High-touch customer, wants completion notes quickly.",
      source: "Jobber",
      jobber_client_id: "JB-C-2048",
      created_at: timestamp,
      updated_at: timestamp,
    },
  ];

  const farms = [
    {
      id: "ops-farm-miller-home",
      organization_id: organizationId,
      client_id: "ops-client-miller",
      name: "Miller Home Farm",
      address_line_1: "412 County Road 8",
      city: "Marshall",
      state: "MN",
      zip: "56258",
      latitude: 44.446,
      longitude: -95.79,
      notes: "South entrance has the best staging area.",
      created_at: timestamp,
      updated_at: timestamp,
    },
    {
      id: "ops-farm-nelson-west",
      organization_id: organizationId,
      client_id: "ops-client-nelson",
      name: "Nelson West Farm",
      address_line_1: "88 Prairie View",
      city: "Redwood Falls",
      state: "MN",
      zip: "56283",
      latitude: 44.541,
      longitude: -95.116,
      notes: "Confirm county road access before hauling.",
      created_at: timestamp,
      updated_at: timestamp,
    },
    {
      id: "ops-farm-carter-river",
      organization_id: organizationId,
      client_id: "ops-client-carter",
      name: "River Bend Farm",
      address_line_1: "1930 River Bend Road",
      city: "Willmar",
      state: "MN",
      zip: "56201",
      latitude: 45.121,
      longitude: -95.045,
      notes: "Irrigation pivot near west edge.",
      created_at: timestamp,
      updated_at: timestamp,
    },
  ];

  const fields = [
    { id: "ops-field-miller-north", organization_id: organizationId, farm_id: "ops-farm-miller-home", name: "North 220", crop_type: "Potatoes", crop: "Potatoes", acres: 220, boundary_geojson: makeBoundary(-95.79, 44.452, 0.031, 0.018, "Miller North 220"), notes: "Tight wind window. Tree line on northwest edge.", created_at: timestamp, updated_at: timestamp },
    { id: "ops-field-miller-south", organization_id: organizationId, farm_id: "ops-farm-miller-home", name: "South 260", crop_type: "Corn", crop: "Corn", acres: 260, boundary_geojson: makeBoundary(-95.784, 44.438, 0.036, 0.019, "Miller South 260"), notes: "Completed SOURCE trial area. Use south gate and avoid bin lane.", created_at: timestamp, updated_at: timestamp },
    { id: "ops-field-nelson-west", organization_id: organizationId, farm_id: "ops-farm-nelson-west", name: "West Quarter", crop_type: "Soybeans", crop: "Soybeans", acres: 150, boundary_geojson: null, notes: "Avoid the north tree line. Boundary still needs grower confirmation.", created_at: timestamp, updated_at: timestamp },
    { id: "ops-field-carter-river", organization_id: organizationId, farm_id: "ops-farm-carter-river", name: "River Bottom", crop_type: "Corn", crop: "Corn", acres: 320, boundary_geojson: makeBoundary(-95.045, 45.121, 0.041, 0.024, "Carter River Bottom"), notes: "Use east road for staging. Irrigation pivot near west edge.", created_at: timestamp, updated_at: timestamp },
    { id: "ops-field-nelson-test", organization_id: organizationId, farm_id: "ops-farm-nelson-west", name: "SOURCE Test Block", crop_type: "Soybeans", crop: "Soybeans", acres: 60, boundary_geojson: makeBoundary(-95.108, 44.537, 0.017, 0.012, "Nelson SOURCE Test Block"), notes: "Grower is comparing SOURCE timing. Mark untreated control strip.", created_at: timestamp, updated_at: timestamp },
  ];

  const operatorProfiles = [
    {
      id: "ops-operator-ada",
      organization_id: organizationId,
      user_id: "user-ada",
      name: "Ada Miller",
      phone: "555-0141",
      email: "ada@harvestdrone.local",
      certification_status: "current",
      service_regions: ["Lyon County", "Redwood County"],
      active: true,
      notes: "Lead operator for west region.",
      created_at: timestamp,
      updated_at: timestamp,
    },
    {
      id: "ops-operator-ben",
      organization_id: organizationId,
      user_id: "user-ben",
      name: "Ben Carter",
      phone: "555-0142",
      email: "ben@harvestdrone.local",
      certification_status: "current",
      service_regions: ["Kandiyohi County", "Lyon County"],
      active: true,
      notes: "Strong fit for large-acre corn applications.",
      created_at: timestamp,
      updated_at: timestamp,
    },
  ];

  const fleetAssets = [
    {
      id: "ops-drone-ares-01",
      organization_id: organizationId,
      name: "Ares 01",
      serial_number: "HD-ARES-001",
      model: "Hylio Ares",
      assigned_operator_id: "ops-operator-ada",
      home_base: "Marshall yard",
      status: "flying",
      last_latitude: 44.452,
      last_longitude: -95.79,
      last_accuracy_meters: 18,
      last_seen_at: new Date(today9.getTime() + 52 * 60 * 1000).toISOString(),
      current_job_id: "ops-job-002",
      active: true,
      notes: "Primary application drone for west region.",
      created_at: timestamp,
      updated_at: timestamp,
    },
    {
      id: "ops-drone-ares-02",
      organization_id: organizationId,
      name: "Ares 02",
      serial_number: "HD-ARES-002",
      model: "Hylio Ares",
      assigned_operator_id: "ops-operator-ben",
      home_base: "Willmar yard",
      status: "on_site",
      last_latitude: 45.121,
      last_longitude: -95.045,
      last_accuracy_meters: 24,
      last_seen_at: new Date(today14.getTime() - 18 * 60 * 1000).toISOString(),
      current_job_id: "ops-job-004",
      active: true,
      notes: "Large-acre corn application unit.",
      created_at: timestamp,
      updated_at: timestamp,
    },
    {
      id: "ops-drone-scout-01",
      organization_id: organizationId,
      name: "Scout 01",
      serial_number: "HD-SCOUT-001",
      model: "Scout drone",
      assigned_operator_id: null,
      home_base: "Marshall yard",
      status: "at_yard",
      last_latitude: 44.446,
      last_longitude: -95.79,
      last_accuracy_meters: 35,
      last_seen_at: new Date(today9.getTime() - 42 * 60 * 1000).toISOString(),
      current_job_id: null,
      active: true,
      notes: "Scouting and documentation backup.",
      created_at: timestamp,
      updated_at: timestamp,
    },
  ];

  const jobs = [
    {
      id: "ops-job-001",
      organization_id: organizationId,
      client_id: "ops-client-nelson",
      farm_id: "ops-farm-nelson-west",
      field_id: null,
      title: "Nelson SOURCE acre review",
      service_type: "SOURCE Consultation",
      crop_type: "Soybeans",
      acres: 180,
      status: "new_request",
      priority: "normal",
      requested_date: new Date(now).toISOString().slice(0, 10),
      scheduled_start: null,
      scheduled_end: null,
      assigned_operator_id: null,
      application_product: "SOURCE",
      source_interest: true,
      notes: "Lead asked for timing and application options.",
      internal_notes: "Qualify before scheduling.",
      metadata_json: {
        staging_area: "Phone consult until field boundary is confirmed.",
        access_notes: "Ask Riley for field entrance and county road details before dispatch.",
        weather_window: "Consultation only; flight window not needed yet.",
        customer_preference: "Follow up by text, then email a SOURCE acre plan.",
        loadout: ["SOURCE acre review worksheet", "Grower ROI calculator"],
        next_contact: "Qualify service fit and collect field boundary.",
      },
      invoice_needed: false,
      jobber_job_id: null,
      jobber_request_id: null,
      created_from_lead_id: "demo-lead-001",
      created_at: timestamp,
      updated_at: timestamp,
    },
    {
      id: "ops-job-002",
      organization_id: organizationId,
      client_id: "ops-client-miller",
      farm_id: "ops-farm-miller-home",
      field_id: "ops-field-miller-north",
      title: "Miller North fungicide application",
      service_type: "Drone Application",
      crop_type: "Potatoes",
      acres: 220,
      status: "scheduled",
      priority: "urgent",
      requested_date: today9.toISOString().slice(0, 10),
      scheduled_start: today9.toISOString(),
      scheduled_end: today12.toISOString(),
      assigned_operator_id: "ops-operator-ada",
      application_product: "Fungicide - Chlorothalonil",
      source_interest: false,
      notes: "Call Sam when drone is loaded.",
      internal_notes: "Wind cutoff 10 mph.",
      metadata_json: {
        staging_area: "South entrance off County Road 8, gravel pad by the machine shed.",
        access_notes: "Avoid the wet lane north of the bins; Sam will unlock the south gate.",
        weather_window: "Best flight window is before 11 AM.",
        wind_limit_mph: 10,
        forecast: { label: "Marshall AM window", wind_mph: 7, gust_mph: 11, temperature_f: 62, rain_window: "Clear until noon" },
        application_rate: "2 pt/ac",
        spray_volume_gpa: 2,
        tank_mix_notes: "Grower supplied product. Verify label, agitation, and total gallons before loading.",
        ppe: "Chemical gloves, eye protection, long sleeves",
        water_source: "Nurse tank at south pad",
        equipment: ["AG-272 spray drone", "RTK base", "3 battery sets"],
        estimated_duration_hours: 3,
        loadout: ["Charged batteries x3", "Chlorothalonil tote", "Nozzle kit", "RTK base", "PPE kit"],
        hazards: ["Wet lane north of bins", "Tree line west edge", "South gate only"],
        map: { boundary_notes: "Use the saved North 220 boundary and keep the truck on the south gravel pad." },
      },
      invoice_needed: false,
      jobber_job_id: "JB-J-4100",
      jobber_request_id: null,
      created_from_lead_id: null,
      created_at: timestamp,
      updated_at: timestamp,
    },
    {
      id: "ops-job-003",
      organization_id: organizationId,
      client_id: "ops-client-nelson",
      farm_id: "ops-farm-nelson-west",
      field_id: "ops-field-nelson-west",
      title: "Nelson West soybean spot treatment",
      service_type: "Spot Treatment",
      crop_type: "Soybeans",
      acres: 150,
      status: "scheduled",
      priority: "high",
      requested_date: today9.toISOString().slice(0, 10),
      scheduled_start: tomorrow.toISOString(),
      scheduled_end: addDays(tomorrow, 0.13).toISOString(),
      assigned_operator_id: null,
      application_product: "Herbicide - grower supplied",
      source_interest: true,
      notes: "Needs operator assignment before confirmation.",
      internal_notes: "",
      metadata_json: {
        staging_area: "West approach from Prairie View. Park on the gravel shoulder.",
        access_notes: "Stay clear of the north tree line and confirm drift buffer before loading.",
        weather_window: "Tomorrow afternoon is marginal; confirm wind again before dispatch.",
        wind_limit_mph: 12,
        forecast: { label: "Redwood Falls afternoon", wind_mph: 14, gust_mph: 18, temperature_f: 69, rain_window: "Dry" },
        application_rate: "Grower supplied; rate pending",
        spray_volume_gpa: 2,
        tank_mix_notes: "Confirm herbicide label and adjuvant before assigning.",
        ppe: "Chemical gloves, eye protection, long sleeves",
        water_source: "Bring water unless grower confirms tender.",
        equipment: ["Spray drone", "Spare nozzle kit", "Boundary tablet"],
        estimated_duration_hours: 2.25,
        loadout: ["Grower-supplied herbicide", "Boundary tablet", "PPE kit"],
        hazards: ["North tree line", "Drift buffer pending"],
        map: { boundary_notes: "Boundary needs grower confirmation before flight." },
      },
      invoice_needed: false,
      jobber_job_id: null,
      jobber_request_id: "JB-R-8821",
      created_from_lead_id: "demo-lead-002",
      created_at: timestamp,
      updated_at: timestamp,
    },
    {
      id: "ops-job-004",
      organization_id: organizationId,
      client_id: "ops-client-carter",
      farm_id: "ops-farm-carter-river",
      field_id: "ops-field-carter-river",
      title: "Carter River Bottom application",
      service_type: "Drone Application",
      crop_type: "Corn",
      acres: 320,
      status: "in_progress",
      priority: "urgent",
      requested_date: today9.toISOString().slice(0, 10),
      scheduled_start: today14.toISOString(),
      scheduled_end: addDays(today14, 0.13).toISOString(),
      assigned_operator_id: "ops-operator-ben",
      application_product: "Foliar feed",
      source_interest: false,
      notes: "Operator is in field.",
      internal_notes: "Capture completion report after flight.",
      metadata_json: {
        staging_area: "East road, south of the irrigation pivot.",
        access_notes: "Pivot on west edge; operator should keep the truck on the east road.",
        weather_window: "Afternoon slot is acceptable if gusts stay below 13 mph.",
        wind_limit_mph: 13,
        forecast: { label: "Willmar afternoon", wind_mph: 9, gust_mph: 12, temperature_f: 66, rain_window: "Clear" },
        application_rate: "1 qt/ac",
        spray_volume_gpa: 2,
        tank_mix_notes: "Foliar feed. Capture gallons applied in completion notes.",
        ppe: "Standard application PPE",
        water_source: "Tender truck on site",
        equipment: ["AG-230 spray drone", "Spare prop kit", "Battery generator"],
        estimated_duration_hours: 3.5,
        loadout: ["Foliar feed", "Battery generator", "Completion report template"],
        hazards: ["Irrigation pivot west edge", "River buffer", "East road traffic"],
        map: { boundary_notes: "Stay east of the pivot lane and confirm river buffer before launch." },
      },
      invoice_needed: false,
      jobber_job_id: "JB-J-4101",
      jobber_request_id: null,
      created_from_lead_id: null,
      created_at: timestamp,
      updated_at: timestamp,
    },
    {
      id: "ops-job-005",
      organization_id: organizationId,
      client_id: "ops-client-carter",
      farm_id: "ops-farm-carter-river",
      field_id: "ops-field-carter-river",
      title: "Carter post-rain scouting",
      service_type: "Field Scouting",
      crop_type: "Corn",
      acres: 260,
      status: "completed",
      priority: "normal",
      requested_date: yesterday.toISOString().slice(0, 10),
      scheduled_start: yesterday.toISOString(),
      scheduled_end: addDays(yesterday, 0.08).toISOString(),
      assigned_operator_id: "ops-operator-ben",
      application_product: null,
      source_interest: false,
      notes: "No major issues found.",
      internal_notes: "Completion report sent to Devon.",
      metadata_json: {
        staging_area: "East road by pivot.",
        access_notes: "Post-rain scouting completed without application.",
        weather_window: "Completed.",
        forecast: { label: "Completed scouting window", wind_mph: 6, gust_mph: 8, temperature_f: 61, rain_window: "Post-rain" },
        equipment: ["Scouting drone", "Field camera"],
        estimated_duration_hours: 1.75,
        loadout: ["Scouting drone", "Field camera", "Battery set"],
      },
      invoice_needed: false,
      jobber_job_id: null,
      jobber_request_id: null,
      created_from_lead_id: null,
      created_at: timestamp,
      updated_at: timestamp,
    },
    {
      id: "ops-job-006",
      organization_id: organizationId,
      client_id: "ops-client-miller",
      farm_id: "ops-farm-miller-home",
      field_id: "ops-field-miller-south",
      title: "Miller South SOURCE completion",
      service_type: "SOURCE Consultation",
      crop_type: "Corn",
      acres: 260,
      status: "invoice_needed",
      priority: "normal",
      requested_date: twoDaysAgo.toISOString().slice(0, 10),
      scheduled_start: twoDaysAgo.toISOString(),
      scheduled_end: addDays(twoDaysAgo, 0.08).toISOString(),
      assigned_operator_id: "ops-operator-ada",
      application_product: "SOURCE",
      source_interest: true,
      notes: "Grower wants next-step recommendation.",
      internal_notes: "Invoice in Jobber after report review.",
      metadata_json: {
        staging_area: "Report review, no active flight.",
        access_notes: "Completed SOURCE consultation for south field.",
        weather_window: "Completed.",
        application_rate: "SOURCE program recommendation",
        equipment: ["SOURCE report", "Acre recommendation worksheet"],
        estimated_duration_hours: 1,
        loadout: ["SOURCE report", "Invoice handoff notes"],
      },
      invoice_needed: true,
      jobber_job_id: "JB-J-4097",
      jobber_request_id: null,
      created_from_lead_id: null,
      created_at: timestamp,
      updated_at: timestamp,
    },
    {
      id: "ops-job-007",
      organization_id: organizationId,
      client_id: "ops-client-nelson",
      farm_id: "ops-farm-nelson-west",
      field_id: "ops-field-nelson-test",
      title: "Nelson SOURCE test block",
      service_type: "SOURCE Consultation",
      crop_type: "Soybeans",
      acres: 60,
      status: "qualified",
      priority: "normal",
      requested_date: today9.toISOString().slice(0, 10),
      scheduled_start: null,
      scheduled_end: null,
      assigned_operator_id: null,
      application_product: "SOURCE",
      source_interest: true,
      notes: "Qualified but not yet quoted.",
      internal_notes: "",
      metadata_json: {
        staging_area: "TBD after quote approval.",
        access_notes: "SOURCE test block needs boundary and preferred treatment area.",
        weather_window: "Flexible, not scheduled.",
        application_rate: "SOURCE recommendation pending",
        equipment: ["SOURCE acre review worksheet"],
        estimated_duration_hours: 1,
        loadout: ["SOURCE acre review worksheet"],
        next_contact: "Quote SOURCE test block and schedule consultation.",
      },
      invoice_needed: false,
      jobber_job_id: null,
      jobber_request_id: null,
      created_from_lead_id: "demo-lead-003",
      created_at: timestamp,
      updated_at: timestamp,
    },
    {
      id: "ops-job-008",
      organization_id: organizationId,
      client_id: "ops-client-miller",
      farm_id: "ops-farm-miller-home",
      field_id: "ops-field-miller-south",
      title: "Miller early season closed job",
      service_type: "Field Scouting",
      crop_type: "Corn",
      acres: 90,
      status: "closed",
      priority: "low",
      requested_date: addDays(today9, -14).toISOString().slice(0, 10),
      scheduled_start: addDays(today9, -12).toISOString(),
      scheduled_end: addDays(today9, -12).toISOString(),
      assigned_operator_id: "ops-operator-ben",
      application_product: null,
      source_interest: false,
      notes: "Closed after customer review.",
      internal_notes: "",
      metadata_json: {
        staging_area: "Closed job.",
        access_notes: "No active dispatch needs.",
        weather_window: "Closed.",
        equipment: ["Scouting drone"],
        estimated_duration_hours: 1,
        loadout: ["Archived scouting notes"],
      },
      invoice_needed: false,
      jobber_job_id: null,
      jobber_request_id: null,
      created_from_lead_id: null,
      created_at: timestamp,
      updated_at: timestamp,
    },
  ];

  const jobNotes = jobs.map((job) => ({
    id: `${job.id}-note-1`,
    organization_id: organizationId,
    job_id: job.id,
    user_id: "user-admin",
    note: job.notes || "Job created.",
    visibility: "internal",
    created_at: timestamp,
  }));

  const jobChecklists = jobs.flatMap((job) => [
    createDefaultChecklist("pre_flight", { id: `${job.id}-preflight`, jobId: job.id, organizationId, now }),
    createDefaultChecklist("completion", { id: `${job.id}-completion`, jobId: job.id, organizationId, now }),
  ]);

  const jobStatusHistory = jobs.map((job) => ({
    id: `${job.id}-status-created`,
    organization_id: organizationId,
    job_id: job.id,
    old_status: null,
    new_status: job.status,
    changed_by: "system",
    changed_at: timestamp,
  }));

  const jobberLinks = [
    {
      id: "ops-jobber-link-001",
      organization_id: organizationId,
      local_entity_type: "job",
      local_entity_id: "ops-job-002",
      jobber_entity_type: "job",
      jobber_entity_id: "JB-J-4100",
      jobber_url: "https://secure.getjobber.com/work_orders/JB-J-4100",
      sync_status: "manual",
      last_synced_at: null,
      created_at: timestamp,
      updated_at: timestamp,
    },
  ];

  const fleetLocationEvents = fleetAssets.map((asset) => ({
    id: `${asset.id}-location-1`,
    organization_id: organizationId,
    fleet_asset_id: asset.id,
    operator_id: asset.assigned_operator_id,
    job_id: asset.current_job_id,
    status: asset.status,
    latitude: asset.last_latitude,
    longitude: asset.last_longitude,
    accuracy_meters: asset.last_accuracy_meters,
    note: asset.current_job_id ? "Demo field check-in." : "Demo yard check-in.",
    source: "demo",
    captured_at: asset.last_seen_at,
    created_at: asset.last_seen_at,
  }));

  return {
    mode: "demo",
    organizationId,
    organizations: [{ id: organizationId, name: "Harvest Drone Field Ops", short_name: "HD Ops" }],
    clients,
    farms,
    fields,
    services: DEFAULT_SERVICES.map((service) => ({ ...service, organization_id: organizationId, created_at: timestamp, updated_at: timestamp })),
    operatorProfiles,
    operators: operatorProfiles,
    jobs,
    jobNotes,
    jobChecklists,
    jobStatusHistory,
    jobAttachments: [],
    activityLog: [],
    jobberLinks,
    fleetAssets,
    fleetLocationEvents,
  };
}

export function enrichOpsJob(job, state = {}) {
  const client = (state.clients || []).find((item) => item.id === job.client_id);
  const farm = (state.farms || []).find((item) => item.id === job.farm_id);
  const field = (state.fields || []).find((item) => item.id === job.field_id);
  const operator = (state.operatorProfiles || state.operators || []).find((item) => item.id === job.assigned_operator_id);

  return {
    ...job,
    client,
    farm,
    field,
    operator,
    client_name: client?.name || job.client_name || "",
    farm_name: farm?.name || job.farm_name || "",
    field_name: field?.name || job.field_name || "",
    operator_name: operator?.name || job.operator_name || "",
  };
}

export function filterOpsJobs(jobs = [], filters = {}) {
  return jobs.filter((job) => {
    if (filters.status && filters.status !== "all" && job.status !== filters.status) return false;
    if (filters.operatorId && filters.operatorId !== "all" && job.assigned_operator_id !== filters.operatorId) return false;
    if (filters.serviceType && filters.serviceType !== "all" && job.service_type !== filters.serviceType) return false;
    if (filters.cropType && filters.cropType !== "all" && job.crop_type !== filters.cropType) return false;
    if (filters.clientId && filters.clientId !== "all" && job.client_id !== filters.clientId) return false;
    if (filters.invoiceNeeded === "yes" && !job.invoice_needed && job.status !== "invoice_needed") return false;
    if (filters.invoiceNeeded === "no" && (job.invoice_needed || job.status === "invoice_needed")) return false;
    if (filters.sourceInterest === "yes" && !job.source_interest) return false;
    if (filters.sourceInterest === "no" && job.source_interest) return false;
    if (filters.dateFrom && job.scheduled_start && new Date(job.scheduled_start) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && job.scheduled_start && new Date(job.scheduled_start) > endOfDay(new Date(filters.dateTo))) return false;

    if (filters.search) {
      const haystack = [
        job.title,
        job.client_name,
        job.farm_name,
        job.field_name,
        job.crop_type,
        job.service_type,
        job.application_product,
        job.notes,
        job.internal_notes,
        JSON.stringify(getJobMetadata(job)),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(filters.search.toLowerCase());
    }

    return true;
  });
}

export function getVisibleJobsForProfile(state = {}, profile = {}) {
  const role = getFieldOpsRole(profile);
  const enrichedJobs = (state.jobs || []).map((job) => enrichOpsJob(job, state));

  if (role !== "operator") {
    return enrichedJobs;
  }

  const operator = getOperatorForProfile(state, profile);
  if (!operator) return [];
  return enrichedJobs.filter((job) => job.assigned_operator_id === operator.id);
}

export function getOpsDashboardSummary(state = {}, { now = new Date() } = {}) {
  const jobs = state.jobs || [];
  const startToday = startOfDay(now);
  const endToday = endOfDay(now);
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);
  const activeJobs = jobs.filter((job) => ACTIVE_STATUSES.includes(job.status));
  const scheduledThisWeek = jobs.filter((job) => isBetween(job.scheduled_start, weekStart, weekEnd));
  const activeScheduledThisWeek = scheduledThisWeek.filter((job) => WEEK_SCHEDULED_STATUSES.includes(job.status));
  const completedJobs = jobs.filter((job) => ["completed", "invoice_needed"].includes(job.status));
  const needsOperatorAssignment = jobs.filter(
    (job) => ASSIGNMENT_READY_STATUSES.includes(job.status) && !job.assigned_operator_id,
  );
  const overdueFollowUps = jobs.filter((job) => {
    const requested = asDate(job.requested_date);
    return job.status === "new_request" && requested && requested < startToday;
  });

  const summary = {
    newRequests: jobs.filter((job) => job.status === "new_request").length,
    jobsScheduledToday: jobs.filter((job) => isBetween(job.scheduled_start, startToday, endToday)).length,
    jobsScheduledThisWeek: scheduledThisWeek.length,
    needsOperatorAssignment: needsOperatorAssignment.length,
    inProgressJobs: jobs.filter((job) => job.status === "in_progress").length,
    completedJobs: completedJobs.length,
    invoiceNeededJobs: jobs.filter((job) => job.invoice_needed || job.status === "invoice_needed").length,
    totalScheduledAcres: activeScheduledThisWeek.reduce((sum, job) => sum + numberValue(job.acres), 0),
    openAcres: activeJobs.reduce((sum, job) => sum + numberValue(job.acres), 0),
    completedAcres: completedJobs.reduce((sum, job) => sum + numberValue(job.acres), 0),
    overdueFollowUps: overdueFollowUps.length,
  };

  summary.aiSummary = [
    `${summary.needsOperatorAssignment} jobs need operator assignment.`,
    `${summary.jobsScheduledToday} jobs are scheduled for today.`,
    `${summary.invoiceNeededJobs} completed job${summary.invoiceNeededJobs === 1 ? "" : "s"} need invoicing.`,
    `${summary.overdueFollowUps} leads or requests need follow-up.`,
    `${summary.totalScheduledAcres.toLocaleString()} acres are scheduled this week.`,
  ];

  return summary;
}

export function getJobReadiness(job = {}, state = {}, { now = new Date() } = {}) {
  const enrichedJob = job.client || job.farm || job.field ? job : enrichOpsJob(job, state);
  const metadata = getJobMetadata(enrichedJob);
  const forecast = getWeatherSnapshot(metadata);
  const windLimitMph = parseWindLimit(enrichedJob, metadata);
  const blockers = [];
  const warnings = [];
  const completedOrClosed = ["completed", "invoice_needed", "closed", "cancelled"].includes(enrichedJob.status);
  const activeOrReview = !completedOrClosed || enrichedJob.status === "completed" || enrichedJob.status === "invoice_needed";
  const applicationWork = isApplicationWork(enrichedJob);
  const preflight = getChecklistForJob(state, enrichedJob.id, "pre_flight");
  const completion = getChecklistForJob(state, enrichedJob.id, "completion");
  const scheduledStart = asDate(enrichedJob.scheduled_start);
  const scheduledSoon = scheduledStart && scheduledStart <= addDays(now, 1);
  const jobberLink = getJobberLinkForJob(enrichedJob, state);

  if (!enrichedJob.client_id || !enrichedJob.client) {
    blockers.push(makeReadinessItem("link_client", "Link a grower/client before dispatch.", "Jobs need a real grower contact before they enter the field workflow.", "blocker"));
  } else if (!enrichedJob.client.phone && !enrichedJob.client.email) {
    warnings.push(makeReadinessItem("add_contact", "Add grower contact information.", "Dispatch and completion updates need a phone number or email."));
  }

  if (applicationWork && (!enrichedJob.field_id || !enrichedJob.field)) {
    blockers.push(makeReadinessItem("add_field", "Attach a field before application work.", "Application jobs need a field, acres, crop, and access notes.", "blocker"));
  } else if (applicationWork && enrichedJob.field && !enrichedJob.field.boundary_geojson) {
    const boundaryItem = makeReadinessItem(
      "add_boundary",
      "Add or confirm the field boundary.",
      "Application jobs need a grower-confirmed boundary, staging point, and no-spray buffers before launch.",
      scheduledSoon ? "blocker" : "warning",
    );
    if (scheduledSoon) {
      blockers.push(boundaryItem);
    } else {
      warnings.push(boundaryItem);
    }
  }

  if (!numberValue(enrichedJob.acres)) {
    blockers.push(makeReadinessItem("add_acres", "Confirm acres for planning and reporting.", "Acre count drives schedule time, product load, and billing handoff.", "blocker"));
  }

  if (applicationWork && !enrichedJob.application_product) {
    blockers.push(makeReadinessItem("confirm_product", "Confirm product/application details.", "Operators need product, rate, and label details before pre-flight.", "blocker"));
  }

  if (enrichedJob.status === "new_request") {
    warnings.push(makeReadinessItem("qualify_request", "Qualify the request.", "Confirm crop, acres, service fit, timing, and whether SOURCE belongs in the plan."));
  }

  if (!scheduledStart && ["qualified", "quoted", "scheduled", "operator_assigned", "pre_flight"].includes(enrichedJob.status)) {
    blockers.push(makeReadinessItem("schedule_job", "Schedule a flight or consultation window.", "The job is qualified enough to plan, but it is not on the calendar.", "blocker"));
  }

  if (ASSIGNMENT_READY_STATUSES.includes(enrichedJob.status) && !enrichedJob.assigned_operator_id) {
    blockers.push(makeReadinessItem("assign_operator", "Assign an operator.", "The job cannot move into pre-flight until an operator owns it.", "blocker"));
  }

  if (scheduledSoon && enrichedJob.assigned_operator_id && ["scheduled", "operator_assigned", "pre_flight"].includes(enrichedJob.status) && !isChecklistComplete(preflight)) {
    warnings.push(makeReadinessItem("complete_preflight", "Complete pre-flight checklist.", "This job is scheduled soon and needs aircraft, weather, field, and safety checks."));
  }

  if (windLimitMph && forecast.wind_mph && numberValue(forecast.wind_mph) > windLimitMph) {
    blockers.push(makeReadinessItem("review_weather", "Review weather window before dispatch.", `Forecast wind is ${forecast.wind_mph} mph against a ${windLimitMph} mph limit.`, "blocker"));
  } else if (windLimitMph && forecast.gust_mph && numberValue(forecast.gust_mph) > windLimitMph) {
    warnings.push(makeReadinessItem("watch_gusts", "Watch gusts against the wind limit.", `Forecast gusts are ${forecast.gust_mph} mph against a ${windLimitMph} mph limit.`));
  }

  if (enrichedJob.status === "in_progress" && !isChecklistComplete(completion)) {
    warnings.push(makeReadinessItem("capture_completion", "Capture completion notes and post-flight checklist.", "Finish the application record, acres flown, and post-flight inspection before closeout."));
  }

  if (enrichedJob.status === "completed" && !enrichedJob.invoice_needed) {
    warnings.push(makeReadinessItem("flag_invoice", "Flag invoice needed after completion.", "Completed work should be handed to Jobber or QuickBooks for external billing."));
  }

  if ((enrichedJob.invoice_needed || enrichedJob.status === "invoice_needed") && !enrichedJob.jobber_job_id && !jobberLink?.jobber_url) {
    warnings.push(makeReadinessItem("add_jobber_reference", "Add Jobber reference for billing handoff.", "Manual Jobber linkage keeps the fallback system in sync."));
  }

  let status = blockers.length ? "blocked" : warnings.length ? "attention" : "ready";
  if (["completed", "invoice_needed"].includes(enrichedJob.status) && warnings.length && !blockers.length) {
    status = "review";
  }
  if (["closed", "cancelled"].includes(enrichedJob.status)) {
    status = "closed";
  }

  const score = Math.max(0, 100 - blockers.length * 30 - warnings.length * 10);
  const nextAction =
    blockers[0] ||
    warnings[0] ||
    makeReadinessItem(
      activeOrReview ? "ready_to_fly" : "no_action",
      activeOrReview ? "Ready for the next field step." : "No dispatch action needed.",
      activeOrReview ? "Core dispatch details are present." : "This job is not active.",
      "ready",
    );

  return {
    status,
    score,
    blockers,
    warnings,
    nextAction,
    windLimitMph,
    forecast,
  };
}

export function getJobDispatchPacket(job = {}, state = {}) {
  const enrichedJob = job.client || job.farm || job.field ? job : enrichOpsJob(job, state);
  const metadata = getJobMetadata(enrichedJob);
  const forecast = getWeatherSnapshot(metadata);
  const windLimitMph = parseWindLimit(enrichedJob, metadata);
  const equipment = Array.isArray(metadata.equipment) ? metadata.equipment : [];
  const loadout = uniqueList([
    ...(Array.isArray(metadata.loadout) ? metadata.loadout : []),
    isApplicationWork(enrichedJob) ? "Charged batteries and field charging plan" : "",
    isApplicationWork(enrichedJob) ? "PPE kit and product label" : "",
    enrichedJob.application_product ? `Product: ${enrichedJob.application_product}` : "",
    metadata.water_source ? `Water source: ${metadata.water_source}` : "",
    ...equipment,
  ]);

  return {
    client: {
      id: enrichedJob.client_id,
      name: enrichedJob.client?.name || enrichedJob.client_name || "Client TBD",
      phone: enrichedJob.client?.phone || null,
      email: enrichedJob.client?.email || null,
      preference: metadata.customer_preference || null,
    },
    farm: {
      id: enrichedJob.farm_id,
      name: enrichedJob.farm?.name || enrichedJob.farm_name || "Farm TBD",
      address: [enrichedJob.farm?.address_line_1, enrichedJob.farm?.city, enrichedJob.farm?.state, enrichedJob.farm?.zip]
        .filter(Boolean)
        .join(", "),
      notes: enrichedJob.farm?.notes || null,
    },
    field: {
      id: enrichedJob.field_id,
      name: enrichedJob.field?.name || enrichedJob.field_name || "Field TBD",
      crop: enrichedJob.crop_type || enrichedJob.field?.crop_type || enrichedJob.field?.crop || null,
      acres: numberValue(enrichedJob.acres || enrichedJob.field?.acres),
      notes: enrichedJob.field?.notes || null,
    },
    timing: {
      requestedDate: enrichedJob.requested_date || null,
      scheduledStart: enrichedJob.scheduled_start || null,
      scheduledEnd: enrichedJob.scheduled_end || null,
      estimatedDurationHours: metadata.estimated_duration_hours || null,
    },
    operator: {
      id: enrichedJob.assigned_operator_id,
      name: enrichedJob.operator?.name || enrichedJob.operator_name || "Unassigned",
      phone: enrichedJob.operator?.phone || null,
      certificationStatus: enrichedJob.operator?.certification_status || null,
    },
    operation: {
      service: enrichedJob.service_type || "Service TBD",
      product: enrichedJob.application_product || null,
      sourceInterest: Boolean(enrichedJob.source_interest),
      applicationRate: metadata.application_rate || null,
      sprayVolumeGpa: metadata.spray_volume_gpa || null,
      tankMixNotes: metadata.tank_mix_notes || null,
      ppe: metadata.ppe || null,
      waterSource: metadata.water_source || null,
    },
    flightPlan: {
      stagingArea: metadata.staging_area || "Staging area not documented yet.",
      accessNotes: metadata.access_notes || enrichedJob.farm?.notes || enrichedJob.field?.notes || "Access notes not documented yet.",
      weatherWindow: metadata.weather_window || "Weather window not documented yet.",
      windLimitMph,
      forecast,
      boundaryStatus: enrichedJob.field?.boundary_geojson ? "Boundary on file" : "Boundary placeholder",
    },
    loadout,
    sops: getRelevantSops(enrichedJob),
    notes: {
      customer: enrichedJob.notes || "",
      internal: enrichedJob.internal_notes || "",
      nextContact: metadata.next_contact || "",
    },
  };
}

export function getDailyOpsCommandCenter(state = {}, { now = new Date() } = {}) {
  const jobs = (state.jobs || []).map((job) => enrichOpsJob(job, state));
  const startToday = startOfDay(now);
  const endToday = endOfDay(now);
  const todayJobs = jobs
    .filter((job) => isBetween(job.scheduled_start, startToday, endToday))
    .sort((a, b) => asDate(a.scheduled_start) - asDate(b.scheduled_start));
  const activeJobs = jobs.filter((job) => !["closed", "cancelled"].includes(job.status));
  const readinessRows = activeJobs.map((job) => ({ job, readiness: getJobReadiness(job, state, { now }) }));
  const blockedJobs = readinessRows.filter((row) => row.readiness.status === "blocked").map((row) => row.job);
  const attentionJobs = readinessRows.filter((row) => ["attention", "review"].includes(row.readiness.status)).map((row) => row.job);
  const readyJobs = readinessRows.filter((row) => row.readiness.status === "ready").map((row) => row.job);
  const severityWeight = { blocker: 0, warning: 1, ready: 2 };
  const priorityWeight = { urgent: 0, high: 1, normal: 2, low: 3 };
  const nextActions = readinessRows
    .filter((row) => row.readiness.nextAction.action !== "ready_to_fly" && row.readiness.nextAction.action !== "no_action")
    .map((row) => ({
      jobId: row.job.id,
      jobTitle: row.job.title,
      clientName: row.job.client_name,
      scheduledStart: row.job.scheduled_start,
      priority: row.job.priority || "normal",
      severity: row.readiness.nextAction.severity,
      action: row.readiness.nextAction.action,
      label: row.readiness.nextAction.label,
      detail: row.readiness.nextAction.detail,
    }))
    .sort((a, b) => {
      const severityDiff = (severityWeight[a.severity] ?? 3) - (severityWeight[b.severity] ?? 3);
      if (severityDiff) return severityDiff;
      const priorityDiff = (priorityWeight[a.priority] ?? 4) - (priorityWeight[b.priority] ?? 4);
      if (priorityDiff) return priorityDiff;
      return (asDate(a.scheduledStart)?.getTime() || Number.MAX_SAFE_INTEGER) - (asDate(b.scheduledStart)?.getTime() || Number.MAX_SAFE_INTEGER);
    });

  const operatorWorkload = (state.operatorProfiles || state.operators || []).map((operator) => {
    const assigned = activeJobs.filter((job) => job.assigned_operator_id === operator.id);
    const todayAssigned = todayJobs.filter((job) => job.assigned_operator_id === operator.id);
    return {
      operatorId: operator.id,
      operatorName: operator.name,
      phone: operator.phone || "",
      todayJobs: todayAssigned.length,
      activeJobs: assigned.length,
      acres: assigned.reduce((sum, job) => sum + numberValue(job.acres), 0),
      nextJob: assigned
        .filter((job) => job.scheduled_start)
        .sort((a, b) => asDate(a.scheduled_start) - asDate(b.scheduled_start))[0] || null,
    };
  });

  const loadoutItems = uniqueList(
    todayJobs.flatMap((job) => getJobDispatchPacket(job, state).loadout),
  );
  const weatherCards = todayJobs.map((job) => {
    const readiness = getJobReadiness(job, state, { now });
    return {
      jobId: job.id,
      jobTitle: job.title,
      clientName: job.client_name,
      label: readiness.forecast.label || job.farm_name || "Weather window",
      windMph: readiness.forecast.wind_mph || null,
      gustMph: readiness.forecast.gust_mph || null,
      temperatureF: readiness.forecast.temperature_f || null,
      rainWindow: readiness.forecast.rain_window || null,
      windLimitMph: readiness.windLimitMph,
      status: readiness.status,
    };
  });
  const billingQueue = jobs.filter((job) => job.invoice_needed || job.status === "invoice_needed");

  return {
    todayJobs,
    readyJobs,
    blockedJobs,
    attentionJobs,
    nextActions,
    operatorWorkload,
    loadoutItems,
    weatherCards,
    billingQueue,
    scheduledAcresToday: todayJobs.reduce((sum, job) => sum + numberValue(job.acres), 0),
  };
}

export function getFleetTrackingSummary(state = {}, { now = new Date(), staleMinutes = 30 } = {}) {
  const jobs = (state.jobs || []).map((job) => enrichOpsJob(job, state));
  const events = state.fleetLocationEvents || [];
  const assets = state.fleetAssets || [];
  const staleMs = staleMinutes * 60 * 1000;
  const byAsset = new Map();

  events.forEach((event) => {
    const key = event.fleet_asset_id || `operator-${event.operator_id || "unknown"}`;
    const current = byAsset.get(key);
    const eventTime = asDate(event.captured_at || event.created_at);
    const currentTime = asDate(current?.captured_at || current?.created_at);
    if (!current || (eventTime && (!currentTime || eventTime > currentTime))) {
      byAsset.set(key, event);
    }
  });

  const trackedAssets = assets.map((asset) => {
    const lastEvent = byAsset.get(asset.id);
    const operator = (state.operatorProfiles || state.operators || []).find(
      (item) => item.id === (lastEvent?.operator_id || asset.assigned_operator_id),
    );
    const currentJob = jobs.find((job) => job.id === (lastEvent?.job_id || asset.current_job_id));
    const capturedAt = asDate(lastEvent?.captured_at || asset.last_seen_at);
    const ageMinutes = capturedAt ? Math.max(0, Math.round((now.getTime() - capturedAt.getTime()) / 60000)) : null;
    const status = lastEvent?.status || asset.status || "offline";
    const stale = !capturedAt || now.getTime() - capturedAt.getTime() > staleMs;
    const latitude = numberValue(lastEvent?.latitude ?? asset.last_latitude) || null;
    const longitude = numberValue(lastEvent?.longitude ?? asset.last_longitude) || null;

    return {
      ...asset,
      status,
      statusLabel: formatFleetStatus(status),
      operator,
      operatorName: operator?.name || "Unassigned",
      currentJob,
      jobTitle: currentJob?.title || "No active job",
      latitude,
      longitude,
      accuracyMeters: numberValue(lastEvent?.accuracy_meters ?? asset.last_accuracy_meters) || null,
      lastSeenAt: capturedAt ? capturedAt.toISOString() : null,
      ageMinutes,
      stale,
      lastNote: lastEvent?.note || asset.notes || "",
      source: lastEvent?.source || "manual",
    };
  });

  const activeStatuses = ["in_transit", "on_site", "flying"];
  const activeAssets = trackedAssets.filter((asset) => activeStatuses.includes(asset.status));
  const staleAssets = trackedAssets.filter((asset) => asset.stale && asset.active !== false);
  const offlineAssets = trackedAssets.filter((asset) => asset.status === "offline" || asset.active === false);

  return {
    trackedAssets,
    activeAssets,
    staleAssets,
    offlineAssets,
    flyingAssets: trackedAssets.filter((asset) => asset.status === "flying"),
    onSiteAssets: trackedAssets.filter((asset) => asset.status === "on_site"),
    inTransitAssets: trackedAssets.filter((asset) => asset.status === "in_transit"),
    atYardAssets: trackedAssets.filter((asset) => asset.status === "at_yard"),
    nextActions: [
      ...staleAssets.map((asset) => ({
        id: `stale-${asset.id}`,
        severity: "warning",
        label: "Check drone location",
        detail: `${asset.name} last checked in ${asset.ageMinutes ?? "unknown"} minutes ago.`,
        assetId: asset.id,
      })),
      ...trackedAssets
        .filter((asset) => activeStatuses.includes(asset.status) && !asset.currentJob)
        .map((asset) => ({
          id: `jobless-${asset.id}`,
          severity: "warning",
          label: "Link drone to job",
          detail: `${asset.name} is ${asset.statusLabel.toLowerCase()} with no active job linked.`,
          assetId: asset.id,
        })),
    ],
  };
}

export function getClientRollup(clientId, state = {}) {
  const jobs = (state.jobs || []).filter((job) => job.client_id === clientId);
  const completedJobs = jobs.filter((job) => COMPLETED_STATUSES.includes(job.status));
  return {
    openJobs: jobs.filter((job) => ACTIVE_STATUSES.includes(job.status)).length,
    completedJobs: completedJobs.length,
    totalAcresServiced: completedJobs.reduce((sum, job) => sum + numberValue(job.acres), 0),
    sourceInterest: jobs.some((job) => job.source_interest),
  };
}

export function buildLeadOpsConversion(lead = {}, options = {}) {
  const organizationId = options.organizationId || FIELD_OPS_DEMO_ORG_ID;
  const now = options.now ? new Date(options.now).toISOString() : new Date().toISOString();
  const leadId = lead.id || `lead-${Date.now()}`;
  const leadName = [lead.first_name, lead.last_name].filter(Boolean).join(" ").trim() || lead.email || "Grower lead";
  const farmName = lead.farm_name || `${leadName} Farm`;
  const crops = Array.isArray(lead.crops) ? lead.crops : String(lead.crops || "").split(",").map((item) => item.trim()).filter(Boolean);
  const cropType = crops[0] || lead.crop_type || "";
  const acres = parseAcresFromLead(lead);
  const sourceInterest = [lead.notes, lead.primary_goal, arrayText(crops), lead.source]
    .join(" ")
    .toLowerCase()
    .includes("source");

  const client = {
    id: `ops-client-from-${leadId}`,
    organization_id: organizationId,
    name: leadName,
    company_name: lead.farm_name || null,
    email: lead.email || null,
    phone: lead.phone || null,
    address_line_1: lead.address_line_1 || null,
    address_line_2: lead.address_line_2 || null,
    city: lead.city || null,
    state: lead.state || null,
    zip: lead.zip || null,
    notes: lead.notes || null,
    source: lead.source || "Harvest Drone lead",
    jobber_client_id: null,
    created_at: now,
    updated_at: now,
  };

  const farm = {
    id: `ops-farm-from-${leadId}`,
    organization_id: organizationId,
    client_id: client.id,
    name: farmName,
    address_line_1: lead.address_line_1 || null,
    city: lead.city || lead.county || null,
    state: lead.state || null,
    zip: lead.zip || null,
    latitude: null,
    longitude: null,
    notes: [lead.county ? `County: ${lead.county}` : "", lead.notes || ""].filter(Boolean).join("\n"),
    created_at: now,
    updated_at: now,
  };

  const field = {
    id: `ops-field-from-${leadId}`,
    organization_id: organizationId,
    farm_id: farm.id,
    name: cropType ? `${cropType} Field` : "Lead Field",
    crop_type: cropType || null,
    crop: cropType || null,
    acres,
    boundary_geojson: null,
    notes: lead.acreage_range ? `Lead acreage range: ${lead.acreage_range}` : null,
    created_at: now,
    updated_at: now,
  };

  const job = {
    id: `ops-job-from-${leadId}`,
    organization_id: organizationId,
    client_id: client.id,
    farm_id: farm.id,
    field_id: field.id,
    title: `${leadName} ${sourceInterest ? "SOURCE / drone application" : "drone service"} request`,
    service_type: sourceInterest ? "SOURCE Consultation" : "Drone Application",
    crop_type: cropType || null,
    acres,
    status: lead.status === "New" ? "new_request" : "qualified",
    priority: lead.lead_tier === "Hot" ? "high" : "normal",
    requested_date: now.slice(0, 10),
    scheduled_start: null,
    scheduled_end: null,
    assigned_operator_id: null,
    application_product: sourceInterest ? "SOURCE" : null,
    source_interest: sourceInterest,
    notes: [
      lead.primary_goal ? `Goal: ${lead.primary_goal}` : "",
      lead.decision_timing ? `Timing: ${lead.decision_timing}` : "",
      lead.interest_level ? `Interest: ${lead.interest_level}` : "",
      lead.notes || "",
    ]
      .filter(Boolean)
      .join("\n"),
    internal_notes: lead.internal_notes || null,
    metadata_json: {
      staging_area: lead.staging_area || "TBD after qualification.",
      access_notes: [lead.county ? `County: ${lead.county}` : "", lead.location_notes || ""].filter(Boolean).join("\n"),
      weather_window: lead.decision_timing || "Timing to confirm.",
      customer_preference: lead.preferred_contact_method || null,
      application_rate: sourceInterest ? "SOURCE recommendation pending" : null,
      estimated_duration_hours: acres ? Math.max(1, Math.round((acres / 80) * 10) / 10) : null,
      loadout: sourceInterest ? ["SOURCE acre review worksheet"] : ["Drone application intake worksheet"],
      next_contact: "Confirm field boundary, service timing, and operator requirements.",
    },
    invoice_needed: false,
    jobber_job_id: null,
    jobber_request_id: null,
    created_from_lead_id: lead.id || null,
    created_at: now,
    updated_at: now,
  };

  const note = {
    id: `ops-note-from-${leadId}`,
    organization_id: organizationId,
    job_id: job.id,
    user_id: options.userId || null,
    note: [
      `Created from lead ${leadName}.`,
      lead.email ? `Email: ${lead.email}` : "",
      lead.phone ? `Phone: ${lead.phone}` : "",
      lead.primary_goal ? `Goal: ${lead.primary_goal}` : "",
      lead.decision_timing ? `Timing: ${lead.decision_timing}` : "",
      lead.notes || "",
    ]
      .filter(Boolean)
      .join("\n"),
    visibility: "internal",
    created_at: now,
  };

  return { client, farm, field, job, note };
}

export function getRelevantSops(job = {}) {
  const productText = `${job.service_type || ""} ${job.application_product || ""}`.toLowerCase();
  const sops = [
    { label: "Hylio pre-flight checklist", href: "/training/checklists/hylio-preflight-checklist" },
    { label: "Emergency response SOP", href: "/content/sops/emergency-response-sop.mdx" },
  ];

  if (productText.includes("chemical") || productText.includes("fungicide") || productText.includes("herbicide")) {
    sops.push({ label: "Chemical mixing and loading SOP", href: "/content/sops/chemical-mixing-loading-sop.mdx" });
    sops.push({ label: "Drift management SOP", href: "/content/sops/drift-management-sop.mdx" });
  }

  sops.push({ label: "Hylio post-flight checklist", href: "/training/checklists/hylio-postflight-checklist" });
  return sops;
}
