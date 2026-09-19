import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminProtectedRouter() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h2 className="text-sm font-bold text-gray-600">
          Checking admin access...
        </h2>
      </div>
    );
  }

  // Login nahi hai
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Login hai but Admin nahi hai
  if (user.role !== "ADMIN") {
    return <Navigate to="/my-rides" replace />;
  }

  // Admin hai
  return <Outlet context={{ user }} />;
}