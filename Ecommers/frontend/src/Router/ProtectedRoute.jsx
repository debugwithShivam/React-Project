import React, { useEffect, useState } from "react";
import axios from "axios";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import Setting from "../components/Setting/Setting";

export default function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const [authStatus, setAuthStatus] = useState(() => {
    const stored = localStorage.getItem("authStatus");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await axios.get("http://localhost:4876/auth/checkAuth", {
          withCredentials: true,
        });

        const isAuthenticated = response.data.authenticated;
        localStorage.setItem("authStatus", JSON.stringify(isAuthenticated));
         setAuthStatus(response.data.authenticated);
      } catch (err) {
        localStorage.setItem("authStatus", JSON.stringify(false));
        setAuthStatus(false);
      }
    }

      checkAuth();
  }, []);

  if (authStatus === null) {
    return <h1>Loading...</h1>;
  }

return authStatus ? <Setting/> : <Navigate to="/login" replace />;
  

  return children;
}
