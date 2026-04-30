import { estimateHylioPipelineValue } from "../../src/lib/hylioPipeline.js";

function fullName(firstName, lastName) {
  return [firstName, lastName].filter(Boolean).join(" ").trim();
}

function accountNameForLead(type, lead, payload) {
  if (type === "grower") {
    return lead.farm_name || fullName(lead.first_name, lead.last_name) || "Grower account";
  }

  if (type === "hylio") {
    return lead.company_name || payload.name || "Hylio account";
  }

  return lead.company_name || fullName(lead.first_name, lead.last_name) || "Operator account";
}

function accountTypeForLead(type) {
  if (type === "grower") {
    return "grower";
  }

  if (type === "hylio") {
    return "hylio";
  }

  return "operator";
}

function leadStageForType(type, lead) {
  if (type === "hylio") {
    return lead.status || "new";
  }

  return lead.status || "new";
}

function routeTypeForLead(type, lead, routingDecision) {
  if (type === "grower") {
    return routingDecision?.routeType ?? lead.route_type ?? "direct_hd";
  }

  if (type === "hylio") {
    return "direct_hd";
  }

  if (type === "operator") {
    return "operator_pool";
  }

  return null;
}

function opportunityTypeForLead(type, routingDecision) {
  if (type === "grower") {
    return routingDecision?.routeType === "route_to_operator"
      ? "operator_routed"
      : "grower_direct";
  }

  if (type === "hylio") {
    return "hylio_sale";
  }

  return null;
}

function revenueStreamForOpportunity(type, routingDecision) {
  if (type === "grower") {
    return routingDecision?.routeType === "route_to_operator"
      ? "routed_acreage"
      : "direct_service";
  }

  if (type === "hylio") {
    return "hylio_sale";
  }

  return null;
}

function estimateOpportunityValue(type, lead, payload) {
  if (type === "hylio") {
    return estimateHylioPipelineValue(lead.budget_range || payload.budgetRange);
  }

  if (type === "grower") {
    const acres = Number(lead.acres ?? 0);
    return acres * 15;
  }

  return 0;
}

