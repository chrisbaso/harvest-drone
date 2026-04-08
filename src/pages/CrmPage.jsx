import { useEffect, useMemo, useState } from "react";
import CrmDetailPanel from "../components/CrmDetailPanel";
import CrmFilters from "../components/CrmFilters";
import CrmPipelineBoard from "../components/CrmPipelineBoard";
import CrmSidebar from "../components/CrmSidebar";
import LeadTable from "../components/LeadTable";
import Shell from "../components/Shell";
import {
  formatCompactNumber,
  formatCrmStageLabel,
  formatCrmTypeLabel,
  formatCurrency,
  formatDateTime,
} from "../lib/crm";
import { supabase } from "../lib/supabase";

const OPPORTUNITY_BOARD_COLUMNS = [
  { id: "open", description: "Fresh revenue paths" },
  { id: "assigned", description: "Owned and moving" },
  { id: "qualified", description: "Validated for close" },
  { id: "closed_won", description: "Revenue captured" },
];

function getBadgeTone(value = "") {
  const normalized = String(value).toLowerCase();

  if (["closed_won", "active", "approved", "qualified", "sent", "delivered", "completed"].includes(normalized)) {
    return "status-pill status-pill--success";
  }

  if (["route_to_operator", "call_scheduled", "assigned", "contacted"].includes(normalized)) {
    return "status-pill status-pill--info";
  }

  if (["closed_lost", "inactive", "failed", "bounced", "unsubscribed"].includes(normalized)) {
    return "status-pill status-pill--danger";
  }

  if (["hylio", "hylio_sale", "paused", "grower", "operator", "source"].includes(normalized)) {
    return "status-pill status-pill--highlight";
  }

  return "status-pill";
}

function getInitials(value = "") {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase())
    .join("");
}

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString();
}

function startOfTodayIso() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return start.toISOString();
}

function startOfWeekIso() {
  const now = new Date();
  const start = new Date(now);
  const day = start.getDay();
  const diff = (day + 6) % 7;
  start.setDate(start.getDate() - diff);
  start.setHours(0, 0, 0, 0);
  return start.toISOString();
}

function matchesSearch(record, searchQuery) {
  if (!searchQuery) {
    return true;
  }

  const haystack = Object.values(record || {})
    .flatMap((value) => {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        return Object.values(value);
      }

      return [value];
    })
    .filter((value) => typeof value === "string" || typeof value === "number")
    .join(" ")
    .toLowerCase();

  return haystack.includes(searchQuery.toLowerCase());
}

function renderActionCell(onSelect, row, label = "Open") {
  return (
    <button
      type="button"
      className="button button--secondary button--small"
      onClick={(event) => {
        event.stopPropagation();
        onSelect(row);
      }}
    >
      {label}
    </button>
  );
}

