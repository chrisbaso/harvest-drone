import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PUBLIC_LANDING_ROUTES = new Set([
  "/growers",
  "/operators",
  "/hylio",
  "/source",
  "/source-acre-review",
  "/source-review",
  "/source-acre-review/results",
  "/source-acre-review/thank-you",
  "/privacy",
  "/terms",
  "/login",
  "/join",
]);

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
  const { profile, isAuthenticated, signOut } = useAuth();
  const isPublic = isPublicLandingRoute(location.pathname);
  const role = profile?.role;

  const navItems =
    role === "admin"
      ? [
          ["Dashboard", "/dashboard"],
          ["CRM", "/crm"],
          ["Admin", "/admin"],
          ["Agent", "/agent"],
          ["Training", "/training"],
          ["Demo", "/demo"],
          ["How it works", "/how-it-works"],
        ]
      : role === "network_manager"
        ? [
            ["Network Dashboard", "/network"],
            ["Dealers", "/network"],
            ["Reports", "/network"],
            ["Demo", "/demo"],
          ]
        : role === "dealer"
          ? [
              ["My Dashboard", "/dealer"],
              ["My Leads", "/dealer"],
              ["My Training", "/training"],
              ["Demo", "/demo"],
            ]
          : role === "operator"
            ? [
                ["My Training", "/training"],
                ["My Assignments", "/jobs/1842/readiness"],
                ["Demo", "/demo"],
              ]
            : [];

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

        {!isPublic && isAuthenticated ? (
          <nav className="topnav">
            {navItems.map(([label, href]) => (
              <NavLink key={`${label}-${href}`} to={href}>
                {label}
              </NavLink>
            ))}
            <button type="button" className="topnav__button" onClick={signOut}>
              Logout
            </button>
          </nav>
        ) : null}
      </header>

      <main className={compact ? "page compact-page" : "page"}>{children}</main>
    </div>
  );
}

export default Shell;
