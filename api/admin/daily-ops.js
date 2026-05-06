import { generateDailyOpsBrief, getLatestDailyOpsBrief } from "../_lib/dailyOpsAgent.js";
import { getSupabaseServerClient } from "../_lib/serverSupabase.js";

export default async function handler(req, res) {
  if (!["GET", "POST"].includes(req.method)) {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const supabase = getSupabaseServerClient();
    const date = req.query?.date || req.body?.date || null;

    if (req.method === "GET" && req.query?.mode === "latest") {
      const brief = await getLatestDailyOpsBrief({ supabase, date });
      return res.status(200).json({ brief, mode: "supabase" });
    }

    const result = await generateDailyOpsBrief({
      supabase,
      date: date || undefined,
      postToSlack: req.method === "POST" && req.body?.action === "send_slack",
    });

    return res.status(200).json({
      ...result,
      mode: "supabase",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unable to generate Daily Ops Brief." });
  }
}
