const Attendance = require("../models/attendanceModel");

// Define time periods
const timePeriods = {
  "1st Period": ["09:05", "10:00"],
  "2nd Period": ["10:00", "10:55"],
  "Break-time": ["10:55", "11:15"],
  "3rd Period": ["11:15", "12:10"],
  "4th Period": ["12:10", "13:05"],
  "Lunch-time": ["13:05", "13:45"],
  "5th Period": ["13:45", "14:40"],
  "6th Period": ["14:40", "15:25"],
  "7th Period": ["15:25", "16:05"]
};

// Function to determine the current period
const getCurrentPeriod = () => {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert to minutes

  for (const [period, [start, end]] of Object.entries(timePeriods)) {
    const startTime = parseInt(start.split(":")[0]) * 60 + parseInt(start.split(":")[1]);
    const endTime = parseInt(end.split(":")[0]) * 60 + parseInt(end.split(":")[1]);

    if (startTime <= currentTime && currentTime <= endTime) {
      return period;
    }
  }
  return null; // Outside defined periods
};

// Create attendance record for all students at the beginning of the day
exports.initializeDailyAttendance = async (req, res) => {
  try {
    const students = await Student.find(); // Assuming you have a Student model
    const date = new Date().toISOString().split("T")[0];

    for (const student of students) {
      const existing = await Attendance.findOne({ rollNumber: student.rollNumber, date });
      if (!existing) {
        await Attendance.create({
          rollNumber: student.rollNumber,
          name: student.name,
          date,
          "Break-time": "Break-time",
          "Lunch-time": "Lunch-time"
          // Other periods will auto default to "Not yet marked"
        });
      }
    }

    res.status(200).json({ message: "Attendance initialized for all students" });
  } catch (err) {
    console.error("❌ Initialization error:", err);
    res.status(500).json({ message: "Failed to initialize attendance", error: err.message });
  }
};

exports.markAttendance = async (req, res) => {
  try {
    const { rollNumber, name, date, period, status } = req.body;
    if (!rollNumber || !name || !date || !period || !status) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let studentAttendance = await Attendance.findOne({ rollNumber, date });

    if (!studentAttendance) {
      studentAttendance = new Attendance({
        rollNumber,
        name,
        date,
        "Break-time": "Break-time",
        "Lunch-time": "Lunch-time"
      });
    }

    const currentStatus = studentAttendance[period];

    // ✅ Update only if:
    // - status is "Absent" and current is empty or "Not yet marked"
    // - status is "Present"
    if (
      status === "Present" ||
      (status === "Absent" && (!currentStatus || currentStatus === "Not yet marked"))
    ) {
      studentAttendance[period] = status;
      await studentAttendance.save();
    }

    res.status(200).json({ message: `Attendance marked for ${name} in ${period}` });
  } catch (error) {
    console.error("❌ Error marking attendance:", error);
    res.status(500).json({ message: "Error marking attendance", error: error.message });
  }
};

// Get Attendance (Restricted to Admins and Individual Users)
exports.getAttendance = async (req, res) => {
    try {
        if (req.user.role === "admin") {
            const attendanceRecords = await Attendance.find().lean(); // ✅ Use .lean() for faster queries
            if (!attendanceRecords.length) {
                return res.status(404).json({ message: "No attendance records found" });
            }
            return res.json(attendanceRecords);
        } else {
            const attendanceRecords = await Attendance.find({ rollNumber: req.user.rollNumber }).lean();
            if (!attendanceRecords.length) {
                return res.status(404).json({ message: "No attendance records found for your roll number" });
            }
            return res.json(attendanceRecords);
        }
    } catch (error) {
        console.error("❌ Error fetching attendance:", error);
        res.status(500).json({ message: "Error fetching attendance", error: error.message });
    }
};

// Update attendance by _id
exports.updateAttendance = async (req, res) => {
  const { id, updatedAttendance } = req.body;

  try {
    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    // Update the fields dynamically
    Object.keys(updatedAttendance).forEach((key) => {
      if (key !== "_id" && key !== "rollNumber" && key !== "name" && key !== "date") {
        attendance[key] = updatedAttendance[key];
      }
    });

    await attendance.save();
    res.status(200).json({ message: "Attendance updated successfully" });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Server error while updating attendance" });
  }
};





