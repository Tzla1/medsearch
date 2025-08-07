-- ===================================================================
-- DATOS SEMILLA - MÉDICOS DE EJEMPLO
-- ===================================================================
-- Perfiles médicos realistas para desarrollo y demostración
-- Incluye datos geográficos de Zona Metropolitana de Guadalajara
-- ===================================================================

-- Limpiar datos existentes para reinicialización
DELETE FROM reviews;
DELETE FROM appointments;
DELETE FROM user_favorites;
DELETE FROM doctors;
DELETE FROM users WHERE user_type = 'doctor' OR user_type = 'patient';

-- ===============================================================
-- USUARIOS BASE PARA PACIENTES DE EJEMPLO
-- ===============================================================
INSERT INTO users (
    email, password, first_name, last_name, phone, 
    date_of_birth, gender, address, city, state, 
    zip_code, user_type, is_active, email_verified
) VALUES
-- Paciente 1
(
    'paciente1@example.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8J3CQ4L1dSkJlA5.3S2', -- Password: Patient123!
    'Juan', 'Pérez', '5533-111-2222',
    '1985-05-20', 'M', 
    'Calle Hidalgo 123, Col. Centro',
    'Guadalajara', 'Jalisco', '44100',
    'patient', TRUE, TRUE
),
-- Paciente 2
(
    'paciente2@example.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8J3CQ4L1dSkJlA5.3S2',
    'María', 'González', '5533-222-3333',
    '1990-08-15', 'F',
    'Av. Chapultepec 456, Col. Americana',
    'Guadalajara', 'Jalisco', '44160',
    'patient', TRUE, TRUE
),
-- Paciente 3
(
    'paciente3@example.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8J3CQ4L1dSkJlA5.3S2',
    'Roberto', 'Martínez', '5533-333-4444',
    '1978-12-03', 'M',
    'Calle Juárez 789, Col. San Juan de Dios',
    'Guadalajara', 'Jalisco', '44360',
    'patient', TRUE, TRUE
);

-- ===============================================================
-- USUARIOS BASE PARA MÉDICOS DE EJEMPLO
-- ===============================================================
INSERT INTO users (
    email, password, first_name, last_name, phone, 
    date_of_birth, gender, address, city, state, 
    zip_code, user_type, is_active, email_verified
) VALUES
-- Dr. María García - Medicina General
(
    'dra.maria.garcia@medsearch.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8J3CQ4L1dSkJlA5.3S2', -- Password: Doctor123!
    'María Elena', 'García Hernández', '5533-123-4567',
    '1975-03-15', 'F', 
    'Av. López Mateos Norte 755, Col. Jardines del Bosque',
    'Guadalajara', 'Jalisco', '44520',
    'doctor', TRUE, TRUE
),
-- Dr. José Martínez - Cardiología
(
    'dr.jose.martinez@medsearch.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8J3CQ4L1dSkJlA5.3S2',
    'José Antonio', 'Martínez López', '5533-567-8901',
    '1968-11-22', 'M',
    'Av. Empresarios 150, Col. Puerta de Hierro',
    'Zapopan', 'Jalisco', '45116',
    'doctor', TRUE, TRUE
),
-- Dra. Ana López - Dermatología
(
    'dra.ana.lopez@medsearch.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8J3CQ4L1dSkJlA5.3S2',
    'Ana Sofía', 'López Ramírez', '5533-234-5678',
    '1982-07-08', 'F',
    'Av. Niños Héroes 3001, Col. Jardines del Bosque',
    'Guadalajara', 'Jalisco', '44510',
    'doctor', TRUE, TRUE
),
-- Dr. Carlos Rodríguez - Pediatría
(
    'dr.carlos.rodriguez@medsearch.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8J3CQ4L1dSkJlA5.3S2',
    'Carlos Eduardo', 'Rodríguez Silva', '5533-345-6789',
    '1979-09-12', 'M',
    'Av. Patria 1201, Col. Lomas del Valle',
    'Zapopan', 'Jalisco', '45129',
    'doctor', TRUE, TRUE
),
-- Dra. Patricia Morales - Ginecología
(
    'dra.patricia.morales@medsearch.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8J3CQ4L1dSkJlA5.3S2',
    'Patricia', 'Morales González', '5533-456-7890',
    '1973-04-25', 'F',
    'Av. Americas 1500, Col. Providencia',
    'Guadalajara', 'Jalisco', '44630',
    'doctor', TRUE, TRUE
);

