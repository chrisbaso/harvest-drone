import { createLeadActivity, logLeadActivities } from "./_lib/leadActivity.js";
import { getSupabaseServerClient } from "./_lib/serverSupabase.js";

const ALLOWED_STATUSES = new Set([
  "new",
  "contacted",
  "qualified",
  "call_scheduled",
  "closed_won",
  "closed_lost",
]);

function badRequest(res, message) {
  return res.status(400).json({ error: message });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { leadId, status, callNotes, nextActionDate } = req.body ?? {};

  if (!leadId) {
    return badRequest(res, "Missing leadId.");
  }

  if (status && !ALLOWED_STATUSES.has(status)) {
    return badRequest(res, "Invalid status.");
  }

  const supabase = getSupabaseServerClient();

  try {
    const { data: currentLead, error: currentLeadError } = await supabase
      .from("operator_leads")
      .select("*")
      .eq("id", leadId)
      .eq("source", "website-hylio-funnel")
      .maybeSingle();

    if (currentLeadError) {
      throw new Error(currentLeadError.message);
    }

    if (!currentLead) {
      return res.status(404).json({ error: "Hylio lead not found." });
    }

    const updates = {
      status: status || currentLead.status,
      call_notes: callNotes ?? currentLead.call_notes ?? null,
      next_action_date: nextActionDate || null,
    };

    const { data: updatedLead, error: updateError } = await supabase
      .from("operator_leads")
      .update(updates)
      .eq("id", leadId)
      .select("*")
      .single();

    if (updateError) {
      throw new Error(updateError.message);
    }

    await logLeadActivities(supabase, [
      createLeadActivity({
        leadType: "operator",
        leadId,
        activityType: "call_logged",
        status: "completed",
        channel: "crm",
        subject: "High-ticket call update",
        metadata: {
          previous_status: currentLead.status,
          next_status: updates.status,
          next_action_date: updates.next_action_date,
          has_notes: Boolean(updates.call_notes),
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      lead: updatedLead,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Unable to update Hylio lead.",
    });
  }
}
