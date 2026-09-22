# CounsellQ

**Production-ready college prediction and counselling assistant using UPTAC historical cutoff data.**

CounsellQ helps students find colleges they can actually get into by comparing their admission rank against UPTAC 2025 B.Tech counselling cutoff records across 193 institutes, 102 programs, and 24 categories.

---

## Table of Contents

- [Phase 2 Key Enhancements](#phase-2-key-enhancements)
- [Prerequisites](#prerequisites)
- [Installation & Quick Start](#installation--quick-start)
- [Configuration](#configuration)
- [Database Setup & Seeding](#database-setup--seeding)
- [Running the Application](#running-the-application)
- [Frontend-Backend Integration](#frontend-backend-integration)
- [Security & Architecture](#security--architecture)
- [Running Tests](#running-tests)
- [API Reference](#api-reference)
- [Category Reference (UPTAC vs JEE Main)](#category-reference-uptac-vs-jee-main)
- [Project Structure](#project-structure)
- [Limitations & Honest Disclosures](#limitations--honest-disclosures)

---

## Phase 2 Key Enhancements

- **Frontend-Backend Integration:** The single-page application prototype (`councellQ_prototype.html`) is served directly by the Express backend at `GET /` and connects seamlessly to `POST /api/predict`.
- **Intelligent Category Mapping:** Built-in translation between standard JEE Main labels (`General`, `OBC-NCL`, `SC`, `ST`, `EWS`) and gender-specific variants to authoritative UPTAC codes (`OPEN`, `OPEN(GIRL)`, `BC`, `BC(Girl)`, etc.).
- **Interactive UI States:** Dynamic results rendering, real-time safe/moderate/ambitious counts, interactive tier filtering, loading spinners, network error banners with retry, and illustrated empty states.
- **Security Hardening:**
  - **Helmet:** Complete HTTP security headers (`nosniff`, `SAMEORIGIN`, `no-referrer`, etc.).
  - **Rate Limiting:** Protects the prediction engine against abuse (30 requests/15 minutes per IP).
  - **Payload Protection:** Strict 10 KB body size limit on JSON payloads.
  - **Connection Pooling:** PostgreSQL pool configured with max 10 clients, 30s idle timeout, and 5s connection acquisition timeout.
  - **Startup Validation:** Fails fast if required database credentials are missing.
- **Observability:** Morgan HTTP access logging and `X-Request-ID` correlation headers for distributed tracing.
- **Test Suite:** 98 automated tests across 6 test suites with 100% pass rate (including security and concurrency suites).
- **API Documentation:** Comprehensive API specification in `docs/API.md`.

---

## Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Node.js | v18+ | v22 confirmed working |
| npm | v9+ | |
| PostgreSQL | v13+ | Required for live database queries; not required for unit tests |

---

## Installation & Quick Start

```bash
# 1. Clone repository and navigate to backend
cd CounsellQ-main/backend

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
```

---

## Configuration

Edit `backend/.env`:

```env
# CounsellQ Backend Environment Configuration
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:5000
LOG_LEVEL=info
RATE_LIMIT_MAX=30

# PostgreSQL Database Credentials
DB_HOST=localhost
DB_PORT=5432
DB_NAME=counsellQ
DB_USER=postgres
DB_PASSWORD=your_postgres_password
```

> **Never commit `.env` to version control.** It is excluded via `.gitignore`.

---

## Database Setup & Seeding

### 1. Create the database

```bash
psql -U postgres -c "CREATE DATABASE \"counsellQ\";"
```

### 2. Apply the schema

```bash
psql -U postgres -d counsellQ -f schema.sql
```

This creates the `cutoffs` table and performance indexes (`idx_cutoffs_lookup`, `idx_cutoffs_closing_rank`, etc.). The script is idempotent using `CREATE TABLE IF NOT EXISTS`.

### 3. Seed the data

```bash
npm run seed
```

This imports all 8,058 UPTAC 2025 records from `data/counsellq_uptac_2025.csv`. The script uses `ON CONFLICT DO NOTHING` and is completely safe to re-run.

---

## Running the Application

### Start the Server

```bash
# Production
npm start

# Development (with nodemon auto-restart)
npm run dev
```

The server starts on port `5000`:

```
CounsellQ backend listening on port 5000
  Frontend: http://localhost:5000/
  Health:   http://localhost:5000/api/health
  Predict:  POST http://localhost:5000/api/predict
```

### Accessing the Web Application

Open your browser to:
[http://localhost:5000/](http://localhost:5000/)

1. Enter your rank (e.g. `45000`).
2. Select your category (e.g. `General`, `OBC-NCL`) and gender.
3. Select your branch preference (e.g. `All Branches` or `Computer Science and Engineering`).
4. Click **Generate My Predictions**.
5. View categorized **Safe**, **Moderate**, and **Ambitious** colleges, filter by tier, inspect cutoff trends, or add institutions to the comparison matrix.

---

## Frontend-Backend Integration

The frontend prototype (`councellQ_prototype.html`) is built with React 18, Tailwind CSS, and Lucide icons. In Phase 2, it was fully wired to the backend API:

1. **Relative API Base:** Uses `/api` when served from Express, ensuring zero cross-origin configuration friction.
2. **Category Normalization:** Automatically maps candidate exam labels (e.g. General Female) to UPTAC dataset codes (`OPEN(GIRL)`).
3. **Dynamic Response Lifecycle:**
   - **Loading:** Displays an animated spinner during database queries.
   - **Success:** Computes real-time Safe/Moderate/Ambitious counts and populates college cards.
   - **Error Banner:** Displays friendly messages with a "Retry" button on network or validation errors.
   - **Empty State:** Guides the user with suggestions if no cutoffs match within 2x of their rank.

---

## Security & Architecture

| Layer | Implementation | Description |
|---|---|---|
| **Headers** | `helmet` | Enforces `nosniff`, `SAMEORIGIN`, `no-referrer`, DNS prefetch disable. |
| **Rate Limiter** | `express-rate-limit` | Caps `/api/predict` to 30 requests/15 min per IP. |
| **Payload Guard** | `express.json({ limit: "10kb" })` | Blocks denial-of-service attempts via oversized payloads (returns 413). |
| **Tracing** | `X-Request-ID` | Assigns or preserves unique correlation IDs for request tracking. |
| **Access Logging** | `morgan` | Standard combined/dev request logs (silenced during test runs). |
| **Database Pool** | `pg.Pool` | 10 maximum clients, 30s idle timeout, 5s fast-fail connection timeout. |
| **Input Validation** | Custom middleware | Rejects non-integer ranks, out-of-range ranks, unknown categories, and overly long strings. |

---

## Running Tests

CounsellQ includes an automated test suite powered by **Jest + Supertest**. Tests run against a standalone database mock and do **not** require a running PostgreSQL instance.

```bash
# Run all test suites
npm test

# Verbose output with all test descriptions
npm run test:verbose

# Coverage report
npm run test:coverage
```

### Test Suite Summary (Phase 2)

```
Test Suites: 6 passed, 6 total
Tests:       98 passed, 98 total
Snapshots:   0 total
Time:        ~2.9 s
```

- `tests/health.test.js`: Health readiness, error suppression, 404 routing.
- `tests/predict.test.js`: Prediction classification, rank gaps, sorting, query echoing.
- `tests/validation.test.js`: Rank bounds (1 to 1.5M), category validation, input sanitization, program length limits.
- `tests/reference.test.js`: Dynamic categories, programs, and rounds endpoints.
- `tests/security.test.js`: Helmet headers, payload size limits (413), rate limiting (429), correlation IDs, static serving.
- `tests/concurrent.test.js`: High-concurrency parallel request isolation and state consistency.

---

## API Reference

Complete endpoint documentation with request/response schemas and cURL examples is available in [docs/API.md](docs/API.md).

### Quick Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Serves the interactive frontend prototype application |
| `GET` | `/api/health` | System health check and database connectivity |
| `GET` | `/api/version` | Version and runtime environment metadata |
| `POST` | `/api/predict` | Main prediction endpoint (rank, category, branch) |
| `GET` | `/api/categories` | Distinct categories with JEE Main mapping metadata |
| `GET` | `/api/programs` | Distinct academic engineering branches (`?search=` supported) |
| `GET` | `/api/rounds` | Distinct counselling rounds in dataset |

---

## Category Reference (UPTAC vs JEE Main)

UPTAC (AKTU) uses distinct category codes. The table below illustrates the translation used:

| Candidate Selection | Gender Option | UPTAC Code Sent to Backend |
|---|---|---|
| **General** | Gender-Neutral | `OPEN` |
| **General** | Female-Only | `OPEN(GIRL)` |
| **OBC-NCL** | Gender-Neutral | `BC` |
| **OBC-NCL** | Female-Only | `BC(Girl)` |
| **SC** | Gender-Neutral | `SC` |
| **SC** | Female-Only | `SC(Girl)` |
| **ST** | Gender-Neutral | `ST` |
| **ST** | Female-Only | `ST(Girl)` |
| **EWS** | Gender-Neutral | `EWS(OPEN)` |
| **EWS** | Female-Only | `EWS(GL)` |

---

## Project Structure

```
CounsellQ-main/
├── data/
│   ├── README.md                    Dataset documentation
│   └── counsellq_uptac_2025.csv     8,058 UPTAC 2025 cutoff records
├── docs/
│   ├── API.md                       Complete REST API documentation
│   └── DATA_CONTRACT.md             Cutoff record data contract
├── councellQ_prototype.html          Frontend React/Tailwind prototype (connected)
└── backend/
    ├── .env.example                  Environment configuration template
    ├── .gitignore                    Excludes node_modules and .env
    ├── package.json                  Dependencies and test scripts
    ├── schema.sql                    PostgreSQL table schema and indexes
    ├── scripts/
    │   └── seed.js                   CSV-to-PostgreSQL loader (idempotent)
    ├── src/
    │   ├── server.js                 Express app, middleware, routes, static server
    │   ├── db.js                     PostgreSQL pool with timeouts & env checks
    │   ├── __mocks__/
    │   │   └── db.js                 Jest database mock for isolated testing
    │   ├── routes/
    │   │   └── predictionRoutes.js   API route registrations
    │   └── controllers/
    │       ├── predictionController.js  Prediction algorithm & classification
    │       └── referenceController.js   Categories, programs, and rounds lookups
    └── tests/
        ├── health.test.js            Health and 404 tests
        ├── predict.test.js           Prediction logic tests
        ├── validation.test.js        Request validation tests
        ├── reference.test.js         Lookup endpoints tests
        ├── security.test.js          Security headers, body limits, rate limits
        └── concurrent.test.js        Parallel request execution tests
```

---

## Limitations & Honest Disclosures

1. **Dataset Scope:** The dataset currently covers UPTAC 2025 counselling (1 year). Multi-year predictive regression requires additional historical records.
2. **Quota Coverage:** The dataset consists solely of `"Home State"` quota seats. All-India quota data for central universities is not present in this dataset.
3. **Prediction Methodology:** CounsellQ uses verified cutoff matching (comparing student ranks against historical boundary closing ranks with tier categorization). It is a counselling advisory tool and **does not guarantee admission**.
4. **Database Requirement:** Running live database queries requires a local or hosted PostgreSQL instance with seeded data. Unit and integration tests run entirely in-memory using mocks.