-- ===============================================================
-- PERFILES MÉDICOS PROFESIONALES
-- ===============================================================
INSERT INTO doctors (
    user_id, license_number, specialty_id, years_of_experience, 
    education, hospital_affiliations, consultation_fee, currency,
    available_hours, accepts_insurance, insurance_types,
    office_address, office_city, office_state, office_zip_code,
    latitude, longitude, office_phone, emergency_phone,
    rating, total_reviews, is_verified, is_accepting_patients
) VALUES
-- Dra. María García - Medicina General
(
    (SELECT id FROM users WHERE email = 'dra.maria.garcia@medsearch.com'),
    'MED-GDL-001-2010', 
    (SELECT id FROM specialties WHERE name = 'Medicina General'),
    15,
    'Universidad de Guadalajara - Facultad de Medicina (2000-2006). Residencia en Medicina Familiar - Hospital Civil de Guadalajara (2006-2009)',
    'Hospital Civil de Guadalajara Fray Antonio Alcalde, Hospital Ángeles del Carmen',
    650.00, 'MXN',
    '[
        {"day":"Monday","startTime":"08:00","endTime":"14:00","lunchBreakStart":"11:00","lunchBreakEnd":"11:30"},
        {"day":"Tuesday","startTime":"08:00","endTime":"14:00","lunchBreakStart":"11:00","lunchBreakEnd":"11:30"},
        {"day":"Wednesday","startTime":"08:00","endTime":"14:00","lunchBreakStart":"11:00","lunchBreakEnd":"11:30"},
        {"day":"Thursday","startTime":"08:00","endTime":"14:00","lunchBreakStart":"11:00","lunchBreakEnd":"11:30"},
        {"day":"Friday","startTime":"08:00","endTime":"13:00"},
        {"day":"Saturday","startTime":"09:00","endTime":"13:00"}
    ]',
    TRUE, '["IMSS","ISSSTE","Seguros Monterrey","AXA Seguros"]',
    'Av. López Mateos Norte 755, Consultorio 304, Col. Jardines del Bosque',
    'Guadalajara', 'Jalisco', '44520',
    20.6737777, -103.3496092,
    '5533-334-4444', '5533-334-4445',
    4.7, 89, TRUE, TRUE
),
-- Dr. José Martínez - Cardiología
(
    (SELECT id FROM users WHERE email = 'dr.jose.martinez@medsearch.com'),
    'CARD-GDL-005-2015',
    (SELECT id FROM specialties WHERE name = 'Cardiología'),
    17,
    'UNAM - Facultad de Medicina (1995-2001). Especialidad en Medicina Interna - Hospital General de México (2001-2005). Subespecialidad en Cardiología - Instituto Nacional de Cardiología (2005-2007)',
    'Hospital Puerta de Hierro Sur, Hospital Country 2000, Instituto Jalisciense de Cardiología',
    1800.00, 'MXN',
    '[
        {"day":"Monday","startTime":"09:00","endTime":"17:00","lunchBreakStart":"13:30","lunchBreakEnd":"14:30"},
        {"day":"Tuesday","startTime":"09:00","endTime":"17:00","lunchBreakStart":"13:30","lunchBreakEnd":"14:30"},
        {"day":"Wednesday","startTime":"09:00","endTime":"17:00","lunchBreakStart":"13:30","lunchBreakEnd":"14:30"},
        {"day":"Thursday","startTime":"09:00","endTime":"17:00","lunchBreakStart":"13:30","lunchBreakEnd":"14:30"},
        {"day":"Friday","startTime":"09:00","endTime":"15:00"}
    ]',
    TRUE, '["IMSS","ISSSTE","GNP","AXA Seguros","Seguros Monterrey","Allianz"]',
    'Av. Empresarios 150, Torre Médica, Piso 8, Consultorio 804',
    'Zapopan', 'Jalisco', '45116',
    20.6668208, -103.4370937,
    '5533-555-6666', '5533-555-6667',
    4.9, 156, TRUE, TRUE
),
-- Dra. Ana López - Dermatología
(
    (SELECT id FROM users WHERE email = 'dra.ana.lopez@medsearch.com'),
    'DERM-GDL-012-2018',
    (SELECT id FROM specialties WHERE name = 'Dermatología'),
    8,
    'Universidad Autónoma de Guadalajara - Medicina (2008-2014). Especialidad en Dermatología - Hospital General Dr. Manuel Gea González, CDMX (2015-2018)',
    'Hospital San Javier, Centro Médico Puerta de Hierro',
    1200.00, 'MXN',
    '[
        {"day":"Monday","startTime":"10:00","endTime":"19:00","lunchBreakStart":"14:00","lunchBreakEnd":"15:30"},
        {"day":"Tuesday","startTime":"10:00","endTime":"19:00","lunchBreakStart":"14:00","lunchBreakEnd":"15:30"},
        {"day":"Wednesday","startTime":"10:00","endTime":"19:00","lunchBreakStart":"14:00","lunchBreakEnd":"15:30"},
        {"day":"Thursday","startTime":"10:00","endTime":"19:00","lunchBreakStart":"14:00","lunchBreakEnd":"15:30"},
        {"day":"Friday","startTime":"10:00","endTime":"17:00"},
        {"day":"Saturday","startTime":"09:00","endTime":"14:00"}
    ]',
    TRUE, '["IMSS","Seguros Monterrey","Metlife","Plan Seguro"]',
    'Av. Niños Héroes 3001, Edificio Médico, Consultorio 205',
    'Guadalajara', 'Jalisco', '44510',
    20.6411204, -103.2926694,
    '5533-777-8888', NULL,
    4.6, 73, TRUE, TRUE
),
-- Dr. Carlos Rodríguez - Pediatría
(
    (SELECT id FROM users WHERE email = 'dr.carlos.rodriguez@medsearch.com'),
    'PED-GDL-008-2012',
    (SELECT id FROM specialties WHERE name = 'Pediatría'),
    12,
    'Universidad de Guadalajara - Medicina (2003-2009). Residencia en Pediatría - Hospital Civil Juan I. Menchaca (2009-2012)',
    'Hospital Civil Juan I. Menchaca, Hospital Ángeles del Carmen, Clínica Pediátrica del Country',
    850.00, 'MXN',
    '[
        {"day":"Monday","startTime":"08:30","endTime":"15:30","lunchBreakStart":"12:00","lunchBreakEnd":"13:00"},
        {"day":"Tuesday","startTime":"08:30","endTime":"15:30","lunchBreakStart":"12:00","lunchBreakEnd":"13:00"},
        {"day":"Wednesday","startTime":"08:30","endTime":"15:30","lunchBreakStart":"12:00","lunchBreakEnd":"13:00"},
        {"day":"Thursday","startTime":"08:30","endTime":"15:30","lunchBreakStart":"12:00","lunchBreakEnd":"13:00"},
        {"day":"Friday","startTime":"08:30","endTime":"14:00"},
        {"day":"Saturday","startTime":"09:00","endTime":"13:00"}
    ]',
    TRUE, '["IMSS","ISSSTE","Seguros Monterrey","GNP"]',
    'Av. Patria 1201, Plaza Médica Lomas, Consultorio 302',
    'Zapopan', 'Jalisco', '45129',
    20.7319346, -103.4103505,
    '5533-888-9999', '5533-888-9990',
    4.8, 124, TRUE, TRUE
),
-- Dra. Patricia Morales - Ginecología
(
    (SELECT id FROM users WHERE email = 'dra.patricia.morales@medsearch.com'),
    'GIN-GDL-003-2008',
    (SELECT id FROM specialties WHERE name = 'Ginecología'),
    16,
    'Universidad de Guadalajara - Medicina (1995-2001). Especialidad en Ginecología y Obstetricia - Hospital Civil de Guadalajara (2001-2005)',
    'Hospital Real San José, Hospital San Javier, Maternidad La Luz',
    1400.00, 'MXN',
    '[
        {"day":"Monday","startTime":"09:30","endTime":"18:00","lunchBreakStart":"13:00","lunchBreakEnd":"14:30"},
        {"day":"Tuesday","startTime":"09:30","endTime":"18:00","lunchBreakStart":"13:00","lunchBreakEnd":"14:30"},
        {"day":"Wednesday","startTime":"09:30","endTime":"18:00","lunchBreakStart":"13:00","lunchBreakEnd":"14:30"},
        {"day":"Thursday","startTime":"09:30","endTime":"18:00","lunchBreakStart":"13:00","lunchBreakEnd":"14:30"},
        {"day":"Friday","startTime":"09:30","endTime":"16:00"}
    ]',
    TRUE, '["IMSS","ISSSTE","AXA Seguros","GNP","Seguros Monterrey"]',
    'Av. Americas 1500, Torre Médica Providencia, Piso 6, Consultorio 605',
    'Guadalajara', 'Jalisco', '44630',
    20.6767233, -103.3724473,
    '5533-999-0000', '5533-999-0001',
    4.5, 67, TRUE, TRUE
);

