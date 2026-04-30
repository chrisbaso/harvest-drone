// Shared routing config for the MVP.
// This file is used by both server-side routing logic and dashboard summaries
// so the displayed rules stay aligned with the actual decision engine.

export const ROUTING_CONFIG = {
  grower: {
    // If a grower lead meets or exceeds this acreage, it becomes a high-value
    // direct Harvest Drone priority unless the logic is changed later.
    highValueAcreageThreshold: 1500,

    // Leads below this acreage or with low-intent interest usually stay in
    // nurture until timing or readiness improves.
    minimumReadyAcreage: 250,

    // Strategic geographies can stay in the direct HD path even when acreage
    // alone would not make them a top-priority direct opportunity.
    strategicStates: ["Illinois", "Iowa", "Kansas", "Missouri", "Nebraska", "Arkansas"],
    strategicCounties: [
      "McLean, Illinois",
      "Saline, Kansas",
      "Poinsett, Arkansas",
      "Story, Iowa",
    ],

    // When no approved/active operator is available, this controls the default
    // behavior. For now, the system keeps the lead in the direct HD queue.
    defaultRouteIfNoOperator: "direct_hd",

    // High-intent grower requests should be considered more sales-ready.
    highIntentTypes: [
      "Request spraying help",
      "Request spraying quote",
      "Acreage evaluation",
      "Profitability review",
      "Input / product opportunity",
      "SOURCE product",
      "SOURCE + application",
      "Product availability/pricing",
      "Guarantee/program eligibility",
    ],

    // Lower-intent grower requests should remain in nurture for the MVP.
    nurtureTypes: ["Just exploring", "Just researching", "Not ready yet", "Not sure"],
  },

  operator: {
    // Only operators in these statuses are eligible to receive routed demand.
    eligibleStatuses: ["approved", "active"],

    // Capacity thresholds drive simple operator scoring/classification.
    highCapacityThreshold: 4000,
    approvedCapacityThreshold: 2000,
    qualifiedCapacityThreshold: 750,

    // Compliance groupings determine whether an operator can be qualified,
    // approved, or active.
    activeComplianceStatuses: ["Active and compliant", "Approved and compliant"],
    qualifiedComplianceStatuses: [
      "Active and compliant",
      "Approved and compliant",
      "Licensed with paperwork in progress",
    ],
  },
};
