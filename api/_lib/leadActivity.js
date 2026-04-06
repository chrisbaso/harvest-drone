export async function logLeadActivities(supabase, entries) {
  if (!entries.length) {
    return;
  }

  const { error } = await supabase.from("lead_activities").insert(entries);

  if (error) {
    throw new Error(error.message);
  }
}

export function createLeadActivity({
  leadType,
  leadId,
  activityType,
  status = "completed",
  channel = null,
  templateKey = null,
  subject = null,
  metadata = {},
}) {
  return {
    lead_type: leadType,
    lead_id: leadId,
    activity_type: activityType,
    status,
    channel,
    template_key: templateKey,
    subject,
    metadata,
  };
}
