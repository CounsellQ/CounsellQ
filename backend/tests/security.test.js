/**
 * CounsellQ — Security & Middleware Hardening Tests
 *
 * Covers:
 *   - Helmet security headers present on responses
 *   - Correlation tracking with X-Request-ID
 *   - Request body size limitation (10kb maximum returns 413)
 *   - Malformed JSON handling returns 400 JSON
 *   - Static frontend prototype served on GET /
 *   - Version metadata endpoint on GET /api/version
 *   - Rate limiting enforcement (returns 429 after threshold)
 */

"use strict";

jest.mock("../src/db");

const request = require("supertest");
const express = require("express");
const rateLimit = require("express-rate-limit");
const app = require("../src/server");
const db = require("../src/db");

beforeEach(() => {
    db.reset();
    db.query.mockClear();
});

// ── Helmet Security Headers ───────────────────────────────────────────────────

describe("Security Headers (Helmet)", () => {
    test("sets X-Content-Type-Options to nosniff", async () => {
        const res = await request(app).get("/api/version");
        expect(res.headers["x-content-type-options"]).toBe("nosniff");
    });

    test("sets X-Frame-Options to SAMEORIGIN", async () => {
        const res = await request(app).get("/api/version");
        expect(res.headers["x-frame-options"]).toBe("SAMEORIGIN");
    });

    test("sets Referrer-Policy to no-referrer", async () => {
        const res = await request(app).get("/api/version");
        expect(res.headers["referrer-policy"]).toBe("no-referrer");
    });

    test("sets X-DNS-Prefetch-Control to off", async () => {
        const res = await request(app).get("/api/version");
        expect(res.headers["x-dns-prefetch-control"]).toBe("off");
    });
});

// ── Correlation Tracking (X-Request-ID) ───────────────────────────────────────

describe("Request Correlation (X-Request-ID)", () => {
    test("attaches an X-Request-ID header when not provided by client", async () => {
        const res = await request(app).get("/api/version");
        expect(res.headers).toHaveProperty("x-request-id");
        expect(typeof res.headers["x-request-id"]).toBe("string");
        expect(res.headers["x-request-id"].length).toBeGreaterThan(0);
    });

    test("preserves client-provided X-Request-ID for distributed tracing", async () => {
        const clientId = "client-trace-abc-123";
        const res = await request(app)
            .get("/api/version")
            .set("X-Request-ID", clientId);

        expect(res.headers["x-request-id"]).toBe(clientId);
    });
});

// ── Payload Size Protection ───────────────────────────────────────────────────

describe("Payload Size Protection", () => {
    test("returns 413 when request body exceeds 10kb limit", async () => {
        // Generate payload larger than 10kb
        const largeString = "x".repeat(12 * 1024); // 12kb
        const res = await request(app)
            .post("/api/predict")
            .set("Content-Type", "application/json")
            .send(JSON.stringify({ rank: 50000, category: "OPEN", padding: largeString }));

        expect(res.statusCode).toBe(413);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toContain("Payload too large");
    });

    test("accepts request body within 10kb limit", async () => {
        db.setResponse({ rows: [] });

        const res = await request(app)
            .post("/api/predict")
            .send({ rank: 50000, category: "OPEN" });

        expect(res.statusCode).toBe(200);
    });
});

// ── Static Frontend Serving ───────────────────────────────────────────────────

describe("Static Frontend Serving", () => {
    test("GET / serves the frontend with text/html content type", async () => {
        const res = await request(app).get("/");

        expect(res.statusCode).toBe(200);
        expect(res.headers["content-type"]).toContain("text/html");
        expect(res.text).toContain("CounsellQ");
    });

    test("GET /api/version returns version metadata", async () => {
        const res = await request(app).get("/api/version");

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.version).toBe("1.0.0");
        expect(res.body.status).toBe("operational");
    });
});

// ── Rate Limiting ─────────────────────────────────────────────────────────────

describe("Rate Limiting Enforcement", () => {
    test("returns 429 Too Many Requests when rate limit threshold is exceeded", async () => {
        // Create an isolated mini Express app with strict rate limiter to verify behavior
        const testApp = express();
        const limiter = rateLimit({
            windowMs: 60 * 1000,
            max: 2,
            standardHeaders: true,
            legacyHeaders: false,
            message: {
                success: false,
                error: "Too many prediction requests from this IP, please try again after 15 minutes."
            }
        });

        testApp.use(express.json());
        testApp.post("/test-predict", limiter, (req, res) => {
            res.json({ success: true });
        });

        const res1 = await request(testApp).post("/test-predict").send({});
        expect(res1.statusCode).toBe(200);

        const res2 = await request(testApp).post("/test-predict").send({});
        expect(res2.statusCode).toBe(200);

        // Third request exceeds max: 2
        const res3 = await request(testApp).post("/test-predict").send({});
        expect(res3.statusCode).toBe(429);
        expect(res3.body.success).toBe(false);
        expect(res3.body.error).toContain("Too many prediction requests");
    });
});
