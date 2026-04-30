import assert from "node:assert/strict";
import { LEAD_TIERS, evaluateLead } from "../shared/harvestLeadEngine.js";

function run(name, callback) {
  try {
    callback();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

run("scores a strong near-term lead as hot", () => {
  const result = evaluateLead({
    acreageRange: "5,000+",
    crops: ["Corn", "Soybeans"],
    applicationMethod: "Drone application",
    primaryGoal: "Testing SOURCE on select acres",
    decisionTiming: "Immediately / this season",
    interestLevel: "Very open",
  });

  assert.equal(result.leadTier, LEAD_TIERS.HOT);
  assert.equal(result.leadScore, 100);
  assert.equal(result.offerPath, "Custom SOURCE Application Review");
  assert.ok(result.reasonCodes.includes("Large-acreage opportunity"));
});

run("scores a research-stage smaller lead as nurture or low fit", () => {
  const result = evaluateLead({
    acreageRange: "Under 500",
    crops: ["Other"],
    applicationMethod: "Other",
    primaryGoal: "Other",
    decisionTiming: "Just researching",
    interestLevel: "Not interested yet",
  });

  assert.ok([LEAD_TIERS.NURTURE, LEAD_TIERS.LOW_FIT].includes(result.leadTier));
  assert.ok(result.leadScore <= 30);
});
