import { Resend } from "resend";
import {
  FOLLOW_UP_SEQUENCES,
  LEAD_TIERS,
  SMS_CONSENT_DISCLOSURE,
  buildRuleBasedLeadSummary,
  evaluateLead,
  getPreferredOfferPath,
} from "../../shared/harvestLeadEngine.js";
import { getSupabaseServerClient } from "./serverSupabase.js";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

function getFromEmail() {
  return (
    process.env.FROM_EMAIL ||
    process.env.RESEND_FROM_EMAIL ||
    ""
  ).trim();
}

function getAlertEmail() {
  return (
    process.env.ALERT_EMAIL ||
    process.env.INTERNAL_NOTIFICATION_EMAIL ||
    process.env.ADMIN_EMAIL ||
    process.env.NOTIFICATION_EMAIL ||
    ""
  ).trim();
}

function getReplyToEmail() {
  return (
    process.env.REPLY_TO_EMAIL ||
    process.env.ADMIN_EMAIL ||
    process.env.ALERT_EMAIL ||
    ""
  ).trim();
}

function getResendConfiguration() {
  return {
    resendKey: sanitizeString(process.env.RESEND_API_KEY),
    fromEmail: getFromEmail(),
    alertEmail: getAlertEmail(),
    replyToEmail: getReplyToEmail(),
  };
}

function logNotificationSkip({ lead, resendKey, fromEmail, alertEmail }) {
  const missingParts = [];

  if (!resendKey) {
    missingParts.push("RESEND_API_KEY");
  }

  if (!fromEmail) {
    missingParts.push("FROM_EMAIL or RESEND_FROM_EMAIL");
  }

  if (!alertEmail) {
    missingParts.push(
      "ALERT_EMAIL or INTERNAL_NOTIFICATION_EMAIL or ADMIN_EMAIL or NOTIFICATION_EMAIL",
    );
  }

  console.warn(
    `[HarvestLeadNotifications] Skipping notifications for lead ${lead?.id || "unknown"} because the following env vars are missing: ${missingParts.join(", ")}.`,
  );
}

function logNotificationFailure(lead, error) {
  console.error(
    `[HarvestLeadNotifications] Lead ${lead?.id || "unknown"} saved, but notifications failed: ${error?.message || "Unknown notification error"}`,
  );
}

function getAppBaseUrl() {
  if (process.env.APP_BASE_URL) {
    return process.env.APP_BASE_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, "")}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }

  return "";
}

export function isHarvestLeadStorageConfigured() {
  try {
    getSupabaseServerClient();
    return true;
  } catch (_error) {
    return false;
  }
}

export function getHarvestSupabaseClient() {
  return getSupabaseServerClient();
}

function sanitizeString(value) {
  return String(value || "").trim();
}

function sanitizeBoolean(value) {
  return value === true;
}

function renderReasonCodes(reasonCodes = []) {
  return reasonCodes
    .map((reason) => `<li style="margin-bottom:8px;">${reason}</li>`)
    .join("");
}

function buildLeadRecord(payload, evaluation, summary) {
  return {
    first_name: sanitizeString(payload.firstName),
    last_name: sanitizeString(payload.lastName),
    email: sanitizeString(payload.email),
    phone: sanitizeString(payload.phone),
    farm_name: sanitizeString(payload.farmName) || null,
    preferred_contact_method: sanitizeString(payload.preferredContactMethod) || null,
    sms_consent: sanitizeBoolean(payload.smsConsent),
    sms_consent_at: sanitizeBoolean(payload.smsConsent) ? new Date().toISOString() : null,
    sms_consent_language: sanitizeBoolean(payload.smsConsent)
      ? SMS_CONSENT_DISCLOSURE
      : null,
    state: sanitizeString(payload.state),
    county: sanitizeString(payload.county) || null,
    zip: sanitizeString(payload.zip) || null,
    acreage_range: sanitizeString(payload.acreageRange),
    crops: payload.crops || [],
    application_method: sanitizeString(payload.applicationMethod),
    primary_goal: sanitizeString(payload.primaryGoal),
    decision_timing: sanitizeString(payload.decisionTiming),
    interest_level: sanitizeString(payload.interestLevel),
    notes: sanitizeString(payload.notes) || null,
    lead_score: evaluation.leadScore,
    lead_tier: evaluation.leadTier,
    recommended_action: evaluation.recommendedAction,
    reason_codes: evaluation.reasonCodes,
    source: "Harvest Drone Funnel",
    campaign: sanitizeString(payload.campaign) || null,
    ad_set: sanitizeString(payload.ad_set) || null,
    ad_name: sanitizeString(payload.ad_name) || null,
    utm_source: sanitizeString(payload.utm_source) || null,
    utm_medium: sanitizeString(payload.utm_medium) || null,
    utm_campaign: sanitizeString(payload.utm_campaign) || null,
    utm_content: sanitizeString(payload.utm_content) || null,
    utm_term: sanitizeString(payload.utm_term) || null,
    landing_page_url: sanitizeString(payload.landing_page_url) || null,
    referrer: sanitizeString(payload.referrer) || null,
    status: "New",
    assigned_to: null,
    last_contacted_at: null,
    follow_up_stage: "none",
    revenue_status: "unconfirmed",
    estimated_acres: evaluation.estimatedAcres,
    estimated_value: null,
    actual_revenue: null,
    internal_notes: null,
    lead_summary: summary,
    result_headline: evaluation.resultHeadline,
    result_body: evaluation.resultBody,
    result_cta: evaluation.resultCta,
    offer_path: getPreferredOfferPath(evaluation.leadTier),
    dealer_id: payload.dealerId || null,
    dealer_slug: sanitizeString(payload.dealerSlug) || null,
  };
}

