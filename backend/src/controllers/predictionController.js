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

        // Validate required fields
        if (!rank || !category) {
            return res.status(400).json({
                success: false,
                error: "Rank and category are required"
            });
        }

        const studentRank = Number(rank);

        if (!Number.isInteger(studentRank) || studentRank <= 0) {
            return res.status(400).json({
                success: false,
                error: "Rank must be a positive integer"
            });
        }

        const values = [category];
        let parameterIndex = 2;

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
            WHERE category = $1
        `;

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

        // Get historical cutoffs up to twice the student's rank
        query += `
            AND closing_rank <= $${parameterIndex}
            ORDER BY closing_rank ASC
            LIMIT 100
        `;

        values.push(studentRank * 2);

        const result = await pool.query(query, values);

        // Classify each college
        const results = result.rows.map((college) => {
            const closingRank = Number(college.closing_rank);

            const difference = closingRank - studentRank;
            const percentageDifference =
                (difference / studentRank) * 100;

            let prediction;

            if (percentageDifference >= 20) {
                prediction = "Safer Chance";
            } else if (percentageDifference >= 0) {
                prediction = "Moderate Chance";
            } else {
                prediction = "Lower Chance";
            }

            return {
                ...college,
                prediction
            };
        });

        // Sort by chance category
        const predictionOrder = {
            "Safer Chance": 1,
            "Moderate Chance": 2,
            "Lower Chance": 3
        };

        results.sort((a, b) => {
            if (
                predictionOrder[a.prediction] !==
                predictionOrder[b.prediction]
            ) {
                return (
                    predictionOrder[a.prediction] -
                    predictionOrder[b.prediction]
                );
            }

            return Number(a.closing_rank) - Number(b.closing_rank);
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