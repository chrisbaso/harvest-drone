import { Link } from "react-router-dom";
import Shell from "../components/Shell";
import { getProfitCenterScoreboard } from "../../shared/operatingBriefs";
import { usePageMeta } from "../lib/pageMeta";
import "../styles/harvest-admin.css";

const scoreboard = getProfitCenterScoreboard();

function ProfitCentersPage() {
  usePageMeta({
    title: "Harvest Profit Center Scoreboard",
    description: "Operating scoreboard for Harvest Drone profit-center modules.",
  });

  return (
    <Shell compact>
      <section className="section harvest-admin profit-centers">
        <div className="harvest-admin__header">
          <div>
            <span className="eyebrow">Business design</span>
            <h1>Profit center scoreboard</h1>
            <p>
              Track which Harvest Drone modules are ideas, tests, active offers, or paused
              so the OS build stays tied to revenue and operating burden.
            </p>
          </div>
          <div className="harvest-admin__header-actions">
            <Link className="button button--secondary" to="/admin/weekly-brief">
              Weekly brief
            </Link>
            <Link className="button button--secondary" to="/enterprise/rdo/division">
              RDO demo
            </Link>
          </div>
        </div>

        <div className="harvest-admin__summary-grid">
          {[
            ["Active", scoreboard.filter((item) => item.status === "active").length],
            ["Testing", scoreboard.filter((item) => item.status === "testing").length],
            ["Ideas", scoreboard.filter((item) => item.status === "idea").length],
            ["Paused", scoreboard.filter((item) => item.status === "paused").length],
            ["High potential", scoreboard.filter((item) => item.profitPotential === "High").length],
            ["High burden", scoreboard.filter((item) => item.operationalBurden === "High").length],
          ].map(([label, value]) => (
            <article className="harvest-admin__summary-card card" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </article>
          ))}
        </div>

        <article className="card integration-events">
          <div className="profit-center-table">
            <div className="profit-center-table__head">
              <span>Profit center</span>
              <span>Status</span>
              <span>Target customer</span>
              <span>Revenue model</span>
              <span>Next action</span>
              <span>Burden / potential / risk</span>
            </div>
            {scoreboard.map((item) => (
              <div className="profit-center-table__row" key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.description}</p>
                  <span>{item.currentPipeline}</span>
                </div>
                <span className={`integration-status integration-status--${item.status === "active" ? "connected" : item.status === "testing" ? "configured" : "not_configured"}`}>
                  {item.status}
                </span>
                <span>{item.targetCustomer}</span>
                <span>{item.revenueModel}</span>
                <div>
                  <strong>{item.nextAction}</strong>
                  <p>{item.buildNeeded}</p>
                  <span>Owner: {item.owner || "Unassigned"}</span>
                </div>
                <span>{`${item.operationalBurden} burden / ${item.profitPotential} potential / ${item.riskLevel} risk`}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </Shell>
  );
}

export default ProfitCentersPage;
