const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Set a random fallback for bcrypt if no crypto module is available
bcrypt.setRandomFallback(() => {
  let result = "";
  for (let i = 0; i < 16; i++) {
    result += Math.floor(Math.random() * 256).toString(16).padStart(2, "0");
  }
  return Buffer.from(result, "hex");
});

const adminEmails = ["vinaykrish2002@gmail.com", "dhanasekarandhanasekaran77@gmail.com"];

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rollNumber: { type: Number, unique: true, sparse: true, default: null },
  role: { type: String, enum: ["admin", "student"], default: "student" }
});

// Pre-save hook to hash the password and remove rollNumber for admins
userSchema.pre("save", async function (next) {
  // If the role is admin, remove rollNumber so it doesn't cause duplicate null values
  if (this.role === "admin") {
    this.rollNumber = undefined;
  }
  
  if (!this.isModified("password")) return next();

  console.log("Password value before hashing:", this.password);
  console.log("Type of password:", typeof this.password);

  if (typeof this.password !== "string" || !this.password.trim()) {
    return next(new Error("Password must be a non-empty string."));
  }

  try {
    this.password = await bcrypt.hash(String(this.password), 10);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords during login
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
