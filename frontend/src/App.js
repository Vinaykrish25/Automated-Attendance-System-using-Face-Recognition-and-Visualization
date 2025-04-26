// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Sidebar from "./Components/Sidebar";
import PublicRoute from "./Components/PublicRoute";
import PrivateRoute from "./Components/PrivateRoute";
import HomePage from "./Pages/HomePage";
import AdminLogin from "./Pages/auth/AdminLogin";
import StudentLogin from "./Pages/auth/StudentLogin";
import Register from "./Pages/auth/Register";
import ForgotPassword from "./Pages/auth/ForgotPassword"
import AdminDashboard from "./Pages/AdminDashboard";
import StudentDashboard from "./Pages/StudentDashboard";
import AttendanceTable from "./Pages/AttendanceTable";
import AttendanceVisualization from "./Pages/AttendanceVisualization";
import PowerBIReport from "./Pages/PowerBIReport";
import "./Styles/global.css";

function App() {
  return (
    <Router>
      <Navbar />
      <Sidebar />
      <Routes>
        {/* Public HomePage */}
        <Route path="/" element={<HomePage />} />

        {/* Public routes for login/register */}
        <Route element={<PublicRoute />}>
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/student-login" element={<StudentLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Protected routes for common pages (attendance, visualization, PowerBI) */}
        <Route element={<PrivateRoute allowedRoles={["admin", "student"]} showLoginMessage={true} />}>
          <Route path="/attendance" element={<AttendanceTable />} />
          <Route path="/attendance-visualization" element={<AttendanceVisualization />} />
          <Route path="/powerbi-report" element={<PowerBIReport />} />
        </Route>

        {/* Admin-only route */}
        <Route element={<PrivateRoute allowedRoles={["admin"]} redirectPath="/admin-login" />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Route>

        {/* Student-only route */}
        <Route element={<PrivateRoute allowedRoles={["student"]} redirectPath="/student-login" />}>
          <Route path="/student-dashboard" element={<StudentDashboard />} />
        </Route>

        {/* Redirect unmatched routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
