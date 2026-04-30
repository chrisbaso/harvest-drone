import {
  SMS_CONSENT_DISCLOSURE,
  buildRuleBasedLeadSummary,
  evaluateLead,
} from "../../shared/harvestLeadEngine";

const LEADS_KEY = "harvest-drone-local-leads-v1";
const EVENTS_KEY = "harvest-drone-local-events-v1";
const DRAFT_KEY = "harvest-drone-quiz-draft-v1";

function getStorage() {
  return typeof window === "undefined" ? null : window.localStorage;
}

function readJson(key, fallback) {
  const storage = getStorage();

  if (!storage) {
    return fallback;
  }

  try {
    return JSON.parse(storage.getItem(key) || JSON.stringify(fallback));
  } catch (_error) {
    return fallback;
  }
}

function writeJson(key, value) {
  getStorage()?.setItem(key, JSON.stringify(value));
}

function generateLocalId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
}

export function loadDraft() {
  return readJson(DRAFT_KEY, null);
}

export function saveDraft(draft) {
  writeJson(DRAFT_KEY, draft);
}

export function clearDraft() {
  getStorage()?.removeItem(DRAFT_KEY);
}

export function listLocalLeads() {
  return readJson(LEADS_KEY, []);
}

export function listLocalEvents() {
  return readJson(EVENTS_KEY, []);
}

export function saveLeadLocally(payload) {
  const evaluation = evaluateLead(payload);
  const lead = {
    id: generateLocalId("lead"),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    first_name: payload.firstName,
    last_name: payload.lastName,
    email: payload.email,
    phone: payload.phone,
    farm_name: payload.farmName,
    preferred_contact_method: payload.preferredContactMethod,
    sms_consent: Boolean(payload.smsConsent),
    sms_consent_at: payload.smsConsent ? new Date().toISOString() : null,
    sms_consent_language: payload.smsConsent ? SMS_CONSENT_DISCLOSURE : null,
    state: payload.state,
    county: payload.county,
    zip: payload.zip,
    acreage_range: payload.acreageRange,
    crops: payload.crops,
    application_method: payload.applicationMethod,
    primary_goal: payload.primaryGoal,
    decision_timing: payload.decisionTiming,
    interest_level: payload.interestLevel,
    notes: payload.notes,
    lead_score: evaluation.leadScore,
    lead_tier: evaluation.leadTier,
    recommended_action: evaluation.recommendedAction,
    reason_codes: evaluation.reasonCodes,
    result_headline: evaluation.resultHeadline,
    result_body: evaluation.resultBody,
    result_cta: evaluation.resultCta,
    source: "Harvest Drone Funnel",
    campaign: payload.campaign || null,
    ad_set: payload.ad_set || null,
    ad_name: payload.ad_name || null,
    utm_source: payload.utm_source || null,
    utm_medium: payload.utm_medium || null,
    utm_campaign: payload.utm_campaign || null,
    utm_content: payload.utm_content || null,
    utm_term: payload.utm_term || null,
    landing_page_url: payload.landing_page_url || null,
    referrer: payload.referrer || null,
    status: "New",
    assigned_to: "",
    last_contacted_at: null,
    follow_up_stage: "none",
    revenue_status: "unconfirmed",
    estimated_acres: evaluation.estimatedAcres,
    estimated_value: null,
    actual_revenue: null,
    internal_notes: "",
    lead_summary: buildRuleBasedLeadSummary({
      ...payload,
      ...evaluation,
      first_name: payload.firstName,
      last_name: payload.lastName,
      acreage_range: payload.acreageRange,
      primary_goal: payload.primaryGoal,
      decision_timing: payload.decisionTiming,
      interest_level: payload.interestLevel,
      preferred_contact_method: payload.preferredContactMethod,
    }),
    offer_path: evaluation.offerPath,
    storage_mode: "local",
  };

  const leads = [lead, ...listLocalLeads()];
  writeJson(LEADS_KEY, leads);
  return lead;
}

export function saveEventLocally(event) {
  const events = [event, ...listLocalEvents()];
  writeJson(EVENTS_KEY, events);
  return event;
}

export function createLocalEvent({ leadId = null, eventType, eventPayload = {} }) {
  return {
    id: generateLocalId("event"),
    created_at: new Date().toISOString(),
    lead_id: leadId,
    event_type: eventType,
    event_payload: eventPayload,
    storage_mode: "local",
  };
}

export function getLocalLeadDetail(leadId) {
  const lead = listLocalLeads().find((item) => item.id === leadId) || null;
  const events = listLocalEvents().filter((event) => event.lead_id === leadId);
  return { lead, events };
}

export function updateLocalLead(leadId, updates) {
  const leads = listLocalLeads();
  let updatedLead = null;

  const nextLeads = leads.map((lead) => {
    if (lead.id !== leadId) {
      return lead;
    }

    updatedLead = {
      ...lead,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    return updatedLead;
  });

  writeJson(LEADS_KEY, nextLeads);
  return updatedLead;
}
