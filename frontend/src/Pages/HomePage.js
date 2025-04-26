// src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../Styles/HomePage.css';
import Camera from '../Assets/Camera.png';

const HomePage = () => {
  return (
    <div className="home-container">
      <h1>Automated Attendance System</h1>
      <div className="image-container">
        <img src={Camera} alt="Attendance System" />
      </div>
      <div className="auth-buttons">
        <Link to="/admin-login" className="btn">Admin Login</Link>
        <Link to="/student-login" className="btn">Student Login</Link>
        <Link to="/register" className="btn">Register</Link>
      </div>
    </div>
  );
};

export default HomePage;
