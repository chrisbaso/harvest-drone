import {
  createHylioLeadPayload,
  createGrowerLeadPayload,
  createOperatorLeadPayload,
} from "../src/lib/leadTransforms.js";
import { sendLeadEmails, sendLeadSmsFollowUp } from "./lead-email.js";
import {
  getFirstStep,
  getNextStep,
  resolveCampaignType,
  getScheduledTime,
} from "./_lib/dripCampaigns.js";
import { createLeadActivity, logLeadActivities } from "./_lib/leadActivity.js";
import { syncLeadToCrm } from "./_lib/crmSync.js";
import {
  classifyOperatorLead,
  decideGrowerRouting,
  findMatchingOperators,
} from "./_lib/routing.js";
import { getSupabaseServerClient } from "./_lib/serverSupabase.js";

function badRequest(res, message) {
  return res.status(400).json({ error: message });
}

function getLeadConfig(type, formData) {
  if (type === "grower") {
    return {
      table: "grower_leads",
      payload: createGrowerLeadPayload(formData),
    };
  }

  if (type === "operator") {
    return {
      table: "operator_leads",
      payload: createOperatorLeadPayload(formData),
    };
  }

  if (type === "hylio") {
    return {
      table: "operator_leads",
      payload: createHylioLeadPayload(formData),
    };
  }

  return null;
}

