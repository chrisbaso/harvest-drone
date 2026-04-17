import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { removeTag, upsertContact } from "../_shared/mailchimp.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const resendApiKey = Deno.env.get("RESEND_API_KEY");
const fromEmail = Deno.env.get("FROM_EMAIL") || "notifications@harvestdrone.com";
const adminEmail = Deno.env.get("ADMIN_EMAIL");

if (!supabaseUrl || !supabaseKey || !resendApiKey || !adminEmail) {
  throw new Error("Missing required environment variables for enroll-lead.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, apikey, x-client-info",
};

type LeadPayload = {
  lead_type: "grower" | "operator" | "source" | "hylio";
  lead_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  state?: string;
  county?: string;
  acres?: string | number;
  phone?: string;
  product?: string;
  estimated_total?: string | number;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

function getLeadTags(leadType: LeadPayload["lead_type"]) {
  const tags = [leadType];
  if (leadType === "source") tags.push("source-order");
  if (leadType === "grower") tags.push("grower-funnel");
  if (leadType === "operator") tags.push("operator-funnel");
  if (leadType === "hylio") tags.push("hylio-inquiry");
  return tags;
}

async function findSequenceId(leadType: LeadPayload["lead_type"]) {
  const { data, error } = await supabase
    .from("drip_sequences")
    .select("id")
    .eq("lead_type", leadType)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.id ?? null;
}

async function insertTrackingEnrollment(payload: LeadPayload) {
  const sequenceId = await findSequenceId(payload.lead_type);

  if (!sequenceId) {
    return { enrolled: false, reason: "No active drip sequence found." };
  }

  const { error } = await supabase.from("drip_enrollments").insert({
    sequence_id: sequenceId,
    lead_type: payload.lead_type,
    lead_id: payload.lead_id,
    email: payload.email,
    first_name: payload.first_name || "",
    current_step: 0,
    status: "active",
    next_send_at: null,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { enrolled: true, sequence_id: sequenceId };
}

function buildNotification(payload: LeadPayload) {
  switch (payload.lead_type) {
    case "source":
      return {
        subject: `New SOURCE Order: ${payload.first_name || "Unknown"} - ${payload.acres || "?"} acres - $${payload.estimated_total || "?"}`,
        html: `<h2>New SOURCE Order</h2>
          <table style="border-collapse:collapse;font-family:sans-serif;">
            <tr><td style="padding:8px;font-weight:bold;">Name:</td><td style="padding:8px;">${payload.first_name || ""} ${payload.last_name || ""}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;">Email:</td><td style="padding:8px;">${payload.email}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;">State:</td><td style="padding:8px;">${payload.state || ""}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;">County:</td><td style="padding:8px;">${payload.county || ""}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;">Acres:</td><td style="padding:8px;">${payload.acres || ""}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;">Product:</td><td style="padding:8px;">${payload.product || "SOURCE"}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;">Est. Total:</td><td style="padding:8px;font-size:20px;font-weight:bold;color:#6B8F3C;">$${payload.estimated_total || "?"}</td></tr>
          </table>
          <p><strong>Action:</strong> Send QuickBooks invoice to ${payload.email}</p>`,
      };
    case "grower":
      return {
        subject: `New Grower Lead: ${payload.first_name || "Unknown"} - ${payload.state || "?"} - ${payload.acres || "?"} acres`,
        html: `<h2>New Grower Lead</h2>
          <p><strong>${payload.first_name || ""}</strong> - ${payload.email} - ${payload.state || ""} - ${payload.acres || ""} acres</p>
          <p>Tagged in Mailchimp grower journey. Follow up within 24 hours.</p>`,
      };
    case "operator":
      return {
        subject: `New Operator Lead: ${payload.first_name || "Unknown"} - ${payload.state || "?"}`,
        html: `<h2>New Operator Lead</h2>
          <p><strong>${payload.first_name || ""}</strong> - ${payload.email} - ${payload.state || ""}</p>
          <p>Tagged in Mailchimp operator journey. Review territory within 24 hours.</p>`,
      };
    default:
      return {
        subject: `New Hylio Lead: ${payload.first_name || "Unknown"} - ${payload.state || "?"}`,
        html: `<h2>New Hylio Drone Lead</h2>
          <p><strong>${payload.first_name || ""}</strong> - ${payload.email} - ${payload.state || ""} - ${payload.acres || ""} acres</p>
          <p>High-ticket lead. Call within 24 hours.</p>`,
      };
  }
}

async function sendAdminNotification(payload: LeadPayload) {
  const notification = buildNotification(payload);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [adminEmail],
      subject: notification.subject,
      html: notification.html,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || "Failed to send internal notification.");
  }

  return { sent: true };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = (await req.json()) as LeadPayload;

    if (!payload?.lead_type || !payload?.lead_id || !payload?.email) {
      return jsonResponse({ error: "Missing required lead payload." }, 400);
    }

    const results: Record<string, unknown> = {
      mailchimp: null,
      suppression: null,
      tracking: null,
      notification: null,
      pausedEnrollment: null,
    };

    results.mailchimp = await upsertContact({
      email: payload.email,
      firstName: payload.first_name,
      lastName: payload.last_name,
      state: payload.state,
      county: payload.county,
      acres: payload.acres ? String(payload.acres) : undefined,
      phone: payload.phone,
      tags: getLeadTags(payload.lead_type),
    });

    results.suppression = await removeTag(payload.email, "farm-day-warm");

    try {
      results.tracking = await insertTrackingEnrollment(payload);
    } catch (error) {
      results.tracking = { enrolled: false, error: error instanceof Error ? error.message : "Tracking failed" };
    }

    if (payload.lead_type === "source") {
      const { error } = await supabase
        .from("drip_enrollments")
        .update({ status: "paused", updated_at: new Date().toISOString() })
        .eq("email", payload.email)
        .eq("lead_type", "grower")
        .eq("status", "active");

      results.pausedEnrollment = error ? { paused: false, error: error.message } : { paused: true };
    }

    results.notification = await sendAdminNotification(payload);

    return jsonResponse({ success: true, results });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Unknown enroll-lead error" },
      500,
    );
  }
});
