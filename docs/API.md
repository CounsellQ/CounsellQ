# CounsellQ REST API Specification

**Version:** 1.0.0  
**Base URL:** `http://localhost:5000` (or configured `PORT`)  
**Format:** JSON (`application/json; charset=utf-8`)  
**Security Headers:** Helmet enabled (nosniff, X-Frame-Options, no-referrer)  
**Tracing:** `X-Request-ID` correlation header returned on all responses

---

## Table of Contents

1. [Overview & Standards](#overview--standards)
2. [Error Handling Schema](#error-handling-schema)
3. [Endpoints](#endpoints)
   - [GET /](#get-)
   - [GET /api/health](#get-apihealth)
   - [GET /api/version](#get-apiversion)
   - [POST /api/predict](#post-apipredict)
   - [GET /api/categories](#get-apicategories)
   - [GET /api/programs](#get-apiprograms)
   - [GET /api/rounds](#get-apirounds)
4. [Category Mapping Guide (JEE Main ↔ UPTAC)](#category-mapping-guide)
5. [Rate Limiting](#rate-limiting)

---

## Overview & Standards

- **Protocols:** HTTP/1.1
- **Request Body Size Limit:** 10 KB maximum (enforced via Express body-parser)
- **CORS:** Configurable via `CORS_ORIGIN` (defaults to backend origin in production, permissive in local dev)
- **Tracing:** Every request receives a unique UUID in `X-Request-ID`. Clients may send their own `X-Request-ID` header to preserve distributed trace contexts.

---

## Error Handling Schema

All error responses adhere to a consistent JSON format:

```json
{
  "success": false,
  "error": "Human-readable description of the error",
  "field": "field_name" // Present only on validation errors
}
```

### Standard Status Codes

| Code | Meaning | Description |
|---|---|---|
| `200 OK` | Success | Request succeeded. |
| `400 Bad Request` | Client Validation Error | Missing or invalid request parameters or malformed JSON. |
| `404 Not Found` | Route Not Found | Requested endpoint path does not exist. |
| `413 Payload Too Large` | Body Exceeds Limit | Request body exceeds the 10 KB limit. |
| `429 Too Many Requests` | Rate Limit Exceeded | Exceeded maximum allowed requests per window (predict endpoint). |
| `500 Internal Server Error` | Server Failure | Unexpected runtime exception on the server. |
| `503 Service Unavailable` | Database Unreachable | Database is down, disconnected, or query timed out. |

---

## Endpoints

### GET /
Serves the CounsellQ interactive frontend prototype application (`councellQ_prototype.html`).

- **Method:** `GET`
- **Path:** `/`
- **Response:** `200 OK` with `Content-Type: text/html`

---

### GET /api/health
Readiness and connectivity check. Verifies that the Express server is up and tests PostgreSQL database reachability.

- **Method:** `GET`
- **Path:** `/api/health`

#### Success Response (200 OK)
```json
{
  "status": "ok",
  "message": "CounsellQ backend is running",
  "database": "connected",
  "server_time": "2026-09-22T12:00:00.000Z"
}
```

#### Degraded Response (503 Service Unavailable)
```json
{
  "status": "error",
  "message": "Database is not reachable",
  "database": "disconnected"
}
```

#### Example cURL
```bash
curl -X GET http://localhost:5000/api/health
```

---

### GET /api/version
Returns application release version and runtime environment metadata.

- **Method:** `GET`
- **Path:** `/api/version`

#### Response (200 OK)
```json
{
  "success": true,
  "version": "1.0.0",
  "environment": "development",
  "status": "operational"
}
```

---

### POST /api/predict
Core prediction engine endpoint. Queries historical UPTAC counselling cutoff data, evaluates student rank against historical closing ranks within a 2x rank window, and classifies each option into **Safe**, **Moderate**, or **Ambitious** admission tiers.

- **Method:** `POST`
- **Path:** `/api/predict`
- **Rate Limit:** 30 requests per 15 minutes per IP (configurable)
- **Body Limit:** 10 KB

#### Request Headers
```http
Content-Type: application/json
```

#### Request Body Parameters

| Field | Type | Required | Range / Allowed Values | Description |
|---|---|---|---|---|
| `rank` | Integer | **Yes** | `1` to `1,500,000` | Student's entrance exam / state counselling rank. |
| `category` | String | **Yes** | Valid UPTAC code (e.g. `"OPEN"`, `"BC"`, `"SC"`) | UPTAC category code. See [Category Mapping](#category-mapping-guide). |
| `program` | String | No | Max 200 characters | Partial branch name (case-insensitive substring search). |
| `quota` | String | No | `"Home State"` | Admission quota. Currently UPTAC dataset contains Home State. |
| `round` | String | No | `"Round 1"`, `"Round 2"`, `"Round 3"` | Specific counselling round filter. |

#### Classification Logic

- **Safe:** Historical closing rank is $\ge 120\%$ of student rank ($+20\%$ cushion).
- **Moderate:** Historical closing rank is between $100\%$ and $119\%$ of student rank (near cutoff boundary).
- **Ambitious:** Historical closing rank was lower than student rank (seat closed before student rank in previous year).

#### Example Request Body
```json
{
  "rank": 45000,
  "category": "OPEN",
  "program": "Computer Science",
  "round": "Round 1"
}
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "count": 2,
  "query": {
    "rank": 45000,
    "category": "OPEN",
    "program": "Computer Science",
    "round": "Round 1"
  },
  "results": [
    {
      "institute": "AJAY KUMAR GARG ENGINEERING COLLEGE, GHAZIABAD",
      "program": "Computer Science and Engineering",
      "quota": "Home State",
      "category": "OPEN",
      "round": "Round 1",
      "opening_rank": 32000,
      "closing_rank": 58000,
      "chance": "Safe",
      "rank_gap": 13000
    },
    {
      "institute": "KIET GROUP OF INSTITUTIONS, GHAZIABAD",
      "program": "Computer Science and Information Technology",
      "quota": "Home State",
      "category": "OPEN",
      "round": "Round 1",
      "opening_rank": 28000,
      "closing_rank": 46500,
      "chance": "Moderate",
      "rank_gap": 1500
    }
  ]
}
```

#### Empty Results Response (200 OK)
```json
{
  "success": true,
  "count": 0,
  "query": {
    "rank": 150,
    "category": "OPEN"
  },
  "message": "No historical records found for the given filters. Try broadening your search (remove program or round filters).",
  "results": []
}
```

#### Validation Error Responses (400 Bad Request)
```json
{
  "success": false,
  "field": "rank",
  "error": "'rank' must be at least 1"
}
```
```json
{
  "success": false,
  "field": "category",
  "error": "'category' value \"General\" is not recognised. Use GET /api/categories to see valid values."
}
```

#### Example cURL
```bash
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "rank": 50000,
    "category": "OPEN",
    "program": "Computer Science"
  }'
```

---

### GET /api/categories
Returns all distinct UPTAC category codes from the database, enriched with their base category, human-readable display label, and corresponding JEE Main equivalent.

- **Method:** `GET`
- **Path:** `/api/categories`

#### Response (200 OK)
```json
{
  "success": true,
  "count": 23,
  "note": "Use the 'code' value in POST /api/predict requests.",
  "categories": [
    {
      "code": "BC",
      "label": "Backward Class (OBC)",
      "base_category": "OBC",
      "jee_equivalent": "OBC-NCL"
    },
    {
      "code": "BC(Girl)",
      "label": "BC – Female Supernumerary",
      "base_category": "OBC",
      "jee_equivalent": "OBC-NCL"
    },
    {
      "code": "EWS(OPEN)",
      "label": "EWS – General",
      "base_category": "EWS",
      "jee_equivalent": "EWS"
    },
    {
      "code": "OPEN",
      "label": "Open (General)",
      "base_category": "General",
      "jee_equivalent": "General"
    },
    {
      "code": "OPEN(GIRL)",
      "label": "Open – Female Supernumerary",
      "base_category": "General",
      "jee_equivalent": "General"
    },
    {
      "code": "SC",
      "label": "Scheduled Caste",
      "base_category": "SC",
      "jee_equivalent": "SC"
    },
    {
      "code": "ST",
      "label": "Scheduled Tribe",
      "base_category": "ST",
      "jee_equivalent": "ST"
    }
  ]
}
```

#### Example cURL
```bash
curl -X GET http://localhost:5000/api/categories
```

---

### GET /api/programs
Returns distinct academic program / engineering branch names available in the historical dataset.

- **Method:** `GET`
- **Path:** `/api/programs`
- **Query Parameters:**
  - `search` (optional): Filter program names containing string (case-insensitive, max 200 chars).

#### Response (200 OK)
```json
{
  "success": true,
  "count": 4,
  "programs": [
    "Computer Science and Engineering",
    "Computer Science and Information Technology",
    "Electrical Engineering",
    "Mechanical Engineering"
  ]
}
```

#### Example cURL
```bash
curl -X GET "http://localhost:5000/api/programs?search=Computer"
```

---

### GET /api/rounds
Returns all distinct counselling rounds present in the dataset.

- **Method:** `GET`
- **Path:** `/api/rounds`

#### Response (200 OK)
```json
{
  "success": true,
  "count": 3,
  "rounds": [
    "Round 1",
    "Round 2",
    "Round 3"
  ]
}
```

---

## Category Mapping Guide

UPTAC (AKTU) uses distinct category codes from standard JEE Main labels. The table below outlines how frontends should map candidate choices to backend UPTAC codes:

| JEE Main Form Label | Candidate Type | Target UPTAC Code |
|---|---|---|
| **General** | Gender-Neutral / Open Merit | `OPEN` |
| **General (Female)** | Female Supernumerary | `OPEN(GIRL)` |
| **OBC-NCL** | Backward Class / Other Backward Class | `BC` |
| **OBC-NCL (Female)** | OBC Female Supernumerary | `BC(Girl)` |
| **SC** | Scheduled Caste | `SC` |
| **SC (Female)** | SC Female Supernumerary | `SC(Girl)` |
| **ST** | Scheduled Tribe | `ST` |
| **ST (Female)** | ST Female Supernumerary | `ST(Girl)` |
| **EWS** | Economically Weaker Section | `EWS(OPEN)` |
| **EWS (Female)** | EWS Female Supernumerary | `EWS(GL)` |
| *Tuition Fee Waiver* | UP Domicile Fee Waiver | `OPEN(TF)` |
| *Armed Forces Dependent* | Defense Personnel Dependent | `OPEN(AF)` / `BC(AF)` / `SC(AF)` |

---

## Rate Limiting

To prevent resource exhaustion, `POST /api/predict` is rate-limited:
- **Default:** 30 requests per 15-minute window per client IP.
- **Headers:** Returned on all requests:
  - `RateLimit-Limit`: Maximum requests allowed in the current window.
  - `RateLimit-Remaining`: Remaining requests in current window.
  - `RateLimit-Reset`: Seconds until window reset.
- **Exceeded Response:** `429 Too Many Requests`
