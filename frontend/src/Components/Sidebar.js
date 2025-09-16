// src/components/Sidebar.js
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import '../Styles/Sidebar.css';
import api from '../api';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  // Close sidebar on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Logout user
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.post('/users/logout', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Logout error:", error);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("userName");

    // Force refresh to reflect username change everywhere
    window.location.reload(); // ✅ ensures Navbar re-fetches or reads updated name

    navigate('/');
  };

  return (
    <>
      {!isOpen && (
        <button className="menu-btn" onClick={() => setIsOpen(true)}>
          <FaBars size={24} />
        </button>
      )}

      {isOpen && (
        <div ref={sidebarRef} className="sidebar open">
          <button className="close-btn" onClick={() => setIsOpen(false)}>
            <FaTimes size={24} />
          </button>

          <ul className="sidebar-links">
            <li><Link to="/" onClick={() => setIsOpen(false)}>Home 🏠</Link></li>
            <li><Link to="/admin-dashboard" onClick={() => setIsOpen(false)}>Admin Dashboard 👨🏻‍💻</Link></li>
            <li><Link to="/student-dashboard" onClick={() => setIsOpen(false)}>Student Dashboard 👨🏻‍🎓</Link></li>
            <li><Link to="/attendance-visualization" onClick={() => setIsOpen(false)}>Attendance Visualization 📶</Link></li>
            {/* <li><Link to="/powerbi-report" onClick={() => setIsOpen(false)}>Power BI Report 📊</Link></li> */}
          </ul>

          <div className="sidebar-logout">
            <button onClick={handleLogout} className="logout-btn">
              <FaSignOutAlt style={{ marginRight: "8px" }} /> Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
