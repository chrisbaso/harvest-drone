import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RouteLoading from "./RouteLoading";

function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <RouteLoading label="Checking access" hint="Confirming your Harvest Drone workspace permissions." />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(profile?.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
