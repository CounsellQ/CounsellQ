-- CounsellQ Database Schema
-- PostgreSQL 13+
--
-- Run this file to initialize the database before seeding data.
-- Command: psql -U postgres -d counsellQ -f schema.sql
--
-- This script is safe to run on a fresh database. It does NOT
-- drop or overwrite existing data. The CREATE TABLE uses
-- IF NOT EXISTS to preserve any records already present.

-- Cutoff records table
-- Each row represents one institute/program/category/round combination
-- from the UPTAC 2025 B.Tech counselling data.
CREATE TABLE IF NOT EXISTS cutoffs (
    id            SERIAL PRIMARY KEY,
    year          INTEGER      NOT NULL,
    institute     TEXT         NOT NULL,
    program       TEXT         NOT NULL,
    quota         TEXT         NOT NULL,
    category      TEXT         NOT NULL,
    round         TEXT         NOT NULL,
    opening_rank  INTEGER      NOT NULL,
    closing_rank  INTEGER      NOT NULL,

    -- Prevent exact duplicate records from being inserted twice
    CONSTRAINT cutoffs_unique_record UNIQUE (
        year, institute, program, quota, category, round
    )
);

-- Index on category + closing_rank — the primary query pattern in predictColleges
CREATE INDEX IF NOT EXISTS idx_cutoffs_category_closing
    ON cutoffs (category, closing_rank);

-- Index on institute for lookup queries
CREATE INDEX IF NOT EXISTS idx_cutoffs_institute
    ON cutoffs (institute);

-- Index on program for ILIKE search
CREATE INDEX IF NOT EXISTS idx_cutoffs_program
    ON cutoffs (program);
