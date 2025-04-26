const jwt = require("jsonwebtoken");

const blacklistedTokens = new Set();  // Temporary storage (resets on restart)

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1]; // Extract Bearer token
    if (!token) return res.status(401).json({ message: "Access Denied: No token provided" });

    if (blacklistedTokens.has(token)) {
        return res.status(403).json({ message: "Token has been logged out. Please log in again." });
    }

    try {
        const verified = jwt.verify(token, process.env.JSON_TOKEN);
        req.user = verified;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid or Expired Token" });
    }
};

// ✅ Middleware to allow only admins
const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Access Denied: Admins only" });
    }
    next();
};

// ✅ Logout User by Blacklisting Token
const logoutUser = async (req, res) => {
    try {
        const token = req.header("Authorization")?.split(" ")[1]; // Extract token
        if (!token) return res.status(400).json({ message: "No token provided" });

        blacklistedTokens.add(token);  // Add token to blacklist
        res.json({ message: "User logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error logging out" });
    }
};

module.exports = { authMiddleware, adminMiddleware, logoutUser, blacklistedTokens };
