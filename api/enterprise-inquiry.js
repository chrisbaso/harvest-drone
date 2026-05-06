import { Resend } from "resend";
import { getSupabaseServerClient } from "./_lib/serverSupabase.js";

function sanitize(value) {
  return String(value || "").trim();
}

function getFromEmail() {
  return (process.env.FROM_EMAIL || process.env.RESEND_FROM_EMAIL || "").trim();
}

function getAlertEmail() {
  return (
    process.env.ENTERPRISE_NOTIFICATION_EMAIL ||
    process.env.ALERT_EMAIL ||
    process.env.INTERNAL_NOTIFICATION_EMAIL ||
    process.env.ADMIN_EMAIL ||
    process.env.NOTIFICATION_EMAIL ||
    "jake@harvestdrone.com"
  ).trim();
}

function renderInquiryHtml(inquiry) {
  return `
    <div style="font-family:Arial,sans-serif;padding:24px;background:#0C0F0A;color:#E8E6E1;">
      <div style="max-width:680px;margin:0 auto;background:#151A12;border:1px solid rgba(255,255,255,.12);border-radius:18px;padding:24px;">
        <p style="margin:0 0 12px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#A3D977;font-weight:700;">Enterprise drone division inquiry</p>
        <h1 style="margin:0 0 16px;font-size:28px;line-height:1.1;color:#fff;">New enterprise prospect from Harvest Drone</h1>
        <table style="width:100%;border-collapse:collapse;color:#E8E6E1;">
          <tr><td style="padding:8px 0;font-weight:700;">Name</td><td style="padding:8px 0;">${inquiry.contact_name}</td></tr>
          <tr><td style="padding:8px 0;font-weight:700;">Company</td><td style="padding:8px 0;">${inquiry.company || "-"}</td></tr>
          <tr><td style="padding:8px 0;font-weight:700;">Email</td><td style="padding:8px 0;">${inquiry.email}</td></tr>
          <tr><td style="padding:8px 0;font-weight:700;">Phone</td><td style="padding:8px 0;">${inquiry.phone || "-"}</td></tr>
        </table>
        <p style="margin:18px 0 6px;font-weight:700;">Message</p>
        <p style="margin:0;color:#cfd7ca;">${inquiry.message || "-"}</p>
      </div>
    </div>
  `;
}

async function sendNotification(inquiry) {
  const resendKey = sanitize(process.env.RESEND_API_KEY);
  const fromEmail = getFromEmail();
  const alertEmail = getAlertEmail();

  if (!resendKey || !fromEmail || !alertEmail) {
    console.warn("[EnterpriseInquiry] Saved inquiry but skipped email notification because Resend env vars are missing.");
    return { status: "skipped" };
  }

  const resend = new Resend(resendKey);
  await resend.emails.send({
    from: fromEmail,
    to: alertEmail,
    replyTo: inquiry.email,
    subject: `Enterprise Drone Division Inquiry: ${inquiry.company || inquiry.contact_name}`,
    html: renderInquiryHtml(inquiry),
  });

  return { status: "sent" };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const payload = req.body || {};
  const record = {
    contact_name: sanitize(payload.contactName),
    email: sanitize(payload.email),
    company: sanitize(payload.company) || null,
    phone: sanitize(payload.phone) || null,
    message: sanitize(payload.message) || null,
  };

  if (!record.contact_name || !record.email) {
    return res.status(400).json({ error: "Name and email are required." });
  }

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("enterprise_inquiries")
      .insert(record)
      .select("*")
      .single();

    if (error) throw error;

    const notification = await sendNotification(data);
    return res.status(200).json({ inquiry: data, notification });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unable to submit enterprise inquiry." });
  }
}
