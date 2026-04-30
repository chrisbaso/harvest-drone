import { isHarvestLeadStorageConfigured, listHarvestLeads } from "../_lib/harvestLeads.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  if (!isHarvestLeadStorageConfigured()) {
    return res.status(503).json({
      error: "Supabase is not configured for Harvest Drone leads.",
      mock_mode_available: true,
    });
  }

  try {
    const leads = await listHarvestLeads();
    return res.status(200).json({ leads });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unable to load Harvest leads." });
  }
}
