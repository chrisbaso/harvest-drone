import { formatCrmStageLabel, formatCrmTypeLabel } from "../lib/crm";

const css = `
.cf {
  --cf-bg: #151A12;
  --cf-surface: #1A2015;
  --cf-border: rgba(255,255,255,0.06);
  --cf-border-focus: rgba(163,217,119,0.4);
  --cf-text: #E8E6E1;
  --cf-text-muted: #727966;
  --cf-accent: #A3D977;
  --cf-accent-dim: rgba(163,217,119,0.10);
  --cf-input-bg: #0E1209;
  --cf-sans: 'Instrument Sans', 'Inter', system-ui, sans-serif;

  display: flex;
  align-items: flex-end;
  gap: 10px;
  padding: 16px 20px;
  background: var(--cf-bg);
  border: 1px solid var(--cf-border);
  border-radius: 12px;
  font-family: var(--cf-sans);
  -webkit-font-smoothing: antialiased;
  flex-wrap: wrap;
}

.cf__search {
  flex: 1.6;
  min-width: 200px;
}

.cf__field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
  min-width: 130px;
}

.cf__label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--cf-text-muted);
  padding-left: 2px;
}

.cf__input,
.cf__select {
  font-family: var(--cf-sans);
  font-size: 13px;
  color: var(--cf-text);
  background: var(--cf-input-bg);
  border: 1px solid var(--cf-border);
  border-radius: 8px;
  padding: 9px 12px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  width: 100%;
}
.cf__input::placeholder {
  color: var(--cf-text-muted);
}
.cf__input:focus,
.cf__select:focus {
  border-color: var(--cf-border-focus);
  box-shadow: 0 0 0 2px var(--cf-accent-dim);
}

.cf__select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23727966' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 32px;
  cursor: pointer;
}
.cf__select.is-filtered {
  border-color: rgba(163,217,119,0.25);
  background-color: rgba(163,217,119,0.04);
}

.cf__active-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding-top: 4px;
  flex-wrap: wrap;
}
.cf__active-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--cf-accent);
  background: var(--cf-accent-dim);
  padding: 4px 10px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-family: var(--cf-sans);
  transition: background 0.15s;
}
.cf__active-pill:hover {
  background: rgba(163,217,119,0.18);
}
.cf__active-pill__x {
  font-size: 13px;
  line-height: 1;
  opacity: 0.7;
}
.cf__clear-all {
  font-family: var(--cf-sans);
  font-size: 11px;
  font-weight: 600;
  color: var(--cf-text-muted);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: color 0.15s;
}
.cf__clear-all:hover {
  color: var(--cf-text);
}

@media (max-width: 768px) {
  .cf {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    padding: 14px 16px;
  }
  .cf__search,
  .cf__field {
    min-width: unset;
    flex: unset;
  }
  .cf__filters-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
}
`;

function CrmFilters({
  searchQuery,
  typeFilter,
  stageFilter,
  stateFilter,
  ownerFilter,
  typeOptions,
  stageOptions,
  stateOptions,
  ownerOptions,
  onSearchChange,
  onTypeChange,
  onStageChange,
  onStateChange,
  onOwnerChange,
}) {
  const activeFilters = [
    typeFilter !== "all" && { label: formatCrmTypeLabel(typeFilter), clear: () => onTypeChange("all") },
    stageFilter !== "all" && { label: formatCrmStageLabel(stageFilter), clear: () => onStageChange("all") },
    stateFilter !== "all" && { label: stateFilter, clear: () => onStateChange("all") },
    ownerFilter !== "all" && { label: ownerFilter, clear: () => onOwnerChange("all") },
  ].filter(Boolean);

  const hasFilters = activeFilters.length > 0 || searchQuery.length > 0;

  function clearAll() {
    onSearchChange("");
    onTypeChange("all");
    onStageChange("all");
    onStateChange("all");
    onOwnerChange("all");
  }

  return (
    <>
      <style>{css}</style>
      <section className="cf">
        <div className="cf__field cf__search">
          <span className="cf__label">Search</span>
          <input
            className="cf__input"
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Names, accounts, states, counties..."
          />
        </div>

        <div className="cf__field">
          <span className="cf__label">Type</span>
          <select
            className={`cf__select${typeFilter !== "all" ? " is-filtered" : ""}`}
            value={typeFilter}
            onChange={(e) => onTypeChange(e.target.value)}
          >
            <option value="all">All types</option>
            {typeOptions.map((type) => (
              <option key={type} value={type}>{formatCrmTypeLabel(type)}</option>
            ))}
          </select>
        </div>

        <div className="cf__field">
          <span className="cf__label">Stage</span>
          <select
            className={`cf__select${stageFilter !== "all" ? " is-filtered" : ""}`}
            value={stageFilter}
            onChange={(e) => onStageChange(e.target.value)}
          >
            <option value="all">All stages</option>
            {stageOptions.map((stage) => (
              <option key={stage} value={stage}>{formatCrmStageLabel(stage)}</option>
            ))}
          </select>
        </div>

        <div className="cf__field">
          <span className="cf__label">State</span>
          <select
            className={`cf__select${stateFilter !== "all" ? " is-filtered" : ""}`}
            value={stateFilter}
            onChange={(e) => onStateChange(e.target.value)}
          >
            <option value="all">All states</option>
            {stateOptions.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>

        <div className="cf__field">
          <span className="cf__label">Owner</span>
          <select
            className={`cf__select${ownerFilter !== "all" ? " is-filtered" : ""}`}
            value={ownerFilter}
            onChange={(e) => onOwnerChange(e.target.value)}
          >
            <option value="all">All owners</option>
            {ownerOptions.map((owner) => (
              <option key={owner} value={owner}>{owner}</option>
            ))}
          </select>
        </div>

        {hasFilters && (
          <div className="cf__active-row">
            {activeFilters.map((filter) => (
              <button
                key={filter.label}
                type="button"
                className="cf__active-pill"
                onClick={filter.clear}
              >
                {filter.label}
                <span className="cf__active-pill__x">x</span>
              </button>
            ))}
            {searchQuery.length > 0 && (
              <span className="cf__active-pill" aria-hidden="true">
                Search: {searchQuery}
              </span>
            )}
            <button type="button" className="cf__clear-all" onClick={clearAll}>
              Clear all
            </button>
          </div>
        )}
      </section>
    </>
  );
}

export default CrmFilters;
