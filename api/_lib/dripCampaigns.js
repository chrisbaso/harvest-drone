const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const LEAD_STOP_STATUSES = {
  grower: ["qualified", "quoted", "scheduled", "closed", "do_not_contact"],
  operator: ["approved", "active", "inactive", "do_not_contact"],
  hylio: ["qualified", "call_scheduled", "closed_won", "closed_lost", "do_not_contact"],
};

export const LEAD_CAMPAIGNS = {
  grower: {
    steps: [
      {
        key: "grower_confirmation",
        offsetDays: 0,
        subject: "Harvest Drone received your acreage request",
      },
      {
        key: "grower_day_1_timing_speed",
        offsetDays: 1,
        subject: "Where drone timing can change the economics",
      },
      {
        key: "grower_day_3_fit_use_cases",
        offsetDays: 3,
        subject: "Where drone spraying tends to be the best fit",
      },
      {
        key: "grower_day_5_acreage_review_cta",
        offsetDays: 5,
        subject: "Want a quick acreage review from Harvest Drone?",
      },
      {
        key: "grower_day_10_final_check_in",
        offsetDays: 10,
        subject: "Final check-in on your Harvest Drone request",
      },
    ],
  },
  operator: {
    steps: [
      {
        key: "operator_confirmation",
        offsetDays: 0,
        subject: "Harvest Drone received your operator application",
      },
      {
        key: "operator_day_1_operator_fit",
        offsetDays: 1,
        subject: "What Harvest Drone looks for in operators",
      },
      {
        key: "operator_day_3_capacity_follow_up",
        offsetDays: 3,
        subject: "Equipment, readiness, and capacity matter",
      },
      {
        key: "operator_day_5_routing_cta",
        offsetDays: 5,
        subject: "Position your operation for routing opportunities",
      },
      {
        key: "operator_day_10_final_check_in",
        offsetDays: 10,
        subject: "Final check-in on your Harvest Drone profile",
      },
    ],
  },
  hylio: {
    steps: [
      {
        key: "hylio_confirmation",
        offsetDays: 0,
        subject: "Harvest Drone received your Hylio opportunity request",
      },
      {
        key: "hylio_day_1_business_model",
        offsetDays: 1,
        subject: "Why the Hylio model is built around recurring acreage revenue",
      },
      {
        key: "hylio_day_3_roi_follow_up",
        offsetDays: 3,
        subject: "How operators think about Hylio ROI",
      },
      {
        key: "hylio_day_5_territory_cta",
        offsetDays: 5,
        subject: "Should we review your territory in more detail?",
      },
      {
        key: "hylio_day_10_final_check_in",
        offsetDays: 10,
        subject: "Final check-in on your Hylio opportunity request",
      },
    ],
  },
};

export function resolveCampaignType(type, leadOrPayload = null) {
  if (type === "hylio") {
    return "hylio";
  }

  const source = typeof leadOrPayload === "string"
    ? leadOrPayload
    : leadOrPayload?.source || leadOrPayload?.lead_source || "";

  if (type === "operator" && source === "website-hylio-funnel") {
    return "hylio";
  }

  return type;
}

export function getCampaign(type) {
  return LEAD_CAMPAIGNS[resolveCampaignType(type)] ?? null;
}

export function getStopStatuses(type, leadOrPayload = null) {
  return LEAD_STOP_STATUSES[resolveCampaignType(type, leadOrPayload)] ?? [];
}

export function getFirstStep(type) {
  return getCampaign(resolveCampaignType(type))?.steps[0] ?? null;
}

export function getStepIndex(type, sequenceState) {
  return getCampaign(resolveCampaignType(type))?.steps.findIndex((step) => step.key === sequenceState) ?? -1;
}

export function getStepBySequenceState(type, sequenceState) {
  return getCampaign(resolveCampaignType(type))?.steps.find((step) => step.key === sequenceState) ?? null;
}

export function getNextStep(type, sequenceState, leadOrPayload = null) {
  const campaignType = resolveCampaignType(type, leadOrPayload);
  const campaign = getCampaign(campaignType);

  if (!campaign) {
    return null;
  }

  const currentIndex = getStepIndex(campaignType, sequenceState);

  if (currentIndex < 0) {
    return campaign.steps[0] ?? null;
  }

  return campaign.steps[currentIndex + 1] ?? null;
}

export function getScheduledTime(createdAt, step) {
  if (!createdAt || !step) {
    return null;
  }

  return new Date(new Date(createdAt).getTime() + step.offsetDays * DAY_IN_MS).toISOString();
}
