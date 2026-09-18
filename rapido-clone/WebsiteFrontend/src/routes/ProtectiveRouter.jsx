import { Navigate, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";

const getCurrentUser = async () => {
  const response = await api.get("/users/me");
  return response.data;
};

export default function ProtectiveRouter({ type = "protected" }) {
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <h2 className="text-sm font-bold text-gray-600">
          Checking authentication...
        </h2>
      </div>
    );
  }

  const isAuthenticated =
    !isError && data?.success && data?.user;

  if (type === "protected") {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    return <Outlet context={{ user: data.user }} />;
  }

  if (type === "guest") {
    if (isAuthenticated) {
      return <Navigate to="/my-rides" replace />;
    }

    return <Outlet />;
  }

  return <Outlet />;
}