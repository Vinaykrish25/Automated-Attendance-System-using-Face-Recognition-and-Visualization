const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  rollNumber: { type: Number, required: true },
  name: { type: String, required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  "1st Period": { type: String, default: "Not yet marked"},
  "2nd Period": { type: String, default: "Not yet marked"},
  "Break-time": { type: String, default: "Break-time" },
  "3rd Period": { type: String, default: "Not yet marked"},
  "4th Period": { type: String, default: "Not yet marked"},
  "Lunch-time": { type: String, default: "Lunch-time" },
  "5th Period": { type: String, default: "Not yet marked"},
  "6th Period": { type: String, default: "Not yet marked"},
  "7th Period": { type: String, default: "Not yet marked"}
});

const Attendance = mongoose.model("Attendance", attendanceSchema);
module.exports = Attendance;
