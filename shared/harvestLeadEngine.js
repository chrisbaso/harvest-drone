export const HARVEST_STORAGE_MODE = {
  SERVER: "server",
  LOCAL: "local",
};

export const LEAD_TIERS = {
  HOT: "Hot",
  WARM: "Warm",
  NURTURE: "Nurture",
  LOW_FIT: "Low Fit",
};

export const LEAD_STATUS_OPTIONS = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal / Plan Sent",
  "Won",
  "Lost",
  "Nurture",
  "Bad Fit",
];

export const FOLLOW_UP_STAGE_OPTIONS = [
  "none",
  "day_0",
  "day_1",
  "day_3",
  "day_5",
  "day_7",
  "day_14",
  "manual",
];

export const REVENUE_STATUS_OPTIONS = [
  "unconfirmed",
  "projected",
  "won",
  "lost",
];

export const ACREAGE_OPTIONS = [
  "Under 500",
  "500-999",
  "1,000-2,499",
  "2,500-4,999",
  "5,000+",
];

export const CROP_OPTIONS = [
  "Corn",
  "Soybeans",
  "Corn and soybeans",
  "Wheat",
  "Alfalfa / hay",
  "Other",
];

export const APPLICATION_METHOD_OPTIONS = [
  "Ground rig",
  "Custom applicator",
  "Aerial application",
  "Drone application",
  "Not consistent / still deciding",
  "Other",
];

export const PRIMARY_GOAL_OPTIONS = [
  "Increasing yield potential",
  "Improving nutrient efficiency",
  "Reducing fertilizer dependency",
  "Testing SOURCE on select acres",
  "Learning whether this fits my farm",
  "Other",
];

export const TIMING_OPTIONS = [
  "Immediately / this season",
  "Within 30 days",
  "1-3 months",
  "Planning ahead",
  "Just researching",
];

export const INTEREST_LEVEL_OPTIONS = [
  "Very open",
  "Somewhat open",
  "Need more information",
  "Skeptical but curious",
  "Not interested yet",
];

export const CONTACT_METHOD_OPTIONS = ["Phone", "Text", "Email"];
export const SMS_CONSENT_DISCLOSURE =
  "I agree to receive text messages from Harvest Drone about my SOURCE fit check, follow-up, and related service information at the phone number provided. Consent is not a condition of purchase. Message frequency varies. Message and data rates may apply. Reply STOP to opt out.";

export const EVENT_TYPES = [
  "landing_page_view",
  "quiz_started",
  "quiz_step_completed",
  "quiz_submitted",
  "result_viewed",
  "cta_clicked",
  "admin_status_changed",
  "lead_contacted",
  "lead_qualified",
  "lead_disqualified",
  "sale_won",
  "sale_lost",
];

const acreageScores = {
  "Under 500": 5,
  "500-999": 15,
  "1,000-2,499": 25,
  "2,500-4,999": 30,
  "5,000+": 35,
};

const acreageEstimates = {
  "Under 500": 250,
  "500-999": 750,
  "1,000-2,499": 1750,
  "2,500-4,999": 3750,
  "5,000+": 5000,
};

const cropScores = {
  Corn: 15,
  Soybeans: 12,
  "Corn and soybeans": 20,
  Wheat: 8,
  "Alfalfa / hay": 5,
  Other: 2,
};

const applicationScores = {
  "Drone application": 15,
  "Aerial application": 12,
  "Custom applicator": 10,
  "Ground rig": 8,
  "Not consistent / still deciding": 6,
  Other: 3,
};

const goalScores = {
  "Increasing yield potential": 12,
  "Improving nutrient efficiency": 15,
  "Reducing fertilizer dependency": 15,
  "Testing SOURCE on select acres": 18,
  "Learning whether this fits my farm": 8,
  Other: 3,
};

const timingScores = {
  "Immediately / this season": 20,
  "Within 30 days": 18,
  "1-3 months": 12,
  "Planning ahead": 6,
  "Just researching": 2,
};

const interestScores = {
  "Very open": 20,
  "Somewhat open": 14,
  "Need more information": 8,
  "Skeptical but curious": 5,
  "Not interested yet": 0,
};

