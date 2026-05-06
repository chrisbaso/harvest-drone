import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Shell from "../components/Shell";
import { getIntegrationEvents } from "../lib/integrationsApi";
import { formatDateTime } from "../lib/crm";
import { usePageMeta } from "../lib/pageMeta";
import "../styles/harvest-admin.css";

function formatPayload(value) {
  if (!value || typeof value !== "object") {
    return value ? String(value) : "-";
  }

  return JSON.stringify(value, null, 2);
}

function IntegrationEventsPage() {
  const [snapshot, setSnapshot] = useState({ events: [], mode: "loading", warning: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [filters, setFilters] = useState({
    provider: "all",
    status: "all",
  });

  usePageMeta({
    title: "Harvest Integration Events",
    description: "Webhook, sync, SMS, Slack, Google, and internal operating-layer event log.",
  });

  async function loadEvents() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await getIntegrationEvents();
      setSnapshot(result);
    } catch (error) {
      setErrorMessage(error.message || "Unable to load integration events.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  const visibleEvents = useMemo(() => {
    return (snapshot.events || []).filter((event) => {
      const providerMatch = filters.provider === "all" || event.provider === filters.provider;
      const statusMatch = filters.status === "all" || event.status === filters.status;
      return providerMatch && statusMatch;
    });
  }, [filters.provider, filters.status, snapshot.events]);

  const providers = useMemo(
    () => [...new Set((snapshot.events || []).map((event) => event.provider).filter(Boolean))].sort(),
    [snapshot.events],
  );
  const statuses = useMemo(
    () => [...new Set((snapshot.events || []).map((event) => event.status).filter(Boolean))].sort(),
    [snapshot.events],
  );

  return (
    <Shell compact>
      <section className="section harvest-admin integration-events-page">
        <div className="harvest-admin__header">
          <div>
            <span className="eyebrow">Integration telemetry</span>
            <h1>Integration event log</h1>
            <p>
              A safe admin view of incoming webhooks, sync stubs, SMS activity, Slack alerts,
              Google signals, and internal operating-layer events.
            </p>
          </div>
          <div className="harvest-admin__header-actions">
            <button className="button button--secondary" type="button" onClick={loadEvents} disabled={isLoading}>
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>
            <Link className="button button--secondary" to="/admin/integrations">
              Integrations
            </Link>
            <span className="harvest-admin__mode-pill">{snapshot.mode}</span>
          </div>
        </div>

        <div className="harvest-admin__summary-grid">
          {[
            ["Total events", snapshot.events?.length || 0],
            ["Received", (snapshot.events || []).filter((event) => event.status === "received").length],
            ["Processed", (snapshot.events || []).filter((event) => event.status === "processed").length],
            ["Failed", (snapshot.events || []).filter((event) => ["failed", "error"].includes(event.status)).length],
            ["Ignored", (snapshot.events || []).filter((event) => event.status === "ignored").length],
            ["Skipped", (snapshot.events || []).filter((event) => event.status === "skipped").length],
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
              <strong>Event filters</strong>
              <p>Focus the log by provider or processing state.</p>
            </div>
          </div>
          <div className="harvest-admin__filters-grid">
            <select value={filters.provider} onChange={(event) => setFilters((current) => ({ ...current, provider: event.target.value }))}>
              <option value="all">All providers</option>
              {providers.map((provider) => (
                <option key={provider} value={provider}>
                  {provider}
                </option>
              ))}
            </select>
            <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
              <option value="all">All statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {snapshot.warning ? <div className="card harvest-admin__empty">{snapshot.warning}</div> : null}
        {errorMessage ? <div className="card harvest-admin__empty">{errorMessage}</div> : null}
        {isLoading ? <div className="card harvest-admin__empty">Loading integration events...</div> : null}

        {!isLoading ? (
          <article className="card integration-events">
            <div className="integration-log-table">
              <div className="integration-log-table__head">
                <span>Provider</span>
                <span>Event</span>
                <span>Status</span>
                <span>External ID</span>
                <span>Created</span>
                <span>Payload summary</span>
              </div>
              {visibleEvents.length ? (
                visibleEvents.map((event) => (
                  <div className="integration-log-table__row" key={event.id}>
                    <strong>{event.provider}</strong>
                    <span>{event.event_type}</span>
                    <span className={`integration-status integration-status--${event.status === "processed" ? "connected" : event.status === "error" || event.status === "failed" ? "error" : "configured"}`}>
                      {event.status}
                    </span>
                    <span>{event.external_id || "-"}</span>
                    <span>{formatDateTime(event.created_at)}</span>
                    <pre>{formatPayload(event.payload_summary)}</pre>
                  </div>
                ))
              ) : (
                <p className="table-subtle">No integration events match this filter.</p>
              )}
            </div>
          </article>
        ) : null}
      </section>
    </Shell>
  );
}

export default IntegrationEventsPage;
