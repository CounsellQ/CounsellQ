# CounsellQ Data Quality & Verification Audit Report

**Date of Audit:** October 20, 2026  
**Auditor:** Automated Data Quality Validator (`backend/scripts/validate_data.js`)  
**Status:** `ALL_CHECKS_PASSED`

---

## 1. Verified Record Counts

| Dataset Entity | Total Records | Verified Official Records | Unverified / Missing | Conflicts Detected |
|---|---|---|---|---|
| **Colleges Universe** | 194 | 15 (Full Audited Profiles) | 179 (Basic UPTAC registered) | 0 |
| **Historical Cutoffs (2025)** | 8,058 | 8,058 | 0 | 0 |
| **Fee Schedules** | 18 | 18 | 0 | 0 |
| **Placement Records** | 15 | 15 | 0 | 0 |
| **NIRF Engineering (2024-25)** | 25 | 25 | 0 | 0 |
| **Accreditations (NBA/NAAC)** | 99 | 99 | 0 | 0 |
| **Accreditation Research Queue** | 150 | 35 (NBA Verified) | 115 (No verified record found) | 0 |

---

## 2. Source Hierarchy & Official Provenance

All collected data strictly adheres to the authoritative source hierarchy:

1. **NIRF Rankings:** Official Ministry of Education / NIRF India portal ([nirfindia.org](https://www.nirfindia.org/)).
2. **Accreditations:** Official National Board of Accreditation (NBA) Accredited Programs Portal ([nbaind.org](https://www.nbaind.org/)) and NAAC portal ([naac.gov.in](https://assessmentonline-basic.naac.gov.in/)).
3. **Tuition & Academic Fees:** Published official fee circulars and university notices on verified college domains:
   - IET Lucknow: [`ietlucknow.ac.in`](https://www.ietlucknow.ac.in/)
   - BIET Jhansi: [`bietjhs.ac.in`](https://bietjhs.ac.in/)
   - KNIT Sultanpur: [`knit.ac.in`](https://knit.ac.in/)
   - JSSATE Noida: [`jssaten.ac.in`](https://jssaten.ac.in/)
   - AKGEC Ghaziabad: [`akgec.ac.in`](https://www.akgec.ac.in/)
   - KIET Ghaziabad: [`kiet.edu`](https://www.kiet.edu/)
   - GCET Greater Noida: [`galgotiacollege.edu`](https://galgotiacollege.edu/)
   - GL Bajaj: [`glbitm.org`](https://www.glbitm.org/)
   - NIET Greater Noida: [`niet.co.in`](https://www.niet.co.in/)
   - ABES Ghaziabad: [`abes.ac.in`](https://www.abes.ac.in/)
   - REC Ambedkar Nagar: [`recabn.ac.in`](https://recabn.ac.in/)
   - REC Banda: [`recbanda.ac.in`](https://recbanda.ac.in/)
   - DEI Agra: [`dei.ac.in`](https://www.dei.ac.in/)
   - University of Lucknow: [`lkouniv.ac.in`](https://www.lkouniv.ac.in/)
4. **Placement Outcomes:** Official audited placement reports and NIRF submitted T&P data.
5. **Counselling Cutoffs:** Official UPTAC 2025 opening and closing rank archives.

---

## 3. Automated Consistency Validation Results

```json
{
  "timestamp": "2026-10-20T12:07:22.003Z",
  "status": "ALL_CHECKS_PASSED",
  "checks": [
    {
      "name": "Cutoffs Rank Bounds & Order",
      "total_records": 8058,
      "passed": true,
      "details": { "non_positive_ranks": 0, "inverted_ranks": 0 }
    },
    {
      "name": "Fee Non-Negativity & Component Bounds",
      "total_records": 18,
      "passed": true,
      "details": { "negative_fees": 0, "tuition_exceeds_total": 0, "non_inr_currency": 0 }
    },
    {
      "name": "Placement Bounds & Package Logic (Avg <= Highest, % in [0, 100])",
      "total_records": 15,
      "passed": true,
      "details": { "invalid_percentages": 0, "avg_exceeds_highest": 0, "placed_exceeds_eligible": 0 }
    },
    {
      "name": "NIRF Rank or Band Exclusivity & Score Bounds",
      "total_records": 25,
      "passed": true,
      "details": { "missing_rank_and_band": 0, "both_rank_and_band": 0, "invalid_scores": 0 }
    },
    {
      "name": "Referential Integrity of Verified Mappings",
      "passed": true,
      "details": { "orphan_nirf_mappings": 0, "orphan_accreditation_mappings": 0 }
    },
    {
      "name": "Duplicate Records Detection",
      "passed": true,
      "details": { "duplicate_cutoffs": 0, "duplicate_fees": 0 }
    }
  ]
}
```
