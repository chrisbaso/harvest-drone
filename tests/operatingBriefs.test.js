import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  PROFIT_CENTER_SCOREBOARD,
  generateWeeklyLeadershipBrief,
  getProfitCenterScoreboard,
} from "../shared/operatingBriefs.js";

async function run(name, callback) {
  try {
    await callback();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

await run("weekly leadership brief returns the required operating sections", () => {
  const brief = generateWeeklyLeadershipBrief("2026-05-04", {
    revenuePipeline: [{ label: "SOURCE quote", value: "$12,000", status: "pending" }],
    jobsScheduled: [{ title: "North field application", status: "scheduled" }],
    quotesPending: [{ title: "RDO pilot quote", owner: "Jake" }],
    openLoops: [{ title: "Customer reply", priority: "high" }],
    rdoEnterpriseProgress: [{ title: "Blueprint review", status: "watching" }],
    sourceInputOpportunities: [{ title: "Input ROI pilot", status: "testing" }],
    equipmentMaintenanceIssues: [{ title: "Pump inspection", priority: "normal" }],
    invoicesAccountingFollowUp: [{ title: "Completed job not invoiced", status: "review" }],
    topStrategicPriorities: ["Close RDO next-step meeting"],
    decisionsNeeded: ["Pick Google OAuth deploy owner"],
  });

  assert.equal(brief.weekStart, "2026-05-04");
  [
    "revenuePipeline",
    "jobsScheduled",
    "quotesPending",
    "openLoops",
    "rdoEnterpriseProgress",
    "sourceInputOpportunities",
    "equipmentMaintenanceIssues",
    "invoicesAccountingFollowUp",
    "topStrategicPriorities",
    "decisionsNeeded",
  ].forEach((section) => {
    assert.equal(Array.isArray(brief.sections[section]), true);
  });
  assert.equal(brief.sections.openLoops[0].priority, "high");
  assert.equal(brief.recommendedFocus.length > 0, true);
});

await run("profit-center scoreboard includes all strategic modules with operating metadata", () => {
  const scoreboard = getProfitCenterScoreboard();
  const names = scoreboard.map((item) => item.name);

  [
    "Enterprise Drone Division",
    "SOURCE/Input ROI",
    "Dealer Drone Success",
    "Drone Program Rescue",
    "Custom Applicator Add-On",
    "Operator Training",
    "OS/Software",
    "Operating Retainer",
    "Aerial Scouting",
    "Claims/Documentation",
    "Sustainability Verification",
  ].forEach((name) => assert.equal(names.includes(name), true));

  scoreboard.forEach((item) => {
    assert.equal(["idea", "testing", "active", "paused"].includes(item.status), true);
    assert.equal(Boolean(item.description), true);
    assert.equal(Boolean(item.targetCustomer), true);
    assert.equal(Boolean(item.revenueModel), true);
    assert.equal(Boolean(item.nextAction), true);
    assert.equal(Boolean(item.buildNeeded), true);
    assert.equal(Boolean(item.operationalBurden), true);
    assert.equal(Boolean(item.profitPotential), true);
    assert.equal(Boolean(item.riskLevel), true);
  });

  assert.equal(scoreboard.length, PROFIT_CENTER_SCOREBOARD.length);
});

await run("app routes include remaining P0 and RDO demo entrypoints", () => {
  const app = readFileSync("src/App.jsx", "utf8");

  [
    "/admin/integration-events",
    "/admin/daily-ops",
    "/admin/weekly-brief",
    "/admin/profit-centers",
    "/ops/leads",
    "/ops/today",
    "/ops/maps",
    "/ops/fleet-map",
    "/ops/guide",
    "/ops/funnels",
    "/ops/daily-agent",
    "/ops/billing",
    "/crm",
    "/dashboard",
    "/dealer",
    "/network",
    "/scheduler",
    "/enterprise/rdo",
    "/enterprise/rdo/division",
    "/enterprise/rdo/blueprint",
    "/enterprise/rdo/readiness",
    "/enterprise/rdo/operators",
    "/enterprise/rdo/fleet",
    "/enterprise/rdo/spray-calendar",
    "/enterprise/rdo/application-records",
    "/enterprise/rdo/support",
    "/enterprise/rdo/performance",
  ].forEach((route) => assert.match(app, new RegExp(route.replaceAll("/", "\\/"))));
});
