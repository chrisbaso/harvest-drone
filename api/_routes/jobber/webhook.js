import { getSupabaseServerClient } from "../../_lib/serverSupabase.js";
import { handleJobberWebhook } from "../../_lib/jobber.js";

function getRawBody(req) {
  if (typeof req.rawBody === "string") {
    return req.rawBody;
  }

  if (Buffer.isBuffer(req.rawBody)) {
    return req.rawBody.toString("utf8");
  }

  return req.body ? JSON.stringify(req.body) : "";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  let supabase;

  try {
    supabase = getSupabaseServerClient();
  } catch (error) {
    return res.status(503).json({
      error: "Supabase is required to log Jobber webhooks.",
      detail: error.message,
    });
  }

  try {
    const result = await handleJobberWebhook({
      payload: req.body || {},
      rawBody: getRawBody(req),
      signature: req.headers["x-jobber-hmac-sha256"] || req.headers["X-Jobber-Hmac-SHA256"],
      supabase,
    });

    return res.status(202).json({
      received: true,
      ...result,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Unable to process Jobber webhook." });
  }
}
