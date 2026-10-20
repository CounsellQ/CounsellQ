/**
 * CounsellQ Backend Automated Test Suite
 * Tests Health, Predict API, College Directory, College Profile, ML Info, and Data Integrity.
 */

const { test, describe, before, after } = require("node:test");
const assert = require("node:assert");
const http = require("http");
const app = require("../src/server");
const pool = require("../src/db");
const runDataValidation = require("../scripts/validate_data");

describe("CounsellQ API & Data Test Suite", () => {
    let server;
    let baseUrl;
    const PORT = 5123;

    before(async () => {
        await new Promise((resolve) => {
            server = http.createServer(app).listen(PORT, () => {
                baseUrl = `http://localhost:${PORT}`;
                resolve();
            });
        });
    });

    after(async () => {
        await new Promise((resolve) => server.close(resolve));
        await pool.end();
    });

    describe("1. Health Endpoint", () => {
        test("GET /api/health should return status OK and connected PostgreSQL database", async () => {
            const res = await fetch(`${baseUrl}/api/health`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(data.status, "OK");
            assert.strictEqual(data.database, "PostgreSQL connected");
            assert.ok(Array.isArray(data.features));
            assert.ok(data.features.includes("ml_admission_feasibility"));
        });
    });

    describe("2. Predict API Validation & Logic", () => {
        test("POST /api/predict should fail with 400 when rank is missing", async () => {
            const res = await fetch(`${baseUrl}/api/predict`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ category: "OPEN" })
            });
            assert.strictEqual(res.status, 400);
            const data = await res.json();
            assert.strictEqual(data.success, false);
            assert.ok(data.error.includes("required"));
        });

        test("POST /api/predict should fail with 400 when rank is non-positive", async () => {
            const res = await fetch(`${baseUrl}/api/predict`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rank: -500, category: "OPEN" })
            });
            assert.strictEqual(res.status, 400);
            const data = await res.json();
            assert.strictEqual(data.success, false);
            assert.ok(data.error.includes("positive integer"));
        });

        test("POST /api/predict should return enriched results with ML feasibility and college profiles", async () => {
            const res = await fetch(`${baseUrl}/api/predict`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    rank: 45000,
                    category: "OPEN",
                    program: "Computer Science",
                    quota: "Home State",
                    round: "Round 1"
                })
            });
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(data.success, true);
            assert.ok(data.count > 0);
            assert.ok(Array.isArray(data.results));

            const first = data.results[0];
            assert.ok(first.institute);
            assert.ok(first.program);
            assert.ok(first.closing_rank);
            assert.ok(first.prediction); // Backwards compatibility: Safer Chance / Moderate Chance / Lower Chance

            // Enriched ML metadata
            assert.ok(first.ml_prediction);
            assert.ok(["SAFE", "MODERATE", "AMBITIOUS"].includes(first.ml_prediction.tier));
            assert.ok(typeof first.feasibility_score === "number");
            assert.ok(typeof first.explanation === "string");
            assert.ok(first.ml_prediction.probabilities);

            // College profile attached
            assert.ok(first.college);
            assert.ok(first.college.display_name);

            // Model info attached to payload
            assert.ok(data.model_info);
            assert.strictEqual(data.model_info.version, "v1.0.0-rf-ensemble");
        });

        test("POST /api/predict should include girl reservation seats for female candidates", async () => {
            const res = await fetch(`${baseUrl}/api/predict`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    rank: 45000,
                    category: "OPEN",
                    program: "Computer Science",
                    gender: "Female",
                    round: "Round 1"
                })
            });
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.ok(data.eligible_categories_searched.includes("OPEN(GIRL)"));
        });
    });

    describe("3. College Directory & Profile Endpoints", () => {
        test("GET /api/colleges should return list of colleges with pagination", async () => {
            const res = await fetch(`${baseUrl}/api/colleges?page=1&limit=10`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(data.success, true);
            assert.ok(data.total >= 190);
            assert.strictEqual(data.colleges.length, 10);
            assert.ok(data.colleges[0].name);
            assert.ok(data.colleges[0].city);
        });

        test("GET /api/colleges?search=Lucknow should filter colleges in Lucknow", async () => {
            const res = await fetch(`${baseUrl}/api/colleges?search=Lucknow`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(data.success, true);
            assert.ok(data.colleges.length > 0);
            data.colleges.forEach(col => {
                const text = (col.name + " " + col.city + " " + col.uptac_name).toLowerCase();
                assert.ok(text.includes("lucknow"));
            });
        });

        test("GET /api/colleges/iet-lucknow should return full verified college profile", async () => {
            const res = await fetch(`${baseUrl}/api/colleges/iet-lucknow`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(data.success, true);
            const col = data.college;
            assert.strictEqual(col.id, "iet-lucknow");
            assert.strictEqual(col.code, "052");
            assert.strictEqual(col.ownership, "Government");
            assert.ok(col.fees.length >= 2);
            assert.ok(col.fees[0].total_annual_fee > 0);
            assert.ok(col.placements.length >= 1);
            assert.ok(col.placements[0].highest_lpa >= 50);
            assert.ok(col.nirf.length >= 1);
            assert.ok(col.accreditations.length >= 1);
        });

        test("GET /api/colleges/non-existent-college should return 400 not found", async () => {
            const res = await fetch(`${baseUrl}/api/colleges/non-existent-xyz`);
            assert.strictEqual(res.status, 400);
            const data = await res.json();
            assert.strictEqual(data.success, false);
            assert.ok(data.error.includes("not found"));
        });
    });

    describe("4. ML Model Metadata Endpoint", () => {
        test("GET /api/ml/info should return benchmark report and metadata", async () => {
            const res = await fetch(`${baseUrl}/api/ml/info`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(data.success, true);
            assert.strictEqual(data.model_metadata.selected_model, "Random Forest Classifier");
            assert.ok(data.benchmark_report);
            assert.ok(data.benchmark_report.models["Random Forest"]);
            assert.ok(data.benchmark_report.models["Rule-Based Baseline"]);
        });
    });

    describe("5. Automated Data Quality & Verification Audit", () => {
        test("runDataValidation should pass all 6 database consistency checks", async () => {
            const report = await runDataValidation();
            assert.strictEqual(report.status, "ALL_CHECKS_PASSED");
            assert.strictEqual(report.violations.length, 0);
            report.checks.forEach(check => {
                assert.strictEqual(check.passed, true, `Check failed: ${check.name}`);
            });
        });
    });
});
