import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Shell from "../components/Shell";
import { getGoogleIntegrationStatus } from "../lib/dailyOpsApi";
import { formatDateTime } from "../lib/crm";
import { usePageMeta } from "../lib/pageMeta";
import "../styles/harvest-admin.css";

function GoogleIntegrationPage() {
  const [params] = useSearchParams();
  const [snapshot, setSnapshot] = useState({ account: null, requiredScopes: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  usePageMeta({
    title: "Google Workspace Integration",
    description: "Read-only Gmail and Calendar connection for Harvest Daily Ops.",
  });

  useEffect(() => {
    let isMounted = true;

    async function loadStatus() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const result = await getGoogleIntegrationStatus();
        if (isMounted) setSnapshot(result);
      } catch (error) {
        if (isMounted) setErrorMessage(error.message || "Unable to load Google Workspace status.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  const account = snapshot.account;

  return (
    <Shell compact>
      <section className="section harvest-admin google-integration">
        <div className="harvest-admin__header">
          <div>
            <span className="eyebrow">Google Workspace</span>
            <h1>Gmail and Calendar connection</h1>
            <p>Read-only Gmail and Calendar signals for the Harvest Daily Ops Brief.</p>
          </div>
          <div className="harvest-admin__header-actions">
            <a className="button button--secondary" href="/api/admin/google-oauth?action=start">
              Connect Google
            </a>
            <Link className="button button--secondary" to="/admin/daily-ops">
              Daily brief
            </Link>
            <Link className="button button--secondary" to="/admin/integrations">
              Integrations
            </Link>
          </div>
        </div>

        {params.get("connected") ? <div className="card harvest-admin__empty">Google Workspace connected.</div> : null}
        {errorMessage ? <div className="card harvest-admin__empty">{errorMessage}</div> : null}
        {isLoading ? <div className="card harvest-admin__empty">Loading Google Workspace status...</div> : null}

        {!isLoading ? (
          <div className="harvest-admin__ops-grid">
            <article className="card harvest-admin__ops-panel">
              <div className="harvest-admin__ops-header">
                <div>
                  <span className="eyebrow">Connection</span>
                  <h2>{account?.status === "connected" ? "Connected" : "Not connected"}</h2>
                </div>
                <span className={`integration-status integration-status--${account?.status === "connected" ? "connected" : "not_configured"}`}>
                  {account?.status || "not configured"}
                </span>
              </div>
              <div className="integration-card__meta">
                <div>
                  <span>Account</span>
                  <strong>{account?.account_email || "-"}</strong>
                </div>
                <div>
                  <span>Last connected</span>
                  <strong>{formatDateTime(account?.last_connected_at)}</strong>
                </div>
              </div>
            </article>

            <article className="card harvest-admin__ops-panel">
              <span className="eyebrow">Scopes</span>
              <h2>Read-only access</h2>
              <div className="integration-env-list">
                {(snapshot.requiredScopes || []).map((scope) => (
                  <span className="integration-env integration-env--ok" key={scope}>
                    {scope}
                  </span>
                ))}
              </div>
              <p className="table-subtle">
                OAuth tokens are stored encrypted server-side. Token values are never returned to the browser.
              </p>
            </article>
          </div>
        ) : null}
      </section>
    </Shell>
  );
}

export default GoogleIntegrationPage;
