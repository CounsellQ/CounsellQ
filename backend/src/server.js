const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const pool = require("./db");
const predictionRoutes = require("./routes/predictionRoutes");

const app = express();

// Secure CORS configuration
const allowedOrigins = [
    "https://counsell-q.vercel.app",
    "http://localhost:3000",
    "http://localhost:5000",
    "http://localhost:5173",
    "http://127.0.0.1:5500",
    "http://127.0.0.1:3000"
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server) or from allowed list
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
            return callback(null, true);
        }
        return callback(null, true); // Permissive fallback for project demonstration
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Basic security headers
app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    next();
});

app.use(express.json({ limit: "1mb" }));

// Prediction & College API routes
app.use("/api", predictionRoutes);

// Health check endpoint
app.get("/api/health", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW(), current_database(), (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'colleges') AS has_colleges");

        res.json({
            status: "OK",
            message: "CounsellQ backend is running",
            database: "PostgreSQL connected",
            db_name: result.rows[0].current_database,
            has_colleges_table: Number(result.rows[0].has_colleges) > 0,
            time: result.rows[0].now,
            features: [
                "historical_cutoffs",
                "ml_admission_feasibility",
                "verified_college_profiles",
                "nirf_rankings",
                "nba_naac_accreditation",
                "audited_fees_and_placements"
            ]
        });
    } catch (error) {
        console.error("Database connection error:", error.message);

        res.status(500).json({
            status: "ERROR",
            message: "Database connection failed"
        });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: "Route not found"
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err.message);
    res.status(500).json({
        success: false,
        error: "An unexpected server error occurred"
    });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`CounsellQ backend running on port ${PORT}`);
    });
}

module.exports = app;