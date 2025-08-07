-- ================================================
-- MIGRACIÓN SIMPLIFICADA: Tabla Users
-- Archivo: 001_create_users_simple.sql
-- Propósito: Tabla principal de usuarios (pacientes y médicos)
-- Enfoque: Minimalista según requisitos Semana 2 (3-4 tablas)
-- ================================================

-- Eliminar tabla si existe (para testing)
DROP TABLE IF EXISTS users;

-- Crear tabla users simplificada
CREATE TABLE users (
    -- Identificador único
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Información de autenticación
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Información personal básica
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(15),
    
    -- Tipo de usuario (paciente o médico)
    user_type ENUM('patient', 'doctor') DEFAULT 'patient',
    
    -- Campos de auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices para optimización
    INDEX idx_email (email),
    INDEX idx_user_type (user_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar datos de prueba básicos
INSERT INTO users (email, password_hash, first_name, last_name, phone, user_type) VALUES
-- Usuarios pacientes
('paciente1@email.com', '$2b$10$example1hash', 'Juan', 'Pérez', '555-0101', 'patient'),
('paciente2@email.com', '$2b$10$example2hash', 'María', 'González', '555-0102', 'patient'),
('paciente3@email.com', '$2b$10$example3hash', 'Carlos', 'López', '555-0103', 'patient'),

-- Usuarios médicos
('dr.martinez@email.com', '$2b$10$example4hash', 'Roberto', 'Martínez', '555-0201', 'doctor'),
('dra.garcia@email.com', '$2b$10$example5hash', 'Ana', 'García', '555-0202', 'doctor'),
('dr.rodriguez@email.com', '$2b$10$example6hash', 'Luis', 'Rodríguez', '555-0203', 'doctor'),
('dra.fernandez@email.com', '$2b$10$example7hash', 'Carmen', 'Fernández', '555-0204', 'doctor'),
('dr.morales@email.com', '$2b$10$example8hash', 'Diego', 'Morales', '555-0205', 'doctor');

-- Verificar inserción
SELECT 
    COUNT(*) as total_usuarios,
    SUM(CASE WHEN user_type = 'patient' THEN 1 ELSE 0 END) as pacientes,
    SUM(CASE WHEN user_type = 'doctor' THEN 1 ELSE 0 END) as medicos
FROM users;

-- Comentarios para documentación
-- Esta tabla centraliza toda la información de usuarios
-- Los médicos tendrán información adicional en la tabla 'doctors'
-- Los pacientes solo necesitan esta información básica