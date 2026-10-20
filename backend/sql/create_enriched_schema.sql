-- CounsellQ Enriched Schema Migration
-- Creates normalized tables for Colleges, Fees, Placements, and Verification Audit.

BEGIN;

-- 1. College master table with stable identifiers and official metadata
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

-- 2. College fee schedules (academic year, program, category, verified source)
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

-- 3. College placement outcomes (average, median, highest, placement percentage, source)
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

-- 4. Accreditation research queue table
CREATE TABLE IF NOT EXISTS accreditation_research_queue (
    uptac_institute TEXT PRIMARY KEY,
    research_status VARCHAR(50) NOT NULL,
    notes TEXT,
    last_checked DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE INDEX IF NOT EXISTS idx_accred_queue_status ON accreditation_research_queue(research_status);

-- 5. Data verification and quality audit log
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

COMMIT;
