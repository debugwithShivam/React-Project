import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectiveRouter({ type = "protected" }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <h2 className="text-sm font-bold text-gray-600">
          Checking authentication...
        </h2>
      </div>
    );
  }

  const isAuthenticated = Boolean(user);

  if (type === "protected") {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    return <Outlet context={{ user }} />;
  }

  if (type === "guest") {
    if (isAuthenticated) {
      return <Navigate to="/my-rides" replace />;
    }

    return <Outlet />;
  }

  return <Outlet />;
}