import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { upsertContact } from "../_shared/mailchimp.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing required environment variables for mark-paid.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order_id } = await req.json();

    if (!order_id) {
      return jsonResponse({ error: "Missing order_id." }, 400);
    }

    const { data: order, error: fetchError } = await supabase
      .from("source_orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (fetchError || !order) {
      return jsonResponse({ error: "Order not found." }, 404);
    }

    const { error: updateError } = await supabase
      .from("source_orders")
      .update({ status: "paid", updated_at: new Date().toISOString() })
      .eq("id", order_id);

    if (updateError) {
      return jsonResponse({ error: updateError.message }, 500);
    }

    const mailchimp = await upsertContact({
      email: order.email,
      firstName: order.first_name || undefined,
      state: order.state || undefined,
      acres: order.acres ? String(order.acres) : undefined,
      tags: ["source-paid"],
    });

    if (!mailchimp.success) {
      return jsonResponse({ error: mailchimp.error || "Failed to tag contact in Mailchimp." }, 500);
    }

    return jsonResponse({ success: true });
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : "Unknown mark-paid error" }, 500);
  }
});