function buildOpportunityPayload(growerLead, routingDecision) {
  return {
    grower_lead_id: growerLead.id,
    assigned_operator_id: routingDecision.assignedOperatorId,
    assigned_to: routingDecision.assignedTo,
    title: `${growerLead.farm_name || "New"} Spraying Opportunity`,
    state: growerLead.state,
    county: growerLead.county,
    crop_type: growerLead.crop_type,
    acres: growerLead.acres,
    route_type: routingDecision.routeType,
    source: growerLead.source || growerLead.lead_source,
    lead_source: growerLead.source || growerLead.lead_source,
    status: routingDecision.routeType === "route_to_operator" ? "assigned" : "unassigned",
    notes: growerLead.notes,
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type, formData } = req.body ?? {};
  const activityLeadType = type === "hylio" ? "operator" : type;
  const campaignType = resolveCampaignType(type, formData);

  if (!type || !formData) {
    return badRequest(res, "Missing type or formData.");
  }

  const leadConfig = getLeadConfig(type, formData);

  if (!leadConfig) {
    return badRequest(res, "Invalid lead type.");
  }

  try {
    const supabase = getSupabaseServerClient();
    const { table, payload } = leadConfig;
    let preparedPayload = payload;
    let routingDecision = null;
    let opportunityRecord = null;

    if (type === "grower") {
      const { data: operators, error: operatorsError } = await supabase
        .from("operator_leads")
        .select("*")
        .in("status", ["approved", "active"]);

      if (operatorsError) {
        throw new Error(operatorsError.message);
      }

      const matches = findMatchingOperators(operators ?? [], {
        state: formData.state,
        county: formData.county,
        acres: formData.acres,
        interestType: formData.interestType,
        notes: formData.notes,
      });

      routingDecision = decideGrowerRouting(
        {
          state: formData.state,
          county: formData.county,
          acres: formData.acres,
          interestType: formData.interestType,
          notes: formData.notes,
        },
        matches,
      );

      preparedPayload = {
        ...payload,
        status: routingDecision.status,
        route_type: routingDecision.routeType,
        lead_score: routingDecision.leadScore,
        assigned_to: routingDecision.assignedTo,
        assigned_operator_id: routingDecision.assignedOperatorId,
      };
    }

    if (type === "operator" || type === "hylio") {
      const operatorClassification = classifyOperatorLead({
        acreageCapacity: formData.weeklyCapacity ?? formData.acreageAccess,
        countiesServed: formData.countiesServed,
        complianceStatus: preparedPayload.compliance_status ?? formData.complianceStatus,
        interestType: formData.interestType ?? "Hylio Lead",
      });

      preparedPayload = {
        ...payload,
        status: type === "hylio" ? "new" : operatorClassification.status,
        operator_score: operatorClassification.operatorScore,
      };
    }

    const { data, error } = await supabase
      .from(table)
      .insert(preparedPayload)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (type === "grower" && routingDecision?.shouldCreateOpportunity) {
      const { data: opportunityData, error: opportunityError } = await supabase
        .from("jobs")
        .insert(buildOpportunityPayload(data, routingDecision))
        .select("*")
        .single();

      if (opportunityError) {
        throw new Error(opportunityError.message);
      }

      opportunityRecord = opportunityData;
    }

    let crmSyncWarning = null;

    try {
      await syncLeadToCrm({
        supabase,
        type,
        payload: formData,
        lead: data,
        routingDecision,
        opportunityRecord,
      });
    } catch (crmError) {
      crmSyncWarning = crmError.message || "CRM sync failed.";
    }

    try {
      // Future workflow hook:
      // after a successful save, fan out to CRM sync, SMS, or job-routing workflows here.
      const emailResult = await sendLeadEmails({
        type: campaignType,
        payload: formData,
      });
      let smsResult = null;

      try {
        smsResult = await sendLeadSmsFollowUp({
          type: campaignType,
          payload: formData,
        });
      } catch (smsError) {
        smsResult = {
          success: false,
          status: "failed",
          error: smsError.message || "SMS follow-up failed.",
        };
      }

      const firstStep = getFirstStep(campaignType);
      const nextStep = getNextStep(campaignType, firstStep?.key, preparedPayload);
      const sequenceUpdate = {
        sequence_state: firstStep?.key ?? "completed",
        last_contacted_at: new Date().toISOString(),
        next_follow_up_at: getScheduledTime(data.created_at, nextStep),
      };

      const { data: updatedLead, error: updateError } = await supabase
        .from(table)
        .update(sequenceUpdate)
        .eq("id", data.id)
        .select("id, created_at, status, sequence_state, last_contacted_at, next_follow_up_at")
        .single();

      if (updateError) {
        throw new Error(updateError.message);
      }

      await logLeadActivities(supabase, [
        createLeadActivity({
          leadType: activityLeadType,
          leadId: data.id,
          activityType: "lead_created",
          metadata: {
            source: preparedPayload.source || preparedPayload.lead_source,
            status: preparedPayload.status,
            route_type: preparedPayload.route_type ?? null,
            lead_score: preparedPayload.lead_score ?? null,
            operator_score: preparedPayload.operator_score ?? null,
          },
        }),
        ...(type === "grower" && routingDecision
          ? [
              createLeadActivity({
                leadType: activityLeadType,
                leadId: data.id,
                activityType: "route_decided",
                metadata: {
                  route_type: routingDecision.routeType,
                  lead_score: routingDecision.leadScore,
                  assigned_to: routingDecision.assignedTo,
                  assigned_operator_id: routingDecision.assignedOperatorId,
                  reason: routingDecision.reason,
                },
              }),
            ]
          : []),
        ...(opportunityRecord
          ? [
              createLeadActivity({
                leadType: activityLeadType,
                leadId: data.id,
                activityType: "opportunity_created",
                metadata: {
                  opportunity_id: opportunityRecord.id,
                  route_type: opportunityRecord.route_type,
                  opportunity_status: opportunityRecord.status,
                },
              }),
            ]
          : []),
        createLeadActivity({
          leadType: activityLeadType,
          leadId: data.id,
          activityType: "email_sent",
          channel: "email",
          templateKey: emailResult.confirmationTemplateKey,
          subject: emailResult.confirmationSubject,
          metadata: {
            resend_message_id: emailResult.confirmationId,
            recipient: formData.email,
          },
        }),
        createLeadActivity({
          leadType: activityLeadType,
          leadId: data.id,
          activityType: "email_sent",
          channel: "email",
          templateKey: emailResult.internalAlertTemplateKey,
          subject: emailResult.internalAlertSubject,
          metadata: {
            resend_message_id: emailResult.internalAlertId,
            recipient: process.env.ADMIN_EMAIL,
          },
        }),
        createLeadActivity({
          leadType: activityLeadType,
          leadId: data.id,
          activityType: "follow_up_scheduled",
          metadata: {
            sequence_state: sequenceUpdate.sequence_state,
            next_follow_up_at: sequenceUpdate.next_follow_up_at,
          },
        }),
        ...(smsResult
          ? [
              createLeadActivity({
                leadType: activityLeadType,
                leadId: data.id,
                activityType:
                  smsResult.success ? "sms_sent" : smsResult.status === "skipped" ? "sms_skipped" : "sms_failed",
                status:
                  smsResult.success ? "completed" : smsResult.status === "skipped" ? "skipped" : "failed",
                channel: "sms",
                subject: smsResult.messagePreview || smsResult.error || "SMS follow-up",
                metadata: {
                  recipient: formData.mobile,
                  provider: "twilio",
                  message_id: smsResult.messageId ?? null,
                  error: smsResult.error ?? null,
                },
              }),
            ]
          : []),
      ]);

      return res.status(200).json({
        success: true,
        lead: updatedLead,
        routing: routingDecision,
        opportunity: opportunityRecord,
        crmSyncWarning,
        email: emailResult,
        sms: smsResult,
      });
    } catch (emailError) {
      await logLeadActivities(supabase, [
        createLeadActivity({
          leadType: activityLeadType,
          leadId: data.id,
          activityType: "email_failed",
          status: "failed",
          channel: "email",
          metadata: {
            error:
              emailError.message ||
              "Lead was saved, but the initial email flow failed.",
          },
        }),
      ]).catch(() => null);

      return res.status(500).json({
        error:
          emailError.message ||
          "Lead was saved, but the internal alert email failed.",
        saved: true,
        lead: data,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Lead submission failed.",
    });
  }
}
