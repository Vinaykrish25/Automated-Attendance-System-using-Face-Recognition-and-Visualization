// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import Sidebar from './Sidebar';
import ThemeSwitcher from './ThemeSwitcher';
import api from '../api';
import '../Styles/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "Guest");
  const [showDropdown, setShowDropdown] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch user data using the getUser endpoint if token exists
  useEffect(() => {
    if (token) {
      api.get('/users/getUser', { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => {
          if (res.data.user && res.data.user.name) {
            setUserName(res.data.user.name);
            localStorage.setItem("userName", res.data.user.name);
          }
        })
        .catch((err) => {
          console.error("Error fetching user data:", err.response?.data || err.message);
        });
    }
  }, [token]);

  // Logout function calls backend then clears storage and navigates home
  const handleLogout = async () => {
    try {
      await api.post('/users/logout', {}, { headers: { Authorization: `Bearer ${token}` } });
    } catch (error) {
      console.error("Logout error:", error.response?.data || error.message);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    setUserName("Guest");
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        {/* Sidebar provides a toggleable menu icon */}
        <Sidebar />
      </div>
      <div className="nav-right">
        {/* ThemeSwitcher is shown in the header */}
        <ThemeSwitcher />
        <div className="user-profile" onClick={() => setShowDropdown(!showDropdown)}>
          <FaUserCircle className="profile-icon" size={24} />
          <span className="user-name">{userName}</span>
          {showDropdown && (
            <div className="dropdown">
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
