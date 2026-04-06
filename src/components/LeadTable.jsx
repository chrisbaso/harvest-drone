import { useEffect, useMemo, useState } from "react";

const ROWS_PER_PAGE = 25;

const css = `
.lt {
  --lt-bg: #0C0F0A;
  --lt-surface: #151A12;
  --lt-card-bg: #1A2015;
  --lt-border: rgba(255,255,255,0.06);
  --lt-border-hover: rgba(255,255,255,0.12);
  --lt-text: #E8E6E1;
  --lt-text-muted: #727966;
  --lt-accent: #A3D977;
  --lt-accent-dim: rgba(163,217,119,0.10);
  --lt-row-hover: rgba(255,255,255,0.025);
  --lt-row-stripe: rgba(255,255,255,0.012);
  --lt-sans: 'Instrument Sans', 'Inter', system-ui, sans-serif;

  background: var(--lt-surface);
  border: 1px solid var(--lt-border);
  border-radius: 12px;
  overflow: hidden;
  font-family: var(--lt-sans);
  -webkit-font-smoothing: antialiased;
}

.lt__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--lt-border);
}
.lt__header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.lt__title {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  margin: 0;
}
.lt__count {
  font-size: 12px;
  font-weight: 600;
  color: var(--lt-accent);
  background: var(--lt-accent-dim);
  padding: 3px 10px;
  border-radius: 10px;
}

.lt__wrap {
  overflow-x: auto;
}

.lt__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;
}
.lt__table thead {
  position: sticky;
  top: 0;
  z-index: 2;
}
.lt__table th {
  padding: 12px 20px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--lt-text-muted);
  background: var(--lt-card-bg);
  text-align: left;
  white-space: nowrap;
  border-bottom: 1px solid var(--lt-border);
  user-select: none;
}
.lt__table th:first-child {
  padding-left: 24px;
}
.lt__table th:last-child {
  padding-right: 24px;
}
.lt__table td {
  padding: 14px 20px;
  color: var(--lt-text);
  border-bottom: 1px solid var(--lt-border);
  vertical-align: middle;
  line-height: 1.45;
}
.lt__table td:first-child {
  padding-left: 24px;
}
.lt__table td:last-child {
  padding-right: 24px;
}
.lt__table tbody tr {
  transition: background 0.1s;
}
.lt__table tbody tr:nth-child(even) {
  background: var(--lt-row-stripe);
}
.lt__table tbody tr:hover {
  background: var(--lt-row-hover);
}
.lt__table tbody tr.lt-row--clickable {
  cursor: pointer;
}

.lt__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  font-size: 14px;
  color: var(--lt-text-muted);
  text-align: center;
  line-height: 1.6;
}

.lt__pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  border-top: 1px solid var(--lt-border);
}
.lt__page-info {
  font-size: 12px;
  color: var(--lt-text-muted);
}
.lt__page-buttons {
  display: flex;
  gap: 6px;
}
.lt__page-btn {
  font-family: var(--lt-sans);
  font-size: 12px;
  font-weight: 600;
  color: var(--lt-text);
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--lt-border);
  border-radius: 6px;
  padding: 6px 14px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.lt__page-btn:hover:not(:disabled) {
  background: var(--lt-accent-dim);
  border-color: var(--lt-border-hover);
}
.lt__page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

@media (max-width: 600px) {
  .lt__header {
    padding: 16px 16px;
  }
  .lt__table th,
  .lt__table td {
    padding: 10px 12px;
    font-size: 12px;
  }
  .lt__table th:first-child,
  .lt__table td:first-child {
    padding-left: 16px;
  }
  .lt__pagination {
    padding: 12px 16px;
    flex-direction: column;
    gap: 10px;
  }
}
`;

function LeadTable({
  title,
  columns,
  rows,
  countLabel = "records",
  getRowProps,
  emptyMessage = "No records available yet.",
}) {
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(rows.length / ROWS_PER_PAGE));
  const showPagination = rows.length > ROWS_PER_PAGE;

  const visibleRows = useMemo(
    () => rows.slice(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE),
    [rows, page],
  );

  useEffect(() => {
    if (page >= totalPages) {
      setPage(0);
    }
  }, [page, totalPages, rows.length]);

  return (
    <>
      <style>{css}</style>
      <section className="lt">
        <div className="lt__header">
          <div className="lt__header-left">
            <h3 className="lt__title">{title}</h3>
            <span className="lt__count">
              {rows.length} {countLabel}
            </span>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="lt__empty">{emptyMessage}</div>
        ) : (
          <>
            <div className="lt__wrap">
              <table className="lt__table">
                <thead>
                  <tr>
                    {columns.map((column) => (
                      <th key={column.key}>{column.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => {
                    const rowProps = getRowProps ? getRowProps(row) : {};
                    const className = [
                      rowProps.className || "",
                      rowProps.onClick ? "lt-row--clickable" : "",
                    ]
                      .filter(Boolean)
                      .join(" ");

                    return (
                      <tr key={row.id} {...rowProps} className={className}>
                        {columns.map((column) => (
                          <td key={column.key}>
                            {column.render ? column.render(row) : row[column.key]}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {showPagination && (
              <div className="lt__pagination">
                <span className="lt__page-info">
                  Showing {page * ROWS_PER_PAGE + 1}-{Math.min((page + 1) * ROWS_PER_PAGE, rows.length)} of {rows.length}
                </span>
                <div className="lt__page-buttons">
                  <button
                    type="button"
                    className="lt__page-btn"
                    disabled={page === 0}
                    onClick={() => setPage((currentPage) => currentPage - 1)}
                  >
                    {"< Prev"}
                  </button>
                  <button
                    type="button"
                    className="lt__page-btn"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((currentPage) => currentPage + 1)}
                  >
                    {"Next >"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}

export default LeadTable;
