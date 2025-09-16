const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const cookieParser = require('cookie-parser');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());  // Body parser
app.use(cookieParser());

// Enable CORS, allowing requests from your frontend URLs and localhost during development
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));

// ✅ Power BI Token Generation Route
app.get("/api/powerbi/token", async (req, res) => {
    try {
      const {
        POWERBI_CLIENT_ID,
        POWERBI_CLIENT_SECRET,
        POWERBI_TENANT_ID,
        POWERBI_WORKSPACE_ID,
        POWERBI_REPORT_ID
      } = process.env;
  
      // Step 1: Get Azure AD access token
      const tokenResponse = await axios.post(
        `https://login.microsoftonline.com/${POWERBI_TENANT_ID}/oauth2/v2.0/token`,
        new URLSearchParams({
          grant_type: "client_credentials",
          client_id: POWERBI_CLIENT_ID,
          client_secret: POWERBI_CLIENT_SECRET,
          scope: "https://analysis.windows.net/powerbi/api/.default"
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
  
      const accessToken = tokenResponse.data.access_token;
  
      // Step 2: Generate Embed Token
      const embedTokenResponse = await axios.post(
        `https://api.powerbi.com/v1.0/myorg/groups/${POWERBI_WORKSPACE_ID}/reports/${POWERBI_REPORT_ID}/GenerateToken`,
        { accessLevel: "View" },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        }
      );
  
      res.json({
        embedToken: embedTokenResponse.data.token,
        embedUrl: `https://app.powerbi.com/reportEmbed?reportId=${POWERBI_REPORT_ID}&groupId=${POWERBI_WORKSPACE_ID}`,
        reportId: POWERBI_REPORT_ID
      });
  
    } catch (error) {
      console.error("❌ PowerBI Token Error:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to generate Power BI token" });
    }
  });

// Server listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// ✅ Start PowerBI server (if needed on different port)
const PORT1 = process.env.PORT1 || 5005;
if (PORT1 !== PORT) {
  const powerbiApp = express();
  powerbiApp.use("/", app); // reuse same app for simplicity
  powerbiApp.listen(PORT1, () => {
    console.log(`PowerBI token server running on port ${PORT1}`);
  });
}
