import React, { useEffect, useState } from "react";
import axios from "axios";
import { Navigate, Outlet } from 'react-router-dom'
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setIsAuthenticated,setUser } from "../Redux/Slice";


export default function ProtectedRoutes() {
  const navigate = useNavigate();
  const dispatch = useDispatch()
  const [isLoading, setLoading] = useState(true);
  const [isAuthenticated, setAuthenticated] = useState(false);
  
  
  useEffect(() => {
    async function check() {
      try {
        const res = await axios.get(
          "https://react-project-ckcb.onrender.com/authRouter/check-auth",
          { withCredentials: true }
        );
        
        setAuthenticated(res.data.authenticated);
        dispatch(setIsAuthenticated(res.data.authenticated))
        dispatch(setUser(res.data.user))
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

  return isAuthenticated ? <Outlet /> : <Navigate to='/login' replace />
}
