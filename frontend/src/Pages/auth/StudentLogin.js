// src/pages/auth/StudentLogin.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import '../../Styles/StudentLogin.css';

const StudentLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    rollNumber: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/users/login', formData);
      if (res.data.user.role === 'student') {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userName', res.data.user.name);
        localStorage.setItem('userRole', res.data.user.role);
        setMessage("Login successful!");
        setMessageType("success");
        setTimeout(() => navigate('/student-dashboard'), 1500);
      } else {
        setMessage("Access Denied: Not a student");
        setMessageType("error");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed");
      setMessageType("error");
    }
  };

  return (
    <div className="student-login-container">
      <h2>Student Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="rollNumber"
          placeholder="Roll Number"
          value={formData.rollNumber}
          onChange={handleChange}
          required
        />
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <div className="show-password">
          <label>
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            Show Password
          </label>
        </div>
        <p className="forgot-password-link">
  <a href="/forgot-password">Forgot Password?</a>
</p>

        <button type="submit">Login</button>
        
      </form>
      {message && (
        <p className="message" style={{ color: messageType === "success" ? "green" : "red" }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default StudentLogin;
