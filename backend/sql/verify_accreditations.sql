-- CounsellQ accreditation verification queries
-- Run after importing accreditation data.

-- 1) UPTAC institute universe
SELECT COUNT(DISTINCT institute) AS uptac_institute_count
FROM cutoffs;

-- 2) Accreditation record count by type
SELECT accreditation_type, COUNT(*) AS records
FROM accreditations
GROUP BY accreditation_type
ORDER BY accreditation_type;

-- 3) Verified mappings
SELECT COUNT(*) AS verified_mappings
FROM college_accreditation_map
WHERE verified = TRUE;

-- 4) Mappings that point to a missing accreditation institute
SELECT cam.*
FROM college_accreditation_map cam
LEFT JOIN accreditations a
    ON a.institute_name = cam.accreditation_institute
WHERE cam.verified = TRUE
  AND a.id IS NULL;

-- 5) NBA records that have no program (should normally be reviewed manually)
SELECT *
FROM accreditations
WHERE accreditation_type = 'NBA'
  AND (program IS NULL OR BTRIM(program) = '');

-- 6) Duplicate accreditation periods
SELECT
    institute_name,
    accreditation_type,
    COALESCE(program, '') AS program,
    COALESCE(validity, '') AS validity,
    COUNT(*) AS duplicate_count
FROM accreditations
GROUP BY institute_name, accreditation_type, COALESCE(program, ''), COALESCE(validity, '')
HAVING COUNT(*) > 1;

-- 7) Current dated records
SELECT
    institute_name,
    accreditation_type,
    program,
    accreditation_status,
    valid_from,
    valid_until,
    CASE
        WHEN valid_until IS NULL THEN 'DATE_NOT_AVAILABLE'
        WHEN valid_until >= CURRENT_DATE THEN 'CURRENTLY_VALID'
        ELSE 'EXPIRED'
    END AS derived_status
FROM accreditations
ORDER BY institute_name, accreditation_type, program, valid_until DESC;