function renderLeadAlertHtml(lead) {
  const adminLink = getAppBaseUrl() ? `${getAppBaseUrl()}/admin/leads/${lead.id}` : "";
  const location = [lead.state, lead.county].filter(Boolean).join(" / ");

  return `
    <div style="font-family:Arial,sans-serif;padding:24px;background:#f7f3ea;color:#223025;">
      <div style="max-width:680px;margin:0 auto;background:#fff;border:1px solid #ddd7cc;border-radius:20px;padding:24px;">
        <p style="margin:0 0 12px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#2f6a45;font-weight:700;">Harvest Drone hot lead</p>
        <h1 style="margin:0 0 16px;font-size:28px;line-height:1.1;">New hot SOURCE lead ready for follow-up</h1>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;font-weight:700;">Name</td><td style="padding:8px 0;">${lead.first_name} ${lead.last_name}</td></tr>
          <tr><td style="padding:8px 0;font-weight:700;">Farm name</td><td style="padding:8px 0;">${lead.farm_name || "-"}</td></tr>
          <tr><td style="padding:8px 0;font-weight:700;">Phone</td><td style="padding:8px 0;">${lead.phone}</td></tr>
          <tr><td style="padding:8px 0;font-weight:700;">Email</td><td style="padding:8px 0;">${lead.email}</td></tr>
          <tr><td style="padding:8px 0;font-weight:700;">Preferred contact</td><td style="padding:8px 0;">${lead.preferred_contact_method || "-"}</td></tr>
          <tr><td style="padding:8px 0;font-weight:700;">Location</td><td style="padding:8px 0;">${location || "-"}</td></tr>
          <tr><td style="padding:8px 0;font-weight:700;">Acres</td><td style="padding:8px 0;">${lead.acreage_range}</td></tr>
          <tr><td style="padding:8px 0;font-weight:700;">Crops</td><td style="padding:8px 0;">${(lead.crops || []).join(", ")}</td></tr>
          <tr><td style="padding:8px 0;font-weight:700;">Goal</td><td style="padding:8px 0;">${lead.primary_goal}</td></tr>
          <tr><td style="padding:8px 0;font-weight:700;">Timing</td><td style="padding:8px 0;">${lead.decision_timing}</td></tr>
          <tr><td style="padding:8px 0;font-weight:700;">Score / tier</td><td style="padding:8px 0;">${lead.lead_score} / ${lead.lead_tier}</td></tr>
        </table>
        <div style="margin-top:20px;">
          <p style="font-weight:700;margin:0 0 10px;">Reason codes</p>
          <ul style="margin:0;padding-left:20px;">${renderReasonCodes(lead.reason_codes)}</ul>
        </div>
        <p style="margin-top:20px;"><strong>Recommended action:</strong> ${lead.recommended_action}</p>
        ${adminLink ? `<p style="margin-top:20px;"><a href="${adminLink}" style="color:#2f6a45;font-weight:700;">Open lead detail in admin</a></p>` : ""}
      </div>
    </div>
  `;
}