function CrmPage() {
  const [accounts, setAccounts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [leads, setLeads] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [acres, setAcres] = useState([]);
  const [operators, setOperators] = useState([]);
  const [activities, setActivities] = useState([]);
  const [dripSequences, setDripSequences] = useState([]);
  const [dripEmails, setDripEmails] = useState([]);
  const [dripEnrollments, setDripEnrollments] = useState([]);
  const [dripSends, setDripSends] = useState([]);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [opportunityView, setOpportunityView] = useState("board");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [actionMessage, setActionMessage] = useState(null);
  const [expandedSequences, setExpandedSequences] = useState({});
  const [pendingSequenceId, setPendingSequenceId] = useState("");
  const [pendingEnrollmentId, setPendingEnrollmentId] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchCrmData() {
      setIsLoading(true);
      setErrorMessage("");

      const [accountsResponse, contactsResponse, leadsResponse, opportunitiesResponse, acresResponse, operatorsResponse, activitiesResponse, sequencesResponse, emailsResponse, enrollmentsResponse, sendsResponse] = await Promise.all([
        supabase.from("crm_accounts").select("*").order("created_at", { ascending: false }),
        supabase.from("crm_contacts").select("*").order("created_at", { ascending: false }),
        supabase.from("crm_leads").select("*").order("created_at", { ascending: false }),
        supabase.from("crm_opportunities").select("*").order("created_at", { ascending: false }),
        supabase.from("crm_acres").select("*").order("created_at", { ascending: false }),
        supabase.from("crm_operators").select("*").order("created_at", { ascending: false }),
        supabase.from("crm_activities").select("*").order("created_at", { ascending: false }).limit(60),
        supabase.from("drip_sequences").select("*").order("created_at", { ascending: false }),
        supabase.from("drip_emails").select("*").order("sequence_id").order("step_number"),
        supabase.from("drip_enrollments").select("*").order("created_at", { ascending: false }),
        supabase.from("drip_sends").select("*").order("sent_at", { ascending: false }).limit(20),
      ]);

      if (!isMounted) {
        return;
      }

      const error =
        accountsResponse.error ||
        contactsResponse.error ||
        leadsResponse.error ||
        opportunitiesResponse.error ||
        acresResponse.error ||
        operatorsResponse.error ||
        activitiesResponse.error ||
        sequencesResponse.error ||
        emailsResponse.error ||
        enrollmentsResponse.error ||
        sendsResponse.error;

      if (error) {
        setErrorMessage(error.message || "Unable to load CRM data.");
        setAccounts([]);
        setContacts([]);
        setLeads([]);
        setOpportunities([]);
        setAcres([]);
        setOperators([]);
        setActivities([]);
        setDripSequences([]);
        setDripEmails([]);
        setDripEnrollments([]);
        setDripSends([]);
        setIsLoading(false);
        return;
      }

      setAccounts(accountsResponse.data ?? []);
      setContacts(contactsResponse.data ?? []);
      setLeads(leadsResponse.data ?? []);
      setOpportunities(opportunitiesResponse.data ?? []);
      setAcres(acresResponse.data ?? []);
      setOperators(operatorsResponse.data ?? []);
      setActivities(activitiesResponse.data ?? []);
      setDripSequences(sequencesResponse.data ?? []);
      setDripEmails(emailsResponse.data ?? []);
      setDripEnrollments(enrollmentsResponse.data ?? []);
      setDripSends(sendsResponse.data ?? []);
      setIsLoading(false);
    }

    fetchCrmData();

    return () => {
      isMounted = false;
    };
  }, []);

  const typeOptions = useMemo(
    () => [...new Set([...contacts.map((row) => row.contact_type).filter(Boolean), ...leads.map((row) => row.lead_type).filter(Boolean), ...leads.map((row) => row.route_type).filter(Boolean), ...opportunities.map((row) => row.opportunity_type).filter(Boolean), ...opportunities.map((row) => row.route_type).filter(Boolean), ...operators.map((row) => row.operator_type).filter(Boolean)])],
    [contacts, leads, opportunities, operators],
  );

  const stageOptions = useMemo(
    () => [...new Set([...leads.map((row) => row.stage).filter(Boolean), ...opportunities.map((row) => row.stage).filter(Boolean), ...operators.map((row) => row.status).filter(Boolean), ...activities.map((row) => row.stage).filter(Boolean)])],
    [activities, leads, opportunities, operators],
  );

  const stateOptions = useMemo(
    () => [...new Set([...accounts.map((row) => row.state).filter(Boolean), ...contacts.map((row) => row.state).filter(Boolean), ...leads.map((row) => row.state).filter(Boolean), ...opportunities.map((row) => row.state).filter(Boolean), ...acres.map((row) => row.state).filter(Boolean), ...operators.map((row) => row.state).filter(Boolean), ...activities.map((row) => row.state).filter(Boolean)])],
    [accounts, contacts, leads, opportunities, acres, operators, activities],
  );

  const ownerOptions = useMemo(
    () => [...new Set([...accounts.map((row) => row.owner).filter(Boolean), ...contacts.map((row) => row.owner).filter(Boolean), ...leads.map((row) => row.owner).filter(Boolean), ...opportunities.map((row) => row.owner).filter(Boolean), ...acres.map((row) => row.owner).filter(Boolean), ...operators.map((row) => row.owner).filter(Boolean), ...activities.map((row) => row.owner).filter(Boolean)])],
    [accounts, contacts, leads, opportunities, acres, operators, activities],
  );

  const filteredAccounts = useMemo(() => accounts.filter((row) => (typeFilter === "all" || row.account_type === typeFilter) && (stateFilter === "all" || row.state === stateFilter) && (ownerFilter === "all" || row.owner === ownerFilter) && matchesSearch(row, searchQuery)), [accounts, ownerFilter, searchQuery, stateFilter, typeFilter]);
  const filteredContacts = useMemo(() => contacts.filter((row) => (typeFilter === "all" || row.contact_type === typeFilter) && (stateFilter === "all" || row.state === stateFilter) && (ownerFilter === "all" || row.owner === ownerFilter) && matchesSearch(row, searchQuery)), [contacts, ownerFilter, searchQuery, stateFilter, typeFilter]);
  const filteredLeads = useMemo(() => leads.filter((row) => (typeFilter === "all" || row.lead_type === typeFilter || row.route_type === typeFilter) && (stageFilter === "all" || row.stage === stageFilter) && (stateFilter === "all" || row.state === stateFilter) && (ownerFilter === "all" || row.owner === ownerFilter) && matchesSearch(row, searchQuery)), [leads, ownerFilter, searchQuery, stageFilter, stateFilter, typeFilter]);
  const filteredOpportunities = useMemo(() => opportunities.filter((row) => (typeFilter === "all" || row.opportunity_type === typeFilter || row.route_type === typeFilter) && (stageFilter === "all" || row.stage === stageFilter) && (stateFilter === "all" || row.state === stateFilter) && (ownerFilter === "all" || row.owner === ownerFilter) && matchesSearch(row, searchQuery)), [opportunities, ownerFilter, searchQuery, stageFilter, stateFilter, typeFilter]);
  const filteredAcres = useMemo(() => acres.filter((row) => (typeFilter === "all" || row.route_type === typeFilter) && (stateFilter === "all" || row.state === stateFilter) && (ownerFilter === "all" || row.owner === ownerFilter) && matchesSearch(row, searchQuery)), [acres, ownerFilter, searchQuery, stateFilter, typeFilter]);
  const filteredOperators = useMemo(() => operators.filter((row) => (typeFilter === "all" || row.operator_type === typeFilter) && (stageFilter === "all" || row.status === stageFilter) && (stateFilter === "all" || row.state === stateFilter) && (ownerFilter === "all" || row.owner === ownerFilter) && matchesSearch(row, searchQuery)), [operators, ownerFilter, searchQuery, stageFilter, stateFilter, typeFilter]);
  const filteredActivities = useMemo(() => activities.filter((row) => {
    const activityType = row.metadata?.lead_type || row.metadata?.opportunity_type || null;
    return (typeFilter === "all" || activityType === typeFilter) && (stageFilter === "all" || row.stage === stageFilter) && (stateFilter === "all" || row.state === stateFilter) && (ownerFilter === "all" || row.owner === ownerFilter) && matchesSearch(row, searchQuery);
  }), [activities, ownerFilter, searchQuery, stageFilter, stateFilter, typeFilter]);
  const filteredSequences = useMemo(() => dripSequences.filter((row) => (typeFilter === "all" || row.lead_type === typeFilter) && matchesSearch(row, searchQuery)), [dripSequences, searchQuery, typeFilter]);
  const filteredEnrollments = useMemo(() => dripEnrollments.filter((row) => (typeFilter === "all" || row.lead_type === typeFilter) && (stageFilter === "all" || row.status === stageFilter) && matchesSearch(row, searchQuery)), [dripEnrollments, searchQuery, stageFilter, typeFilter]);
  const filteredSends = useMemo(() => dripSends.filter((row) => (stageFilter === "all" || row.status === stageFilter) && matchesSearch(row, searchQuery)), [dripSends, searchQuery, stageFilter]);

  const growerLeads = useMemo(() => filteredLeads.filter((row) => row.lead_type === "grower"), [filteredLeads]);
  const hylioLeads = useMemo(() => filteredLeads.filter((row) => row.lead_type === "hylio"), [filteredLeads]);
  const hylioOpportunities = useMemo(() => filteredOpportunities.filter((row) => row.opportunity_type === "hylio_sale"), [filteredOpportunities]);
  const directOpportunities = useMemo(() => filteredOpportunities.filter((row) => row.route_type === "direct_hd"), [filteredOpportunities]);
  const routedOpportunities = useMemo(() => filteredOpportunities.filter((row) => row.route_type === "route_to_operator"), [filteredOpportunities]);
  const activeOperators = useMemo(() => filteredOperators.filter((row) => ["approved", "active", "qualified"].includes(row.status)), [filteredOperators]);
  const sequenceLookup = useMemo(() => dripSequences.reduce((acc, sequence) => {
    acc[sequence.id] = sequence;
    return acc;
  }, {}), [dripSequences]);
  const emailsBySequence = useMemo(() => dripEmails.reduce((acc, email) => {
    if (!acc[email.sequence_id]) acc[email.sequence_id] = [];
    acc[email.sequence_id].push(email);
    return acc;
  }, {}), [dripEmails]);
  const todayIso = useMemo(() => startOfTodayIso(), []);
  const weekIso = useMemo(() => startOfWeekIso(), []);
  const automationSummary = useMemo(() => {
    const activeEnrollments = dripEnrollments.filter((row) => row.status === "active").length;
    const completedEnrollments = dripEnrollments.filter((row) => row.status === "completed").length;
    const emailsSentToday = dripSends.filter((row) => ["sent", "delivered"].includes(row.status) && row.sent_at >= todayIso).length;
    const emailsSentWeek = dripSends.filter((row) => ["sent", "delivered"].includes(row.status) && row.sent_at >= weekIso).length;
    const failedSends = dripSends.filter((row) => row.status === "failed").length;
    const completionRate = dripEnrollments.length ? Math.round((completedEnrollments / dripEnrollments.length) * 100) : 0;

    return {
      activeEnrollments,
      completedEnrollments,
      emailsSentToday,
      emailsSentWeek,
      failedSends,
      completionRate,
    };
  }, [dripEnrollments, dripSends, todayIso, weekIso]);

  const stats = useMemo(() => ({
    accounts: filteredAccounts.length,
    contacts: filteredContacts.length,
    leads: filteredLeads.length,
    opportunities: filteredOpportunities.length,
    pipelineValue: filteredOpportunities.reduce((sum, row) => sum + Number(row.estimated_value ?? 0), 0),
    acresTracked: filteredAcres.reduce((sum, row) => sum + Number(row.acres ?? 0), 0),
    activeOperators: activeOperators.length,
    directOpportunities: directOpportunities.length,
    routedOpportunities: routedOpportunities.length,
    hylioPipeline: hylioOpportunities.reduce((sum, row) => sum + Number(row.estimated_value ?? 0), 0),
    automations: filteredEnrollments.length,
  }), [activeOperators.length, directOpportunities.length, filteredAccounts.length, filteredContacts.length, filteredLeads.length, filteredOpportunities, filteredAcres, hylioOpportunities, routedOpportunities.length]);

  const dashboardSummary = [
    { label: "Live demand engine", value: formatCompactNumber(stats.leads), detail: "Grower, operator, Hylio, and dealer demand entering one shared system." },
    { label: "Pipeline value", value: formatCurrency(stats.pipelineValue), detail: "Opportunity value visible across direct, routed, and high-ticket revenue streams." },
    { label: "Acres captured", value: formatCompactNumber(stats.acresTracked), detail: "Tracked acreage already feeding routing, operator assignment, and expansion logic." },
    { label: "Active operators", value: formatCompactNumber(stats.activeOperators), detail: "Qualified, approved, or active operator coverage available for routed demand." },
  ];

  const sectionCounts = {
    dashboard: stats.leads + stats.opportunities,
    leads: filteredLeads.length,
    opportunities: filteredOpportunities.length,
    operators: filteredOperators.length,
    growers: growerLeads.length,
    hylio: hylioLeads.length,
    activities: filteredActivities.length,
    accounts: filteredAccounts.length,
    acres: filteredAcres.length,
    automations: filteredEnrollments.length,
  };

  const crmSections = [
    { id: "dashboard", label: "Dashboard", description: "Executive operating view", count: sectionCounts.dashboard },
    { id: "leads", label: "Leads", description: "Demand intake and qualification", count: sectionCounts.leads },
    { id: "opportunities", label: "Opportunities", description: "Revenue paths and stages", count: sectionCounts.opportunities },
    { id: "operators", label: "Operators", description: "Capacity and territory coverage", count: sectionCounts.operators },
    { id: "growers", label: "Growers", description: "Direct service and acreage demand", count: sectionCounts.growers },
    { id: "hylio", label: "Hylio", description: "High-ticket drone pipeline", count: sectionCounts.hylio },
    { id: "activities", label: "Activities", description: "Calls, tasks, emails, texts", count: sectionCounts.activities },
    { id: "accounts", label: "Accounts", description: "Contacts and account records", count: sectionCounts.accounts },
    { id: "acres", label: "Acres", description: "Territory and assignment visibility", count: sectionCounts.acres },
    { id: "automations", label: "Automations", description: "Drip sequences and sends", count: sectionCounts.automations },
  ];

  async function toggleSequence(sequence) {
    setPendingSequenceId(sequence.id);
    setActionMessage(null);

    const { data, error } = await supabase
      .from("drip_sequences")
      .update({ is_active: !sequence.is_active, updated_at: new Date().toISOString() })
      .eq("id", sequence.id)
      .select("*")
      .single();

    if (error) {
      setActionMessage({
        tone: "error",
        text: error.message || `Unable to update ${sequence.name}.`,
      });
    }

    if (!error && data) {
      setDripSequences((current) => current.map((row) => (row.id === sequence.id ? data : row)));
      setActionMessage({
        tone: "success",
        text: `${data.name || "Sequence"} ${data.is_active ? "activated" : "deactivated"}.`,
      });
    }

    setPendingSequenceId("");
  }

  async function updateEnrollmentStatus(enrollment, status) {
    setPendingEnrollmentId(enrollment.id);
    setActionMessage(null);
    const updates = {
      status,
      updated_at: new Date().toISOString(),
      ...(status === "active" ? { next_send_at: enrollment.next_send_at || new Date().toISOString() } : {}),
      ...(status === "completed" ? { completed_at: new Date().toISOString() } : {}),
    };

    const { data, error } = await supabase
      .from("drip_enrollments")
      .update(updates)
      .eq("id", enrollment.id)
      .select("*")
      .single();

    if (error) {
      setActionMessage({
        tone: "error",
        text: error.message || "Unable to update enrollment status.",
      });
    }

    if (!error && data) {
      setDripEnrollments((current) => current.map((row) => (row.id === enrollment.id ? data : row)));
      setActionMessage({
        tone: "success",
        text: `${data.email || "Enrollment"} moved to ${formatCrmStageLabel(data.status)}.`,
      });
    }

    setPendingEnrollmentId("");
  }

  async function removeEnrollment(enrollment) {
    setPendingEnrollmentId(enrollment.id);
    setActionMessage(null);
    const { error } = await supabase.from("drip_enrollments").delete().eq("id", enrollment.id);

    if (error) {
      setActionMessage({
        tone: "error",
        text: error.message || "Unable to remove enrollment.",
      });
    }

    if (!error) {
      setDripEnrollments((current) => current.filter((row) => row.id !== enrollment.id));
      setActionMessage({
        tone: "success",
        text: `${enrollment.email || "Enrollment"} removed from automations.`,
      });
    }

    setPendingEnrollmentId("");
  }

  const leadsColumns = [
    {
      key: "lead_type",
      label: "Lead",
      render: (row) => <div className="crm-table-primary"><strong>{formatCrmTypeLabel(row.lead_type)}</strong><span>{row.source || "Website funnel"}</span></div>,
    },
    { key: "stage", label: "Stage", render: (row) => <span className={getBadgeTone(row.stage)}>{formatCrmStageLabel(row.stage)}</span> },
    { key: "route_type", label: "Route", render: (row) => <span className={getBadgeTone(row.route_type)}>{formatCrmTypeLabel(row.route_type)}</span> },
    { key: "state", label: "State" },
    { key: "acres", label: "Acres", render: (row) => formatNumber(row.acres) },
    { key: "owner", label: "Owner", render: (row) => row.owner || "Harvest Drone" },
    { key: "actions", label: "Actions", render: (row) => renderActionCell(setSelectedRecord, row) },
  ];

  const opportunitiesColumns = [
    {
      key: "opportunity_type",
      label: "Opportunity",
      render: (row) => <div className="crm-table-primary"><strong>{formatCrmTypeLabel(row.opportunity_type)}</strong><span>{row.revenue_stream || "Revenue path"} - {formatCrmTypeLabel(row.route_type)}</span></div>,
    },
    { key: "stage", label: "Stage", render: (row) => <span className={getBadgeTone(row.stage)}>{formatCrmStageLabel(row.stage)}</span> },
    { key: "state", label: "State" },
    { key: "estimated_value", label: "Value", render: (row) => formatCurrency(row.estimated_value) },
    { key: "owner", label: "Owner", render: (row) => row.owner || "Harvest Drone" },
    { key: "actions", label: "Actions", render: (row) => renderActionCell(setSelectedRecord, row) },
  ];

  const contactsColumns = [
    {
      key: "full_name",
      label: "Contact",
      render: (row) => <div className="crm-table-primary"><strong>{row.full_name}</strong><span>{row.email || row.mobile || "-"}</span></div>,
    },
    { key: "contact_type", label: "Type", render: (row) => <span className={getBadgeTone(row.contact_type)}>{formatCrmTypeLabel(row.contact_type)}</span> },
    { key: "state", label: "State" },
    { key: "owner", label: "Owner", render: (row) => row.owner || "Harvest Drone" },
    { key: "actions", label: "Actions", render: (row) => renderActionCell(setSelectedRecord, row) },
  ];

  const operatorsColumns = [
    {
      key: "operator_type",
      label: "Operator",
      render: (row) => <div className="crm-table-primary"><strong>{formatCrmTypeLabel(row.operator_type)}</strong><span>{row.counties_served || "County coverage not set"}</span></div>,
    },
    { key: "status", label: "Status", render: (row) => <span className={getBadgeTone(row.status)}>{formatCrmStageLabel(row.status)}</span> },
    { key: "state", label: "State" },
    { key: "acreage_capacity", label: "Capacity", render: (row) => formatNumber(row.acreage_capacity) },
    { key: "actions", label: "Actions", render: (row) => renderActionCell(setSelectedRecord, row) },
  ];

  const acresColumns = [
    { key: "acres", label: "Acres", render: (row) => formatNumber(row.acres) },
    { key: "crop_type", label: "Crop", render: (row) => row.crop_type || "-" },
    { key: "state", label: "State" },
    { key: "county", label: "County" },
    { key: "route_type", label: "Route", render: (row) => <span className={getBadgeTone(row.route_type)}>{formatCrmTypeLabel(row.route_type)}</span> },
    { key: "actions", label: "Actions", render: (row) => renderActionCell(setSelectedRecord, row) },
  ];

  const activityFeed = filteredActivities.slice(0, 12);
  const recentAccounts = filteredAccounts.slice(0, 6);

  const territoryRows = useMemo(() => {
    const stateMap = new Map();
    filteredAcres.forEach((row) => {
      const key = row.state || "Unknown";
      stateMap.set(key, (stateMap.get(key) || 0) + Number(row.acres ?? 0));
    });

    return [...stateMap.entries()].map(([state, acresValue]) => ({ state, acres: acresValue })).sort((left, right) => right.acres - left.acres).slice(0, 6);
  }, [filteredAcres]);

  function renderDashboard() {
    return (
      <div className="crm-view-stack">
        <section className="crm-hero card">
          <div className="crm-hero__copy">
            <span className="crm-hero__eyebrow">Dashboard</span>
            <h1>One clean operating view for demand, routing, operators, and revenue.</h1>
            <p>This is the working command center for Harvest Drone: direct grower demand, routed acreage, Hylio pipeline, operator capacity, and revenue-bearing opportunities in one place.</p>
          </div>
          <div className="crm-hero__rail">
            {dashboardSummary.map((item) => (
              <article key={item.label} className="crm-kpi-card crm-kpi-card--hero">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="crm-kpi-grid">
          <article className="crm-kpi-card card"><span>Leads</span><strong>{formatCompactNumber(stats.leads)}</strong><p>Total demand currently visible after filters.</p></article>
          <article className="crm-kpi-card card"><span>Direct opportunities</span><strong>{formatCompactNumber(stats.directOpportunities)}</strong><p>Revenue paths staying with Harvest Drone.</p></article>
          <article className="crm-kpi-card card"><span>Routed opportunities</span><strong>{formatCompactNumber(stats.routedOpportunities)}</strong><p>Opportunities better matched to operator coverage.</p></article>
          <article className="crm-kpi-card card"><span>Hylio pipeline</span><strong>{formatCurrency(stats.hylioPipeline)}</strong><p>High-ticket pipeline modeled inside the same CRM.</p></article>
        </section>

        <section className="crm-dashboard-grid">
          <article className="crm-card card">
            <div className="crm-card__header"><div><span className="crm-card__eyebrow">Pipeline summary</span><h3>Revenue mix by path</h3></div></div>
            <div className="crm-summary-list">
              <div className="crm-summary-list__item"><strong>{formatCompactNumber(stats.directOpportunities)}</strong><span>Direct opportunities</span></div>
              <div className="crm-summary-list__item"><strong>{formatCompactNumber(stats.routedOpportunities)}</strong><span>Routed opportunities</span></div>
              <div className="crm-summary-list__item"><strong>{formatCompactNumber(stats.activeOperators)}</strong><span>Active operator coverage</span></div>
              <div className="crm-summary-list__item"><strong>{formatCompactNumber(stats.acresTracked)}</strong><span>Tracked acres</span></div>
            </div>
          </article>

          <article className="crm-card card">
            <div className="crm-card__header"><div><span className="crm-card__eyebrow">Recent activity</span><h3>What the team is touching now</h3></div></div>
            <div className="crm-timeline-list">
              {activityFeed.length === 0 ? <div className="crm-empty-card">Activity will appear here as the CRM starts moving live records.</div> : activityFeed.map((activity) => (
                <button key={activity.id} type="button" className="crm-timeline-card" onClick={() => setSelectedRecord(activity)}>
                  <div><strong>{activity.subject || activity.activity_type}</strong><p>{activity.outcome || "Sales and routing activity logged in the CRM."}</p></div>
                  <span>{formatDateTime(activity.created_at)}</span>
                </button>
              ))}
            </div>
          </article>

          <article className="crm-card card">
            <div className="crm-card__header"><div><span className="crm-card__eyebrow">Opportunity flow</span><h3>Pipeline by stage</h3></div></div>
            <div className="crm-stage-summary">
              {OPPORTUNITY_BOARD_COLUMNS.map((column) => {
                const columnRows = filteredOpportunities.filter((row) => row.stage === column.id);
                const columnValue = columnRows.reduce((sum, row) => sum + Number(row.estimated_value ?? 0), 0);
                return <div key={column.id} className="crm-stage-summary__item"><span>{formatCrmStageLabel(column.id)}</span><strong>{columnRows.length}</strong><p>{formatCurrency(columnValue)}</p></div>;
              })}
            </div>
          </article>

          <article className="crm-card card">
            <div className="crm-card__header"><div><span className="crm-card__eyebrow">Operator availability</span><h3>Coverage that can close routed demand</h3></div></div>
            <div className="crm-mini-list">
              {activeOperators.length === 0 ? <div className="crm-empty-card">Approved and active operators will appear here as coverage grows.</div> : activeOperators.slice(0, 6).map((operator) => (
                <button key={operator.id} type="button" className="crm-mini-list__item" onClick={() => setSelectedRecord(operator)}>
                  <div><strong>{operator.state || "Open territory"}</strong><p>{operator.counties_served || "County coverage pending"}</p></div>
                  <span>{formatNumber(operator.acreage_capacity)}</span>
                </button>
              ))}
            </div>
          </article>
        </section>
      </div>
    );
  }

  function renderLeads() {
    return <div className="crm-view-stack"><section className="crm-section-header"><div><span className="crm-section-header__eyebrow">Leads</span><h2>Demand intake and routing qualification</h2><p>Every lead source in one place, with cleaner stages, route visibility, and faster inspection.</p></div></section><LeadTable title="Leads pipeline" columns={leadsColumns} rows={filteredLeads} countLabel="leads" emptyMessage="No leads match the current filters." getRowProps={(row) => ({ className: "table-row table-row--clickable", onClick: () => setSelectedRecord(row) })} /></div>;
  }

  function renderOpportunities() {
    return (
      <div className="crm-view-stack">
        <section className="crm-section-header crm-section-header--split">
          <div><span className="crm-section-header__eyebrow">Opportunities</span><h2>Pipeline built for revenue movement</h2><p>Switch between a board view for stage scanning and a table view for detailed pipeline management.</p></div>
          <div className="crm-toggle-group">
            <button type="button" className={`crm-toggle${opportunityView === "board" ? " is-active" : ""}`} onClick={() => setOpportunityView("board")}>Board</button>
            <button type="button" className={`crm-toggle${opportunityView === "table" ? " is-active" : ""}`} onClick={() => setOpportunityView("table")}>Table</button>
          </div>
        </section>
        {opportunityView === "board" ? <CrmPipelineBoard columns={OPPORTUNITY_BOARD_COLUMNS} rows={filteredOpportunities} onSelect={setSelectedRecord} /> : <LeadTable title="Opportunities table" columns={opportunitiesColumns} rows={filteredOpportunities} countLabel="opportunities" emptyMessage="No opportunities match the current filters." getRowProps={(row) => ({ className: "table-row table-row--clickable", onClick: () => setSelectedRecord(row) })} />}
      </div>
    );
  }

  function renderAccounts() {
    return (
      <div className="crm-view-stack">
        <section className="crm-section-header"><div><span className="crm-section-header__eyebrow">Accounts and contacts</span><h2>Clean records for people and entities</h2><p>Accounts give the business context. Contacts give the operator, grower, or buyer relationship context.</p></div></section>
        <section className="crm-dashboard-grid">
          <article className="crm-card card">
            <div className="crm-card__header"><div><span className="crm-card__eyebrow">Accounts</span><h3>Entity records</h3></div></div>
            <div className="crm-record-grid">
              {recentAccounts.length === 0 ? <div className="crm-empty-card">Accounts will appear here as lead intake syncs into CRM.</div> : recentAccounts.map((account) => (
                <button key={account.id} type="button" className="crm-record-card" onClick={() => setSelectedRecord(account)}>
                  <div className="crm-record-card__avatar">{getInitials(account.name)}</div>
                  <div><strong>{account.name}</strong><p>{formatCrmTypeLabel(account.account_type)} - {account.state || "No state"}</p></div>
                </button>
              ))}
            </div>
          </article>
          <LeadTable title="Contacts" columns={contactsColumns} rows={filteredContacts} countLabel="contacts" emptyMessage="No contacts match the current filters." getRowProps={(row) => ({ className: "table-row table-row--clickable", onClick: () => setSelectedRecord(row) })} />
        </section>
      </div>
    );
  }

  function renderActivities() {
    return (
      <div className="crm-view-stack">
        <section className="crm-section-header"><div><span className="crm-section-header__eyebrow">Activities</span><h2>Timeline of calls, emails, tasks, and sales movement</h2><p>A cleaner activity feed makes it obvious what happened, who owns it, and what needs follow-up.</p></div></section>
        <section className="crm-activity-timeline card">
          {filteredActivities.length === 0 ? <div className="crm-empty-card">No activities match the current filters.</div> : filteredActivities.map((activity) => (
            <button key={activity.id} type="button" className="crm-activity-item" onClick={() => setSelectedRecord(activity)}>
              <div className="crm-activity-item__rail" />
              <div className="crm-activity-item__copy">
                <div className="crm-activity-item__top"><strong>{activity.subject || activity.activity_type}</strong><span className={getBadgeTone(activity.stage)}>{formatCrmStageLabel(activity.stage)}</span></div>
                <p>{activity.outcome || "Activity logged in CRM."}</p>
                <small>{activity.owner || "Harvest Drone"} - {activity.state || "No state"} - {formatDateTime(activity.created_at)}</small>
              </div>
            </button>
          ))}
        </section>
      </div>
    );
  }

  function renderOperators() {
    return (
      <div className="crm-view-stack">
        <section className="crm-section-header"><div><span className="crm-section-header__eyebrow">Operators</span><h2>Coverage, counties, and capacity in one view</h2><p>See who can fulfill routed demand, where they serve, and how much acreage they can support.</p></div></section>
        <section className="crm-dashboard-grid">
          <article className="crm-card card">
            <div className="crm-card__header"><div><span className="crm-card__eyebrow">Operator cards</span><h3>Fast visual scan</h3></div></div>
            <div className="crm-record-grid">
              {filteredOperators.length === 0 ? <div className="crm-empty-card">Operators will appear here as operator and Hylio leads are qualified.</div> : filteredOperators.slice(0, 8).map((operator) => (
                <button key={operator.id} type="button" className="crm-operator-card" onClick={() => setSelectedRecord(operator)}>
                  <div className="crm-operator-card__top"><strong>{operator.state || "Open territory"}</strong><span className={getBadgeTone(operator.status)}>{formatCrmStageLabel(operator.status)}</span></div>
                  <p>{operator.counties_served || "Coverage still being defined."}</p>
                  <div className="crm-operator-card__meta"><span>{formatCrmTypeLabel(operator.operator_type)}</span><span>{formatNumber(operator.acreage_capacity)} acres</span></div>
                </button>
              ))}
            </div>
          </article>
          <LeadTable title="Operator table" columns={operatorsColumns} rows={filteredOperators} countLabel="operators" emptyMessage="No operators match the current filters." getRowProps={(row) => ({ className: "table-row table-row--clickable", onClick: () => setSelectedRecord(row) })} />
        </section>
      </div>
    );
  }

  function renderGrowers() {
    return (
      <div className="crm-view-stack">
        <section className="crm-section-header"><div><span className="crm-section-header__eyebrow">Growers</span><h2>Direct grower demand and acreage opportunity</h2><p>Keep retail revenue visible while still seeing which accounts are better served through routed coverage.</p></div></section>
        <section className="crm-kpi-grid crm-kpi-grid--mini">
          <article className="crm-kpi-card card"><span>Grower leads</span><strong>{formatCompactNumber(growerLeads.length)}</strong><p>Retail demand currently inside the system.</p></article>
          <article className="crm-kpi-card card"><span>Direct pipeline</span><strong>{formatCompactNumber(directOpportunities.filter((row) => row.opportunity_type === "grower_direct").length)}</strong><p>Grower opportunities staying direct with Harvest Drone.</p></article>
          <article className="crm-kpi-card card"><span>Tracked acres</span><strong>{formatCompactNumber(filteredAcres.reduce((sum, row) => sum + Number(row.acres ?? 0), 0))}</strong><p>Acreage now visible in the CRM.</p></article>
        </section>
        <LeadTable title="Grower leads" columns={leadsColumns} rows={growerLeads} countLabel="grower leads" emptyMessage="No grower leads match the current filters." getRowProps={(row) => ({ className: "table-row table-row--clickable", onClick: () => setSelectedRecord(row) })} />
      </div>
    );
  }

  function renderHylio() {
    return (
      <div className="crm-view-stack">
        <section className="crm-section-header"><div><span className="crm-section-header__eyebrow">Hylio</span><h2>High-ticket pipeline with qualification context</h2><p>Budget, experience level, and area qualification stay visible so the sales motion feels closer to a real deal desk.</p></div></section>
        <section className="crm-kpi-grid crm-kpi-grid--mini">
          <article className="crm-kpi-card card"><span>Hylio leads</span><strong>{formatCompactNumber(hylioLeads.length)}</strong><p>High-ticket leads now in active review.</p></article>
          <article className="crm-kpi-card card"><span>Hylio pipeline</span><strong>{formatCurrency(stats.hylioPipeline)}</strong><p>Modeled value currently inside the sales funnel.</p></article>
          <article className="crm-kpi-card card"><span>Area-qualified deals</span><strong>{formatCompactNumber(hylioOpportunities.filter((row) => row.hylio_area_qualified).length)}</strong><p>Opportunities already marked as area-qualified.</p></article>
        </section>
        <LeadTable title="Hylio opportunities" columns={opportunitiesColumns} rows={hylioOpportunities} countLabel="Hylio opportunities" emptyMessage="No Hylio opportunities match the current filters." getRowProps={(row) => ({ className: "table-row table-row--clickable", onClick: () => setSelectedRecord(row) })} />
      </div>
    );
  }

  function renderAcresView() {
    return (
      <div className="crm-view-stack">
        <section className="crm-section-header"><div><span className="crm-section-header__eyebrow">Acres</span><h2>Territory visibility for routing and operator fit</h2><p>Track acreage totals, route mix, and where the next assignment opportunities are accumulating.</p></div></section>
        <section className="crm-dashboard-grid">
          <article className="crm-card card">
            <div className="crm-card__header"><div><span className="crm-card__eyebrow">State concentration</span><h3>Top acreage states</h3></div></div>
            <div className="crm-mini-list">
              {territoryRows.length === 0 ? <div className="crm-empty-card">Acre concentration will appear here as territory data grows.</div> : territoryRows.map((row) => (
                <div key={row.state} className="crm-mini-list__item crm-mini-list__item--static"><div><strong>{row.state}</strong><p>Tracked acreage in CRM</p></div><span>{formatNumber(row.acres)}</span></div>
              ))}
            </div>
          </article>
          <LeadTable title="Acre records" columns={acresColumns} rows={filteredAcres} countLabel="acre records" emptyMessage="No acre records match the current filters." getRowProps={(row) => ({ className: "table-row table-row--clickable", onClick: () => setSelectedRecord(row) })} />
        </section>
      </div>
    );
  }

  function renderAutomations() {
    const enrollmentColumns = [
      {
        key: "lead",
        label: "Lead",
        render: (row) => (
          <div className="crm-table-primary">
            <strong>{row.first_name || "Lead"}</strong>
            <span>{row.email}</span>
          </div>
        ),
      },
      {
        key: "sequence",
        label: "Sequence",
        render: (row) => sequenceLookup[row.sequence_id]?.name || "Unknown sequence",
      },
      {
        key: "step",
        label: "Current step",
        render: (row) => {
          const totalSteps = emailsBySequence[row.sequence_id]?.length || 0;
          return `${row.current_step || 0} / ${totalSteps}`;
        },
      },
      {
        key: "status",
        label: "Status",
        render: (row) => <span className={getBadgeTone(row.status)}>{formatCrmStageLabel(row.status)}</span>,
      },
      {
        key: "next_send_at",
        label: "Next send",
        render: (row) => formatDateTime(row.next_send_at),
      },
      {
        key: "actions",
        label: "Actions",
        render: (row) => (
            <div className="inline-actions">
              {row.status === "active" ? (
              <button type="button" className="button button--secondary button--small" disabled={pendingEnrollmentId === row.id} onClick={(event) => {
                event.stopPropagation();
                updateEnrollmentStatus(row, "paused");
              }}>
                Pause
              </button>
            ) : (
              <button type="button" className="button button--secondary button--small" disabled={pendingEnrollmentId === row.id} onClick={(event) => {
                event.stopPropagation();
                updateEnrollmentStatus(row, "active");
              }}>
                Resume
              </button>
            )}
            <button type="button" className="button button--secondary button--small" disabled={pendingEnrollmentId === row.id} onClick={(event) => {
              event.stopPropagation();
              removeEnrollment(row);
            }}>
              Remove
            </button>
          </div>
        ),
      },
    ];

    return (
      <div className="crm-view-stack">
        <section className="crm-section-header">
          <div>
            <span className="crm-section-header__eyebrow">Automations</span>
            <h2>Drip sequences, enrollments, and send performance</h2>
            <p>Monitor sequence health, enrollment progress, and recent email delivery from one workspace.</p>
          </div>
        </section>

        <section className="crm-kpi-grid crm-kpi-grid--mini">
          <article className="crm-kpi-card card"><span>Active enrollments</span><strong>{formatCompactNumber(automationSummary.activeEnrollments)}</strong><p>Contacts currently moving through live sequences.</p></article>
          <article className="crm-kpi-card card"><span>Emails sent</span><strong>{formatCompactNumber(automationSummary.emailsSentToday)}</strong><p>{automationSummary.emailsSentWeek} sent this week.</p></article>
          <article className="crm-kpi-card card"><span>Completion rate</span><strong>{automationSummary.completionRate}%</strong><p>{automationSummary.completedEnrollments} completed enrollments so far.</p></article>
          <article className="crm-kpi-card card"><span>Failed sends</span><strong>{formatCompactNumber(automationSummary.failedSends)}</strong><p>Recent sends marked failed in drip history.</p></article>
        </section>

        <section className="crm-dashboard-grid">
          <article className="crm-card card">
            <div className="crm-card__header">
              <div>
                <span className="crm-card__eyebrow">Sequences</span>
                <h3>Live automation programs</h3>
              </div>
            </div>
            <div className="crm-mini-list">
              {filteredSequences.length === 0 ? (
                <div className="crm-empty-card">No sequences match the current filters.</div>
              ) : (
                filteredSequences.map((sequence) => {
                  const sequenceEnrollments = dripEnrollments.filter((row) => row.sequence_id === sequence.id);
                  const activeCount = sequenceEnrollments.filter((row) => row.status === "active").length;
                  const completedCount = sequenceEnrollments.filter((row) => row.status === "completed").length;
                  const steps = emailsBySequence[sequence.id] || [];
                  const isExpanded = Boolean(expandedSequences[sequence.id]);

                  return (
                    <div key={sequence.id} className="crm-subcard">
                      <div className="crm-subcard__header">
                        <div>
                          <strong>{sequence.name}</strong>
                          <p>{sequence.description || "Automation sequence"}</p>
                        </div>
                        <span className={getBadgeTone(sequence.lead_type)}>{formatCrmTypeLabel(sequence.lead_type)}</span>
                      </div>
                      <div className="crm-summary-list">
                        <div className="crm-summary-list__item"><strong>{activeCount}</strong><span>Active</span></div>
                        <div className="crm-summary-list__item"><strong>{completedCount}</strong><span>Completed</span></div>
                      </div>
                      <div className="inline-actions" style={{ marginTop: "1rem" }}>
                        <button type="button" className="button button--secondary button--small" disabled={pendingSequenceId === sequence.id} onClick={() => toggleSequence(sequence)}>
                          {sequence.is_active ? "Deactivate" : "Activate"}
                        </button>
                        <button type="button" className="button button--secondary button--small" onClick={() => setExpandedSequences((current) => ({ ...current, [sequence.id]: !current[sequence.id] }))}>
                          {isExpanded ? "Hide steps" : "Show steps"}
                        </button>
                      </div>
                      {isExpanded ? (
                        <div className="crm-timeline" style={{ marginTop: "1rem" }}>
                          {steps.length === 0 ? (
                            <div className="crm-empty-card">No active email steps for this sequence yet.</div>
                          ) : (
                            steps.map((step) => (
                              <div key={step.id} className="crm-timeline__item">
                                <div className="crm-timeline__topline">
                                  <span className="crm-timeline__state">Step {step.step_number}</span>
                                  <span className="table-subtle">Delay {step.delay_days} day(s)</span>
                                </div>
                                <strong>{step.subject}</strong>
                                <p>{step.body_text || "HTML email body configured."}</p>
                              </div>
                            ))
                          )}
                        </div>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          </article>

          <article className="crm-card card">
            <div className="crm-card__header">
              <div>
                <span className="crm-card__eyebrow">Recent sends</span>
                <h3>Last 20 delivery attempts</h3>
              </div>
            </div>
            <div className="crm-timeline-list">
              {filteredSends.length === 0 ? (
                <div className="crm-empty-card">No drip sends recorded yet.</div>
              ) : (
                filteredSends.slice(0, 20).map((send) => (
                  <div key={send.id} className="crm-timeline-card">
                    <div>
                      <strong>{send.to_email}</strong>
                      <p>{send.subject}</p>
                    </div>
                    <div className="inline-actions--stacked">
                      <span className={getBadgeTone(send.status)}>{formatCrmStageLabel(send.status)}</span>
                      <span className="table-subtle">{formatDateTime(send.sent_at)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>

        <LeadTable
          title="Enrollments"
          columns={enrollmentColumns}
          rows={filteredEnrollments}
          countLabel="enrollments"
          emptyMessage="No enrollments match the current filters."
        />
      </div>
    );
  }

  function renderSection() {
    switch (activeSection) {
      case "leads": return renderLeads();
      case "opportunities": return renderOpportunities();
      case "operators": return renderOperators();
      case "growers": return renderGrowers();
      case "hylio": return renderHylio();
      case "activities": return renderActivities();
      case "accounts": return renderAccounts();
      case "acres": return renderAcresView();
      case "automations": return renderAutomations();
      case "dashboard":
      default: return renderDashboard();
    }
  }

  return (
    <Shell compact>
      <div className="crm-workspace">
        <CrmSidebar sections={crmSections} activeSection={activeSection} onSelect={setActiveSection} />
        <div className="crm-main">
          <header className="crm-topbar card">
            <div>
              <span className="crm-topbar__eyebrow">Operating workspace</span>
              <h2>{crmSections.find((section) => section.id === activeSection)?.label || "CRM"}</h2>
              <p>Designed to manage growers, operators, Hylio sales, accounts, acres, and the revenue routes between them.</p>
            </div>
            <div className="crm-topbar__meta">
              <div className="crm-topbar__meta-item"><span>Pipeline</span><strong>{formatCurrency(stats.pipelineValue)}</strong></div>
              <div className="crm-topbar__meta-item"><span>Acres</span><strong>{formatCompactNumber(stats.acresTracked)}</strong></div>
            </div>
          </header>

          <CrmFilters
            searchQuery={searchQuery}
            typeFilter={typeFilter}
            stageFilter={stageFilter}
            stateFilter={stateFilter}
            ownerFilter={ownerFilter}
            typeOptions={typeOptions}
            stageOptions={stageOptions}
            stateOptions={stateOptions}
            ownerOptions={ownerOptions}
            onSearchChange={setSearchQuery}
            onTypeChange={setTypeFilter}
            onStageChange={setStageFilter}
            onStateChange={setStateFilter}
            onOwnerChange={setOwnerFilter}
          />

          {isLoading ? <section className="card crm-loading-state">Loading CRM data...</section> : null}
          {errorMessage ? <section className="card crm-loading-state">Supabase error: {errorMessage}</section> : null}
          {actionMessage ? (
            <section className={`card crm-loading-state${actionMessage.tone === "error" ? " crm-loading-state--error" : ""}`}>
              {actionMessage.text}
            </section>
          ) : null}
          {!isLoading && !errorMessage ? renderSection() : null}
        </div>
      </div>

      <CrmDetailPanel record={selectedRecord} onClose={() => setSelectedRecord(null)} />
    </Shell>
  );
}

export default CrmPage;

