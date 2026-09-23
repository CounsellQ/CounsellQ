CREATE TABLE IF NOT EXISTS college_accreditation_map (
    id SERIAL PRIMARY KEY,

    uptac_institute TEXT NOT NULL UNIQUE,

    accreditation_institute TEXT NOT NULL,

    match_method VARCHAR(50) NOT NULL DEFAULT 'manual_verified',

    verified BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_college_accreditation_map_uptac
ON college_accreditation_map (uptac_institute);