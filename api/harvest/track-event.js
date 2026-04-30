import { insertHarvestEvent, isHarvestLeadStorageConfigured } from "../_lib/harvestLeads.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const { leadId = null, eventType, eventPayload = {} } = req.body || {};

  if (!eventType) {
    return res.status(400).json({ error: "Missing eventType." });
  }

  if (!isHarvestLeadStorageConfigured()) {
    return res.status(202).json({ accepted: true, mock_mode_available: true });
  }

  try {
    await insertHarvestEvent({ leadId, eventType, eventPayload });
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unable to store event." });
  }
}
