# CounsellQ Data Contract

## Overview

This document defines the structure of the admission cutoff data used by the CounsellQ application.

The purpose of the data contract is to provide a consistent interface between the data, database, backend, and prediction components of the system.

## Cutoff Record

Each record represents the opening and closing rank information for a particular combination of institute, program, category, quota, counselling round, and year.

### Schema

| Field | Type | Description |
|---|---|---|
| `Year` | INTEGER | Counselling year |
| `Institute` | TEXT | Institute or college name |
| `Program` | TEXT | B.Tech branch or program |
| `Quota` | TEXT | Admission quota |
| `Category` | TEXT | Candidate category |
| `Round` | TEXT | Counselling round |
| `Opening Rank` | INTEGER | Opening admission rank |
| `Closing Rank` | INTEGER | Closing admission rank |

## Example Record

```text
Year: 2025
Institute: Example Institute
Program: Computer Science and Engineering
Quota: Home State
Category: OPEN
Round: Round 1
Opening Rank: 12500
Closing Rank: 28400