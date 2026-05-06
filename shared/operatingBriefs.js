export const WEEKLY_BRIEF_SECTIONS = [
  {
    key: "revenuePipeline",
    label: "Revenue / pipeline summary",
    empty: "No revenue or pipeline changes are available yet.",
  },
  {
    key: "jobsScheduled",
    label: "Jobs scheduled",
    empty: "No scheduled jobs are available from Jobber yet.",
  },
  {
    key: "quotesPending",
    label: "Quotes pending",
    empty: "No pending quotes are available from Jobber yet.",
  },
  {
    key: "openLoops",
    label: "Open loops",
    empty: "No open loops are currently assigned to the weekly brief.",
  },
  {
    key: "rdoEnterpriseProgress",
    label: "RDO / enterprise progress",
    empty: "No RDO or enterprise progress notes have been captured yet.",
  },
  {
    key: "sourceInputOpportunities",
    label: "SOURCE / input opportunities",
    empty: "No SOURCE or input opportunities are queued yet.",
  },
  {
    key: "equipmentMaintenanceIssues",
    label: "Equipment / maintenance issues",
    empty: "No equipment or maintenance issues are currently flagged.",
  },
  {
    key: "invoicesAccountingFollowUp",
    label: "Invoices / accounting follow-up",
    empty: "No accounting follow-up is available from Jobber or QuickBooks yet.",
  },
  {
    key: "topStrategicPriorities",
    label: "Top strategic priorities",
    empty: "No strategic priorities have been set for this week.",
  },
  {
    key: "decisionsNeeded",
    label: "Decisions needed",
    empty: "No leadership decisions are currently queued.",
  },
];

