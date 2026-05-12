import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FOLLOW_UP_STAGE_OPTIONS,
  LEAD_STATUS_OPTIONS,
  REVENUE_STATUS_OPTIONS,
  formatCrops,
  formatDateLabel,
  getFollowUpSequence,
  getPreferredOfferPath,
} from "../../shared/harvestLeadEngine";
import { getHarvestLeadDetail, updateHarvestLead } from "../lib/harvestApi";
import { createOpsJobFromLead, loadFieldOpsState } from "../lib/fieldOpsApi";
import { usePageMeta } from "../lib/pageMeta";
import Shell from "../components/Shell";
import { useAuth } from "../context/AuthContext";
import "../styles/harvest-admin.css";

function DetailList({ items }) {
  return (
    <dl className="harvest-admin__detail-list">
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value || "-"}</dd>
        </div>
      ))}
    </dl>
  );
}

function HarvestLeadDetailPage() {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [detail, setDetail] = useState({ lead: null, events: [], mode: "server" });
  const [formState, setFormState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [message, setMessage] = useState("");

  usePageMeta({
    title: "Harvest Drone Lead Detail",
    description: "Lead detail view for Harvest Drone SOURCE fit checks.",
  });

  useEffect(() => {
    let isMounted = true;

    async function loadDetail() {
      setIsLoading(true);

      try {
        const result = await getHarvestLeadDetail(leadId);

        if (isMounted) {
          setDetail(result);
          setFormState({
            status: result.lead?.status || "New",
            assigned_to: result.lead?.assigned_to || "",
            internal_notes: result.lead?.internal_notes || "",
            follow_up_stage: result.lead?.follow_up_stage || "none",
            estimated_acres: result.lead?.estimated_acres || "",
            estimated_value: result.lead?.estimated_value || "",
            actual_revenue: result.lead?.actual_revenue || "",
            revenue_status: result.lead?.revenue_status || "unconfirmed",
            last_contacted_at: result.lead?.last_contacted_at
              ? result.lead.last_contacted_at.slice(0, 16)
              : "",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDetail();

    return () => {
      isMounted = false;
    };
  }, [leadId]);

  async function handleSave(event) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      const updates = {
        ...formState,
        estimated_acres: formState.estimated_acres ? Number(formState.estimated_acres) : null,
        estimated_value: formState.estimated_value ? Number(formState.estimated_value) : null,
        actual_revenue: formState.actual_revenue ? Number(formState.actual_revenue) : null,
        last_contacted_at: formState.last_contacted_at
          ? new Date(formState.last_contacted_at).toISOString()
          : null,
      };
      const result = await updateHarvestLead(leadId, updates);
      setDetail((current) => ({
        ...current,
        lead: result.lead,
        events: result.events || current.events,
      }));
      setMessage("Lead updated.");
    } catch (error) {
      setMessage(error.message || "Unable to update lead.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateOpsJob() {
    setIsConverting(true);
    setMessage("");

    try {
      const opsState = await loadFieldOpsState(profile);
      const result = await createOpsJobFromLead(lead, { state: opsState, profile });
      navigate(`/ops/jobs/${result.row.id}`);
    } catch (error) {
      setMessage(error.message || "Unable to create ops job from this lead.");
    } finally {
      setIsConverting(false);
    }
  }

  const lead = detail.lead;
  const summary = lead?.lead_summary || {};
  const followUpSequence = useMemo(
    () => getFollowUpSequence(lead?.lead_tier),
    [lead?.lead_tier],
  );

  if (isLoading) {
    return (
      <Shell compact>
        <section className="section">
          <div className="card harvest-admin__empty">Loading lead detail...</div>
        </section>
      </Shell>
    );
  }

  if (!lead || !formState) {
    return (
      <Shell compact>
        <section className="section">
          <div className="card harvest-admin__empty">Lead not found.</div>
        </section>
      </Shell>
    );
  }

  const contactItems = [
    { label: "Name", value: `${lead.first_name || ""} ${lead.last_name || ""}`.trim() || lead.email },
    { label: "Email", value: lead.email },
    { label: "Phone", value: lead.phone },
    { label: "Preferred contact", value: lead.preferred_contact_method },
    { label: "SMS consent", value: lead.sms_consent ? "Yes" : "No" },
    { label: "SMS consent captured", value: formatDateLabel(lead.sms_consent_at) },
    { label: "Farm / business", value: lead.farm_name || "-" },
    {
      label: "Location",
      value: [lead.county, lead.state, lead.zip].filter(Boolean).join(", "),
    },
  ];

  const qualificationItems = [
    { label: "Acreage range", value: lead.acreage_range },
    { label: "Crops", value: formatCrops(lead.crops) },
    { label: "Application method", value: lead.application_method },
    { label: "Primary goal", value: lead.primary_goal },
    { label: "Decision timing", value: lead.decision_timing },
    { label: "Interest level", value: lead.interest_level },
    { label: "Notes", value: lead.notes || "-" },
  ];

  const scoringItems = [
    { label: "Lead tier", value: lead.lead_tier },
    { label: "Lead score", value: String(lead.lead_score ?? "-") },
    { label: "Offer path", value: lead.offer_path || getPreferredOfferPath(lead.lead_tier) },
    { label: "Recommended action", value: lead.recommended_action },
    { label: "Reason codes", value: (lead.reason_codes || []).join(", ") || "-" },
  ];

  const trackingItems = [
    { label: "Campaign", value: lead.campaign || "-" },
    { label: "Ad set", value: lead.ad_set || "-" },
    { label: "Ad name", value: lead.ad_name || "-" },
    { label: "UTM source", value: lead.utm_source || "-" },
    { label: "UTM medium", value: lead.utm_medium || "-" },
    { label: "UTM campaign", value: lead.utm_campaign || "-" },
    { label: "UTM content", value: lead.utm_content || "-" },
    { label: "UTM term", value: lead.utm_term || "-" },
    { label: "Landing page", value: lead.landing_page_url || "-" },
    { label: "Referrer", value: lead.referrer || "-" },
    { label: "Submitted", value: formatDateLabel(lead.created_at) },
    { label: "Last updated", value: formatDateLabel(lead.updated_at) },
  ];

  return (
    <Shell compact>
      <section className="section harvest-admin">
        <div className="harvest-admin__header">
          <div>
            <Link className="back-link" to="/admin">
              Back to admin
            </Link>
            <h1>{`${lead.first_name || ""} ${lead.last_name || ""}`.trim() || lead.email}</h1>
            <p>{`${lead.farm_name || "Farm not provided"} | ${lead.lead_tier} | Score ${lead.lead_score}`}</p>
          </div>
          <div className="harvest-admin__header-actions">
            <button className="button button--primary" type="button" onClick={handleCreateOpsJob} disabled={isConverting}>
              {isConverting ? "Creating Ops Job..." : "Create Ops Job"}
            </button>
            <span className="harvest-admin__mode-pill">
              {detail.mode === "local" ? "Local mock mode" : "Supabase mode"}
            </span>
          </div>
        </div>

        <div className="harvest-admin__detail-grid">
          <article className="card harvest-admin__detail-card">
            <h2>Lead detail</h2>
            <div className="harvest-admin__detail-stack">
              <section className="harvest-admin__detail-section">
                <h3>Contact and farm info</h3>
                <DetailList items={contactItems} />
                {lead.sms_consent_language ? (
                  <p className="table-subtle">
                    <strong>Consent language:</strong> {lead.sms_consent_language}
                  </p>
                ) : null}
              </section>

              <section className="harvest-admin__detail-section">
                <h3>Qualification answers</h3>
                <DetailList items={qualificationItems} />
              </section>

              <section className="harvest-admin__detail-section">
                <h3>Score and routing</h3>
                <DetailList items={scoringItems} />
              </section>

              <section className="harvest-admin__detail-section">
                <h3>Campaign and tracking</h3>
                <DetailList items={trackingItems} />
              </section>
            </div>

            <div className="harvest-admin__summary-block">
              <h3>Lead summary</h3>
              <p>{summary.plainEnglish || "No summary available yet."}</p>
              <p>
                <strong>Why it matters:</strong> {summary.whyItMatters || "-"}
              </p>
              <p>
                <strong>Suggested follow-up angle:</strong> {summary.followUpAngle || "-"}
              </p>
              <p>
                <strong>Suggested first call script:</strong> {summary.firstCallScript || "-"}
              </p>
              <p>
                <strong>Suggested email reply:</strong> {summary.suggestedEmailReply || "-"}
              </p>
            </div>

            <div className="harvest-admin__summary-block">
              <h3>Follow-up sequence</h3>
              <div className="harvest-admin__sequence-list">
                {followUpSequence.map((step) => (
                  <div className="harvest-admin__sequence-item" key={`${step.day}-${step.subject}`}>
                    <strong>{`Day ${step.day}: ${step.subject}`}</strong>
                    <p>{step.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="card harvest-admin__detail-card">
            <h2>Admin actions</h2>
            <form className="harvest-admin__action-form" onSubmit={handleSave}>
              <label>
                <span>Status</span>
                <select
                  value={formState.status}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, status: event.target.value }))
                  }
                >
                  {LEAD_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Assign lead</span>
                <input
                  value={formState.assigned_to}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, assigned_to: event.target.value }))
                  }
                  placeholder="Jake"
                />
              </label>
              <label>
                <span>Follow-up stage</span>
                <select
                  value={formState.follow_up_stage}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      follow_up_stage: event.target.value,
                    }))
                  }
                >
                  {FOLLOW_UP_STAGE_OPTIONS.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Last contacted</span>
                <input
                  type="datetime-local"
                  value={formState.last_contacted_at}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      last_contacted_at: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                <span>Estimated acres</span>
                <input
                  type="number"
                  value={formState.estimated_acres}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      estimated_acres: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                <span>Estimated value</span>
                <input
                  type="number"
                  value={formState.estimated_value}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      estimated_value: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                <span>Revenue status</span>
                <select
                  value={formState.revenue_status}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      revenue_status: event.target.value,
                    }))
                  }
                >
                  {REVENUE_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Actual revenue</span>
                <input
                  type="number"
                  value={formState.actual_revenue}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      actual_revenue: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                <span>Internal notes</span>
                <textarea
                  rows="6"
                  value={formState.internal_notes}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      internal_notes: event.target.value,
                    }))
                  }
                />
              </label>
              {message ? <p className="table-subtle">{message}</p> : null}
              <button className="button button--primary" type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save updates"}
              </button>
            </form>
          </article>
        </div>

        <article className="card harvest-admin__detail-card">
          <h2>Timeline events</h2>
          <div className="harvest-admin__timeline">
            {(detail.events || []).length === 0 ? (
              <p>No timeline events recorded yet.</p>
            ) : (
              detail.events.map((event) => (
                <div className="harvest-admin__timeline-item" key={event.id}>
                  <strong>{event.event_type}</strong>
                  <span>{formatDateLabel(event.created_at)}</span>
                  <pre>{JSON.stringify(event.event_payload || {}, null, 2)}</pre>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </Shell>
  );
}

export default HarvestLeadDetailPage;
