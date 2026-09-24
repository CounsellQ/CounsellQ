-- CounsellQ bulk accreditation research batch
-- Source checked: official NBA Accredited Programs database on 2026-09-24.
-- This batch adds only records directly supported by the official NBA source.
-- NBA accreditation is program-level; no institution-wide inference is made.

BEGIN;

-- Ajay Kumar Garg Engineering College
INSERT INTO accreditations
(institute_name, accreditation_type, accreditation_status, grade, program, validity, updated_year, source, valid_from, valid_until, source_url, last_verified)
VALUES
('Ajay Kumar Garg Engineering College (Ghaziabad)','NBA','Accredited','','Computer Science and Engineering','30-06-2025','2026','Official NBA','2022-07-01','2025-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('Ajay Kumar Garg Engineering College (Ghaziabad)','NBA','Accredited','','Information Technology','30-06-2025','2026','Official NBA','2022-07-01','2025-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('Ajay Kumar Garg Engineering College (Ghaziabad)','NBA','Accredited','','Electrical & Electronics Engineering','30-06-2025','2026','Official NBA','2022-07-01','2025-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('Ajay Kumar Garg Engineering College (Ghaziabad)','NBA','Accredited','','Electronics & Communication Engineering','30-06-2025','2026','Official NBA','2022-07-01','2025-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('Ajay Kumar Garg Engineering College (Ghaziabad)','NBA','Accredited','','Mechanical Engineering','30-06-2025','2026','Official NBA','2022-07-01','2025-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),

-- B.N. College of Engineering & Technology
('B. N. College of Engineering and Technology (BNCET) (Lucknow)','NBA','Accredited','','Computer Science and Engineering','30-06-2024','2026','Official NBA','2021-07-01','2024-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),

-- Bansal Institute of Engineering and Technology
('BANSAL INSTITUTE OF ENGINEERING AND TECHNOLOGY (Lucknow)','NBA','Accredited','','Information Technology','30/06/2027','2026','Official NBA','2024-07-01','2027-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('BANSAL INSTITUTE OF ENGINEERING AND TECHNOLOGY (Lucknow)','NBA','Accredited','','Biotechnology','30-06-2028','2026','Official NBA','2025-07-01','2028-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('BANSAL INSTITUTE OF ENGINEERING AND TECHNOLOGY (Lucknow)','NBA','Accredited','','Electrical Engineering','30-06-2028','2026','Official NBA','2025-07-01','2028-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),

-- Buddha Institute of Technology
('BUDDHA INSTITUTE OF TECHNOLOGY GORAKHPUR (Gorakpur)','NBA','Accredited','','Computer Science and Engineering','30/06/2027','2026','Official NBA','2024-07-01','2027-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),

-- Bundelkhand Institute of Engineering & Technology
('Bundelkhand Institute of Engineering & Technology Jhansi (Jhansi)','NBA','Accredited','','Computer Science and Engineering','30-06-2024','2026','Official NBA','2021-07-01','2024-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('Bundelkhand Institute of Engineering & Technology Jhansi (Jhansi)','NBA','Accredited','','Civil Engineering','30-06-2024','2026','Official NBA','2021-07-01','2024-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('Bundelkhand Institute of Engineering & Technology Jhansi (Jhansi)','NBA','Accredited','','Chemical Engineering','30-06-2023','2026','Official NBA','2020-07-01','2023-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),

-- IET Lucknow
('INSTITUTE OF ENGINEERING & TECHNOLOGY LUCKNOW (LUCKNOW)','NBA','Accredited','','Civil Engineering','30/06/2025','2026','Official NBA','2022-07-01','2025-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('INSTITUTE OF ENGINEERING & TECHNOLOGY LUCKNOW (LUCKNOW)','NBA','Accredited','','Computer Science and Engineering','30/06/2025','2026','Official NBA','2022-07-01','2025-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('INSTITUTE OF ENGINEERING & TECHNOLOGY LUCKNOW (LUCKNOW)','NBA','Accredited','','Electrical Engineering','30/06/2025','2026','Official NBA','2022-07-01','2025-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('INSTITUTE OF ENGINEERING & TECHNOLOGY LUCKNOW (LUCKNOW)','NBA','Accredited','','Electronics & Communication Engineering','30/06/2025','2026','Official NBA','2022-07-01','2025-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),
('INSTITUTE OF ENGINEERING & TECHNOLOGY LUCKNOW (LUCKNOW)','NBA','Accredited','','Mechanical Engineering','30/06/2025','2026','Official NBA','2022-07-01','2025-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24'),

-- Integral University
('Integral University (Lucknow)','NBA','Accredited','','Computer Science and Engineering','30/06/2028','2026','Official NBA','2025-07-01','2028-06-30','https://www.nbaind.org/accreditationprogram/AccreditedProgram','2026-09-24')

ON CONFLICT (institute_name, accreditation_type, program, validity) DO NOTHING;

INSERT INTO college_accreditation_map (uptac_institute, accreditation_institute, match_method, verified)
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

COMMIT;
