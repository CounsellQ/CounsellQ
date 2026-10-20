# CounsellQ API Specification & Contracts

**Base URL (Production):** `https://counsellq-backend.onrender.com/api`  
**Base URL (Local):** `http://localhost:5000/api`

---

## 1. Health Check

### `GET /health`
Returns system status, database connectivity, and enabled feature modules.

**Response (200 OK):**
```json
{
  "status": "OK",
  "message": "CounsellQ backend is running",
  "database": "PostgreSQL connected",
  "time": "2026-10-20T12:07:22.003Z",
  "features": [
    "historical_cutoffs",
    "ml_admission_feasibility",
    "verified_college_profiles",
    "nirf_rankings",
    "nba_naac_accreditation",
    "audited_fees_and_placements"
  ]
}
```

---

## 2. College Prediction Endpoint

### `POST /predict`
Evaluates a student's profile against historical cutoffs and runs Random Forest ML inference.

**Request Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "rank": 45000,
  "category": "OPEN",
  "program": "Computer Science",
  "quota": "Home State",
  "round": "Round 1",
  "gender": "Female"
}
```

**Fields:**
| Field | Type | Required | Description |
|---|---|---|---|
| `rank` | Integer | Yes | Positive integer JEE Main rank |
| `category` | String | Yes | `OPEN`, `BC`, `SC`, `ST`, `EWS` |
| `program` | String | No | Branch keyword (e.g. `Computer Science`, `Information Technology`) |
| `quota` | String | No | `Home State` (default) or `All India` |
| `round` | String | No | `Round 1`, `Round 2`, `Round 3` |
| `gender` | String | No | `Male` or `Female` (enables girl reservation quota seats) |

**Response (200 OK):**
```json
{
  "success": true,
  "count": 44,
  "student_rank": 45000,
  "evaluated_category": "OPEN",
  "eligible_categories_searched": ["OPEN", "OPEN(GIRL)"],
  "model_info": {
    "version": "v1.0.0-rf-ensemble",
    "algorithm": "Random Forest Classifier (Ensemble)",
    "evaluated_against_baseline": "Rule-Based Cutoff Baseline"
  },
  "disclaimer": "CounsellQ is an academic decision-support tool based on historical UPTAC counselling cutoffs...",
  "results": [
    {
      "institute": "BUNDELKHAND INSTITUTE OF ENGINEERING & TECHNOLOGY,JHANSI",
      "program": "Computer Science and Engineering",
      "quota": "Home State",
      "category": "OPEN",
      "round": "Round 1",
      "opening_rank": 39827,
      "closing_rank": 61083,
      "prediction": "Safer Chance",
      "ml_prediction": {
        "tier": "SAFE",
        "label": "Safer Historical Option",
        "feasibilityScore": 93,
        "probabilities": {
          "safe": 0.88,
          "moderate": 0.12,
          "ambitious": 0.0
        },
        "explanation": "Your rank 45,000 is comfortably within historical closing rank 61,083 (headroom +26%)...",
        "metrics": {
          "relRankDiff": 0.2633,
          "rankRatio": 0.7367,
          "normDistFromOpen": 0.2433,
          "spread": 21256
        },
        "modelVersion": "v1.0.0-rf-ensemble"
      },
      "admission_feasibility": "High",
      "feasibility_score": 93,
      "explanation": "Your rank 45,000 is comfortably within historical closing rank 61,083...",
      "college": {
        "id": "biet-jhansi",
        "display_name": "Bundelkhand Institute of Engineering & Technology (BIET), Jhansi",
        "code": "043",
        "type": "Government (Autonomous)",
        "ownership": "Government",
        "city": "Jhansi",
        "website": "https://bietjhs.ac.in/",
        "approval": "AICTE, Autonomous Institute of AKTU"
      },
      "fee": {
        "annual_total": 54300,
        "tuition": 40000,
        "academic_year": "2024-2025",
        "source_url": "https://bietjhs.ac.in/"
      },
      "placement": {
        "average_lpa": 5.35,
        "median_lpa": 5.0,
        "highest_lpa": 17.5,
        "placement_percentage": 81.0,
        "year": 2024,
        "source_url": "https://bietjhs.ac.in/"
      },
      "nirf": null,
      "accreditation": [
        {
          "type": "NBA",
          "status": "Accredited",
          "program": "Computer Science and Engineering",
          "validity": "30-06-2024",
          "derived_status": "EXPIRED"
        }
      ]
    }
  ]
}
```

---

## 3. College Directory Endpoint

### `GET /colleges`
Returns a paginated list of colleges with filtering and sorting.

**Query Parameters:**
- `search` (string): Search in name, code, or city
- `city` (string): Filter by city
- `type` (string): Filter by institution type
- `ownership` (string): `Government` or `Private`
- `maxFee` (number): Maximum annual fee
- `minAvgPkg` (number): Minimum average placement package in LPA
- `nirfOnly` (boolean): `true` to show only NIRF ranked colleges
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 50, max: 100)
- `sortBy` (string): `name`, `fee`, `placement`, `nirf`
- `sortOrder` (string): `ASC` or `DESC`

---

## 4. Single College Profile Endpoint

### `GET /colleges/:id`
Returns the complete profile of a college by its stable ID (e.g., `iet-lucknow`) or college code (`052`).

**Response includes:**
- Full institutional metadata (established year, campus area, website, approvals)
- Complete historical fee schedules (regular, self-finance, hostel)
- Audited placement records (average, median, peak packages, placement rate)
- Complete NIRF ranking history
- NBA / NAAC accreditations with validity dates
- Cutoff summaries for popular branches

---

## 5. Machine Learning Info Endpoint

### `GET /ml/info`
Returns model metadata, evaluation metrics across all 5 benchmarked algorithms, feature importances, and version details.
