/**
 * CounsellQ Prediction Controller
 * Integrates historical UPTAC cutoff records, verified college profiles,
 * fees, placements, NIRF rankings, NBA/NAAC accreditations, and
 * Random Forest ML admission feasibility inference.
 */

const pool = require("../db");
const { predictAdmissionFeasibility } = require("../ml/modelInference");

const predictColleges = async (req, res) => {
    try {
        const {
            rank,
            category,
            program,
            quota,
            round,
            gender
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

        // Category mapping and gender-inclusive eligibility:
        // In UPTAC, female candidates are eligible for OPEN, OPEN(GIRL), and category-specific girl quotas.
        // Reserved candidates are also eligible for unreserved OPEN seats based on rank merit.
        const isFemale = String(gender || "").toLowerCase().includes("female") || String(gender || "").toLowerCase() === "f";
        const catUpper = String(category).trim().toUpperCase();

        let eligibleCategories = [category];

        if (catUpper === "OPEN" || catUpper === "GENERAL") {
            eligibleCategories = isFemale ? ["OPEN", "OPEN(GIRL)"] : ["OPEN"];
        } else if (catUpper === "BC" || catUpper === "OBC") {
            eligibleCategories = isFemale
                ? ["BC", "BC(Girl)", "BC(GL)", "OPEN", "OPEN(GIRL)"]
                : ["BC", "BC(OPEN)", "OPEN"];
        } else if (catUpper === "SC") {
            eligibleCategories = isFemale
                ? ["SC", "SC(Girl)", "SC(GL)", "OPEN", "OPEN(GIRL)"]
                : ["SC", "OPEN"];
        } else if (catUpper === "ST") {
            eligibleCategories = isFemale
                ? ["ST", "ST(Girl)", "ST(GL)", "OPEN", "OPEN(GIRL)"]
                : ["ST", "OPEN"];
        } else if (catUpper === "EWS" || catUpper.includes("EWS")) {
            eligibleCategories = isFemale
                ? ["EWS(OPEN)", "EWS(GL)", "EWS", "OPEN", "OPEN(GIRL)"]
                : ["EWS(OPEN)", "EWS", "OPEN"];
        }

        // Build SQL Query
        // Lower bound for realistic ambitious options (allow options up to 45% better than student's rank)
        const minClosingRank = Math.max(1, Math.round(studentRank * 0.55));
        // Upper bound for safe options (ensure safety schools are never hidden)
        const maxClosingRank = Math.max(Math.round(studentRank * 3.5), 250000);

        const values = [eligibleCategories, minClosingRank, maxClosingRank];
        let pIndex = 4;

        let query = `
            SELECT
                c.institute,
                c.program,
                c.quota,
                c.category,
                c.round,
                c.opening_rank,
                c.closing_rank,

                -- College Profile
                col.id AS college_id,
                col.display_name AS college_display_name,
                col.college_code,
                col.institution_type,
                col.ownership,
                col.city,
                col.website,
                col.approval,

                -- Fees
                cf.total_annual_fee AS annual_fee,
                cf.tuition_fee_annual,
                cf.academic_year AS fee_academic_year,
                cf.source_url AS fee_source_url,

                -- Placements
                cp.average_package_lpa,
                cp.median_package_lpa,
                cp.highest_package_lpa,
                cp.placement_percentage,
                cp.placement_year,
                cp.source_url AS placement_source_url,

                -- NIRF
                n.nirf_year,
                n.rank AS nirf_rank,
                n.rank_band AS nirf_rank_band,
                n.score AS nirf_score,

                -- Accreditations (Aggregated)
                COALESCE(acc.accreditation, '[]'::json) AS accreditation

            FROM cutoffs c

            LEFT JOIN colleges col
                ON c.institute = col.uptac_name

            LEFT JOIN college_fees cf
                ON cf.college_id = col.id
                AND cf.fee_type = 'Regular'

            LEFT JOIN college_placements cp
                ON cp.college_id = col.id
                AND cp.placement_year = 2024

            LEFT JOIN college_nirf_map m
                ON c.institute = m.uptac_institute
                AND m.verified = TRUE

            LEFT JOIN nirf_rankings n
                ON m.nirf_institute = n.institute_name
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
                            'valid_from', a.valid_from,
                            'valid_until', a.valid_until,
                            'source', a.source,
                            'source_url', a.source_url,
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
                            AND LOWER(TRIM(c.program)) = LOWER(TRIM(a.program))
                        )
                    )
            ) acc ON TRUE

            WHERE c.category = ANY($1)
              AND c.closing_rank >= $2
              AND c.closing_rank <= $3
        `;

        // Program filter
        if (program) {
            query += ` AND c.program ILIKE $${pIndex}`;
            values.push(`%${program}%`);
            pIndex++;
        }

        // Quota filter (default Home State)
        if (quota) {
            query += ` AND c.quota = $${pIndex}`;
            values.push(quota);
            pIndex++;
        }

        // Round filter
        if (round) {
            const normalizedRound = String(round).startsWith("Round ")
                ? String(round)
                : `Round ${round}`;
            query += ` AND c.round = $${pIndex}`;
            values.push(normalizedRound);
            pIndex++;
        }

        query += `
            ORDER BY c.closing_rank ASC
            LIMIT 150
        `;

        const result = await pool.query(query, values);

        // Process rows and execute ML inference
        const results = result.rows.map((row) => {
            const closingRank = Number(row.closing_rank);
            const openingRank = Number(row.opening_rank);

            // Execute ML inference
            const mlResult = predictAdmissionFeasibility({
                studentRank,
                openingRank,
                closingRank,
                institute: row.institute,
                category: row.category,
                round: row.round
            });

            // Map tier to backwards-compatible prediction label
            let legacyPrediction = "Moderate Chance";
            if (mlResult.tier === "SAFE") {
                legacyPrediction = "Safer Chance";
            } else if (mlResult.tier === "AMBITIOUS") {
                legacyPrediction = "Lower Chance";
            }

            return {
                institute: row.institute,
                program: row.program,
                quota: row.quota,
                category: row.category,
                round: row.round,
                opening_rank: row.opening_rank,
                closing_rank: row.closing_rank,

                // Legacy compatibility
                prediction: legacyPrediction,

                // Enhanced ML Prediction
                ml_prediction: mlResult,
                admission_feasibility: mlResult.tier === "SAFE" ? "High" : mlResult.tier === "MODERATE" ? "Moderate" : "Reach / Ambitious",
                feasibility_score: mlResult.feasibilityScore,
                explanation: mlResult.explanation,

                // College entity metadata
                college: row.college_id ? {
                    id: row.college_id,
                    display_name: row.college_display_name || row.institute,
                    code: row.college_code,
                    type: row.institution_type,
                    ownership: row.ownership,
                    city: row.city,
                    website: row.website,
                    approval: row.approval
                } : {
                    id: null,
                    display_name: row.institute,
                    code: null,
                    type: "UPTAC Institution",
                    ownership: "Affiliated",
                    city: "Uttar Pradesh",
                    website: null,
                    approval: null
                },

                // Fee data
                fee: row.annual_fee !== null ? {
                    annual_total: Number(row.annual_fee),
                    tuition: row.tuition_fee_annual !== null ? Number(row.tuition_fee_annual) : null,
                    academic_year: row.fee_academic_year,
                    source_url: row.fee_source_url
                } : null,

                // Placement data
                placement: row.average_package_lpa !== null ? {
                    average_lpa: Number(row.average_package_lpa),
                    median_lpa: row.median_package_lpa !== null ? Number(row.median_package_lpa) : null,
                    highest_lpa: row.highest_package_lpa !== null ? Number(row.highest_package_lpa) : null,
                    placement_percentage: row.placement_percentage !== null ? Number(row.placement_percentage) : null,
                    year: row.placement_year,
                    source_url: row.placement_source_url
                } : null,

                // NIRF
                nirf: row.nirf_year ? {
                    year: row.nirf_year,
                    rank: row.nirf_rank,
                    rank_band: row.nirf_rank_band,
                    score: row.nirf_score ? Number(row.nirf_score) : null
                } : null,

                // Accreditations
                accreditation: row.accreditation || []
            };
        });

        // Sort by tier order (Safe -> Moderate -> Ambitious), then by closing rank
        const tierPriority = {
            "SAFE": 1,
            "MODERATE": 2,
            "AMBITIOUS": 3
        };

        results.sort((a, b) => {
            const pA = tierPriority[a.ml_prediction.tier] || 2;
            const pB = tierPriority[b.ml_prediction.tier] || 2;
            if (pA !== pB) {
                return pA - pB;
            }
            return Number(a.closing_rank) - Number(b.closing_rank);
        });

        res.json({
            success: true,
            count: results.length,
            student_rank: studentRank,
            evaluated_category: category,
            eligible_categories_searched: eligibleCategories,
            model_info: {
                version: "v1.0.0-rf-ensemble",
                algorithm: "Random Forest Classifier (Ensemble)",
                evaluated_against_baseline: "Rule-Based Cutoff Baseline"
            },
            disclaimer: "CounsellQ is an academic decision-support tool based on historical UPTAC counselling cutoffs and verified institutional disclosures. Cutoff boundaries vary annually based on seat matrix, applicant volume, and exam difficulty; recommendations do not constitute an admission guarantee.",
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