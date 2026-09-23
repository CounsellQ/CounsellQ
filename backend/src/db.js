"use strict";

const { Pool } = require("pg");

// ── Environment validation ────────────────────────────────────────────────────
// Validate required variables at startup so misconfiguration fails fast
// rather than silently producing zero results or connection errors at query time.
//
// Skip validation during testing — tests use a mock pool anyway.

if (process.env.NODE_ENV !== "test") {
    const REQUIRED_ENV = ["DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD"];
    const missing = REQUIRED_ENV.filter((k) => !process.env[k]);

    if (missing.length > 0) {
        console.error(
            "[db] FATAL: Missing required environment variables:",
            missing.join(", "),
            "\nCopy .env.example to .env and fill in your PostgreSQL credentials."
        );
        process.exit(1);
    }
}

// ── Connection Pool ───────────────────────────────────────────────────────────
//
// Pool settings:
//   max                    — maximum simultaneous connections to PostgreSQL.
//                            10 is appropriate for a single-server mini-project.
//   idleTimeoutMillis      — close connections that have been idle for 30s.
//   connectionTimeoutMillis — fail fast if a connection cannot be acquired
//                            within 5 seconds (surfaces DB-down errors quickly).
//
// The pool is created once at module load and reused across all requests.
// This is safe under Node.js's single-threaded event loop.

const pool = new Pool({
    host:     process.env.DB_HOST     || "localhost",
    port:     parseInt(process.env.DB_PORT, 10) || 5432,
    database: process.env.DB_NAME,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,

    max:                    10,
    idleTimeoutMillis:      30_000,
    connectionTimeoutMillis: 5_000
});

// Log connection errors from idle clients so they don't go unnoticed.
pool.on("error", (err) => {
    console.error("[db] Unexpected pool client error:", err.message);
});

module.exports = pool;