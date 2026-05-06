import { Link } from "react-router-dom";
import Shell from "../components/Shell";
import {
  WEEKLY_BRIEF_SECTIONS,
  generateWeeklyLeadershipBrief,
} from "../../shared/operatingBriefs";
import { usePageMeta } from "../lib/pageMeta";
import "../styles/harvest-admin.css";

const demoBrief = generateWeeklyLeadershipBrief(new Date(), {
  revenuePipeline: [
    { title: "SOURCE acre review pipeline", value: "Qualified lead flow", status: "watching" },
    { title: "RDO enterprise division opportunity", value: "Demo / blueprint stage", status: "active" },
  ],
  jobsScheduled: [
    { title: "Jobber remains source of truth", status: "Connect sync before using live jobs" },
  ],
  quotesPending: [
    { title: "Quotes pending follow-up", status: "Use Jobber sync and open loops for live queue" },
  ],
  openLoops: [
    { title: "Daily Ops open loops", priority: "high", summary: "Review /admin/open-loops before leadership review." },
  ],
  rdoEnterpriseProgress: [
    { title: "RDO demo path", status: "watching", summary: "Division, blueprint, readiness, fleet, operators, support, and performance views are available." },
  ],
  sourceInputOpportunities: [
    { title: "SOURCE/Input ROI module", status: "testing", summary: "Future profit-center module tied to acre review and application timing." },
  ],
  equipmentMaintenanceIssues: [
    { title: "Fleet readiness blockers", priority: "normal", summary: "Use enterprise fleet and support queues until live maintenance tables are connected." },
  ],
  invoicesAccountingFollowUp: [
    { title: "Completed jobs not invoiced", status: "placeholder", summary: "Jobber and QuickBooks sync are required for live accounting follow-up." },
  ],
  topStrategicPriorities: [
    "Finish live Jobber/Twilio/Google configuration without exposing credentials.",
    "Use RDO demo to validate the enterprise drone division narrative.",
    "Keep Harvest OS focused on drone/ag intelligence, not generic CRM or accounting.",
  ],
  decisionsNeeded: [
    "Choose who owns Google Workspace OAuth setup.",
    "Choose which P1 RDO demo story gets used in the next sales conversation.",
  ],
});

function renderItem(item) {
  if (typeof item === "string") {
    return <p>{item}</p>;
  }

  return (
    <>
      <strong>{item.title || item.label || "Review item"}</strong>
      <p>{[item.value, item.status, item.summary].filter(Boolean).join(" | ")}</p>
    </>
  );
}

function WeeklyBriefPage() {
  usePageMeta({
    title: "Harvest Weekly Leadership Brief",
    description: "Weekly operating review for Harvest Drone leadership priorities, RDO, revenue, and blockers.",
  });

  return (
    <Shell compact>
      <section className="section harvest-admin weekly-brief">
        <div className="harvest-admin__header">
          <div>
            <span className="eyebrow">Leadership rhythm</span>
            <h1>Weekly leadership brief</h1>
            <p>
              A strategic operating review across revenue, jobs, quotes, open loops, RDO progress,
              SOURCE/input opportunities, maintenance, accounting follow-up, priorities, and decisions.
            </p>
          </div>
          <div className="harvest-admin__header-actions">
            <Link className="button button--secondary" to="/admin/daily-ops">
              Daily Ops
            </Link>
            <Link className="button button--secondary" to="/admin/open-loops">
              Open loops
            </Link>
            <Link className="button button--secondary" to="/enterprise/rdo/division">
              RDO demo
            </Link>
          </div>
        </div>

        <div className="harvest-admin__summary-grid">
          <article className="harvest-admin__summary-card card">
            <span>Week starts</span>
            <strong>{demoBrief.weekStart}</strong>
          </article>
          <article className="harvest-admin__summary-card card">
            <span>Sections</span>
            <strong>{WEEKLY_BRIEF_SECTIONS.length}</strong>
          </article>
          <article className="harvest-admin__summary-card card">
            <span>Focus items</span>
            <strong>{demoBrief.recommendedFocus.length}</strong>
          </article>
        </div>

        <article className="card harvest-admin__ops-panel">
          <span className="eyebrow">Recommended focus</span>
          <h2>Leadership attention this week</h2>
          <div className="operating-brief-list">
            {demoBrief.recommendedFocus.map((item) => (
              <div className="operating-brief-row" key={item}>
                <strong>{item}</strong>
              </div>
            ))}
          </div>
        </article>

        <div className="daily-ops-sections">
          {demoBrief.sectionMeta.map((section) => {
            const items = demoBrief.sections[section.key] || [];

            return (
              <article className="card harvest-admin__ops-panel" key={section.key}>
                <span className="eyebrow">{section.label}</span>
                <h2>{items.length ? `${items.length} item${items.length === 1 ? "" : "s"}` : "Placeholder"}</h2>
                <div className="operating-brief-list">
                  {items.length ? (
                    items.map((item, index) => (
                      <div className="operating-brief-row" key={`${section.key}-${index}`}>
                        {renderItem(item)}
                      </div>
                    ))
                  ) : (
                    <p className="table-subtle">{section.empty}</p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </Shell>
  );
}

export default WeeklyBriefPage;
