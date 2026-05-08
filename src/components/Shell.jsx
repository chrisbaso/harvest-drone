import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ENTERPRISE_DEMO_HOME, ENTERPRISE_DEMO_ROLE } from "../../shared/accessControl";

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
  "/enterprise",
  "/roi-calculator",
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
    (route) => normalizedPath === route || (route !== "/enterprise" && normalizedPath.startsWith(`${route}/`)),
  );
}

function Shell({ children, compact = false }) {
  const location = useLocation();
  const { profile, isAuthenticated, signOut } = useAuth();
  const isPublic = isPublicLandingRoute(location.pathname);
  const role = profile?.role;
  const homeHref = role === ENTERPRISE_DEMO_ROLE ? ENTERPRISE_DEMO_HOME : "/";

  const navItems =
    role === "admin"
      ? [
          ["HD Dashboard", "/dashboard"],
          ["CRM", "/crm"],
          ["Daily Ops", "/admin/daily-ops"],
          ["HD Agent", "/agent"],
          ["HD Academy", "/training"],
          ["Admin", "/admin"],
          ["RDO Demo", "/enterprise/rdo/division"],
        ]
      : role === "network_manager"
        ? [
            ["HD Network", "/network"],
            ["HD Fleet", "/fleet"],
            ["HD Scheduler", "/scheduler"],
            ["RDO Demo", "/enterprise/rdo/division"],
          ]
        : role === "dealer"
          ? [
              ["HD Dashboard", "/dealer"],
              ["HD Fleet", "/fleet"],
              ["HD Scheduler", "/scheduler"],
              ["HD Academy", "/training"],
              ["RDO Demo", "/enterprise/rdo/division"],
            ]
          : role === "operator"
            ? [
                ["HD Academy", "/training"],
                ["Qualification", "/training/qualification"],
              ]
            : role === ENTERPRISE_DEMO_ROLE
              ? [["RDO Demo", ENTERPRISE_DEMO_HOME]]
            : [];

  return (
    <div className="site-shell">
      <header className="topbar">
        <Link className="brandmark" to={homeHref}>
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
