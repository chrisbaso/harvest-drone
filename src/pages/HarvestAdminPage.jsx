import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getHarvestAdminData, downloadHarvestLeadsCsv } from "../lib/harvestApi";
import { formatCrops, formatDateLabel } from "../../shared/harvestLeadEngine";
import { usePageMeta } from "../lib/pageMeta";
import Shell from "../components/Shell";
import LeadTable from "../components/LeadTable";
import "../styles/harvest-admin.css";

function isWithinRange(value, fromDate, toDate) {
  if (!value) {
    return !fromDate && !toDate;
  }

  const target = new Date(value).getTime();

  if (fromDate && target < new Date(fromDate).getTime()) {
    return false;
  }

  if (toDate) {
    const inclusiveEnd = new Date(toDate);
    inclusiveEnd.setHours(23, 59, 59, 999);

    if (target > inclusiveEnd.getTime()) {
      return false;
    }
  }

  return true;
}

function HarvestAdminPage() {
  const navigate = useNavigate();
  const [leadData, setLeadData] = useState({ leads: [], mode: "server" });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [filters, setFilters] = useState({
    tier: "all",
    status: "all",
    state: "all",
    crop: "all",
    acreageRange: "all",
    campaign: "",
    fromDate: "",
    toDate: "",
  });

  usePageMeta({
    title: "Harvest Drone Admin",
    description:
      "Internal Harvest Drone lead dashboard for SOURCE fit checks, scoring, routing, and follow-up.",
  });

  useEffect(() => {
    let isMounted = true;

    async function loadLeads() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const result = await getHarvestAdminData();

        if (isMounted) {
          setLeadData(result);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || "Unable to load Harvest Drone leads.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadLeads();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredLeads = useMemo(() => {
    return (leadData.leads || []).filter((lead) => {
      const cropMatch =
        filters.crop === "all" ||
        (Array.isArray(lead.crops) && lead.crops.includes(filters.crop));
      const campaignBlob = [
        lead.campaign,
        lead.utm_campaign,
        lead.utm_source,
        lead.utm_medium,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (filters.tier === "all" || lead.lead_tier === filters.tier) &&
        (filters.status === "all" || lead.status === filters.status) &&
        (filters.state === "all" || lead.state === filters.state) &&
        cropMatch &&
        (filters.acreageRange === "all" || lead.acreage_range === filters.acreageRange) &&
        isWithinRange(lead.created_at, filters.fromDate, filters.toDate) &&
        (!filters.campaign || campaignBlob.includes(filters.campaign.toLowerCase()))
      );
    });
  }, [filters, leadData.leads]);

  const summary = useMemo(() => {
    const total = filteredLeads.length;
    const hotLeads = filteredLeads.filter((lead) => lead.lead_tier === "Hot").length;
    const warmLeads = filteredLeads.filter((lead) => lead.lead_tier === "Warm").length;
    const nurtureLeads = filteredLeads.filter((lead) => lead.lead_tier === "Nurture").length;
    const lowFitLeads = filteredLeads.filter((lead) => lead.lead_tier === "Low Fit").length;
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const leadsThisWeek = filteredLeads.filter((lead) => new Date(lead.created_at).getTime() >= weekAgo).length;
    const averageScore = total
      ? Math.round(filteredLeads.reduce((sum, lead) => sum + Number(lead.lead_score || 0), 0) / total)
      : 0;
    const estimatedAcres = filteredLeads.reduce((sum, lead) => sum + Number(lead.estimated_acres || 0), 0);

    return [
      { label: "Total leads", value: total },
      { label: "Hot leads", value: hotLeads },
      { label: "Warm leads", value: warmLeads },
      { label: "Nurture leads", value: nurtureLeads },
      { label: "Low-fit leads", value: lowFitLeads },
      { label: "Leads this week", value: leadsThisWeek },
      { label: "Average score", value: averageScore },
      { label: "Estimated acres represented", value: estimatedAcres.toLocaleString("en-US") },
    ];
  }, [filteredLeads]);

  const states = useMemo(
    () => [...new Set((leadData.leads || []).map((lead) => lead.state).filter(Boolean))].sort(),
    [leadData.leads],
  );

  const crops = useMemo(
    () =>
      [...new Set((leadData.leads || []).flatMap((lead) => lead.crops || []).filter(Boolean))].sort(),
    [leadData.leads],
  );

  const columns = [
    {
      key: "created_at",
      label: "Created date",
      render: (lead) => formatDateLabel(lead.created_at),
    },
    {
      key: "name",
      label: "Name",
      render: (lead) => `${lead.first_name || ""} ${lead.last_name || ""}`.trim() || lead.email,
    },
    {
      key: "farm_name",
      label: "Farm",
      render: (lead) => lead.farm_name || "-",
    },
    {
      key: "location",
      label: "State/county",
      render: (lead) => [lead.state, lead.county].filter(Boolean).join(" / ") || "-",
    },
    {
      key: "acreage_range",
      label: "Acres",
    },
    {
      key: "crops",
      label: "Crops",
      render: (lead) => formatCrops(lead.crops),
    },
    {
      key: "lead_score",
      label: "Score",
    },
    {
      key: "lead_tier",
      label: "Tier",
    },
    {
      key: "decision_timing",
      label: "Timing",
    },
    {
      key: "preferred_contact_method",
      label: "Preferred contact",
    },
    {
      key: "status",
      label: "Status",
    },
    {
      key: "actions",
      label: "Lead detail",
      render: (lead) => (
        <Link className="button button--secondary button--small" to={`/admin/leads/${lead.id}`}>
          Open
        </Link>
      ),
    },
  ];

  return (
    <Shell compact>
      <section className="section harvest-admin">
        <div className="harvest-admin__header">
          <div>
            <span className="eyebrow">Internal dashboard</span>
            <h1>Harvest Drone lead engine</h1>
            <p>
              See who is worth calling first, why they matter, and what next step the SOURCE
              funnel recommends.
            </p>
          </div>
          <div className="harvest-admin__header-actions">
            <button
              type="button"
              className="button button--secondary"
              onClick={() => downloadHarvestLeadsCsv(filteredLeads)}
            >
              Export CSV
            </button>
            <span className="harvest-admin__mode-pill">
              {leadData.mode === "local" ? "Local mock mode" : "Supabase mode"}
            </span>
          </div>
        </div>

        <div className="harvest-admin__summary-grid">
          {summary.map((card) => (
            <article className="harvest-admin__summary-card card" key={card.label}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </article>
          ))}
        </div>

        <div className="harvest-admin__filters card">
          <div className="harvest-admin__filters-header">
            <div>
              <strong>Filter the queue</strong>
              <p>Sort by fit, geography, timing, and campaign source.</p>
            </div>
            <button
              type="button"
              className="button button--secondary button--small"
              onClick={() =>
                setFilters({
                  tier: "all",
                  status: "all",
                  state: "all",
                  crop: "all",
                  acreageRange: "all",
                  campaign: "",
                  fromDate: "",
                  toDate: "",
                })
              }
            >
              Clear filters
            </button>
          </div>
          <div className="harvest-admin__filters-grid">
            <select value={filters.tier} onChange={(event) => setFilters((current) => ({ ...current, tier: event.target.value }))}>
              <option value="all">All tiers</option>
              <option value="Hot">Hot</option>
              <option value="Warm">Warm</option>
              <option value="Nurture">Nurture</option>
              <option value="Low Fit">Low Fit</option>
            </select>
            <input
              value={filters.campaign}
              onChange={(event) => setFilters((current) => ({ ...current, campaign: event.target.value }))}
              placeholder="Campaign or UTM"
            />
            <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
              <option value="all">All statuses</option>
              {["New", "Contacted", "Qualified", "Proposal / Plan Sent", "Won", "Lost", "Nurture", "Bad Fit"].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <select value={filters.state} onChange={(event) => setFilters((current) => ({ ...current, state: event.target.value }))}>
              <option value="all">All states</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            <select value={filters.crop} onChange={(event) => setFilters((current) => ({ ...current, crop: event.target.value }))}>
              <option value="all">All crops</option>
              {crops.map((crop) => (
                <option key={crop} value={crop}>
                  {crop}
                </option>
              ))}
            </select>
            <select value={filters.acreageRange} onChange={(event) => setFilters((current) => ({ ...current, acreageRange: event.target.value }))}>
              <option value="all">All acreage ranges</option>
              {["Under 500", "500-999", "1,000-2,499", "2,500-4,999", "5,000+"].map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
            <input type="date" value={filters.fromDate} onChange={(event) => setFilters((current) => ({ ...current, fromDate: event.target.value }))} />
            <input type="date" value={filters.toDate} onChange={(event) => setFilters((current) => ({ ...current, toDate: event.target.value }))} />
          </div>
        </div>

        {isLoading ? <div className="card harvest-admin__empty">Loading Harvest Drone leads...</div> : null}
        {errorMessage ? <div className="card harvest-admin__empty">{errorMessage}</div> : null}

        {!isLoading && !errorMessage ? (
          <LeadTable
            title="Qualified lead queue"
            columns={columns}
            rows={filteredLeads}
            countLabel="leads"
            emptyMessage="No Harvest Drone leads match the current filters."
            getRowProps={(lead) => ({
              onClick: () => navigate(`/admin/leads/${lead.id}`),
            })}
          />
        ) : null}
      </section>
    </Shell>
  );
}

export default HarvestAdminPage;
