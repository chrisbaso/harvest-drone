import { getSupabaseServerClient } from "../../_lib/serverSupabase.js";
import { logIntegrationEvent } from "../../_lib/integrationEvents.js";

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
      error: "Supabase is required to log Twilio status callbacks.",
      detail: error.message,
    });
  }

  const payload = req.body || {};
  const messageSid = payload.MessageSid || payload.SmsSid || null;
  const messageStatus = payload.MessageStatus || payload.SmsStatus || "status_callback";

  try {
    await logIntegrationEvent({
      provider: "twilio",
      eventType: "sms_status_callback",
      externalId: messageSid,
      status: messageStatus,
      payload,
      processedAt: new Date().toISOString(),
    }, { supabase });

    if (messageSid) {
      await supabase
        .from("sms_message_logs")
        .update({
          status: messageStatus,
          updated_at: new Date().toISOString(),
          payload_summary: payload,
        })
        .eq("provider_message_id", messageSid);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unable to process SMS status callback." });
  }
}
