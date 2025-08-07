-- ================================================
-- SETUP COMPLETO BASE DE DATOS SIMPLIFICADA
-- Med Search Platform - Versión Semana 2
-- ================================================

-- Configurar charset y collation por defecto
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS med_search_platform 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE med_search_platform;

-- ================================================
-- LIMPIEZA: Eliminar tablas existentes (orden correcto)
-- ================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS specialties;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- ================================================
-- CREACIÓN DE TABLAS EN ORDEN CORRECTO
-- ================================================

-- Tabla 1: USERS (Base para todos los usuarios)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(15),
    user_type ENUM('patient', 'doctor') DEFAULT 'patient',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_user_type (user_type),
    INDEX idx_fullname (first_name, last_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla 2: SPECIALTIES (Catálogo de especialidades)
CREATE TABLE specialties (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_class VARCHAR(50) DEFAULT 'medical-icon',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla 3: DOCTORS (Información profesional de médicos)
CREATE TABLE doctors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    specialty_id INT NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    bio TEXT,
    experience_years INT DEFAULT 0,
    consultation_fee DECIMAL(10,2) DEFAULT 0.00,
    address VARCHAR(255),
    city VARCHAR(100),
    rating_avg DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (specialty_id) REFERENCES specialties(id) ON DELETE RESTRICT,
    
    INDEX idx_user_id (user_id),
    INDEX idx_specialty_id (specialty_id),
    INDEX idx_city (city),
    INDEX idx_rating (rating_avg DESC),
    INDEX idx_verified (is_verified),
    INDEX idx_search_main (specialty_id, city, rating_avg DESC, is_verified),
    INDEX idx_fee_range (consultation_fee, is_verified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- DATOS INICIALES: ESPECIALIDADES
-- ================================================

INSERT INTO specialties (name, description, icon_class) VALUES
('Cardiología', 'Especialistas en enfermedades del corazón y sistema cardiovascular', 'icon-heart'),
('Pediatría', 'Atención médica especializada para bebés, niños y adolescentes', 'icon-child'),
('Dermatología', 'Diagnóstico y tratamiento de enfermedades de la piel', 'icon-skin'),
('Neurología', 'Especialistas en trastornos del sistema nervioso', 'icon-brain'),
('Ginecología', 'Salud del sistema reproductivo femenino', 'icon-female'),
('Oftalmología', 'Especialistas en enfermedades y cirugía de los ojos', 'icon-eye'),
('Traumatología', 'Tratamiento de lesiones del sistema musculoesquelético', 'icon-bone'),
('Psiquiatría', 'Diagnóstico y tratamiento de trastornos mentales', 'icon-mind'),
('Endocrinología', 'Especialistas en trastornos hormonales y metabólicos', 'icon-hormone'),
('Gastroenterología', 'Enfermedades del aparato digestivo', 'icon-stomach'),
('Medicina General', 'Atención médica integral y primera consulta', 'icon-stethoscope'),
('Odontología', 'Salud bucodental y tratamientos dentales', 'icon-tooth');

-- ================================================
-- DATOS INICIALES: USUARIOS DE PRUEBA
-- ================================================

INSERT INTO users (email, password_hash, first_name, last_name, phone, user_type) VALUES
-- Pacientes de prueba
('paciente1@test.com', '$2b$10$samplehash1', 'Juan', 'Pérez', '555-0101', 'patient'),
('paciente2@test.com', '$2b$10$samplehash2', 'María', 'González', '555-0102', 'patient'),
('paciente3@test.com', '$2b$10$samplehash3', 'Carlos', 'López', '555-0103', 'patient'),

-- Médicos de prueba
('dr.martinez@test.com', '$2b$10$samplehash4', 'Roberto', 'Martínez', '555-0201', 'doctor'),
('dra.garcia@test.com', '$2b$10$samplehash5', 'Ana', 'García', '555-0202', 'doctor'),
('dr.rodriguez@test.com', '$2b$10$samplehash6', 'Luis', 'Rodríguez', '555-0203', 'doctor'),
('dra.fernandez@test.com', '$2b$10$samplehash7', 'Carmen', 'Fernández', '555-0204', 'doctor'),
('dr.morales@test.com', '$2b$10$samplehash8', 'Diego', 'Morales', '555-0205', 'doctor'),
('dra.silva@test.com', '$2b$10$samplehash9', 'Patricia', 'Silva', '555-0206', 'doctor'),
('dr.torres@test.com', '$2b$10$samplehash10', 'Miguel', 'Torres', '555-0207', 'doctor');

-- ================================================
-- DATOS INICIALES: MÉDICOS CON INFORMACIÓN PROFESIONAL
-- ================================================

INSERT INTO doctors (user_id, specialty_id, license_number, bio, experience_years, consultation_fee, address, city, rating_avg, total_reviews, is_verified) VALUES

-- Dr. Roberto Martínez - Cardiólogo
(4, 1, 'MED-CARD-001', 
 'Cardiólogo intervencionista con 15 años de experiencia. Especialista en cateterismos y prevención cardiovascular.',
 15, 800.00, 'Av. Revolución 1234, Col. San Ángel', 'Ciudad de México', 4.8, 127, TRUE),

-- Dra. Ana García - Pediatra
(5, 2, 'MED-PED-002',
 'Pediatra especializada en desarrollo infantil. Atención integral desde recién nacidos hasta adolescentes.',
 10, 600.00, 'Calle Insurgentes 567, Col. Roma Norte', 'Ciudad de México', 4.9, 95, TRUE),

-- Dr. Luis Rodríguez - Dermatólogo
(6, 3, 'MED-DERM-003',
 'Dermatólogo con subespecialidad en dermatología cosmética y oncológica.',
 8, 750.00, 'Av. Paseo de la Reforma 890, Col. Polanco', 'Ciudad de México', 4.7, 203, TRUE),

-- Dra. Carmen Fernández - Neuróloga
(7, 4, 'MED-NEURO-004',
 'Neuróloga especializada en trastornos del movimiento y epilepsia.',
 12, 900.00, 'Av. Universidad 1111, Col. Del Valle', 'Ciudad de México', 4.9, 156, TRUE),

-- Dr. Diego Morales - Medicina General
(8, 11, 'MED-GEN-005',
 'Médico general con enfoque en medicina familiar y preventiva.',
 5, 400.00, 'Calle Madero 234, Col. Centro', 'Ciudad de México', 4.6, 89, TRUE),

-- Dra. Patricia Silva - Ginecóloga
(9, 5, 'MED-GIN-006',
 'Ginecóloga especializada en medicina reproductiva y salud femenina.',
 7, 650.00, 'Av. Chapultepec 456, Col. Condesa', 'Ciudad de México', 4.8, 134, TRUE),

-- Dr. Miguel Torres - Oftalmólogo
(10, 6, 'MED-OFT-007',
 'Oftalmólogo especialista en cirugía refractiva y retina.',
 9, 700.00, 'Calle Hamburgo 789, Col. Juárez', 'Ciudad de México', 4.7, 178, TRUE);

-- ================================================
-- VISTAS ÚTILES PARA CONSULTAS
-- ================================================

-- Vista para listado completo de médicos
CREATE VIEW doctors_full_view AS
SELECT 
    d.id as doctor_id,
    CONCAT(u.first_name, ' ', u.last_name) as doctor_name,
    u.email,
    u.phone,
    s.name as specialty_name,
    s.icon_class,
    d.license_number,
    d.experience_years,
    d.consultation_fee,
    d.address,
    d.city,
    d.rating_avg,
    d.total_reviews,
    d.is_verified,
    d.created_at as registration_date
FROM doctors d
JOIN users u ON d.user_id = u.id
JOIN specialties s ON d.specialty_id = s.id;

-- Vista para estadísticas por especialidad
CREATE VIEW specialty_stats AS
SELECT 
    s.id as specialty_id,
    s.name as specialty_name,
    s.icon_class,
    COUNT(d.id) as doctor_count,
    ROUND(AVG(d.rating_avg), 2) as avg_rating,
    ROUND(AVG(d.consultation_fee), 2) as avg_fee,
    COUNT(CASE WHEN d.is_verified = TRUE THEN 1 END) as verified_doctors
FROM specialties s
LEFT JOIN doctors d ON s.id = d.specialty_id
WHERE s.is_active = TRUE
GROUP BY s.id, s.name, s.icon_class
ORDER BY doctor_count DESC;

-- ================================================
-- PROCEDIMIENTOS ALMACENADOS BÁSICOS
-- ================================================

DELIMITER //

-- Procedimiento para buscar médicos
CREATE PROCEDURE SearchDoctors(
    IN search_query VARCHAR(100),
    IN specialty_filter INT,
    IN city_filter VARCHAR(100),
    IN min_fee DECIMAL(10,2),
    IN max_fee DECIMAL(10,2),
    IN limit_count INT
)
BEGIN
    SELECT 
        d.id,
        CONCAT(u.first_name, ' ', u.last_name) as doctor_name,
        s.name as specialty,
        d.experience_years,
        d.consultation_fee,
        d.city,
        d.address,
        d.rating_avg,
        d.total_reviews,
        d.is_verified
    FROM doctors d
    JOIN users u ON d.user_id = u.id
    JOIN specialties s ON d.specialty_id = s.id
    WHERE d.is_verified = TRUE
    AND (search_query IS NULL OR 
         CONCAT(u.first_name, ' ', u.last_name) LIKE CONCAT('%', search_query, '%') OR
         s.name LIKE CONCAT('%', search_query, '%'))
    AND (specialty_filter IS NULL OR d.specialty_id = specialty_filter)
    AND (city_filter IS NULL OR d.city LIKE CONCAT('%', city_filter, '%'))
    AND (min_fee IS NULL OR d.consultation_fee >= min_fee)
    AND (max_fee IS NULL OR d.consultation_fee <= max_fee)
    ORDER BY d.rating_avg DESC, d.total_reviews DESC
    LIMIT limit_count;
END //

DELIMITER ;

-- ================================================
-- VERIFICACIÓN Y ESTADÍSTICAS FINALES
-- ================================================

-- Verificar que todas las tablas se crearon correctamente
SELECT 
    table_name,
    table_rows,
    table_comment
FROM information_schema.tables 
WHERE table_schema = DATABASE()
ORDER BY table_name;

-- Estadísticas de datos insertados
SELECT 'Total de usuarios' as metric, COUNT(*) as value FROM users
UNION ALL
SELECT 'Usuarios pacientes', COUNT(*) FROM users WHERE user_type = 'patient'
UNION ALL
SELECT 'Usuarios médicos', COUNT(*) FROM users WHERE user_type = 'doctor'
UNION ALL
SELECT 'Total especialidades', COUNT(*) FROM specialties
UNION ALL
SELECT 'Especialidades activas', COUNT(*) FROM specialties WHERE is_active = TRUE
UNION ALL
SELECT 'Total médicos registrados', COUNT(*) FROM doctors
UNION ALL
SELECT 'Médicos verificados', COUNT(*) FROM doctors WHERE is_verified = TRUE;

-- Mostrar médicos por especialidad
SELECT * FROM specialty_stats;

-- Prueba del procedimiento de búsqueda
CALL SearchDoctors(NULL, NULL, 'Ciudad de México', NULL, NULL, 10);

-- ================================================
-- CONFIGURACIÓN FINAL
-- ================================================

-- Configurar variables para optimización
SET GLOBAL innodb_buffer_pool_size = 134217728; -- 128MB
SET GLOBAL query_cache_type = ON;
SET GLOBAL query_cache_size = 67108864; -- 64MB

-- Mensaje de confirmación
SELECT 'Base de datos Med Search Platform configurada exitosamente' as status;
SELECT CONCAT('Total de tablas creadas: ', COUNT(*)) as summary 
FROM information_schema.tables 
WHERE table_schema = DATABASE();

-- ================================================
-- COMENTARIOS FINALES
-- ================================================

/*
BASE DE DATOS SIMPLIFICADA COMPLETADA:

TABLAS PRINCIPALES (3):
1. users - Información básica de todos los usuarios
2. specialties - Catálogo de especialidades médicas  
3. doctors - Información profesional de médicos

CARACTERÍSTICAS:
- Diseño minimalista según requisitos Semana 2
- Índices optimizados para búsquedas principales
- Datos de prueba incluidos
- Vistas y procedimientos para consultas comunes
- Relaciones foráneas bien definidas
- Preparado para escalabilidad futura

USO:
- Ejecutar este archivo completo para setup inicial
- Contiene todos los datos necesarios para testing
- Compatible con aplicación frontend/backend planificada
*/