import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/authContext";

type Role = "CUSTOMER" | "ORGANIZER" | "ADMIN";

interface Props {
  allowedRoles?: Role[];
}

const ProtectedRoute = ({ allowedRoles }: Props) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Restoring session...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/events" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
