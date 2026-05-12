async function parseJsonSafely(response) {
  const contentType = response.headers?.get?.("content-type") || "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return await response.json();
  } catch (_error) {
    return null;
  }
}

export function isViteApiFallback(response, result) {
  const contentType = response.headers?.get?.("content-type") || "";
  return response.ok && !result && !contentType.includes("application/json");
}

export async function getDemoAccessConfig() {
  const response = await fetch("/api/demo-access");
  const result = await parseJsonSafely(response);

  if (isViteApiFallback(response, result)) {
    return {
      enabled: true,
      email: "rdo-demo@harvestdrone.local",
      label: "Local shared enterprise demo",
      localFallback: true,
    };
  }

  if (!response.ok) {
    throw new Error(result?.error || "Unable to load demo access settings.");
  }

  return result;
}

export async function signInDemoAccess({ email, password }) {
  const response = await fetch("/api/demo-access", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  const result = await parseJsonSafely(response);

  if (isViteApiFallback(response, result)) {
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (normalizedEmail === "rdo-demo@harvestdrone.local" && password === "harvest-demo") {
      return {
        user: {
          id: "33333333-3333-4333-8333-333333333333",
          email: normalizedEmail,
          app_metadata: { provider: "local_demo_access" },
          user_metadata: { full_name: "RDO Demo User", demo: true },
          aud: "authenticated",
          role: "authenticated",
        },
        profile: {
          id: "33333333-3333-4333-8333-333333333333",
          email: normalizedEmail,
          full_name: "RDO Demo User",
          role: "enterprise_demo",
          dealer_id: "22222222-2222-4222-8222-222222222222",
          network_id: "11111111-1111-4111-8111-111111111111",
          is_active: true,
          is_demo: true,
          demo_access: true,
        },
        localFallback: true,
      };
    }

    throw new Error("Invalid local demo email or password.");
  }

  if (!response.ok) {
    throw new Error(result?.error || "Invalid demo email or password.");
  }

  return result;
}
