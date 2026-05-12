import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Shell from "../components/Shell";
import { getDailyOpsBrief, sendDailyOpsBriefToSlack } from "../lib/dailyOpsApi";
import { formatDateTime } from "../lib/crm";
import { usePageMeta } from "../lib/pageMeta";
import "../styles/harvest-admin.css";

function EmptyState({ children }) {
  return <p className="table-subtle">{children}</p>;
}

function ItemList({ items, empty }) {
  if (!items?.length) {
    return <EmptyState>{empty}</EmptyState>;
  }

  return (
    <div className="daily-ops-list">
      {items.slice(0, 8).map((item) => (
        <article className="daily-ops-row" key={item.id || item.source_external_id || item.title}>
          <div>
            <div className="daily-ops-row__title">
              <strong>{item.title || item.summary || "Review item"}</strong>
              {item.priority ? <span className={`ops-priority ops-priority--${item.priority}`}>{item.priority}</span> : null}
            </div>
            <p>{item.summary || item.suggested_next_action || "No summary available."}</p>
            {item.suggested_next_action || item.action ? <span>{item.suggested_next_action || item.action}</span> : null}
          </div>
        </article>
      ))}
    </div>
  );
}

function CalendarList({ events, empty }) {
  if (!events?.length) {
    return <EmptyState>{empty}</EmptyState>;
  }

  return (
    <div className="daily-ops-list">
      {events.map((event) => (
        <article className="daily-ops-row" key={event.id || `${event.summary}-${event.start}`}>
          <div>
            <strong>{event.summary || "Calendar event"}</strong>
            <p>{[formatDateTime(event.start), event.location].filter(Boolean).join(" | ") || "Time not available"}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function DailyOpsPage() {
  const [snapshot, setSnapshot] = useState({ brief: null, loops: [], mode: "loading" });
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  usePageMeta({
    title: "Harvest Daily Ops",
    description: "Morning operations brief for Harvest Drone admin follow-up.",
  });

  async function loadBrief() {
    setIsLoading(true);
    setErrorMessage("");
    setInfoMessage("");

    try {
      const result = await getDailyOpsBrief();
      setSnapshot(result);
    } catch (error) {
      setErrorMessage(error.message || "Unable to load Daily Ops Brief.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadBrief();
  }, []);

  async function handleSendSlack() {
    setIsPosting(true);
    setErrorMessage("");
    setInfoMessage("");

    try {
      const result = await sendDailyOpsBriefToSlack({ date: snapshot.brief?.brief_date });
      setSnapshot(result);
      setInfoMessage(result.slackResult?.reason || `Slack status: ${result.slackResult?.status || "not_sent"}`);
    } catch (error) {
      setErrorMessage(error.message || "Unable to send Daily Ops Brief to Slack.");
    } finally {
      setIsPosting(false);
    }
  }

  const summary = snapshot.brief?.summary || {};
  const counts = summary.counts || {};
  const loops = snapshot.loops || summary.loops || [];
  const grouped = useMemo(
    () => ({
      email: loops.filter((loop) => loop.source === "gmail"),
      jobber: loops.filter((loop) => loop.source === "jobber"),
      unassignedJobs: loops.filter((loop) => loop.source === "jobber" && loop.loop_type === "job_scheduling_needed"),
      completedNotInvoiced: loops.filter((loop) => loop.source === "jobber" && loop.loop_type === "invoice_followup"),
      sms: loops.filter((loop) => loop.source === "twilio"),
      rdo: loops.filter((loop) => loop.loop_type === "rdo_followup"),
    }),
    [loops],
  );

  return (
    <Shell compact>
      <section className="section harvest-admin daily-ops">
        <div className="harvest-admin__header">
          <div>
            <span className="eyebrow">Daily operations</span>
            <h1>Harvest Daily Ops Brief</h1>
            <p>
              Calendar, customer replies, Jobber/SMS follow-ups, open loops, and recommended admin actions.
            </p>
          </div>
          <div className="harvest-admin__header-actions">
            <button className="button button--secondary" type="button" onClick={loadBrief} disabled={isLoading}>
              {isLoading ? "Refreshing..." : "Regenerate"}
            </button>
            <button className="button button--secondary" type="button" onClick={handleSendSlack} disabled={isPosting || !snapshot.brief}>
              {isPosting ? "Posting..." : "Post to Slack"}
            </button>
            <Link className="button button--secondary" to="/admin/open-loops">
              Open loops
            </Link>
            <Link className="button button--secondary" to="/admin/integrations/google">
              Google
            </Link>
          </div>
        </div>

        {errorMessage ? <div className="card harvest-admin__empty">{errorMessage}</div> : null}
        {infoMessage ? <div className="card harvest-admin__empty">{infoMessage}</div> : null}
        {summary.warnings?.length ? (
          <div className="card harvest-admin__empty">{summary.warnings.join(" ")}</div>
        ) : null}

        <div className="harvest-admin__summary-grid">
          {[
            ["Today", counts.todayEvents || 0],
            ["Tomorrow", counts.tomorrowEvents || 0],
            ["Open loops", counts.openLoops || 0],
            ["Priority", counts.priorityItems || 0],
            ["Email", counts.emailFollowUps || 0],
            ["SMS", counts.smsReplies || 0],
          ].map(([label, value]) => (
            <article className="harvest-admin__summary-card card" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </article>
          ))}
        </div>

        {isLoading ? <div className="card harvest-admin__empty">Loading Daily Ops Brief...</div> : null}

        {!isLoading ? (
          <>
            <div className="harvest-admin__ops-grid">
              <article className="card harvest-admin__ops-panel">
                <div className="harvest-admin__ops-header">
                  <div>
                    <span className="eyebrow">Priority</span>
                    <h2>Items needing action</h2>
                  </div>
                  <strong>{summary.priorityItems?.length || 0}</strong>
                </div>
                <ItemList items={summary.priorityItems} empty="No urgent or high-priority items in this brief." />
              </article>

              <article className="card harvest-admin__ops-panel">
                <div className="harvest-admin__ops-header">
                  <div>
                    <span className="eyebrow">Next actions</span>
                    <h2>Recommended admin moves</h2>
                  </div>
                </div>
                <ItemList items={summary.recommendedNextActions} empty="No recommended actions generated yet." />
              </article>
            </div>

            <div className="daily-ops-sections">
              <article className="card harvest-admin__ops-panel">
                <span className="eyebrow">Calendar</span>
                <h2>Today</h2>
                <CalendarList events={summary.todayEvents} empty="No calendar events found for today." />
              </article>
              <article className="card harvest-admin__ops-panel">
                <span className="eyebrow">Calendar</span>
                <h2>Tomorrow</h2>
                <CalendarList events={summary.tomorrowEvents} empty="No important calendar events found for tomorrow." />
              </article>
              <article className="card harvest-admin__ops-panel">
                <span className="eyebrow">Email</span>
                <h2>Customer emails needing response</h2>
                <ItemList items={grouped.email} empty="No email follow-ups detected." />
              </article>
              <article className="card harvest-admin__ops-panel">
                <span className="eyebrow">Jobber</span>
                <h2>Jobs and quotes needing attention</h2>
                <ItemList items={grouped.jobber} empty="No Jobber follow-ups detected." />
              </article>
              <article className="card harvest-admin__ops-panel">
                <span className="eyebrow">Jobber</span>
                <h2>Unassigned or unconfirmed jobs</h2>
                <ItemList items={grouped.unassignedJobs} empty="Connect Jobber sync/webhooks to surface unassigned or unconfirmed jobs." />
              </article>
              <article className="card harvest-admin__ops-panel">
                <span className="eyebrow">Jobber / QuickBooks</span>
                <h2>Completed jobs not invoiced</h2>
                <ItemList items={grouped.completedNotInvoiced} empty="Connect Jobber invoice/job status events to surface completed jobs that need invoicing." />
              </article>
              <article className="card harvest-admin__ops-panel">
                <span className="eyebrow">Twilio</span>
                <h2>SMS replies needing response</h2>
                <ItemList items={grouped.sms} empty="No SMS replies detected." />
              </article>
              <article className="card harvest-admin__ops-panel">
                <span className="eyebrow">Enterprise</span>
                <h2>RDO follow-ups</h2>
                <ItemList items={grouped.rdo} empty="No RDO or enterprise loops detected." />
              </article>
            </div>
          </>
        ) : null}
      </section>
    </Shell>
  );
}

export default DailyOpsPage;
