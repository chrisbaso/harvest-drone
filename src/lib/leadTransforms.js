export const DEFAULT_LEAD_STATUS = "new";
export const GROWER_LEAD_SOURCE = "website-grower-funnel";
export const OPERATOR_LEAD_SOURCE = "website-operator-funnel";
export const HYLIO_LEAD_SOURCE = "website-hylio-funnel";

function splitFullName(value = "") {
  const parts = String(value).trim().split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

function mapHylioExperienceToCompliance(value) {
  const normalized = String(value ?? "").trim();

  if (normalized === "Current drone operator") {
    return "Approved and compliant";
  }

  if (normalized === "Ag service provider expanding into drones") {
    return "Licensed with paperwork in progress";
  }

  if (normalized === "Entrepreneur entering ag drones") {
    return "Licensed with paperwork in progress";
  }

  return "Not ready";
}

export function createGrowerLeadPayload(formData) {
  return {
    status: DEFAULT_LEAD_STATUS,
    lead_source: GROWER_LEAD_SOURCE,
    source: GROWER_LEAD_SOURCE,
    first_name: formData.firstName,
    last_name: formData.lastName,
    mobile: formData.mobile,
    email: formData.email,
    farm_name: formData.farmName,
    state: formData.state,
    county: formData.county,
    crop_type: formData.cropType,
    acres: Number(formData.acres),
    interest_type: formData.interestType,
    current_spraying_method: formData.sprayingMethod,
    interested_in_product_recommendations: formData.productInterest === "Yes",
    notes: formData.notes,
  };
}

export function createOperatorLeadPayload(formData) {
  const acreageCapacity = Number(formData.weeklyCapacity ?? formData.acreageAccess);

  return {
    status: DEFAULT_LEAD_STATUS,
    lead_source: OPERATOR_LEAD_SOURCE,
    source: OPERATOR_LEAD_SOURCE,
    first_name: formData.firstName,
    last_name: formData.lastName,
    mobile: formData.mobile,
    email: formData.email,
    company_name: formData.companyName,
    state: formData.state,
    counties_served: formData.countiesServed,
    equipment_details: formData.equipmentDetails,
    compliance_status: formData.complianceStatus,
    acreage_capacity: acreageCapacity,
    acres_capacity_per_week: acreageCapacity,
    interest_type: formData.interestType,
    owns_spray_drone: formData.equipmentDetails ? true : null,
    drone_model: formData.equipmentDetails,
    licensed_for_application:
      formData.complianceStatus === "Active and compliant" ||
      formData.complianceStatus === "Approved and compliant" ||
      formData.complianceStatus === "Licensed with paperwork in progress",
    notes: formData.notes,
  };
}

export function createHylioLeadPayload(formData) {
  const splitName = splitFullName(formData.name);
  const acreageAccess = Number(formData.acreageAccess);
  const experienceLevel = formData.experienceLevel;
  const budgetRange = formData.budgetRange;
  const usedCalculator = Boolean(formData.calculatorInputs);
  const calculatorInputs = formData.calculatorInputs || {};

  return {
    status: DEFAULT_LEAD_STATUS,
    lead_source: HYLIO_LEAD_SOURCE,
    source: HYLIO_LEAD_SOURCE,
    first_name: splitName.firstName,
    last_name: splitName.lastName,
    mobile: formData.mobile,
    email: formData.email,
    company_name: formData.companyName || "Hylio Funnel Lead",
    state: formData.state,
    counties_served: formData.countiesServed,
    equipment_details: formData.equipmentDetails || "Exploring Hylio ag drone opportunity",
    compliance_status: mapHylioExperienceToCompliance(experienceLevel),
    acreage_access: acreageAccess,
    acreage_capacity: acreageAccess,
    acres_capacity_per_week: acreageAccess,
    experience_level: experienceLevel,
    budget_range: budgetRange,
    calculator_acres_per_month: calculatorInputs.acresPerMonth ?? null,
    calculator_revenue_per_acre: calculatorInputs.revenuePerAcre ?? null,
    calculator_months_active_per_year: calculatorInputs.monthsActivePerYear ?? null,
    calculator_equipment_cost: calculatorInputs.equipmentCost ?? null,
    calculator_growth_factor: calculatorInputs.growthFactor ?? null,
    interest_type: "High Ticket",
    owns_spray_drone: null,
    drone_model: "Hylio",
    licensed_for_application: false,
    notes: [
      "High Ticket Hylio Lead",
      `Acreage access: ${formData.acreageAccess || "-"}`,
      `Experience level: ${experienceLevel || "-"}`,
      `Budget range: ${budgetRange || "-"}`,
      `Used calculator: ${usedCalculator ? "Yes" : "No"}`,
    ].join(" | "),
  };
}

export function mapGrowerLeadRowToEmailPayload(row) {
  return {
    firstName: row.first_name,
    lastName: row.last_name,
    mobile: row.mobile,
    email: row.email,
    farmName: row.farm_name,
    state: row.state,
    county: row.county,
    cropType: row.crop_type,
    acres: row.acres?.toString?.() ?? row.acres,
    interestType: row.interest_type,
    sprayingMethod: row.current_spraying_method,
    productInterest: row.interested_in_product_recommendations ? "Yes" : "No",
    notes: row.notes,
  };
}

export function mapOperatorLeadRowToEmailPayload(row) {
  return {
    firstName: row.first_name,
    lastName: row.last_name,
    fullName: [row.first_name, row.last_name].filter(Boolean).join(" "),
    mobile: row.mobile,
    email: row.email,
    companyName: row.company_name,
    state: row.state,
    countiesServed: row.counties_served,
    equipmentDetails: row.equipment_details ?? row.drone_model,
    complianceStatus: row.compliance_status,
    weeklyCapacity: row.acres_capacity_per_week?.toString?.() ?? row.acres_capacity_per_week,
    acreageAccess: row.acreage_access?.toString?.() ?? row.acreage_capacity?.toString?.() ?? row.acreage_capacity,
    interestType: row.interest_type,
    experienceLevel: row.experience_level,
    budgetRange: row.budget_range,
    calculatorInputs: {
      acresPerMonth: row.calculator_acres_per_month,
      revenuePerAcre: row.calculator_revenue_per_acre,
      monthsActivePerYear: row.calculator_months_active_per_year,
      equipmentCost: row.calculator_equipment_cost,
      growthFactor: row.calculator_growth_factor,
    },
    source: row.source || row.lead_source,
    notes: row.notes,
  };
}

export function mapLeadRowToEmailPayload(type, row) {
  if (type === "grower") {
    return mapGrowerLeadRowToEmailPayload(row);
  }

  if (type === "operator") {
    return mapOperatorLeadRowToEmailPayload(row);
  }

  return null;
}

export function formatLeadName(lead) {
  return [lead.first_name, lead.last_name].filter(Boolean).join(" ");
}

export function formatLeadAccount(lead) {
  return lead.lead_type === "grower" ? lead.farm_name : lead.company_name;
}

export function normalizeGrowerLead(row) {
  return {
    ...row,
    lead_type: "grower",
    created_at: row.created_at,
  };
}

export function normalizeOperatorLead(row) {
  return {
    ...row,
    lead_type: "operator",
    created_at: row.created_at,
  };
}
