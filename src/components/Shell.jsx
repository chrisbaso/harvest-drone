import { Link, NavLink, useLocation } from "react-router-dom";

const PUBLIC_LANDING_ROUTES = new Set(["/growers", "/operators", "/hylio", "/source"]);

function normalizePathname(pathname = "/") {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

function isPublicLandingRoute(pathname) {
  const normalizedPath = normalizePathname(pathname);

  return [...PUBLIC_LANDING_ROUTES].some(
    (route) => normalizedPath === route || normalizedPath.startsWith(`${route}/`),
  );
}

function Shell({ children, compact = false }) {
  const location = useLocation();
  const showNavigation = !isPublicLandingRoute(location.pathname);

  return (
    <div className="site-shell">
      {showNavigation ? (
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
            <NavLink to="/agent" className="topnav__agent-link">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="10" height="8" rx="2" />
                <path d="M6 1.5h4M8 4V2" />
                <circle cx="6.5" cy="8" r="0.5" fill="currentColor" />
                <circle cx="9.5" cy="8" r="0.5" fill="currentColor" />
                <path d="M6.5 10h3" />
              </svg>
              <span>Agent</span>
            </NavLink>
            <NavLink to="/dashboard">Dashboard</NavLink>
          </nav>
        </header>
      ) : null}

      <main className={compact ? "page compact-page" : "page"}>{children}</main>
    </div>
  );
}

export default Shell;
