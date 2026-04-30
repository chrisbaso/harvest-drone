export const SOURCE_FERTILITY_CONCERNS = [
  "Fertilizer cost",
  "Nitrogen efficiency",
  "Phosphorus availability",
  "Yield potential",
  "Soil biology / soil health",
  "Application timing",
  "Not sure",
];

export const SOURCE_TIMELINES = [
  "This season",
  "Planning for next season",
  "Just researching",
];

export const SOURCE_INTEREST_OPTIONS = [
  "SOURCE product",
  "SOURCE + application",
  "Drone application",
  "Product availability/pricing",
  "Guarantee/program eligibility",
  "Not sure",
];

export const SOURCE_CONTACT_METHODS = ["Call", "Text", "Email"];

const SPECIFIC_CONCERNS = new Set(
  SOURCE_FERTILITY_CONCERNS.filter((item) => item !== "Not sure"),
);

const HOT_INTERESTS = new Set([
  "SOURCE + application",
  "Product availability/pricing",
]);

const WARM_INTERESTS = new Set([
  "SOURCE product",
  "SOURCE + application",
  "Drone application",
]);

const concernConversationMap = {
  "Fertilizer cost": "nutrient efficiency and fertilizer-plan fit",
  "Nitrogen efficiency": "nitrogen efficiency and in-season fit",
  "Phosphorus availability": "phosphorus availability and crop access",
  "Yield potential": "yield-potential fit within the current fertility plan",
  "Soil biology / soil health": "soil biology and nutrient-access discussion",
  "Application timing": "application timing and tank-mix planning",
};

const interestConversationMap = {
  "SOURCE product": "SOURCE product fit and rate discussion",
  "SOURCE + application": "SOURCE plus application planning",
  "Drone application": "application logistics and field access",
  "Product availability/pricing": "product availability and pricing review",
  "Guarantee/program eligibility": "Sound guarantee and program eligibility review",
};

function normalizeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

export function getSourceAcreBand(acresValue) {
  const acres = normalizeNumber(acresValue);

  if (acres >= 500) {
    return "500+ acres";
  }

  if (acres >= 100) {
    return "100-499 acres";
  }

  if (acres > 0) {
    return "Under 100 acres";
  }

  return "Acres not provided";
}

export function formatSubmittedAcres(acresValue) {
  const acres = normalizeNumber(acresValue);

  if (acres <= 0) {
    return "Acres not provided";
  }

  return `${acres.toLocaleString("en-US")} acres submitted`;
}

export function buildSourceReviewSummary(formData = {}) {
  const acres = normalizeNumber(formData.acres);
  const phone = String(formData.phone || formData.mobile || "").trim();
  const email = String(formData.email || "").trim();
  const timeline = formData.timeline || "";
  const fertilityConcern = formData.fertilityConcern || "";
  const interestType = formData.interestType || "";
  const notesLength = [
    formData.notes,
    formData.nitrogenProgramNotes,
    formData.phosphorusProgramNotes,
  ]
    .filter(Boolean)
    .join(" ")
    .trim().length;

  let leadScore = 0;

  if (acres >= 500) {
    leadScore += 40;
  } else if (acres >= 100) {
    leadScore += 22;
  } else if (acres > 0) {
    leadScore += 8;
  }

  if (phone) {
    leadScore += 15;
  }

  if (email) {
    leadScore += 5;
  }

  if (timeline === "This season") {
    leadScore += 20;
  } else if (timeline === "Planning for next season") {
    leadScore += 10;
  }

  if (SPECIFIC_CONCERNS.has(fertilityConcern)) {
    leadScore += 10;
  }

  if (HOT_INTERESTS.has(interestType)) {
    leadScore += 15;
  } else if (WARM_INTERESTS.has(interestType)) {
    leadScore += 10;
  } else if (interestType === "Guarantee/program eligibility") {
    leadScore += 8;
  }

  if (notesLength >= 40) {
    leadScore += 5;
  }

  const isHotCriteria =
    acres >= 500 &&
    Boolean(phone) &&
    timeline === "This season" &&
    SPECIFIC_CONCERNS.has(fertilityConcern) &&
    HOT_INTERESTS.has(interestType);

  const isWarmCriteria =
    !isHotCriteria &&
    acres >= 100 &&
    Boolean(phone || email) &&
    timeline === "Planning for next season" &&
    WARM_INTERESTS.has(interestType);

  let reviewPriority = "Researching";
  let leadPriority = "Researching";

  if (isHotCriteria || leadScore >= 75) {
    reviewPriority = "High";
    leadPriority = "Hot";
  } else if (isWarmCriteria || leadScore >= 40) {
    reviewPriority = "Medium";
    leadPriority = "Warm";
  }

  const priorityTags = new Set([`SOURCE_${leadPriority.toUpperCase()}`]);

  if (interestType === "SOURCE + application" || interestType === "Drone application") {
    priorityTags.add("SOURCE_APPLICATION_INTEREST");
  }

  if (interestType === "SOURCE product") {
    priorityTags.add("SOURCE_PRODUCT_ONLY");
  }

  if (interestType === "Guarantee/program eligibility") {
    priorityTags.add("SOURCE_GUARANTEE_INTEREST");
  }

  if (interestType === "Product availability/pricing") {
    priorityTags.add("SOURCE_PRICING_INTEREST");
  }

  const conversationFocus = unique([
    concernConversationMap[fertilityConcern],
    interestConversationMap[interestType],
    timeline === "This season" ? "near-term timing and next-step planning" : null,
    timeline === "Planning for next season" ? "next-season program planning" : null,
    leadPriority === "Researching" ? "basic product fit and acreage review" : null,
  ]).slice(0, 3);

  let summaryMessage =
    "This looks like an early-stage fit review. Harvest Drone can help review whether SOURCE may fit your fertility plan, timing, and acreage goals.";

  if (reviewPriority === "High") {
    summaryMessage =
      "Based on your acres, timing, and stated interest, this looks like a strong candidate for a SOURCE acre review. Harvest Drone can help review fit, application timing, product availability, and any applicable program details.";
  } else if (reviewPriority === "Medium") {
    summaryMessage =
      "Based on your acres, crop, and fertility concern, this looks worth reviewing with Harvest Drone. A quick acre review can clarify whether SOURCE may fit your fertility plan and timing.";
  }

  return {
    acres,
    acresBand: getSourceAcreBand(acres),
    submittedAcresLabel: formatSubmittedAcres(acres),
    leadScore,
    reviewPriority,
    leadPriority,
    priorityTags: [...priorityTags],
    conversationFocus,
    summaryMessage,
    recommendedNextStep: "Talk with Jake / Harvest Drone",
    disclaimer:
      "SOURCE performance, program eligibility, application recommendations, and economic outcomes vary by crop, acres, soil conditions, fertility plan, timing, weather, application method, and other field-specific factors. Always read and follow label instructions.",
  };
}
