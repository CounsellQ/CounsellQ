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
         * Get UPTAC cutoff data.
         *
         * NIRF:
         * Attach only when a verified UPTAC -> NIRF mapping exists.
         *
         * Accreditation:
         * - NAAC is institute-level.
         * - NBA is program-level and is attached only when
         *   the cutoff program exactly matches the accredited program.
         *
         * LATERAL aggregation keeps one row per cutoff.
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
                n.score AS nirf_score,

                COALESCE(acc.accreditation, '[]'::json) AS accreditation

            FROM cutoffs c

            LEFT JOIN college_nirf_map m
                ON c.institute = m.uptac_institute
                AND m.verified = TRUE

            LEFT JOIN nirf_rankings n
                ON m.nirf_institute = n.institute_name
                AND n.nirf_year = 2025
                AND n.ranking_category = 'Engineering'

            LEFT JOIN LATERAL (
                SELECT
                    json_agg(
                        json_build_object(
                            'type', a.accreditation_type,
                            'status', a.accreditation_status,
                            'grade', a.grade,
                            'program', a.program,
                            'validity', a.validity,
                            'updated_year', a.updated_year,
                            'source', a.source,
                            'valid_from', a.valid_from,
                            'valid_until', a.valid_until,
                            'source_url', a.source_url,
                            'last_verified', a.last_verified,
                            'derived_status', CASE
                                WHEN a.valid_until IS NULL THEN 'DATE_NOT_AVAILABLE'
                                WHEN a.valid_until >= CURRENT_DATE THEN 'CURRENTLY_VALID'
                                ELSE 'EXPIRED'
                            END
                        )
                        ORDER BY a.accreditation_type
                    ) AS accreditation

                FROM college_accreditation_map cam

                JOIN accreditations a
                    ON cam.accreditation_institute = a.institute_name

                WHERE cam.uptac_institute = c.institute
                    AND cam.verified = TRUE

                    AND (
                        a.accreditation_type = 'NAAC'

                        OR (
                            a.accreditation_type = 'NBA'
                            AND LOWER(TRIM(c.program))
                                = LOWER(TRIM(a.program))
                        )
                    )
            ) acc ON TRUE

            WHERE c.category = $1
        `;

        // Program filter
        if (program) {
            query += ` AND c.program ILIKE $${parameterIndex}`;
            values.push(`%${program}%`);
            parameterIndex++;
        }

        // Quota filter
        if (quota) {
            query += ` AND c.quota = $${parameterIndex}`;
            values.push(quota);
            parameterIndex++;
        }

        // Round filter
        if (round) {
            const normalizedRound =
                String(round).startsWith("Round ")
                    ? String(round)
                    : `Round ${round}`;

            query += ` AND c.round = $${parameterIndex}`;
            values.push(normalizedRound);
            parameterIndex++;
        }

        // Rank filter
        query += `
            AND c.closing_rank <= $${parameterIndex}
            ORDER BY c.closing_rank ASC
            LIMIT 100
        `;

        values.push(studentRank * 2);

        const result = await pool.query(query, values);

        // Format prediction results
        const results = result.rows.map((college) => {
            const closingRank = Number(college.closing_rank);

            const difference =
                closingRank - studentRank;

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

                nirf: college.nirf_year
                    ? {
                        year: college.nirf_year,
                        rank: college.nirf_rank,
                        rank_band: college.nirf_rank_band,
                        score: college.nirf_score
                    }
                    : null,

                accreditation:
                    college.accreditation || []
            };
        });

        // Sort by prediction category first,
        // then by closing rank.
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
        console.error(
            "Prediction error:",
            error.message
        );

        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

module.exports = {
    predictColleges
};