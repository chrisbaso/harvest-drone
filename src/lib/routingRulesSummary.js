import { ROUTING_CONFIG } from "../../shared/routingConfig";

function formatList(values) {
  return values.join(", ");
}

function formatDefaultRoute(value) {
  const labels = {
    direct_hd: "Keep in direct Harvest Drone queue",
    route_to_operator: "Route to operator by default",
    nurture: "Move to nurture by default",
  };

  return labels[value] || value;
}

export function getRoutingRulesSummary() {
  return [
    {
      title: "High-value acreage threshold",
      value: `${ROUTING_CONFIG.grower.highValueAcreageThreshold.toLocaleString()} acres`,
      detail: "Grower leads at or above this threshold are treated as priority direct opportunities.",
    },
    {
      title: "Strategic states",
      value: formatList(ROUTING_CONFIG.grower.strategicStates),
      detail: "These geographies can stay in the direct Harvest Drone path even when acreage alone is not enough.",
    },
    {
      title: "Strategic counties",
      value: formatList(ROUTING_CONFIG.grower.strategicCounties),
      detail: "Specific county-state combinations that receive stronger direct-priority treatment.",
    },
    {
      title: "Operator eligibility",
      value: formatList(ROUTING_CONFIG.operator.eligibleStatuses),
      detail: "Only operators in these statuses can receive routed opportunities.",
    },
    {
      title: "Default route when no operator matches",
      value: formatDefaultRoute(ROUTING_CONFIG.grower.defaultRouteIfNoOperator),
      detail: "The fallback path used when no approved or active operator covers the lead geography.",
    },
  ];
}
