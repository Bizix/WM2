require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const pool = require("./config/db");
const scraperRoutes = require("./routes/scraperRoutes");
const rankingsRoutes = require("./routes/rankingsRoutes");

const app = express();

// ✅ Middleware
app.use(express.json());
app.use(cors());
app.use(helmet()); // ✅ Security headers
app.use(morgan("dev")); // ✅ Request logging

// ✅ API Routes
app.use("/api", scraperRoutes);
app.use("/api", rankingsRoutes);

// ✅ Health Check Route
app.get("/", (req, res) => {
  res.send("✅ Melon Music App API is running!");
});

// ✅ Database Connection Test
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS current_time;");
    res.json({ success: true, db_time: result.rows[0].current_time });
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
