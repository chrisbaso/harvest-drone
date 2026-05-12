import assert from "node:assert/strict";
import {
  buildDemoAccessPublicConfig,
  verifyDemoAccessCredentials,
} from "../api/_lib/demoAccess.js";

function run(name, callback) {
  try {
    callback();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

run("demo access rejects when shared login is disabled", () => {
  const result = verifyDemoAccessCredentials({
    email: "rdo-demo@harvestdrone.com",
    password: "correct-password",
    env: {
      DEMO_ACCESS_ENABLED: "false",
      DEMO_ACCESS_EMAIL: "rdo-demo@harvestdrone.com",
      DEMO_ACCESS_PASSWORD: "correct-password",
    },
  });

  assert.equal(result.ok, false);
  assert.equal(result.reason, "Demo access is not enabled.");
});

run("demo access accepts exact configured shared credentials", () => {
  const result = verifyDemoAccessCredentials({
    email: " RDO-Demo@HarvestDrone.com ",
    password: "correct-password",
    env: {
      DEMO_ACCESS_ENABLED: "true",
      DEMO_ACCESS_EMAIL: "rdo-demo@harvestdrone.com",
      DEMO_ACCESS_PASSWORD: "correct-password",
    },
  });

  assert.equal(result.ok, true);
  assert.equal(result.profile.role, "enterprise_demo");
  assert.equal(result.profile.email, "rdo-demo@harvestdrone.com");
});

run("demo access rejects wrong password", () => {
  const result = verifyDemoAccessCredentials({
    email: "rdo-demo@harvestdrone.com",
    password: "wrong-password",
    env: {
      DEMO_ACCESS_ENABLED: "true",
      DEMO_ACCESS_EMAIL: "rdo-demo@harvestdrone.com",
      DEMO_ACCESS_PASSWORD: "correct-password",
    },
  });

  assert.equal(result.ok, false);
  assert.equal(result.reason, "Invalid demo email or password.");
});

run("public demo access config never exposes password", () => {
  const config = buildDemoAccessPublicConfig({
    DEMO_ACCESS_ENABLED: "true",
    DEMO_ACCESS_EMAIL: "rdo-demo@harvestdrone.com",
    DEMO_ACCESS_PASSWORD: "correct-password",
  });
  const serialized = JSON.stringify(config);

  assert.equal(config.enabled, true);
  assert.equal(config.email, "rdo-demo@harvestdrone.com");
  assert.equal(serialized.includes("correct-password"), false);
});
