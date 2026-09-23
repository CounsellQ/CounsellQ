"use strict";

const pool = require("../db");

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * The maximum closing rank present in the UPTAC 2025 dataset is 1,475,039.
 * We set the upper validation bound to 1,500,000 to accommodate that range
 * while rejecting obviously impossible inputs.
 *
 * The minimum rank is 1 (top rank in any state counselling).
 */
const RANK_MIN = 1;
const RANK_MAX = 1_500_000;

/**
 * Valid UPTAC category codes derived from the actual dataset.
 * Loaded once at module init from this constant set.
 * The live GET /api/categories endpoint is authoritative — this set
 * is used only for fast in-process validation without a DB round-trip.
 */
const VALID_CATEGORIES = new Set([
    "OPEN", "OPEN(GIRL)", "OPEN(TF)", "OPEN(AF)", "OPEN(PH)", "OPEN(FF)",
    "BC", "BC(Girl)", "BC(AF)", "BC(PH)", "BC(FF)",
    "SC", "SC(Girl)", "SC(AF)", "SC(PH)", "SC(FF)",
    "ST", "ST(Girl)", "ST(AF)",
    "EWS(OPEN)", "EWS(GL)", "EWS(AF)", "EWS(PH)", "EWS(FF)"
]);

/**
 * Valid counselling round values in the dataset.
 */
const VALID_ROUNDS = new Set(["Round 1", "Round 2", "Round 3"]);

/**
 * Only quota present in the 2025 dataset.
 * Validated here to prevent silent zero-result queries.
 */
const VALID_QUOTAS = new Set(["Home State"]);

// ── Classification logic ──────────────────────────────────────────────────────

/**
 * Classify a college result based on the student's rank vs the historical
 * closing rank for that institute/program/category combination.
 *
 * Definitions:
 *   "Safe"      — historical closing rank is ≥ 20% higher than student rank.
 *                 The student's rank is comfortably within the historical cutoff.
 *   "Moderate"  — closing rank is within 0–20% above the student rank.
 *                 The student is near the cutoff boundary.
 *   "Ambitious" — closing rank is below the student rank.
 *                 Historically, this seat closed before the student's rank.
 *                 Admission would require the cutoff to relax in the current year.
 *
 * These are counselling guidance categories, not admission guarantees.
 */
function classifyChance(studentRank, closingRank) {
    const buffer = (closingRank - studentRank) / studentRank;

    if (buffer >= 0.20) return "Safe";
    if (buffer >= 0)    return "Moderate";
    return "Ambitious";
}

// ── Validation helpers ────────────────────────────────────────────────────────

/**
 * Validate the prediction request body.
 * Returns { valid: true } or { valid: false, error: string, field: string }.
 */
function validatePredictRequest(body) {
    const { rank, category, program, quota, round } = body;

    // rank — required
    if (rank === undefined || rank === null || rank === "") {
        return { valid: false, field: "rank", error: "'rank' is required" };
    }

    const studentRank = Number(rank);

    if (!Number.isFinite(studentRank)) {
        return { valid: false, field: "rank", error: "'rank' must be a number" };
    }
    if (!Number.isInteger(studentRank)) {
        return { valid: false, field: "rank", error: "'rank' must be an integer" };
    }
    if (studentRank < RANK_MIN) {
        return { valid: false, field: "rank", error: `'rank' must be at least ${RANK_MIN}` };
    }
    if (studentRank > RANK_MAX) {
        return {
            valid: false,
            field: "rank",
            error: `'rank' must not exceed ${RANK_MAX.toLocaleString()} (maximum rank in the UPTAC 2025 dataset)`
        };
    }

    // category — required
    if (!category || typeof category !== "string" || !category.trim()) {
        return { valid: false, field: "category", error: "'category' is required" };
    }

    if (!VALID_CATEGORIES.has(category.trim())) {
        return {
            valid: false,
            field: "category",
            error: `'category' value "${category}" is not recognised. Use GET /api/categories to see valid values.`
        };
    }

    // program — optional, but must be a non-empty string if provided
    if (program !== undefined && program !== null) {
        if (typeof program !== "string" || !program.trim()) {
            return { valid: false, field: "program", error: "'program' must be a non-empty string when provided" };
        }
        if (program.trim().length > 200) {
            return { valid: false, field: "program", error: "'program' must not exceed 200 characters" };
        }
    }

    // quota — optional, validated against known values
    if (quota !== undefined && quota !== null && quota !== "") {
        if (!VALID_QUOTAS.has(quota.trim())) {
            return {
                valid: false,
                field: "quota",
                error: `'quota' value "${quota}" is not recognised. Valid value: "Home State".`
            };
        }
    }

    // round — optional, validated against known values
    if (round !== undefined && round !== null && round !== "") {
        if (!VALID_ROUNDS.has(round.trim())) {
            return {
                valid: false,
                field: "round",
                error: `'round' value "${round}" is not recognised. Valid values: "Round 1", "Round 2", "Round 3".`
            };
        }
    }

    return { valid: true };
}

// ── Controller ────────────────────────────────────────────────────────────────

