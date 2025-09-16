// src/pages/StudentDashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../Styles/StudentDashboard.css';

const StudentDashboard = () => {
  const [userName, setUserName] = useState("Student");

  useEffect(() => {
    const name = localStorage.getItem("userName");
    if (name) {
      setUserName(name);
    }
  }, []);

  return (
    <div className="student-dashboard">
      <h1>Student Dashboard 👨🏻‍🎓</h1>
      <h3>Welcome, {userName}</h3>
      <nav>
        <ul>
          <li><Link to="/attendance">My Attendance 🗓️</Link></li>
          <li><Link to="/attendance-visualization">Attendance Visualization 📶</Link></li>
          {/* <li><Link to="/powerbi-report">Power BI Report 📊</Link></li> */}
        </ul>
      </nav>
    </div>
  );
};

export default StudentDashboard;
