const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            status: "OK",
            message: "CounsellQ backend is running",
            database: "PostgreSQL connected",
            time: result.rows[0].now
        });
    } catch (error) {
        console.error("Database connection error:", error.message);

        res.status(500).json({
            status: "ERROR",
            message: "Database connection failed"
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`CounsellQ backend running on port ${PORT}`);
});