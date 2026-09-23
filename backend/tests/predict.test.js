/**
 * CounsellQ — Prediction Logic & Output Tests
 *
 * Covers:
 *   - Successful prediction with correct response shape
 *   - Safe / Moderate / Ambitious classification correctness
 *   - rank_gap values
 *   - Sort order (Safe → Moderate → Ambitious, then by closing_rank)
 *   - Empty results when no historical data matches
 *   - All optional filters applied
 *   - DB failure returns 503
 *   - Response never exposes raw DB error
 *   - query echo in response
 */

"use strict";

jest.mock("../src/db");

const request = require("supertest");
const app = require("../src/server");
const db = require("../src/db");

const ENDPOINT = "/api/predict";

beforeEach(() => {
    db.reset();
    db.query.mockClear();
});

// ── Helper to build a fake cutoff DB row ──────────────────────────────────────

function makeCutoffRow(overrides = {}) {
    return {
        institute:    "Test Institute",
        program:      "Computer Science and Engineering",
        quota:        "Home State",
        category:     "OPEN",
        round:        "Round 1",
        opening_rank: 10000,
        closing_rank: 50000,
        ...overrides
    };
}

// ── Response shape ────────────────────────────────────────────────────────────

describe("POST /api/predict — response shape", () => {
    test("returns correct top-level structure on success", async () => {
        db.setResponse({
            rows: [makeCutoffRow({ closing_rank: 60000 })]
        });

        const res = await request(app)
            .post(ENDPOINT)
            .send({ rank: 50000, category: "OPEN" });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(typeof res.body.count).toBe("number");
        expect(Array.isArray(res.body.results)).toBe(true);
        expect(res.body).toHaveProperty("query");
    });

    test("each result contains required fields", async () => {
        db.setResponse({
            rows: [makeCutoffRow({ closing_rank: 60000 })]
        });

        const res = await request(app)
            .post(ENDPOINT)
            .send({ rank: 50000, category: "OPEN" });

        const result = res.body.results[0];
        expect(result).toHaveProperty("institute");
        expect(result).toHaveProperty("program");
        expect(result).toHaveProperty("quota");
        expect(result).toHaveProperty("category");
        expect(result).toHaveProperty("round");
        expect(result).toHaveProperty("opening_rank");
        expect(result).toHaveProperty("closing_rank");
        expect(result).toHaveProperty("chance");
        expect(result).toHaveProperty("rank_gap");
    });

    test("count matches results array length", async () => {
        db.setResponse({
            rows: [
                makeCutoffRow({ closing_rank: 40000 }),
                makeCutoffRow({ institute: "College B", closing_rank: 60000 }),
                makeCutoffRow({ institute: "College C", closing_rank: 80000 })
            ]
        });

        const res = await request(app)
            .post(ENDPOINT)
            .send({ rank: 50000, category: "OPEN" });

        expect(res.body.count).toBe(res.body.results.length);
        expect(res.body.count).toBe(3);
    });

    test("query echo includes rank and category", async () => {
        db.setResponse({ rows: [] });

        const res = await request(app)
            .post(ENDPOINT)
            .send({ rank: 25000, category: "BC" });

        expect(res.body.query.rank).toBe(25000);
        expect(res.body.query.category).toBe("BC");
    });

    test("query echo includes optional fields when provided", async () => {
        db.setResponse({ rows: [] });

        const res = await request(app)
            .post(ENDPOINT)
            .send({ rank: 25000, category: "OPEN", program: "CSE", round: "Round 1" });

        expect(res.body.query.program).toBe("CSE");
        expect(res.body.query.round).toBe("Round 1");
    });
});

// ── Classification correctness ────────────────────────────────────────────────

