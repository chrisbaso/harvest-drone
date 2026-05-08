import assert from "node:assert/strict";
import {
  ENTERPRISE_DEMO_HOME,
  canAccessProtectedRoute,
  getLoginRedirectPath,
  getRestrictedProfileRedirect,
} from "../shared/accessControl.js";
import { verifyDemoAccessCredentials } from "../api/_lib/demoAccess.js";

function run(name, callback) {
  try {
    callback();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

run("shared enterprise demo credentials create an enterprise-demo-only role", () => {
  const result = verifyDemoAccessCredentials({
    email: "rdo-demo@harvestdrone.com",
    password: "correct-password",
    env: {
      DEMO_ACCESS_ENABLED: "true",
      DEMO_ACCESS_EMAIL: "rdo-demo@harvestdrone.com",
      DEMO_ACCESS_PASSWORD: "correct-password",
    },
  });

  assert.equal(result.ok, true);
  assert.equal(result.profile.role, "enterprise_demo");
});

run("enterprise demo login always lands on the enterprise demo home", () => {
  assert.equal(
    getLoginRedirectPath({ role: "enterprise_demo" }, "/dealer"),
    ENTERPRISE_DEMO_HOME,
  );
  assert.equal(
    getLoginRedirectPath({ role: "enterprise_demo" }, "/enterprise/rdo/readiness"),
    ENTERPRISE_DEMO_HOME,
  );
});

run("enterprise demo users can access RDO enterprise demo routes only", () => {
  assert.equal(
    canAccessProtectedRoute({ role: "enterprise_demo" }, ["admin", "network_manager", "dealer", "enterprise_demo"], "/enterprise/rdo/division"),
    true,
  );
  assert.equal(
    canAccessProtectedRoute({ role: "enterprise_demo" }, ["admin", "network_manager", "dealer", "enterprise_demo"], "/enterprise/rdo/readiness"),
    true,
  );
  assert.equal(
    canAccessProtectedRoute({ role: "enterprise_demo" }, ["dealer", "admin"], "/dealer"),
    false,
  );
  assert.equal(
    canAccessProtectedRoute({ role: "enterprise_demo" }, ["admin", "network_manager", "dealer"], "/fleet"),
    false,
  );
});

run("enterprise demo users are forced back home from every non-demo path", () => {
  assert.equal(getRestrictedProfileRedirect({ role: "enterprise_demo" }, "/dealer"), ENTERPRISE_DEMO_HOME);
  assert.equal(getRestrictedProfileRedirect({ role: "enterprise_demo" }, "/"), ENTERPRISE_DEMO_HOME);
  assert.equal(getRestrictedProfileRedirect({ role: "enterprise_demo" }, "/enterprise/rdo/fleet"), null);
  assert.equal(getRestrictedProfileRedirect({ role: "dealer" }, "/dealer"), null);
});
