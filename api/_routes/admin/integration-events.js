import { listIntegrationEvents } from "../../_lib/integrationEvents.js";
import { getSupabaseServerClient } from "../../_lib/serverSupabase.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const supabase = getSupabaseServerClient();
    const limit = Number(req.query?.limit || 100);
    const events = await listIntegrationEvents({
      limit: Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 200) : 100,
      supabase,
    });

    return res.status(200).json({
      events,
      mode: "supabase",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unable to load integration events." });
  }
}
