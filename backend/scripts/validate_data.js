/**
 * CounsellQ - Automated Data Quality & Consistency Validation Script
 * Verifies consistency rules across Cutoffs, NIRF, Accreditations, Fees, and Placements.
 */

const pool = require("../src/db");

async function runDataValidation() {
  const client = await pool.connect();
  const report = {
    timestamp: new Date().toISOString(),
    status: "PASS",
    summary: {},
    checks: [],
    violations: []
  };

  try {
    console.log("Running CounsellQ data validation checks...");

    // Check 1: Cutoffs Opening and Closing Rank Consistency
    const cutoffsCheck = await client.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(CASE WHEN opening_rank <= 0 OR closing_rank <= 0 THEN 1 END) AS non_positive_ranks,
        COUNT(CASE WHEN opening_rank > closing_rank THEN 1 END) AS inverted_ranks
      FROM cutoffs;
    `);
    const cc = cutoffsCheck.rows[0];
    report.checks.push({
      name: "Cutoffs Rank Bounds & Order",
      total_records: Number(cc.total),
      passed: cc.non_positive_ranks === "0" && cc.inverted_ranks === "0",
      details: { non_positive_ranks: Number(cc.non_positive_ranks), inverted_ranks: Number(cc.inverted_ranks) }
    });

    // Check 2: College Fee Bounds & Non-negativity
    const feeCheck = await client.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(CASE WHEN total_annual_fee < 0 THEN 1 END) AS negative_fees,
        COUNT(CASE WHEN tuition_fee_annual > total_annual_fee THEN 1 END) AS tuition_exceeds_total,
        COUNT(CASE WHEN currency <> 'INR' THEN 1 END) AS non_inr_currency
      FROM college_fees;
    `);
    const fc = feeCheck.rows[0];
    report.checks.push({
      name: "Fee Non-Negativity & Component Bounds",
      total_records: Number(fc.total),
      passed: fc.negative_fees === "0" && fc.tuition_exceeds_total === "0" && fc.non_inr_currency === "0",
      details: {
        negative_fees: Number(fc.negative_fees),
        tuition_exceeds_total: Number(fc.tuition_exceeds_total),
        non_inr_currency: Number(fc.non_inr_currency)
      }
    });

    // Check 3: Placement Bounds & Logical Sanity
    const placementCheck = await client.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(CASE WHEN placement_percentage < 0 OR placement_percentage > 100 THEN 1 END) AS invalid_percentages,
        COUNT(CASE WHEN average_package_lpa > highest_package_lpa THEN 1 END) AS avg_exceeds_highest,
        COUNT(CASE WHEN students_placed > total_eligible THEN 1 END) AS placed_exceeds_eligible
      FROM college_placements;
    `);
    const pc = placementCheck.rows[0];
    report.checks.push({
      name: "Placement Bounds & Package Logic (Avg <= Highest, % in [0, 100])",
      total_records: Number(pc.total),
      passed: pc.invalid_percentages === "0" && pc.avg_exceeds_highest === "0" && pc.placed_exceeds_eligible === "0",
      details: {
        invalid_percentages: Number(pc.invalid_percentages),
        avg_exceeds_highest: Number(pc.avg_exceeds_highest),
        placed_exceeds_eligible: Number(pc.placed_exceeds_eligible)
      }
    });

    // Check 4: NIRF Consistency (rank or band populated, scores valid)
    const nirfCheck = await client.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(CASE WHEN rank IS NULL AND rank_band IS NULL THEN 1 END) AS missing_rank_and_band,
        COUNT(CASE WHEN rank IS NOT NULL AND rank_band IS NOT NULL THEN 1 END) AS both_rank_and_band,
        COUNT(CASE WHEN score < 0 OR score > 100 THEN 1 END) AS invalid_scores
      FROM nirf_rankings;
    `);
    const nc = nirfCheck.rows[0];
    report.checks.push({
      name: "NIRF Rank or Band Exclusivity & Score Bounds",
      total_records: Number(nc.total),
      passed: nc.missing_rank_and_band === "0" && nc.both_rank_and_band === "0" && nc.invalid_scores === "0",
      details: {
        missing_rank_and_band: Number(nc.missing_rank_and_band),
        both_rank_and_band: Number(nc.both_rank_and_band),
        invalid_scores: Number(nc.invalid_scores)
      }
    });

    // Check 5: Referential Integrity of Mappings (Zero Orphan Mappings)
    const orphanNIRF = await client.query(`
      SELECT COUNT(*) AS count
      FROM college_nirf_map m
      LEFT JOIN nirf_rankings n ON n.institute_name = m.nirf_institute
      WHERE m.verified = TRUE AND n.id IS NULL;
    `);

    const orphanAccred = await client.query(`
      SELECT COUNT(*) AS count
      FROM college_accreditation_map m
      LEFT JOIN accreditations a ON a.institute_name = m.accreditation_institute
      WHERE m.verified = TRUE AND a.id IS NULL;
    `);

    report.checks.push({
      name: "Referential Integrity of Verified Mappings",
      passed: orphanNIRF.rows[0].count === "0" && orphanAccred.rows[0].count === "0",
      details: {
        orphan_nirf_mappings: Number(orphanNIRF.rows[0].count),
        orphan_accreditation_mappings: Number(orphanAccred.rows[0].count)
      }
    });

    // Check 6: Duplicate detection across all entities
    const dupCutoffs = await client.query(`
      SELECT COUNT(*) AS count FROM (
        SELECT year, institute, program, quota, category, round, COUNT(*)
        FROM cutoffs
        GROUP BY 1,2,3,4,5,6
        HAVING COUNT(*) > 1
      ) d;
    `);

    const dupFees = await client.query(`
      SELECT COUNT(*) AS count FROM (
        SELECT college_id, program, fee_type, academic_year, COUNT(*)
        FROM college_fees
        GROUP BY 1,2,3,4
        HAVING COUNT(*) > 1
      ) d;
    `);

    report.checks.push({
      name: "Duplicate Records Detection",
      passed: dupCutoffs.rows[0].count === "0" && dupFees.rows[0].count === "0",
      details: {
        duplicate_cutoffs: Number(dupCutoffs.rows[0].count),
        duplicate_fees: Number(dupFees.rows[0].count)
      }
    });

    // Determine overall report status
    const allPassed = report.checks.every(c => c.passed);
    report.status = allPassed ? "ALL_CHECKS_PASSED" : "FAILED_CHECKS_DETECTED";

    console.log(JSON.stringify(report, null, 2));
    return report;
  } finally {
    client.release();
    if (require.main === module) {
      await pool.end();
    }
  }
}

if (require.main === module) {
  runDataValidation().catch(e => {
    console.error("Data validation failed with error:", e);
    process.exit(1);
  });
}

module.exports = runDataValidation;
