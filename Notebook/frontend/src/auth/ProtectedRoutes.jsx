import React, { useEffect, useState } from "react";
import axios from "axios";
import { Navigate, Outlet } from 'react-router-dom'

export default function ProtectedRoutes() {
  const [isLoading, setLoading] = useState(true);
  const [isAuthenticated, setAuthenticated] = useState(false);


  useEffect(() => {
    async function check() {
      try {
        const res = await axios.get(
          "http://localhost:5000/authRouter/check-auth",
          { withCredentials: true }
        );

        setAuthenticated(res.data.authenticated);
      } catch {
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }

    check();
  }, []);
  if (isLoading) {
    return <h2>Loading...</h2>;
  }
  console.log(isAuthenticated)

  return isAuthenticated ? <Outlet /> : <Navigate to='/login' replace />
}
