const express = require("express");
const cors = require("cors");
require("dotenv").config();
const breakingNewsRoutes = require("./routes/breakingNewsRoutes");
const pool = require("./config/db");
const categoryRoutes = require("./routes/categoryRoutes");
const mediaRoutes = require("./routes/mediaRoutes");
const path = require("path");
const newsRoutes = require("./routes/newsRoutes");
const adminRoutes = require("./routes/adminRoutes");
const siteSettingsRoutes = require("./routes/siteSettingsRoutes");
const app = express();

app.use(cors());
app.use(express.json());
app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);

app.use("/api/media", mediaRoutes);

// Routes
app.use("/api/categories", categoryRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/breaking-news", breakingNewsRoutes);
app.use("/api/site-settings", siteSettingsRoutes);
// API status
app.get("/", (req, res) => {
    res.json({
        message: "Breaking News API is running"
    });
});

// Database health check
app.get("/api/health/db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            message: "Database connection is working",
            time: result.rows[0].now
        });
    } catch (error) {
        console.error("Database connection failed:", error);

        res.status(500).json({
            message: "Database connection failed"
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});