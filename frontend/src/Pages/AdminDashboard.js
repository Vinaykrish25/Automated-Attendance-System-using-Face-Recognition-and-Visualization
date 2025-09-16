// src/pages/AdminDashboard.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../Styles/AdminDashboard.css";

const AdminDashboard = () => {
  const [userName, setUserName] = useState("Admin");

  useEffect(() => {
    const name = localStorage.getItem("userName");
    if (name) {
      setUserName(name);
    }
  }, []);

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard 👨🏻‍💻</h1>
      <h3>Welcome, {userName}</h3>
      <nav>
        <ul>
          <li><Link to="/attendance">All Attendance 🗓️</Link></li>
          <li><Link to="/attendance-visualization">Attendance Visualization 📶</Link></li>
          {/* <li><Link to="/powerbi-report">Power BI Report 📊</Link></li> */}
        </ul>
      </nav>
    </div>
  );
};

export default AdminDashboard;
