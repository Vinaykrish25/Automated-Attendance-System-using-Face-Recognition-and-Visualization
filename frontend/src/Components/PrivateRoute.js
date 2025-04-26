// src/components/PrivateRoute.js
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = ({ allowedRoles, redirectPath, showLoginMessage }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  // If there's no token
  if (!token) {
    if (showLoginMessage) {
      return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <h2>You can see this page only if you log in 🚫</h2>
        </div>
      );
    } else {
      return <Navigate to={redirectPath || "/admin-login"} replace />;
    }
  }

  // If token exists but role is not allowed
  if (!allowedRoles.includes(userRole)) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h2>Access Denied ⚠️</h2>
        <p>You are not authorized to view this page.</p>
      </div>
    );
  }

  return <Outlet />;
};

export default PrivateRoute;
