// src/pages/auth/ForgotPassword.js
import React, { useState, useEffect, useRef } from "react";
import api from "../../api";
import "../../Styles/ForgotPassword.css";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: enter email, 2: OTP + new password, 3: success
  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(300); // 300 seconds = 5 minutes
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  // Timer countdown for OTP expiration
  useEffect(() => {
    if (step === 2) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step]);

  // Format time as mm:ss
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Step 1: Send OTP to the provided email
  const handleSendOTP = async () => {
    setLoading(true);
    try {
      const res = await api.post("/users/send-otp", { email });
      setMessage(res.data.message);
      setStep(2);
      setTimer(300); // Reset timer to 5 minutes
    } catch (error) {
      setMessage(error.response?.data?.message || "Error sending OTP");
    }
    setLoading(false);
  };

  // Handle OTP digit changes
  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    // Only allow a single digit
    if (/^\d?$/.test(value)) {
      const newOtpDigits = [...otpDigits];
      newOtpDigits[index] = value;
      setOtpDigits(newOtpDigits);
      // If a digit is entered, move focus to the next input box
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  // Validate new password using regex
  const isPasswordValid = (password) => {
    const passwordRegex = /^[a-zA-Z0-9!@#$%^&*]{8,}$/;
    return passwordRegex.test(password);
  };

  // Step 2: Reset password using OTP and new password
  const handleResetPassword = async () => {
    // Validate newPassword against regex pattern
    if (!isPasswordValid(newPassword)) {
      setMessage("Password must be at least 8 characters and can only contain letters, numbers and !@#$%^&*.");
      return;
    }
    
    setLoading(true);
    const otp = otpDigits.join("");
    try {
      const res = await api.post("/users/reset-password", { email, otp, newPassword });
      setMessage(res.data.message);
      setStep(3);
      setTimeout(() => {
        navigate("/"); // or navigate to the login page as per your flow
      }, 1500);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error resetting password");
    }
    setLoading(false);
  };

  return (
    <div className="forgot-password-container">
      <h2>Reset Password</h2>
      
      {step === 1 && (
        <div className="form-group">
          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button onClick={handleSendOTP} disabled={loading}>
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="form-group otp-group">
          <div className="otp-inputs">
            {otpDigits.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(e, index)}
                ref={(el) => (inputRefs.current[index] = el)}
              />
            ))}
          </div>
          <p className="timer">Time Remaining: {formatTime(timer)}</p>
          <input
            type={showNewPassword ? "text" : "password"}
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <div className="show-password">
            <label>
              <input
                type="checkbox"
                checked={showNewPassword}
                onChange={() => setShowNewPassword(!showNewPassword)}
              />
              Show Password
            </label>
          </div>
          <button onClick={handleResetPassword} disabled={loading || timer === 0}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </div>
      )}

      {step === 3 && <p className="success-message">{message}</p>}
      {message && step !== 3 && <p className="message">{message}</p>}
    </div>
  );
};

export default ForgotPassword;
