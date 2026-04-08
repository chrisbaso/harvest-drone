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
            <NavLink to="/dashboard">Dashboard</NavLink>
          </nav>
        </header>
      ) : null}

      <main className={compact ? "page compact-page" : "page"}>{children}</main>
    </div>
  );
}

export default Shell;
