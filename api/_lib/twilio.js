import { logIntegrationEvent } from "./integrationEvents.js";
import { sendSlackAlert } from "./slack.js";

const OPT_OUT_TERMS = new Set(["STOP", "STOPALL", "UNSUBSCRIBE", "CANCEL", "END", "QUIT"]);
const OPT_IN_TERMS = new Set(["START", "YES", "UNSTOP"]);

function normalizePhone(value) {
  return String(value || "").trim();
}

function getTwilioConfig(env) {
  return {
    accountSid: String(env.TWILIO_ACCOUNT_SID || "").trim(),
    authToken: String(env.TWILIO_AUTH_TOKEN || "").trim(),
    fromNumber: String(env.TWILIO_FROM_NUMBER || "").trim(),
    enableRealSend:
      String(env.ENABLE_REAL_SMS || "").toLowerCase() === "true" ||
      String(env.TWILIO_ENABLE_REAL_SEND || "").toLowerCase() === "true",
    statusCallbackUrl: String(env.TWILIO_STATUS_CALLBACK_URL || "").trim(),
  };
}

export function getSmsOptOutAction(body = "") {
  const normalized = String(body || "")
    .trim()
    .toUpperCase();

  if (OPT_OUT_TERMS.has(normalized) || normalized.includes("UNSUBSCRIBE")) {
    return "opt_out";
  }

  if (OPT_IN_TERMS.has(normalized)) {
    return "opt_in";
  }

  return null;
}

export function buildLeadAutoResponse(payload = {}) {
  const name = payload.firstName || payload.name || "";
  return `Hi ${name}, this is Harvest Drone. We received your request and are reviewing the best next step for your acres.`.replace(
    "Hi ,",
    "Hi,",
  );
}

export async function logSmsMessage({
  direction,
  from,
  to,
  body,
  status,
  providerMessageId = null,
  leadId = null,
  payload = {},
  supabase,
}) {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("sms_message_logs")
    .insert({
      direction,
      from_number: normalizePhone(from),
      to_number: normalizePhone(to),
      body_preview: String(body || "").slice(0, 240),
      status,
      provider_message_id: providerMessageId,
      lead_id: leadId,
      payload_summary: payload,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function recordSmsOptOut({ phone, action, source = "twilio", supabase }) {
  if (!supabase || !phone || !action) {
    return null;
  }

  const optedOut = action === "opt_out";
  const { data, error } = await supabase
    .from("sms_opt_outs")
    .upsert(
      {
        phone_number: normalizePhone(phone),
        opted_out: optedOut,
        source,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "phone_number" },
    )
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function isSmsOptedOut({ phone, supabase }) {
  if (!supabase || !phone) {
    return false;
  }

  const { data, error } = await supabase
    .from("sms_opt_outs")
    .select("opted_out")
    .eq("phone_number", normalizePhone(phone))
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data?.opted_out);
}

export async function sendSmsMessage({
  to,
  body,
  leadId = null,
  env = process.env,
  fetchImpl = fetch,
  supabase = null,
} = {}) {
  const config = getTwilioConfig(env);

  if (!to || !body) {
    throw new Error("SMS recipient and body are required.");
  }

  if (!config.accountSid || !config.authToken || !config.fromNumber) {
    await logIntegrationEvent(
      {
        provider: "twilio",
        eventType: "sms_send_skipped",
        status: "skipped",
        externalId: leadId,
        payload: { to, bodyPreview: body.slice(0, 80) },
        errorMessage: "Twilio credentials are not configured.",
      },
      { supabase },
    ).catch(() => null);

    return {
      sent: false,
      status: "skipped",
      reason: "Twilio credentials are not configured.",
      to,
      messagePreview: body,
    };
  }

  if (await isSmsOptedOut({ phone: to, supabase })) {
    return {
      sent: false,
      status: "blocked_opt_out",
      reason: "Recipient has opted out of SMS.",
      to,
      messagePreview: body,
    };
  }

  if (!config.enableRealSend) {
    await logSmsMessage({
      direction: "outbound",
      from: config.fromNumber,
      to,
      body,
      status: "dry_run",
      leadId,
      payload: { dryRun: true },
      supabase,
    }).catch(() => null);

    return {
      sent: false,
      status: "dry_run",
      reason: "Set ENABLE_REAL_SMS=true to send real SMS.",
      to,
      messagePreview: body,
    };
  }

  const params = new URLSearchParams({
    To: to,
    From: config.fromNumber,
    Body: body,
  });

  if (config.statusCallbackUrl) {
    params.set("StatusCallback", config.statusCallbackUrl);
  }

  const auth = Buffer.from(`${config.accountSid}:${config.authToken}`).toString("base64");
  const response = await fetchImpl(
    `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    },
  );

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    const message = result?.message || "Twilio SMS send failed.";
    await logIntegrationEvent(
      {
        provider: "twilio",
        eventType: "sms_send_failed",
        status: "error",
        externalId: leadId,
        payload: { to, result },
        errorMessage: message,
      },
      { supabase },
    ).catch(() => null);
    throw new Error(message);
  }

  await logSmsMessage({
    direction: "outbound",
    from: config.fromNumber,
    to,
    body,
    status: result?.status || "sent",
    providerMessageId: result?.sid || null,
    leadId,
    payload: result || {},
    supabase,
  }).catch(() => null);

  await logIntegrationEvent(
    {
      provider: "twilio",
      eventType: "sms_sent",
      status: "sent",
      externalId: result?.sid || leadId,
      payload: result || {},
      processedAt: new Date().toISOString(),
    },
    { supabase },
  ).catch(() => null);

  return {
    sent: true,
    status: result?.status || "sent",
    messageId: result?.sid || null,
    to,
    messagePreview: body,
  };
}

export async function handleInboundSms({ payload, supabase }) {
  const from = normalizePhone(payload.From || payload.from);
  const to = normalizePhone(payload.To || payload.to);
  const body = String(payload.Body || payload.body || "");
  const messageSid = payload.MessageSid || payload.SmsSid || payload.messageSid || null;
  const optAction = getSmsOptOutAction(body);

  await logSmsMessage({
    direction: "inbound",
    from,
    to,
    body,
    status: optAction || "received",
    providerMessageId: messageSid,
    payload,
    supabase,
  });

  if (optAction) {
    await recordSmsOptOut({ phone: from, action: optAction, source: "twilio", supabase });
  } else {
    await sendSlackAlert({
      type: "customer_sms_reply",
      message: body || "Customer replied by SMS.",
      context: {
        from,
        to,
        messageSid,
      },
      supabase,
    });
  }

  await logIntegrationEvent({
    provider: "twilio",
    eventType: "sms_inbound_webhook",
    externalId: messageSid,
    status: "processed",
    payload,
    processedAt: new Date().toISOString(),
  }, { supabase });

  return {
    from,
    to,
    messageSid,
    optAction,
  };
}