-- ===============================================================
-- RESEÑAS REALISTAS PARA MÉDICOS DE EJEMPLO
-- ===============================================================
INSERT INTO reviews (
    patient_id, doctor_id, rating, review_title, review_text,
    punctuality_rating, communication_rating, professionalism_rating, facility_rating,
    is_verified, is_anonymous
) VALUES
-- Reseñas para Dra. María García
(
    (SELECT id FROM users WHERE email = 'paciente1@example.com'),
    (SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'dra.maria.garcia@medsearch.com')),
    5, 'Excelente atención médica',
    'La Dra. García es muy profesional y empática. Me explicó detalladamente mi diagnóstico y el tratamiento. Definitivamente la recomiendo.',
    5, 5, 5, 4, TRUE, FALSE
),
-- Reseñas para Dr. José Martínez
(
    (SELECT id FROM users WHERE email = 'paciente2@example.com'),
    (SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'dr.jose.martinez@medsearch.com')),
    5, 'El mejor cardiólogo de Guadalajara',
    'El Dr. Martínez salvó mi vida. Su experiencia y conocimiento son extraordinarios. Las instalaciones son de primera clase.',
    5, 5, 5, 5, TRUE, FALSE
),
-- Reseñas para Dra. Ana López
(
    (SELECT id FROM users WHERE email = 'paciente3@example.com'),
    (SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'dra.ana.lopez@medsearch.com')),
    4, 'Muy buena dermatóloga',
    'Excelente diagnóstico para mi problema de acné. El tratamiento ha funcionado muy bien. Consultorio moderno y limpio.',
    4, 5, 5, 5, TRUE, FALSE
);

-- ===============================================================
-- ACTUALIZAR ESTADÍSTICAS DE MÉDICOS
-- ===============================================================
-- Llamar procedimiento para recalcular ratings
CALL UpdateDoctorRating((SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'dra.maria.garcia@medsearch.com')));
CALL UpdateDoctorRating((SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'dr.jose.martinez@medsearch.com')));
CALL UpdateDoctorRating((SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'dra.ana.lopez@medsearch.com')));

-- ===============================================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- ===============================================================
SELECT 
    CONCAT(u.first_name, ' ', u.last_name) as doctor_name,
    s.name as specialty,
    d.office_city,
    d.consultation_fee,
    d.rating,
    d.total_reviews,
    d.is_verified,
    d.is_accepting_patients
FROM doctors d
INNER JOIN users u ON d.user_id = u.id
INNER JOIN specialties s ON d.specialty_id = s.id
ORDER BY s.name, u.last_name;