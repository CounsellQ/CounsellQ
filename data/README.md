# CounsellQ Dataset

This directory contains the official counselling data used by CounsellQ for college and branch prediction.

## UPTAC 2025 B.Tech Cutoff Dataset

The current dataset contains official opening and closing rank records from UPTAC 2025 B.Tech counselling.

### Dataset Overview

| Attribute | Details |
|---|---|
| Counselling Year | 2025 (Official Publication) |
| Institutes | 193 |
| Programs | 102 |
| Categories | 24 |
| Counselling Rounds | 3 Regular Rounds (Round 1, Round 2, Round 3) |
| Quota | Home State |
| Records | 8,058 |

### Data Fields

| Field | Description | Type |
|---|---|---|
| `Year` | Counselling year (2025) | Integer |
| `Institute` | Name of the participating institute | Text |
| `Program` | B.Tech branch or program | Text |
| `Quota` | Admission quota | Text |
| `Category` | Candidate category | Text |
| `Round` | Counselling round (Round 1, Round 2, Round 3) | Text |
| `Opening Rank` | Rank at which admissions opened | Integer |
| `Closing Rank` | Rank at which admissions closed | Integer |

### Purpose

The dataset provides official cutoff information required by CounsellQ to:

- compare a student's rank with previous admission trends
- identify suitable institutes and programs
- classify possible admission outcomes (Safe, Moderate, Ambitious)
- support counselling recommendations
- provide historical context for prediction

### Data Source

The dataset is based on official UPTAC 2025 counselling cutoff publications. The official UPTAC admission portal (`uptac.admissions.nic.in`) is treated as the reference source for validating counselling-related information.