export async function sendLeadNotifications(lead) {
  const { resendKey, fromEmail, alertEmail, replyToEmail } = getResendConfiguration();

  if (!resendKey || !fromEmail || !alertEmail) {
    logNotificationSkip({ lead, resendKey, fromEmail, alertEmail });
    return {
      alertStatus: "skipped",
      confirmationStatus: "mailchimp_only",
      reason:
        "Resend is not configured for internal alerts. Customer-facing confirmations are handled by Mailchimp.",
    };
  }

  const resend = new Resend(resendKey);
  const location = [lead.state, lead.county].filter(Boolean).join("/");
  const replyToField = replyToEmail ? { replyTo: replyToEmail } : {};

  if (lead.lead_tier === LEAD_TIERS.HOT) {
    await resend.emails.send({
      from: fromEmail,
      to: alertEmail,
      ...replyToField,
      subject: `Hot Harvest Drone Lead: ${lead.first_name} ${lead.last_name} - ${lead.acreage_range} - ${location || "Location pending"}`,
      html: renderLeadAlertHtml(lead),
    });
  }

  return {
    alertStatus: lead.lead_tier === LEAD_TIERS.HOT ? "sent" : "not_required",
    confirmationStatus: "mailchimp_only",
    reason: null,
  };
}

function buildOpenAiPrompt(lead) {
  return [
    "You are helping an internal agricultural sales team follow up on a qualified lead.",
    "Return strict JSON with keys: plainEnglish, whyItMatters, followUpAngle, firstCallScript, suggestedEmailReply.",
    "Keep the tone farmer-friendly, practical, and low-hype.",
    "Do not promise guaranteed yield or ROI.",
    `Lead data: ${JSON.stringify({
      acreage_range: lead.acreage_range,
      crops: lead.crops,
      state: lead.state,
      county: lead.county,
      primary_goal: lead.primary_goal,
      decision_timing: lead.decision_timing,
      interest_level: lead.interest_level,
      lead_score: lead.lead_score,
      lead_tier: lead.lead_tier,
      reason_codes: lead.reason_codes,
      preferred_contact_method: lead.preferred_contact_method,
    })}`,
  ].join("\n");
}

function parseJsonResponse(value) {
  try {
    return JSON.parse(value);
  } catch (_error) {
    return null;
  }
}

export async function generateLeadSummary(lead) {
  const ruleBased = buildRuleBasedLeadSummary(lead);

  if (!process.env.OPENAI_API_KEY) {
    return ruleBased;
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You write concise internal sales summaries for an agricultural lead qualification team.",
          },
          {
            role: "user",
            content: buildOpenAiPrompt(lead),
          },
        ],
      }),
    });

    if (!response.ok) {
      return ruleBased;
    }

    const data = await response.json();
    const parsed = parseJsonResponse(data?.choices?.[0]?.message?.content || "");

    return parsed || ruleBased;
  } catch (_error) {
    return ruleBased;
  }
}

export async function insertHarvestLead(payload) {
  const supabase = getHarvestSupabaseClient();
  let attributedPayload = payload;

  if (payload.dealerSlug) {
    const { data: dealer, error: dealerError } = await supabase
      .from("dealers")
      .select("id, slug, name, contact_email")
      .eq("slug", payload.dealerSlug)
      .eq("is_active", true)
      .single();

    if (dealerError && dealerError.code !== "PGRST116") {
      throw new Error(dealerError.message);
    }

    if (dealer) {
      attributedPayload = {
        ...payload,
        dealerId: dealer.id,
        dealerSlug: dealer.slug,
        notes: [payload.notes, `Dealer attributed: ${dealer.name}`].filter(Boolean).join("\n\n"),
      };
    }
  }

  const evaluation = evaluateLead(attributedPayload);
  const summarySeed = buildLeadRecord(attributedPayload, evaluation, null);
  const leadSummary = await generateLeadSummary(summarySeed);
  const row = buildLeadRecord(attributedPayload, evaluation, leadSummary);

  const { data, error } = await supabase
    .from("harvest_drone_leads")
    .insert(row)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await insertHarvestEvent({
    leadId: data.id,
    eventType: "quiz_submitted",
    eventPayload: {
      lead_score: data.lead_score,
      lead_tier: data.lead_tier,
      source: data.source,
    },
  });

  let notifications = {
    alertStatus: "skipped",
    confirmationStatus: "skipped",
    reason: null,
  };

  try {
    notifications = await sendLeadNotifications(data);
  } catch (error) {
    logNotificationFailure(data, error);
    notifications = {
      alertStatus: "failed",
      confirmationStatus: "mailchimp_only",
      reason: error.message || "Lead saved but notifications failed.",
    };
  }

  return {
    lead: data,
    summary: leadSummary,
    evaluation,
    notifications,
    followUpSequence: FOLLOW_UP_SEQUENCES[data.lead_tier] || [],
  };
}

