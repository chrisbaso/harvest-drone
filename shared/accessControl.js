export const ENTERPRISE_DEMO_ROLE = "enterprise_demo";
export const ENTERPRISE_DEMO_HOME = "/enterprise/rdo/division";

export function normalizePathname(pathname = "/") {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

export function isEnterpriseDemoProfile(profile) {
  return profile?.role === ENTERPRISE_DEMO_ROLE;
}

export function isEnterpriseDemoRoute(pathname = "/") {
  const normalizedPath = normalizePathname(pathname);
  return normalizedPath === "/enterprise/rdo" || normalizedPath.startsWith("/enterprise/rdo/");
}

export function redirectForRole(role) {
  if (role === ENTERPRISE_DEMO_ROLE) return ENTERPRISE_DEMO_HOME;
  if (role === "admin") return "/admin";
  if (role === "network_manager") return "/network";
  if (role === "dealer") return "/dealer";
  if (role === "operator") return "/training";
  return "/training";
}

export function getLoginRedirectPath(profile, requestedPath) {
  if (isEnterpriseDemoProfile(profile)) {
    return ENTERPRISE_DEMO_HOME;
  }

  return requestedPath || redirectForRole(profile?.role);
}

export function getRestrictedProfileRedirect(profile, pathname) {
  if (isEnterpriseDemoProfile(profile) && !isEnterpriseDemoRoute(pathname)) {
    return ENTERPRISE_DEMO_HOME;
  }

  return null;
}

export function canAccessProtectedRoute(profile, allowedRoles, pathname = "/") {
  if (!profile) {
    return false;
  }

  if (isEnterpriseDemoProfile(profile)) {
    return isEnterpriseDemoRoute(pathname) && (!allowedRoles?.length || allowedRoles.includes(ENTERPRISE_DEMO_ROLE));
  }

  return !allowedRoles?.length || allowedRoles.includes(profile.role);
}
