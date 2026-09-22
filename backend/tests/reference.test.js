/**
 * CounsellQ — Reference Endpoint Tests
 *
 * Covers GET /api/categories, GET /api/programs, GET /api/rounds.
 * All DB calls are mocked. Tests verify response shape, field presence,
 * and DB failure handling.
 */

"use strict";

jest.mock("../src/db");

const request = require("supertest");
const app = require("../src/server");
const db = require("../src/db");

beforeEach(() => {
    db.reset();
    db.query.mockClear();
});

// ── GET /api/categories ───────────────────────────────────────────────────────

describe("GET /api/categories", () => {
    test("returns 200 with correct shape", async () => {
        db.setResponse({
            rows: [{ category: "OPEN" }, { category: "BC" }, { category: "SC" }]
        });

        const res = await request(app).get("/api/categories");

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(typeof res.body.count).toBe("number");
        expect(Array.isArray(res.body.categories)).toBe(true);
        expect(res.body).toHaveProperty("note");
    });

    test("each category entry has code, label, base_category, jee_equivalent", async () => {
        db.setResponse({ rows: [{ category: "OPEN" }] });

        const res = await request(app).get("/api/categories");

        const cat = res.body.categories[0];
        expect(cat).toHaveProperty("code");
        expect(cat).toHaveProperty("label");
        expect(cat).toHaveProperty("base_category");
        expect(cat).toHaveProperty("jee_equivalent");
    });

    test("OPEN maps to base_category General and jee_equivalent General", async () => {
        db.setResponse({ rows: [{ category: "OPEN" }] });

        const res = await request(app).get("/api/categories");

        const open = res.body.categories.find((c) => c.code === "OPEN");
        expect(open.base_category).toBe("General");
        expect(open.jee_equivalent).toBe("General");
    });

    test("BC maps to base_category OBC and jee_equivalent OBC-NCL", async () => {
        db.setResponse({ rows: [{ category: "BC" }] });

        const res = await request(app).get("/api/categories");

        const bc = res.body.categories.find((c) => c.code === "BC");
        expect(bc.base_category).toBe("OBC");
        expect(bc.jee_equivalent).toBe("OBC-NCL");
    });

    test("OPEN(TF) has null jee_equivalent (UPTAC-only category)", async () => {
        db.setResponse({ rows: [{ category: "OPEN(TF)" }] });

        const res = await request(app).get("/api/categories");

        const tf = res.body.categories.find((c) => c.code === "OPEN(TF)");
        expect(tf.jee_equivalent).toBeNull();
    });

    test("count matches categories array length", async () => {
        db.setResponse({
            rows: [{ category: "SC" }, { category: "ST" }, { category: "EWS(OPEN)" }]
        });

        const res = await request(app).get("/api/categories");

        expect(res.body.count).toBe(res.body.categories.length);
        expect(res.body.count).toBe(3);
    });

    test("returns 503 when database fails", async () => {
        db.setError(new Error("connection lost"));

        const res = await request(app).get("/api/categories");

        expect(res.statusCode).toBe(503);
        expect(res.body.success).toBe(false);
    });
});

// ── GET /api/programs ─────────────────────────────────────────────────────────

describe("GET /api/programs", () => {
    test("returns 200 with programs array", async () => {
        db.setResponse({
            rows: [
                { program: "Computer Science and Engineering" },
                { program: "Information Technology" }
            ]
        });

        const res = await request(app).get("/api/programs");

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.programs)).toBe(true);
        expect(res.body.count).toBe(2);
    });

    test("programs is an array of strings", async () => {
        db.setResponse({ rows: [{ program: "Mechanical Engineering" }] });

        const res = await request(app).get("/api/programs");

        expect(typeof res.body.programs[0]).toBe("string");
    });

    test("returns 503 when database fails", async () => {
        db.setError(new Error("timeout"));

        const res = await request(app).get("/api/programs");

        expect(res.statusCode).toBe(503);
        expect(res.body.success).toBe(false);
    });
});

// ── GET /api/rounds ───────────────────────────────────────────────────────────

describe("GET /api/rounds", () => {
    test("returns 200 with rounds array", async () => {
        db.setResponse({
            rows: [{ round: "Round 1" }, { round: "Round 2" }, { round: "Round 3" }]
        });

        const res = await request(app).get("/api/rounds");

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.rounds)).toBe(true);
        expect(res.body.count).toBe(3);
    });

    test("rounds is an array of strings", async () => {
        db.setResponse({ rows: [{ round: "Round 1" }] });

        const res = await request(app).get("/api/rounds");

        expect(typeof res.body.rounds[0]).toBe("string");
    });

    test("returns 503 when database fails", async () => {
        db.setError(new Error("timeout"));

        const res = await request(app).get("/api/rounds");

        expect(res.statusCode).toBe(503);
        expect(res.body.success).toBe(false);
    });
});
