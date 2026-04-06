import { useEffect, useMemo, useState } from "react";
import DashboardFilters from "../components/DashboardFilters";
import LeadTable from "../components/LeadTable";
import SectionHeading from "../components/SectionHeading";
import Shell from "../components/Shell";
import StatCard from "../components/StatCard";
import {
  getCampaign,
  getCampaignTimeline,
  getStopStatuses,
  getUpcomingTimelineStep,
} from "../lib/dripCampaigns";
import {
  formatLeadAccount,
  formatLeadName,
  normalizeGrowerLead,
  normalizeOperatorLead,
} from "../lib/leadTransforms";
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

function formatAccountValue(lead) {
  return formatLeadAccount(lead) || "-";
}

function formatCapacityValue(lead) {
  const value =
    lead.lead_type === "grower"
      ? Number(lead.acres ?? 0)
      : Number(lead.acres_capacity_per_week ?? 0);

  return value.toLocaleString();
}

function buildJobTitle(lead) {
  return `${formatAccountValue(lead)} Spraying Opportunity`;
}

function formatActivityLabel(value) {
  const labels = {
    lead_created: "Lead created",
    email_sent: "Email sent",
    email_failed: "Email failed",
    follow_up_scheduled: "Follow-up scheduled",
    automation_stopped: "Automation stopped",
    automation_error: "Automation error",
    sequence_completed: "Sequence completed",
  };

  return labels[value] || value.replaceAll("_", " ");
}

