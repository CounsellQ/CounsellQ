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

        /*
         * Get UPTAC cutoff data and attach NIRF information
         * only when a verified college mapping exists.
         */
        let query = `
            SELECT
                c.institute,
                c.program,
                c.quota,
                c.category,
                c.round,
                c.opening_rank,
                c.closing_rank,
                n.nirf_year,
                n.rank AS nirf_rank,
                n.rank_band AS nirf_rank_band,
                n.score AS nirf_score
            FROM cutoffs c
            LEFT JOIN college_nirf_map m
                ON c.institute = m.uptac_institute
                AND m.verified = TRUE
            LEFT JOIN nirf_rankings n
                ON m.nirf_institute = n.institute_name
                AND n.nirf_year = 2025
                AND n.ranking_category = 'Engineering'
            WHERE c.category = $1
        `;

        // Filter by program
        if (program) {
            query += ` AND c.program ILIKE $${parameterIndex}`;
            values.push(`%${program}%`);
            parameterIndex++;
        }

        // Filter by quota
        if (quota) {
            query += ` AND c.quota = $${parameterIndex}`;
            values.push(quota);
            parameterIndex++;
        }

        // Filter by round
        if (round) {
            const normalizedRound =
            String(round).startsWith("Round ")
            ? String(round)
            : `Round ${round}`;
            
            query += ` AND c.round = $${parameterIndex}`;
            values.push(normalizedRound);
            parameterIndex++;
        }

        // Keep the existing prediction range
        query += `
            AND c.closing_rank <= $${parameterIndex}
            ORDER BY c.closing_rank ASC
            LIMIT 100
        `;

        values.push(studentRank * 2);

        const result = await pool.query(query, values);

        // Calculate prediction category
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
                institute: college.institute,
                program: college.program,
                quota: college.quota,
                category: college.category,
                round: college.round,
                opening_rank: college.opening_rank,
                closing_rank: college.closing_rank,
                prediction,

                // NIRF information
                nirf: college.nirf_year
                    ? {
                        year: college.nirf_year,
                        rank: college.nirf_rank,
                        rank_band: college.nirf_rank_band,
                        score: college.nirf_score
                    }
                    : null
            };
        });

        // Sort predictions
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

            return (
                Number(a.closing_rank) -
                Number(b.closing_rank)
            );
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