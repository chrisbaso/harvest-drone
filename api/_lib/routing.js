import { ROUTING_CONFIG } from "./routingConfig.js";

const { grower: growerConfig, operator: operatorConfig } = ROUTING_CONFIG;

function normalizeValue(value) {
  return String(value ?? "").trim().toLowerCase();
}

function uniqueParts(value) {
  return String(value ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function getGrowerSource() {
  return "website-grower-funnel";
}

export function getOperatorSource() {
  return "website-operator-funnel";
}

export function scoreGrowerLead({ acres, state, county, interestType, notes, matchingOperatorCount }) {
  let score = 0;
  const numericAcres = Number(acres ?? 0);
  const countyState = `${county || ""}, ${state || ""}`.trim();

  if (numericAcres >= 500) {
    score += 20;
  }

  if (numericAcres >= growerConfig.highValueAcreageThreshold) {
    score += 25;
  }

  if (numericAcres >= 5000) {
    score += 15;
  }

  if (growerConfig.strategicStates.includes(state)) {
    score += 15;
  }

  if (growerConfig.strategicCounties.includes(countyState)) {
    score += 20;
  }

  if (growerConfig.highIntentTypes.includes(interestType)) {
    score += 20;
  }

  if (String(notes ?? "").trim().length >= 40) {
    score += 5;
  }

  if (matchingOperatorCount > 0) {
    score += 10;
  }

  return score;
}

function isStrategicGeography(state, county) {
  return (
    growerConfig.strategicStates.includes(state) ||
    growerConfig.strategicCounties.includes(`${county || ""}, ${state || ""}`.trim())
  );
}

export function findMatchingOperators(operatorLeads, growerLead) {
  const leadState = normalizeValue(growerLead.state);
  const leadCounty = normalizeValue(growerLead.county);

  return operatorLeads
    .filter((operator) =>
      operatorConfig.eligibleStatuses.includes(normalizeValue(operator.status)),
    )
    .filter((operator) => normalizeValue(operator.state) === leadState)
    .filter((operator) => Number(operator.acreage_capacity ?? operator.acres_capacity_per_week ?? 0) > 0)
    .filter((operator) => {
      const countiesServed = uniqueParts(operator.counties_served);

      if (!countiesServed.length) {
        return true;
      }

      return countiesServed.some((county) => normalizeValue(county) === leadCounty || normalizeValue(county) === "statewide");
    })
    .sort((left, right) => {
      const rightCapacity = Number(right.acreage_capacity ?? right.acres_capacity_per_week ?? 0);
      const leftCapacity = Number(left.acreage_capacity ?? left.acres_capacity_per_week ?? 0);
      return rightCapacity - leftCapacity;
    });
}

export function decideGrowerRouting(growerLead, operatorMatches) {
  const numericAcres = Number(growerLead.acres ?? 0);
  const strategicGeography = isStrategicGeography(growerLead.state, growerLead.county);
  const nurtureLead =
    numericAcres < growerConfig.minimumReadyAcreage ||
    growerConfig.nurtureTypes.includes(growerLead.interestType);
  const directPriority = numericAcres >= growerConfig.highValueAcreageThreshold || strategicGeography;
  const matchedOperator = operatorMatches[0] ?? null;

  const leadScore = scoreGrowerLead({
    acres: growerLead.acres,
    state: growerLead.state,
    county: growerLead.county,
    interestType: growerLead.interestType,
    notes: growerLead.notes,
    matchingOperatorCount: operatorMatches.length,
  });

  if (nurtureLead) {
    return {
      status: "new",
      routeType: "nurture",
      leadScore,
      assignedTo: null,
      assignedOperatorId: null,
      matchedOperator,
      shouldCreateOpportunity: false,
      reason: "Lead acreage or intent indicates nurture before routing.",
    };
  }

  if (directPriority || !matchedOperator) {
    return {
      status: "new",
      routeType: matchedOperator ? "direct_hd" : growerConfig.defaultRouteIfNoOperator,
      leadScore,
      assignedTo: "Harvest Drone",
      assignedOperatorId: null,
      matchedOperator: null,
      shouldCreateOpportunity: true,
      reason: directPriority
        ? "Lead meets direct acreage/geography priority."
        : "No approved or active operator matched geography and capacity.",
    };
  }

  return {
    status: "new",
    routeType: "route_to_operator",
    leadScore,
    assignedTo: [matchedOperator.first_name, matchedOperator.last_name].filter(Boolean).join(" "),
    assignedOperatorId: matchedOperator.id,
    matchedOperator,
    shouldCreateOpportunity: true,
    reason: "Lead geography is better served by an approved or active operator with capacity.",
  };
}

export function scoreOperatorLead({ acreageCapacity, countiesServed, complianceStatus, interestType }) {
  let score = 0;
  const numericCapacity = Number(acreageCapacity ?? 0);

  if (numericCapacity >= operatorConfig.qualifiedCapacityThreshold) {
    score += 20;
  }

  if (numericCapacity >= operatorConfig.approvedCapacityThreshold) {
    score += 25;
  }

  if (numericCapacity >= operatorConfig.highCapacityThreshold) {
    score += 20;
  }

  if (uniqueParts(countiesServed).length >= 3) {
    score += 10;
  }

  if (operatorConfig.qualifiedComplianceStatuses.includes(complianceStatus)) {
    score += 15;
  }

  if (operatorConfig.activeComplianceStatuses.includes(complianceStatus)) {
    score += 10;
  }

  if (interestType === "Need jobs now" || interestType === "Need more routed work") {
    score += 10;
  }

  return score;
}

export function classifyOperatorLead(operatorLead) {
  const numericCapacity = Number(operatorLead.acreageCapacity ?? 0);
  const score = scoreOperatorLead(operatorLead);
  const compliance = operatorLead.complianceStatus;
  const highIntent = operatorLead.interestType === "Need jobs now";

  if (compliance === "Not ready" || compliance === "Inactive") {
    return { status: "inactive", operatorScore: score };
  }

  if (
    operatorConfig.activeComplianceStatuses.includes(compliance) &&
    numericCapacity >= operatorConfig.highCapacityThreshold &&
    highIntent
  ) {
    return { status: "active", operatorScore: score };
  }

  if (
    operatorConfig.activeComplianceStatuses.includes(compliance) &&
    numericCapacity >= operatorConfig.approvedCapacityThreshold
  ) {
    return { status: "approved", operatorScore: score };
  }

  if (
    operatorConfig.qualifiedComplianceStatuses.includes(compliance) &&
    numericCapacity >= operatorConfig.qualifiedCapacityThreshold
  ) {
    return { status: "qualified", operatorScore: score };
  }

  return { status: "new", operatorScore: score };
}

export const ROUTING_RULES = {
  grower: {
    highValueAcreageThreshold: growerConfig.highValueAcreageThreshold,
    minimumReadyAcreage: growerConfig.minimumReadyAcreage,
    strategicStates: growerConfig.strategicStates,
    strategicCounties: growerConfig.strategicCounties,
    defaultRouteIfNoOperator: growerConfig.defaultRouteIfNoOperator,
  },
  operator: {
    eligibleStatuses: operatorConfig.eligibleStatuses,
    highCapacityThreshold: operatorConfig.highCapacityThreshold,
    approvedCapacityThreshold: operatorConfig.approvedCapacityThreshold,
    qualifiedCapacityThreshold: operatorConfig.qualifiedCapacityThreshold,
  },
};
