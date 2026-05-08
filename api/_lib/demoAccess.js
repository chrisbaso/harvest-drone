const DEMO_ACCESS_USER_ID = "33333333-3333-4333-8333-333333333333";
const DEMO_ACCESS_NETWORK_ID = "11111111-1111-4111-8111-111111111111";
const DEMO_ACCESS_DEALER_ID = "22222222-2222-4222-8222-222222222222";

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function isEnabled(env = process.env) {
  return String(env.DEMO_ACCESS_ENABLED || "").toLowerCase() === "true";
}

function createDemoAccessProfile({ email, env = process.env } = {}) {
  return {
    id: DEMO_ACCESS_USER_ID,
    email,
    full_name: env.DEMO_ACCESS_NAME || "RDO Demo User",
    role: env.DEMO_ACCESS_ROLE || "enterprise_demo",
    dealer_id: DEMO_ACCESS_DEALER_ID,
    network_id: DEMO_ACCESS_NETWORK_ID,
    is_active: true,
    is_demo: true,
    demo_access: true,
    dealers: {
      id: DEMO_ACCESS_DEALER_ID,
      name: "RDO Enterprise Demo",
      slug: "rdo-enterprise-demo",
      state: "North Dakota",
      counties_served: ["Grand Forks", "Hubbard"],
      territory_description: "Shared RDO enterprise demo access for Harvest Drone OS.",
      training_status: "active",
    },
    dealer_networks: {
      id: DEMO_ACCESS_NETWORK_ID,
      name: "Harvest Enterprise Demo Network",
      slug: "harvest-enterprise-demo",
    },
  };
}

export function buildDemoAccessPublicConfig(env = process.env) {
  return {
    enabled: isEnabled(env),
    email: normalizeEmail(env.DEMO_ACCESS_EMAIL),
    label: env.DEMO_ACCESS_LABEL || "Shared enterprise demo",
  };
}

export function verifyDemoAccessCredentials({ email, password, env = process.env } = {}) {
  if (!isEnabled(env)) {
    return {
      ok: false,
      reason: "Demo access is not enabled.",
    };
  }

  const configuredEmail = normalizeEmail(env.DEMO_ACCESS_EMAIL);
  const configuredPassword = String(env.DEMO_ACCESS_PASSWORD || "");

  if (!configuredEmail || !configuredPassword) {
    return {
      ok: false,
      reason: "Demo access credentials are not configured.",
    };
  }

  if (normalizeEmail(email) !== configuredEmail || String(password || "") !== configuredPassword) {
    return {
      ok: false,
      reason: "Invalid demo email or password.",
    };
  }

  const profile = createDemoAccessProfile({ email: configuredEmail, env });

  return {
    ok: true,
    profile,
    user: {
      id: profile.id,
      email: profile.email,
      app_metadata: { provider: "demo_access" },
      user_metadata: { full_name: profile.full_name, demo: true },
      aud: "authenticated",
      role: "authenticated",
    },
  };
}
