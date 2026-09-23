-- CounsellQ accreditation schema upgrade
-- Keeps historical accreditation periods instead of overwriting them.
-- Run after backing up the database.

ALTER TABLE accreditations
    ADD COLUMN IF NOT EXISTS valid_from DATE,
    ADD COLUMN IF NOT EXISTS valid_until DATE,
    ADD COLUMN IF NOT EXISTS source_url TEXT,
    ADD COLUMN IF NOT EXISTS last_verified DATE;

-- The previous index allowed only one record per institute/type/program,
-- which incorrectly collapses historical NBA periods.
DROP INDEX IF EXISTS uq_accreditation_record;

CREATE UNIQUE INDEX IF NOT EXISTS uq_accreditation_record_v2
ON accreditations (
    institute_name,
    accreditation_type,
    COALESCE(program, ''),
    COALESCE(validity, '')
);

CREATE INDEX IF NOT EXISTS idx_accreditations_institute
ON accreditations (institute_name);

CREATE INDEX IF NOT EXISTS idx_accreditations_type_program
ON accreditations (accreditation_type, program);

CREATE INDEX IF NOT EXISTS idx_accreditations_valid_until
ON accreditations (valid_until);

-- Backfill the three existing records where the published validity date
-- is explicitly known.
UPDATE accreditations
SET
    valid_until = TO_DATE('20-12-2028', 'DD-MM-YYYY'),
    last_verified = CURRENT_DATE
WHERE institute_name = 'G.L. Bajaj Institute of Technology and Management'
  AND accreditation_type = 'NAAC'
  AND validity = '20-12-2028';

UPDATE accreditations
SET
    valid_until = TO_DATE('30-06-2026', 'DD-MM-YYYY'),
    last_verified = CURRENT_DATE
WHERE institute_name = 'G.L. Bajaj Institute of Technology and Management'
  AND accreditation_type = 'NBA'
  AND program = 'Computer Science and Engineering'
  AND validity = '30-06-2026';

UPDATE accreditations
SET
    last_verified = CURRENT_DATE
WHERE institute_name = 'Noida Institute of Engineering & Technology'
  AND accreditation_type = 'NAAC'
  AND grade = 'A';

-- Do not invent a validity date for NIET; the source record currently
-- stored in CounsellQ does not contain one.
