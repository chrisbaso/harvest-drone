import { useEffect, useRef } from "react";
import { formatCrmStageLabel, formatCrmTypeLabel, formatCurrency, formatDateTime } from "../lib/crm";

function formatRecordValue(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  if (typeof value === "number") {
    return value.toLocaleString();
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  return String(value);
}

function getStageTone(value = "") {
  const v = String(value).toLowerCase();
  if (["closed_won", "active", "approved", "qualified"].includes(v)) return { bg: "rgba(74,222,128,0.12)", color: "#4ADE80" };
  if (["route_to_operator", "call_scheduled", "assigned", "contacted"].includes(v)) return { bg: "rgba(96,165,250,0.12)", color: "#60A5FA" };
  if (["closed_lost", "inactive"].includes(v)) return { bg: "rgba(248,113,113,0.12)", color: "#F87171" };
  if (["hylio", "hylio_sale"].includes(v)) return { bg: "rgba(251,191,36,0.12)", color: "#FBBF24" };
  return { bg: "rgba(255,255,255,0.06)", color: "#9CA38C" };
}

const css = `
.cdp-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  justify-content: flex-end;
  animation: cdp-fadeIn 0.15s ease;
}
@keyframes cdp-fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.cdp-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(2px);
}

.cdp {
  --cdp-bg: #111610;
  --cdp-surface: #181E14;
  --cdp-border: rgba(255,255,255,0.06);
  --cdp-text: #E8E6E1;
  --cdp-text-muted: #727966;
  --cdp-accent: #A3D977;
  --cdp-accent-dim: rgba(163,217,119,0.10);
  --cdp-sans: 'Instrument Sans', 'Inter', system-ui, sans-serif;
  --cdp-serif: 'DM Serif Display', Georgia, serif;

  position: relative;
  z-index: 1;
  width: 480px;
  max-width: 100vw;
  height: 100vh;
  background: var(--cdp-bg);
  border-left: 1px solid var(--cdp-border);
  font-family: var(--cdp-sans);
  -webkit-font-smoothing: antialiased;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: cdp-slideIn 0.2s ease;
}
@keyframes cdp-slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.cdp__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 28px 28px 24px;
  border-bottom: 1px solid var(--cdp-border);
  flex-shrink: 0;
}
.cdp__header-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.cdp__eyebrow {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--cdp-text-muted);
}
.cdp__title {
  font-family: var(--cdp-serif);
  font-size: 1.4rem;
  font-weight: 400;
  color: #fff;
  margin: 0;
  line-height: 1.25;
  word-break: break-word;
}
.cdp__subtitle {
  font-size: 13px;
  color: var(--cdp-text-muted);
  margin: 2px 0 0;
  line-height: 1.5;
}
.cdp__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid var(--cdp-border);
  background: transparent;
  color: var(--cdp-text-muted);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.cdp__close:hover {
  background: rgba(255,255,255,0.04);
  color: var(--cdp-text);
  border-color: rgba(255,255,255,0.12);
}

.cdp__quick-stats {
  display: flex;
  gap: 1px;
  background: var(--cdp-border);
  border-bottom: 1px solid var(--cdp-border);
  flex-shrink: 0;
}
.cdp__quick-stat {
  flex: 1;
  padding: 14px 16px;
  background: var(--cdp-surface);
  text-align: center;
}
.cdp__quick-stat span {
  display: block;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--cdp-text-muted);
  margin-bottom: 4px;
}
.cdp__quick-stat strong {
  display: block;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
}

.cdp__body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 28px 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.cdp__section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.cdp__section-title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--cdp-text-muted);
  padding-bottom: 8px;
  border-bottom: 1px solid var(--cdp-border);
  margin: 0;
}

.cdp__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  background: var(--cdp-border);
  border-radius: 8px;
  overflow: hidden;
}
.cdp__grid-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 14px 16px;
  background: var(--cdp-surface);
}
.cdp__grid-item dt {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--cdp-text-muted);
}
.cdp__grid-item dd {
  font-size: 14px;
  color: var(--cdp-text);
  font-weight: 500;
  margin: 0;
}
.cdp__grid-item--highlight dd {
  color: var(--cdp-accent);
  font-weight: 700;
}

.cdp__stage-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  width: fit-content;
}
.cdp__stage-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.cdp__notes {
  font-size: 14px;
  color: var(--cdp-text);
  line-height: 1.65;
  margin: 0;
  padding: 14px 16px;
  background: var(--cdp-surface);
  border-radius: 8px;
  border: 1px solid var(--cdp-border);
}

@media (max-width: 520px) {
  .cdp {
    width: 100vw;
  }
  .cdp__header {
    padding: 20px 20px 18px;
  }
  .cdp__body {
    padding: 20px 20px 32px;
  }
  .cdp__grid {
    grid-template-columns: 1fr;
  }
}
`;

function CrmDetailPanel({ record, onClose }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!record) return undefined;
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [record, onClose]);

  if (!record) {
    return null;
  }

  const metadataEntries = Object.entries(record.metadata || {}).filter(([, value]) => value !== null && value !== "");

  const stageRaw = record.stage || record.status || "";
  const stageTone = getStageTone(stageRaw);

  const fields = [
    { label: "Type", value: formatCrmTypeLabel(record.lead_type || record.opportunity_type || record.contact_type || record.account_type || record.operator_type || record.route_type) },
    { label: "State", value: record.state },
    { label: "County", value: record.county },
    { label: "Owner", value: record.owner || "Harvest Drone" },
    { label: "Source", value: record.source },
    { label: "Acres", value: record.acres ?? record.acreage_capacity, highlight: true },
    { label: "Estimated value", value: record.estimated_value ? formatCurrency(record.estimated_value) : null, highlight: true },
    { label: "Created", value: formatDateTime(record.created_at) },
    { label: "Updated", value: formatDateTime(record.updated_at) },
  ].filter((field) => field.value !== null && field.value !== undefined);

  const title =
    record.full_name ||
    record.name ||
    formatCrmTypeLabel(record.opportunity_type || record.lead_type || record.account_type || record.operator_type);

  const subtitleParts = [record.email, record.mobile, record.company_name, record.counties_served].filter(Boolean);

  const quickStats = [
    record.acres && { label: "Acres", value: Number(record.acres).toLocaleString() },
    record.acreage_capacity && !record.acres && { label: "Capacity", value: Number(record.acreage_capacity).toLocaleString() },
    record.estimated_value && { label: "Value", value: formatCurrency(record.estimated_value) },
    stageRaw && { label: "Stage", value: formatCrmStageLabel(stageRaw) },
  ].filter(Boolean).slice(0, 3);

  return (
    <>
      <style>{css}</style>
      <div className="cdp-overlay" role="dialog" aria-modal="true">
        <div className="cdp-backdrop" onClick={onClose} />
        <aside className="cdp" ref={panelRef}>
          <header className="cdp__header">
            <div className="cdp__header-info">
              <span className="cdp__eyebrow">Record details</span>
              <h3 className="cdp__title">{title}</h3>
              {subtitleParts.length > 0 && (
                <p className="cdp__subtitle">{subtitleParts.join(" - ")}</p>
              )}
              {stageRaw && (
                <div
                  className="cdp__stage-badge"
                  style={{ background: stageTone.bg, color: stageTone.color, marginTop: 8 }}
                >
                  <span className="cdp__stage-dot" style={{ background: stageTone.color }} />
                  {formatCrmStageLabel(stageRaw)}
                </div>
              )}
            </div>
            <button
              type="button"
              className="cdp__close"
              onClick={onClose}
              aria-label="Close details"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
            </button>
          </header>

          {quickStats.length > 0 && (
            <div className="cdp__quick-stats">
              {quickStats.map((stat) => (
                <div key={stat.label} className="cdp__quick-stat">
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </div>
              ))}
            </div>
          )}

          <div className="cdp__body">
            <section className="cdp__section">
              <h4 className="cdp__section-title">Snapshot</h4>
              <dl className="cdp__grid">
                {fields.map((field) => (
                  <div
                    key={field.label}
                    className={`cdp__grid-item${field.highlight ? " cdp__grid-item--highlight" : ""}`}
                  >
                    <dt>{field.label}</dt>
                    <dd>{formatRecordValue(field.value)}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {record.notes && (
              <section className="cdp__section">
                <h4 className="cdp__section-title">Notes</h4>
                <p className="cdp__notes">{record.notes}</p>
              </section>
            )}

            {metadataEntries.length > 0 && (
              <section className="cdp__section">
                <h4 className="cdp__section-title">Metadata</h4>
                <dl className="cdp__grid">
                  {metadataEntries.map(([key, value]) => (
                    <div key={key} className="cdp__grid-item">
                      <dt>{key.replaceAll("_", " ")}</dt>
                      <dd>{formatRecordValue(value)}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}

export default CrmDetailPanel;
