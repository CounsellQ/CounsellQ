const pool = require("../db");

const predictColleges = async (req, res) => {
    try {
        const {
            rank,
            category,
            program,
            quota,
            round
        } = req.body;

        // Basic validation
        if (!rank || !category) {
            return res.status(400).json({
                success: false,
                error: "Rank and category are required"
            });
        }

        if (rank <= 0) {
            return res.status(400).json({
                success: false,
                error: "Rank must be greater than 0"
            });
        }

        const values = [rank, category];

        let query = `
            SELECT
                institute,
                program,
                quota,
                category,
                round,
                opening_rank,
                closing_rank
            FROM cutoffs
            WHERE category = $2
              AND opening_rank <= $1
              AND closing_rank >= $1
        `;

        let parameterIndex = 3;

        if (program) {
            query += ` AND program ILIKE $${parameterIndex}`;
            values.push(`%${program}%`);
            parameterIndex++;
        }

        if (quota) {
            query += ` AND quota = $${parameterIndex}`;
            values.push(quota);
            parameterIndex++;
        }

        if (round) {
            query += ` AND round = $${parameterIndex}`;
            values.push(round);
            parameterIndex++;
        }

        query += `
            ORDER BY closing_rank ASC
            LIMIT 50
        `;

        const result = await pool.query(query, values);

        // Add prediction classification
        const results = result.rows.map((college) => {
            const rankDifference = college.closing_rank - rank;
            const percentageDifference =
                (rankDifference / rank) * 100;

            let prediction;

            if (percentageDifference >= 20) {
                prediction = "Safe";
            } else if (percentageDifference >= 0) {
                prediction = "Moderate";
            } else {
                prediction = "Ambitious";
            }

            return {
                ...college,
                prediction
            };
        });

        res.json({
            success: true,
            count: results.length,
            results
        });

    } catch (error) {
        console.error("Prediction error:", error.message);

        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

module.exports = {
    predictColleges
};