import assert from "node:assert/strict";
import { buildRevenueCommandCenter } from "../shared/revenueOps.js";

function run(name, callback) {
  try {
    callback();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

const NOW = new Date("2026-05-04T18:00:00.000Z");

run("rolls lead queue into revenue-first acre and pipeline metrics", () => {
  const result = buildRevenueCommandCenter(
    [
      {
        id: "hot-stale",
        created_at: "2026-05-03T12:00:00.000Z",
        lead_tier: "Hot",
        status: "New",
        estimated_acres: 3750,
        estimated_value: 42000,
        actual_revenue: null,
        dealer_slug: "demo-territory",
      },
      {
        id: "warm-proposal",
        created_at: "2026-05-04T12:00:00.000Z",
        lead_tier: "Warm",
        status: "Proposal / Plan Sent",
        estimated_acres: 1750,
        estimated_value: 16000,
        actual_revenue: null,
        dealer_slug: "demo-territory",
      },
      {
        id: "won-lead",
        created_at: "2026-05-01T12:00:00.000Z",
        lead_tier: "Warm",
        status: "Won",
        revenue_status: "won",
        estimated_acres: 750,
        estimated_value: 7000,
        actual_revenue: 6200,
        dealer_slug: "prairie-ag",
      },
      {
        id: "nurture",
        created_at: "2026-05-04T17:00:00.000Z",
        lead_tier: "Nurture",
        status: "Nurture",
        estimated_acres: 500,
        estimated_value: 2000,
        actual_revenue: null,
      },
    ],
    { now: NOW },
  );

  assert.equal(result.metrics.totalLeads, 4);
  assert.equal(result.metrics.qualifiedAcres, 6250);
  assert.equal(result.metrics.hotAcres, 3750);
  assert.equal(result.metrics.proposalAcres, 1750);
  assert.equal(result.metrics.wonAcres, 750);
  assert.equal(result.metrics.pipelineValue, 65000);
  assert.equal(result.metrics.actualRevenue, 6200);
  assert.equal(result.metrics.hotLeadsAtRisk, 1);
});

run("flags hot leads as SLA risk after 24 hours without contact", () => {
  const result = buildRevenueCommandCenter(
    [
      {
        id: "stale",
        created_at: "2026-05-03T12:00:00.000Z",
        first_name: "Mia",
        last_name: "Farmer",
        farm_name: "North Ridge",
        lead_tier: "Hot",
        status: "New",
        estimated_acres: 5000,
      },
      {
        id: "contacted",
        created_at: "2026-05-03T10:00:00.000Z",
        lead_tier: "Hot",
        status: "Contacted",
        last_contacted_at: "2026-05-03T15:00:00.000Z",
        estimated_acres: 5000,
      },
    ],
    { now: NOW, hotLeadSlaHours: 24 },
  );

  assert.equal(result.hotLeadSla.length, 1);
  assert.equal(result.hotLeadSla[0].id, "stale");
  assert.equal(result.hotLeadSla[0].hoursOpen, 30);
  assert.equal(result.hotLeadSla[0].displayName, "Mia Farmer");
  assert.equal(result.hotLeadSla[0].farmName, "North Ridge");
});

run("groups dealer attribution by slug with direct traffic fallback", () => {
  const result = buildRevenueCommandCenter(
    [
      {
        id: "one",
        lead_tier: "Hot",
        status: "Won",
        revenue_status: "won",
        estimated_acres: 1000,
        actual_revenue: 9000,
        dealer_slug: "demo-territory",
      },
      {
        id: "two",
        lead_tier: "Warm",
        status: "New",
        estimated_acres: 500,
        dealer_slug: "demo-territory",
      },
      {
        id: "three",
        lead_tier: "Hot",
        status: "New",
        estimated_acres: 750,
      },
    ],
    { now: NOW },
  );

  assert.deepEqual(result.dealerLeaderboard[0], {
    dealerSlug: "demo-territory",
    label: "demo-territory",
    leads: 2,
    hotLeads: 1,
    qualifiedAcres: 1500,
    wonAcres: 1000,
    actualRevenue: 9000,
  });
  assert.equal(result.dealerLeaderboard[1].dealerSlug, "direct");
  assert.equal(result.dealerLeaderboard[1].hotLeads, 1);
});
