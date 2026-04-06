import { Link, NavLink } from "react-router-dom";

function Shell({ children, compact = false }) {
  return (
    <div className="site-shell">
      <header className="topbar">
        <Link className="brandmark" to="/">
          <span className="brandmark__badge">HD</span>
          <span>
            Harvest Drone
            <small>Revenue-first aerial operations</small>
          </span>
        </Link>

        <nav className="topnav">
          <NavLink to="/">Overview</NavLink>
          <NavLink to="/how-it-works">How it works</NavLink>
          <NavLink to="/growers">Growers</NavLink>
          <NavLink to="/source">SOURCE</NavLink>
          <NavLink to="/operators">Operators</NavLink>
          <NavLink to="/hylio">Hylio</NavLink>
          <NavLink to="/crm">CRM</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
        </nav>
      </header>

      <main className={compact ? "page compact-page" : "page"}>{children}</main>
    </div>
  );
}

export default Shell;
