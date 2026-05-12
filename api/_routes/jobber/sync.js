import { getSupabaseServerClient } from "../../_lib/serverSupabase.js";
import { syncJobberClients, syncJobberJobs } from "../../_lib/jobber.js";

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
      error: "Supabase is required for Jobber sync.",
      detail: error.message,
    });
  }

  try {
    const [clients, jobs] = await Promise.all([
      syncJobberClients({ supabase }),
      syncJobberJobs({ supabase }),
    ]);

    return res.status(200).json({
      clients: clients.length,
      jobs: jobs.length,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unable to sync Jobber data." });
  }
}
