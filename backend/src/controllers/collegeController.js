/**
 * CounsellQ College Directory Controller
 * Provides searchable, filterable college discovery and detailed college profiles.
 */

const pool = require("../db");
const { MODEL_METADATA } = require("../ml/modelInference");

/**
 * Get all colleges with optional search and filters
 * Supports query params: search, city, type, ownership, maxFee, minAvgPkg, nirfOnly, page, limit
 */
const getColleges = async (req, res) => {
    try {
        const {
            search,
            city,
            type,
            ownership,
            maxFee,
            minAvgPkg,
            nirfOnly,
            page = 1,
            limit = 50,
            sortBy = "name",
            sortOrder = "ASC"
        } = req.query;

        const offset = (Math.max(1, Number(page)) - 1) * Math.min(100, Math.max(1, Number(limit)));
        const pageLimit = Math.min(100, Math.max(1, Number(limit)));

        const conditions = [];
        const values = [];
        let pIndex = 1;

        if (search) {
            conditions.push(`(col.display_name ILIKE $${pIndex} OR col.uptac_name ILIKE $${pIndex} OR col.city ILIKE $${pIndex})`);
            values.push(`%${search.trim()}%`);
            pIndex++;
        }

        if (city) {
            conditions.push(`col.city ILIKE $${pIndex}`);
            values.push(`%${city.trim()}%`);
            pIndex++;
        }

        if (type) {
            conditions.push(`col.institution_type ILIKE $${pIndex}`);
            values.push(`%${type.trim()}%`);
            pIndex++;
        }

        if (ownership) {
            conditions.push(`col.ownership = $${pIndex}`);
            values.push(ownership.trim());
            pIndex++;
        }

        if (maxFee) {
            conditions.push(`cf.total_annual_fee <= $${pIndex}`);
            values.push(Number(maxFee));
            pIndex++;
        }

        if (minAvgPkg) {
            conditions.push(`cp.average_package_lpa >= $${pIndex}`);
            values.push(Number(minAvgPkg));
            pIndex++;
        }

        if (nirfOnly === "true" || nirfOnly === true) {
            conditions.push(`n.id IS NOT NULL`);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        // Query count
        const countQuery = `
            SELECT COUNT(DISTINCT col.id) AS total
            FROM colleges col
            LEFT JOIN college_fees cf ON cf.college_id = col.id AND cf.fee_type = 'Regular'
            LEFT JOIN college_placements cp ON cp.college_id = col.id AND cp.placement_year = 2024
            LEFT JOIN college_nirf_map m ON m.uptac_institute = col.uptac_name AND m.verified = TRUE
            LEFT JOIN nirf_rankings n ON n.institute_name = m.nirf_institute AND n.ranking_category = 'Engineering'
            ${whereClause}
        `;

        const countRes = await pool.query(countQuery, values);
        const total = Number(countRes.rows[0].total || 0);

        // Sorting
        let orderByClause = "ORDER BY col.display_name ASC";
        if (sortBy === "fee") {
            orderByClause = `ORDER BY cf.total_annual_fee ${sortOrder === "DESC" ? "DESC NULLS LAST" : "ASC NULLS LAST"}`;
        } else if (sortBy === "placement") {
            orderByClause = `ORDER BY cp.average_package_lpa ${sortOrder === "ASC" ? "ASC NULLS LAST" : "DESC NULLS LAST"}`;
        } else if (sortBy === "nirf") {
            orderByClause = `ORDER BY n.rank ASC NULLS LAST, n.rank_band ASC NULLS LAST`;
        }

        const dataQuery = `
            SELECT
                col.id,
                col.uptac_name,
                col.display_name,
                col.college_code,
                col.institution_type,
                col.ownership,
                col.city,
                col.district,
                col.state,
                col.established_year,
                col.campus_area,
                col.website,
                col.approval,

                -- Fees
                cf.total_annual_fee AS annual_fee,
                cf.tuition_fee_annual,
                cf.hostel_fee_annual,
                cf.academic_year AS fee_academic_year,
                cf.source_url AS fee_source_url,

                -- Placements
                cp.average_package_lpa,
                cp.median_package_lpa,
                cp.highest_package_lpa,
                cp.placement_percentage,
                cp.placement_year,
                cp.top_recruiters,
                cp.source_url AS placement_source_url,

                -- NIRF
                n.nirf_year,
                n.rank AS nirf_rank,
                n.rank_band AS nirf_rank_band,
                n.score AS nirf_score,

                -- Cutoff record count
                COALESCE(cut.cutoff_count, 0) AS cutoff_count

            FROM colleges col

            LEFT JOIN college_fees cf
                ON cf.college_id = col.id
                AND cf.fee_type = 'Regular'

            LEFT JOIN college_placements cp
                ON cp.college_id = col.id
                AND cp.placement_year = 2024

            LEFT JOIN college_nirf_map m
                ON m.uptac_institute = col.uptac_name
                AND m.verified = TRUE

            LEFT JOIN nirf_rankings n
                ON n.institute_name = m.nirf_institute
                AND n.ranking_category = 'Engineering'

            LEFT JOIN (
                SELECT institute, COUNT(*) AS cutoff_count
                FROM cutoffs
                GROUP BY institute
            ) cut ON cut.institute = col.uptac_name

            ${whereClause}
            ${orderByClause}
            LIMIT $${pIndex} OFFSET $${pIndex + 1}
        `;

        values.push(pageLimit, offset);
        const dataRes = await pool.query(dataQuery, values);

        const colleges = dataRes.rows.map(row => ({
            id: row.id,
            name: row.display_name,
            uptac_name: row.uptac_name,
            code: row.college_code,
            type: row.institution_type,
            ownership: row.ownership,
            city: row.city,
            district: row.district,
            state: row.state,
            established_year: row.established_year,
            campus_area: row.campus_area,
            website: row.website,
            approval: row.approval,
            cutoff_count: Number(row.cutoff_count),

            fee: row.annual_fee !== null ? {
                annual_total: Number(row.annual_fee),
                tuition: row.tuition_fee_annual !== null ? Number(row.tuition_fee_annual) : null,
                hostel: row.hostel_fee_annual !== null ? Number(row.hostel_fee_annual) : null,
                academic_year: row.fee_academic_year,
                source_url: row.fee_source_url
            } : null,

            placement: row.average_package_lpa !== null ? {
                average_lpa: Number(row.average_package_lpa),
                median_lpa: row.median_package_lpa !== null ? Number(row.median_package_lpa) : null,
                highest_lpa: row.highest_package_lpa !== null ? Number(row.highest_package_lpa) : null,
                placement_percentage: row.placement_percentage !== null ? Number(row.placement_percentage) : null,
                year: row.placement_year,
                top_recruiters: row.top_recruiters,
                source_url: row.placement_source_url
            } : null,

            nirf: row.nirf_year ? {
                year: row.nirf_year,
                rank: row.nirf_rank,
                rank_band: row.nirf_rank_band,
                score: row.nirf_score
            } : null
        }));

        res.json({
            success: true,
            total,
            page: Number(page),
            limit: pageLimit,
            colleges
        });
    } catch (err) {
        console.error("Error in getColleges:", err.message);
        res.status(500).json({
            success: false,
            error: err.message || "Failed to retrieve colleges"
        });
    }
};

/**
 * Get detailed college profile by college id or code
 */
const getCollegeDetails = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch college basic info
        const colRes = await pool.query(`
            SELECT *
            FROM colleges
            WHERE id = $1 OR college_code = $1 OR uptac_name = $1
            LIMIT 1;
        `, [id]);

        if (colRes.rows.length === 0) {
            return res.status(400).json({
                success: false,
                error: "College not found"
            });
        }

        const college = colRes.rows[0];

        // Fetch all fee schedules
        const feeRes = await pool.query(`
            SELECT *
            FROM college_fees
            WHERE college_id = $1
            ORDER BY fee_type, academic_year DESC;
        `, [college.id]);

        // Fetch all placement records
        const placementRes = await pool.query(`
            SELECT *
            FROM college_placements
            WHERE college_id = $1
            ORDER BY placement_year DESC;
        `, [college.id]);

        // Fetch NIRF records
        const nirfRes = await pool.query(`
            SELECT n.*
            FROM college_nirf_map m
            JOIN nirf_rankings n ON n.institute_name = m.nirf_institute
            WHERE m.uptac_institute = $1 AND m.verified = TRUE
            ORDER BY n.nirf_year DESC;
        `, [college.uptac_name]);

        // Fetch accreditations (NBA and NAAC)
        const accredRes = await pool.query(`
            SELECT a.*,
                   CASE
                       WHEN a.valid_until IS NULL THEN 'DATE_NOT_AVAILABLE'
                       WHEN a.valid_until >= CURRENT_DATE THEN 'CURRENTLY_VALID'
                       ELSE 'EXPIRED'
                   END AS derived_status
            FROM college_accreditation_map cam
            JOIN accreditations a ON a.institute_name = cam.accreditation_institute
            WHERE cam.uptac_institute = $1 AND cam.verified = TRUE
            ORDER BY a.accreditation_type, a.program;
        `, [college.uptac_name]);

        // Fetch popular programs and cutoffs
        const cutoffSummaryRes = await pool.query(`
            SELECT
                program,
                category,
                round,
                MIN(opening_rank) AS min_open,
                MAX(closing_rank) AS max_close,
                COUNT(*) AS count
            FROM cutoffs
            WHERE institute = $1
            GROUP BY program, category, round
            ORDER BY program, round
            LIMIT 25;
        `, [college.uptac_name]);

        res.json({
            success: true,
            college: {
                id: college.id,
                name: college.display_name,
                uptac_name: college.uptac_name,
                code: college.college_code,
                type: college.institution_type,
                ownership: college.ownership,
                city: college.city,
                district: college.district,
                state: college.state,
                established_year: college.established_year,
                campus_area: college.campus_area,
                website: college.website,
                approval: college.approval,

                fees: feeRes.rows.map(f => ({
                    program: f.program,
                    fee_type: f.fee_type,
                    tuition_fee_annual: Number(f.tuition_fee_annual),
                    other_fees_annual: Number(f.other_fees_annual),
                    total_annual_fee: Number(f.total_annual_fee),
                    total_program_fee: f.total_program_fee ? Number(f.total_program_fee) : null,
                    hostel_fee_annual: f.hostel_fee_annual ? Number(f.hostel_fee_annual) : null,
                    academic_year: f.academic_year,
                    source_name: f.source_name,
                    source_url: f.source_url,
                    notes: f.notes
                })),

                placements: placementRes.rows.map(p => ({
                    year: p.placement_year,
                    program: p.program,
                    average_lpa: Number(p.average_package_lpa),
                    median_lpa: p.median_package_lpa ? Number(p.median_package_lpa) : null,
                    highest_lpa: p.highest_package_lpa ? Number(p.highest_package_lpa) : null,
                    placement_percentage: p.placement_percentage ? Number(p.placement_percentage) : null,
                    students_placed: p.students_placed,
                    total_eligible: p.total_eligible,
                    top_recruiters: p.top_recruiters,
                    source_name: p.source_name,
                    source_url: p.source_url,
                    notes: p.notes
                })),

                nirf: nirfRes.rows.map(n => ({
                    year: n.nirf_year,
                    category: n.ranking_category,
                    rank: n.rank,
                    rank_band: n.rank_band,
                    score: n.score ? Number(n.score) : null,
                    source: n.source
                })),

                accreditations: accredRes.rows.map(a => ({
                    type: a.accreditation_type,
                    status: a.accreditation_status,
                    grade: a.grade,
                    program: a.program,
                    validity: a.validity,
                    valid_from: a.valid_from,
                    valid_until: a.valid_until,
                    derived_status: a.derived_status,
                    source: a.source,
                    source_url: a.source_url
                })),

                cutoffs_summary: cutoffSummaryRes.rows
            }
        });

    } catch (err) {
        console.error("Error in getCollegeDetails:", err.message);
        res.status(500).json({
            success: false,
            error: "Failed to retrieve college details"
        });
    }
};

/**
 * Get ML Model benchmark metadata and evaluation metrics
 */
const getMLInfo = async (req, res) => {
    try {
        const fs = require("fs");
        const path = require("path");
        const reportPath = path.resolve(__dirname, "../../../ml/ml_comparison_report.json");

        let reportData = null;
        if (fs.existsSync(reportPath)) {
            reportData = JSON.parse(fs.readFileSync(reportPath, "utf8"));
        }

        res.json({
            success: true,
            model_metadata: MODEL_METADATA,
            benchmark_report: reportData
        });
    } catch (err) {
        console.error("Error in getMLInfo:", err.message);
        res.status(500).json({
            success: false,
            error: "Failed to retrieve ML metadata"
        });
    }
};

module.exports = {
    getColleges,
    getCollegeDetails,
    getMLInfo
};
