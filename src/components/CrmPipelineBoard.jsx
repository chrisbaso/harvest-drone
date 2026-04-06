import { formatCrmStageLabel, formatCrmTypeLabel, formatCurrency } from "../lib/crm";

const stageColors = {
  open: "#60A5FA",
  assigned: "#FBBF24",
  qualified: "#A3D977",
  closed_won: "#4ADE80",
  closed_lost: "#F87171",
};

const css = `
.cpb {
  --cpb-bg: #0C0F0A;
  --cpb-surface: #151A12;
  --cpb-card-bg: #1A2015;
  --cpb-card-hover: #1F261A;
  --cpb-border: rgba(255,255,255,0.06);
  --cpb-border-hover: rgba(255,255,255,0.12);
  --cpb-text: #E8E6E1;
  --cpb-text-muted: #727966;
  --cpb-sans: 'Instrument Sans', 'Inter', system-ui, sans-serif;

  display: grid;
  grid-template-columns: repeat(var(--cpb-cols, 4), 1fr);
  gap: 12px;
  font-family: var(--cpb-sans);
  -webkit-font-smoothing: antialiased;
}

.cpb__col {
  display: flex;
  flex-direction: column;
  background: var(--cpb-surface);
  border: 1px solid var(--cpb-border);
  border-radius: 12px;
  overflow: hidden;
  min-height: 320px;
}

.cpb__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 20px 16px;
  border-bottom: 1px solid var(--cpb-border);
}
.cpb__header-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.cpb__stage-label {
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
}
.cpb__stage-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.cpb__stage-desc {
  font-size: 12px;
  color: var(--cpb-text-muted);
  margin-top: 2px;
}
.cpb__header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  flex-shrink: 0;
}
.cpb__count {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}
.cpb__total {
  font-size: 11px;
  color: var(--cpb-text-muted);
  font-weight: 500;
}

.cpb__stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  flex: 1;
  overflow-y: auto;
}

.cpb__card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  padding: 16px;
  background: var(--cpb-card-bg);
  border: 1px solid var(--cpb-border);
  border-radius: 8px;
  font-family: var(--cpb-sans);
  text-align: left;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, transform 0.15s;
  color: var(--cpb-text);
}
.cpb__card:hover {
  background: var(--cpb-card-hover);
  border-color: var(--cpb-border-hover);
  transform: translateY(-1px);
}

.cpb__card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}
.cpb__card-type {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  line-height: 1.3;
}
.cpb__card-value {
  font-size: 13px;
  font-weight: 700;
  color: var(--cpb-accent, #A3D977);
  white-space: nowrap;
  flex-shrink: 0;
}

.cpb__card-location {
  font-size: 12px;
  color: var(--cpb-text-muted);
  margin: 0;
  line-height: 1.4;
}

.cpb__card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--cpb-border);
}
.cpb__card-tag {
  font-size: 11px;
  font-weight: 600;
  color: var(--cpb-text-muted);
  background: rgba(255,255,255,0.04);
  padding: 2px 8px;
  border-radius: 4px;
}
.cpb__card-owner {
  font-size: 11px;
  color: var(--cpb-text-muted);
}

.cpb__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 32px 16px;
  font-size: 13px;
  color: var(--cpb-text-muted);
  text-align: center;
  line-height: 1.5;
}

@media (max-width: 1100px) {
  .cpb {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 600px) {
  .cpb {
    grid-template-columns: 1fr;
  }
  .cpb__col {
    min-height: 200px;
  }
}
`;

function CrmPipelineBoard({ columns, rows, onSelect, emptyMessage = "No records match the current filters." }) {
  return (
    <>
      <style>{css}</style>
      <section className="cpb" style={{ "--cpb-cols": columns.length }}>
        {columns.map((column) => {
          const items = rows.filter((row) => row.stage === column.id);
          const columnTotal = items.reduce((sum, row) => sum + Number(row.estimated_value ?? 0), 0);
          const dotColor = stageColors[column.id] || "#A3D977";

          return (
            <article key={column.id} className="cpb__col">
              <header className="cpb__header">
                <div className="cpb__header-info">
                  <span className="cpb__stage-label">
                    <span className="cpb__stage-dot" style={{ background: dotColor }} />
                    {formatCrmStageLabel(column.id)}
                  </span>
                  <span className="cpb__stage-desc">{column.description}</span>
                </div>
                <div className="cpb__header-right">
                  <span className="cpb__count">{items.length}</span>
                  {columnTotal > 0 && (
                    <span className="cpb__total">{formatCurrency(columnTotal)}</span>
                  )}
                </div>
              </header>

              <div className="cpb__stack">
                {items.length === 0 ? (
                  <div className="cpb__empty">{emptyMessage}</div>
                ) : (
                  items.map((row) => (
                    <button
                      key={row.id}
                      type="button"
                      className="cpb__card"
                      onClick={() => onSelect(row)}
                      style={{ "--cpb-accent": dotColor }}
                    >
                      <div className="cpb__card-top">
                        <span className="cpb__card-type">
                          {formatCrmTypeLabel(row.opportunity_type || row.lead_type)}
                        </span>
                        <span className="cpb__card-value">
                          {formatCurrency(row.estimated_value)}
                        </span>
                      </div>
                      <p className="cpb__card-location">
                        {row.state || "No state"}{row.county ? `, ${row.county}` : ""}
                      </p>
                      <div className="cpb__card-meta">
                        <span className="cpb__card-tag">
                          {formatCrmTypeLabel(row.route_type)}
                        </span>
                        <span className="cpb__card-owner">
                          {row.owner || "Harvest Drone"}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}

export default CrmPipelineBoard;
