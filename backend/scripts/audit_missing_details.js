const pool = require("../src/db");

async function checkDetails() {
    try {
        const colleges = await pool.query(`
            SELECT 
                c.id,
                c.uptac_name,
                c.display_name,
                c.college_code,
                c.institution_type,
                c.ownership,
                c.city,
                c.district,
                c.established_year,
                c.campus_area,
                c.website,
                c.approval,
                (SELECT COUNT(*) FROM college_fees f WHERE f.college_id = c.id) as fee_count,
                (SELECT COUNT(*) FROM college_placements p WHERE p.college_id = c.id) as placement_count,
                (SELECT COUNT(*) FROM college_nirf_map nm WHERE nm.uptac_institute = c.uptac_name) as nirf_count,
                (SELECT COUNT(*) FROM college_accreditation_map am WHERE am.uptac_institute = c.uptac_name) as accred_count
            FROM colleges c
            ORDER BY c.uptac_name ASC
        `);

        console.log("Total Colleges:", colleges.rows.length);

        let missingWebsite = [];
        let missingYear = [];
        let missingCode = [];
        let missingArea = [];
        let missingFees = [];
        let missingPlacements = [];
        let missingCleanDisplayName = [];

        for (const col of colleges.rows) {
            if (!col.website) missingWebsite.push(col.uptac_name);
            if (!col.established_year) missingYear.push(col.uptac_name);
            if (!col.college_code) missingCode.push(col.uptac_name);
            if (!col.campus_area) missingArea.push(col.uptac_name);
            if (parseInt(col.fee_count) === 0) missingFees.push(col.uptac_name);
            if (parseInt(col.placement_count) === 0) missingPlacements.push(col.uptac_name);
            if (col.display_name === col.uptac_name && col.display_name === col.display_name.toUpperCase()) {
                missingCleanDisplayName.push(col.uptac_name);
            }
        }

        console.log("Summary of Missing Details:");
        console.log("- Missing Clean Display Name (All Caps raw):", missingCleanDisplayName.length);
        console.log("- Missing Official Website:", missingWebsite.length);
        console.log("- Missing Establishment Year:", missingYear.length);
        console.log("- Missing AKTU College Code:", missingCode.length);
        console.log("- Missing Campus Area:", missingArea.length);
        console.log("- Missing Audited Fee Schedule:", missingFees.length);
        console.log("- Missing Placement Outcomes:", missingPlacements.length);

        console.log("\nTop 30 Colleges with missing details:");
        console.log(missingWebsite.slice(0, 30));

    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        await pool.end();
    }
}

checkDetails();
