import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getHarvestAdminData, downloadHarvestLeadsCsv } from "../lib/harvestApi";
import { formatCrops, formatDateLabel } from "../../shared/harvestLeadEngine";
import { buildRevenueCommandCenter } from "../../shared/revenueOps";
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

  const revenueCommandCenter = useMemo(
    () => buildRevenueCommandCenter(filteredLeads),
    [filteredLeads],
  );

  const summary = useMemo(() => {
    const total = filteredLeads.length;
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const leadsThisWeek = filteredLeads.filter((lead) => new Date(lead.created_at).getTime() >= weekAgo).length;
    const averageScore = total
      ? Math.round(filteredLeads.reduce((sum, lead) => sum + Number(lead.lead_score || 0), 0) / total)
      : 0;
    const metrics = revenueCommandCenter.metrics;

    return [
      { label: "Qualified acres", value: metrics.qualifiedAcres.toLocaleString("en-US") },
      { label: "Hot acres", value: metrics.hotAcres.toLocaleString("en-US") },
      { label: "Proposal acres", value: metrics.proposalAcres.toLocaleString("en-US") },
      { label: "Won acres", value: metrics.wonAcres.toLocaleString("en-US") },
      {
        label: "Pipeline value",
        value: metrics.pipelineValue.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }),
      },
      {
        label: "Actual revenue",
        value: metrics.actualRevenue.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }),
      },
      { label: "Hot SLA risk", value: metrics.hotLeadsAtRisk },
      { label: "Total leads", value: metrics.totalLeads },
      { label: "Leads this week", value: leadsThisWeek },
      { label: "Average score", value: averageScore },
    ];
  }, [filteredLeads, revenueCommandCenter.metrics]);

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
      key: "estimated_acres",
      label: "Est. acres",
      render: (lead) => Number(lead.estimated_acres || 0).toLocaleString("en-US"),
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
      key: "revenue_status",
      label: "Revenue",
      render: (lead) => lead.revenue_status || "unconfirmed",
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
              Run the SOURCE pipeline by qualified acres, hot-lead response risk, dealer
              attribution, and confirmed revenue.
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

        <div className="harvest-admin__ops-grid">
          <article className="card harvest-admin__ops-panel">
            <div className="harvest-admin__ops-header">
              <div>
                <span className="eyebrow">Follow-up SLA</span>
                <h2>Hot leads that need action</h2>
              </div>
              <strong>{revenueCommandCenter.hotLeadSla.length}</strong>
            </div>
            <div className="harvest-admin__ops-list">
              {revenueCommandCenter.hotLeadSla.length ? (
                revenueCommandCenter.hotLeadSla.slice(0, 5).map((lead) => (
                  <div className="harvest-admin__ops-row" key={lead.id}>
                    <div>
                      <strong>{lead.displayName}</strong>
                      <span>{`${lead.farmName} | ${lead.estimatedAcres.toLocaleString("en-US")} acres | ${lead.hoursOpen}h open`}</span>
                    </div>
                    <Link className="button button--secondary button--small" to={`/admin/leads/${lead.id}`}>
                      Open
                    </Link>
                  </div>
                ))
              ) : (
                <p className="table-subtle">No hot leads are past the 24-hour first-touch window.</p>
              )}
            </div>
          </article>

          <article className="card harvest-admin__ops-panel">
            <div className="harvest-admin__ops-header">
              <div>
                <span className="eyebrow">Dealer attribution</span>
                <h2>Channels creating qualified acres</h2>
              </div>
            </div>
            <div className="harvest-admin__dealer-table">
              <div className="harvest-admin__dealer-head">
                <span>Dealer</span>
                <span>Leads</span>
                <span>Qualified acres</span>
                <span>Won revenue</span>
              </div>
              {revenueCommandCenter.dealerLeaderboard.length ? (
                revenueCommandCenter.dealerLeaderboard.slice(0, 6).map((dealer) => (
                  <div className="harvest-admin__dealer-row" key={dealer.dealerSlug}>
                    <strong>{dealer.label}</strong>
                    <span>{`${dealer.leads} / ${dealer.hotLeads} hot`}</span>
                    <span>{dealer.qualifiedAcres.toLocaleString("en-US")}</span>
                    <span>{dealer.actualRevenue.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</span>
                  </div>
                ))
              ) : (
                <p className="table-subtle">No dealer-attributed leads match the current filters.</p>
              )}
            </div>
          </article>
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
