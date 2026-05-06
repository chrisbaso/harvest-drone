import { listOpsLoops, updateOpsLoopStatus } from "../_lib/dailyOpsAgent.js";
import { getSupabaseServerClient } from "../_lib/serverSupabase.js";

export default async function handler(req, res) {
  if (!["GET", "PATCH", "POST"].includes(req.method)) {
    res.setHeader("Allow", "GET, PATCH, POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const supabase = getSupabaseServerClient();

    if (req.method === "GET") {
      const status = req.query?.status ? String(req.query.status).split(",") : ["open", "assigned"];
      const loops = await listOpsLoops({ supabase, status });
      return res.status(200).json({ loops, mode: "supabase" });
    }

    const updated = await updateOpsLoopStatus({
      supabase,
      id: req.body?.id,
      status: req.body?.status,
      ownerUserId: req.body?.ownerUserId,
      dueAt: req.body?.dueAt,
    });
    const loops = await listOpsLoops({ supabase, status: ["open", "assigned"] });

    return res.status(200).json({ loop: updated, loops, mode: "supabase" });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unable to update open loop." });
  }
}
