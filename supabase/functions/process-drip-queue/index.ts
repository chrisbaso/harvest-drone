import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { removeTag, upsertContact } from "../_shared/mailchimp.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const resendApiKey = Deno.env.get("RESEND_API_KEY");
const fromEmail = Deno.env.get("FROM_EMAIL") || "notifications@harvestdrone.com";
const adminEmail = Deno.env.get("ADMIN_EMAIL");

if (!supabaseUrl || !supabaseKey || !resendApiKey || !adminEmail) {
  throw new Error("Missing required environment variables for process-drip-queue.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, apikey, x-client-info",
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

async function sendInternalResendEmail(to: string[], subject: string, html: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || "Internal Resend notification failed.");
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const results = {
      invoiceReminders: 0,
      flagsProcessed: 0,
      flagErrors: [] as string[],
    };

    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const { data: unpaidOrders, error: unpaidOrdersError } = await supabase
      .from("source_orders")
      .select("*")
      .eq("status", "pending")
      .lt("created_at", threeDaysAgo)
      .is("invoice_reminder_sent", null);

    if (unpaidOrdersError) {
      throw new Error(unpaidOrdersError.message);
    }

    for (const order of unpaidOrders || []) {
      const mailchimpReminder = await upsertContact({
        email: order.email,
        firstName: order.first_name || undefined,
        state: order.state || undefined,
        county: order.county || undefined,
        acres: order.acres ? String(order.acres) : undefined,
        tags: ["source-invoice-reminder-due"],
        mergeFields: {
          PRODUCT: order.product || "SOURCE",
          TOTAL: order.estimated_total || "",
        },
      });

      if (!mailchimpReminder.success) {
        throw new Error(mailchimpReminder.error || "Mailchimp reminder tagging failed.");
      }

      await sendInternalResendEmail(
        [adminEmail],
        `Unpaid order: ${order.first_name || "Unknown"} - ${order.acres || "?"} acres - $${order.estimated_total || "?"}`,
        `<p>3+ days unpaid. Mailchimp reminder tag applied to ${order.email}. Consider a follow-up call.</p>`,
      );

      const { error: updateError } = await supabase
        .from("source_orders")
        .update({ invoice_reminder_sent: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq("id", order.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      results.invoiceReminders += 1;
    }

    const { data: flags, error: flagsError } = await supabase
      .from("automation_flags")
      .select("*")
      .eq("processed", false)
      .limit(50);

    if (flagsError) {
      results.flagErrors.push(flagsError.message);
      return jsonResponse({ success: true, results });
    }

    for (const flag of flags || []) {
      try {
        if (flag.action === "remove_tag" && flag.tag && flag.email) {
          await removeTag(flag.email, flag.tag);
        }

        const { error: flagUpdateError } = await supabase
          .from("automation_flags")
          .update({ processed: true, processed_at: new Date().toISOString() })
          .eq("id", flag.id);

        if (flagUpdateError) {
          throw new Error(flagUpdateError.message);
        }

        results.flagsProcessed += 1;
      } catch (error) {
        results.flagErrors.push(error instanceof Error ? error.message : "Unknown automation flag error");
      }
    }

    return jsonResponse({ success: true, results });
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : "Unknown process-drip-queue error" }, 500);
  }
});
