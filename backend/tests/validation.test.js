/**
 * CounsellQ — Prediction Request Validation Tests
 *
 * Covers every branch of the input validation logic in predictionController.js
 * without requiring a database. All invalid inputs must be rejected with 400
 * before any DB query is issued.
 *
 * Cases covered:
 *   rank — missing, string, float, negative, zero, above max, at boundaries
 *   category — missing, empty string, unrecognised value
 *   program — empty string when provided
 *   quota — unrecognised value
 *   round — unrecognised value
 *   malformed JSON body
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

// ── Rank validation ───────────────────────────────────────────────────────────

describe("POST /api/predict — rank validation", () => {
    test("returns 400 when rank is missing", async () => {
        const res = await request(app)
            .post(ENDPOINT)
            .send({ category: "OPEN" });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.field).toBe("rank");
    });

    test("returns 400 when rank is null", async () => {
        const res = await request(app)
            .post(ENDPOINT)
            .send({ rank: null, category: "OPEN" });

        expect(res.statusCode).toBe(400);
        expect(res.body.field).toBe("rank");
    });

    test("returns 400 when rank is an empty string", async () => {
        const res = await request(app)
            .post(ENDPOINT)
            .send({ rank: "", category: "OPEN" });

        expect(res.statusCode).toBe(400);
        expect(res.body.field).toBe("rank");
    });

    test("returns 400 when rank is a non-numeric string", async () => {
        const res = await request(app)
            .post(ENDPOINT)
            .send({ rank: "abc", category: "OPEN" });

        expect(res.statusCode).toBe(400);
        expect(res.body.field).toBe("rank");
    });

    test("returns 400 when rank is a float", async () => {
        const res = await request(app)
            .post(ENDPOINT)
            .send({ rank: 25000.5, category: "OPEN" });

        expect(res.statusCode).toBe(400);
        expect(res.body.field).toBe("rank");
    });

    test("returns 400 when rank is zero", async () => {
        const res = await request(app)
            .post(ENDPOINT)
            .send({ rank: 0, category: "OPEN" });

        expect(res.statusCode).toBe(400);
        expect(res.body.field).toBe("rank");
    });

    test("returns 400 when rank is negative", async () => {
        const res = await request(app)
            .post(ENDPOINT)
            .send({ rank: -500, category: "OPEN" });

        expect(res.statusCode).toBe(400);
        expect(res.body.field).toBe("rank");
    });

    test("returns 400 when rank exceeds 1,500,000", async () => {
        const res = await request(app)
            .post(ENDPOINT)
            .send({ rank: 1_500_001, category: "OPEN" });

        expect(res.statusCode).toBe(400);
        expect(res.body.field).toBe("rank");
    });

    test("accepts rank = 1 (minimum valid rank)", async () => {
        db.setResponse({ rows: [] });

        const res = await request(app)
            .post(ENDPOINT)
            .send({ rank: 1, category: "OPEN" });

        // 200 with empty results — not a 400
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });

    test("accepts rank = 1,500,000 (maximum valid rank)", async () => {
        db.setResponse({ rows: [] });

        const res = await request(app)
            .post(ENDPOINT)
            .send({ rank: 1_500_000, category: "OPEN" });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });
});

// ── Category validation ───────────────────────────────────────────────────────

describe("POST /api/predict — category validation", () => {
    test("returns 400 when category is missing", async () => {
        const res = await request(app)
            .post(ENDPOINT)
            .send({ rank: 50000 });

        expect(res.statusCode).toBe(400);
        expect(res.body.field).toBe("category");
    });

    test("returns 400 when category is empty string", async () => {
        const res = await request(app)
            .post(ENDPOINT)
            .send({ rank: 50000, category: "" });

        expect(res.statusCode).toBe(400);
        expect(res.body.field).toBe("category");
    });

    test("returns 400 when category is a JEE Main label not in UPTAC dataset", async () => {
        const res = await request(app)
            .post(ENDPOINT)
            .send({ rank: 50000, category: "General" });

        expect(res.statusCode).toBe(400);
        expect(res.body.field).toBe("category");
        // Error should tell the user how to find valid values
        expect(res.body.error).toContain("/api/categories");
    });

    test("returns 400 for unrecognised category OBC-NCL", async () => {
        const res = await request(app)
            .post(ENDPOINT)
            .send({ rank: 50000, category: "OBC-NCL" });

        expect(res.statusCode).toBe(400);
        expect(res.body.field).toBe("category");
    });

    test("returns 400 for completely arbitrary category value", async () => {
        const res = await request(app)
            .post(ENDPOINT)
            .send({ rank: 50000, category: "INVALID_CAT" });

        expect(res.statusCode).toBe(400);
        expect(res.body.field).toBe("category");
    });

    // Valid categories from the dataset
    const validCategories = [
        "OPEN", "OPEN(GIRL)", "OPEN(TF)", "OPEN(AF)", "OPEN(PH)", "OPEN(FF)",
        "BC", "BC(Girl)", "BC(AF)", "BC(PH)", "BC(FF)",
        "SC", "SC(Girl)", "SC(AF)", "SC(PH)", "SC(FF)",
        "ST", "ST(Girl)", "ST(AF)",
        "EWS(OPEN)", "EWS(GL)", "EWS(AF)", "EWS(PH)", "EWS(FF)"
    ];

    test.each(validCategories)(
        "accepts valid UPTAC category: %s",
        async (category) => {
            db.setResponse({ rows: [] });

            const res = await request(app)
                .post(ENDPOINT)
                .send({ rank: 50000, category });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        }
    );
});

// ── Optional field validation ─────────────────────────────────────────────────

describe("POST /api/predict — optional field validation", () => {
    test("returns 400 when program is empty string", async () => {
        const res = await request(app)
            .post(ENDPOINT)
            .send({ rank: 50000, category: "OPEN", program: "" });

        expect(res.statusCode).toBe(400);
        expect(res.body.field).toBe("program");
    });

    test("returns 400 when program exceeds 200 characters", async () => {
        const longProgram = "A".repeat(201);
        const res = await request(app)
            .post(ENDPOINT)
            .send({ rank: 50000, category: "OPEN", program: longProgram });

        expect(res.statusCode).toBe(400);
        expect(res.body.field).toBe("program");
        expect(res.body.error).toContain("200 characters");
    });

    test("returns 400 when quota is an unrecognised value", async () => {
        const res = await request(app)
            .post(ENDPOINT)
            .send({ rank: 50000, category: "OPEN", quota: "Other State" });

        expect(res.statusCode).toBe(400);
        expect(res.body.field).toBe("quota");
    });

    test("returns 400 when round is unrecognised", async () => {
        const res = await request(app)
            .post(ENDPOINT)
            .send({ rank: 50000, category: "OPEN", round: "Round 4" });

        expect(res.statusCode).toBe(400);
        expect(res.body.field).toBe("round");
    });

    test("accepts valid quota: Home State", async () => {
        db.setResponse({ rows: [] });

        const res = await request(app)
            .post(ENDPOINT)
            .send({ rank: 50000, category: "OPEN", quota: "Home State" });

        expect(res.statusCode).toBe(200);
    });

    test("accepts valid round: Round 1", async () => {
        db.setResponse({ rows: [] });

        const res = await request(app)
            .post(ENDPOINT)
            .send({ rank: 50000, category: "OPEN", round: "Round 1" });

        expect(res.statusCode).toBe(200);
    });

    test("accepts valid round: Round 2", async () => {
        db.setResponse({ rows: [] });

        const res = await request(app)
            .post(ENDPOINT)
            .send({ rank: 50000, category: "OPEN", round: "Round 2" });

        expect(res.statusCode).toBe(200);
    });

    test("accepts valid round: Round 3", async () => {
        db.setResponse({ rows: [] });

        const res = await request(app)
            .post(ENDPOINT)
            .send({ rank: 50000, category: "OPEN", round: "Round 3" });

        expect(res.statusCode).toBe(200);
    });
});

// ── Malformed body ────────────────────────────────────────────────────────────

describe("POST /api/predict — malformed request body", () => {
    test("returns 400 when body is not valid JSON", async () => {
        const res = await request(app)
            .post(ENDPOINT)
            .set("Content-Type", "application/json")
            .send("{ rank: 50000, category: OPEN }"); // invalid JSON

        // Express 5 returns 400 for malformed JSON
        expect(res.statusCode).toBe(400);
    });

    test("returns 400 when body is empty", async () => {
        const res = await request(app)
            .post(ENDPOINT)
            .set("Content-Type", "application/json")
            .send({});

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });

    test("does not query the database when validation fails", async () => {
        await request(app)
            .post(ENDPOINT)
            .send({ rank: -1, category: "OPEN" });

        expect(db.query).not.toHaveBeenCalled();
    });
});
