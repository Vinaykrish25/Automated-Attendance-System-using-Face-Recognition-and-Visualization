const express = require("express");
const router = express.Router();
const { markAttendance, getAttendance, updateAttendance } = require("../controllers/attendanceController");
const { authMiddleware } = require("../middlewares/authMiddleware");

router.post("/mark", markAttendance);  // ✅ Protect attendance marking
router.put("/update", authMiddleware, updateAttendance);
router.get("/", authMiddleware, getAttendance);  // ✅ Restrict attendance viewing based on role

module.exports = router;
