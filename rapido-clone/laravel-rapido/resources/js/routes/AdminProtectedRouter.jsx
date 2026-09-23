import { Navigate, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";

const getCurrentUser = async () => {
  const response = await api.get("/users/me");
  return response.data;
};

export default function AdminProtectedRouter() {
  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h2 className="text-sm font-bold text-gray-600">
          Checking admin access...
        </h2>
      </div>
    );
  }

  const user = data?.success ? data.user : null;

  // Login nahi hai
  if (isError || !user) {
    return <Navigate to="/login" replace />;
  }

  // Login hai but Admin nahi hai
  if (user.role !== "ADMIN") {
    return <Navigate to="/my-rides" replace />;
  }

  // Admin hai
  return <Outlet context={{ user }} />;
}