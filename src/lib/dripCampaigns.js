const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const LEAD_STOP_STATUSES = {
  grower: ["qualified", "quoted", "scheduled", "closed", "do_not_contact"],
  operator: ["approved", "active", "inactive", "do_not_contact"],
  hylio: ["qualified", "call_scheduled", "closed_won", "closed_lost", "do_not_contact"],
};

export const LEAD_CAMPAIGNS = {
  grower: {
    label: "Grower acreage sequence",
    steps: [
      {
        key: "grower_confirmation",
        offsetDays: 0,
        subject: "Harvest Drone received your acreage request",
        purpose: "Confirms the request and positions Harvest Drone as a real review process, not a dead-end form.",
      },
      {
        key: "grower_day_1_timing_speed",
        offsetDays: 1,
        subject: "Where drone timing can change the economics",
        purpose: "Builds urgency around response time, access windows, and why timing can protect revenue per acre.",
      },
      {
        key: "grower_day_3_fit_use_cases",
        offsetDays: 3,
        subject: "Where drone spraying tends to be the best fit",
        purpose: "Expands curiosity by showing practical field conditions, crop situations, and use cases where drone spraying wins.",
      },
      {
        key: "grower_day_5_acreage_review_cta",
        offsetDays: 5,
        subject: "Want a quick acreage review from Harvest Drone?",
        purpose: "Pushes the lead toward a real acreage review conversation and a more qualified next step.",
      },
      {
        key: "grower_day_10_final_check_in",
        offsetDays: 10,
        subject: "Final check-in on your Harvest Drone request",
        purpose: "Creates a final response window before the sequence goes quiet.",
      },
    ],
  },
  operator: {
    label: "Operator recruiting sequence",
    steps: [
      {
        key: "operator_confirmation",
        offsetDays: 0,
        subject: "Harvest Drone received your operator application",
        purpose: "Confirms receipt and frames the operator as entering a vetted network, not a generic waitlist.",
      },
      {
        key: "operator_day_1_operator_fit",
        offsetDays: 1,
        subject: "What Harvest Drone looks for in operators",
        purpose: "Clarifies operator quality standards and encourages higher-intent operators to lean in.",
      },
      {
        key: "operator_day_3_capacity_follow_up",
        offsetDays: 3,
        subject: "Equipment, readiness, and capacity matter",
        purpose: "Surfaces fleet readiness, service radius, and weekly capacity as real routing inputs.",
      },
      {
        key: "operator_day_5_routing_cta",
        offsetDays: 5,
        subject: "Position your operation for routing opportunities",
        purpose: "Connects the operator profile to real routing and territory opportunities.",
      },
      {
        key: "operator_day_10_final_check_in",
        offsetDays: 10,
        subject: "Final check-in on your Harvest Drone profile",
        purpose: "Creates a last-touch decision point before the sequence stops.",
      },
    ],
  },
  hylio: {
    label: "Hylio opportunity sequence",
    steps: [
      {
        key: "hylio_confirmation",
        offsetDays: 0,
        subject: "Harvest Drone received your Hylio opportunity request",
        purpose: "Confirms the request and frames the Hylio drone as a real business opportunity, not a catalog inquiry.",
      },
      {
        key: "hylio_day_1_business_model",
        offsetDays: 1,
        subject: "Why the Hylio model is built around recurring acreage revenue",
        purpose: "Keeps the conversation focused on recurring acreage income and business model upside.",
      },
      {
        key: "hylio_day_3_roi_follow_up",
        offsetDays: 3,
        subject: "How operators think about Hylio ROI",
        purpose: "Reinforces that the drone is a revenue asset tied to acres, inputs, and application income.",
      },
      {
        key: "hylio_day_5_territory_cta",
        offsetDays: 5,
        subject: "Should we review your territory in more detail?",
        purpose: "Pushes the lead toward a territory review and booked call.",
      },
      {
        key: "hylio_day_10_final_check_in",
        offsetDays: 10,
        subject: "Final check-in on your Hylio opportunity request",
        purpose: "Creates a final response point before the Hylio sequence goes quiet.",
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

export function getScheduledTime(createdAt, step) {
  if (!createdAt || !step) {
    return null;
  }

  return new Date(new Date(createdAt).getTime() + step.offsetDays * DAY_IN_MS).toISOString();
}

export function getStepIndex(type, sequenceState) {
  return getCampaign(resolveCampaignType(type))?.steps.findIndex((step) => step.key === sequenceState) ?? -1;
}

export function getCampaignTimeline(lead) {
  const campaignType = resolveCampaignType(lead?.lead_type, lead);
  const campaign = getCampaign(campaignType);

  if (!campaign || !lead) {
    return [];
  }

  const currentIndex = getStepIndex(campaignType, lead.sequence_state);
  const stopStatuses = getStopStatuses(campaignType, lead);
  const isStopped = stopStatuses.includes(lead.status);
  const isComplete =
    !isStopped &&
    !lead.next_follow_up_at &&
    currentIndex === campaign.steps.length - 1;

  return campaign.steps.map((step, index) => {
    const scheduledAt = getScheduledTime(lead.created_at, step);
    let stage = "upcoming";
    let stageLabel = "Queued";

    if (index <= currentIndex) {
      stage = "sent";
      stageLabel = "Sent";
    } else if (isStopped) {
      stage = "stopped";
      stageLabel = "Stopped";
    } else if (isComplete) {
      stage = "complete";
      stageLabel = "Complete";
    } else if (index === currentIndex + 1 || (currentIndex < 0 && index === 0)) {
      stage = "up-next";
      stageLabel = "Up next";
    }

    return {
      ...step,
      scheduledAt,
      stage,
      stageLabel,
    };
  });
}

export function getUpcomingTimelineStep(timeline) {
  return timeline.find((step) => step.stage === "up-next") ?? null;
}
