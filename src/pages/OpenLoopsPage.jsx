import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Shell from "../components/Shell";
import { getOpenLoops, updateOpenLoop } from "../lib/dailyOpsApi";
import { formatDateTime } from "../lib/crm";
import { usePageMeta } from "../lib/pageMeta";
import "../styles/harvest-admin.css";

const PRIORITY_ORDER = {
  urgent: 0,
  high: 1,
  normal: 2,
  low: 3,
};

function OpenLoopsPage() {
  const [loops, setLoops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeId, setActiveId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [filter, setFilter] = useState("all");

  usePageMeta({
    title: "Harvest Open Loops",
    description: "Internal open-loop tracker for Harvest Drone operations.",
  });

  async function loadLoops() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await getOpenLoops();
      setLoops(result.loops || []);
    } catch (error) {
      setErrorMessage(error.message || "Unable to load open loops.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadLoops();
  }, []);

  async function handleUpdate(loop, patch) {
    setActiveId(loop.id);
    setErrorMessage("");

    try {
      const result = await updateOpenLoop({ id: loop.id, ...patch });
      setLoops(result.loops || []);
    } catch (error) {
      setErrorMessage(error.message || "Unable to update open loop.");
    } finally {
      setActiveId("");
    }
  }

  const visibleLoops = useMemo(() => {
    return loops
      .filter((loop) => filter === "all" || loop.source === filter || loop.priority === filter)
      .sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9));
  }, [filter, loops]);

  return (
    <Shell compact>
      <section className="section harvest-admin open-loops">
        <div className="harvest-admin__header">
          <div>
            <span className="eyebrow">Operations tracker</span>
            <h1>Open loops</h1>
            <p>Assign, resolve, or ignore internal follow-up loops from Gmail, Calendar, Jobber, Twilio, Slack, and Harvest OS.</p>
          </div>
          <div className="harvest-admin__header-actions">
            <button className="button button--secondary" type="button" onClick={loadLoops} disabled={isLoading}>
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>
            <Link className="button button--secondary" to="/ops">
              Operations
            </Link>
          </div>
        </div>

        <div className="harvest-admin__summary-grid">
          {[
            ["Open", loops.filter((loop) => loop.status === "open").length],
            ["Assigned", loops.filter((loop) => loop.status === "assigned").length],
            ["Urgent", loops.filter((loop) => loop.priority === "urgent").length],
            ["High", loops.filter((loop) => loop.priority === "high").length],
            ["Email", loops.filter((loop) => loop.source === "gmail").length],
            ["SMS", loops.filter((loop) => loop.source === "twilio").length],
          ].map(([label, value]) => (
            <article className="harvest-admin__summary-card card" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </article>
          ))}
        </div>

        <div className="harvest-admin__filters card">
          <div className="harvest-admin__filters-header">
            <div>
              <strong>Queue filter</strong>
              <p>Focus the tracker by source or priority.</p>
            </div>
          </div>
          <div className="harvest-admin__filters-grid">
            <select value={filter} onChange={(event) => setFilter(event.target.value)}>
              <option value="all">All open loops</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="gmail">Gmail</option>
              <option value="calendar">Calendar</option>
              <option value="jobber">Jobber</option>
              <option value="twilio">Twilio</option>
              <option value="slack">Slack</option>
              <option value="internal">Internal</option>
            </select>
          </div>
        </div>

        {errorMessage ? <div className="card harvest-admin__empty">{errorMessage}</div> : null}
        {isLoading ? <div className="card harvest-admin__empty">Loading open loops...</div> : null}

        {!isLoading ? (
          <article className="card integration-events">
            <div className="open-loop-table">
              <div className="open-loop-table__head">
                <span>Loop</span>
                <span>Owner</span>
                <span>Source</span>
                <span>Priority</span>
                <span>Due</span>
                <span>Status</span>
                <span>Actions</span>
              </div>
              {visibleLoops.length ? (
                visibleLoops.map((loop) => (
                  <div className="open-loop-table__row" key={loop.id}>
                    <div>
                      <strong>{loop.title}</strong>
                      <p>{loop.summary || "No summary available."}</p>
                      {loop.draft_response ? <pre>{loop.draft_response}</pre> : null}
                    </div>
                    <span>{loop.user_profiles?.full_name || loop.user_profiles?.email || "-"}</span>
                    <span>{loop.source}</span>
                    <span className={`ops-priority ops-priority--${loop.priority}`}>{loop.priority}</span>
                    <span>{formatDateTime(loop.due_at)}</span>
                    <span>{loop.status}</span>
                    <div className="open-loop-actions">
                      <button
                        className="button button--secondary button--small"
                        type="button"
                        disabled={activeId === loop.id}
                        onClick={() => handleUpdate(loop, { status: "assigned" })}
                      >
                        Assign
                      </button>
                      <button
                        className="button button--secondary button--small"
                        type="button"
                        disabled={activeId === loop.id}
                        onClick={() => handleUpdate(loop, { status: "resolved" })}
                      >
                        Resolve
                      </button>
                      <button
                        className="button button--secondary button--small"
                        type="button"
                        disabled={activeId === loop.id}
                        onClick={() => handleUpdate(loop, { status: "ignored" })}
                      >
                        Ignore
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="table-subtle">No open loops match this filter.</p>
              )}
            </div>
          </article>
        ) : null}
      </section>
    </Shell>
  );
}

export default OpenLoopsPage;
