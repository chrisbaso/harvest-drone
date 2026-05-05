const HOT_LEAD_DEFAULT_SLA_HOURS = 24;
const QUALIFIED_TIERS = new Set(["Hot", "Warm"]);
const WON_STATUSES = new Set(["Won"]);
const CLOSED_STATUSES = new Set(["Won", "Lost", "Bad Fit"]);

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function toDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isWonLead(lead) {
  return lead?.revenue_status === "won" || WON_STATUSES.has(lead?.status);
}

function isQualifiedLead(lead) {
  return QUALIFIED_TIERS.has(lead?.lead_tier);
}

function getDisplayName(lead) {
  return (
    [lead?.first_name, lead?.last_name].filter(Boolean).join(" ").trim() ||
    lead?.email ||
    "Unknown lead"
  );
}

function getDealerSlug(lead) {
  return String(lead?.dealer_slug || lead?.dealerSlug || "direct").trim() || "direct";
}

function getDealerLabel(lead, dealerSlug) {
  return (
    lead?.dealer_name ||
    lead?.dealerName ||
    lead?.dealers?.name ||
    dealerSlug
  );
}

function buildHotLeadSla(leads, now, hotLeadSlaHours) {
  return leads
    .filter((lead) => {
      if (lead?.lead_tier !== "Hot") {
        return false;
      }

      if (lead?.last_contacted_at || CLOSED_STATUSES.has(lead?.status)) {
        return false;
      }

      const createdAt = toDate(lead?.created_at);
      if (!createdAt) {
        return false;
      }

      const hoursOpen = (now.getTime() - createdAt.getTime()) / (60 * 60 * 1000);
      return hoursOpen >= hotLeadSlaHours;
    })
    .map((lead) => {
      const createdAt = toDate(lead.created_at);
      const hoursOpen = Math.floor((now.getTime() - createdAt.getTime()) / (60 * 60 * 1000));

      return {
        id: lead.id,
        displayName: getDisplayName(lead),
        farmName: lead.farm_name || "-",
        status: lead.status || "New",
        estimatedAcres: toNumber(lead.estimated_acres),
        hoursOpen,
        createdAt: lead.created_at,
      };
    })
    .sort((first, second) => second.hoursOpen - first.hoursOpen);
}

function buildDealerLeaderboard(leads) {
  const dealerMap = new Map();

  leads.forEach((lead) => {
    const dealerSlug = getDealerSlug(lead);
    const current =
      dealerMap.get(dealerSlug) || {
        dealerSlug,
        label: getDealerLabel(lead, dealerSlug),
        leads: 0,
        hotLeads: 0,
        qualifiedAcres: 0,
        wonAcres: 0,
        actualRevenue: 0,
      };

    const estimatedAcres = toNumber(lead?.estimated_acres);

    current.leads += 1;
    current.hotLeads += lead?.lead_tier === "Hot" ? 1 : 0;
    current.qualifiedAcres += isQualifiedLead(lead) ? estimatedAcres : 0;
    current.wonAcres += isWonLead(lead) ? estimatedAcres : 0;
    current.actualRevenue += isWonLead(lead) ? toNumber(lead?.actual_revenue) : 0;

    dealerMap.set(dealerSlug, current);
  });

  return [...dealerMap.values()].sort((first, second) => {
    if (second.qualifiedAcres !== first.qualifiedAcres) {
      return second.qualifiedAcres - first.qualifiedAcres;
    }

    return second.actualRevenue - first.actualRevenue;
  });
}

export function buildRevenueCommandCenter(leads = [], options = {}) {
  const now = toDate(options.now) || new Date();
  const hotLeadSlaHours = options.hotLeadSlaHours || HOT_LEAD_DEFAULT_SLA_HOURS;
  const safeLeads = Array.isArray(leads) ? leads : [];

  const metrics = safeLeads.reduce(
    (current, lead) => {
      const estimatedAcres = toNumber(lead?.estimated_acres);
      const estimatedValue = toNumber(lead?.estimated_value);
      const actualRevenue = toNumber(lead?.actual_revenue);
      const qualified = isQualifiedLead(lead);
      const won = isWonLead(lead);

      current.totalLeads += 1;
      current.qualifiedAcres += qualified ? estimatedAcres : 0;
      current.hotAcres += lead?.lead_tier === "Hot" ? estimatedAcres : 0;
      current.proposalAcres += lead?.status === "Proposal / Plan Sent" ? estimatedAcres : 0;
      current.wonAcres += won ? estimatedAcres : 0;
      current.pipelineValue += qualified ? estimatedValue : 0;
      current.actualRevenue += won ? actualRevenue : 0;

      return current;
    },
    {
      totalLeads: 0,
      qualifiedAcres: 0,
      hotAcres: 0,
      proposalAcres: 0,
      wonAcres: 0,
      pipelineValue: 0,
      actualRevenue: 0,
      hotLeadsAtRisk: 0,
    },
  );

  const hotLeadSla = buildHotLeadSla(safeLeads, now, hotLeadSlaHours);
  metrics.hotLeadsAtRisk = hotLeadSla.length;

  return {
    metrics,
    hotLeadSla,
    dealerLeaderboard: buildDealerLeaderboard(safeLeads),
  };
}
