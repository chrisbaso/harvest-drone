import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Shell from "../components/Shell";
import { getIntegrationAdminData, runIntegrationTest } from "../lib/integrationsApi";
import { usePageMeta } from "../lib/pageMeta";
import { formatDateTime } from "../lib/crm";
import "../styles/harvest-admin.css";

const STATUS_LABELS = {
  not_configured: "not configured",
  configured: "configured",
  connected: "connected",
  error: "error",
};

function formatStatus(status) {
  return STATUS_LABELS[status] || String(status || "not configured").replaceAll("_", " ");
}

function IntegrationCard({ integration, onTest, activeTest }) {
  const canTest = integration.testable && integration.status !== "not_configured";
  const recentErrors = integration.recentErrors || [];

  return (
    <article className="card integration-card">
      <div className="integration-card__topline">
        <div>
          <h2>{integration.label}</h2>
          <p>{integration.description}</p>
        </div>
        <span className={`integration-status integration-status--${integration.status}`}>
          {formatStatus(integration.status)}
        </span>
      </div>

      <div className="integration-card__meta">
        <div>
          <span>Last sync</span>
          <strong>{formatDateTime(integration.lastSyncTime)}</strong>
        </div>
        <div>
          <span>Last event</span>
          <strong>{formatDateTime(integration.lastEventReceived || integration.lastWebhookReceived)}</strong>
        </div>
      </div>

      <div className="integration-card__env">
        <strong>Required env vars</strong>
        <div className="integration-env-list">
          {integration.requiredEnvVars?.length ? (
            integration.requiredEnvVars.map((envVar) => (
              <span
                className={envVar.configured ? "integration-env integration-env--ok" : "integration-env integration-env--missing"}
                key={envVar.key}
              >
                {envVar.key}: {envVar.configured ? "set" : "missing"}
              </span>
            ))
          ) : (
            <span className="integration-env integration-env--ok">No direct app credentials required</span>
          )}
        </div>
      </div>

      {recentErrors.length ? (
        <div className="integration-card__errors">
          <strong>Recent errors</strong>
          {recentErrors.slice(0, 3).map((error) => (
            <p key={`${error.eventType}-${error.createdAt}`}>{error.message}</p>
          ))}
        </div>
      ) : (
        <p className="table-subtle">No recent integration errors logged.</p>
      )}

      <div className="integration-card__next">
        <strong>Next setup action</strong>
        <p>{integration.nextSetupAction || "Confirm setup requirements and watch the event log."}</p>
      </div>

      <button
        className="button button--secondary button--small"
        type="button"
        disabled={!canTest || activeTest === integration.provider}
        onClick={() => onTest(integration.provider)}
      >
        {activeTest === integration.provider ? "Testing..." : "Run safe test"}
      </button>
    </article>
  );
}

