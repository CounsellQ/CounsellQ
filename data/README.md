# CounsellQ Dataset

This directory contains the historical counselling data used by CounsellQ for college and branch prediction.

## UPTAC 2025 B.Tech Cutoff Dataset

The current dataset contains opening and closing rank information from UPTAC 2025 B.Tech counselling.

### Dataset Overview

| Attribute | Details |
|---|---|
| Counselling Year | 2025 |
| Institutes | 193 |
| Programs | 102 |
| Categories | 24 |
| Counselling Rounds | 3 |
| Quota | Home State |
| Records | 8,058 |

### Data Fields

| Field | Description |
|---|---|
| `Year` | Counselling year |
| `Institute` | Name of the participating institute |
| `Program` | B.Tech branch or program |
| `Quota` | Admission quota |
| `Category` | Candidate category |
| `Round` | Counselling round |
| `Opening Rank` | Rank at which admissions opened |
| `Closing Rank` | Rank at which admissions closed |

### Purpose

The dataset provides the historical cutoff information required by CounsellQ to:

- compare a student's rank with previous admission trends
- identify suitable institutes and programs
- classify possible admission outcomes
- support counselling recommendations
- provide historical context for prediction

### Data Source

The dataset is based on UPTAC 2025 counselling cutoff information.

The official UPTAC admission portal is treated as the reference source for validating counselling-related information.

### Data Usage

The dataset is used for academic and project-development purposes as part of the CounsellQ mini project.

Additional counselling years and relevant admission data may be incorporated as the project develops.