import { generateDailyOpsBrief, isWeekdayInTimezone } from "../../_lib/dailyOpsAgent.js";
import { getSupabaseServerClient } from "../../_lib/serverSupabase.js";

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
    return res.status(405).json({ error: "Method not allowed." });
  }

  if (!isAuthorized(req)) {
    return unauthorized(res);
  }

  const timezone = process.env.DAILY_OPS_TIMEZONE || "America/Chicago";

  if (!isWeekdayInTimezone(new Date(), timezone)) {
    return res.status(200).json({ skipped: true, reason: "Daily Ops Brief only runs on weekdays.", timezone });
  }

  try {
    const supabase = getSupabaseServerClient();
    const result = await generateDailyOpsBrief({
      supabase,
      timezone,
      postToSlack: true,
    });

    return res.status(200).json({
      briefId: result.brief.id,
      date: result.brief.brief_date,
      slackStatus: result.slackResult?.status || "not_sent",
      counts: result.brief.summary?.counts || {},
      warnings: result.brief.summary?.warnings || [],
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unable to run Daily Ops Brief cron." });
  }
}
