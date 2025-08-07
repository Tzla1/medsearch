-- ================================================
-- MIGRACIÓN SIMPLIFICADA: Tabla Doctors
-- Archivo: 003_create_doctors_simple.sql
-- Propósito: Información profesional de médicos
-- Enfoque: Minimalista según requisitos Semana 2 (3-4 tablas)
-- ================================================

-- Eliminar tabla si existe (para testing)
DROP TABLE IF EXISTS doctors;

-- Crear tabla doctors simplificada
CREATE TABLE doctors (
    -- Identificador único
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Relación con usuario (un médico es un usuario)
    user_id INT NOT NULL,
    
    -- Relación con especialidad
    specialty_id INT NOT NULL,
    
    -- Información profesional básica
    license_number VARCHAR(50) UNIQUE NOT NULL,
    bio TEXT,
    experience_years INT DEFAULT 0,
    
    -- Información de consulta
    consultation_fee DECIMAL(10,2) DEFAULT 0.00,
    
    -- Ubicación básica
    address VARCHAR(255),
    city VARCHAR(100),
    
    -- Sistema de calificaciones simplificado
    rating_avg DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    
    -- Estado de verificación
    is_verified BOOLEAN DEFAULT FALSE,
    
    -- Campos de auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Relaciones foráneas
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (specialty_id) REFERENCES specialties(id) ON DELETE RESTRICT,
    
    -- Índices para optimización
    INDEX idx_user_id (user_id),
    INDEX idx_specialty_id (specialty_id),
    INDEX idx_city (city),
    INDEX idx_rating (rating_avg DESC),
    INDEX idx_verified (is_verified),
    INDEX idx_city_specialty (city, specialty_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar médicos de prueba (relacionados con users existentes)
INSERT INTO doctors (user_id, specialty_id, license_number, bio, experience_years, consultation_fee, address, city, rating_avg, total_reviews, is_verified) VALUES

-- Dr. Roberto Martínez - Cardiólogo (user_id = 4)
(4, 1, 'MED-CARD-001', 
 'Cardiólogo con especialización en cardiología intervencionista. Experiencia en cateterismos y angioplastias. Comprometido con la prevención cardiovascular.',
 15, 800.00, 'Av. Revolución 1234, Col. San Ángel', 'Ciudad de México', 4.8, 127, TRUE),

-- Dra. Ana García - Pediatra (user_id = 5)
(5, 2, 'MED-PED-002',
 'Pediatra especializada en desarrollo infantil y medicina preventiva. Atención integral desde recién nacidos hasta adolescentes.',
 10, 600.00, 'Calle Insurgentes 567, Col. Roma Norte', 'Ciudad de México', 4.9, 95, TRUE),

-- Dr. Luis Rodríguez - Dermatólogo (user_id = 6)
(6, 3, 'MED-DERM-003',
 'Dermatólogo con subespecialidad en dermatología cosmética. Tratamientos médicos y estéticos de la piel.',
 8, 750.00, 'Av. Paseo de la Reforma 890, Col. Polanco', 'Ciudad de México', 4.7, 203, TRUE),

-- Dra. Carmen Fernández - Neuróloga (user_id = 7)
(7, 4, 'MED-NEURO-004',
 'Neuróloga especializada en trastornos del movimiento y epilepsia. Atención integral de enfermedades neurológicas.',
 12, 900.00, 'Av. Universidad 1111, Col. Del Valle', 'Ciudad de México', 4.9, 156, TRUE),

-- Dr. Diego Morales - Medicina General (user_id = 8)
(8, 14, 'MED-GEN-005',
 'Médico general con enfoque en medicina familiar. Primera consulta y seguimiento integral de pacientes adultos.',
 5, 400.00, 'Calle Madero 234, Col. Centro', 'Ciudad de México', 4.6, 89, TRUE);

-- Insertar algunos médicos adicionales para testing
INSERT INTO doctors (user_id, specialty_id, license_number, bio, experience_years, consultation_fee, address, city, rating_avg, total_reviews, is_verified) 
SELECT 
    u.id as user_id,
    (FLOOR(RAND() * 15) + 1) as specialty_id,  -- Especialidad aleatoria
    CONCAT('MED-', LPAD(u.id, 3, '0'), '-', FLOOR(RAND() * 1000)) as license_number,
    'Médico especialista comprometido con brindar atención de calidad.' as bio,
    FLOOR(RAND() * 20) + 1 as experience_years,  -- 1-20 años
    (FLOOR(RAND() * 500) + 300) as consultation_fee,  -- $300-800
    CONCAT('Av. Principal ', FLOOR(RAND() * 2000), ', Col. ', CASE FLOOR(RAND() * 4) 
        WHEN 0 THEN 'Centro'
        WHEN 1 THEN 'Norte'
        WHEN 2 THEN 'Sur'
        ELSE 'Polanco'
    END) as address,
    'Ciudad de México' as city,
    ROUND((RAND() * 2) + 3, 1) as rating_avg,  -- 3.0-5.0
    FLOOR(RAND() * 200) + 10 as total_reviews,  -- 10-210 reviews
    TRUE as is_verified
FROM users u 
WHERE u.user_type = 'doctor' 
AND u.id NOT IN (4, 5, 6, 7, 8)  -- Excluir los ya insertados manualmente
LIMIT 10;

-- Verificar inserción y mostrar estadísticas
SELECT 
    COUNT(*) as total_doctores,
    COUNT(CASE WHEN is_verified = TRUE THEN 1 END) as verificados,
    ROUND(AVG(rating_avg), 2) as rating_promedio,
    ROUND(AVG(consultation_fee), 2) as tarifa_promedio
FROM doctors;

-- Mostrar médicos por especialidad
SELECT 
    s.name as especialidad,
    COUNT(d.id) as num_doctores,
    ROUND(AVG(d.rating_avg), 2) as rating_promedio,
    ROUND(AVG(d.consultation_fee), 2) as tarifa_promedio
FROM doctors d
JOIN specialties s ON d.specialty_id = s.id
WHERE d.is_verified = TRUE
GROUP BY s.id, s.name
ORDER BY num_doctores DESC;

-- Vista de médicos con información completa (para testing)
SELECT 
    d.id,
    CONCAT(u.first_name, ' ', u.last_name) as nombre_completo,
    s.name as especialidad,
    d.experience_years as experiencia,
    d.consultation_fee as tarifa,
    d.city as ciudad,
    d.rating_avg as rating,
    d.total_reviews as reviews,
    d.is_verified as verificado
FROM doctors d
JOIN users u ON d.user_id = u.id
JOIN specialties s ON d.specialty_id = s.id
ORDER BY d.rating_avg DESC, d.total_reviews DESC
LIMIT 10;

-- Comentarios para documentación
-- Esta tabla contiene toda la información profesional específica de los médicos
-- Se relaciona con users (información personal) y specialties (área médica)
-- Incluye sistema básico de calificaciones y verificación
-- Los índices están optimizados para búsquedas por especialidad, ciudad y rating