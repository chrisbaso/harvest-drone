export const HYLIO_SOURCE = "website-hylio-funnel";
export const HYLIO_CALCULATOR_DEFAULTS = {
  acresPerMonth: 500,
  revenuePerAcre: 15,
  monthsActivePerYear: 6,
  equipmentCost: 45000,
  growthFactor: 0,
};

export const HYLIO_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "call_scheduled",
  "closed_won",
  "closed_lost",
];

export function isHylioLead(lead) {
  return (lead?.source || lead?.lead_source) === HYLIO_SOURCE;
}

export function estimateHylioPipelineValue(budgetRange) {
  const ranges = {
    "$25k-$35k": 30000,
    "$35k-$50k": 42500,
    "$50k-$65k": 57500,
    "$65k+": 65000,
  };

  return ranges[budgetRange] ?? 0;
}

function parseNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function calculateHylioRevenuePotential(inputs) {
  const acresPerMonth = parseNumber(
    inputs?.acresPerMonth,
    HYLIO_CALCULATOR_DEFAULTS.acresPerMonth,
  );
  const revenuePerAcre = parseNumber(
    inputs?.revenuePerAcre,
    HYLIO_CALCULATOR_DEFAULTS.revenuePerAcre,
  );
  const monthsActivePerYear = parseNumber(
    inputs?.monthsActivePerYear,
    HYLIO_CALCULATOR_DEFAULTS.monthsActivePerYear,
  );
  const equipmentCost = parseNumber(
    inputs?.equipmentCost,
    HYLIO_CALCULATOR_DEFAULTS.equipmentCost,
  );
  const growthFactor = parseNumber(
    inputs?.growthFactor,
    HYLIO_CALCULATOR_DEFAULTS.growthFactor,
  );

  const monthlyRevenue = acresPerMonth * revenuePerAcre;
  const annualRevenue = monthlyRevenue * monthsActivePerYear;
  const paybackPeriodMonths =
    monthlyRevenue > 0 ? equipmentCost / monthlyRevenue : 0;
  const yearOneNet = annualRevenue - equipmentCost;
  const yearTwoProfit = annualRevenue * (1 + growthFactor / 100);

  return {
    acresPerMonth,
    revenuePerAcre,
    monthsActivePerYear,
    equipmentCost,
    growthFactor,
    monthlyRevenue,
    annualRevenue,
    paybackPeriodMonths,
    yearOneNet,
    yearTwoProfit,
  };
}