describe("POST /api/predict — chance classification", () => {
    const studentRank = 50000;

    test("classifies as Safe when closing_rank >= 120% of student rank", async () => {
        // 50000 * 1.20 = 60000 — exactly at boundary
        db.setResponse({ rows: [makeCutoffRow({ closing_rank: 60000 })] });

        const res = await request(app)
            .post(ENDPOINT)
            .send({ rank: studentRank, category: "OPEN" });

        expect(res.body.results[0].chance).toBe("Safe");
    });

    test("classifies as Safe well above the 20% buffer", async () => {
        db.setResponse({ rows: [makeCutoffRow({ closing_rank: 90000 })] });

        const res = await request(app)
            .post(ENDPOINT)
            .send({ rank: studentRank, category: "OPEN" });

        expect(res.body.results[0].chance).toBe("Safe");
    });

    test("classifies as Moderate when closing_rank is between rank and 120% of rank", async () => {
        // 50001 is above rank but below 60000 threshold
        db.setResponse({ rows: [makeCutoffRow({ closing_rank: 52000 })] });

        const res = await request(app)
            .post(ENDPOINT)
            .send({ rank: studentRank, category: "OPEN" });

        expect(res.body.results[0].chance).toBe("Moderate");
    });

    test("classifies as Moderate when closing_rank equals student rank exactly", async () => {
        db.setResponse({ rows: [makeCutoffRow({ closing_rank: 50000 })] });

        const res = await request(app)
            .post(ENDPOINT)
            .send({ rank: studentRank, category: "OPEN" });

        expect(res.body.results[0].chance).toBe("Moderate");
    });

    test("classifies as Ambitious when closing_rank is below student rank", async () => {
        db.setResponse({ rows: [makeCutoffRow({ closing_rank: 40000 })] });

        const res = await request(app)
            .post(ENDPOINT)
            .send({ rank: studentRank, category: "OPEN" });

        expect(res.body.results[0].chance).toBe("Ambitious");
    });

    test("rank_gap is positive when closing_rank > student rank", async () => {
        db.setResponse({ rows: [makeCutoffRow({ closing_rank: 60000 })] });

        const res = await request(app)
            .post(ENDPOINT)
            .send({ rank: studentRank, category: "OPEN" });

        expect(res.body.results[0].rank_gap).toBe(10000); // 60000 - 50000
    });

    test("rank_gap is negative when closing_rank < student rank", async () => {
        db.setResponse({ rows: [makeCutoffRow({ closing_rank: 40000 })] });

        const res = await request(app)
            .post(ENDPOINT)
            .send({ rank: studentRank, category: "OPEN" });

        expect(res.body.results[0].rank_gap).toBe(-10000); // 40000 - 50000
    });
});

// ── Sort order ────────────────────────────────────────────────────────────────

describe("POST /api/predict — result sort order", () => {
    test("results are ordered Safe → Moderate → Ambitious", async () => {
        const studentRank = 50000;

        db.setResponse({
            rows: [
                makeCutoffRow({ institute: "Ambitious College", closing_rank: 40000 }),
                makeCutoffRow({ institute: "Safe College",      closing_rank: 80000 }),
                makeCutoffRow({ institute: "Moderate College",  closing_rank: 52000 })
            ]
        });

        const res = await request(app)
            .post(ENDPOINT)
            .send({ rank: studentRank, category: "OPEN" });

        const chances = res.body.results.map((r) => r.chance);
        expect(chances[0]).toBe("Safe");
        expect(chances[1]).toBe("Moderate");
        expect(chances[2]).toBe("Ambitious");
    });

    test("within same chance tier, results are sorted by closing_rank ascending", async () => {
        db.setResponse({
            rows: [
                makeCutoffRow({ institute: "B", closing_rank: 90000 }),
                makeCutoffRow({ institute: "A", closing_rank: 70000 }),
                makeCutoffRow({ institute: "C", closing_rank: 80000 })
            ]
        });

        const res = await request(app)
            .post(ENDPOINT)
            .send({ rank: 50000, category: "OPEN" });

        const ranks = res.body.results.map((r) => r.closing_rank);
        expect(ranks).toEqual([70000, 80000, 90000]);
    });
});

// ── Empty results ─────────────────────────────────────────────────────────────

describe("POST /api/predict — empty results", () => {
    test("returns 200 with empty results array when no data matches", async () => {
        db.setResponse({ rows: [] });

        const res = await request(app)
            .post(ENDPOINT)
            .send({ rank: 50000, category: "OPEN" });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.count).toBe(0);
        expect(res.body.results).toEqual([]);
        expect(res.body).toHaveProperty("message");
    });
});

// ── Database failures ─────────────────────────────────────────────────────────

describe("POST /api/predict — database failures", () => {
    test("returns 503 when database throws during query", async () => {
        db.setError(new Error("relation 'cutoffs' does not exist"));

        const res = await request(app)
            .post(ENDPOINT)
            .send({ rank: 50000, category: "OPEN" });

        expect(res.statusCode).toBe(503);
        expect(res.body.success).toBe(false);
        expect(res.body).toHaveProperty("error");
    });

    test("does not expose raw database error message in response", async () => {
        db.setError(new Error("relation 'cutoffs' does not exist"));

        const res = await request(app)
            .post(ENDPOINT)
            .send({ rank: 50000, category: "OPEN" });

        const body = JSON.stringify(res.body);
        expect(body).not.toContain("relation");
        expect(body).not.toContain("does not exist");
    });
});
