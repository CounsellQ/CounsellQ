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

COMMIT;
