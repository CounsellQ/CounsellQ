"use strict";

const express = require("express");
const router = express.Router();

const { predictColleges } = require("../controllers/predictionController");
const { getCategories, getPrograms, getRounds } = require("../controllers/referenceController");

// ── Prediction ────────────────────────────────────────────────────────────────
router.post("/predict", predictColleges);

// ── Reference / Lookup ────────────────────────────────────────────────────────
// These endpoints allow the frontend to dynamically populate dropdowns
// with the actual values present in the database.

router.get("/categories", getCategories);
router.get("/programs", getPrograms);
router.get("/rounds", getRounds);

module.exports = router;