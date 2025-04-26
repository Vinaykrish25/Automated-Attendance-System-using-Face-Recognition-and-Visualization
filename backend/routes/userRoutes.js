const express = require("express");
const router = express.Router();
const { 
  registerAdmin, 
  registerStudent, 
  loginUser, 
  logoutUser, 
  getUser, 
  verifyUser,
  sendOTP,
  resetPassword 
} = require("../controllers/userController");
const { authMiddleware } = require("../middlewares/authMiddleware");

router.post("/register/admin", registerAdmin);
router.post("/register/student", registerStudent);
router.post("/login", loginUser);
router.post("/logout", authMiddleware, logoutUser);

// New routes for forgot password feature
router.post("/send-otp", sendOTP);
router.post("/reset-password", resetPassword);

// Existing routes for getUser and verifyUser
router.get("/getUser", authMiddleware, getUser);
router.get("/verify", authMiddleware, verifyUser);

module.exports = router;
