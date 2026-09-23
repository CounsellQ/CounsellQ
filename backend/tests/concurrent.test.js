/**
 * CounsellQ — Concurrency & Parallel Request Tests
 *
 * Covers:
 *   - Multiple simultaneous /api/predict requests execute without cross-talk
 *   - Concurrent requests with differing ranks and categories receive their own responses
 *   - Interleaved valid and invalid requests do not corrupt adjacent request processing
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

describe("Concurrent Request Handling", () => {
    test("handles 10 simultaneous /api/predict requests concurrently", async () => {
        db.query.mockImplementation(async (sql, values) => {
            const studentRankParam = values[values.length - 1]; // studentRank * 2
            const category = values[0];
            return {
                rows: [
                    {
                        institute: `Institute for ${category}`,
                        program: "Computer Science and Engineering",
                        quota: "Home State",
                        category: category,
                        round: "Round 1",
                        opening_rank: 1000,
                        closing_rank: Math.round(studentRankParam * 0.8)
                    }
                ]
            };
        });

        const ranks = [10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000];
        const categories = ["OPEN", "BC", "SC", "ST", "EWS(OPEN)", "OPEN", "BC", "SC", "ST", "OPEN(GIRL)"];

        const promises = ranks.map((rank, index) => {
            return request(app)
                .post("/api/predict")
                .send({ rank, category: categories[index] });
        });

        const responses = await Promise.all(promises);

        expect(responses).toHaveLength(10);

        responses.forEach((res, index) => {
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.query.rank).toBe(ranks[index]);
            expect(res.body.query.category).toBe(categories[index]);
            expect(res.body.results).toHaveLength(1);
            expect(res.body.results[0].category).toBe(categories[index]);
        });
    });

    test("interleaved valid and invalid requests do not contaminate each other", async () => {
        db.query.mockImplementation(async () => {
            return {
                rows: [
                    {
                        institute: "AKGEC Ghaziabad",
                        program: "Computer Science and Engineering",
                        quota: "Home State",
                        category: "OPEN",
                        round: "Round 1",
                        opening_rank: 20000,
                        closing_rank: 48000
                    }
                ]
            };
        });

        const requests = [
            request(app).post("/api/predict").send({ rank: 45000, category: "OPEN" }), // Valid
            request(app).post("/api/predict").send({ rank: -50, category: "OPEN" }),   // Invalid rank
            request(app).post("/api/predict").send({ rank: 50000, category: "INVALID_CAT" }), // Invalid category
            request(app).post("/api/predict").send({ rank: 60000, category: "BC" }),   // Valid
            request(app).post("/api/predict").send({}),                                 // Malformed empty
        ];

        const [r1, r2, r3, r4, r5] = await Promise.all(requests);

        expect(r1.statusCode).toBe(200);
        expect(r1.body.success).toBe(true);

        expect(r2.statusCode).toBe(400);
        expect(r2.body.field).toBe("rank");

        expect(r3.statusCode).toBe(400);
        expect(r3.body.field).toBe("category");

        expect(r4.statusCode).toBe(200);
        expect(r4.body.success).toBe(true);

        expect(r5.statusCode).toBe(400);
        expect(r5.body.success).toBe(false);
    });
});
