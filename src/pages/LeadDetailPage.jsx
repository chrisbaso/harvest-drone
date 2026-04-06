import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Shell from "../components/Shell";
import SectionHeading from "../components/SectionHeading";
import {
  getCampaign,
  getCampaignTimeline,
  resolveCampaignType,
  getStopStatuses,
  getUpcomingTimelineStep,
} from "../lib/dripCampaigns";
import {
  calculateHylioRevenuePotential,
  HYLIO_STATUSES,
  isHylioLead,
} from "../lib/hylioPipeline";
import { formatLeadAccount, formatLeadName } from "../lib/leadTransforms";
import { supabase } from "../lib/supabase";

function formatDateSafe(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatLeadTypeLabel(type) {
  return type === "grower" ? "Grower" : "Operator";
}

function formatStatusLabel(value) {
  const labels = {
    new: "New",
    contacted: "Contacted",
    qualified: "Qualified",
    call_scheduled: "Call Scheduled",
    closed_won: "Closed Won",
    closed_lost: "Closed Lost",
    approved: "Approved",
    active: "Active",
    inactive: "Inactive",
    completed: "Completed",
    failed: "Failed",
    skipped: "Skipped",
  };

  return labels[value] || value || "-";
}

function getLeadWorkspaceLabel(lead) {
  if (!lead) {
    return "Lead";
  }

  return isHylioLead(lead) ? "Hylio lead" : formatLeadTypeLabel(lead.lead_type);
}

function formatCapacityLabel(lead) {
  if (lead?.lead_type === "grower") {
    return "Estimated acres";
  }

  return isHylioLead(lead) ? "Acreage access" : "Capacity per week";
}

function formatCapacityValue(lead) {
  const value =
    lead?.lead_type === "grower"
      ? Number(lead?.acres ?? 0)
      : Number(lead?.acreage_access ?? lead?.acres_capacity_per_week ?? 0);

  return value.toLocaleString();
}

function formatActivityLabel(value) {
  const labels = {
    lead_created: "Lead created",
    route_decided: "Route decided",
    opportunity_created: "Opportunity created",
    email_sent: "Email sent",
    sms_sent: "SMS sent",
    sms_skipped: "SMS skipped",
    sms_failed: "SMS failed",
    call_logged: "Call logged",
    follow_up_reminder_sent: "Follow-up reminder sent",
    email_failed: "Email failed",
    follow_up_scheduled: "Follow-up scheduled",
    automation_stopped: "Automation stopped",
    automation_error: "Automation error",
    sequence_completed: "Sequence completed",
  };

  return labels[value] || value.replaceAll("_", " ");
}

function formatRouteTypeLabel(value) {
  const labels = {
    direct_hd: "Direct HD",
    route_to_operator: "Route to operator",
    nurture: "Nurture",
  };

  return labels[value] || value || "-";
}

function formatSourceLabel(value) {
  const labels = {
    "website-grower-funnel": "Grower funnel",
    "website-operator-funnel": "Operator funnel",
    "website-hylio-funnel": "Hylio high-ticket funnel",
  };

  return labels[value] || value || "-";
}

function formatComplianceLabel(value) {
  return value || "-";
}

function formatCountiesLabel(value) {
  return value || "-";
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function hasSavedCalculatorInputs(lead) {
  return [
    lead?.calculator_acres_per_month,
    lead?.calculator_revenue_per_acre,
    lead?.calculator_months_active_per_year,
    lead?.calculator_equipment_cost,
  ].some((value) => value !== null && value !== undefined && value !== "");
}

function formatTemplateLabel(value) {
  if (!value) {
    return "System event";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function LeadDetailPage() {
  const { leadType, leadId } = useParams();
  const [lead, setLead] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [activities, setActivities] = useState([]);
  const [operatorLookup, setOperatorLookup] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [callNotes, setCallNotes] = useState("");
  const [nextActionDate, setNextActionDate] = useState("");
  const [pipelineStatus, setPipelineStatus] = useState("new");
  const [isSavingCall, setIsSavingCall] = useState(false);
  const [callActionMessage, setCallActionMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchLeadData() {
      setIsLoading(true);
      setErrorMessage("");

      if (!["grower", "operator"].includes(leadType)) {
        setErrorMessage("Unknown lead type.");
        setIsLoading(false);
        return;
      }

      const tableName = leadType === "grower" ? "grower_leads" : "operator_leads";

      const [leadResponse, jobsResponse, activitiesResponse, operatorsResponse] = await Promise.all([
        supabase.from(tableName).select("*").eq("id", leadId).maybeSingle(),
        leadType === "grower"
          ? supabase.from("jobs").select("*").eq("grower_lead_id", leadId).order("created_at", { ascending: false })
          : supabase.from("jobs").select("*").eq("assigned_operator_id", leadId).order("created_at", { ascending: false }),
        supabase
          .from("lead_activities")
          .select("*")
          .eq("lead_type", leadType)
          .eq("lead_id", leadId)
          .order("created_at", { ascending: false }),
        supabase.from("operator_leads").select("id, first_name, last_name"),
      ]);

      if (!isMounted) {
        return;
      }

      if (leadResponse.error || jobsResponse.error || activitiesResponse.error || operatorsResponse.error) {
        setErrorMessage(
          leadResponse.error?.message ||
            jobsResponse.error?.message ||
            activitiesResponse.error?.message ||
            operatorsResponse.error?.message ||
            "Unable to load lead detail.",
        );
        setIsLoading(false);
        return;
      }

      if (!leadResponse.data) {
        setErrorMessage("Lead not found.");
        setIsLoading(false);
        return;
      }

      const normalizedLead = {
        ...leadResponse.data,
        lead_type: leadType,
      };

      const lookup = (operatorsResponse.data ?? []).reduce((accumulator, operator) => {
        accumulator[operator.id] = formatLeadName(operator);
        return accumulator;
      }, {});

      setLead(normalizedLead);
      setCallNotes(normalizedLead.call_notes || "");
      setNextActionDate(normalizedLead.next_action_date ? normalizedLead.next_action_date.slice(0, 16) : "");
      setPipelineStatus(normalizedLead.status || "new");
      setJobs(jobsResponse.data ?? []);
      setActivities(activitiesResponse.data ?? []);
      setOperatorLookup(lookup);
      setIsLoading(false);
    }

    fetchLeadData();

    return () => {
      isMounted = false;
    };
  }, [leadId, leadType]);

  const account = lead ? formatLeadAccount(lead) || "-" : "-";
  const campaign = useMemo(
    () => (lead ? getCampaign(resolveCampaignType(lead.lead_type, lead)) : null),
    [lead],
  );
  const timeline = useMemo(() => (lead ? getCampaignTimeline(lead) : []), [lead]);
  const upcomingStep = useMemo(() => getUpcomingTimelineStep(timeline), [timeline]);
  const stopStatuses = useMemo(
    () => (lead ? getStopStatuses(resolveCampaignType(lead.lead_type, lead), lead) : []),
    [lead],
  );

  const enrichedActivities = useMemo(() => {
    return activities.map((activity) => ({
      ...activity,
      activityLabel: formatActivityLabel(activity.activity_type),
      templateLabel: formatTemplateLabel(activity.template_key || activity.channel),
    }));
  }, [activities]);
  const hylioRevenueMetrics = useMemo(() => {
    if (!lead || !isHylioLead(lead) || !hasSavedCalculatorInputs(lead)) {
      return null;
    }

    return calculateHylioRevenuePotential({
      acresPerMonth: lead.calculator_acres_per_month,
      revenuePerAcre: lead.calculator_revenue_per_acre,
      monthsActivePerYear: lead.calculator_months_active_per_year,
      equipmentCost: lead.calculator_equipment_cost,
      growthFactor: lead.calculator_growth_factor,
    });
  }, [lead]);

  async function handleCallUpdate(event) {
    event.preventDefault();

    if (!lead || !isHylioLead(lead)) {
      return;
    }

    setIsSavingCall(true);
    setCallActionMessage("");

    try {
      const response = await fetch("/api/update-hylio-lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadId: lead.id,
          status: pipelineStatus,
          callNotes,
          nextActionDate: nextActionDate ? new Date(nextActionDate).toISOString() : null,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.error || "Unable to update high-ticket lead.");
      }

      setLead((current) => ({
        ...current,
        ...result.lead,
        lead_type: current.lead_type,
      }));
      setCallActionMessage("High-ticket lead updated.");
      setActivities((current) => [
        {
          id: `call-${Date.now()}`,
          activity_type: "call_logged",
          status: "completed",
          subject: "High-ticket call update",
          created_at: new Date().toISOString(),
          template_key: "crm_update",
          channel: "crm",
        },
        ...current,
      ]);
    } catch (error) {
      setCallActionMessage(error.message || "Unable to update high-ticket lead.");
    } finally {
      setIsSavingCall(false);
    }
  }

  return (
    <Shell compact>
      <section className="section">
        <div className="detail-header">
          <div>
            <Link className="back-link" to="/dashboard">
              Back to dashboard
            </Link>
            <SectionHeading
              eyebrow="Lead workspace"
              title={lead ? `${formatLeadName(lead)} CRM activity` : "Lead workspace"}
              description={
                lead
                  ? `Review the exact outreach history, current sequence state, and what Harvest Drone will send next for this ${getLeadWorkspaceLabel(lead).toLowerCase()}.`
                  : "Loading lead details and automation history."
              }
            />
          </div>
          {lead ? <span className="status-pill">{formatStatusLabel(lead.status)}</span> : null}
        </div>
      </section>

      {isLoading ? (
        <section className="section">
          <div className="table-card">
            <div className="empty-state">Loading lead activity...</div>
          </div>
        </section>
      ) : errorMessage ? (
        <section className="section">
          <div className="table-card">
            <div className="empty-state">{errorMessage}</div>
          </div>
        </section>
      ) : (
        <div className="detail-stack section">
          <section className="detail-hero-grid">
            <article className="card detail-card">
              <div className="crm-panel__header">
                <div>
                  <span className="eyebrow">Lead summary</span>
                  <h3>{formatLeadName(lead)}</h3>
                  <p className="table-subtle crm-panel__copy">
                    {getLeadWorkspaceLabel(lead)} from {account}. Created {formatDateSafe(lead.created_at)} and currently tracked under the {campaign?.label || "active"} sequence.
                  </p>
                </div>
              </div>

              <div className="crm-panel__summary">
                <div className="crm-kpi">
                  <span>Current sequence</span>
                  <strong>{lead.sequence_state || "pending"}</strong>
                </div>
                <div className="crm-kpi">
                  <span>Last contacted</span>
                  <strong>{formatDateSafe(lead.last_contacted_at)}</strong>
                </div>
                <div className="crm-kpi">
                  <span>Next send</span>
                  <strong>{formatDateSafe(lead.next_follow_up_at)}</strong>
                </div>
              </div>
            </article>

            <article className="card detail-card">
              <div className="crm-subcard__header">
                <h4>Next planned email</h4>
                <span className="table-subtle">{campaign?.label || "No campaign"}</span>
              </div>
              <div className="crm-automation-highlight">
                <div>
                  <span className="table-subtle">Up next</span>
                  <strong>{upcomingStep?.subject || "No queued follow-up remaining"}</strong>
                </div>
                <div className="crm-automation-highlight__time">
                  {upcomingStep ? formatDateSafe(upcomingStep.scheduledAt) : "Sequence complete"}
                </div>
              </div>
              <div className="crm-stop-rules">
                <span className="table-subtle">Stop rules</span>
                <p>{stopStatuses.join(", ")}</p>
              </div>
            </article>
          </section>

          <section className="detail-grid">
            <article className="crm-subcard">
              <div className="crm-subcard__header">
                <h4>Lead details</h4>
                <span className="table-subtle">{lead.email}</span>
              </div>
              <dl className="crm-meta-list">
                <div className="crm-meta-list__row">
                  <dt>Lead type</dt>
                  <dd>{getLeadWorkspaceLabel(lead)}</dd>
                </div>
                <div className="crm-meta-list__row">
                  <dt>{lead.lead_type === "grower" ? "Farm" : "Company"}</dt>
                  <dd>{account}</dd>
                </div>
                <div className="crm-meta-list__row">
                  <dt>Mobile</dt>
                  <dd>{lead.mobile || "-"}</dd>
                </div>
                <div className="crm-meta-list__row">
                  <dt>State</dt>
                  <dd>{lead.state || "-"}</dd>
                </div>
                <div className="crm-meta-list__row">
                  <dt>{lead.lead_type === "grower" ? "County" : "Counties served"}</dt>
                  <dd>{lead.lead_type === "grower" ? lead.county || "-" : formatCountiesLabel(lead.counties_served)}</dd>
                </div>
                <div className="crm-meta-list__row">
                  <dt>{formatCapacityLabel(lead)}</dt>
                  <dd>{formatCapacityValue(lead)}</dd>
                </div>
                <div className="crm-meta-list__row">
                  <dt>{lead.lead_type === "grower" ? "Interest type" : "Interest"}</dt>
                  <dd>{lead.interest_type || "-"}</dd>
                </div>
                {lead.lead_type === "grower" ? (
                  <>
                    <div className="crm-meta-list__row">
                      <dt>Route type</dt>
                      <dd>{formatRouteTypeLabel(lead.route_type)}</dd>
                    </div>
                    <div className="crm-meta-list__row">
                      <dt>Lead score</dt>
                      <dd>{lead.lead_score ?? 0}</dd>
                    </div>
                    <div className="crm-meta-list__row">
                      <dt>Assigned owner</dt>
                      <dd>{lead.assigned_to || "Harvest Drone review queue"}</dd>
                    </div>
                    <div className="crm-meta-list__row">
                      <dt>Assigned operator</dt>
                      <dd>{operatorLookup[lead.assigned_operator_id] || "Unassigned"}</dd>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="crm-meta-list__row">
                      <dt>Operator score</dt>
                      <dd>{lead.operator_score ?? 0}</dd>
                    </div>
                    <div className="crm-meta-list__row">
                      <dt>Compliance</dt>
                      <dd>{formatComplianceLabel(lead.compliance_status)}</dd>
                    </div>
                    <div className="crm-meta-list__row">
                      <dt>Equipment</dt>
                      <dd>{lead.equipment_details || "-"}</dd>
                    </div>
                    {lead.experience_level ? (
                      <div className="crm-meta-list__row">
                        <dt>Experience level</dt>
                        <dd>{lead.experience_level}</dd>
                      </div>
                    ) : null}
                    {lead.budget_range ? (
                      <div className="crm-meta-list__row">
                        <dt>Budget range</dt>
                        <dd>{lead.budget_range}</dd>
                      </div>
                    ) : null}
                    {lead.lead_tag ? (
                      <div className="crm-meta-list__row">
                        <dt>Lead tag</dt>
                        <dd>{lead.lead_tag}</dd>
                      </div>
                    ) : null}
                    {lead.calculator_acres_per_month ? (
                      <div className="crm-meta-list__row">
                        <dt>Calculator acres / month</dt>
                        <dd>{Number(lead.calculator_acres_per_month).toLocaleString()}</dd>
                      </div>
                    ) : null}
                    {lead.calculator_revenue_per_acre ? (
                      <div className="crm-meta-list__row">
                        <dt>Calculator revenue / acre</dt>
                        <dd>{formatCurrency(lead.calculator_revenue_per_acre)}</dd>
                      </div>
                    ) : null}
                    {lead.next_action_date ? (
                      <div className="crm-meta-list__row">
                        <dt>Next action date</dt>
                        <dd>{formatDateSafe(lead.next_action_date)}</dd>
                      </div>
                    ) : null}
                  </>
                )}
                <div className="crm-meta-list__row">
                  <dt>Source</dt>
                  <dd>{formatSourceLabel(lead.source || lead.lead_source)}</dd>
                </div>
              </dl>
              {lead.notes ? (
                <div className="crm-notes">
                  <span className="table-subtle">Notes</span>
                  <p>{lead.notes}</p>
                </div>
              ) : null}
              {lead.call_notes ? (
                <div className="crm-notes">
                  <span className="table-subtle">Call notes</span>
                  <p>{lead.call_notes}</p>
                </div>
              ) : null}
            </article>

            <article className="crm-subcard">
              <div className="crm-subcard__header">
                <h4>Automation schedule</h4>
                <span className="table-subtle">{timeline.length} sequence steps</span>
              </div>
              <div className="crm-timeline">
                {timeline.map((step) => (
                  <article className={`crm-timeline__item crm-timeline__item--${step.stage}`} key={step.key}>
                    <div className="crm-timeline__topline">
                      <span className="crm-timeline__state">{step.stageLabel}</span>
                      <span className="table-subtle">{formatDateSafe(step.scheduledAt)}</span>
                    </div>
                    <strong>{step.subject}</strong>
                    <p>{step.purpose}</p>
                  </article>
                ))}
              </div>
            </article>

            <article className="crm-subcard">
              <div className="crm-subcard__header">
                <h4>Email and automation history</h4>
                <span className="table-subtle">{enrichedActivities.length} logged events</span>
              </div>
              {enrichedActivities.length ? (
                <div className="crm-activity-list">
                  {enrichedActivities.map((activity) => (
                    <article className="crm-activity-list__item" key={activity.id}>
                      <div className="crm-activity-list__copy">
                        <strong>{activity.activityLabel}</strong>
                        <span className="table-subtle">{activity.subject || activity.templateLabel}</span>
                      </div>
                      <div className="crm-activity-list__meta">
                        <span className="status-pill">{formatStatusLabel(activity.status)}</span>
                        <span className="table-subtle">{formatDateSafe(activity.created_at)}</span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-state">No activity logged for this lead yet.</div>
              )}
            </article>

            {isHylioLead(lead) ? (
              <article className="crm-subcard">
                <div className="crm-subcard__header">
                  <h4>High-ticket call tracking</h4>
                  <span className="table-subtle">Log call outcome and next step</span>
                </div>
                <form className="auth-form" onSubmit={handleCallUpdate}>
                  <label className="field">
                    <span>Pipeline stage</span>
                    <select value={pipelineStatus} onChange={(event) => setPipelineStatus(event.target.value)}>
                      {HYLIO_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {formatStatusLabel(status)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    <span>Next action date</span>
                    <input
                      type="datetime-local"
                      value={nextActionDate}
                      onChange={(event) => setNextActionDate(event.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span>Call notes</span>
                    <textarea
                      rows="5"
                      value={callNotes}
                      onChange={(event) => setCallNotes(event.target.value)}
                      placeholder="Log the call outcome, objections, timeline, and next move."
                    />
                  </label>
                  {callActionMessage ? <p className="table-subtle">{callActionMessage}</p> : null}
                  <button className="button button--primary button--full" type="submit" disabled={isSavingCall}>
                    {isSavingCall ? "Saving call update..." : "Log call outcome"}
                  </button>
                </form>
              </article>
            ) : null}

            {isHylioLead(lead) && hylioRevenueMetrics ? (
              <article className="crm-subcard">
                <div className="crm-subcard__header">
                  <h4>Revenue calculator snapshot</h4>
                  <span className="table-subtle">Saved from the Hylio funnel</span>
                </div>
                <dl className="crm-meta-list">
                  <div className="crm-meta-list__row">
                    <dt>Monthly revenue</dt>
                    <dd>{formatCurrency(hylioRevenueMetrics.monthlyRevenue)}</dd>
                  </div>
                  <div className="crm-meta-list__row">
                    <dt>Annual revenue</dt>
                    <dd>{formatCurrency(hylioRevenueMetrics.annualRevenue)}</dd>
                  </div>
                  <div className="crm-meta-list__row">
                    <dt>Months to pay off</dt>
                    <dd>{hylioRevenueMetrics.paybackPeriodMonths.toFixed(1)} months</dd>
                  </div>
                  <div className="crm-meta-list__row">
                    <dt>Year 1 net</dt>
                    <dd>{formatCurrency(hylioRevenueMetrics.yearOneNet)}</dd>
                  </div>
                  <div className="crm-meta-list__row">
                    <dt>Year 2+ profit</dt>
                    <dd>{formatCurrency(hylioRevenueMetrics.yearTwoProfit)}</dd>
                  </div>
                </dl>
              </article>
            ) : null}

            <article className="crm-subcard">
              <div className="crm-subcard__header">
                <h4>Connected jobs</h4>
                <span className="table-subtle">{jobs.length} linked records</span>
              </div>
              {jobs.length ? (
                <div className="crm-linked-jobs">
                  {jobs.map((job) => (
                    <div className="crm-linked-jobs__item" key={job.id}>
                      <strong>{job.title}</strong>
                      <span className="table-subtle">
                        {job.status} | {job.state || "-"} | {Number(job.acres ?? 0).toLocaleString()} acres
                      </span>
                      {lead.lead_type === "grower" ? (
                        <span className="table-subtle">
                          Assigned operator: {operatorLookup[job.assigned_operator_id] || "Unassigned"}
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  {lead.lead_type === "grower"
                    ? "No jobs have been created from this grower lead yet."
                    : "This operator has not been linked to any jobs yet."}
                </div>
              )}
            </article>
          </section>
        </div>
      )}
    </Shell>
  );
}

export default LeadDetailPage;
