/**
 * CounsellQ Database Bootstrap & Auto-Migration
 * Ensures that colleges, fees, placements, NIRF, and audit tables exist and are populated
 * on any environment the server runs on (Local, Render Production, Staging).
 */

const { runPopulation } = require("./populateHelper");

async function initDatabase(pool) {
    try {
        console.log("Checking CounsellQ database initialization status...");

        // 1. Create tables if not present
        await pool.query(`
            CREATE TABLE IF NOT EXISTS colleges (
                id VARCHAR(50) PRIMARY KEY,
                uptac_name TEXT UNIQUE NOT NULL,
                display_name TEXT NOT NULL,
                college_code VARCHAR(20),
                institution_type VARCHAR(100) NOT NULL,
                ownership VARCHAR(50) NOT NULL,
                city VARCHAR(100) NOT NULL,
                district VARCHAR(100),
                state VARCHAR(50) NOT NULL DEFAULT 'Uttar Pradesh',
                established_year INTEGER,
                campus_area VARCHAR(100),
                website TEXT,
                approval TEXT DEFAULT 'AICTE, Affiliated to Dr. A.P.J. Abdul Kalam Technical University (AKTU)',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_colleges_uptac_name ON colleges(uptac_name);
            CREATE INDEX IF NOT EXISTS idx_colleges_city ON colleges(city);
            CREATE INDEX IF NOT EXISTS idx_colleges_type ON colleges(institution_type);
            CREATE INDEX IF NOT EXISTS idx_colleges_ownership ON colleges(ownership);

            CREATE TABLE IF NOT EXISTS college_fees (
                id SERIAL PRIMARY KEY,
                college_id VARCHAR(50) NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
                program VARCHAR(150) NOT NULL DEFAULT 'B.Tech (All Branches)',
                fee_type VARCHAR(50) NOT NULL DEFAULT 'Regular',
                tuition_fee_annual NUMERIC(10, 2),
                other_fees_annual NUMERIC(10, 2),
                total_annual_fee NUMERIC(10, 2) NOT NULL,
                total_program_fee NUMERIC(10, 2),
                hostel_fee_annual NUMERIC(10, 2),
                academic_year VARCHAR(20) NOT NULL DEFAULT '2024-2025',
                currency VARCHAR(10) NOT NULL DEFAULT 'INR',
                source_name TEXT NOT NULL,
                source_url TEXT NOT NULL,
                verified_at DATE NOT NULL DEFAULT CURRENT_DATE,
                verification_status VARCHAR(50) NOT NULL DEFAULT 'OFFICIAL_VERIFIED',
                notes TEXT,
                CONSTRAINT chk_positive_annual_fee CHECK (total_annual_fee >= 0),
                CONSTRAINT uq_college_fee_schedule UNIQUE (college_id, program, fee_type, academic_year)
            );

            CREATE INDEX IF NOT EXISTS idx_college_fees_college_id ON college_fees(college_id);
            CREATE INDEX IF NOT EXISTS idx_college_fees_annual_fee ON college_fees(total_annual_fee);

            CREATE TABLE IF NOT EXISTS college_placements (
                id SERIAL PRIMARY KEY,
                college_id VARCHAR(50) NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
                placement_year INTEGER NOT NULL,
                program VARCHAR(150) NOT NULL DEFAULT 'B.Tech (Overall)',
                average_package_lpa NUMERIC(6, 2),
                median_package_lpa NUMERIC(6, 2),
                highest_package_lpa NUMERIC(6, 2),
                placement_percentage NUMERIC(5, 2),
                students_placed INTEGER,
                total_eligible INTEGER,
                top_recruiters TEXT,
                source_name TEXT NOT NULL,
                source_url TEXT NOT NULL,
                verified_at DATE NOT NULL DEFAULT CURRENT_DATE,
                verification_status VARCHAR(50) NOT NULL DEFAULT 'OFFICIAL_VERIFIED',
                notes TEXT,
                CONSTRAINT chk_placement_percentage CHECK (placement_percentage IS NULL OR (placement_percentage >= 0 AND placement_percentage <= 100)),
                CONSTRAINT chk_positive_packages CHECK (
                    (average_package_lpa IS NULL OR average_package_lpa >= 0) AND
                    (median_package_lpa IS NULL OR median_package_lpa >= 0) AND
                    (highest_package_lpa IS NULL OR highest_package_lpa >= 0)
                ),
                CONSTRAINT uq_college_placement UNIQUE (college_id, placement_year, program)
            );

            CREATE INDEX IF NOT EXISTS idx_college_placements_college_id ON college_placements(college_id);
            CREATE INDEX IF NOT EXISTS idx_college_placements_avg_pkg ON college_placements(average_package_lpa);

            CREATE TABLE IF NOT EXISTS college_nirf_map (
                uptac_institute TEXT PRIMARY KEY,
                nirf_institute TEXT NOT NULL,
                match_method VARCHAR(50) DEFAULT 'manual_verified',
                verified BOOLEAN DEFAULT TRUE
            );

            CREATE TABLE IF NOT EXISTS nirf_rankings (
                id SERIAL PRIMARY KEY,
                nirf_year INTEGER NOT NULL,
                ranking_category VARCHAR(100) NOT NULL,
                institute_name TEXT NOT NULL,
                city VARCHAR(100),
                state VARCHAR(100),
                rank INTEGER,
                rank_band VARCHAR(50),
                score NUMERIC(6, 2),
                source TEXT DEFAULT 'NIRF',
                CONSTRAINT uq_nirf_entry UNIQUE (nirf_year, ranking_category, institute_name)
            );

            CREATE TABLE IF NOT EXISTS accreditation_research_queue (
                uptac_institute TEXT PRIMARY KEY,
                research_status VARCHAR(50) NOT NULL,
                notes TEXT,
                last_checked DATE NOT NULL DEFAULT CURRENT_DATE
            );

            CREATE TABLE IF NOT EXISTS data_verification_audit (
                id SERIAL PRIMARY KEY,
                dataset_name VARCHAR(100) NOT NULL,
                total_records INTEGER NOT NULL,
                verified_records INTEGER NOT NULL,
                unverified_records INTEGER NOT NULL DEFAULT 0,
                missing_fields_records INTEGER NOT NULL DEFAULT 0,
                conflicts_detected INTEGER NOT NULL DEFAULT 0,
                audit_date DATE NOT NULL DEFAULT CURRENT_DATE,
                auditor TEXT NOT NULL DEFAULT 'Automated Audit Runner',
                notes TEXT
            );

            ALTER TABLE IF EXISTS accreditations
                ADD COLUMN IF NOT EXISTS valid_from DATE,
                ADD COLUMN IF NOT EXISTS valid_until DATE,
                ADD COLUMN IF NOT EXISTS source_url TEXT,
                ADD COLUMN IF NOT EXISTS last_verified DATE;
        `);

        // 2. Check if colleges table has data
        const countRes = await pool.query("SELECT COUNT(*) AS count FROM colleges");
        const collegeCount = parseInt(countRes.rows[0].count, 10);

        if (collegeCount === 0) {
            console.log("Colleges table is empty. Running initial population...");
            await runPopulation(pool);
            console.log("Initial population completed successfully.");
        } else {
            console.log(`Database schema verified. Colleges table has ${collegeCount} entries.`);
        }
    } catch (err) {
        console.error("Database bootstrap encountered an error:", err.message);
    }
}

module.exports = { initDatabase };
