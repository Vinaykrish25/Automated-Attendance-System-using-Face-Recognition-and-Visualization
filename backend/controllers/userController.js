const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { blacklistedTokens } = require("../middlewares/authMiddleware");  

const adminEmails = ["vinaykrish2002@gmail.com", "dhanasekarandhanasekaran77@gmail.com"];

// ✅ Register Admin
exports.registerAdmin = async (req, res) => {
    try {
        console.log("Request body:", req.body); // Debug log
        const { name, email, password, confirmPassword } = req.body;

        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }
        if (!adminEmails.includes(email)) {
            return res.status(403).json({ message: "Unauthorized: Not in admin email list" });
        }
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "Admin already exists" });

        const user = await User.create({ name, email, password, role: "admin" });
        res.status(201).json({ message: "Admin registered successfully, Login now", user });
    } catch (error) {
        console.error("❌ Error registering admin:", error);
        res.status(500).json({ message: "Error registering admin", error: error.message });
      }      
};

// ✅ Register Student
exports.registerStudent = async (req, res) => {
    try {
        const { name, email, rollNumber, password, confirmPassword } = req.body;

        if (!name || !email || !rollNumber || !password || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }
        if (adminEmails.includes(email)) {
            return res.status(403).json({ message: "Unauthorized: This email is reserved for admins" });
        }
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "Student already exists" });

        const user = await User.create({ name, email, rollNumber, password, role: "student" });
        res.status(201).json({ message: "Student registered successfully, Login now", user });
    } catch (error) {
        console.error("❌ Error registering student:", error);
        res.status(500).json({ message: "Error registering student" });
    }
};

// ✅ Login (Separate for Admin & Student)
exports.loginUser = async (req, res) => {
    try {
        const { email, password, rollNumber } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: "Invalid email or password" });
        if (user.role === "student" && !rollNumber) {
            return res.status(400).json({ message: "Roll number is required for student login" });
        }
        if (user.role === "student" && user.rollNumber !== Number(rollNumber)) {
            return res.status(400).json({ message: "Invalid roll number" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

        const token = jwt.sign({ id: user._id, role: user.role, rollNumber: user.rollNumber }, process.env.JSON_TOKEN, { expiresIn: "1d" });

        res.json({ token, user });
    } catch (error) {
        res.status(500).json({ message: "Error logging in" });
    }
};

//Logout
exports.logoutUser = async (req, res) => {
    try {
        const token = req.header("Authorization")?.split(" ")[1];
        if (!token) return res.status(400).json({ message: "No token provided" });

        if (blacklistedTokens.has(token)) {
            return res.status(400).json({ message: "Already logged out" });
        }

        blacklistedTokens.add(token);  // ✅ Blacklist token to prevent reuse
        res.json({ message: "User logged out successfully" });
    } catch (error) {
        console.error("❌ Error logging out:", error);
        res.status(500).json({ message: "Error logging out" });
    }
};

// Get current logged-in user's basic info (e.g., name)
exports.getUser = async (req, res) => {
    try {
      // req.user is populated by authMiddleware
      const user = await User.findById(req.user.id).select("name email role rollNumber");
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json({ user });
    } catch (error) {
      res.status(500).json({ message: "Error retrieving user", error: error.message });
    }
  };
  
  // Verify the logged-in user (token is valid) and return user info
  exports.verifyUser = async (req, res) => {
    try {
      // If the token is valid, req.user is set by authMiddleware.
      // We fetch the full user (excluding password) from the database.
      const user = await User.findById(req.user.id).select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json({ message: "User verified", user });
    } catch (error) {
      res.status(500).json({ message: "Error verifying user", error: error.message });
    }
  };
  
// Temporary in-memory store for OTPs.
// For production, consider using a more persistent store (e.g., Redis or a database)
const otpStore = {};

// Configure nodemailer transporter (using Gmail as an example)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,    // e.g., your email address
    pass: process.env.EMAIL_PASS,    // e.g., an app password (not your plain account password)
  },
});

// --- New: Send OTP ---
exports.sendOTP = async (req, res) => {
  const { email } = req.body;
  try {
    // Check if the email exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    // Store the OTP with expiry (e.g., 5 minutes from now)
    otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };

    // Send the OTP via email
    await transporter.sendMail({
      from: `${process.env.EMAIL_NAME} <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Automated Attendance System - Reset Password OTP",
      text: `You are receiving this email because a password reset was requested for your Automated Attendance System account.
    Your OTP for resetting your password is: ${otp}. This OTP is valid for 5 minutes. If you did not request this, please ignore this email.`,
    });
    
    res.json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Error sending OTP", error: error.message });
  }
};

// --- New: Reset Password ---
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    // Check if we have an OTP stored for this email
    if (!otpStore[email]) {
      return res.status(400).json({ message: "OTP expired or invalid" });
    }
    const { otp: storedOTP, expires } = otpStore[email];

    // Check if OTP is expired
    if (Date.now() > expires) {
      delete otpStore[email];
      return res.status(400).json({ message: "OTP expired" });
    }

    // Check if provided OTP matches the stored one
    if (parseInt(otp) !== storedOTP) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // OTP is valid; update the user's password
    const hashedPassword = await bcrypt.hash(String(newPassword), 10);
    await User.updateOne({ email }, { password: hashedPassword });

    // Remove the OTP after successful reset
    delete otpStore[email];

    res.json({ message: "Password reset successful. You can now log in." });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Error resetting password", error: error.message });
  }
};