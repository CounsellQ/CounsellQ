"use strict";

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

require("dotenv").config({ quiet: true });

const pool = require("./db");
const predictionRoutes = require("./routes/predictionRoutes");

const app = express();

// ── Security & Observability Middleware ───────────────────────────────────────

// 1. Helmet HTTP security headers
// Note: Content-Security-Policy is disabled for the static prototype to permit
// in-browser JSX transpilation via Babel standalone, CDN scripts (Tailwind, Lucide, React),
// and Google Fonts. All other security headers (nosniff, X-Frame-Options, etc.) remain active.
app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false
    })
);

// 2. Correlation ID for distributed request tracing
app.use((req, res, next) => {
    const requestId = req.headers["x-request-id"] || crypto.randomUUID();
    req.id = requestId;
    res.setHeader("X-Request-ID", requestId);
    next();
});

// 3. HTTP access logging (disabled during test suite runs to keep output clean)
if (process.env.NODE_ENV !== "test") {
    app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

// 4. CORS configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"]
};
app.use(cors(corsOptions));

// 5. Request body parser with size protection (10kb maximum)
app.use(express.json({ limit: "10kb" }));

// 6. Rate limiter for prediction endpoint (protects against computational exhaustion)
const predictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_MAX
        ? parseInt(process.env.RATE_LIMIT_MAX, 10)
        : (process.env.NODE_ENV === "test" ? 1000 : 30),
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: "Too many prediction requests from this IP, please try again after 15 minutes."
    }
});

// ── API Routes ────────────────────────────────────────────────────────────────

// Health / Readiness
app.get("/api/health", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW() AS server_time");

        res.json({
            status: "ok",
            message: "CounsellQ backend is running",
            database: "connected",
            server_time: result.rows[0].server_time
        });
    } catch (error) {
        console.error("[health] Database connection error:", error.message);

        res.status(503).json({
            status: "error",
            message: "Database is not reachable",
            database: "disconnected"
        });
    }
});

// API version metadata
app.get("/api/version", (req, res) => {
    res.json({
        success: true,
        version: "1.0.0",
        environment: process.env.NODE_ENV || "development",
        status: "operational"
    });
});

// Prediction rate limiter applied specifically to /api/predict
app.use("/api/predict", predictLimiter);

// Core API endpoints
app.use("/api", predictionRoutes);

// ── Static Frontend Serving ───────────────────────────────────────────────────

const candidateHtmlPaths = [
    path.resolve(__dirname, "../../councellQ_prototype.html"),
    path.resolve(__dirname, "../councellQ_prototype.html"),
    path.resolve(process.cwd(), "councellQ_prototype.html"),
    path.resolve(process.cwd(), "../councellQ_prototype.html")
];
const FRONTEND_FILE = candidateHtmlPaths.find((p) => fs.existsSync(p)) || candidateHtmlPaths[0];
const FRONTEND_DIR = path.dirname(FRONTEND_FILE);

app.use(express.static(FRONTEND_DIR));

app.get("/", (req, res) => {
    if (fs.existsSync(FRONTEND_FILE)) {
        res.sendFile(FRONTEND_FILE);
    } else {
        res.status(404).json({
            success: false,
            error: "Frontend prototype file 'councellQ_prototype.html' not found."
        });
    }
});

// ── 404 Handler ───────────────────────────────────────────────────────────────

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: `Route not found: ${req.method} ${req.path}`
    });
});

// ── Global Error Handler ──────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    if (err.status === 413 || err.statusCode === 413 || err.type === "entity.too.large") {
        return res.status(413).json({
            success: false,
            error: "Payload too large. Maximum allowed size is 10kb."
        });
    }

    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({
            success: false,
            error: "Invalid JSON in request body"
        });
    }

    console.error("[server] Unhandled error:", err.message);
    res.status(500).json({
        success: false,
        error: "Internal server error"
    });
});

// ── Start Server ──────────────────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT, 10) || 5000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`CounsellQ backend listening on port ${PORT}`);
        console.log(`  Frontend: http://localhost:${PORT}/`);
        console.log(`  Health:   http://localhost:${PORT}/api/health`);
        console.log(`  Predict:  POST http://localhost:${PORT}/api/predict`);
    });
}

module.exports = app;