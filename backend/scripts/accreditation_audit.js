/**
 * CounsellQ - official accreditation audit helper
 *
 * This script DOES NOT invent accreditation data.
 * It prepares the UPTAC institute universe and creates a report of
 * accreditation records already stored in PostgreSQL.
 *
 * Usage:
 *   node backend/scripts/accreditation_audit.js
 *
 * Required environment:
 *   DATABASE_URL or PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE
 *
 * It reports:
 *   - UPTAC institute count
 *   - verified mappings
 *   - accreditation records
 *   - current/expired/date-unavailable records
 *   - orphan mappings
 *   - research queue status
 *
 * Official sources used by the project:
 *   UPTAC: https://uptac.admissions.nic.in/institutes/
 *   NBA:   https://www.nbaind.org/accreditationprogram/AccreditedProgram
 *   NAAC:  https://assessmentonline-basic.naac.gov.in/
 */

const { Pool } = require("pg");
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || undefined,
  host: process.env.PGHOST,
  port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined,
});

async function run() {
  const client = await pool.connect();

  try {
    const checks = {
      uptac: `
        SELECT COUNT(DISTINCT institute)::int AS count
        FROM cutoffs
      `,
      mappings: `
        SELECT COUNT(*)::int AS count
        FROM college_accreditation_map
        WHERE verified = TRUE
      `,
      accreditation: `
        SELECT COUNT(*)::int AS count
        FROM accreditations
      `,
      status: `
        SELECT
          CASE
            WHEN valid_until IS NULL THEN 'DATE_NOT_AVAILABLE'
            WHEN valid_until >= CURRENT_DATE THEN 'CURRENTLY_VALID'
            ELSE 'EXPIRED'
          END AS derived_status,
          COUNT(*)::int AS records
        FROM accreditations
        GROUP BY 1
        ORDER BY 1
      `,
      queue: `
        SELECT research_status, COUNT(*)::int AS institutes
        FROM accreditation_research_queue
        GROUP BY research_status
        ORDER BY research_status
      `,
      orphanMappings: `
        SELECT COUNT(*)::int AS count
        FROM college_accreditation_map cam
        LEFT JOIN accreditations a
          ON a.institute_name = cam.accreditation_institute
        WHERE cam.verified = TRUE
          AND a.id IS NULL
      `,
      duplicatePeriods: `
        SELECT COUNT(*)::int AS count
        FROM (
          SELECT institute_name, accreditation_type,
                 COALESCE(program, '') AS program,
                 COALESCE(validity, '') AS validity,
                 COUNT(*) AS n
          FROM accreditations
          GROUP BY 1,2,3,4
          HAVING COUNT(*) > 1
        ) d
      `,
      nbaWithoutProgram: `
        SELECT COUNT(*)::int AS count
        FROM accreditations
        WHERE accreditation_type = 'NBA'
          AND (program IS NULL OR BTRIM(program) = '')
      `
    };

    const result = {};
    for (const [key, sql] of Object.entries(checks)) {
      result[key] = (await client.query(sql)).rows;
    }

    console.log(JSON.stringify({
      generated_at: new Date().toISOString(),
      official_sources: {
        uptac: "https://uptac.admissions.nic.in/institutes/",
        nba: "https://www.nbaind.org/accreditationprogram/AccreditedProgram",
        naac: "https://assessmentonline-basic.naac.gov.in/"
      },
      result
    }, null, 2));
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error("Accreditation audit failed:", err.message);
  process.exit(1);
});
