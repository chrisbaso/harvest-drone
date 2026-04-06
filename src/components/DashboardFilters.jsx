function DashboardFilters({
  leadTypeFilter,
  routeTypeFilter,
  statusFilter,
  stateFilter,
  countyFilter,
  routeTypeOptions,
  statusOptions,
  stateOptions,
  countyOptions,
  onLeadTypeChange,
  onRouteTypeChange,
  onStatusChange,
  onStateChange,
  onCountyChange,
}) {
  return (
    <section className="filter-bar card">
      <div className="filter-group">
        <label className="field">
          <span>Lead type</span>
          <select value={leadTypeFilter} onChange={(event) => onLeadTypeChange(event.target.value)}>
            <option value="all">All leads</option>
            <option value="grower">Growers</option>
            <option value="operator">Operators</option>
          </select>
        </label>
      </div>

      <div className="filter-group">
        <label className="field">
          <span>Route type</span>
          <select value={routeTypeFilter} onChange={(event) => onRouteTypeChange(event.target.value)}>
            <option value="all">All route types</option>
            {routeTypeOptions.map((routeType) => (
              <option key={routeType} value={routeType}>
                {routeType}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="filter-group">
        <label className="field">
          <span>Status</span>
          <select value={statusFilter} onChange={(event) => onStatusChange(event.target.value)}>
            <option value="all">All statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="filter-group">
        <label className="field">
          <span>State</span>
          <select value={stateFilter} onChange={(event) => onStateChange(event.target.value)}>
            <option value="all">All states</option>
            {stateOptions.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="filter-group">
        <label className="field">
          <span>County</span>
          <select value={countyFilter} onChange={(event) => onCountyChange(event.target.value)}>
            <option value="all">All counties</option>
            {countyOptions.map((county) => (
              <option key={county} value={county}>
                {county}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}

export default DashboardFilters;