export const PROFIT_CENTER_SCOREBOARD = [
  {
    name: "Enterprise Drone Division",
    status: "testing",
    description: "Help enterprise growers stand up internal drone application divisions.",
    targetCustomer: "Large growers, dealer-backed grower networks, and RDO-style enterprise teams",
    revenueModel: "Implementation fee plus support/operating retainer",
    currentPipeline: "RDO demo and enterprise grower conversations",
    nextAction: "Use the RDO demo path to validate the blueprint, readiness, support, and reporting story.",
    buildNeeded: "Readiness engine, support queue, application records, and leadership reporting",
    operationalBurden: "High",
    profitPotential: "High",
    riskLevel: "Medium",
    owner: "Harvest leadership",
  },
  {
    name: "SOURCE/Input ROI",
    status: "testing",
    description: "Tie input ROI opportunities to drone timing, acres, application windows, and follow-up.",
    targetCustomer: "Growers evaluating SOURCE, BLUEPRINT, and related input programs",
    revenueModel: "Input margin, referral economics, and application services",
    currentPipeline: "SOURCE acre review funnel",
    nextAction: "Connect SOURCE-qualified leads to Jobber follow-up and Daily Ops loops.",
    buildNeeded: "ROI deployment tracker, dealer attribution, and follow-up automation",
    operationalBurden: "Medium",
    profitPotential: "High",
    riskLevel: "Medium",
    owner: "Sales / ops",
  },
  {
    name: "Dealer Drone Success",
    status: "idea",
    description: "Give dealers a repeatable drone program success layer for growers and internal teams.",
    targetCustomer: "Ag dealers and equipment channels",
    revenueModel: "Dealer enablement package and managed success retainer",
    currentPipeline: "Dealer network positioning",
    nextAction: "Define the minimum dealer dashboard and onboarding checklist.",
    buildNeeded: "Dealer scorecard, onboarding, sales assets, and support playbooks",
    operationalBurden: "Medium",
    profitPotential: "Medium",
    riskLevel: "Medium",
    owner: "Unassigned",
  },
  {
    name: "Drone Program Rescue",
    status: "idea",
    description: "Recover underperforming drone programs by fixing readiness, training, support, and workflow gaps.",
    targetCustomer: "Growers or dealers with stalled drone programs",
    revenueModel: "Diagnostic fee plus implementation sprint",
    currentPipeline: "Future rescue offer",
    nextAction: "Create a program diagnostic checklist from RDO readiness blockers.",
    buildNeeded: "Audit workflow, blocker report, and prioritized recovery plan",
    operationalBurden: "Medium",
    profitPotential: "Medium",
    riskLevel: "Low",
    owner: "Unassigned",
  },
  {
    name: "Custom Applicator Add-On",
    status: "idea",
    description: "Support custom applicators adding drone services without replacing their existing business stack.",
    targetCustomer: "Custom applicators and ag service providers",
    revenueModel: "Setup fee plus per-season support",
    currentPipeline: "Future applicator segment",
    nextAction: "Map the minimum readiness and application-record workflow for applicators.",
    buildNeeded: "Applicator-specific job readiness, records, and customer update templates",
    operationalBurden: "High",
    profitPotential: "Medium",
    riskLevel: "Medium",
    owner: "Unassigned",
  },
  {
    name: "Operator Training",
    status: "active",
    description: "Train operators with coursework, practical signoffs, credentials, and readiness gates.",
    targetCustomer: "Internal operators, dealers, and enterprise teams",
    revenueModel: "Training package, certification support, and recurring compliance support",
    currentPipeline: "Existing training modules",
    nextAction: "Tie practical signoff and credential status into enterprise readiness views.",
    buildNeeded: "Expiration logic, upload evidence, manager review, and role permissions",
    operationalBurden: "Medium",
    profitPotential: "Medium",
    riskLevel: "Low",
    owner: "Training lead",
  },
  {
    name: "OS/Software",
    status: "testing",
    description: "Harvest OS as the drone/ag control layer over Jobber, QuickBooks, Twilio, Slack, and Google.",
    targetCustomer: "Harvest internal ops first, then enterprise and dealer teams",
    revenueModel: "Bundled software access and operating-layer subscription",
    currentPipeline: "Internal P0 buildout",
    nextAction: "Finish P0 dashboards, event logs, briefings, and integration foundations.",
    buildNeeded: "Role model, real org/account structure, readiness engine, and smoke tests",
    operationalBurden: "Medium",
    profitPotential: "High",
    riskLevel: "Medium",
    owner: "Product / engineering",
  },
  {
    name: "Operating Retainer",
    status: "idea",
    description: "Recurring support layer for running the drone division rhythm, loops, readiness, and reporting.",
    targetCustomer: "Enterprise growers and dealer-backed programs",
    revenueModel: "Monthly retainer",
    currentPipeline: "Future enterprise packaging",
    nextAction: "Use weekly leadership brief sections as the retainer reporting template.",
    buildNeeded: "SLA tracker, leadership reports, and account review workflow",
    operationalBurden: "High",
    profitPotential: "High",
    riskLevel: "Medium",
    owner: "Unassigned",
  },
  {
    name: "Aerial Scouting",
    status: "idea",
    description: "Use drone imagery and issue-detection workflows to create scouting value beyond spray application.",
    targetCustomer: "Growers and crop advisors",
    revenueModel: "Per-acre scouting package or recurring scouting plan",
    currentPipeline: "Future module",
    nextAction: "Define first scouting issue types and report output.",
    buildNeeded: "Scouting records, imagery attachment, issue classification, and report generator",
    operationalBurden: "Medium",
    profitPotential: "Medium",
    riskLevel: "Medium",
    owner: "Unassigned",
  },
  {
    name: "Claims/Documentation",
    status: "idea",
    description: "Document crop, storm, chemical, or equipment issues with timestamped field evidence.",
    targetCustomer: "Growers, insurers, and service providers",
    revenueModel: "Per-claim documentation package",
    currentPipeline: "Future module",
    nextAction: "Define evidence fields and export format.",
    buildNeeded: "Evidence capture, file attachments, map context, and PDF export",
    operationalBurden: "Low",
    profitPotential: "Medium",
    riskLevel: "Low",
    owner: "Unassigned",
  },
  {
    name: "Sustainability Verification",
    status: "idea",
    description: "Verify practices and application records for sustainability or practice-based programs.",
    targetCustomer: "Growers, input partners, and sustainability programs",
    revenueModel: "Verification service fee or program partnership",
    currentPipeline: "Future module",
    nextAction: "Map which application records and field evidence would support verification.",
    buildNeeded: "Practice tracker, evidence rules, partner exports, and audit log",
    operationalBurden: "Medium",
    profitPotential: "Medium",
    riskLevel: "High",
    owner: "Unassigned",
  },
];

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeWeekStart(weekStart = new Date()) {
  if (weekStart instanceof Date) {
    return weekStart.toISOString().slice(0, 10);
  }

  return String(weekStart || new Date().toISOString().slice(0, 10)).slice(0, 10);
}

export function generateWeeklyLeadershipBrief(weekStart = new Date(), inputs = {}) {
  const sections = Object.fromEntries(
    WEEKLY_BRIEF_SECTIONS.map((section) => [section.key, asArray(inputs[section.key])]),
  );

  const recommendedFocus = [
    ...sections.decisionsNeeded.map((item) => (typeof item === "string" ? item : item.title || item.summary)).filter(Boolean),
    ...sections.openLoops
      .filter((item) => ["urgent", "high"].includes(item.priority))
      .map((item) => item.title || item.summary)
      .filter(Boolean),
    ...sections.rdoEnterpriseProgress
      .filter((item) => ["blocked", "watching", "at_risk"].includes(item.status))
      .map((item) => item.title || item.summary)
      .filter(Boolean),
  ].slice(0, 8);

  return {
    weekStart: normalizeWeekStart(weekStart),
    generatedAt: new Date().toISOString(),
    sections,
    sectionMeta: WEEKLY_BRIEF_SECTIONS,
    recommendedFocus:
      recommendedFocus.length > 0
        ? recommendedFocus
        : ["Review Daily Ops, open loops, RDO readiness, and Jobber pipeline before leadership review."],
  };
}

export function getProfitCenterScoreboard() {
  return PROFIT_CENTER_SCOREBOARD.map((item, index) => ({
    id: item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    rank: index + 1,
    ...item,
  }));
}
