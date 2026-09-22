/**
 * CounsellQ — Health Endpoint Tests
 *
 * Covers:
 *   - GET /api/health returns 200 with expected shape when DB is available
 *   - GET /api/health returns 503 when DB throws
 *   - 404 for unknown routes
 */

"use strict";

// Mock the database module before requiring the app.
// Jest hoists jest.mock() calls so this always runs first.
jest.mock("../src/db");

const request = require("supertest");
const app = require("../src/server");
const db = require("../src/db");

beforeEach(() => {
    db.reset();
    // Clear the mock call history between tests
    db.query.mockClear();
});

// ── GET /api/health ───────────────────────────────────────────────────────────

describe("GET /api/health", () => {
    test("returns 200 with status ok when database is connected", async () => {
        db.setResponse({ rows: [{ server_time: new Date().toISOString() }] });

        const res = await request(app).get("/api/health");

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("ok");
        expect(res.body.database).toBe("connected");
        expect(res.body).toHaveProperty("server_time");
        expect(res.body).toHaveProperty("message");
    });

    test("returns 503 with status error when database is unreachable", async () => {
        db.setError(new Error("ECONNREFUSED"));

        const res = await request(app).get("/api/health");

        expect(res.statusCode).toBe(503);
        expect(res.body.status).toBe("error");
        expect(res.body.database).toBe("disconnected");
        expect(res.body).toHaveProperty("message");
    });

    test("response never exposes internal error details or stack traces", async () => {
        db.setError(new Error("password authentication failed for user 'postgres'"));

        const res = await request(app).get("/api/health");

        expect(res.statusCode).toBe(503);
        // Must NOT expose raw DB error message in the response body
        expect(JSON.stringify(res.body)).not.toContain("password");
        expect(JSON.stringify(res.body)).not.toContain("postgres");
    });
});

// ── 404 handler ───────────────────────────────────────────────────────────────

describe("404 handler", () => {
    test("returns 404 for unknown GET routes", async () => {
        const res = await request(app).get("/api/nonexistent");

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body).toHaveProperty("error");
    });

    test("returns 404 for unknown POST routes", async () => {
        const res = await request(app).post("/api/unknown").send({ foo: "bar" });

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
    });
});
