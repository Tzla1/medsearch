-- Limpiar datos existentes para reinicialización
DELETE FROM specialties;
ALTER TABLE specialties AUTO_INCREMENT = 1;

-- ===============================================================
-- MEDICINA GENERAL Y FAMILIAR
-- ===============================================================
INSERT INTO specialties (name, description, category, display_order, is_popular, color_code, search_keywords) VALUES
(
    'Medicina General', 
    'Atención médica integral para toda la familia, diagnóstico y tratamiento de enfermedades comunes',
    'Medicina General', 
    1, 
    TRUE, 
    '#2E8B57',
    'medicina general, medico familiar, doctor general, consulta general'
),
(
    'Medicina Familiar', 
    'Especialidad enfocada en la atención continua e integral de individuos y familias',
    'Medicina General', 
    2, 
    TRUE, 
    '#228B22',
    'medicina familiar, doctor familia, medico familia'
),

-- ===============================================================
-- ESPECIALIDADES CLÍNICAS PRINCIPALES
-- ===============================================================
(
    'Cardiología', 
    'Diagnóstico y tratamiento de enfermedades del corazón y sistema cardiovascular',
    'Medicina Especializada', 
    10, 
    TRUE, 
    '#DC143C',
    'cardiologo, corazon, cardiaco, hipertension, arritmia'
),
(
    'Dermatología', 
    'Diagnóstico y tratamiento de enfermedades de la piel, cabello y uñas',
    'Medicina Especializada', 
    11, 
    TRUE, 
    '#DDA0DD',
    'dermatologo, piel, acne, manchas, dermatitis'
),
(
    'Endocrinología', 
    'Diagnóstico y tratamiento de trastornos hormonales y metabólicos',
    'Medicina Especializada', 
    12, 
    TRUE, 
    '#4169E1',
    'endocrinologo, diabetes, tiroides, hormonas'
),
(
    'Gastroenterología', 
    'Diagnóstico y tratamiento de enfermedades del sistema digestivo',
    'Medicina Especializada', 
    13, 
    TRUE, 
    '#FF8C00',
    'gastroenterologo, estomago, intestino, colitis, gastritis'
),
(
    'Neurología', 
    'Diagnóstico y tratamiento de enfermedades del sistema nervioso',
    'Medicina Especializada', 
    14, 
    TRUE, 
    '#800080',
    'neurologo, cerebro, migraña, epilepsia, alzheimer'
),
(
    'Neumología', 
    'Diagnóstico y tratamiento de enfermedades respiratorias',
    'Medicina Especializada', 
    15, 
    TRUE, 
    '#87CEEB',
    'neumologo, pulmones, asma, tos, respiratorio'
),
(
    'Psiquiatría', 
    'Diagnóstico y tratamiento de trastornos mentales y emocionales',
    'Salud Mental', 
    16, 
    TRUE, 
    '#6A5ACD',
    'psiquiatra, depresion, ansiedad, bipolar, mental'
),

-- ===============================================================
-- ESPECIALIDADES QUIRÚRGICAS
-- ===============================================================
(
    'Cirugía General', 
    'Procedimientos quirúrgicos diversos del abdomen, tejidos blandos y trauma',
    'Cirugía', 
    20, 
    TRUE, 
    '#B22222',
    'cirugia general, operacion, quirofano'
),
(
    'Cirugía Plástica y Reconstructiva', 
    'Cirugía estética y reconstructiva de tejidos y órganos',
    'Cirugía', 
    21, 
    TRUE, 
    '#FF69B4',
    'cirugia plastica, estetica, reconstructiva'
),
(
    'Cirugía Cardiovascular', 
    'Procedimientos quirúrgicos del corazón y grandes vasos',
    'Cirugía', 
    22, 
    FALSE, 
    '#8B0000',
    'cirugia cardiaca, corazon, bypass'
),
(
    'Neurocirugía', 
    'Cirugía especializada del sistema nervioso central y periférico',
    'Cirugía', 
    23, 
    FALSE, 
    '#4B0082',
    'neurocirugia, cerebro, tumor cerebral'
),
(
    'Ortopedia y Traumatología', 
    'Diagnóstico y tratamiento de lesiones del sistema musculoesquelético',
    'Cirugía', 
    24, 
    TRUE, 
    '#8B4513',
    'ortopedia, huesos, fracturas, traumatologo'
),