export async function insertHarvestEvent({ leadId = null, eventType, eventPayload = {} }) {
  const supabase = getHarvestSupabaseClient();
  const { error } = await supabase.from("harvest_drone_events").insert({
    lead_id: leadId,
    event_type: eventType,
    event_payload: eventPayload,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function listHarvestLeads() {
  const supabase = getHarvestSupabaseClient();
  const { data, error } = await supabase
    .from("harvest_drone_leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function getHarvestLeadDetail(leadId) {
  const supabase = getHarvestSupabaseClient();
  const [{ data: lead, error: leadError }, { data: events, error: eventsError }] =
    await Promise.all([
      supabase.from("harvest_drone_leads").select("*").eq("id", leadId).maybeSingle(),
      supabase
        .from("harvest_drone_events")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false }),
    ]);

  if (leadError) {
    throw new Error(leadError.message);
  }

  if (eventsError) {
    throw new Error(eventsError.message);
  }

  return {
    lead,
    events: events || [],
  };
}

function buildUpdateEvents(existingLead, updates) {
  const nextEvents = [];

  if (updates.status && updates.status !== existingLead.status) {
    nextEvents.push({
      eventType: "admin_status_changed",
      eventPayload: {
        from: existingLead.status,
        to: updates.status,
      },
    });

    if (updates.status === "Contacted") {
      nextEvents.push({ eventType: "lead_contacted", eventPayload: { status: updates.status } });
    }

    if (updates.status === "Qualified") {
      nextEvents.push({ eventType: "lead_qualified", eventPayload: { status: updates.status } });
    }

    if (updates.status === "Bad Fit") {
      nextEvents.push({
        eventType: "lead_disqualified",
        eventPayload: { status: updates.status },
      });
    }

    if (updates.status === "Won") {
      nextEvents.push({ eventType: "sale_won", eventPayload: { status: updates.status } });
    }

    if (updates.status === "Lost") {
      nextEvents.push({ eventType: "sale_lost", eventPayload: { status: updates.status } });
    }
  }

  if (
    updates.revenue_status &&
    updates.revenue_status !== existingLead.revenue_status
  ) {
    if (updates.revenue_status === "won") {
      nextEvents.push({
        eventType: "sale_won",
        eventPayload: { revenue_status: updates.revenue_status },
      });
    }

    if (updates.revenue_status === "lost") {
      nextEvents.push({
        eventType: "sale_lost",
        eventPayload: { revenue_status: updates.revenue_status },
      });
    }
  }

  if (
    updates.last_contacted_at &&
    updates.last_contacted_at !== existingLead.last_contacted_at
  ) {
    nextEvents.push({
      eventType: "lead_contacted",
      eventPayload: { last_contacted_at: updates.last_contacted_at },
    });
  }

  return nextEvents;
}

export async function updateHarvestLead(leadId, updates) {
  const supabase = getHarvestSupabaseClient();
  const allowedKeys = [
    "status",
    "assigned_to",
    "internal_notes",
    "follow_up_stage",
    "estimated_acres",
    "estimated_value",
    "actual_revenue",
    "last_contacted_at",
    "revenue_status",
  ];

  const safeUpdates = Object.fromEntries(
    Object.entries(updates || {}).filter(([key]) => allowedKeys.includes(key)),
  );

  const { data: existingLead, error: existingError } = await supabase
    .from("harvest_drone_leads")
    .select("*")
    .eq("id", leadId)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (!existingLead) {
    throw new Error("Lead not found.");
  }

  const updateEvents = buildUpdateEvents(existingLead, safeUpdates);

  const { data: updatedLead, error: updateError } = await supabase
    .from("harvest_drone_leads")
    .update({
      ...safeUpdates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", leadId)
    .select("*")
    .single();

  if (updateError) {
    throw new Error(updateError.message);
  }

  if (updateEvents.length) {
    await Promise.all(
      updateEvents.map((event) =>
        insertHarvestEvent({
          leadId,
          eventType: event.eventType,
          eventPayload: event.eventPayload,
        }),
      ),
    );
  }

  const detail = await getHarvestLeadDetail(leadId);
  return {
    lead: updatedLead,
    events: detail.events,
  };
}
