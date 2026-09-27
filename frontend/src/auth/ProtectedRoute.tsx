import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router";
import { getToken, clearToken } from "../auth/token";
import apiReq from "../api/client";
import Header from "../auth/Header";

export interface User {
  id: string;
  email: string;
  display_name: string;
}

const ProtectedRoute: React.FC = (): React.ReactElement => {
  const [user, setUser] = useState<User | null>(null);
  const [checkAuth, setCheckAuth] = useState(true);
  const redirect = useNavigate();

  useEffect(() => {
    const authUser = async (): Promise<void> => {
    
      if (!getToken()) {
        setCheckAuth(false);
        return;
      }

      try {
        const currentUser = await apiReq<User>("/auth/me");
        setUser(currentUser);

      } catch (error) {
        if (error instanceof Error && error.message.includes("401")) {
          clearToken();
        }
        setUser(null);

      } finally {
        setCheckAuth(false);
      }
    };
    
    authUser();
  }, []);
  
  const logoutUser = (): void => {
    clearToken();
    setUser(null);
    redirect("/login", { replace: true });
  };

  if (checkAuth) {
    return <p>Authenticating...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Header user={user} logout={logoutUser} />
      <Outlet />
    </>
  )
}

export default ProtectedRoute;