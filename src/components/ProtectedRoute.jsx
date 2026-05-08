import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RouteLoading from "./RouteLoading";
import { ENTERPRISE_DEMO_HOME, canAccessProtectedRoute, getRestrictedProfileRedirect } from "../../shared/accessControl";

function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <RouteLoading label="Checking access" hint="Confirming your Harvest Drone workspace permissions." />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const restrictedRedirect = getRestrictedProfileRedirect(profile, location.pathname);

  if (restrictedRedirect) {
    return <Navigate to={restrictedRedirect} replace />;
  }

  if (!canAccessProtectedRoute(profile, allowedRoles, location.pathname)) {
    return <Navigate to={profile?.role === "enterprise_demo" ? ENTERPRISE_DEMO_HOME : "/login"} replace />;
  }

  return children;
}

export default ProtectedRoute;
