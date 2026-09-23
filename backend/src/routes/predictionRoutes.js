const express = require("express");
const router = express.Router();

const pool = require("../db");

const {
    predictColleges
} = require("../controllers/predictionController");

router.post("/predict", predictColleges);

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
