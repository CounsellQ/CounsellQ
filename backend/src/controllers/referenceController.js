"use strict";

const pool = require("../db");

/**
 * GET /api/categories
 *
 * Returns all distinct category values from the cutoffs table,
 * annotated with a human-readable label and their JEE Main equivalent.
 *
 * The UPTAC counselling system uses its own category codes which differ
 * from JEE Main terminology. This mapping is derived from UPTAC 2025
 * data and documented in docs/DATA_CONTRACT.md.
 *
 *   UPTAC code   | Base category | JEE Main equivalent
 *   -------------+---------------+---------------------
 *   OPEN         | General       | General (open merit)
 *   OPEN(GIRL)   | General       | General (female supernumerary)
 *   OPEN(TF)     | General       | General (Tuition Fee waiver — UP only)
 *   OPEN(AF)     | General       | General (Armed Forces dependent)
 *   OPEN(PH)     | General       | General (Physically Handicapped)
 *   OPEN(FF)     | General       | General (Freedom Fighter dependent)
 *   BC           | OBC           | OBC-NCL
 *   BC(Girl)     | OBC           | OBC-NCL (female supernumerary)
 *   BC(AF)       | OBC           | OBC-NCL (Armed Forces dependent)
 *   BC(PH)       | OBC           | OBC-NCL (Physically Handicapped)
 *   BC(FF)       | OBC           | OBC-NCL (Freedom Fighter dependent)
 *   SC           | SC            | SC
 *   SC(Girl)     | SC            | SC (female supernumerary)
 *   SC(AF)       | SC            | SC (Armed Forces dependent)
 *   SC(PH)       | SC            | SC (Physically Handicapped)
 *   SC(FF)       | SC            | SC (Freedom Fighter dependent)
 *   ST           | ST            | ST
 *   ST(Girl)     | ST            | ST (female supernumerary)
 *   ST(AF)       | ST            | ST (Armed Forces dependent)
 *   EWS(OPEN)    | EWS           | EWS
 *   EWS(GL)      | EWS           | EWS (female/girl)
 *   EWS(AF)      | EWS           | EWS (Armed Forces dependent)
 *   EWS(PH)      | EWS           | EWS (Physically Handicapped)
 *   EWS(FF)      | EWS           | EWS (Freedom Fighter dependent)
 */
const CATEGORY_METADATA = {
    // General / Open
    "OPEN":        { base: "General",  label: "Open (General)",              jee_equivalent: "General" },
    "OPEN(GIRL)":  { base: "General",  label: "Open – Female Supernumerary", jee_equivalent: "General" },
    "OPEN(TF)":    { base: "General",  label: "Open – Tuition Fee Waiver",   jee_equivalent: null },
    "OPEN(AF)":    { base: "General",  label: "Open – Armed Forces",         jee_equivalent: "General" },
    "OPEN(PH)":    { base: "General",  label: "Open – Physically Handicapped", jee_equivalent: "General" },
    "OPEN(FF)":    { base: "General",  label: "Open – Freedom Fighter",      jee_equivalent: "General" },
    // BC / OBC-NCL
    "BC":          { base: "OBC",      label: "Backward Class (OBC)",        jee_equivalent: "OBC-NCL" },
    "BC(Girl)":    { base: "OBC",      label: "BC – Female Supernumerary",   jee_equivalent: "OBC-NCL" },
    "BC(AF)":      { base: "OBC",      label: "BC – Armed Forces",           jee_equivalent: "OBC-NCL" },
    "BC(PH)":      { base: "OBC",      label: "BC – Physically Handicapped", jee_equivalent: "OBC-NCL" },
    "BC(FF)":      { base: "OBC",      label: "BC – Freedom Fighter",        jee_equivalent: "OBC-NCL" },
    // SC
    "SC":          { base: "SC",       label: "Scheduled Caste",             jee_equivalent: "SC" },
    "SC(Girl)":    { base: "SC",       label: "SC – Female Supernumerary",   jee_equivalent: "SC" },
    "SC(AF)":      { base: "SC",       label: "SC – Armed Forces",           jee_equivalent: "SC" },
    "SC(PH)":      { base: "SC",       label: "SC – Physically Handicapped", jee_equivalent: "SC" },
    "SC(FF)":      { base: "SC",       label: "SC – Freedom Fighter",        jee_equivalent: "SC" },
    // ST
    "ST":          { base: "ST",       label: "Scheduled Tribe",             jee_equivalent: "ST" },
    "ST(Girl)":    { base: "ST",       label: "ST – Female Supernumerary",   jee_equivalent: "ST" },
    "ST(AF)":      { base: "ST",       label: "ST – Armed Forces",           jee_equivalent: "ST" },
    // EWS
    "EWS(OPEN)":   { base: "EWS",      label: "EWS – General",               jee_equivalent: "EWS" },
    "EWS(GL)":     { base: "EWS",      label: "EWS – Female / Girl",         jee_equivalent: "EWS" },
    "EWS(AF)":     { base: "EWS",      label: "EWS – Armed Forces",          jee_equivalent: "EWS" },
    "EWS(PH)":     { base: "EWS",      label: "EWS – Physically Handicapped", jee_equivalent: "EWS" },
    "EWS(FF)":     { base: "EWS",      label: "EWS – Freedom Fighter",       jee_equivalent: "EWS" }
};

const getCategories = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT DISTINCT category FROM cutoffs ORDER BY category ASC"
        );

        const categories = result.rows.map(({ category }) => ({
            code: category,
            label: CATEGORY_METADATA[category]?.label ?? category,
            base_category: CATEGORY_METADATA[category]?.base ?? "Other",
            jee_equivalent: CATEGORY_METADATA[category]?.jee_equivalent ?? null
        }));

        res.json({
            success: true,
            count: categories.length,
            note: "Use the 'code' value in POST /api/predict requests.",
            categories
        });
    } catch (error) {
        console.error("[categories] Error:", error.message);
        res.status(503).json({
            success: false,
            error: "Could not retrieve categories from database"
        });
    }
};

/**
 * GET /api/programs
 * Returns all distinct program names, with optional ?search= filter.
 */
const getPrograms = async (req, res) => {
    try {
        const { search } = req.query;
        let queryText = "SELECT DISTINCT program FROM cutoffs";
        const values = [];

        if (search && search.trim()) {
            if (search.trim().length > 200) {
                return res.status(400).json({
                    success: false,
                    error: "'search' query parameter must not exceed 200 characters"
                });
            }
            queryText += " WHERE program ILIKE $1";
            values.push(`%${search.trim()}%`);
        }

        queryText += " ORDER BY program ASC";

        const result = await pool.query(queryText, values);
        const programs = result.rows.map((r) => r.program);

        res.json({
            success: true,
            count: programs.length,
            programs
        });
    } catch (error) {
        console.error("[programs] Error:", error.message);
        res.status(503).json({
            success: false,
            error: "Could not retrieve programs from database"
        });
    }
};

/**
 * GET /api/rounds
 * Returns all distinct counselling rounds.
 */
const getRounds = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT DISTINCT round FROM cutoffs ORDER BY round ASC"
        );
        const rounds = result.rows.map((r) => r.round);

        res.json({
            success: true,
            count: rounds.length,
            rounds
        });
    } catch (error) {
        console.error("[rounds] Error:", error.message);
        res.status(503).json({
            success: false,
            error: "Could not retrieve rounds from database"
        });
    }
};

module.exports = { getCategories, getPrograms, getRounds };
