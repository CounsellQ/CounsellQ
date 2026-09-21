const express = require("express");
const router = express.Router();

const {
    predictColleges
} = require("../controllers/predictionController");

router.post("/predict", predictColleges);

module.exports = router;