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

-- Additional verified institutes from the same official NBA database pass.\nINSERT INTO accreditations\n(institute_name, accreditation_type, accreditation_status, grade, program, validity, updated_year, source, valid_from, valid_until, source_url, last_verified)\nVALUES\n('B.B.S.COLLEGE OF ENGG.AND TECHNOLOGY (ALLAHABAD)','NBA','Accredited','','Mechanical Engineering','19-07-2011','2026','Official NBA','2008-07-19','2011-07-18','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),\n('B.B.S.COLLEGE OF ENGG.AND TECHNOLOGY (ALLAHABAD)','NBA','Accredited','','Electronics and Communication Engineering','19-07-2011','2026','Official NBA','2008-07-19','2011-07-18','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),\n('BHAGWANT INSTITUTE OF TECHNOLOGY (Muzaffar Nagar)','NBA','Accredited','','Mechanical Engineering','19-07-2011','2026','Official NBA','2008-07-19','2011-07-18','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),\n('BHAGWANT INSTITUTE OF TECHNOLOGY (Muzaffar Nagar)','NBA','Accredited','','Electronics and Communication Engineering','19-07-2011','2026','Official NBA','2008-07-19','2011-07-18','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),\n('BHAGWANT INSTITUTE OF TECHNOLOGY (Muzaffar Nagar)','NBA','Accredited','','Computer Science and Engineering','19-07-2011','2026','Official NBA','2008-07-19','2011-07-18','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),\n('AZAD INSTITUTE OF ENGINEERING & TECHNOLOGY (Lucknow)','NBA','Accredited','','Computer Science and Engineering','12-09-2010','2026','Official NBA','2007-09-12','2010-09-11','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),\n('AZAD INSTITUTE OF ENGINEERING & TECHNOLOGY (Lucknow)','NBA','Accredited','','Electrical Engineering','12-09-2010','2026','Official NBA','2007-09-12','2010-09-11','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),\n('AZAD INSTITUTE OF ENGINEERING & TECHNOLOGY (Lucknow)','NBA','Accredited','','Electronics Engineering','12-09-2010','2026','Official NBA','2007-09-12','2010-09-11','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),\n('AZAD INSTITUTE OF ENGINEERING & TECHNOLOGY (Lucknow)','NBA','Accredited','','Mechanical Engineering','12-09-2010','2026','Official NBA','2007-09-12','2010-09-11','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),\n('AZAD INSTITUTE OF ENGINEERING & TECHNOLOGY (Lucknow)','NBA','Accredited','','Electronics and Instrumentation Engineering','19-07-2011','2026','Official NBA','2008-07-19','2011-07-18','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),\n('AZAD INSTITUTE OF ENGINEERING & TECHNOLOGY (Lucknow)','NBA','Accredited','','Information Technology','10-02-2012','2026','Official NBA','2009-02-10','2012-02-09','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),\n('BHARAT INSTITUTE OF TECHNOLOGY (MEERUT)','NBA','Accredited','','Electronics and Communication Engineering','16-03-2010','2026','Official NBA','2007-03-16','2010-03-15','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),\n('BHARAT INSTITUTE OF TECHNOLOGY (MEERUT)','NBA','Accredited','','Electrical and Electronics Engineering','16-03-2010','2026','Official NBA','2007-03-16','2010-03-15','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),\n('BHARAT INSTITUTE OF TECHNOLOGY (MEERUT)','NBA','Accredited','','Computer Science and Engineering','16-03-2010','2026','Official NBA','2007-03-16','2010-03-15','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),\n('BHARAT INSTITUTE OF TECHNOLOGY (MEERUT)','NBA','Accredited','','Information Technology','16-03-2010','2026','Official NBA','2007-03-16','2010-03-15','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),\n('BHARAT INSTITUTE OF TECHNOLOGY (MEERUT)','NBA','Accredited','','Mechanical Engineering','15-03-2015','2026','Official NBA','2012-03-15','2015-03-14','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24')\nON CONFLICT (institute_name, accreditation_type, program, validity) DO NOTHING;\n\nINSERT INTO college_accreditation_map (uptac_institute, accreditation_institute, match_method, verified) VALUES\n('B.B.S.COLLEGE OF ENGGINERING AND TECHNOLOGY,ALLAHABAD','B.B.S.COLLEGE OF ENGG.AND TECHNOLOGY (ALLAHABAD)','official_nba_name_match',TRUE),\n('BHAGWANT INSTITUTE OF TECHNOLOGY,MUZAFFARNAGAR','BHAGWANT INSTITUTE OF TECHNOLOGY (Muzaffar Nagar)','official_nba_name_match',TRUE),\n('AZAD INSTITUTE OF ENGINEERING & TECHNOLOGY,LUCKNOW','AZAD INSTITUTE OF ENGINEERING & TECHNOLOGY (Lucknow)','official_nba_name_match',TRUE),\n('BHARAT INSTITUTE OF TECHNOLOGY,MEERUT','BHARAT INSTITUTE OF TECHNOLOGY (MEERUT)','official_nba_name_match',TRUE)\nON CONFLICT (uptac_institute) DO UPDATE SET accreditation_institute=EXCLUDED.accreditation_institute, match_method=EXCLUDED.match_method, verified=EXCLUDED.verified;\n\nUPDATE accreditation_research_queue SET research_status='NBA_VERIFIED', notes='Official NBA Accredited Programs record verified on 2026-09-24.', last_checked=CURRENT_DATE WHERE uptac_institute IN (\n'B.B.S.COLLEGE OF ENGGINERING AND TECHNOLOGY,ALLAHABAD','BHAGWANT INSTITUTE OF TECHNOLOGY,MUZAFFARNAGAR','AZAD INSTITUTE OF ENGINEERING & TECHNOLOGY,LUCKNOW','BHARAT INSTITUTE OF TECHNOLOGY,MEERUT');\n\nCOMMIT;
