import { insertHarvestLead, isHarvestLeadStorageConfigured } from "../../_lib/harvestLeads.js";

function badRequest(res, message) {
  return res.status(400).json({ error: message });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const payload = req.body || {};
  const requiredFields = [
    "acreageRange",
    "crops",
    "state",
    "county",
    "zip",
    "applicationMethod",
    "primaryGoal",
    "decisionTiming",
    "interestLevel",
    "firstName",
    "lastName",
    "email",
    "phone",
    "preferredContactMethod",
  ];
  const missingField = requiredFields.find((field) => {
    const value = payload[field];

    if (Array.isArray(value)) {
      return value.length === 0;
    }

    return !value;
  });

  if (missingField) {
    return badRequest(res, `Missing required field: ${missingField}`);
  }

  if (payload.preferredContactMethod === "Text" && payload.smsConsent !== true) {
    return badRequest(
      res,
      "SMS consent is required when text is selected as the preferred contact method.",
    );
  }

  if (!isHarvestLeadStorageConfigured()) {
    return res.status(503).json({
      error: "Supabase is not configured for Harvest Drone leads.",
      mock_mode_available: true,
    });
  }

  try {
    const result = await insertHarvestLead(payload);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Unable to submit Harvest Drone lead.",
    });
  }
}
