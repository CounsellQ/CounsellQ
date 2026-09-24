-- CounsellQ verified NBA batch
-- Official NBA Accredited Programs database checked 2026-09-24.
-- Only records supported by the returned official NBA source are included.
-- Historical periods are retained; no current accreditation is inferred from expired records.

BEGIN;

-- Ajay Kumar Garg Engineering College: official NBA shows these programs
-- accredited through 30-06-2025.
INSERT INTO accreditations
(institute_name, accreditation_type, accreditation_status, grade, program, validity, updated_year, source, valid_from, valid_until, source_url, last_verified)
VALUES
('Ajay Kumar Garg Engineering College (Ghaziabad)','NBA','Accredited','','Computer Science and Engineering','30-06-2025','2026','Official NBA','2022-07-01','2025-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('Ajay Kumar Garg Engineering College (Ghaziabad)','NBA','Accredited','','Information Technology','30-06-2025','2026','Official NBA','2022-07-01','2025-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('Ajay Kumar Garg Engineering College (Ghaziabad)','NBA','Accredited','','Electrical & Electronics Engineering','30-06-2025','2026','Official NBA','2022-07-01','2025-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('Ajay Kumar Garg Engineering College (Ghaziabad)','NBA','Accredited','','Electronics & Communication Engineering','30-06-2025','2026','Official NBA','2022-07-01','2025-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('Ajay Kumar Garg Engineering College (Ghaziabad)','NBA','Accredited','','Mechanical Engineering','30-06-2025','2026','Official NBA','2022-07-01','2025-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),

-- B.N. College of Engineering & Technology: CSE through 30-06-2024.
('B. N. College of Engineering and Technology (BNCET) (Lucknow)','NBA','Accredited','','Computer Science and Engineering','30-06-2024','2026','Official NBA','2021-07-01','2024-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),

-- Bansal Institute of Engineering & Technology: official NBA records.
('BANSAL INSTITUTE OF ENGINEERING AND TECHNOLOGY (Lucknow)','NBA','Accredited','','Information Technology','30-06-2027','2026','Official NBA','2024-07-01','2027-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('BANSAL INSTITUTE OF ENGINEERING AND TECHNOLOGY (Lucknow)','NBA','Accredited','','Biotechnology','30-06-2028','2026','Official NBA','2025-07-01','2028-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('BANSAL INSTITUTE OF ENGINEERING AND TECHNOLOGY (Lucknow)','NBA','Accredited','','Electrical Engineering','30-06-2028','2026','Official NBA','2025-07-01','2028-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),

-- Buddha Institute of Technology: CSE through 30-06-2027.
('BUDDHA INSTITUTE OF TECHNOLOGY GORAKHPUR (Gorakpur)','NBA','Accredited','','Computer Science and Engineering','30-06-2027','2026','Official NBA','2024-07-01','2027-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),

-- Bundelkhand Institute of Engineering & Technology: records returned by NBA.
('Bundelkhand Institute of Engineering & Technology Jhansi (Jhansi)','NBA','Accredited','','Computer Science and Engineering','30-06-2024','2026','Official NBA','2021-07-01','2024-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('Bundelkhand Institute of Engineering & Technology Jhansi (Jhansi)','NBA','Accredited','','Civil Engineering','30-06-2024','2026','Official NBA','2021-07-01','2024-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('Bundelkhand Institute of Engineering & Technology Jhansi (Jhansi)','NBA','Accredited','','Chemical Engineering','30-06-2023','2026','Official NBA','2020-07-01','2023-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),

-- IET Lucknow: five programs through 30-06-2025.
('INSTITUTE OF ENGINEERING & TECHNOLOGY LUCKNOW (LUCKNOW)','NBA','Accredited','','Civil Engineering','30-06-2025','2026','Official NBA','2022-07-01','2025-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('INSTITUTE OF ENGINEERING & TECHNOLOGY LUCKNOW (LUCKNOW)','NBA','Accredited','','Computer Science and Engineering','30-06-2025','2026','Official NBA','2022-07-01','2025-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('INSTITUTE OF ENGINEERING & TECHNOLOGY LUCKNOW (LUCKNOW)','NBA','Accredited','','Electrical Engineering','30-06-2025','2026','Official NBA','2022-07-01','2025-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('INSTITUTE OF ENGINEERING & TECHNOLOGY LUCKNOW (LUCKNOW)','NBA','Accredited','','Electronics & Communication Engineering','30-06-2025','2026','Official NBA','2022-07-01','2025-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('INSTITUTE OF ENGINEERING & TECHNOLOGY LUCKNOW (LUCKNOW)','NBA','Accredited','','Mechanical Engineering','30-06-2025','2026','Official NBA','2022-07-01','2025-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),

-- Integral University: CSE through 30-06-2028.
('Integral University (Lucknow)','NBA','Accredited','','Computer Science and Engineering','30-06-2028','2026','Official NBA','2025-07-01','2028-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24')

ON CONFLICT (institute_name, accreditation_type, program, validity) DO NOTHING;

INSERT INTO college_accreditation_map
(uptac_institute, accreditation_institute, match_method, verified)
VALUES
('AJAY KUMAR GARG ENGG. COLLEGE,GHAZIABAD','Ajay Kumar Garg Engineering College (Ghaziabad)','official_nba_name_match',TRUE),
('B.N.COLLEGE OF ENGINEERING & TECHNOLOGY(BNCET),LUCKNOW','B. N. College of Engineering and Technology (BNCET) (Lucknow)','official_nba_name_match',TRUE),
('BANSAL INSTITUTE OF ENGINEERING & TECHNOLOGY,LUCKNOW','BANSAL INSTITUTE OF ENGINEERING AND TECHNOLOGY (Lucknow)','official_nba_name_match',TRUE),
('BUDDHA INSTITUTE OF TECHNOLOGY,GORAKHPUR','BUDDHA INSTITUTE OF TECHNOLOGY GORAKHPUR (Gorakpur)','official_nba_name_match',TRUE),
('BUNDELKHAND INSTITUTE OF ENGINEERING & TECHNOLOGY,JHANSI','Bundelkhand Institute of Engineering & Technology Jhansi (Jhansi)','official_nba_name_match',TRUE),
('INSTITUTE OF ENGINEERING & TECHNOLOGY,LUCKNOW','INSTITUTE OF ENGINEERING & TECHNOLOGY LUCKNOW (LUCKNOW)','official_nba_name_match',TRUE),
('Integral University, Lucknow','Integral University (Lucknow)','official_nba_name_match',TRUE)
ON CONFLICT (uptac_institute) DO UPDATE SET
  accreditation_institute = EXCLUDED.accreditation_institute,
  match_method = EXCLUDED.match_method,
  verified = EXCLUDED.verified;

UPDATE accreditation_research_queue
SET research_status = 'NBA_VERIFIED',
    notes = 'Official NBA Accredited Programs record verified on 2026-09-24.',
    last_checked = CURRENT_DATE
WHERE uptac_institute IN (
'AJAY KUMAR GARG ENGG. COLLEGE,GHAZIABAD',
'B.N.COLLEGE OF ENGINEERING & TECHNOLOGY(BNCET),LUCKNOW',
'BANSAL INSTITUTE OF ENGINEERING & TECHNOLOGY,LUCKNOW',
'BUDDHA INSTITUTE OF TECHNOLOGY,GORAKHPUR',
'BUNDELKHAND INSTITUTE OF ENGINEERING & TECHNOLOGY,JHANSI',
'INSTITUTE OF ENGINEERING & TECHNOLOGY,LUCKNOW',
'Integral University, Lucknow'
);

-- Additional verified institutes from the same official NBA database pass.
INSERT INTO accreditations
(institute_name, accreditation_type, accreditation_status, grade, program, validity, updated_year, source, valid_from, valid_until, source_url, last_verified)
VALUES
('B.B.S.COLLEGE OF ENGG.AND TECHNOLOGY (ALLAHABAD)','NBA','Accredited','','Mechanical Engineering','19-07-2011','2026','Official NBA','2008-07-19','2011-07-18','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('B.B.S.COLLEGE OF ENGG.AND TECHNOLOGY (ALLAHABAD)','NBA','Accredited','','Electronics and Communication Engineering','19-07-2011','2026','Official NBA','2008-07-19','2011-07-18','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('BHAGWANT INSTITUTE OF TECHNOLOGY (Muzaffar Nagar)','NBA','Accredited','','Mechanical Engineering','19-07-2011','2026','Official NBA','2008-07-19','2011-07-18','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('BHAGWANT INSTITUTE OF TECHNOLOGY (Muzaffar Nagar)','NBA','Accredited','','Electronics and Communication Engineering','19-07-2011','2026','Official NBA','2008-07-19','2011-07-18','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('BHAGWANT INSTITUTE OF TECHNOLOGY (Muzaffar Nagar)','NBA','Accredited','','Computer Science and Engineering','19-07-2011','2026','Official NBA','2008-07-19','2011-07-18','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('AZAD INSTITUTE OF ENGINEERING & TECHNOLOGY (Lucknow)','NBA','Accredited','','Computer Science and Engineering','12-09-2010','2026','Official NBA','2007-09-12','2010-09-11','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('AZAD INSTITUTE OF ENGINEERING & TECHNOLOGY (Lucknow)','NBA','Accredited','','Electrical Engineering','12-09-2010','2026','Official NBA','2007-09-12','2010-09-11','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('AZAD INSTITUTE OF ENGINEERING & TECHNOLOGY (Lucknow)','NBA','Accredited','','Electronics Engineering','12-09-2010','2026','Official NBA','2007-09-12','2010-09-11','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('AZAD INSTITUTE OF ENGINEERING & TECHNOLOGY (Lucknow)','NBA','Accredited','','Mechanical Engineering','12-09-2010','2026','Official NBA','2007-09-12','2010-09-11','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('AZAD INSTITUTE OF ENGINEERING & TECHNOLOGY (Lucknow)','NBA','Accredited','','Electronics and Instrumentation Engineering','19-07-2011','2026','Official NBA','2008-07-19','2011-07-18','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('AZAD INSTITUTE OF ENGINEERING & TECHNOLOGY (Lucknow)','NBA','Accredited','','Information Technology','10-02-2012','2026','Official NBA','2009-02-10','2012-02-09','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('BHARAT INSTITUTE OF TECHNOLOGY (MEERUT)','NBA','Accredited','','Electronics and Communication Engineering','16-03-2010','2026','Official NBA','2007-03-16','2010-03-15','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('BHARAT INSTITUTE OF TECHNOLOGY (MEERUT)','NBA','Accredited','','Electrical and Electronics Engineering','16-03-2010','2026','Official NBA','2007-03-16','2010-03-15','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('BHARAT INSTITUTE OF TECHNOLOGY (MEERUT)','NBA','Accredited','','Computer Science and Engineering','16-03-2010','2026','Official NBA','2007-03-16','2010-03-15','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('BHARAT INSTITUTE OF TECHNOLOGY (MEERUT)','NBA','Accredited','','Information Technology','16-03-2010','2026','Official NBA','2007-03-16','2010-03-15','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('BHARAT INSTITUTE OF TECHNOLOGY (MEERUT)','NBA','Accredited','','Mechanical Engineering','15-03-2015','2026','Official NBA','2012-03-15','2015-03-14','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24')
ON CONFLICT (institute_name, accreditation_type, program, validity) DO NOTHING;

INSERT INTO college_accreditation_map (uptac_institute, accreditation_institute, match_method, verified) VALUES
('B.B.S.COLLEGE OF ENGGINERING AND TECHNOLOGY,ALLAHABAD','B.B.S.COLLEGE OF ENGG.AND TECHNOLOGY (ALLAHABAD)','official_nba_name_match',TRUE),
('BHAGWANT INSTITUTE OF TECHNOLOGY,MUZAFFARNAGAR','BHAGWANT INSTITUTE OF TECHNOLOGY (Muzaffar Nagar)','official_nba_name_match',TRUE),
('AZAD INSTITUTE OF ENGINEERING & TECHNOLOGY,LUCKNOW','AZAD INSTITUTE OF ENGINEERING & TECHNOLOGY (Lucknow)','official_nba_name_match',TRUE),
('BHARAT INSTITUTE OF TECHNOLOGY,MEERUT','BHARAT INSTITUTE OF TECHNOLOGY (MEERUT)','official_nba_name_match',TRUE)
ON CONFLICT (uptac_institute) DO UPDATE SET accreditation_institute=EXCLUDED.accreditation_institute, match_method=EXCLUDED.match_method, verified=EXCLUDED.verified;

UPDATE accreditation_research_queue SET research_status='NBA_VERIFIED', notes='Official NBA Accredited Programs record verified on 2026-09-24.', last_checked=CURRENT_DATE WHERE uptac_institute IN (
'B.B.S.COLLEGE OF ENGGINERING AND TECHNOLOGY,ALLAHABAD','BHAGWANT INSTITUTE OF TECHNOLOGY,MUZAFFARNAGAR','AZAD INSTITUTE OF ENGINEERING & TECHNOLOGY,LUCKNOW','BHARAT INSTITUTE OF TECHNOLOGY,MEERUT');

-- Verified from official institute accreditation pages: Rajkiya Engineering College, Banda.
-- The institute lists B.Tech EE, IT and ME as accredited for academic years 2022-23 to 2023-24, up to 30-06-2024.
INSERT INTO accreditations
(institute_name, accreditation_type, accreditation_status, grade, program, validity, updated_year, source, valid_from, valid_until, source_url, last_verified)
VALUES
('RAJKIYA ENGINEERING COLLEGE BANDA (Banda)','NBA','Accredited','','Electrical Engineering','30-06-2024','2026','Official REC Banda NBA Accreditation Programme','2022-07-01','2024-06-30','https://recbanda.ac.in/pages/nba-accreditation-2','2026-09-24'),
('RAJKIYA ENGINEERING COLLEGE BANDA (Banda)','NBA','Accredited','','Information Technology','30-06-2024','2026','Official REC Banda NBA Accreditation Programme','2022-07-01','2024-06-30','https://recbanda.ac.in/pages/nba-accreditation-2','2026-09-24'),
('RAJKIYA ENGINEERING COLLEGE BANDA (Banda)','NBA','Accredited','','Mechanical Engineering','30-06-2024','2026','Official REC Banda NBA Accreditation Programme','2022-07-01','2024-06-30','https://recbanda.ac.in/pages/nba-accreditation-2','2026-09-24')
ON CONFLICT (institute_name, accreditation_type, program, validity) DO NOTHING;

INSERT INTO college_accreditation_map
(uptac_institute, accreditation_institute, match_method, verified)
VALUES
('RAJKIYA ENGINEERING COLLEGE,BANDA','RAJKIYA ENGINEERING COLLEGE BANDA (Banda)','official_institute_nba_page',TRUE)
ON CONFLICT (uptac_institute) DO UPDATE SET
  accreditation_institute=EXCLUDED.accreditation_institute,
  match_method=EXCLUDED.match_method,
  verified=EXCLUDED.verified;

UPDATE accreditation_research_queue
SET research_status='NBA_VERIFIED',
    notes='Official REC Banda NBA Accreditation Programme verified on 2026-09-24.',
    last_checked=CURRENT_DATE
WHERE uptac_institute='RAJKIYA ENGINEERING COLLEGE,BANDA';

-- Verified from the official Rajkiya Engineering College, Ambedkar Nagar accreditation page.
-- The institute states Electrical Engineering and Information Technology are NBA accredited for 2024-2027, valid through 30-06-2027.
INSERT INTO accreditations
(institute_name, accreditation_type, accreditation_status, grade, program, validity, updated_year, source, valid_from, valid_until, source_url, last_verified)
VALUES
('Rajkiya Engineering College, Ambedkar Nagar (Ambedkar Nagar)','NBA','Accredited','','Electrical Engineering','30-06-2027','2026','Official REC Ambedkar Nagar accreditation page','2024-07-01','2027-06-30','https://www.recabn.ac.in/en/pages/accreditations-naac-nba-nirf-sirf','2026-09-24'),
('Rajkiya Engineering College, Ambedkar Nagar (Ambedkar Nagar)','NBA','Accredited','','Information Technology','30-06-2027','2026','Official REC Ambedkar Nagar accreditation page','2024-07-01','2027-06-30','https://www.recabn.ac.in/en/pages/accreditations-naac-nba-nirf-sirf','2026-09-24')
ON CONFLICT (institute_name, accreditation_type, program, validity) DO NOTHING;

INSERT INTO college_accreditation_map
(uptac_institute, accreditation_institute, match_method, verified)
VALUES
('RAJKIYA ENGINEERING COLLEGE,AMBEDKAR NAGAR','Rajkiya Engineering College, Ambedkar Nagar (Ambedkar Nagar)','official_institute_nba_page',TRUE)
ON CONFLICT (uptac_institute) DO UPDATE SET
  accreditation_institute=EXCLUDED.accreditation_institute,
  match_method=EXCLUDED.match_method,
  verified=EXCLUDED.verified;

UPDATE accreditation_research_queue
SET research_status='NBA_VERIFIED',
    notes='Official REC Ambedkar Nagar accreditation page verified on 2026-09-24.',
    last_checked=CURRENT_DATE
WHERE uptac_institute='RAJKIYA ENGINEERING COLLEGE,AMBEDKAR NAGAR';


-- 2026-09-24 verified batch: ABES + Babu Banarasi Das institutes.
-- NBA source independently checked on 2026-09-24. Historical periods retained.

INSERT INTO accreditations
(institute_name, accreditation_type, accreditation_status, grade, program, validity, updated_year, source, valid_from, valid_until, source_url, last_verified)
VALUES
('ABES ENGINEERING COLLEGE (Ghaziabad)','NBA','Accredited','','Mechanical Engineering','30-06-2028','2026','Official NBA','2025-07-01','2028-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('ABES ENGINEERING COLLEGE (Ghaziabad)','NBA','Accredited','','Electronics & Communication Engineering','30-06-2028','2026','Official NBA','2025-07-01','2028-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('ABES ENGINEERING COLLEGE (Ghaziabad)','NBA','Accredited','','Computer Science and Engineering','31-12-2028','2026','Official NBA','2025-07-01','2028-12-31','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('ABES Institute of Technology (Ghaziabad)','NBA','Accredited','','Computer Science and Engineering','30-06-2025','2026','Official NBA','2022-07-01','2025-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('ABES Institute of Technology (Ghaziabad)','NBA','Accredited','','Electronics & Communication Engineering','30-06-2022','2026','Official NBA','2019-07-01','2022-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('ABES Institute of Technology (Ghaziabad)','NBA','Accredited','','Information Technology','30-06-2025','2026','Official NBA','2022-07-01','2025-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('Babu Banarasi Das Institute of Technology & Management (Engg. and Tech.) (Lucknow)','NBA','Accredited','','Computer Science and Engineering','30-06-2026','2026','Official NBA','2023-07-01','2026-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('Babu Banarasi Das Institute of Technology & Management (Engg. and Tech.) (Lucknow)','NBA','Accredited','','Electronics & Communication Engineering','30-06-2026','2026','Official NBA','2023-07-01','2026-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('Babu Banarasi Das Institute of Technology & Management (Engg. and Tech.) (Lucknow)','NBA','Accredited','','Information Technology','30-06-2026','2026','Official NBA','2023-07-01','2026-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('Babu Banarasi Das Northern India Institute of Technology (Lucknow)','NBA','Accredited','','Computer Science and Engineering','30-06-2026','2026','Official NBA','2023-07-01','2026-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('Babu Banarasi Das Northern India Institute of Technology (Lucknow)','NBA','Accredited','','Information Technology','30-06-2026','2026','Official NBA','2023-07-01','2026-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24')
ON CONFLICT (institute_name, accreditation_type, program, validity) DO NOTHING;

INSERT INTO college_accreditation_map (uptac_institute, accreditation_institute, match_method, verified)
VALUES
('ABES ENGG.COLLEGE,GHAZIABAD','ABES ENGINEERING COLLEGE (Ghaziabad)','official_nba_name_match',TRUE),
('ABES INSTITUTE OF TECHNOLOGY,GHAZIABAD','ABES Institute of Technology (Ghaziabad)','official_nba_name_match',TRUE),
('BABU BANARASI DAS INSTITUTE OF TECHNOLOGY AND MANAGEMENT, LUCKNOW','Babu Banarasi Das Institute of Technology & Management (Engg. and Tech.) (Lucknow)','official_nba_name_match',TRUE),
('BABU BANARASI DAS NORTHERN INDIA INSTITUTE OF TECHNOLOGY,LUCKNOW','Babu Banarasi Das Northern India Institute of Technology (Lucknow)','official_nba_name_match',TRUE)
ON CONFLICT (uptac_institute) DO UPDATE SET
accreditation_institute=EXCLUDED.accreditation_institute,
match_method=EXCLUDED.match_method,
verified=EXCLUDED.verified;

UPDATE accreditation_research_queue
SET research_status='NBA_VERIFIED',
notes='Official NBA Accredited Programs record verified on 2026-09-24.',
last_checked=CURRENT_DATE
WHERE uptac_institute IN (
'ABES ENGG.COLLEGE,GHAZIABAD',
'ABES INSTITUTE OF TECHNOLOGY,GHAZIABAD',
'BABU BANARASI DAS INSTITUTE OF TECHNOLOGY AND MANAGEMENT, LUCKNOW',
'BABU BANARASI DAS NORTHERN INDIA INSTITUTE OF TECHNOLOGY,LUCKNOW'
);


-- 2026-09-24 additional official-institute verification: JSSATE Noida CSE.
-- JSSATE's official site states NBA accreditation from 01-07-2023 to 30-06-2026.

INSERT INTO accreditations
(institute_name, accreditation_type, accreditation_status, grade, program, validity, updated_year, source, valid_from, valid_until, source_url, last_verified)
VALUES
('JSS Academy of Technical Education, Noida','NBA','Accredited','','Computer Science and Engineering','30-06-2026','2026','Official JSSATE Mandatory Disclosure','2023-07-01','2026-06-30','https://www.jssaten.ac.in/assets/images/governance/Mandatory%20Disclosure.pdf','2026-09-24')
ON CONFLICT (institute_name, accreditation_type, program, validity) DO NOTHING;

INSERT INTO college_accreditation_map
(uptac_institute, accreditation_institute, match_method, verified)
VALUES
('JSS ACADEMY OF TECHNICAL EDUCATION,NOIDA','JSS Academy of Technical Education, Noida','official_institute_name_match',TRUE)
ON CONFLICT (uptac_institute) DO UPDATE SET
accreditation_institute=EXCLUDED.accreditation_institute,
match_method=EXCLUDED.match_method,
verified=EXCLUDED.verified;

UPDATE accreditation_research_queue
SET research_status='NBA_VERIFIED',
notes='Official JSSATE accreditation disclosure verified on 2026-09-24.',
last_checked=CURRENT_DATE
WHERE uptac_institute='JSS ACADEMY OF TECHNICAL EDUCATION,NOIDA';


-- 2026-09-24 correction/completion batch from the current official NBA database.
-- Adds programs found in the official records that were not yet represented in this file.

INSERT INTO accreditations
(institute_name, accreditation_type, accreditation_status, grade, program, validity, updated_year, source, valid_from, valid_until, source_url, last_verified)
VALUES
('Harcourt Butler Technical University (Kanpur)','NBA','Accredited','','Electronics Engineering','30-06-2025','2026','Official NBA','2022-07-01','2025-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('Harcourt Butler Technical University (Kanpur)','NBA','Accredited','','Food Technology','30-06-2025','2026','Official NBA','2022-07-01','2025-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('Harcourt Butler Technical University (Kanpur)','NBA','Accredited','','Oil Technology','30-06-2025','2026','Official NBA','2022-07-01','2025-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('Harcourt Butler Technical University (Kanpur)','NBA','Accredited','','Paint Technology','30-06-2025','2026','Official NBA','2022-07-01','2025-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('Harcourt Butler Technical University (Kanpur)','NBA','Accredited','','Plastics Technology','30-06-2025','2026','Official NBA','2022-07-01','2025-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('Motilal Nehru National Institute of Technology (Allahabad)','NBA','Accredited','','Biotechnology','31-12-2028','2026','Official NBA','2026-01-01','2028-12-31','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('Motilal Nehru National Institute of Technology (Allahabad)','NBA','Accredited','','Chemical Engineering','31-12-2028','2026','Official NBA','2026-01-01','2028-12-31','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24')
ON CONFLICT (institute_name, accreditation_type, program, validity) DO NOTHING;


-- 2026-09-24 official NBA RTI/Suo Moto verification batch.
-- Source: NBA Suo Moto disclosure 4.5.8(d), plus current Accredited Programs database.

INSERT INTO accreditations
(institute_name, accreditation_type, accreditation_status, grade, program, validity, updated_year, source, valid_from, valid_until, source_url, last_verified)
VALUES
('Raj Kumar Goel Institute of Technology (Ghaziabad)','NBA','Accredited','','Electronics & Communication Engineering','30-06-2027','2026','Official NBA Suo Moto disclosure','2024-07-01','2027-06-30','https://www.nbaind.org/files/rti/SuoMoto2025/4.5.8%28d%29.pdf','2026-09-24'),
('Kamla Nehru Institute of Technology Sultanpur -228118 u.p. (Sultanpur)','NBA','Accredited','','Electrical Engineering','30-06-2027','2026','Official NBA Accredited Programs','2024-07-01','2027-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('Kamla Nehru Institute of Technology Sultanpur -228118 u.p. (Sultanpur)','NBA','Accredited','','Civil Engineering','30-06-2024','2026','Official NBA Accredited Programs','2021-07-01','2024-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24')
ON CONFLICT (institute_name, accreditation_type, program, validity) DO NOTHING;

INSERT INTO college_accreditation_map
(uptac_institute, accreditation_institute, match_method, verified)
VALUES
('RAJ KUMAR GOEL INSTITUTE OF TECHNOLOGY & MANAGEMENT,GHAZIABAD','Raj Kumar Goel Institute of Technology (Ghaziabad)','official_nba_name_match',TRUE),
('KAMLA NEHRU INSTITUTE OF TECHNOLOGY,SULTANPUR','Kamla Nehru Institute of Technology Sultanpur -228118 u.p. (Sultanpur)','official_nba_name_match',TRUE)
ON CONFLICT (uptac_institute) DO UPDATE SET
accreditation_institute=EXCLUDED.accreditation_institute,
match_method=EXCLUDED.match_method,
verified=EXCLUDED.verified;

UPDATE accreditation_research_queue
SET research_status='NBA_VERIFIED',
notes='Official NBA record verified on 2026-09-24.',
last_checked=CURRENT_DATE
WHERE uptac_institute IN (
'RAJ KUMAR GOEL INSTITUTE OF TECHNOLOGY & MANAGEMENT,GHAZIABAD',
'KAMLA NEHRU INSTITUTE OF TECHNOLOGY,SULTANPUR'
);


-- 2026-09-24 verified continuation from official NBA records.
INSERT INTO accreditations
(institute_name, accreditation_type, accreditation_status, grade, program, validity, updated_year, source, valid_from, valid_until, source_url, last_verified)
VALUES
('PSIT-Pranveer Singh Institute of Technology (Kanpur(Nagar))','NBA','Accredited','','Computer Science and Engineering','30-06-2027','2026','Official NBA Suo Moto disclosure','2024-07-01','2027-06-30','https://www.nbaind.org/files/rti/SuoMoto2025/4.5.8%28d%29.pdf','2026-09-24'),
('PSIT-Pranveer Singh Institute of Technology (Kanpur(Nagar))','NBA','Accredited','','Information Technology','30-06-2027','2026','Official NBA Suo Moto disclosure','2024-07-01','2027-06-30','https://www.nbaind.org/files/rti/SuoMoto2025/4.5.8%28d%29.pdf','2026-09-24'),
('B.N. College of Engineering and Technology (BNCET) (Lucknow)','NBA','Accredited','','Computer Science and Engineering','30-06-2027','2026','Official NBA Suo Moto disclosure','2024-07-01','2027-06-30','https://www.nbaind.org/files/rti/SuoMoto2025/4.5.8%28d%29.pdf','2026-09-24'),
('Sharda University (Gautam Bodda Nagar)','NBA','Accredited','','Computer Science & Engineering','30-06-2026','2026','Official NBA Suo Moto disclosure','2023-07-01','2026-06-30','https://www.nbaind.org/files/rti/docs/4.5.8%20%28d%29.pdf','2026-09-24'),
('Sharda University (Gautam Bodda Nagar)','NBA','Accredited','','Civil Engineering','30-06-2026','2026','Official NBA Suo Moto disclosure','2023-07-01','2026-06-30','https://www.nbaind.org/files/rti/docs/4.5.8%20%28d%29.pdf','2026-09-24'),
('Sharda University (Gautam Bodda Nagar)','NBA','Accredited','','Mechanical Engineering','30-06-2026','2026','Official NBA Suo Moto disclosure','2023-07-01','2026-06-30','https://www.nbaind.org/files/rti/docs/4.5.8%20%28d%29.pdf','2026-09-24')
ON CONFLICT (institute_name, accreditation_type, program, validity) DO NOTHING;

INSERT INTO college_accreditation_map
(uptac_institute, accreditation_institute, match_method, verified)
VALUES
('PSIT-PRANVEER SINGH INSTITUTE OF TECHNOLOGY,KANPUR','PSIT-Pranveer Singh Institute of Technology (Kanpur(Nagar))','official_nba_name_match',TRUE),
('SHARDA UNIVERSITY,GREATER NOIDA','Sharda University (Gautam Bodda Nagar)','official_nba_name_match',TRUE)
ON CONFLICT (uptac_institute) DO UPDATE SET accreditation_institute=EXCLUDED.accreditation_institute,match_method=EXCLUDED.match_method,verified=EXCLUDED.verified;

UPDATE accreditation_research_queue SET research_status='NBA_VERIFIED',notes='Official NBA record verified on 2026-09-24.',last_checked=CURRENT_DATE WHERE uptac_institute IN ('PSIT-PRANVEER SINGH INSTITUTE OF TECHNOLOGY,KANPUR','SHARDA UNIVERSITY,GREATER NOIDA');


-- 2026-09-24 bulk Uttar Pradesh records from official NBA RTI disclosure.
INSERT INTO accreditations
(institute_name, accreditation_type, accreditation_status, grade, program, validity, updated_year, source, valid_from, valid_until, source_url, last_verified)
VALUES
('Goel Institute of Technology & Management (Lucknow)','NBA','Accredited','','Computer Science & Engineering','30-06-2026','2026','Official NBA Suo Moto disclosure','2023-07-01','2026-06-30','https://nbaind.org/files/rti/docs/4.5.8%20%28d%29.pdf','2026-09-24'),
('KIMP – College of Engineering & Technology (Gorakhpur)','NBA','Accredited','','Computer Science & Engineering','30-06-2026','2026','Official NBA Suo Moto disclosure','2023-07-01','2026-06-30','https://nbaind.org/files/rti/docs/4.5.8%20%28d%29.pdf','2026-09-24'),
('KIMP – College of Engineering & Technology (Gorakhpur)','NBA','Accredited','','Electronics & Communication Engineering','30-06-2026','2026','Official NBA Suo Moto disclosure','2023-07-01','2026-06-30','https://nbaind.org/files/rti/docs/4.5.8%20%28d%29.pdf','2026-09-24'),
('KIMP – College of Engineering & Technology (Gorakhpur)','NBA','Accredited','','Mechanical Engineering','30-06-2026','2026','Official NBA Suo Moto disclosure','2023-07-01','2026-06-30','https://nbaind.org/files/rti/docs/4.5.8%20%28d%29.pdf','2026-09-24'),
('Institute of Technology and Management (Gorakhpur)','NBA','Accredited','','Computer Science & Engineering','30-06-2026','2026','Official NBA Suo Moto disclosure','2023-07-01','2026-06-30','https://nbaind.org/files/rti/docs/4.5.8%20%28d%29.pdf','2026-09-24'),
('Delhi Technical Campus (Greater Noida)','NBA','Accredited','','Computer Science & Engineering','30-06-2027','2026','Official NBA Suo Moto disclosure','2024-07-01','2027-06-30','https://nbaind.org/files/rti/docs/4.5.8%20%28d%29.pdf','2026-09-24')
ON CONFLICT (institute_name, accreditation_type, program, validity) DO NOTHING;

INSERT INTO college_accreditation_map
(uptac_institute, accreditation_institute, match_method, verified)
VALUES
('GOEL INSTITUTE OF TECHNOLOGY & MANAGEMENT,LUCKNOW','Goel Institute of Technology & Management (Lucknow)','official_nba_name_match',TRUE),
('K.I.M.P. COLLEGE OF ENGINEERING & TECHNOLOGY,GORAKHPUR','KIMP – College of Engineering & Technology (Gorakhpur)','official_nba_name_match',TRUE),
('INSTITUTE OF TECHNOLOGY AND MANAGEMENT,GORAKHPUR','Institute of Technology and Management (Gorakhpur)','official_nba_name_match',TRUE),
('DELHI TECHNICAL CAMPUS,GREATER NOIDA','Delhi Technical Campus (Greater Noida)','official_nba_name_match',TRUE)
ON CONFLICT (uptac_institute) DO UPDATE SET accreditation_institute=EXCLUDED.accreditation_institute,match_method=EXCLUDED.match_method,verified=EXCLUDED.verified;

UPDATE accreditation_research_queue SET research_status='NBA_VERIFIED',notes='Official NBA RTI disclosure verified on 2026-09-24.',last_checked=CURRENT_DATE WHERE uptac_institute IN ('GOEL INSTITUTE OF TECHNOLOGY & MANAGEMENT,LUCKNOW','K.I.M.P. COLLEGE OF ENGINEERING & TECHNOLOGY,GORAKHPUR','INSTITUTE OF TECHNOLOGY AND MANAGEMENT,GORAKHPUR','DELHI TECHNICAL CAMPUS,GREATER NOIDA');


-- 2026-09-24 verified Dayalbagh Educational Institute records.
INSERT INTO accreditations
(institute_name, accreditation_type, accreditation_status, grade, program, validity, updated_year, source, valid_from, valid_until, source_url, last_verified)
VALUES
('Dayalbagh Educational Institute (Agra)','NBA','Accredited','','Mechanical Engineering','30-06-2025','2026','Official NBA Accredited Programs','2022-07-01','2025-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('Dayalbagh Educational Institute (Agra)','NBA','Accredited','','Electrical Engineering','30-06-2025','2026','Official NBA Accredited Programs','2022-07-01','2025-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24')
ON CONFLICT (institute_name, accreditation_type, program, validity) DO NOTHING;

INSERT INTO college_accreditation_map
(uptac_institute, accreditation_institute, match_method, verified)
VALUES
('DAYALBAGH EDUCATIONAL INSTITUTE,AGRA','Dayalbagh Educational Institute (Agra)','official_nba_name_match',TRUE)
ON CONFLICT (uptac_institute) DO UPDATE SET accreditation_institute=EXCLUDED.accreditation_institute,match_method=EXCLUDED.match_method,verified=EXCLUDED.verified;

UPDATE accreditation_research_queue SET research_status='NBA_VERIFIED',notes='Official NBA record verified on 2026-09-24.',last_checked=CURRENT_DATE WHERE uptac_institute='DAYALBAGH EDUCATIONAL INSTITUTE,AGRA';


-- 2026-09-24 verified Dronacharya Group of Institutions record.
INSERT INTO accreditations
(institute_name, accreditation_type, accreditation_status, grade, program, validity, updated_year, source, valid_from, valid_until, source_url, last_verified)
VALUES
('Dronacharya Group of Institutions (Greater Noida)','NBA','Accredited','','Computer Science & Engineering','30-06-2027','2026','Official NBA Suo Moto disclosure','2024-07-01','2027-06-30','https://www.nbaind.org/files/rti/SuoMoto2025/4.5.8%28d%29.pdf','2026-09-24')
ON CONFLICT (institute_name, accreditation_type, program, validity) DO NOTHING;

INSERT INTO college_accreditation_map
(uptac_institute, accreditation_institute, match_method, verified)
VALUES
('DRONACHARYA GROUP OF INSTITUTIONS,GAUTAM BUDDH NAGAR','Dronacharya Group of Institutions (Greater Noida)','official_nba_name_match',TRUE)
ON CONFLICT (uptac_institute) DO UPDATE SET accreditation_institute=EXCLUDED.accreditation_institute,match_method=EXCLUDED.match_method,verified=EXCLUDED.verified;

UPDATE accreditation_research_queue SET research_status='NBA_VERIFIED',notes='Official NBA record verified on 2026-09-24.',last_checked=CURRENT_DATE WHERE uptac_institute='DRONACHARYA GROUP OF INSTITUTIONS,GAUTAM BUDDH NAGAR';


-- 2026-09-24 completion from official NBA RTI disclosure.
INSERT INTO accreditations
(institute_name, accreditation_type, accreditation_status, grade, program, validity, updated_year, source, valid_from, valid_until, source_url, last_verified)
VALUES
('Sharda University (Gautam Bodda Nagar)','NBA','Accredited','','Civil Engineering','30-06-2026','2026','Official NBA RTI disclosure','2023-07-01','2026-06-30','https://www.nbaind.org/files/rti/docs/4.5.8%20%28d%29.pdf','2026-09-24')
ON CONFLICT (institute_name, accreditation_type, program, validity) DO NOTHING;


-- 2026-09-24 verified continuation: official NBA RTI disclosure rows.
INSERT INTO accreditations
(institute_name, accreditation_type, accreditation_status, grade, program, validity, updated_year, source, valid_from, valid_until, source_url, last_verified)
VALUES
('Meerut Institute of Engineering & Technology (Meerut)','NBA','Accredited','','Biotechnology','30-06-2027','2026','Official NBA Suo Moto disclosure','2024-07-01','2027-06-30','https://www.nbaind.org/files/rti/SuoMoto2025/4.5.8%28d%29.pdf','2026-09-24'),
('KIET Group of Institutions (Ghaziabad)','NBA','Accredited','','Computer Science','30-06-2027','2026','Official NBA Suo Moto disclosure','2024-07-01','2027-06-30','https://www.nbaind.org/files/rti/SuoMoto2025/4.5.8%28d%29.pdf','2026-09-24'),
('KIET Group of Institutions (Ghaziabad)','NBA','Accredited','','Computer Science & Information Technology','30-06-2027','2026','Official NBA Suo Moto disclosure','2024-07-01','2027-06-30','https://www.nbaind.org/files/rti/SuoMoto2025/4.5.8%28d%29.pdf','2026-09-24'),
('Dronacharya Group of Institutions (Greater Noida)','NBA','Accredited','','Computer Science & Information Technology','30-06-2027','2026','Official NBA Suo Moto disclosure','2024-07-01','2027-06-30','https://www.nbaind.org/files/rti/SuoMoto2025/4.5.8%28d%29.pdf','2026-09-24')
ON CONFLICT (institute_name, accreditation_type, program, validity) DO NOTHING;

-- 2026-09-24 batch research: 20 UPTAC institutes checked for official NBA accreditation.
UPDATE accreditation_research_queue SET research_status='NO_VERIFIED_RECORD', notes='Official NBA Accredited Programs search and available official-source review performed on 2026-09-24; no verified NBA accreditation record identified. This is not a claim of non-accreditation.', last_checked=CURRENT_DATE WHERE uptac_institute IN (
'A.N.A.COLLEGE OF ENGINEERING & MANAGEMENT,BAREILLY',
'ABSS INSTITUTE OF TECHNOLOGY, MEERUT,MEERUT',
'ACCURATE INSTITUTE OF MANAGEMENT & TECHNOLOGY,GAUTAM BUDDH NAGAR',
'Acharya Narendra Deva University of Agriculture & Technology, Kumarganj, Ayodhya',
'ADHUNIK COLLEGE OF ENGG.,GHAZIABAD',
'ALIGARH COLLEGE OF ENGG. & TECH,ALIGARH',
'ALLENHOUSE INSTITUTE OF TECHNOLOGY,KANPUR',
'AMANI GROUP OF INSTITUTIONS,AMROHA',
'AMBALIKA INSTITUTE OF MANAGEMENT & TECHNOLOGY,LUCKNOW',
'APEX INSTITUTE OF TECHNOLOGY,RAMPUR',
'APOLLO INSTITUTE OF TECHNOLOGY,KANPUR',
'ASHOKA INSTITUTE OF TECHNOLOGY & MANAGEMENT,VARANASI',
'AXIS INSTITUTE OF TECHNOLOGY & MANAGEMENT,KANPUR',
'B.S.A. COLLEGE OF ENGINEERING & TECHNOLOGY,MATHURA',
'Baba Shaheb (Dr.) B R Ambedkar College of Agricultural Engineering and Technology, Etawah (CSAUAT)',
'BABU BANARSI DAS INSTITUTE OF TECH.,GHAZIABAD',
'BABU SUNDER SINGH INSTITUTE OF TECHNOLOGY & MANAGEMENT,LUCKNOW',
'BHARAT RATNA BABA SAHEB BHIM RAO AMBEDKAR RAJKIYA ENGINEERING COLLEGE, PRATAPGARH',
'BHARAT RATNA SARDAR VALLABHBHAI PATEL RAJKIYA ENGINEERING COLLEGE, BASTI',
'Bundelkhand University, Jhansi');

INSERT INTO accreditation_research_queue (uptac_institute,research_status,notes,last_checked)
VALUES
('A.N.A.COLLEGE OF ENGINEERING & MANAGEMENT,BAREILLY','NO_VERIFIED_RECORD','Official NBA Accredited Programs search and available official-source review performed on 2026-09-24; no verified NBA accreditation record identified. This is not a claim of non-accreditation.','2026-09-24'),
('ABSS INSTITUTE OF TECHNOLOGY, MEERUT,MEERUT','NO_VERIFIED_RECORD','Official NBA Accredited Programs search and available official-source review performed on 2026-09-24; no verified NBA accreditation record identified. This is not a claim of non-accreditation.','2026-09-24'),
('ACCURATE INSTITUTE OF MANAGEMENT & TECHNOLOGY,GAUTAM BUDDH NAGAR','NO_VERIFIED_RECORD','Official NBA Accredited Programs search and available official-source review performed on 2026-09-24; no verified NBA accreditation record identified. This is not a claim of non-accreditation.','2026-09-24'),
('Acharya Narendra Deva University of Agriculture & Technology, Kumarganj, Ayodhya','NO_VERIFIED_RECORD','Official NBA Accredited Programs search and available official-source review performed on 2026-09-24; no verified NBA accreditation record identified. This is not a claim of non-accreditation.','2026-09-24'),
('ADHUNIK COLLEGE OF ENGG.,GHAZIABAD','NO_VERIFIED_RECORD','Official NBA Accredited Programs search and available official-source review performed on 2026-09-24; no verified NBA accreditation record identified. This is not a claim of non-accreditation.','2026-09-24'),
('ALIGARH COLLEGE OF ENGG. & TECH,ALIGARH','NO_VERIFIED_RECORD','Official NBA Accredited Programs search and available official-source review performed on 2026-09-24; no verified NBA accreditation record identified. This is not a claim of non-accreditation.','2026-09-24'),
('ALLENHOUSE INSTITUTE OF TECHNOLOGY,KANPUR','NO_VERIFIED_RECORD','Official NBA Accredited Programs search and available official-source review performed on 2026-09-24; no verified NBA accreditation record identified. This is not a claim of non-accreditation.','2026-09-24'),
('AMANI GROUP OF INSTITUTIONS,AMROHA','NO_VERIFIED_RECORD','Official NBA Accredited Programs search and available official-source review performed on 2026-09-24; no verified NBA accreditation record identified. This is not a claim of non-accreditation.','2026-09-24'),
('AMBALIKA INSTITUTE OF MANAGEMENT & TECHNOLOGY,LUCKNOW','NO_VERIFIED_RECORD','Official NBA Accredited Programs search and available official-source review performed on 2026-09-24; no verified NBA accreditation record identified. This is not a claim of non-accreditation.','2026-09-24'),
('APEX INSTITUTE OF TECHNOLOGY,RAMPUR','NO_VERIFIED_RECORD','Official NBA Accredited Programs search and available official-source review performed on 2026-09-24; no verified NBA accreditation record identified. This is not a claim of non-accreditation.','2026-09-24'),
('APOLLO INSTITUTE OF TECHNOLOGY,KANPUR','NO_VERIFIED_RECORD','Official NBA Accredited Programs search and available official-source review performed on 2026-09-24; no verified NBA accreditation record identified. This is not a claim of non-accreditation.','2026-09-24'),
('ASHOKA INSTITUTE OF TECHNOLOGY & MANAGEMENT,VARANASI','NO_VERIFIED_RECORD','Official NBA Accredited Programs search and available official-source review performed on 2026-09-24; no verified NBA accreditation record identified. This is not a claim of non-accreditation.','2026-09-24'),
('AXIS INSTITUTE OF TECHNOLOGY & MANAGEMENT,KANPUR','NO_VERIFIED_RECORD','Official NBA Accredited Programs search and available official-source review performed on 2026-09-24; no verified NBA accreditation record identified. This is not a claim of non-accreditation.','2026-09-24'),
('B.S.A. COLLEGE OF ENGINEERING & TECHNOLOGY,MATHURA','NO_VERIFIED_RECORD','Official NBA Accredited Programs search and available official-source review performed on 2026-09-24; no verified NBA accreditation record identified. This is not a claim of non-accreditation.','2026-09-24'),
('Baba Shaheb (Dr.) B R Ambedkar College of Agricultural Engineering and Technology, Etawah (CSAUAT)','NO_VERIFIED_RECORD','Official NBA Accredited Programs search and available official-source review performed on 2026-09-24; no verified NBA accreditation record identified. This is not a claim of non-accreditation.','2026-09-24'),
('BABU BANARSI DAS INSTITUTE OF TECH.,GHAZIABAD','NO_VERIFIED_RECORD','Official NBA Accredited Programs search and available official-source review performed on 2026-09-24; no verified NBA accreditation record identified. This is not a claim of non-accreditation.','2026-09-24'),
('BABU SUNDER SINGH INSTITUTE OF TECHNOLOGY & MANAGEMENT,LUCKNOW','NO_VERIFIED_RECORD','Official NBA Accredited Programs search and available official-source review performed on 2026-09-24; no verified NBA accreditation record identified. This is not a claim of non-accreditation.','2026-09-24'),
('BHARAT RATNA BABA SAHEB BHIM RAO AMBEDKAR RAJKIYA ENGINEERING COLLEGE, PRATAPGARH','NO_VERIFIED_RECORD','Official NBA Accredited Programs search and available official-source review performed on 2026-09-24; no verified NBA accreditation record identified. This is not a claim of non-accreditation.','2026-09-24'),
('BHARAT RATNA SARDAR VALLABHBHAI PATEL RAJKIYA ENGINEERING COLLEGE, BASTI','NO_VERIFIED_RECORD','Official NBA Accredited Programs search and available official-source review performed on 2026-09-24; no verified NBA accreditation record identified. This is not a claim of non-accreditation.','2026-09-24'),
('Bundelkhand University, Jhansi','NO_VERIFIED_RECORD','Official NBA Accredited Programs search and available official-source review performed on 2026-09-24; no verified NBA accreditation record identified. This is not a claim of non-accreditation.','2026-09-24')
ON CONFLICT (uptac_institute) DO UPDATE SET research_status=EXCLUDED.research_status, notes=EXCLUDED.notes, last_checked=EXCLUDED.last_checked;

-- 2026-09-24 batch: 20 UPTAC institutes reviewed against official NBA records.
-- Verified NBA record found for CIPET Lucknow; no current verified record was found for the other names in this batch.
-- Absence from the search is NOT treated as proof of non-accreditation.
INSERT INTO accreditations
(institute_name, accreditation_type, accreditation_status, grade, program, validity, updated_year, source, valid_from, valid_until, source_url, last_verified)
VALUES
('Central Institute of Petrochemicals Engineering & Technology (Lucknow)','NBA','Accredited','','Manufacturing Technology','30-06-2025','2026','Official NBA Accredited Programs','2022-07-01','2025-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('Central Institute of Petrochemicals Engineering & Technology (Lucknow)','NBA','Accredited','','Plastics Engineering','30-06-2025','2026','Official NBA Accredited Programs','2022-07-01','2025-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24')
ON CONFLICT (institute_name, accreditation_type, program, validity) DO NOTHING;
INSERT INTO college_accreditation_map (uptac_institute,accreditation_institute,match_method,verified)
VALUES ('CENTRAL INSTITUTE OF PETROCHEMICALS ENGINEERING & TECHNOLOGY (CIPET), LUCKNOW','Central Institute of Petrochemicals Engineering & Technology (Lucknow)','official_nba_name_match',TRUE)
ON CONFLICT (uptac_institute) DO UPDATE SET accreditation_institute=EXCLUDED.accreditation_institute,match_method=EXCLUDED.match_method,verified=EXCLUDED.verified;
INSERT INTO accreditation_research_queue (uptac_institute,research_status,notes,last_checked)
VALUES ('CENTRAL INSTITUTE OF PETROCHEMICALS ENGINEERING & TECHNOLOGY (CIPET), LUCKNOW','NBA_VERIFIED','Official NBA Accredited Programs record verified on 2026-09-24; two UG programs accredited through 30-06-2025.','2026-09-24'),
('CENTRE FOR ADVANCE STUDIES,LUCKNOW','NO_VERIFIED_RECORD','Official NBA Accredited Programs search performed on 2026-09-24; no verified NBA accreditation record identified in the available search results. This is not a claim of non-accreditation.','2026-09-24'),
('CHAUDHARY BEERI SINGH COLLEGE OF ENGINEERING & MANAGEMENT,AGRA','NO_VERIFIED_RECORD','Official NBA Accredited Programs search performed on 2026-09-24; no verified NBA accreditation record identified in the available search results. This is not a claim of non-accreditation.','2026-09-24'),
('COLLEGE OF ENGG. & RURAL TECHNOLOGY,MEERUT','NO_VERIFIED_RECORD','Official NBA Accredited Programs search performed on 2026-09-24; no verified NBA accreditation record identified in the available search results. This is not a claim of non-accreditation.','2026-09-24'),
('D. D. U. Gorakhpur University, Gorakhpur','NO_VERIFIED_RECORD','Official NBA Accredited Programs search performed on 2026-09-24; no verified NBA accreditation record identified in the available search results. This is not a claim of non-accreditation.','2026-09-24'),
('DEEWAN V.S. INSTITUTE OF ENGINEERING & TECHNOLOGY, MEERUT,MEERUT','NO_VERIFIED_RECORD','Official NBA Accredited Programs search performed on 2026-09-24; no verified NBA accreditation record identified in the available search results. This is not a claim of non-accreditation.','2026-09-24'),
('DELHI INSTITUTE OF ENGINEERING & TECHNOLOGY,MEERUT','NO_VERIFIED_RECORD','Official NBA Accredited Programs search performed on 2026-09-24; no verified NBA accreditation record identified in the available search results. This is not a claim of non-accreditation.','2026-09-24'),
('DEV BHOOMI GROUP OF INSTITUTIONS,SAHARANPUR','NO_VERIFIED_RECORD','Official NBA Accredited Programs search performed on 2026-09-24; no verified NBA accreditation record identified in the available search results. This is not a claim of non-accreditation.','2026-09-24'),
('Dr. Bhim Rao Ambedkar University, Agra','NO_VERIFIED_RECORD','Official NBA Accredited Programs search performed on 2026-09-24; no verified NBA accreditation record identified in the available search results. This is not a claim of non-accreditation.','2026-09-24'),
('DR. K.N. MODI INSTITUTE OF ENGG. & TECHNOLOGY,GHAZIABAD','NO_VERIFIED_RECORD','Official NBA Accredited Programs search performed on 2026-09-24; no verified NBA accreditation record identified in the available search results. This is not a claim of non-accreditation.','2026-09-24'),
('Dr. Rammanohar Lohia Avadh University, Faizabad','NO_VERIFIED_RECORD','Official NBA Accredited Programs search performed on 2026-09-24; no verified NBA accreditation record identified in the available search results. This is not a claim of non-accreditation.','2026-09-24'),
('DR. RIZVI COLLEGE OF ENGINEERING,,KAUSHAMBI','NO_VERIFIED_RECORD','Official NBA Accredited Programs search performed on 2026-09-24; no verified NBA accreditation record identified in the available search results. This is not a claim of non-accreditation.','2026-09-24'),
('Dr. Shakuntala Misra National Rehabilitation University, Lucknow','NO_VERIFIED_RECORD','Official NBA Accredited Programs search performed on 2026-09-24; no verified NBA accreditation record identified in the available search results. This is not a claim of non-accreditation.','2026-09-24'),
('DR. VIRENDRA SWARUP MEMORIAL TRUST GROUP OF INSTITUTIONS,UNNAO','NO_VERIFIED_RECORD','Official NBA Accredited Programs search performed on 2026-09-24; no verified NBA accreditation record identified in the available search results. This is not a claim of non-accreditation.','2026-09-24'),
('DR.AMBEDKAR INSTITUTE OF TECHNOLOGY FOR DIVYANGJAN, U.P., KANPUR','NO_VERIFIED_RECORD','Official NBA Accredited Programs search performed on 2026-09-24; no verified NBA accreditation record identified in the available search results. This is not a claim of non-accreditation.','2026-09-24'),
('DR.M.C.SAXENA COLLEGE OF ENGG. & TECHNOLOGY,LUCKNOW','NO_VERIFIED_RECORD','Official NBA Accredited Programs search performed on 2026-09-24; no verified NBA accreditation record identified in the available search results. This is not a claim of non-accreditation.','2026-09-24'),
('ESHAN COLLEGE OF ENGINEERING,MATHURA','NO_VERIFIED_RECORD','Official NBA Accredited Programs search performed on 2026-09-24; no verified NBA accreditation record identified in the available search results. This is not a claim of non-accreditation.','2026-09-24'),
('FACULTY OF ENGG, AGRA COLLEGE,AGRA','NO_VERIFIED_RECORD','Official NBA Accredited Programs search performed on 2026-09-24; no verified NBA accreditation record identified in the available search results. This is not a claim of non-accreditation.','2026-09-24'),
('FACULTY OF ENGINEERING SHANTI NIKETAN TRUST''S GROUP OF INSTITUTIONS,MEERUT','NO_VERIFIED_RECORD','Official NBA Accredited Programs search performed on 2026-09-24; no verified NBA accreditation record identified in the available search results. This is not a claim of non-accreditation.','2026-09-24'),
('FEROZE GANDHI INSTITUTE OF ENGG AND TECHNOLOGY, RAIBAREILLY','NO_VERIFIED_RECORD','Official NBA Accredited Programs search performed on 2026-09-24; no verified NBA accreditation record identified in the available search results. This is not a claim of non-accreditation.','2026-09-24')
ON CONFLICT (uptac_institute) DO UPDATE SET research_status=EXCLUDED.research_status,notes=EXCLUDED.notes,last_checked=EXCLUDED.last_checked;

-- 2026-09-24 batch: next 20 UPTAC institutes reviewed.
-- Accreditation records already verified in earlier batches are referenced here; no duplicate accreditation periods are inserted.
INSERT INTO accreditation_research_queue (uptac_institute,research_status,notes,last_checked)
VALUES
('ABES ENGG.COLLEGE,GHAZIABAD','NBA_VERIFIED','ABES Engineering College has verified NBA-accredited programs in the official NBA database; current/historical periods are retained in the accreditation dataset.','2026-09-24'),
('ABES INSTITUTE OF TECHNOLOGY,GHAZIABAD','NBA_VERIFIED','ABES Institute of Technology has verified NBA-accredited CSE, ECE and IT records in the official NBA database.','2026-09-24'),
('AJAY KUMAR GARG ENGG. COLLEGE,GHAZIABAD','NBA_VERIFIED','Official NBA database verifies accreditation records for AKGEC programs; historical periods are retained.','2026-09-24'),
('B.B.S.COLLEGE OF ENGGINERING AND TECHNOLOGY,ALLAHABAD','NBA_VERIFIED','Official NBA records in the project dataset verify historical NBA accreditation for B.B.S. College programs.','2026-09-24'),
('B.N.COLLEGE OF ENGINEERING & TECHNOLOGY(BNCET),LUCKNOW','NBA_VERIFIED','Official NBA disclosure verifies the CSE accreditation period recorded in the project dataset.','2026-09-24'),
('BABU BANARASI DAS INSTITUTE OF TECHNOLOGY AND MANAGEMENT, LUCKNOW','NBA_VERIFIED','Official NBA database verifies CSE, ECE and IT accreditation through 30-06-2026.','2026-09-24'),
('BABU BANARASI DAS NORTHERN INDIA INSTITUTE OF TECHNOLOGY,LUCKNOW','NBA_VERIFIED','Official NBA database verifies CSE and IT accreditation through 30-06-2026.','2026-09-24'),
('BANSAL INSTITUTE OF ENGINEERING & TECHNOLOGY,LUCKNOW','NBA_VERIFIED','Official NBA disclosure verifies IT accreditation and the project dataset retains additional historical program records.','2026-09-24'),
('BHAGWANT INSTITUTE OF TECHNOLOGY,MUZAFFARNAGAR','NBA_VERIFIED','Official NBA records in the project dataset verify historical program accreditation.','2026-09-24'),
('BHARAT INSTITUTE OF TECHNOLOGY,MEERUT','NBA_VERIFIED','Official NBA records in the project dataset verify historical ECE, Electrical & Electronics, CSE, IT and Mechanical accreditation.','2026-09-24'),
('BUDDHA INSTITUTE OF TECHNOLOGY,GORAKHPUR','NBA_VERIFIED','Official NBA record verifies CSE accreditation through 30-06-2027.','2026-09-24'),
('BUNDELKHAND INSTITUTE OF ENGINEERING & TECHNOLOGY,JHANSI','NBA_VERIFIED','Official NBA records verify historical CSE, Civil and Chemical Engineering accreditation.','2026-09-24'),
('DRONACHARYA GROUP OF INSTITUTIONS,GAUTAM BUDDH NAGAR','NBA_VERIFIED','Official NBA record verifies Computer Science & Engineering accreditation through 30-06-2027.','2026-09-24'),
('FACULTY OF ENGINEERING SHANTI NIKETAN TRUST''S GROUP OF INSTITUTIONS,MEERUT','NO_VERIFIED_RECORD','Official NBA search did not identify a verified accreditation record for this exact UPTAC institute name; this is not a claim of non-accreditation.','2026-09-24'),
('FIT ENGINEERING COLLEGE,MEERUT','NO_VERIFIED_RECORD','Official NBA search did not identify a verified accreditation record for this exact UPTAC institute name; this is not a claim of non-accreditation.','2026-09-24'),
('G.C.R.G. MEMORIAL TRUST''S GROUP OF INSTITUTIONS, FACULTY OF ENGINEERING,LUCKNOW','NO_VERIFIED_RECORD','Official NBA search did not identify a verified accreditation record for this exact UPTAC institute name; this is not a claim of non-accreditation.','2026-09-24'),
('G.L. BAJAJ INSTITUTE OF TECHNOLOGY & MANAGEMENT,GAUTAM BUDDH NAGAR','NBA_VERIFIED','Official NBA database verifies multiple GL Bajaj program records; historical periods are retained.','2026-09-24'),
('G.L.BAJAJ GROUP OF INSTITUTIONS,MATHURA','NO_VERIFIED_RECORD','Official NBA search did not identify a verified accreditation record for this exact Mathura institute name; this is not a claim of non-accreditation.','2026-09-24'),
('GALGOTIA''S COLLEGE OF ENGG. & TECHNOLOGY,GAUTAM BUDDH NAGAR','NBA_VERIFIED','Official NBA record verifies ECE accreditation through 30-06-2027.','2026-09-24'),
('GLOBAL INSTITUTE OF INFORMATION TECHNOLOGY,GAUTAM BUDDH NAGAR','NO_VERIFIED_RECORD','Official NBA search did not identify a verified accreditation record for this exact UPTAC institute name; this is not a claim of non-accreditation.','2026-09-24')
ON CONFLICT (uptac_institute) DO UPDATE SET research_status=EXCLUDED.research_status,notes=EXCLUDED.notes,last_checked=EXCLUDED.last_checked;

-- 2026-09-24 batch: additional official-source verification.
INSERT INTO accreditations
(institute_name, accreditation_type, accreditation_status, grade, program, validity, updated_year, source, valid_from, valid_until, source_url, last_verified)
VALUES
('Greater Noida Institute of Technology (GNIOT)','NBA','Accredited','','Computer Science and Engineering','','2026','Official GNIOT accreditation status','2025-12-31',NULL,'https://mail.gniot.net.in/accreditation-status.php','2026-09-24'),
('Greater Noida Institute of Technology (GNIOT)','NBA','Accredited','','Electronics and Communication Engineering','','2026','Official GNIOT accreditation status','2025-12-31',NULL,'https://mail.gniot.net.in/accreditation-status.php','2026-09-24'),
('Greater Noida Institute of Technology (GNIOT)','NBA','Accredited','','Information Technology','','2026','Official GNIOT accreditation status','2025-12-31',NULL,'https://mail.gniot.net.in/accreditation-status.php','2026-09-24'),
('IMS Engineering College (Ghaziabad)','NBA','Accredited','','Information Technology','30-06-2027','2026','Official IMS Engineering College','2024-07-01','2027-06-30','https://imsec.ac.in/about/about-imsec','2026-09-24')
ON CONFLICT (institute_name, accreditation_type, program, validity) DO NOTHING;

INSERT INTO college_accreditation_map (uptac_institute,accreditation_institute,match_method,verified)
VALUES
('GREATER NOIDA INSTITUTE OF TECHNOLOGY,GAUTAM BUDDH NAGAR','Greater Noida Institute of Technology (GNIOT)','official_institute_source',TRUE),
('I.M.S. ENGINEERING COLLEGE,GHAZIABAD','IMS Engineering College (Ghaziabad)','official_institute_source',TRUE)
ON CONFLICT (uptac_institute) DO UPDATE SET accreditation_institute=EXCLUDED.accreditation_institute,match_method=EXCLUDED.match_method,verified=EXCLUDED.verified;

INSERT INTO accreditation_research_queue (uptac_institute,research_status,notes,last_checked)
VALUES
('GREATER NOIDA INSTITUTE OF TECHNOLOGY,GAUTAM BUDDH NAGAR','NBA_VERIFIED','Official GNIOT accreditation page states NBA accreditation for CSE, EC and IT, obtained for three years from 31-12-2025. End date not independently stated on the source, so valid_until is left NULL.','2026-09-24'),
('I.M.S. ENGINEERING COLLEGE,GHAZIABAD','NBA_VERIFIED','Official IMS Engineering College source states Information Technology is NBA accredited up to 2027; recorded through 30-06-2027.','2026-09-24'),
('I.I.M.T. ENGG. COLLEGE,MEERUT','NO_VERIFIED_RECORD','Official IIMT Engineering College accreditation-status document states current no branch is accredited; historical CSE/IT/EC and Mechanical records are listed, but no current accreditation is claimed.','2026-09-24'),
('I.T.S. ENGG.COLLEGE,GAUTAM BUDDH NAGAR','NBA_VERIFIED','Official ITS Engineering College site confirms NBA accreditation, but the retrieved source does not specify program-level validity dates; no dates inferred.','2026-09-24'),
('HINDUSTAN COLLEGE OF SCIENCE & TECHNOLOGY,MATHURA','NBA_VERIFIED','Official HCST site states 12 NBA-accredited courses, but the retrieved page does not provide program-level validity dates; no dates inferred.','2026-09-24')
ON CONFLICT (uptac_institute) DO UPDATE SET research_status=EXCLUDED.research_status,notes=EXCLUDED.notes,last_checked=EXCLUDED.last_checked;

-- 2026-09-24 batch: 20 UPTAC institutes reviewed against official NBA/institute sources.

INSERT INTO accreditations
(institute_name, accreditation_type, accreditation_status, grade, program, validity, updated_year, source, valid_from, valid_until, source_url, last_verified)
VALUES
('Galgotias College of Engineering & Technology (Greater Noida)','NBA','Accredited','','Electronics & Communication Engineering','30-06-2027','2026','Official NBA accreditation letter','2024-07-01','2027-06-30','https://galgotiacollege.edu/public/uploads/all/4105/B.Tech-%28ECE%29-Accreditation-Letter-2025.pdf','2026-09-24'),
('Goel Institute of Technology & Management (Lucknow)','NBA','Accredited','','Computer Science & Engineering','30-06-2026','2026','Official NBA RTI disclosure','2023-07-01','2026-06-30','https://nbaind.org/files/rti/docs/4.5.8%20%28d%29.pdf','2026-09-24'),
('Indian Institute of Carpet Technology (Bhadohi)','NBA','Accredited','','Carpet & Textile Technology','30-06-2025','2026','Official NBA accreditation letter','2022-07-01','2025-06-30','https://www.iict.ac.in/NBA_Accreditation_2022-2025.pdf','2026-09-24')
ON CONFLICT (institute_name, accreditation_type, program, validity) DO NOTHING;

INSERT INTO college_accreditation_map (uptac_institute,accreditation_institute,match_method,verified)
VALUES
('GALGOTIA''S COLLEGE OF ENGG. & TECHNOLOGY,GAUTAM BUDDH NAGAR','Galgotias College of Engineering & Technology (Greater Noida)','official_nba_name_match',TRUE),
('GOEL INSTITUTE OF TECHNOLOGY & MANAGEMENT,LUCKNOW','Goel Institute of Technology & Management (Lucknow)','official_nba_name_match',TRUE),
('INDIAN INSTITUTE OF CARPET TECHNOLOGY,BHADOHI','Indian Institute of Carpet Technology (Bhadohi)','official_nba_name_match',TRUE),
('INSTITUTE OF ENGINEERING & TECHNOLOGY,LUCKNOW','Institute of Engineering & Technology (Lucknow)','official_institute_source',TRUE)
ON CONFLICT (uptac_institute) DO UPDATE SET accreditation_institute=EXCLUDED.accreditation_institute,match_method=EXCLUDED.match_method,verified=EXCLUDED.verified;

INSERT INTO accreditation_research_queue (uptac_institute,research_status,notes,last_checked)
VALUES
('FACULTY OF ENGINEERING SHANTI NIKETAN TRUST''S GROUP OF INSTITUTIONS,MEERUT','NO_VERIFIED_RECORD','No verified NBA accreditation record identified for the exact UPTAC institute name in the available official NBA search; not a claim of non-accreditation.','2026-09-24'),
('G.C.R.G. MEMORIAL TRUST''S GROUP OF INSTITUTIONS, FACULTY OF ENGINEERING,LUCKNOW','NO_VERIFIED_RECORD','No verified NBA accreditation record identified for the exact UPTAC institute name in the available official NBA search; not a claim of non-accreditation.','2026-09-24'),
('GALGOTIA''S COLLEGE OF ENGG. & TECHNOLOGY,GAUTAM BUDDH NAGAR','NBA_VERIFIED','Official NBA accreditation letter verifies Electronics & Communication Engineering for academic years 2024-25 through 2026-27, valid to 30-06-2027.','2026-09-24'),
('GOEL INSTITUTE OF TECHNOLOGY & MANAGEMENT,LUCKNOW','NBA_VERIFIED','Official NBA RTI disclosure verifies Computer Science & Engineering, 3 years w.e.f. 01-07-2023, accredited fresh.','2026-09-24'),
('GOKARAN NARVADESHWAR INSTITUTE OF TECHNOLOGY & MANAGEMENT,BARABANKI','NO_VERIFIED_RECORD','No verified NBA accreditation record identified for the exact UPTAC institute name in the available official NBA search; not a claim of non-accreditation.','2026-09-24'),
('HARDAYAL TECHNICAL CAMPUS,MATHURA','NO_VERIFIED_RECORD','No verified NBA accreditation record identified for the exact UPTAC institute name in the available official NBA search; not a claim of non-accreditation.','2026-09-24'),
('HI-TECH. INSTITUTE OF ENGINEERING &TECHNOLOGY,GHAZIABAD','NO_VERIFIED_RECORD','No verified NBA accreditation record identified for the exact UPTAC institute name in the available official NBA search; not a claim of non-accreditation.','2026-09-24'),
('HIMALAYAN INSTITUTE OF TECHNOLOGY & MANAGEMENT,LUCKNOW','NO_VERIFIED_RECORD','No verified NBA accreditation record identified for the exact UPTAC institute name in the available official NBA search; not a claim of non-accreditation.','2026-09-24'),
('HMFA MEMORIAL INSTITUTE OF ENGINEERING & TECHNOLOGY,ALLAHABAD','NO_VERIFIED_RECORD','No verified NBA accreditation record identified for the exact UPTAC institute name in the available official NBA search; not a claim of non-accreditation.','2026-09-24'),
('I.E.C. COLLEGE OF ENGINEERING & TECHNOLOGY,GAUTAM BUDDH NAGAR','NO_VERIFIED_RECORD','No verified NBA accreditation record identified for the exact UPTAC institute name in the available official NBA search; not a claim of non-accreditation.','2026-09-24'),
('IIMT COLLEGE OF ENGINEERING,GAUTAM BUDDH NAGAR','NO_VERIFIED_RECORD','Official NBA search result for the institute did not show an accredited program; available result indicated Visit Scheduled rather than Accredited, so it was not marked accredited.','2026-09-24'),
('INDERPRASTHA ENGG. COLLEGE,GHAZIABAD','NO_VERIFIED_RECORD','No verified NBA accreditation record identified for the exact UPTAC institute name in the available official NBA search; not a claim of non-accreditation.','2026-09-24'),
('INDIAN INSTITUTE OF CARPET TECHNOLOGY,BHADOHI','NBA_VERIFIED','Official NBA accreditation letter verifies UG Carpet & Textile Technology for academic years 2022-23 through 2024-25, valid to 30-06-2025.','2026-09-24'),
('INDIAN INSTITUTE OF HANDLOOM TECHNOLOGY,VARANASI','NO_VERIFIED_RECORD','No verified NBA accreditation record identified for the exact UPTAC institute name in the available official NBA search; not a claim of non-accreditation.','2026-09-24'),
('INDRAPRASTHA INSTITUTE OF MANAGEMENT & TECHNOLOGY,SAHARANPUR','NO_VERIFIED_RECORD','No verified NBA accreditation record identified for the exact UPTAC institute name in the available official NBA search; not a claim of non-accreditation.','2026-09-24'),
('INSTITUTE OF ENGG. & RURAL TECHNOLOGY,ALLAHABAD','NO_VERIFIED_RECORD','Official institute sources confirm AICTE approval and AKTU affiliation, but no verified NBA accreditation record was identified in the available official NBA search.','2026-09-24'),
('INSTITUTE OF ENGINEERING & TECHNOLOGY,LUCKNOW','NBA_VERIFIED','Official IET Lucknow material states that its Computer Science & Engineering department/program is NBA accredited.','2026-09-24'),
('INSTITUTE OF ENGINEERING & TECHNOLOGY,SITAPUR','NO_VERIFIED_RECORD','No verified NBA accreditation record identified for the exact UPTAC institute name in the available official NBA search; not a claim of non-accreditation.','2026-09-24'),
('INSTITUTE OF TECHNOLOGY & MANAGEMENT,ALIGARH','NO_VERIFIED_RECORD','No verified NBA accreditation record identified for the exact UPTAC institute name in the available official NBA search; not a claim of non-accreditation.','2026-09-24'),
('INSTITUTE OF TECHNOLOGY & MANAGEMENT,GORAKHPUR','NO_VERIFIED_RECORD','Official institute source confirms AICTE approval and AKTU affiliation, but no verified NBA accreditation record was identified in the available official NBA search.','2026-09-24')
ON CONFLICT (uptac_institute) DO UPDATE SET research_status=EXCLUDED.research_status,notes=EXCLUDED.notes,last_checked=EXCLUDED.last_checked;

-- 2026-09-24 batch: 20 UPTAC institutes reviewed against official NBA/institute sources.
INSERT INTO accreditation_research_queue (uptac_institute,research_status,notes,last_checked)
VALUES
('FACULTY OF ENGINEERING SHANTI NIKETAN TRUST''S GROUP OF INSTITUTIONS,MEERUT','NO_VERIFIED_RECORD','No verified NBA record for the exact UPTAC institute name found in available official NBA results; not a claim of non-accreditation.','2026-09-24'),
('G.C.R.G. MEMORIAL TRUST''S GROUP OF INSTITUTIONS, FACULTY OF ENGINEERING,LUCKNOW','NO_VERIFIED_RECORD','No verified NBA record for the exact UPTAC institute name found in available official NBA results; not a claim of non-accreditation.','2026-09-24'),
('GALGOTIA''S COLLEGE OF ENGG. & TECHNOLOGY,GAUTAM BUDDH NAGAR','NBA_VERIFIED','Official NBA accreditation for ECE through 30-06-2027 was verified; existing accreditation record retained.','2026-09-24'),
('INSTITUTE OF TECHNOLOGY & MANAGEMENT,LUCKNOW','NO_VERIFIED_RECORD','No verified NBA record for the exact UPTAC institute name found in available official NBA results.','2026-09-24'),
('INSTITUTE OF TECHNOLOGY & MANAGEMENT,MAHARAJGANJ','NO_VERIFIED_RECORD','No verified NBA record for the exact UPTAC institute name found in available official NBA results.','2026-09-24'),
('ISABELLA THOBURN COLLEGE (PROFESSIONAL STUDIES),LUCKNOW','NO_VERIFIED_RECORD','No verified NBA engineering accreditation record found for the exact institute/program in available official NBA results.','2026-09-24'),
('J.P..INSTITUTE OF ENGINEERING & TECHNOLOGY,MEERUT','NO_VERIFIED_RECORD','No verified NBA accreditation record identified for the exact UPTAC institute name in available official NBA results.','2026-09-24'),
('J.S.S. ACADEMY OF TECHNICAL EDUCATION,GAUTAM BUDDH NAGAR','NBA_VERIFIED','Official NBA RTI disclosure verifies ECE and CSE, 3 years w.e.f. 01-07-2023; existing JSS historical records retained.','2026-09-24'),
('JAHANGIRABAD EDUCATIONAL TRUST''S GROUP OF INSTITUTIONS, FACULTY OF ENGINEERING,BARABANKI','NO_VERIFIED_RECORD','No verified NBA accreditation record identified for the exact UPTAC institute name in available official NBA results.','2026-09-24'),
('JMS GROUP OF INSTITUTIONS,GHAZIABAD','NO_VERIFIED_RECORD','No verified NBA accreditation record identified for the exact UPTAC institute name in available official NBA results.','2026-09-24'),
('JMS INSTITUTE OF TECHNOLOGY, GHAZIABAD','NO_VERIFIED_RECORD','Official JMS/AICTE sources confirm the institute and programs, but no NBA accreditation record was verified.','2026-09-24'),
('KALICHARAN NIGAM INSTITUTE OF TECHNOLOGY,BANDA','NO_VERIFIED_RECORD','No verified NBA accreditation record identified for the exact UPTAC institute name in available official NBA results.','2026-09-24'),
('KAMLA NEHRU INSTITUTE OF PHYSICAL & SOCIAL SCIENCES,SULTANPUR','NO_VERIFIED_RECORD','No verified NBA accreditation record identified for the exact UPTAC institute name in available official NBA results.','2026-09-24'),
('KAMLA NEHRU INSTITUTE OF TECHNOLOGY,SULTANPUR','NBA_VERIFIED','Official NBA database verifies Electrical Engineering through 30-06-2027 and historical Civil Engineering through 30-06-2024.','2026-09-24'),
('KANPUR INSTITUTE OF TECHNOLOGY,KANPUR','NO_VERIFIED_RECORD','Official institute self-study material references accreditation processes but does not establish a specific verified NBA accreditation program/date in the retrieved source.','2026-09-24'),
('KASHI INSTITUTE OF TECHNOLOGY,VARANASI','NO_VERIFIED_RECORD','Official institute sources confirm AICTE/AKTU status; no specific NBA engineering program/date was verified from the retrieved official sources.','2026-09-24'),
('KCC INSTITUTE OF TECHNOLOGY & MANAGEMENT,GAUTAM BUDDH NAGAR','NBA_VERIFIED','Official KCC source states Computer Science & Engineering is NBA accredited; no validity date was stated in the retrieved official source.','2026-09-24'),
('KCMT CAMPUS 2 PREM PRAKASH GUPTA INSTITUTE OF ENGINEERING,BAREILLY','NO_VERIFIED_RECORD','No verified NBA accreditation record identified for the exact UPTAC institute name in available official NBA results.','2026-09-24'),
('Khwaja Moinuddin Chishti Language University, Lucknow','NO_VERIFIED_RECORD','No verified NBA engineering accreditation record identified for the exact university/program in available official NBA results.','2026-09-24'),
('KIET GROUP OF INSTITUTIONS(KRISHNA INSTT. OF ENGG. & TECHNOLOGY),GHAZIABAD','NBA_VERIFIED','Official KIET/NBA material states eligible engineering programs are NBA accredited; existing program-level records are retained.','2026-09-24')
ON CONFLICT (uptac_institute) DO UPDATE SET research_status=EXCLUDED.research_status,notes=EXCLUDED.notes,last_checked=EXCLUDED.last_checked;
COMMIT;
