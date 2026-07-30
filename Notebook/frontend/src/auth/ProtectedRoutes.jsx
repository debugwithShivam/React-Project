import React, { useEffect, useState } from "react";
import axios from "axios";
import {Navigate, Outlet} from 'react-router-dom'

export default function ProtectedRoutes() {
  const [isLoading, setLoading] = useState(true);
  const [isAuthenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    async function check(params) {
      try {
        const response = await axios.get(
          "http://localhost:5000/authRouter/check-auth",
          {
            withCredentials: true,
          },
        );
        setAuthenticated(response.data.authenticated);
        localStorage.setItem('removebutton',response.data.authenticated)
      } catch (error) {
        setLoading(false);
        setAuthenticated(false);
      }finally{
        setLoading(false)
      }
    }
    check();
  }, []);
  if(isLoading){
      return <h2>Loading...</h2>;
  }

 return isAuthenticated ? <Outlet/> : <Navigate to='/login' replace/>
}
