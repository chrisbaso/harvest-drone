import { supabase, supabaseConfigError } from "./supabase";

function ensureSupabaseConfigured() {
  if (supabaseConfigError) {
    throw new Error(supabaseConfigError);
  }
}

function createFunctionHeaders() {
  const headers = {
    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    "Content-Type": "application/json",
  };

  if (/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(import.meta.env.VITE_SUPABASE_ANON_KEY || "")) {
    headers.Authorization = `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`;
  }

  return headers;
}

async function submitLead(type, formData) {
  const response = await fetch("/api/submit-lead", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type, formData }),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.saved
        ? `${result?.error || "Lead saved, but the internal notification failed."} Please check the notification setup and try again if needed.`
        : result?.error || "Something went wrong while submitting the lead.",
    );
  }

  return {
    status: result?.lead?.status ?? "new",
    created_at: result?.lead?.created_at ?? new Date().toISOString(),
  };
}

export async function submitGrowerLead(formData) {
  ensureSupabaseConfigured();
  return submitLead("grower", formData);
}

export async function submitOperatorLead(formData) {
  ensureSupabaseConfigured();
  return submitLead("operator", formData);
}

export async function submitHylioLead(formData) {
  ensureSupabaseConfigured();
  return submitLead("hylio", formData);
}

export async function submitSourceOrder(data) {
  ensureSupabaseConfigured();

  const acres = Number(data.acres);
  const { error } = await supabase.from("source_orders").insert({
    first_name: data.firstName,
    email: data.email,
    state: data.state,
    county: data.county || null,
    crop_type: data.cropType,
    acres,
    estimated_total: acres * 25,
    product: "SOURCE",
    order_type: acres >= 1000 ? "volume_quote" : "standard",
  });

  if (error) {
    throw error;
  }
}

export async function markSourceOrderPaid(orderId) {
  ensureSupabaseConfigured();

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mark-paid`, {
    method: "POST",
    headers: createFunctionHeaders(),
    body: JSON.stringify({ order_id: orderId }),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.error || "Unable to mark this SOURCE order as paid.");
  }

  return result;
}