function formatTemplateLabel(value) {
  if (!value) {
    return "System event";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatLeadTypeLabel(type) {
  return type === "grower" ? "Grower" : "Operator";
}

function getLeadMetaRows(lead) {
  if (!lead) {
    return [];
  }

  return [
    { label: "Lead type", value: formatLeadTypeLabel(lead.lead_type) },
    { label: lead.lead_type === "grower" ? "Farm" : "Company", value: formatAccountValue(lead) },
    { label: "State", value: lead.state || "-" },
    { label: lead.lead_type === "grower" ? "Estimated acres" : "Capacity per week", value: formatCapacityValue(lead) },
    { label: "Lead source", value: lead.lead_source || "-" },
    { label: "Created", value: formatDateSafe(lead.created_at) },
    { label: "Last contacted", value: formatDateSafe(lead.last_contacted_at) },
    { label: "Next follow-up", value: formatDateSafe(lead.next_follow_up_at) },
  ];
}

function DashboardPageV2() {
  const [leads, setLeads] = useState([]);
  const [operatorLeads, setOperatorLeads] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [jobsCount, setJobsCount] = useState(0);
  const [leadTypeFilter, setLeadTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [jobActionMessage, setJobActionMessage] = useState("");
  const [pendingGrowerJobId, setPendingGrowerJobId] = useState("");
  const [assignmentSelections, setAssignmentSelections] = useState({});
  const [pendingAssignmentJobId, setPendingAssignmentJobId] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchDashboardData() {
      setIsLoading(true);
      setErrorMessage("");

      const [growersResponse, operatorsResponse, jobsResponse, activitiesResponse] = await Promise.all([
        supabase.from("grower_leads").select("*").order("created_at", { ascending: false }),
        supabase.from("operator_leads").select("*").order("created_at", { ascending: false }),
        supabase.from("jobs").select("*").order("created_at", { ascending: false }),
        supabase.from("lead_activities").select("*").order("created_at", { ascending: false }).limit(150),
      ]);

      if (!isMounted) {
        return;
      }

      if (growersResponse.error || operatorsResponse.error || jobsResponse.error || activitiesResponse.error) {
        setErrorMessage(
          growersResponse.error?.message ||
            operatorsResponse.error?.message ||
            jobsResponse.error?.message ||
            activitiesResponse.error?.message ||
            "Unable to load dashboard data.",
        );
        setLeads([]);
        setOperatorLeads([]);
        setJobs([]);
        setActivities([]);
        setJobsCount(0);
        setIsLoading(false);
        return;
      }

      const combinedLeads = [
        ...(growersResponse.data ?? []).map(normalizeGrowerLead),
        ...(operatorsResponse.data ?? []).map(normalizeOperatorLead),
      ].sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime());

      setLeads(combinedLeads);
      setOperatorLeads(operatorsResponse.data ?? []);
      setJobs(jobsResponse.data ?? []);
      setActivities(activitiesResponse.data ?? []);
      setJobsCount((jobsResponse.data ?? []).length);
      setIsLoading(false);
    }

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const statusOptions = useMemo(() => {
    return [...new Set(leads.map((lead) => lead.status).filter(Boolean))];
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesLeadType = leadTypeFilter === "all" || lead.lead_type === leadTypeFilter;
      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;

      return matchesLeadType && matchesStatus;
    });
  }, [leadTypeFilter, leads, statusFilter]);

  useEffect(() => {
    if (!filteredLeads.length) {
      setSelectedLeadId("");
      return;
    }

    const hasSelectedLead = filteredLeads.some((lead) => lead.id === selectedLeadId);

    if (!hasSelectedLead) {
      setSelectedLeadId(filteredLeads[0].id);
    }
  }, [filteredLeads, selectedLeadId]);

  const jobsByGrowerLeadId = useMemo(() => {
    return new Set(jobs.map((job) => job.grower_lead_id).filter(Boolean));
  }, [jobs]);

  const operatorNameById = useMemo(() => {
    return operatorLeads.reduce((lookup, operator) => {
      lookup[operator.id] = formatLeadName({
        first_name: operator.first_name,
        last_name: operator.last_name,
      });
      return lookup;
    }, {});
  }, [operatorLeads]);

  const leadLookup = useMemo(() => {
    return leads.reduce((lookup, lead) => {
      lookup[`${lead.lead_type}:${lead.id}`] = lead;
      return lookup;
    }, {});
  }, [leads]);

  const recentActivities = useMemo(() => {
    return activities.map((activity) => {
      const lead = leadLookup[`${activity.lead_type}:${activity.lead_id}`];

      return {
        ...activity,
        leadName: lead ? formatLeadName(lead) : "Lead not found",
        account: lead ? formatLeadAccount(lead) || "-" : "-",
        activityLabel: formatActivityLabel(activity.activity_type),
        templateLabel: formatTemplateLabel(activity.template_key || activity.channel),
      };
    });
  }, [activities, leadLookup]);

  const activitySummary = useMemo(() => {
    return recentActivities.reduce(
      (summary, activity) => {
        if (activity.activity_type === "email_sent") {
          summary.emailSent += 1;
        }

        if (activity.activity_type === "follow_up_scheduled") {
          summary.scheduled += 1;
        }

        if (activity.status === "failed") {
          summary.failed += 1;
        }

        return summary;
      },
      { emailSent: 0, scheduled: 0, failed: 0 },
    );
  }, [recentActivities]);

  const stats = useMemo(() => {
    const totalGrowerLeads = filteredLeads.filter((lead) => lead.lead_type === "grower").length;
    const totalOperatorLeads = filteredLeads.filter((lead) => lead.lead_type === "operator").length;
    const totalEstimatedAcres = filteredLeads.reduce((sum, lead) => sum + Number(lead.acres ?? 0), 0);
    const statesRepresented = new Set(filteredLeads.map((lead) => lead.state).filter(Boolean)).size;

    return {
      totalGrowerLeads,
      totalOperatorLeads,
      totalEstimatedAcres,
      statesRepresented,
    };
  }, [filteredLeads]);

  const selectedLead = useMemo(() => {
    return filteredLeads.find((lead) => lead.id === selectedLeadId) ?? filteredLeads[0] ?? null;
  }, [filteredLeads, selectedLeadId]);

  const selectedLeadActivities = useMemo(() => {
    if (!selectedLead) {
      return [];
    }

    return recentActivities.filter(
      (activity) =>
        activity.lead_type === selectedLead.lead_type &&
        activity.lead_id === selectedLead.id,
    );
  }, [recentActivities, selectedLead]);

  const selectedLeadTimeline = useMemo(() => {
    return selectedLead ? getCampaignTimeline(selectedLead) : [];
  }, [selectedLead]);

  const selectedLeadUpcomingStep = useMemo(() => {
    return getUpcomingTimelineStep(selectedLeadTimeline);
  }, [selectedLeadTimeline]);

  const selectedLeadCampaign = useMemo(() => {
    return selectedLead ? getCampaign(selectedLead.lead_type) : null;
  }, [selectedLead]);

  const selectedLeadStopStatuses = useMemo(() => {
    return selectedLead ? getStopStatuses(selectedLead.lead_type) : [];
  }, [selectedLead]);

  const selectedLeadJobs = useMemo(() => {
    if (!selectedLead || selectedLead.lead_type !== "grower") {
      return [];
    }

    return jobs.filter((job) => job.grower_lead_id === selectedLead.id);
  }, [jobs, selectedLead]);

  async function createJobFromLead(lead) {
    setPendingGrowerJobId(lead.id);
    setJobActionMessage("");

    const { data, error } = await supabase
      .from("jobs")
      .insert({
        grower_lead_id: lead.id,
        title: buildJobTitle(lead),
        state: lead.state,
        crop_type: lead.crop_type,
        acres: lead.acres,
        notes: lead.notes,
        lead_source: "dashboard-job-create",
        status: "unassigned",
      })
      .select()
      .single();

    if (error) {
      setJobActionMessage(error.message);
      setPendingGrowerJobId("");
      return;
    }

    setJobs((current) => [data, ...current]);
    setJobsCount((current) => current + 1);
    setJobActionMessage(`Created job for ${formatAccountValue(lead)}.`);
    setPendingGrowerJobId("");

    // Future email/SMS automation hook:
    // notify internal ops that a new grower opportunity has been converted into a job.
    // Future routing automation hook:
    // score this job by territory, acres, and crop type before suggesting operators.
  }

  async function assignOperatorToJob(jobId) {
    const operatorId = assignmentSelections[jobId];

    if (!operatorId) {
      setJobActionMessage("Choose an operator before assigning the job.");
      return;
    }

    setPendingAssignmentJobId(jobId);
    setJobActionMessage("");

    const { data, error } = await supabase
      .from("jobs")
      .update({
        assigned_operator_id: operatorId,
        status: "assigned",
      })
      .eq("id", jobId)
      .select()
      .single();

    if (error) {
      setJobActionMessage(error.message);
      setPendingAssignmentJobId("");
      return;
    }

    setJobs((current) => current.map((job) => (job.id === jobId ? data : job)));
    setJobActionMessage("Operator assigned successfully.");
    setPendingAssignmentJobId("");

    // Future email/SMS automation hook:
    // send assignment notifications to the operator and internal ops team here.
  }

  const columns = [
    {
      key: "lead_type",
      label: "Lead",
      render: (lead) => (
        <div>
          <strong>{formatLeadName(lead)}</strong>
          <div className="table-subtle">
            {lead.lead_type === "grower" ? "Grower lead" : "Operator lead"}
          </div>
        </div>
      ),
    },
    {
      key: "account",
      label: "Farm / Company",
      render: (lead) => formatLeadAccount(lead) || "-",
    },
    { key: "state", label: "State" },
    {
      key: "capacity",
      label: "Acres",
      render: (lead) => formatCapacityValue(lead),
    },
    {
      key: "lead_source",
      label: "Source",
      render: (lead) => lead.lead_source || "-",
    },
    {
      key: "status",
      label: "Status",
      render: (lead) => (
        <div>
          <span className="status-pill">{lead.status}</span>
          <div className="table-subtle">Sequence: {lead.sequence_state || "pending"}</div>
          <div className="table-subtle">Next follow-up: {formatDateSafe(lead.next_follow_up_at)}</div>
        </div>
      ),
    },
    {
      key: "created_at",
      label: "Created",
      render: (lead) => formatDateSafe(lead.created_at),
    },
    {
      key: "actions",
      label: "Actions",
      render: (lead) => (
        <div className="inline-actions inline-actions--stacked">
          <button
            className={`button button--secondary button--small${selectedLeadId === lead.id ? " is-selected" : ""}`}
            type="button"
            onClick={() => setSelectedLeadId(lead.id)}
          >
            {selectedLeadId === lead.id ? "Viewing CRM" : "View CRM"}
          </button>
          {lead.lead_type === "grower" ? (
            <button
              className="button button--secondary button--small"
              type="button"
              disabled={jobsByGrowerLeadId.has(lead.id) || pendingGrowerJobId === lead.id}
              onClick={() => createJobFromLead(lead)}
            >
              {jobsByGrowerLeadId.has(lead.id)
                ? "Job created"
                : pendingGrowerJobId === lead.id
                  ? "Creating..."
                  : "Create job"}
            </button>
          ) : (
            <span className="table-subtle">Ready for routing review</span>
          )}
        </div>
      ),
    },
  ];

  const activityColumns = [
    {
      key: "activity_type",
      label: "Activity",
      render: (activity) => (
        <div>
          <strong>{activity.activityLabel}</strong>
          <div className="table-subtle">{activity.templateLabel}</div>
        </div>
      ),
    },
    {
      key: "lead",
      label: "Lead",
      render: (activity) => (
        <div>
          <strong>{activity.leadName}</strong>
          <div className="table-subtle">
            {formatLeadTypeLabel(activity.lead_type)} | {activity.account}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (activity) => <span className="status-pill">{activity.status}</span>,
    },
    {
      key: "subject",
      label: "Subject",
      render: (activity) => activity.subject || "-",
    },
    {
      key: "created_at",
      label: "Created",
      render: (activity) => formatDateSafe(activity.created_at),
    },
  ];

  return (
    <Shell>
      <section className="section">
        <div className="dashboard-header">
          <SectionHeading
            eyebrow="Live dashboard"
            title="Live operating view across leads, jobs, and automated follow-up"
            description="This dashboard shows how Harvest Drone can qualify demand, manage fulfillment supply, and keep outreach moving without losing visibility."
          />
        </div>

        <div className="stats-grid">
          <StatCard
            label="Total grower leads"
            value={stats.totalGrowerLeads}
            detail="Qualified grower demand currently visible in the pipeline."
          />
          <StatCard
            label="Total operator leads"
            value={stats.totalOperatorLeads}
            detail="Operator capacity and recruiting momentum in view."
          />
          <StatCard
            label="Total estimated acres"
            value={stats.totalEstimatedAcres.toLocaleString()}
            detail="Visible acreage flowing through the current lead set."
          />
          <StatCard
            label="States represented"
            value={stats.statesRepresented}
            detail={`${jobsCount} jobs currently staged for routing and assignment.`}
          />
        </div>
      </section>

      <section className="section">
        <DashboardFilters
          leadTypeFilter={leadTypeFilter}
          statusFilter={statusFilter}
          statusOptions={statusOptions}
          onLeadTypeChange={setLeadTypeFilter}
          onStatusChange={setStatusFilter}
        />
      </section>

      <div className="dashboard-stack section">
        <section className="dashboard-crm-grid">
          <div>
            {isLoading ? (
              <div className="table-card">
                <div className="empty-state">Loading live lead data...</div>
              </div>
            ) : errorMessage ? (
              <div className="table-card">
                <div className="empty-state">Supabase error: {errorMessage}</div>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="table-card">
                <div className="empty-state">No leads match the current filters yet.</div>
              </div>
            ) : (
              <LeadTable
                title="Live lead pipeline"
                columns={columns}
                rows={filteredLeads}
                countLabel="live leads"
                getRowProps={(row) => ({
                  className: row.id === selectedLeadId ? "table-row table-row--selected" : "table-row",
                })}
              />
            )}
          </div>

          <aside className="crm-panel card">
            {selectedLead ? (
              <>
                <div className="crm-panel__header">
                  <div>
                    <span className="eyebrow">Lead CRM</span>
                    <h3>{formatLeadName(selectedLead)}</h3>
                    <p className="table-subtle crm-panel__copy">
                      {formatLeadTypeLabel(selectedLead.lead_type)} lead from {formatAccountValue(selectedLead)} with a live automation trail and upcoming touch schedule.
                    </p>
                  </div>
                  <span className="status-pill">{selectedLead.status}</span>
                </div>

                <div className="crm-panel__summary">
                  <div className="crm-kpi">
                    <span>Current sequence</span>
                    <strong>{selectedLead.sequence_state || "pending"}</strong>
                  </div>
                  <div className="crm-kpi">
                    <span>Last contacted</span>
                    <strong>{formatDateSafe(selectedLead.last_contacted_at)}</strong>
                  </div>
                  <div className="crm-kpi">
                    <span>Next send</span>
                    <strong>{formatDateSafe(selectedLead.next_follow_up_at)}</strong>
                  </div>
                </div>

                <div className="crm-panel__grid">
                  <section className="crm-subcard">
                    <div className="crm-subcard__header">
                      <h4>Lead details</h4>
                      <span className="table-subtle">{selectedLead.email}</span>
                    </div>
                    <dl className="crm-meta-list">
                      {getLeadMetaRows(selectedLead).map((item) => (
                        <div className="crm-meta-list__row" key={item.label}>
                          <dt>{item.label}</dt>
                          <dd>{item.value}</dd>
                        </div>
                      ))}
                    </dl>
                    {selectedLead.notes ? (
                      <div className="crm-notes">
                        <span className="table-subtle">Notes</span>
                        <p>{selectedLead.notes}</p>
                      </div>
                    ) : null}
                  </section>

                  <section className="crm-subcard">
                    <div className="crm-subcard__header">
                      <h4>Automation plan</h4>
                      <span className="table-subtle">{selectedLeadCampaign?.label || "No campaign"}</span>
                    </div>
                    <div className="crm-automation-highlight">
                      <div>
                        <span className="table-subtle">Up next</span>
                        <strong>{selectedLeadUpcomingStep?.subject || "No remaining follow-up scheduled"}</strong>
                      </div>
                      <div className="crm-automation-highlight__time">
                        {selectedLeadUpcomingStep ? formatDateSafe(selectedLeadUpcomingStep.scheduledAt) : "Sequence complete"}
                      </div>
                    </div>
                    <div className="crm-stop-rules">
                      <span className="table-subtle">Stop rules</span>
                      <p>{selectedLeadStopStatuses.join(", ")}</p>
                    </div>
                    <div className="crm-timeline">
                      {selectedLeadTimeline.map((step) => (
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
                  </section>

                  <section className="crm-subcard">
                    <div className="crm-subcard__header">
                      <h4>Lead activity</h4>
                      <span className="table-subtle">{selectedLeadActivities.length} logged events</span>
                    </div>
                    {selectedLeadActivities.length ? (
                      <div className="crm-activity-list">
                        {selectedLeadActivities.slice(0, 8).map((activity) => (
                          <article className="crm-activity-list__item" key={activity.id}>
                            <div className="crm-activity-list__copy">
                              <strong>{activity.activityLabel}</strong>
                              <span className="table-subtle">{activity.subject || activity.templateLabel}</span>
                            </div>
                            <div className="crm-activity-list__meta">
                              <span className="status-pill">{activity.status}</span>
                              <span className="table-subtle">{formatDateSafe(activity.created_at)}</span>
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state">Activity will appear here as the sequence runs.</div>
                    )}
                  </section>

                  <section className="crm-subcard">
                    <div className="crm-subcard__header">
                      <h4>CRM narrative</h4>
                      <span className="table-subtle">What the machine is doing next</span>
                    </div>
                    <div className="crm-narrative">
                      <p>
                        Harvest Drone is keeping this lead warm with a scheduled sequence built to increase trust, surface fit, and move toward a higher-intent conversation.
                      </p>
                      <p>
                        The next planned touch is{" "}
                        <strong>{selectedLeadUpcomingStep?.subject || "the final completed state"}</strong>{" "}
                        {selectedLeadUpcomingStep
                          ? `scheduled for ${formatDateSafe(selectedLeadUpcomingStep.scheduledAt)}.`
                          : "with no additional outbound emails currently queued."}
                      </p>
                      {selectedLead.lead_type === "grower" ? (
                        <p>
                          This grower can be converted into a job once the opportunity looks real enough to route against operator supply.
                        </p>
                      ) : (
                        <p>
                          This operator record can be used to judge territory strength, equipment readiness, and assignment potential as jobs come online.
                        </p>
                      )}
                    </div>
                    {selectedLeadJobs.length ? (
                      <div className="crm-linked-jobs">
                        <span className="table-subtle">Linked jobs</span>
                        {selectedLeadJobs.map((job) => (
                          <div className="crm-linked-jobs__item" key={job.id}>
                            <strong>{job.title}</strong>
                            <span className="table-subtle">
                              {job.status} | {job.state || "-"} | {Number(job.acres ?? 0).toLocaleString()} acres
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </section>
                </div>
              </>
            ) : (
              <div className="empty-state">Select a lead to inspect the CRM and automation timeline.</div>
            )}
          </aside>
        </section>

        <section className="jobs-card card">
          <div className="jobs-card__header">
            <div>
              <span className="eyebrow">Jobs</span>
              <h3>Assignment-ready opportunities</h3>
              <p className="table-subtle jobs-card__copy">
                Convert qualified grower demand into routing-ready jobs, then line up the right operator coverage.
              </p>
            </div>
            <span className="table-subtle">{jobs.length} jobs in pipeline</span>
          </div>

          {jobActionMessage ? <p className="form-error">{jobActionMessage}</p> : null}

          {jobs.length === 0 ? (
            <div className="empty-state">Create a job from any grower lead to start assignment planning.</div>
          ) : (
            <div className="jobs-grid">
              {jobs.map((job) => (
                <article className="job-item" key={job.id}>
                  <div className="job-item__meta">
                    <strong>{job.title}</strong>
                    <span className="table-subtle">
                      {job.state || "-"} | {job.crop_type || "Crop TBD"} | {Number(job.acres ?? 0).toLocaleString()} acres
                    </span>
                    <span className="table-subtle">
                      Status: {job.status} | Created {formatDateSafe(job.created_at)}
                    </span>
                    <span className="table-subtle">
                      Assigned operator: {operatorNameById[job.assigned_operator_id] || "Unassigned"}
                    </span>
                  </div>

                  <div className="job-item__controls">
                    <label className="field">
                      <span>Assign operator</span>
                      <select
                        value={assignmentSelections[job.id] ?? job.assigned_operator_id ?? ""}
                        onChange={(event) =>
                          setAssignmentSelections((current) => ({
                            ...current,
                            [job.id]: event.target.value,
                          }))
                        }
                      >
                        <option value="">Choose operator</option>
                        {operatorLeads.map((operator) => (
                          <option key={operator.id} value={operator.id}>
                            {[operator.first_name, operator.last_name].filter(Boolean).join(" ")} - {operator.company_name || operator.state}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="inline-actions">
                      <button
                        className="button button--primary button--small"
                        type="button"
                        disabled={pendingAssignmentJobId === job.id}
                        onClick={() => assignOperatorToJob(job.id)}
                      >
                        {pendingAssignmentJobId === job.id ? "Assigning..." : "Assign operator"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="activity-summary card">
            <div className="activity-summary__item">
              <span>Emails sent</span>
              <strong>{activitySummary.emailSent}</strong>
            </div>
            <div className="activity-summary__item">
              <span>Follow-ups scheduled</span>
              <strong>{activitySummary.scheduled}</strong>
            </div>
            <div className="activity-summary__item">
              <span>Failed events</span>
              <strong>{activitySummary.failed}</strong>
            </div>
          </div>

          {isLoading ? (
            <div className="table-card">
              <div className="empty-state">Loading automation activity...</div>
            </div>
          ) : errorMessage ? null : recentActivities.length === 0 ? (
            <div className="table-card">
              <div className="empty-state">Activity will appear here as emails and automation events run.</div>
            </div>
          ) : (
            <LeadTable
              title="Recent automation activity"
              columns={activityColumns}
              rows={recentActivities}
              countLabel="recent events"
            />
          )}
        </section>
      </div>
    </Shell>
  );
}

export default DashboardPageV2;
