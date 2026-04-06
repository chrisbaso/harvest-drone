import { sendFollowUpEmail, sendHighTicketReminder } from "../lead-email.js";
import {
  getNextStep,
  resolveCampaignType,
  getScheduledTime,
  getStopStatuses,
} from "../_lib/dripCampaigns.js";
import { createLeadActivity, logLeadActivities } from "../_lib/leadActivity.js";
import { getSupabaseServerClient } from "../_lib/serverSupabase.js";
import { mapLeadRowToEmailPayload } from "../../src/lib/leadTransforms.js";
import { isHylioLead } from "../../src/lib/hylioPipeline.js";

function unauthorized(res) {
  return res.status(401).json({ error: "Unauthorized" });
}

function isAuthorized(req) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return true;
  }

  const authHeader = req.headers.authorization || "";
  return authHeader === `Bearer ${cronSecret}`;
}

function getLeadTable(type) {
  return type === "grower" ? "grower_leads" : "operator_leads";
}

async function fetchDueLeads(supabase, type, nowIso) {
  const { data, error } = await supabase
    .from(getLeadTable(type))
    .select("*")
    .not("next_follow_up_at", "is", null)
    .lte("next_follow_up_at", nowIso)
    .order("next_follow_up_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

async function fetchDueHighTicketFollowUps(supabase, nowIso) {
  const { data, error } = await supabase
    .from("operator_leads")
    .select("*")
    .eq("source", "website-hylio-funnel")
    .not("next_action_date", "is", null)
    .lte("next_action_date", nowIso)
    .in("status", ["new", "contacted", "qualified", "call_scheduled"])
    .order("next_action_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

async function stopLeadAutomation(supabase, type, lead) {
  const table = getLeadTable(type);

  const { error } = await supabase
    .from(table)
    .update({
      sequence_state: "stopped",
      next_follow_up_at: null,
    })
    .eq("id", lead.id);

  if (error) {
    throw new Error(error.message);
  }

  await logLeadActivities(supabase, [
    createLeadActivity({
      leadType: type,
      leadId: lead.id,
      activityType: "automation_stopped",
      status: "completed",
      metadata: {
        stop_status: lead.status,
      },
    }),
  ]);
}

async function processLeadFollowUp(supabase, type, lead) {
  const campaignType = resolveCampaignType(type, lead);
  const nextStep = getNextStep(campaignType, lead.sequence_state, lead);

  if (!nextStep) {
    const { error } = await supabase
      .from(getLeadTable(type))
      .update({
        sequence_state: "completed",
        next_follow_up_at: null,
      })
      .eq("id", lead.id);

    if (error) {
      throw new Error(error.message);
    }

    await logLeadActivities(supabase, [
      createLeadActivity({
        leadType: type,
        leadId: lead.id,
        activityType: "sequence_completed",
        status: "completed",
        metadata: {
          previous_sequence_state: lead.sequence_state,
        },
      }),
    ]);

    return { sent: false, completed: true };
  }

  const payload = mapLeadRowToEmailPayload(type, lead);
  const emailResult = await sendFollowUpEmail({
    type: campaignType,
    sequenceState: nextStep.key,
    payload,
  });

  const upcomingStep = getNextStep(campaignType, nextStep.key, lead);
  const updates = {
    sequence_state: nextStep.key,
    last_contacted_at: new Date().toISOString(),
    next_follow_up_at: getScheduledTime(lead.created_at, upcomingStep),
  };

  const { error } = await supabase
    .from(getLeadTable(type))
    .update(updates)
    .eq("id", lead.id);

  if (error) {
    throw new Error(error.message);
  }

  await logLeadActivities(supabase, [
    createLeadActivity({
      leadType: type,
      leadId: lead.id,
      activityType: "email_sent",
      status: "completed",
      channel: "email",
      templateKey: emailResult.templateKey,
      subject: emailResult.subject,
      metadata: {
        resend_message_id: emailResult.messageId,
        recipient: payload.email,
      },
    }),
    createLeadActivity({
      leadType: type,
      leadId: lead.id,
      activityType: upcomingStep ? "follow_up_scheduled" : "sequence_completed",
      status: "completed",
      metadata: {
        sequence_state: updates.sequence_state,
        next_follow_up_at: updates.next_follow_up_at,
      },
    }),
  ]);

  return { sent: true, completed: !upcomingStep };
}

async function processHighTicketReminder(supabase, lead) {
  const payload = mapLeadRowToEmailPayload("operator", lead);
  const reminderResult = await sendHighTicketReminder({
    payload: {
      ...payload,
      nextActionDate: lead.next_action_date,
    },
  });

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const { error } = await supabase
    .from("operator_leads")
    .update({
      next_action_date: tomorrow,
    })
    .eq("id", lead.id);

  if (error) {
    throw new Error(error.message);
  }

  await logLeadActivities(supabase, [
    createLeadActivity({
      leadType: "operator",
      leadId: lead.id,
      activityType: "follow_up_reminder_sent",
      status: "completed",
      channel: "email",
      templateKey: reminderResult.templateKey,
      subject: reminderResult.subject,
      metadata: {
        resend_message_id: reminderResult.messageId,
        next_action_date: tomorrow,
      },
    }),
  ]);
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!isAuthorized(req)) {
    return unauthorized(res);
  }

  const supabase = getSupabaseServerClient();
  const nowIso = new Date().toISOString();
  const summary = {
    processed: 0,
    sent: 0,
    stopped: 0,
    completed: 0,
    reminders: 0,
    failures: [],
  };

  try {
    for (const type of ["grower", "operator"]) {
      const dueLeads = await fetchDueLeads(supabase, type, nowIso);

      for (const lead of dueLeads) {
        try {
          const stopStatuses = new Set(getStopStatuses(type, lead));
          if (stopStatuses.has(lead.status)) {
            await stopLeadAutomation(supabase, type, lead);
            summary.processed += 1;
            summary.stopped += 1;
            continue;
          }

          const result = await processLeadFollowUp(supabase, type, lead);
          summary.processed += 1;
          summary.sent += result.sent ? 1 : 0;
          summary.completed += result.completed ? 1 : 0;
        } catch (error) {
          summary.failures.push({
            leadType: type,
            leadId: lead.id,
            error: error.message || "Unknown follow-up failure.",
          });

          await logLeadActivities(supabase, [
            createLeadActivity({
              leadType: type,
              leadId: lead.id,
              activityType: "automation_error",
              status: "failed",
              metadata: {
                error: error.message || "Unknown follow-up failure.",
              },
            }),
          ]).catch(() => null);
        }
      }
    }

    const dueHighTicketLeads = await fetchDueHighTicketFollowUps(supabase, nowIso);

    for (const lead of dueHighTicketLeads) {
      try {
        if (!isHylioLead(lead)) {
          continue;
        }

        await processHighTicketReminder(supabase, lead);
        summary.processed += 1;
        summary.reminders += 1;
      } catch (error) {
        summary.failures.push({
          leadType: "operator",
          leadId: lead.id,
          error: error.message || "Unknown high-ticket reminder failure.",
        });

        await logLeadActivities(supabase, [
          createLeadActivity({
            leadType: "operator",
            leadId: lead.id,
            activityType: "automation_error",
            status: "failed",
            metadata: {
              error: error.message || "Unknown high-ticket reminder failure.",
            },
          }),
        ]).catch(() => null);
      }
    }

    return res.status(200).json({
      success: true,
      ...summary,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Unable to process drip campaigns.",
      ...summary,
    });
  }
}
