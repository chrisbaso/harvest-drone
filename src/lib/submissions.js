import { supabase, supabaseConfigError } from "./supabase";

function ensureSupabaseConfigured() {
  if (supabaseConfigError) {
    throw new Error(supabaseConfigError);
  }
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
        ? `${result?.error || "Lead saved, but alert email failed."} Please check Resend and try again if needed.`
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
    crop_type: data.cropType,
    acres,
    estimated_total: acres * 25,
    order_type: acres >= 1000 ? "volume_quote" : "standard",
  });

  if (error) {
    throw error;
  }
}
