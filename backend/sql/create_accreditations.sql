CREATE TABLE IF NOT EXISTS accreditations (
    id SERIAL PRIMARY KEY,

    institute_name TEXT NOT NULL,

    accreditation_type VARCHAR(20) NOT NULL,

    accreditation_status VARCHAR(50),

    grade VARCHAR(20),

    program TEXT,

    validity TEXT,

    updated_year INTEGER,

    source TEXT NOT NULL DEFAULT 'Official',

    CONSTRAINT accreditation_type_check
        CHECK (
            accreditation_type IN ('NAAC', 'NBA')
        )
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_accreditation_record
ON accreditations (
    institute_name,
    accreditation_type,
    COALESCE(program, '')
);