const tierContent = {
  [LEAD_TIERS.HOT]: {
    headline: "Your Acres Look Like a Strong Fit for Review",
    body:
      "Based on your acreage, crop profile, timing, and interest level, your operation appears to be a strong candidate for a custom SOURCE application discussion.",
    cta: "Request My Custom Plan",
    offerPath: "Custom SOURCE Application Review",
  },
  [LEAD_TIERS.WARM]: {
    headline: "Your Farm May Be a Fit",
    body:
      "Your answers suggest SOURCE may be worth evaluating, especially if you are looking at nutrient efficiency, yield potential, or a trial on select acres.",
    cta: "Get More Info",
    offerPath: "SOURCE Fit Guide",
  },
  [LEAD_TIERS.NURTURE]: {
    headline: "Worth Learning More",
    body:
      "Based on your answers, this may be more of an education-stage fit. We'll send practical information about how SOURCE is used and when it may make sense.",
    cta: "Send Me the Guide",
    offerPath: "Planning Guide",
  },
  [LEAD_TIERS.LOW_FIT]: {
    headline: "Probably Not an Immediate Fit",
    body:
      "Based on your answers, this may not be an urgent fit right now, but you can still receive updates and practical information.",
    cta: "Keep Me Updated",
    offerPath: "Stay Updated",
  },
};

export const RESULTS_DISCLAIMER =
  "This tool provides an estimate for discussion purposes only. Actual results vary by field, crop, timing, fertility program, weather, application method, and other agronomic factors. This is not a guarantee of yield increase or input savings.";

export const FOLLOW_UP_SEQUENCES = {
  [LEAD_TIERS.HOT]: [
    {
      day: 0,
      subject: "Your SOURCE fit check",
      message:
        "Based on your answers, your operation looks like it may be a strong fit for a SOURCE application discussion. The next step is reviewing acres, crop plan, and timing.",
    },
    {
      day: 1,
      subject: "Quick follow-up on your acres",
      message:
        "Wanted to make sure we connect while timing is still useful. A short review can help determine whether SOURCE makes sense for select acres or a broader plan.",
    },
    {
      day: 3,
      subject: "Worth reviewing before application windows tighten",
      message:
        "Timing matters. If you are considering SOURCE this season, it is worth reviewing acres and logistics soon.",
    },
  ],
  [LEAD_TIERS.WARM]: [
    {
      day: 0,
      subject: "What SOURCE is designed to do",
      message:
        "SOURCE is designed to help crops access nutrients already present in the field. The next step is deciding whether it may fit your acres, crop plan, and timing.",
    },
    {
      day: 3,
      subject: "When SOURCE may fit",
      message:
        "SOURCE tends to be worth reviewing when nutrient efficiency, timing, or a measured trial on select acres is part of the conversation.",
    },
    {
      day: 7,
      subject: "Want to test it on select acres?",
      message:
        "If you are still evaluating fit, Harvest Drone can help review whether a limited SOURCE trial or broader plan makes sense.",
    },
  ],
  [LEAD_TIERS.NURTURE]: [
    {
      day: 0,
      subject: "Thanks - here's more info",
      message:
        "Thanks for taking the fit check. We'll keep the next steps practical and share more context on where SOURCE may fit.",
    },
    {
      day: 5,
      subject: "How growers think about nutrient efficiency",
      message:
        "Many growers start by asking where nutrient efficiency may be improved without overhauling the whole fertility program.",
    },
    {
      day: 14,
      subject: "Planning ahead for next season",
      message:
        "If timing is not immediate, planning ahead can make it easier to decide whether SOURCE is worth revisiting next season.",
    },
  ],
  [LEAD_TIERS.LOW_FIT]: [
    {
      day: 0,
      subject: "Thanks - we'll keep you updated.",
      message:
        "Thanks for taking the fit check. We'll keep you updated with practical information and avoid urgent sales pressure.",
    },
  ],
};

export function createEmptyLeadDraft() {
  return {
    acreageRange: "",
    crops: [],
    state: "",
    county: "",
    zip: "",
    applicationMethod: "",
    product: "",
    primaryGoal: "",
    decisionTiming: "",
    interestLevel: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    farmName: "",
    preferredContactMethod: "",
    smsConsent: false,
    notes: "",
  };
}

