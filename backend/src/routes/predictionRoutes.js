const express = require("express");
const router = express.Router();

const pool = require("../db");

const {
    predictColleges
} = require("../controllers/predictionController");

const {
    getColleges,
    getCollegeDetails,
    getMLInfo
} = require("../controllers/collegeController");

// College prediction endpoint (historical cutoffs + ML inference)
router.post("/predict", predictColleges);

// College discovery and directory search
router.get("/colleges", getColleges);

// Individual college profile with fees, placements, NIRF, and accreditations
router.get("/colleges/:id", getCollegeDetails);

// ML model metadata and evaluation benchmarks
router.get("/ml/info", getMLInfo);

// Read-only institute list used for data-audit workflows.
router.get("/institutes", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT DISTINCT institute
            FROM cutoffs
            ORDER BY institute
        `);

        res.json({
            success: true,
            count: result.rows.length,
            institutes: result.rows.map(row => row.institute)
        });
    } catch (error) {
        console.error("Institute list error:", error.message);

        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
});

module.exports = router;