-- ===============================================================
-- ESPECIALIDADES MATERNO-INFANTILES
-- ===============================================================
(
    'Pediatría', 
    'Atención médica especializada para niños desde el nacimiento hasta la adolescencia',
    'Pediatría', 
    30, 
    TRUE, 
    '#FF6347',
    'pediatra, niños, bebes, vacunas'
),
(
    'Neonatología', 
    'Cuidado médico especializado de recién nacidos y prematuros',
    'Pediatría', 
    31, 
    FALSE, 
    '#FFB6C1',
    'neonatologo, recien nacidos, prematuro'
),
(
    'Ginecología', 
    'Diagnóstico y tratamiento de enfermedades del sistema reproductivo femenino',
    'Salud de la Mujer', 
    32, 
    TRUE, 
    '#FF1493',
    'ginecologo, mujer, menstruacion, ovarios'
),
(
    'Obstetricia', 
    'Atención médica durante el embarazo, parto y puerperio',
    'Salud de la Mujer', 
    33, 
    TRUE, 
    '#DA70D6',
    'obstetra, embarazo, parto, prenatal'
),

-- ===============================================================
-- ESPECIALIDADES DIAGNÓSTICAS
-- ===============================================================
(
    'Radiología e Imagen', 
    'Diagnóstico por imágenes médicas: rayos X, tomografía, resonancia magnética',
    'Diagnóstico', 
    40, 
    FALSE, 
    '#708090',
    'radiologo, rayos x, tomografia, resonancia'
),
(
    'Patología', 
    'Diagnóstico de enfermedades mediante análisis de tejidos y fluidos corporales',
    'Diagnóstico', 
    41, 
    FALSE, 
    '#2F4F4F',
    'patologo, biopsia, laboratorio'
),
(
    'Medicina Nuclear', 
    'Diagnóstico y tratamiento usando radioisótopos',
    'Diagnóstico', 
    42, 
    FALSE, 
    '#696969',
    'medicina nuclear, gammagrafia'
),

-- ===============================================================
-- ESPECIALIDADES DE APOYO Y REHABILITACIÓN
-- ===============================================================
(
    'Anestesiología', 
    'Manejo del dolor y anestesia en procedimientos médicos y quirúrgicos',
    'Apoyo Médico', 
    50, 
    FALSE, 
    '#000080',
    'anestesiologo, anestesia, dolor'
),
(
    'Medicina de Urgencias', 
    'Atención médica de emergencia y cuidados intensivos',
    'Apoyo Médico', 
    51, 
    TRUE, 
    '#FF0000',
    'urgencias, emergencias, trauma'
),
(
    'Medicina Física y Rehabilitación', 
    'Restauración de la función física después de lesiones o enfermedades',
    'Rehabilitación', 
    52, 
    TRUE, 
    '#32CD32',
    'rehabilitacion, fisiatria, terapia fisica'
),
(
    'Geriatría', 
    'Atención médica especializada para adultos mayores',
    'Medicina Especializada', 
    53, 
    TRUE, 
    '#DAA520',
    'geriatra, adulto mayor, tercera edad'
),

-- ===============================================================
-- ESPECIALIDADES COMPLEMENTARIAS
-- ===============================================================
(
    'Medicina del Deporte', 
    'Prevención y tratamiento de lesiones relacionadas con actividad física',
    'Medicina Especializada', 
    60, 
    TRUE, 
    '#00FF00',
    'medicina deportiva, lesiones deportivas'
),
(
    'Medicina del Trabajo', 
    'Prevención y tratamiento de enfermedades ocupacionales',
    'Medicina Especializada', 
    61, 
    FALSE, 
    '#808000',
    'medicina laboral, salud ocupacional'
),
(
    'Nutrición y Dietética', 
    'Evaluación nutricional y planes alimentarios terapéuticos',
    'Medicina Especializada', 
    62, 
    TRUE, 
    '#90EE90',
    'nutriologo, dieta, obesidad, nutricion'
),
(
    'Psicología Clínica', 
    'Evaluación y tratamiento psicológico de trastornos mentales',
    'Salud Mental', 
    63, 
    TRUE, 
    '#9370DB',
    'psicologo, terapia, counseling'
);

-- ===============================================================
-- ACTUALIZAR CONTADOR DE AUTO_INCREMENT
-- ===============================================================
ALTER TABLE specialties AUTO_INCREMENT = 100;

-- ===============================================================
-- CREAR ÍNDICES ESPECIALIZADOS PARA BÚSQUEDA
-- ===============================================================
CREATE FULLTEXT INDEX idx_specialties_search 
ON specialties(name, search_keywords, description);

-- ===============================================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- ===============================================================
SELECT 
    category,
    COUNT(*) as total_specialties,
    SUM(CASE WHEN is_popular = TRUE THEN 1 ELSE 0 END) as popular_count
FROM specialties 
GROUP BY category 
ORDER BY category;