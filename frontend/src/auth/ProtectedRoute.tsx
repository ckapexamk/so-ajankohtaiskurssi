import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";
import { getToken, clearToken } from "../auth/token";
import apiReq from "../api/client";


const ProtectedRoute: React.FC = (): React.ReactElement => {
  const [auth, setAuth] = useState(false);
  const [checkAuth, setCheckAuth] = useState(true);

  useEffect(() => {
    const authUser = async (): Promise<void> => {
      const token = getToken();
    
      if (!token) {
        setCheckAuth(false);
        return;
      }

      try {
        await apiReq("/auth/me");
        setAuth(true);

      } catch (error) {
        if (error instanceof Error && error.message.includes("401")) {
          clearToken();
        }
        setAuth(false);

      } finally {
        setCheckAuth(false);
      }
    };
    
    authUser();
  }, []);
  
  if (checkAuth) {
    return <p>Authenticating...</p>;
  }

  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;