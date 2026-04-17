function unauthorized(res) {
  return res.status(401).json({ error: "Unauthorized" });
}

function isAuthorized(req) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return true;
  }

  const authHeader = req.headers.authorization || "";
  return authHeader === `Bearer ${cronSecret}`;
}

export default async function handler(req, res) {
  if (!["GET", "POST"].includes(req.method)) {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!isAuthorized(req)) {
    return unauthorized(res);
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const publishableKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !publishableKey) {
      return res.status(500).json({
        error: "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY for process-drip proxy.",
      });
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/process-drip-queue`, {
      method: "POST",
      headers: {
        apikey: publishableKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      return res.status(response.status).json(result || { error: "process-drip-queue failed." });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Failed to process drip queue.",
    });
  }
}
