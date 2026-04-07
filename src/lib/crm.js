export const CRM_LEAD_TYPES = ["grower", "operator", "hylio", "dealer"];

export const CRM_OPPORTUNITY_TYPES = [
  "grower_direct",
  "operator_routed",
  "hylio_sale",
  "dealer_distribution",
  "earthoptics_distribution",
  "sound_ag_direct",
];

export function formatCrmTypeLabel(value) {
  const labels = {
    grower: "Grower",
    operator: "Operator",
    hylio: "Hylio",
    dealer: "Dealer",
    partner: "Partner",
    grower_direct: "Grower direct",
    operator_routed: "Operator routed",
    hylio_sale: "Hylio sale",
    dealer_distribution: "Dealer distribution",
    earthoptics_distribution: "EarthOptics distribution",
    sound_ag_direct: "Sound Ag direct",
    direct_hd: "Direct Harvest Drone",
    route_to_operator: "Route to operator",
    operator_pool: "Operator pool",
  };

  return labels[value] || value || "-";
}

export function formatCrmStageLabel(value) {
  const labels = {
    new: "New",
    contacted: "Contacted",
    qualified: "Qualified",
    call_scheduled: "Call Scheduled",
    closed_won: "Closed Won",
    closed_lost: "Closed Lost",
    open: "Open",
    assigned: "Assigned",
    unassigned: "Unassigned",
    active: "Active",
    completed: "Completed",
    paused: "Paused",
    unsubscribed: "Unsubscribed",
    sent: "Sent",
    delivered: "Delivered",
    failed: "Failed",
    bounced: "Bounced",
  };

  return labels[value] || value?.replaceAll("_", " ") || "-";
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

export function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatCompactNumber(value) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value ?? 0));
}
