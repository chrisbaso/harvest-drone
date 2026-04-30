import {
  getHarvestLeadDetail,
  isHarvestLeadStorageConfigured,
  updateHarvestLead,
} from "../_lib/harvestLeads.js";

export default async function handler(req, res) {
  const leadId = req.query?.id;

  if (!leadId) {
    return res.status(400).json({ error: "Missing lead id." });
  }

  if (!isHarvestLeadStorageConfigured()) {
    return res.status(503).json({
      error: "Supabase is not configured for Harvest Drone leads.",
      mock_mode_available: true,
    });
  }

  try {
    if (req.method === "GET") {
      const detail = await getHarvestLeadDetail(leadId);
      return res.status(200).json(detail);
    }

    if (req.method === "PATCH") {
      const result = await updateHarvestLead(leadId, req.body?.updates || {});
      return res.status(200).json(result);
    }

    res.setHeader("Allow", "GET, PATCH");
    return res.status(405).json({ error: "Method not allowed." });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unable to load lead detail." });
  }
}
