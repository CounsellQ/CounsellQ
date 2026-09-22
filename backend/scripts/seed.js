/**
 * CounsellQ — Database Seed Script
 *
 * Reads data/counsellq_uptac_2025.csv and inserts all records into
 * the PostgreSQL `cutoffs` table using parameterized bulk inserts.
 *
 * Usage:
 *   node scripts/seed.js
 *
 * Requirements:
 *   - PostgreSQL running and reachable
 *   - .env file present with valid DB_* variables
 *   - schema.sql already applied (run: psql -U postgres -d counsellQ -f schema.sql)
 *
 * Safety:
 *   - Uses ON CONFLICT DO NOTHING so re-running is safe and idempotent.
 *   - Never drops or truncates existing data.
 *   - Validates each CSV row before insert. Skips and logs invalid rows.
 */

"use strict";

const fs = require("fs");
const path = require("path");
const readline = require("readline");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const pool = require("../src/db");

const CSV_PATH = path.join(__dirname, "../../../data/counsellq_uptac_2025.csv");

/**
 * Parse one CSV line, respecting quoted fields with commas inside.
 * Returns an array of trimmed string values.
 */
function parseCsvLine(line) {
    const fields = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            inQuotes = !inQuotes;
        } else if (ch === "," && !inQuotes) {
            fields.push(current.trim());
            current = "";
        } else {
            current += ch;
        }
    }
    fields.push(current.trim());
    return fields;
}

/**
 * Validate one data row. Returns { valid: true, record } or { valid: false, reason }.
 * Expected CSV columns (by index):
 *   0: Year, 1: Institute, 2: Program, 3: Quota,
 *   4: Category, 5: Round, 6: Opening Rank, 7: Closing Rank
 */
function validateRow(fields, lineNumber) {
    if (fields.length < 8) {
        return { valid: false, reason: `Line ${lineNumber}: expected 8 fields, got ${fields.length}` };
    }

    const [yearStr, institute, program, quota, category, round, openingRankStr, closingRankStr] = fields;

    const year = parseInt(yearStr, 10);
    const openingRank = parseInt(openingRankStr, 10);
    const closingRank = parseInt(closingRankStr, 10);

    if (isNaN(year) || year < 2000 || year > 2100) {
        return { valid: false, reason: `Line ${lineNumber}: invalid year "${yearStr}"` };
    }
    if (!institute.trim()) {
        return { valid: false, reason: `Line ${lineNumber}: institute is empty` };
    }
    if (!program.trim()) {
        return { valid: false, reason: `Line ${lineNumber}: program is empty` };
    }
    if (!quota.trim()) {
        return { valid: false, reason: `Line ${lineNumber}: quota is empty` };
    }
    if (!category.trim()) {
        return { valid: false, reason: `Line ${lineNumber}: category is empty` };
    }
    if (!round.trim()) {
        return { valid: false, reason: `Line ${lineNumber}: round is empty` };
    }
    if (isNaN(openingRank) || openingRank <= 0) {
        return { valid: false, reason: `Line ${lineNumber}: invalid opening_rank "${openingRankStr}"` };
    }
    if (isNaN(closingRank) || closingRank <= 0) {
        return { valid: false, reason: `Line ${lineNumber}: invalid closing_rank "${closingRankStr}"` };
    }

    return {
        valid: true,
        record: { year, institute, program, quota, category, round, openingRank, closingRank }
    };
}

const INSERT_SQL = `
    INSERT INTO cutoffs
        (year, institute, program, quota, category, round, opening_rank, closing_rank)
    VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT ON CONSTRAINT cutoffs_unique_record
        DO NOTHING
`;

const BATCH_SIZE = 500;

async function seed() {
    console.log("CounsellQ — Database Seed Script");
    console.log("=================================");
    console.log(`CSV: ${CSV_PATH}`);

    if (!fs.existsSync(CSV_PATH)) {
        console.error(`ERROR: CSV file not found at ${CSV_PATH}`);
        process.exit(1);
    }

    // Verify DB connection
    let client;
    try {
        client = await pool.connect();
        const result = await client.query("SELECT NOW()");
        console.log(`DB connected: ${result.rows[0].now}`);
    } catch (err) {
        console.error(`ERROR: Cannot connect to database — ${err.message}`);
        console.error("Ensure PostgreSQL is running and .env credentials are correct.");
        process.exit(1);
    }

    const rl = readline.createInterface({
        input: fs.createReadStream(CSV_PATH, { encoding: "utf8" }),
        crlfDelay: Infinity
    });

    let lineNumber = 0;
    let inserted = 0;
    let skipped = 0;
    let invalid = 0;
    let batch = [];

    async function flushBatch() {
        if (batch.length === 0) return;
        for (const record of batch) {
            try {
                const result = await client.query(INSERT_SQL, [
                    record.year,
                    record.institute,
                    record.program,
                    record.quota,
                    record.category,
                    record.round,
                    record.openingRank,
                    record.closingRank
                ]);
                if (result.rowCount > 0) {
                    inserted++;
                } else {
                    skipped++; // ON CONFLICT DO NOTHING — already exists
                }
            } catch (err) {
                console.error(`  Insert error: ${err.message}`);
                invalid++;
            }
        }
        batch = [];
    }

    for await (const line of rl) {
        lineNumber++;

        // Skip header row
        if (lineNumber === 1) continue;

        // Skip blank lines
        if (!line.trim()) continue;

        const fields = parseCsvLine(line);
        const validation = validateRow(fields, lineNumber);

        if (!validation.valid) {
            console.warn(`  SKIP: ${validation.reason}`);
            invalid++;
            continue;
        }

        batch.push(validation.record);

        if (batch.length >= BATCH_SIZE) {
            process.stdout.write(`  Processing rows 1–${lineNumber}...\r`);
            await flushBatch();
        }
    }

    // Flush remaining records
    await flushBatch();

    client.release();
    await pool.end();

    console.log("\n");
    console.log("Seed complete:");
    console.log(`  Rows processed : ${lineNumber - 1}`);
    console.log(`  Inserted       : ${inserted}`);
    console.log(`  Already existed: ${skipped}`);
    console.log(`  Invalid/skipped: ${invalid}`);
}

seed().catch((err) => {
    console.error("Unhandled error during seed:", err);
    process.exit(1);
});
