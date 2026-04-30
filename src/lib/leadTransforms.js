import { buildSourceReviewSummary } from "../../shared/sourceReview.js";

export const DEFAULT_LEAD_STATUS = "new";
export const GROWER_LEAD_SOURCE = "website-grower-funnel";
export const SOURCE_REVIEW_LEAD_SOURCE = "website-source-acre-review";
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
  const splitName = splitFullName(
    formData.name || [formData.firstName, formData.lastName].filter(Boolean).join(" "),
  );
  const leadSource = formData.leadSource || GROWER_LEAD_SOURCE;
  const sourceReview = buildSourceReviewSummary({
    ...formData,
    phone: formData.phone || formData.mobile,
  });
  const notes = [
    formData.notes,
    formData.nitrogenProgramNotes
      ? `Nitrogen program notes: ${formData.nitrogenProgramNotes}`
      : null,
    formData.phosphorusProgramNotes
      ? `Phosphorus program notes: ${formData.phosphorusProgramNotes}`
      : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    status: DEFAULT_LEAD_STATUS,
    lead_source: leadSource,
    source: leadSource,
    first_name: formData.firstName || splitName.firstName || "Grower",
    last_name: formData.lastName || splitName.lastName || "",
    mobile: formData.phone || formData.mobile || "",
    email: formData.email,
    farm_name: formData.farmName || null,
    state: formData.state,
    county: formData.county || formData.countyOrTown || null,
    crop_type: formData.cropType,
    acres: Number(formData.acres),
    interest_type: formData.interestType,
    fertility_concern: formData.fertilityConcern || null,
    review_timeline: formData.timeline || null,
    preferred_contact_method: formData.preferredContactMethod || null,
    nitrogen_program_notes: formData.nitrogenProgramNotes || null,
    phosphorus_program_notes: formData.phosphorusProgramNotes || null,
    fit_score: sourceReview.reviewPriority,
    lead_priority: sourceReview.leadPriority,
    priority_tags: sourceReview.priorityTags,
    conversation_focus: sourceReview.conversationFocus,
    landing_page: formData.landingPage || null,
    page_version: formData.pageVersion || null,
    utm_source: formData.utm_source || null,
    utm_medium: formData.utm_medium || null,
    utm_campaign: formData.utm_campaign || null,
    utm_content: formData.utm_content || null,
    utm_term: formData.utm_term || null,
    current_spraying_method: formData.sprayingMethod || null,
    interested_in_product_recommendations:
      formData.productInterest === "Yes" || formData.interestType === "SOURCE product",
    notes,
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
    name: [row.first_name, row.last_name].filter(Boolean).join(" ").trim(),
    phone: row.mobile,
    mobile: row.mobile,
    email: row.email,
    farmName: row.farm_name,
    state: row.state,
    county: row.county,
    cropType: row.crop_type,
    acres: row.acres?.toString?.() ?? row.acres,
    interestType: row.interest_type,
    fertilityConcern: row.fertility_concern,
    timeline: row.review_timeline,
    preferredContactMethod: row.preferred_contact_method,
    nitrogenProgramNotes: row.nitrogen_program_notes,
    phosphorusProgramNotes: row.phosphorus_program_notes,
    fitScore: row.fit_score,
    leadPriority: row.lead_priority,
    priorityTags: row.priority_tags,
    conversationFocus: row.conversation_focus,
    landingPage: row.landing_page,
    pageVersion: row.page_version,
    utm_source: row.utm_source,
    utm_medium: row.utm_medium,
    utm_campaign: row.utm_campaign,
    utm_content: row.utm_content,
    utm_term: row.utm_term,
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
