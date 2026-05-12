import { getSupabaseServerClient } from "../../_lib/serverSupabase.js";
import { handleInboundSms } from "../../_lib/twilio.js";

function twimlResponse(message = "") {
  return `<?xml version="1.0" encoding="UTF-8"?><Response>${message ? `<Message>${message}</Message>` : ""}</Response>`;
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
      error: "Supabase is required to log inbound SMS.",
      detail: error.message,
    });
  }

  try {
    const result = await handleInboundSms({
      payload: req.body || {},
      supabase,
    });

    res.setHeader("Content-Type", "text/xml");

    if (result.optAction === "opt_out") {
      return res.status(200).send(twimlResponse("You have been unsubscribed from Harvest Drone SMS updates."));
    }

    if (result.optAction === "opt_in") {
      return res.status(200).send(twimlResponse("You are resubscribed to Harvest Drone SMS updates."));
    }

    return res.status(200).send(twimlResponse());
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unable to process inbound SMS." });
  }
}
