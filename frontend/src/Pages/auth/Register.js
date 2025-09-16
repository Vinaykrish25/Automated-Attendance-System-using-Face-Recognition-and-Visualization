// src/pages/auth/Register.js
import React, { useState } from 'react';
import api from '../../api';
import '../../Styles/Register.css';

const Register = () => {
  const [userType, setUserType] = useState('student'); // Default: student registration
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rollNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // "success" or "error"
  const [showPassword, setShowPassword] = useState(false);

  // Regex patterns for validation
  const userVal = /^[0-9A-Za-z]{5,20}$/;
  const emailVal = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  const passwordVal = /^[a-zA-Z0-9!@#$%^&*]{8,}$/;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUserTypeChange = (e) => {
    setUserType(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate name, email, and password using regex
    if (!userVal.test(formData.name)) {
      setMessage("Name must be 5 to 20 alphanumeric characters.");
      setMessageType("error");
      return;
    }
    if (!emailVal.test(formData.email)) {
      setMessage("Invalid email format.");
      setMessageType("error");
      return;
    }
    if (!passwordVal.test(formData.password)) {
      setMessage("Password must be at least 8 characters and can include letters, numbers and !@#$%^&*.");
      setMessageType("error");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match.");
      setMessageType("error");
      return;
    }

    let endpoint = '';
    let data = {};

    if (userType === 'admin') {
      endpoint = '/users/register/admin';
      data = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      };
    } else {
      endpoint = '/users/register/student';
      data = {
        name: formData.name,
        email: formData.email,
        rollNumber: formData.rollNumber,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      };
    }

    try {
      const res = await api.post(endpoint, data);
      setMessage(res.data.message);
      setMessageType("success");
      setFormData({
        name: '',
        email: '',
        rollNumber: '',
        password: '',
        confirmPassword: ''
      });
    } catch (err) {
      const errorMessage =
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "Registration failed";
      setMessage(errorMessage);
      setMessageType("error");
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <div className="user-type">
        <label>
          <input
            type="radio"
            value="student"
            checked={userType === 'student'}
            onChange={handleUserTypeChange}
          />
          Student
        </label>
        <label>
          <input
            type="radio"
            value="admin"
            checked={userType === 'admin'}
            onChange={handleUserTypeChange}
          />
          Admin
        </label>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        {userType === 'student' && (
          <input
            type="number"
            name="rollNumber"
            placeholder="Roll Number"
            value={formData.rollNumber}
            onChange={handleChange}
            required
          />
        )}
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type={showPassword ? "text" : "password"}
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
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
        <button type="submit">Register</button>
      </form>
      {message && (
        <p className="message" style={{ color: messageType === "success" ? "green" : "red" }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default Register;
