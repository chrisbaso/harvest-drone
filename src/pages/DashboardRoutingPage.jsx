import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import DashboardFilters from "../components/DashboardFilters";
import LeadTable from "../components/LeadTable";
import SectionHeading from "../components/SectionHeading";
import Shell from "../components/Shell";
import StatCard from "../components/StatCard";
import {
  formatLeadAccount,
  formatLeadName,
  normalizeGrowerLead,
  normalizeOperatorLead,
} from "../lib/leadTransforms";
import { supabase } from "../lib/supabase";

function formatDateSafe(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function formatCapacityValue(lead) {
  const value = lead.lead_type === "grower" ? Number(lead.acres ?? 0) : Number(lead.acres_capacity_per_week ?? 0);
  return value.toLocaleString();
}

function buildJobTitle(lead) {
  const account = formatLeadAccount(lead) || "New";
  return `${account} Spraying Opportunity`;
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
  if (!value) return "System event";
  return value.replaceAll("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function formatLeadTypeLabel(type) {
  return type === "grower" ? "Grower" : "Operator";
}

function getStatusTone(value = "") {
  const v = String(value).toLowerCase();
  if (["active", "qualified", "converted"].includes(v)) return { bg: "rgba(74,222,128,0.12)", color: "#4ADE80" };
  if (["new", "contacted", "pending"].includes(v)) return { bg: "rgba(96,165,250,0.12)", color: "#60A5FA" };
  if (["assigned", "in_progress"].includes(v)) return { bg: "rgba(251,191,36,0.12)", color: "#FBBF24" };
  if (["failed", "lost", "inactive"].includes(v)) return { bg: "rgba(248,113,113,0.12)", color: "#F87171" };
  return { bg: "rgba(255,255,255,0.06)", color: "#9CA38C" };
}

const css = `
.dop {
  --dop-bg: #0C0F0A;
  --dop-surface: #151A12;
  --dop-card-bg: #1A2015;
  --dop-border: rgba(255,255,255,0.06);
  --dop-border-hover: rgba(255,255,255,0.12);
  --dop-text: #E8E6E1;
  --dop-text-muted: #727966;
  --dop-accent: #A3D977;
  --dop-accent-dim: rgba(163,217,119,0.10);
  --dop-sans: 'Instrument Sans', 'Inter', system-ui, sans-serif;
  --dop-serif: 'DM Serif Display', Georgia, serif;

  font-family: var(--dop-sans);
  -webkit-font-smoothing: antialiased;
  color: var(--dop-text);
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 32px 0;
}

.dop__hero {
  background: var(--dop-surface);
  border: 1px solid var(--dop-border);
  border-radius: 12px;
  padding: 36px 36px 32px;
}
.dop__hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--dop-accent);
  margin-bottom: 12px;
}
.dop__hero-eyebrow::before {
  content: '';
  width: 24px;
  height: 1px;
  background: var(--dop-accent);
}
.dop__hero h1 {
  font-family: var(--dop-serif);
  font-size: clamp(1.4rem, 2.5vw, 1.8rem);
  font-weight: 400;
  color: #fff;
  line-height: 1.25;
  margin: 0 0 8px;
  max-width: 640px;
}
.dop__hero p {
  font-size: 14px;
  color: var(--dop-text-muted);
  margin: 0;
  max-width: 560px;
  line-height: 1.6;
}

.dop__kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: var(--dop-border);
  border: 1px solid var(--dop-border);
  border-radius: 12px;
  overflow: hidden;
}
.dop__kpi {
  background: var(--dop-surface);
  padding: 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.dop__kpi-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--dop-text-muted);
}
.dop__kpi-value {
  font-family: var(--dop-serif);
  font-size: 1.8rem;
  color: #fff;
  line-height: 1.1;
}
.dop__kpi-detail {
  font-size: 12px;
  color: var(--dop-text-muted);
  line-height: 1.5;
  margin-top: 4px;
}

.dop__filters {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 16px 20px;
  background: var(--dop-surface);
  border: 1px solid var(--dop-border);
  border-radius: 12px;
}
.dop__filter-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 160px;
}
.dop__filter-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--dop-text-muted);
  padding-left: 2px;
}
.dop__filter-select {
  font-family: var(--dop-sans);
  font-size: 13px;
  color: var(--dop-text);
  background: var(--dop-bg);
  border: 1px solid var(--dop-border);
  border-radius: 8px;
  padding: 9px 32px 9px 12px;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23727966' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  cursor: pointer;
  transition: border-color 0.15s;
}
.dop__filter-select:focus {
  border-color: rgba(163,217,119,0.4);
  box-shadow: 0 0 0 2px var(--dop-accent-dim);
}
.dop__filter-select.is-active {
  border-color: rgba(163,217,119,0.25);
  background-color: rgba(163,217,119,0.04);
}

.dop__jobs {
  background: var(--dop-surface);
  border: 1px solid var(--dop-border);
  border-radius: 12px;
  overflow: hidden;
}
.dop__jobs-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 24px 24px 20px;
  border-bottom: 1px solid var(--dop-border);
}
.dop__jobs-header-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.dop__jobs-eyebrow {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--dop-accent);
}
.dop__jobs-title {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  margin: 4px 0 0;
}
.dop__jobs-desc {
  font-size: 13px;
  color: var(--dop-text-muted);
  margin: 2px 0 0;
  line-height: 1.5;
}
.dop__jobs-count {
  font-size: 12px;
  font-weight: 600;
  color: var(--dop-accent);
  background: var(--dop-accent-dim);
  padding: 4px 12px;
  border-radius: 10px;
  flex-shrink: 0;
  margin-top: 4px;
}
.dop__jobs-message {
  padding: 10px 24px;
  font-size: 13px;
  color: #FBBF24;
  background: rgba(251,191,36,0.06);
  border-bottom: 1px solid var(--dop-border);
}
.dop__jobs-empty {
  padding: 40px 24px;
  text-align: center;
  font-size: 14px;
  color: var(--dop-text-muted);
}
.dop__jobs-grid {
  display: flex;
  flex-direction: column;
}

.dop__job {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--dop-border);
  transition: background 0.1s;
}
.dop__job:last-child {
  border-bottom: none;
}
.dop__job:hover {
  background: rgba(255,255,255,0.015);
}
.dop__job-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.dop__job-title {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}
.dop__job-meta {
  font-size: 12px;
  color: var(--dop-text-muted);
  line-height: 1.5;
}
.dop__job-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 6px;
  width: fit-content;
  margin-top: 2px;
}
.dop__job-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.dop__job-controls {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  flex-shrink: 0;
}
.dop__job-select {
  font-family: var(--dop-sans);
  font-size: 12px;
  color: var(--dop-text);
  background: var(--dop-bg);
  border: 1px solid var(--dop-border);
  border-radius: 6px;
  padding: 7px 28px 7px 10px;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23727966' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  cursor: pointer;
  min-width: 180px;
}
.dop__job-btn {
  font-family: var(--dop-sans);
  font-size: 12px;
  font-weight: 600;
  color: var(--dop-bg);
  background: var(--dop-accent);
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  transition: filter 0.15s;
  white-space: nowrap;
}
.dop__job-btn:hover:not(:disabled) {
  filter: brightness(1.1);
}
.dop__job-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.dop__activity-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--dop-border);
  border: 1px solid var(--dop-border);
  border-radius: 12px;
  overflow: hidden;
}
.dop__activity-stat {
  background: var(--dop-surface);
  padding: 20px 24px;
  text-align: center;
}
.dop__activity-stat span {
  display: block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--dop-text-muted);
  margin-bottom: 4px;
}
.dop__activity-stat strong {
  font-family: var(--dop-serif);
  font-size: 1.6rem;
  color: #fff;
}

.dop__pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 6px;
}
.dop__pill-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.dop__lead-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.dop__lead-btn {
  font-family: var(--dop-sans);
  font-size: 12px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
  transition: background 0.15s, border-color 0.15s;
  white-space: nowrap;
}
.dop__lead-btn--secondary {
  color: var(--dop-text);
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--dop-border);
}
.dop__lead-btn--secondary:hover {
  background: var(--dop-accent-dim);
  border-color: var(--dop-border-hover);
}
.dop__lead-btn--primary {
  color: var(--dop-bg);
  background: var(--dop-accent);
  border: none;
}
.dop__lead-btn--primary:hover:not(:disabled) {
  filter: brightness(1.1);
}
.dop__lead-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.dop__lead-subtle {
  font-size: 11px;
  color: var(--dop-text-muted);
}

@media (max-width: 900px) {
  .dop__kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .dop__job { flex-direction: column; gap: 12px; }
  .dop__job-controls { width: 100%; }
  .dop__job-select { flex: 1; }
  .dop__filters { flex-wrap: wrap; }
}
@media (max-width: 600px) {
  .dop { padding: 20px 0; gap: 16px; }
  .dop__hero { padding: 24px 20px; }
  .dop__kpi-grid { grid-template-columns: 1fr; }
  .dop__activity-summary { grid-template-columns: 1fr; }
  .dop__filters { flex-direction: column; align-items: stretch; }
  .dop__filter-field { min-width: unset; }
}
`;

function DashboardRoutingPage() {
  const [leads, setLeads] = useState([]);
  const [operatorLeads, setOperatorLeads] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [activities, setActivities] = useState([]);
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
        supabase.from("lead_activities").select("*").order("created_at", { ascending: false }).limit(25),
      ]);

      if (!isMounted) return;

      if (growersResponse.error || operatorsResponse.error || jobsResponse.error || activitiesResponse.error) {
        setErrorMessage(
          growersResponse.error?.message || operatorsResponse.error?.message || jobsResponse.error?.message || activitiesResponse.error?.message || "Unable to load dashboard data.",
        );
        setLeads([]);
        setOperatorLeads([]);
        setJobs([]);
        setActivities([]);
        setIsLoading(false);
        return;
      }

      const combinedLeads = [
        ...(growersResponse.data ?? []).map(normalizeGrowerLead),
        ...(operatorsResponse.data ?? []).map(normalizeOperatorLead),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setLeads(combinedLeads);
      setOperatorLeads(operatorsResponse.data ?? []);
      setJobs(jobsResponse.data ?? []);
      setActivities(activitiesResponse.data ?? []);
      setIsLoading(false);
    }

    fetchDashboardData();
    return () => { isMounted = false; };
  }, []);

  const statusOptions = useMemo(() => [...new Set(leads.map((l) => l.status).filter(Boolean))], [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchType = leadTypeFilter === "all" || lead.lead_type === leadTypeFilter;
      const matchStatus = statusFilter === "all" || lead.status === statusFilter;
      return matchType && matchStatus;
    });
  }, [leadTypeFilter, leads, statusFilter]);

  const stats = useMemo(() => {
    const totalGrowerLeads = filteredLeads.filter((l) => l.lead_type === "grower").length;
    const totalOperatorLeads = filteredLeads.filter((l) => l.lead_type === "operator").length;
    const totalEstimatedAcres = filteredLeads.reduce((sum, l) => sum + Number(l.acres ?? 0), 0);
    const statesRepresented = new Set(filteredLeads.map((l) => l.state).filter(Boolean)).size;
    return { totalGrowerLeads, totalOperatorLeads, totalEstimatedAcres, statesRepresented };
  }, [filteredLeads]);

  const jobsByGrowerLeadId = useMemo(() => new Set(jobs.map((j) => j.grower_lead_id).filter(Boolean)), [jobs]);

  const operatorNameById = useMemo(() => {
    return operatorLeads.reduce((lookup, op) => {
      lookup[op.id] = formatLeadName({ first_name: op.first_name, last_name: op.last_name });
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
    return activities.map((a) => {
      const lead = leadLookup[`${a.lead_type}:${a.lead_id}`];
      return {
        ...a,
        leadName: lead ? formatLeadName(lead) : "Lead not found",
        account: lead ? formatLeadAccount(lead) || "-" : "-",
        activityLabel: formatActivityLabel(a.activity_type),
        templateLabel: formatTemplateLabel(a.template_key || a.channel),
      };
    });
  }, [activities, leadLookup]);

  const activitySummary = useMemo(() => {
    return recentActivities.reduce(
      (s, a) => {
        if (a.activity_type === "email_sent") s.emailSent += 1;
        if (a.activity_type === "follow_up_scheduled") s.scheduled += 1;
        if (a.status === "failed") s.failed += 1;
        return s;
      },
      { emailSent: 0, scheduled: 0, failed: 0 },
    );
  }, [recentActivities]);

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
    setJobActionMessage(`Created job for ${formatLeadAccount(lead) || "lead"}.`);
    setPendingGrowerJobId("");
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
      .update({ assigned_operator_id: operatorId, status: "assigned" })
      .eq("id", jobId)
      .select()
      .single();

    if (error) {
      setJobActionMessage(error.message);
      setPendingAssignmentJobId("");
      return;
    }

    setJobs((current) => current.map((j) => (j.id === jobId ? data : j)));
    setJobActionMessage("Operator assigned successfully.");
    setPendingAssignmentJobId("");
  }

  const columns = [
    {
      key: "lead_type",
      label: "Lead",
      render: (lead) => (
        <div>
          <strong style={{ color: "#fff" }}>{formatLeadName(lead)}</strong>
          <div className="dop__lead-subtle">{lead.lead_type === "grower" ? "Grower lead" : "Operator lead"}</div>
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
      key: "status",
      label: "Status",
      render: (lead) => {
        const tone = getStatusTone(lead.status);
        return (
          <div>
            <span className="dop__pill" style={{ background: tone.bg, color: tone.color }}>
              <span className="dop__pill-dot" style={{ background: tone.color }} />
              {lead.status}
            </span>
            <div className="dop__lead-subtle" style={{ marginTop: 4 }}>Seq: {lead.sequence_state || "pending"}</div>
            <div className="dop__lead-subtle">Next: {formatDateSafe(lead.next_follow_up_at)}</div>
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (lead) => (
        <div className="dop__lead-actions">
          <Link className="dop__lead-btn dop__lead-btn--secondary" to={`/dashboard/leads/${lead.lead_type}/${lead.id}`}>
            Open lead
          </Link>
          {lead.lead_type === "grower" ? (
            <button
              className="dop__lead-btn dop__lead-btn--primary"
              type="button"
              disabled={jobsByGrowerLeadId.has(lead.id) || pendingGrowerJobId === lead.id}
              onClick={() => createJobFromLead(lead)}
            >
              {jobsByGrowerLeadId.has(lead.id) ? "Job created" : pendingGrowerJobId === lead.id ? "Creating..." : "Create job"}
            </button>
          ) : (
            <span className="dop__lead-subtle">Ready for routing review</span>
          )}
        </div>
      ),
    },
  ];

  const activityColumns = [
    {
      key: "activity_type",
      label: "Activity",
      render: (a) => (
        <div>
          <strong style={{ color: "#fff" }}>{a.activityLabel}</strong>
          <div className="dop__lead-subtle">{a.templateLabel}</div>
        </div>
      ),
    },
    {
      key: "lead",
      label: "Lead",
      render: (a) => (
        <div>
          <strong style={{ color: "#fff" }}>{a.leadName}</strong>
          <div className="dop__lead-subtle">{formatLeadTypeLabel(a.lead_type)} - {a.account}</div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (a) => {
        const tone = getStatusTone(a.status);
        return (
          <span className="dop__pill" style={{ background: tone.bg, color: tone.color }}>
            <span className="dop__pill-dot" style={{ background: tone.color }} />
            {a.status}
          </span>
        );
      },
    },
    {
      key: "created_at",
      label: "Created",
      render: (a) => <span className="dop__lead-subtle">{formatDateSafe(a.created_at)}</span>,
    },
  ];

  return (
    <Shell>
      <style>{css}</style>
      <div className="dop">
        <section className="dop__hero">
          <span className="dop__hero-eyebrow">Live dashboard</span>
          <h1>Leads, jobs, and automated follow-up in one operating view.</h1>
          <p>Drill into any lead to see the full activity stream, scheduled emails, and the automation sequence behind it.</p>
        </section>

        <div className="dop__kpi-grid">
          <div className="dop__kpi">
            <span className="dop__kpi-label">Grower leads</span>
            <strong className="dop__kpi-value">{stats.totalGrowerLeads}</strong>
            <span className="dop__kpi-detail">Qualified grower demand in pipeline</span>
          </div>
          <div className="dop__kpi">
            <span className="dop__kpi-label">Operator leads</span>
            <strong className="dop__kpi-value">{stats.totalOperatorLeads}</strong>
            <span className="dop__kpi-detail">Operator capacity and recruiting momentum</span>
          </div>
          <div className="dop__kpi">
            <span className="dop__kpi-label">Estimated acres</span>
            <strong className="dop__kpi-value">{stats.totalEstimatedAcres.toLocaleString()}</strong>
            <span className="dop__kpi-detail">Acreage flowing through lead set</span>
          </div>
          <div className="dop__kpi">
            <span className="dop__kpi-label">States covered</span>
            <strong className="dop__kpi-value">{stats.statesRepresented}</strong>
            <span className="dop__kpi-detail">{jobs.length} jobs staged for routing</span>
          </div>
        </div>

        <section className="dop__filters">
          <div className="dop__filter-field">
            <span className="dop__filter-label">Lead type</span>
            <select
              className={`dop__filter-select${leadTypeFilter !== "all" ? " is-active" : ""}`}
              value={leadTypeFilter}
              onChange={(e) => setLeadTypeFilter(e.target.value)}
            >
              <option value="all">All types</option>
              <option value="grower">Grower</option>
              <option value="operator">Operator</option>
            </select>
          </div>
          <div className="dop__filter-field">
            <span className="dop__filter-label">Status</span>
            <select
              className={`dop__filter-select${statusFilter !== "all" ? " is-active" : ""}`}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All statuses</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </section>

        {isLoading ? (
          <div className="dop__jobs"><div className="dop__jobs-empty">Loading live lead data...</div></div>
        ) : errorMessage ? (
          <div className="dop__jobs"><div className="dop__jobs-empty">Supabase error: {errorMessage}</div></div>
        ) : filteredLeads.length === 0 ? (
          <div className="dop__jobs"><div className="dop__jobs-empty">No leads match the current filters yet.</div></div>
        ) : (
          <LeadTable title="Live lead pipeline" columns={columns} rows={filteredLeads} countLabel="live leads" />
        )}

        <section className="dop__jobs">
          <div className="dop__jobs-header">
            <div className="dop__jobs-header-left">
              <span className="dop__jobs-eyebrow">Jobs</span>
              <h3 className="dop__jobs-title">Assignment-ready opportunities</h3>
              <p className="dop__jobs-desc">Route grower demand to operators with available capacity.</p>
            </div>
            <span className="dop__jobs-count">{jobs.length} in pipeline</span>
          </div>

          {jobActionMessage && <div className="dop__jobs-message">{jobActionMessage}</div>}

          {jobs.length === 0 ? (
            <div className="dop__jobs-empty">Create a job from any grower lead to start assignment planning.</div>
          ) : (
            <div className="dop__jobs-grid">
              {jobs.map((job) => {
                const statusTone = getStatusTone(job.status);
                return (
                  <div className="dop__job" key={job.id}>
                    <div className="dop__job-info">
                      <span className="dop__job-title">{job.title}</span>
                      <span className="dop__job-meta">
                        {job.state || "-"} - {job.crop_type || "Crop TBD"} - {Number(job.acres ?? 0).toLocaleString()} acres
                      </span>
                      <span className="dop__job-status" style={{ background: statusTone.bg, color: statusTone.color }}>
                        <span className="dop__job-status-dot" style={{ background: statusTone.color }} />
                        {job.status}
                      </span>
                      <span className="dop__job-meta">
                        Operator: {operatorNameById[job.assigned_operator_id] || "Unassigned"} - {formatDateSafe(job.created_at)}
                      </span>
                    </div>
                    <div className="dop__job-controls">
                      <select
                        className="dop__job-select"
                        value={assignmentSelections[job.id] ?? job.assigned_operator_id ?? ""}
                        onChange={(e) => setAssignmentSelections((c) => ({ ...c, [job.id]: e.target.value }))}
                      >
                        <option value="">Choose operator</option>
                        {operatorLeads.map((op) => (
                          <option key={op.id} value={op.id}>
                            {[op.first_name, op.last_name].filter(Boolean).join(" ")} - {op.company_name || op.state}
                          </option>
                        ))}
                      </select>
                      <button
                        className="dop__job-btn"
                        type="button"
                        disabled={pendingAssignmentJobId === job.id}
                        onClick={() => assignOperatorToJob(job.id)}
                      >
                        {pendingAssignmentJobId === job.id ? "Assigning..." : "Assign"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <div className="dop__activity-summary">
          <div className="dop__activity-stat">
            <span>Emails sent</span>
            <strong>{activitySummary.emailSent}</strong>
          </div>
          <div className="dop__activity-stat">
            <span>Follow-ups scheduled</span>
            <strong>{activitySummary.scheduled}</strong>
          </div>
          <div className="dop__activity-stat">
            <span>Failed events</span>
            <strong>{activitySummary.failed}</strong>
          </div>
        </div>

        {!isLoading && !errorMessage && recentActivities.length > 0 && (
          <LeadTable title="Recent automation activity" columns={activityColumns} rows={recentActivities} countLabel="recent events" />
        )}
      </div>
    </Shell>
  );
}

export default DashboardRoutingPage;