/**
 * POST /api/predict
 *
 * Request body:
 *   rank      {integer}  Required. Student's UPTAC rank (1–1,500,000).
 *   category  {string}   Required. UPTAC category code (e.g. "OPEN", "BC", "SC").
 *                        Use GET /api/categories for the full list.
 *   program   {string}   Optional. Partial program name (ILIKE search).
 *   quota     {string}   Optional. Admission quota. Currently only "Home State" exists.
 *   round     {string}   Optional. Counselling round ("Round 1", "Round 2", "Round 3").
 *
 * Response (200):
 *   {
 *     success: true,
 *     count: number,
 *     query: { rank, category, program?, quota?, round? },
 *     results: [
 *       {
 *         institute, program, quota, category, round,
 *         opening_rank, closing_rank,
 *         chance: "Safe" | "Moderate" | "Ambitious",
 *         rank_gap: number  (positive = rank is below cutoff, negative = above)
 *       }
 *     ]
 *   }
 *
 * Classification key:
 *   Safe      — closing rank ≥ 120% of student rank (comfortable buffer)
 *   Moderate  — closing rank ≥ student rank but < 120%
 *   Ambitious — closing rank < student rank (historically harder than student's rank)
 */
const predictColleges = async (req, res) => {
    // ── Validate input ────────────────────────────────────────────────────────

    const validation = validatePredictRequest(req.body);

    if (!validation.valid) {
        return res.status(400).json({
            success: false,
            field: validation.field,
            error: validation.error
        });
    }

    const { rank, category, program, quota, round } = req.body;
    const studentRank = Number(rank);

    // ── Build query ───────────────────────────────────────────────────────────
    //
    // Retrieve historical records where the closing rank is within
    // twice the student's rank. This includes:
    //   - Records where the student has a safe chance (closing_rank much higher)
    //   - Records near the cutoff (moderate)
    //   - Records slightly below the student's rank (ambitious — historically harder)
    //
    // We use closing_rank <= studentRank * 2 to avoid returning tens of
    // thousands of records for students with low ranks while still
    // capturing the full range of relevant options.

    const values = [category.trim()];
    let paramIndex = 2;

    let queryText = `
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

    if (program && program.trim()) {
        queryText += ` AND program ILIKE $${paramIndex}`;
        values.push(`%${program.trim()}%`);
        paramIndex++;
    }

    if (quota && quota.trim()) {
        queryText += ` AND quota = $${paramIndex}`;
        values.push(quota.trim());
        paramIndex++;
    }

    if (round && round.trim()) {
        queryText += ` AND round = $${paramIndex}`;
        values.push(round.trim());
        paramIndex++;
    }

    queryText += `
        AND closing_rank <= $${paramIndex}
        ORDER BY closing_rank ASC
        LIMIT 200
    `;
    values.push(studentRank * 2);

    // ── Execute query ─────────────────────────────────────────────────────────

    try {
        const dbResult = await pool.query(queryText, values);

        if (dbResult.rows.length === 0) {
            return res.json({
                success: true,
                count: 0,
                query: buildQueryMeta(req.body, studentRank),
                message: "No historical records found for the given filters. Try broadening your search (remove program or round filters).",
                results: []
            });
        }

        // ── Classify and sort ─────────────────────────────────────────────────

        const chanceOrder = { Safe: 1, Moderate: 2, Ambitious: 3 };
        const predictionLabels = {
            Safe: "Safer Chance",
            Moderate: "Moderate Chance",
            Ambitious: "Lower Chance"
        };

        const results = dbResult.rows
            .map((row) => {
                const closingRank = Number(row.closing_rank);
                const chance = classifyChance(studentRank, closingRank);
                return {
                    institute: row.institute,
                    program: row.program,
                    quota: row.quota,
                    category: row.category,
                    round: row.round,
                    opening_rank: Number(row.opening_rank),
                    closing_rank: closingRank,
                    chance,
                    prediction: predictionLabels[chance],
                    // Positive: closing rank is higher than student rank (better odds)
                    // Negative: closing rank is lower than student rank (historically harder)
                    rank_gap: closingRank - studentRank
                };
            })
            .sort((a, b) => {
                const orderDiff = chanceOrder[a.chance] - chanceOrder[b.chance];
                if (orderDiff !== 0) return orderDiff;
                return a.closing_rank - b.closing_rank;
            });

        res.json({
            success: true,
            count: results.length,
            query: buildQueryMeta(req.body, studentRank),
            results
        });

    } catch (error) {
        console.error("[predict] Database error:", error.message);

        res.status(503).json({
            success: false,
            error: "Database query failed. Please try again."
        });
    }
};

/**
 * Build the query metadata echo included in the response.
 * This helps the frontend display what was searched.
 */
function buildQueryMeta(body, studentRank) {
    const meta = { rank: studentRank, category: body.category };
    if (body.program) meta.program = body.program;
    if (body.quota)   meta.quota   = body.quota;
    if (body.round)   meta.round   = body.round;
    return meta;
}

module.exports = { predictColleges };