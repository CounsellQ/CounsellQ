CREATE TABLE IF NOT EXISTS nirf_rankings (
    id SERIAL PRIMARY KEY,
    nirf_year INTEGER NOT NULL,
    ranking_category VARCHAR(100) NOT NULL,
    institute_name TEXT NOT NULL,
    city TEXT,
    state TEXT,
    rank INTEGER,
    rank_band VARCHAR(20),
    score NUMERIC(6,2),
    source TEXT NOT NULL DEFAULT 'NIRF',
    CONSTRAINT nirf_rank_or_band_check
        CHECK (
            (rank IS NOT NULL AND rank_band IS NULL)
            OR
            (rank IS NULL AND rank_band IS NOT NULL)
            OR
            (rank IS NULL AND rank_band IS NULL)
        )
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_nirf_institute_year_category
ON nirf_rankings (nirf_year, ranking_category, institute_name);