function IntegrationAdminPage() {
  const [snapshot, setSnapshot] = useState({
    integrations: [],
    recentEvents: [],
    mode: "loading",
    warning: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTest, setActiveTest] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [testResult, setTestResult] = useState(null);

  usePageMeta({
    title: "Harvest Drone Integrations",
    description:
      "Admin status for Jobber, QuickBooks, Twilio, Slack, and Harvest OS integration events.",
  });

  useEffect(() => {
    let isMounted = true;

    async function loadIntegrations() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const result = await getIntegrationAdminData();

        if (isMounted) {
          setSnapshot(result);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || "Unable to load integration status.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadIntegrations();

    return () => {
      isMounted = false;
    };
  }, []);

  const counts = useMemo(() => {
    return snapshot.integrations.reduce(
      (total, integration) => ({
        ...total,
        [integration.status]: (total[integration.status] || 0) + 1,
      }),
      {},
    );
  }, [snapshot.integrations]);

  async function handleRunTest(provider) {
    setActiveTest(provider);
    setErrorMessage("");
    setTestResult(null);

    try {
      const result = await runIntegrationTest(provider);
      setSnapshot({
        integrations: result.integrations,
        recentEvents: result.recentEvents,
        mode: result.mode,
        warning: result.warning,
      });
      setTestResult(result.result);
    } catch (error) {
      setErrorMessage(error.message || "Integration test failed.");
    } finally {
      setActiveTest("");
    }
  }

  return (
    <Shell compact>
      <section className="section harvest-admin integrations-admin">
        <div className="harvest-admin__header">
          <div>
            <span className="eyebrow">Operating stack</span>
            <h1>Integration command center</h1>
            <p>
              Keep Jobber as the field-service system of record while Harvest OS
              watches drone readiness, customer replies, support issues, and RDO
              enterprise blockers.
            </p>
          </div>
          <div className="harvest-admin__header-actions">
            <Link className="button button--secondary" to="/admin/integrations/google">
              Google
            </Link>
            <Link className="button button--secondary" to="/admin/integration-events">
              Event Log
            </Link>
            <Link className="button button--secondary" to="/ops">
              Operations
            </Link>
            <span className="harvest-admin__mode-pill">{snapshot.mode}</span>
          </div>
        </div>

        <div className="harvest-admin__summary-grid">
          <article className="harvest-admin__summary-card card">
            <span>Connected</span>
            <strong>{counts.connected || 0}</strong>
          </article>
          <article className="harvest-admin__summary-card card">
            <span>Configured</span>
            <strong>{counts.configured || 0}</strong>
          </article>
          <article className="harvest-admin__summary-card card">
            <span>Needs env</span>
            <strong>{counts.not_configured || 0}</strong>
          </article>
          <article className="harvest-admin__summary-card card">
            <span>Errors</span>
            <strong>{counts.error || 0}</strong>
          </article>
        </div>

        {snapshot.warning ? <div className="card harvest-admin__empty">{snapshot.warning}</div> : null}
        {errorMessage ? <div className="card harvest-admin__empty">{errorMessage}</div> : null}
        {testResult ? (
          <div className="card harvest-admin__empty">
            Test result: {testResult.status || (testResult.sent ? "sent" : "received")}
            {testResult.reason ? ` - ${testResult.reason}` : ""}
          </div>
        ) : null}

        {isLoading ? <div className="card harvest-admin__empty">Loading integration status...</div> : null}

        {!isLoading ? (
          <div className="integration-grid">
            {snapshot.integrations.map((integration) => (
              <IntegrationCard
                activeTest={activeTest}
                integration={integration}
                key={integration.provider}
                onTest={handleRunTest}
              />
            ))}
          </div>
        ) : null}

        <article className="card integration-ownership">
          <div>
            <h2>System ownership</h2>
            <p>
              Jobber owns client records, requests, quotes, jobs, scheduling, invoices,
              and its QuickBooks Online sync. Harvest OS owns the ag-specific intelligence:
              spray readiness, operator credentials, aircraft readiness, application
              records, support tickets, RDO workspace signals, and performance context.
            </p>
          </div>
        </article>

        <article className="card integration-events">
          <div className="harvest-admin__filters-header">
            <div>
              <strong>Recent integration events</strong>
              <p>Webhook, sync, SMS, and alert activity from the operating stack.</p>
            </div>
          </div>
          <div className="integration-event-table">
            <div className="integration-event-table__head">
              <span>Provider</span>
              <span>Event</span>
              <span>Status</span>
              <span>External ID</span>
              <span>Created</span>
            </div>
            {snapshot.recentEvents.length ? (
              snapshot.recentEvents.map((event) => (
                <div className="integration-event-table__row" key={event.id}>
                  <strong>{event.provider}</strong>
                  <span>{event.event_type}</span>
                  <span>{event.status}</span>
                  <span>{event.external_id || "-"}</span>
                  <span>{formatDateTime(event.created_at)}</span>
                </div>
              ))
            ) : (
              <p className="table-subtle">No integration events have been logged yet.</p>
            )}
          </div>
        </article>
      </section>
    </Shell>
  );
}

export default IntegrationAdminPage;