export async function syncLeadToCrm({
  supabase,
  type,
  payload,
  lead,
  routingDecision = null,
  opportunityRecord = null,
}) {
  const accountInsert = {
    name: accountNameForLead(type, lead, payload),
    account_type: accountTypeForLead(type),
    owner: lead.assigned_to || "Harvest Drone",
    state: lead.state || null,
    county: lead.county || lead.counties_served || null,
    acres: lead.acres ?? lead.acreage_access ?? lead.acreage_capacity ?? null,
    source: lead.source || lead.lead_source || null,
    notes: lead.notes || null,
    metadata: {
      legacy_grower_lead_id: type === "grower" ? lead.id : null,
      legacy_operator_lead_id: type !== "grower" ? lead.id : null,
      route_type: routeTypeForLead(type, lead, routingDecision),
      landing_page: lead.landing_page ?? null,
      page_version: lead.page_version ?? null,
    },
  };

  const { data: account, error: accountError } = await supabase
    .from("crm_accounts")
    .insert(accountInsert)
    .select("*")
    .single();

  if (accountError) {
    throw new Error(accountError.message);
  }

  const contactInsert = {
    account_id: account.id,
    first_name: lead.first_name,
    last_name: lead.last_name || null,
    full_name: fullName(lead.first_name, lead.last_name) || payload.name || "Unknown contact",
    email: lead.email || null,
    mobile: lead.mobile || null,
    contact_type: accountTypeForLead(type),
    owner: lead.assigned_to || "Harvest Drone",
    state: lead.state || null,
    county: lead.county || lead.counties_served || null,
    source: lead.source || lead.lead_source || null,
    notes: lead.notes || null,
    metadata: {
      budget_range: lead.budget_range ?? null,
      experience_level: lead.experience_level ?? null,
      preferred_contact_method: lead.preferred_contact_method ?? null,
    },
  };

  const { data: contact, error: contactError } = await supabase
    .from("crm_contacts")
    .insert(contactInsert)
    .select("*")
    .single();

  if (contactError) {
    throw new Error(contactError.message);
  }

  const crmLeadInsert = {
    account_id: account.id,
    contact_id: contact.id,
    lead_type: type,
    stage: leadStageForType(type, lead),
    route_type: routeTypeForLead(type, lead, routingDecision),
    owner: lead.assigned_to || "Harvest Drone",
    source: lead.source || lead.lead_source || null,
    state: lead.state || null,
    county: lead.county || lead.counties_served || null,
    acres: lead.acres ?? lead.acreage_access ?? lead.acreage_capacity ?? null,
    revenue_stream:
      type === "grower"
        ? routingDecision?.routeType === "route_to_operator"
          ? "routed_acreage"
          : "direct_service"
        : type === "hylio"
          ? "hylio_sale"
          : "operator_network",
    assigned_operator_id: lead.assigned_operator_id ?? null,
    legacy_grower_lead_id: type === "grower" ? lead.id : null,
    legacy_operator_lead_id: type !== "grower" ? lead.id : null,
    notes: lead.notes || null,
    metadata: {
      route_type: routeTypeForLead(type, lead, routingDecision),
      lead_score: lead.lead_score ?? null,
      operator_score: lead.operator_score ?? null,
      calculator_used: Boolean(payload.calculatorInputs),
      fit_score: lead.fit_score ?? null,
      lead_priority: lead.lead_priority ?? null,
      priority_tags: lead.priority_tags ?? [],
      conversation_focus: lead.conversation_focus ?? [],
      fertility_concern: lead.fertility_concern ?? null,
      review_timeline: lead.review_timeline ?? null,
      landing_page: lead.landing_page ?? null,
      page_version: lead.page_version ?? null,
      utm_source: lead.utm_source ?? null,
      utm_medium: lead.utm_medium ?? null,
      utm_campaign: lead.utm_campaign ?? null,
      utm_content: lead.utm_content ?? null,
      utm_term: lead.utm_term ?? null,
    },
  };

  const { data: crmLead, error: crmLeadError } = await supabase
    .from("crm_leads")
    .insert(crmLeadInsert)
    .select("*")
    .single();

  if (crmLeadError) {
    throw new Error(crmLeadError.message);
  }

  let crmOpportunity = null;
  const opportunityType = opportunityTypeForLead(type, routingDecision);

  if (opportunityType) {
    const opportunityInsert = {
      account_id: account.id,
      contact_id: contact.id,
      lead_id: crmLead.id,
      opportunity_type: opportunityType,
      stage: type === "hylio" ? "new" : opportunityRecord?.status || "open",
      route_type: routeTypeForLead(type, lead, routingDecision),
      owner: lead.assigned_to || "Harvest Drone",
      state: lead.state || null,
      county: lead.county || lead.counties_served || null,
      acres: lead.acres ?? lead.acreage_access ?? lead.acreage_capacity ?? null,
      estimated_value: estimateOpportunityValue(type, lead, payload),
      revenue_stream: revenueStreamForOpportunity(type, routingDecision),
      hylio_budget_range: type === "hylio" ? lead.budget_range ?? payload.budgetRange ?? null : null,
      hylio_experience_level:
        type === "hylio" ? lead.experience_level ?? payload.experienceLevel ?? null : null,
      hylio_area_qualified:
        type === "hylio" ? ["contacted", "qualified", "call_scheduled", "closed_won"].includes(lead.status) : null,
      legacy_job_id: opportunityRecord?.id ?? null,
      notes: lead.notes || null,
      metadata: {
        route_type: routeTypeForLead(type, lead, routingDecision),
        budget_range: lead.budget_range ?? null,
      },
    };

    const { data: insertedOpportunity, error: opportunityError } = await supabase
      .from("crm_opportunities")
      .insert(opportunityInsert)
      .select("*")
      .single();

    if (opportunityError) {
      throw new Error(opportunityError.message);
    }

    crmOpportunity = insertedOpportunity;
  }

  const activities = [
    {
      account_id: account.id,
      contact_id: contact.id,
      lead_id: crmLead.id,
      opportunity_id: crmOpportunity?.id ?? null,
      activity_type: "lead_created",
      stage: crmLead.stage,
      owner: crmLead.owner,
      state: crmLead.state,
      subject: `${type} lead captured`,
      outcome: "Lead entered CRM",
      metadata: {
        source: crmLead.source,
      },
    },
  ];

  if (crmOpportunity) {
    activities.push({
      account_id: account.id,
      contact_id: contact.id,
      lead_id: crmLead.id,
      opportunity_id: crmOpportunity.id,
      activity_type: "opportunity_created",
      stage: crmOpportunity.stage,
      owner: crmOpportunity.owner,
      state: crmOpportunity.state,
      subject: `${crmOpportunity.opportunity_type} created`,
      outcome: "Opportunity opened",
      metadata: {
        estimated_value: crmOpportunity.estimated_value,
      },
    });
  }

  if (type === "grower") {
    const { error: acresError } = await supabase.from("crm_acres").insert({
      account_id: account.id,
      contact_id: contact.id,
      lead_id: crmLead.id,
      opportunity_id: crmOpportunity?.id ?? null,
      acres: Number(lead.acres ?? 0),
      crop_type: lead.crop_type ?? null,
      state: lead.state ?? null,
      county: lead.county ?? null,
      route_type: routeTypeForLead(type, lead, routingDecision),
      owner: crmLead.owner,
      source: crmLead.source,
      metadata: {
        legacy_grower_lead_id: lead.id,
        fit_score: lead.fit_score ?? null,
        lead_priority: lead.lead_priority ?? null,
      },
    });

    if (acresError) {
      throw new Error(acresError.message);
    }
  }

  if (type === "operator" || type === "hylio") {
    const { error: operatorError } = await supabase.from("crm_operators").insert({
      account_id: account.id,
      contact_id: contact.id,
      lead_id: crmLead.id,
      legacy_operator_lead_id: lead.id,
      operator_type: type,
      status: lead.status || "new",
      state: lead.state ?? null,
      counties_served: lead.counties_served ?? null,
      acreage_capacity: lead.acreage_access ?? lead.acreage_capacity ?? null,
      equipment_details: lead.equipment_details ?? null,
      compliance_status: lead.compliance_status ?? null,
      experience_level: lead.experience_level ?? null,
      budget_range: lead.budget_range ?? null,
      owner: crmLead.owner,
      metadata: {
        route_type: routeTypeForLead(type, lead, routingDecision),
        operator_score: lead.operator_score ?? null,
      },
    });

    if (operatorError) {
      throw new Error(operatorError.message);
    }
  }

  const { error: activityError } = await supabase.from("crm_activities").insert(activities);

  if (activityError) {
    throw new Error(activityError.message);
  }

  return {
    account,
    contact,
    crmLead,
    crmOpportunity,
  };
}
