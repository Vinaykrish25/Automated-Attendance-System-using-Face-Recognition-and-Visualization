// src/components/PublicRoute.js
import React, { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import api from "../api";

const PublicRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      return;
    }
    api.get("/users/verify", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (res.data && res.data.user) {
          setIsAuthenticated(true);
          localStorage.setItem("userRole", res.data.user.role);
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch((err) => {
        setIsAuthenticated(false);
      });
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    const role = localStorage.getItem("userRole");
    if (role === "admin") {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (role === "student") {
      return <Navigate to="/student-dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default PublicRoute;
