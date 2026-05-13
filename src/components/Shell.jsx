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
  "/blog",
  "/auth/callback",
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
  const internalHomeHref = role === "operator" ? "/operator/jobs" : "/ops";
  const homeHref = role === ENTERPRISE_DEMO_ROLE ? ENTERPRISE_DEMO_HOME : isAuthenticated ? internalHomeHref : "/";

  const navItems =
    role === ENTERPRISE_DEMO_ROLE
      ? [["RDO Demo", ENTERPRISE_DEMO_HOME]]
      : role === "operator"
        ? [
            ["My Jobs", "/operator/jobs"],
            ["Academy", "/training"],
          ]
        : ["admin", "network_manager", "dealer"].includes(role)
          ? [
              ["Ops", "/ops"],
              ["Academy", "/training"],
              ...(role === "admin" ? [["Blog", "/admin/blog"]] : []),
            ]
          : [];

  return (
    <div className="site-shell">
      <header className="topbar">
        <Link className="brandmark" to={homeHref}>
          <span className="brandmark__badge">HD</span>
          <span>
            Harvest Drone
            <small>Field operations and training</small>
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