export function formatDateLabel(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function estimateAcresFromRange(range) {
  return acreageEstimates[range] ?? null;
}

export function formatCrops(crops) {
  if (!Array.isArray(crops) || crops.length === 0) {
    return "Not provided";
  }

  return crops.join(", ");
}

export function getPreferredOfferPath(tier) {
  return tierContent[tier]?.offerPath ?? tierContent[LEAD_TIERS.LOW_FIT].offerPath;
}

export function getLeadTierContent(tier) {
  return tierContent[tier] ?? tierContent[LEAD_TIERS.LOW_FIT];
}

export function getFollowUpSequence(tier) {
  return FOLLOW_UP_SEQUENCES[tier] ?? [];
}

export function getRecommendedAction(tier) {
  if (tier === LEAD_TIERS.HOT) {
    return "Immediate human follow-up. Send alert to Harvest Drone team. Encourage booking or direct callback.";
  }

  if (tier === LEAD_TIERS.WARM) {
    return "Send educational follow-up and prompt for consultation.";
  }

  if (tier === LEAD_TIERS.NURTURE) {
    return "Add to email nurture sequence. Provide SOURCE education and case-style content.";
  }

  return "Store lead but do not trigger urgent follow-up.";
}

function normalizeCropSelection(crops) {
  if (!Array.isArray(crops)) {
    return [];
  }

  const unique = [...new Set(crops.filter(Boolean))];

  if (unique.includes("Corn and soybeans")) {
    return ["Corn and soybeans"];
  }

  if (unique.includes("Corn") && unique.includes("Soybeans")) {
    return ["Corn and soybeans"];
  }

  return unique;
}

function resolveCropScore(crops) {
  const normalized = normalizeCropSelection(crops);

  if (normalized.length === 0) {
    return 0;
  }

  return normalized.reduce((best, crop) => Math.max(best, cropScores[crop] ?? 0), 0);
}

function buildReasonCodes(input, estimatedAcres, cropScore) {
  const reasons = [];
  const normalizedCrops = normalizeCropSelection(input.crops);

  if (estimatedAcres >= 2500) {
    reasons.push("Large-acreage opportunity");
  } else if (estimatedAcres >= 1000) {
    reasons.push("Meaningful acreage footprint");
  }

  if (normalizedCrops.includes("Corn and soybeans") || cropScore >= 15) {
    reasons.push("Corn/soy fit");
  }

  if (
    input.primaryGoal === "Improving nutrient efficiency" ||
    input.primaryGoal === "Reducing fertilizer dependency"
  ) {
    reasons.push("Strong nutrient-efficiency angle");
  }

  if (input.primaryGoal === "Testing SOURCE on select acres") {
    reasons.push("Open to a measured SOURCE trial");
  }

  if (
    input.decisionTiming === "Immediately / this season" ||
    input.decisionTiming === "Within 30 days"
  ) {
    reasons.push("Near-term decision window");
  }

  if (
    input.interestLevel === "Very open" ||
    input.interestLevel === "Somewhat open"
  ) {
    reasons.push("Open to testing SOURCE");
  }

  if (
    input.interestLevel === "Need more information" ||
    input.interestLevel === "Skeptical but curious"
  ) {
    reasons.push("Needs education before sales conversation");
  }

  if (
    input.applicationMethod === "Drone application" ||
    input.applicationMethod === "Aerial application"
  ) {
    reasons.push("Application path already aligns with aerial timing");
  }

  return reasons.slice(0, 5);
}

export function getLeadTier(score) {
  if (score >= 75) {
    return LEAD_TIERS.HOT;
  }

  if (score >= 55) {
    return LEAD_TIERS.WARM;
  }

  if (score >= 30) {
    return LEAD_TIERS.NURTURE;
  }

  return LEAD_TIERS.LOW_FIT;
}

export function evaluateLead(input) {
  const estimatedAcres = estimateAcresFromRange(input.acreageRange);
  const cropScore = resolveCropScore(input.crops);
  const rawScore =
    (acreageScores[input.acreageRange] ?? 0) +
    cropScore +
    (applicationScores[input.applicationMethod] ?? 0) +
    (goalScores[input.primaryGoal] ?? 0) +
    (timingScores[input.decisionTiming] ?? 0) +
    (interestScores[input.interestLevel] ?? 0);
  const leadScore = Math.min(100, rawScore);
  const leadTier = getLeadTier(leadScore);
  const reasonCodes = buildReasonCodes(input, estimatedAcres, cropScore);
  const recommendedAction = getRecommendedAction(leadTier);
  const content = tierContent[leadTier];

  return {
    rawScore,
    leadScore,
    leadTier,
    recommendedAction,
    reasonCodes,
    estimatedAcres,
    resultHeadline: content.headline,
    resultBody: content.body,
    resultCta: content.cta,
    offerPath: content.offerPath,
    disclaimer: RESULTS_DISCLAIMER,
  };
}

export function buildRuleBasedLeadSummary(lead) {
  const cropLabel = formatCrops(lead.crops);
  const location =
    [lead.county, lead.state].filter(Boolean).join(", ") ||
    lead.state ||
    "their market";
  const firstName = lead.first_name || lead.firstName || "This grower";
  const acreageLabel =
    lead.acreage_range || lead.acreageRange || "an unspecified number of";
  const goal =
    lead.primary_goal || lead.primaryGoal || "learning whether SOURCE fits";
  const timing =
    lead.decision_timing || lead.decisionTiming || "an undefined decision timeline";
  const tier = lead.lead_tier || lead.leadTier || LEAD_TIERS.NURTURE;
  const score = lead.lead_score ?? lead.leadScore ?? 0;
  const reasons = lead.reason_codes || lead.reasonCodes || [];
  const preferredContact =
    lead.preferred_contact_method ||
    lead.preferredContactMethod ||
    "their preferred method";

  return {
    plainEnglish:
      `${firstName} farms ${acreageLabel} acres focused on ${cropLabel.toLowerCase()} in ${location}. ` +
      `They are most interested in ${goal.toLowerCase()} and are looking to make a decision ${timing.toLowerCase()}.`,
    whyItMatters:
      `This is a ${tier.toLowerCase()} priority lead with a score of ${score}. ` +
      `${
        reasons.length
          ? `Key reasons: ${reasons.join(", ")}.`
          : "The answers suggest this lead is worth reviewing."
      }`,
    followUpAngle:
      tier === LEAD_TIERS.HOT
        ? "Lead with acreage, timing, and whether a custom SOURCE application review makes sense right now."
        : tier === LEAD_TIERS.WARM
          ? "Lead with nutrient efficiency and whether a measured SOURCE trial or guided review would be helpful."
          : tier === LEAD_TIERS.NURTURE
            ? "Lead with education, practical fit questions, and timing for future review."
            : "Lead with low-pressure updates and ask whether future timing should stay on the radar.",
    firstCallScript:
      `Hey ${firstName}, this is [Rep] with Harvest Drone. You filled out the SOURCE fit check. ` +
      `I saw you're farming ${acreageLabel} acres of ${cropLabel.toLowerCase()} and looking at ${goal.toLowerCase()}. ` +
      "I wanted to ask a couple quick questions about timing and whether you're considering a trial or broader application plan this season.",
    suggestedEmailReply:
      `Thanks for completing the SOURCE fit check. Based on what you shared, we'd like to review your acres, timing, and whether a SOURCE plan may fit. ` +
      `If it's helpful, we can follow up by ${preferredContact.toLowerCase()} and keep the conversation practical.`,
  };
}

export function createLeadCsvRows(leads) {
  return (leads || []).map((lead) => ({
    created_at: lead.created_at || "",
    first_name: lead.first_name || "",
    last_name: lead.last_name || "",
    farm_name: lead.farm_name || "",
    state: lead.state || "",
    county: lead.county || "",
    acreage_range: lead.acreage_range || "",
    crops: Array.isArray(lead.crops) ? lead.crops.join(" | ") : "",
    application_method: lead.application_method || "",
    primary_goal: lead.primary_goal || "",
    decision_timing: lead.decision_timing || "",
    interest_level: lead.interest_level || "",
    lead_score: lead.lead_score ?? "",
    lead_tier: lead.lead_tier || "",
    status: lead.status || "",
    preferred_contact_method: lead.preferred_contact_method || "",
    sms_consent: lead.sms_consent ? "Yes" : "No",
    sms_consent_at: lead.sms_consent_at || "",
    assigned_to: lead.assigned_to || "",
    campaign: lead.campaign || "",
    utm_source: lead.utm_source || "",
    utm_medium: lead.utm_medium || "",
    utm_campaign: lead.utm_campaign || "",
    actual_revenue: lead.actual_revenue ?? "",
  }));
}
