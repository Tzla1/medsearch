-- ================================================
-- MIGRACIÓN SIMPLIFICADA: Tabla Specialties
-- Archivo: 002_create_specialties_simple.sql
-- Propósito: Catálogo de especialidades médicas
-- Enfoque: Minimalista según requisitos Semana 2 (3-4 tablas)
-- ================================================

-- Eliminar tabla si existe (para testing)
DROP TABLE IF EXISTS specialties;

-- Crear tabla specialties simplificada
CREATE TABLE specialties (
    -- Identificador único
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Información básica de la especialidad
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    
    -- Para mostrar iconos en el frontend
    icon_class VARCHAR(50) DEFAULT 'medical-icon',
    
    -- Estado activo/inactivo
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Campo de auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Índices para optimización
    INDEX idx_name (name),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar especialidades médicas comunes
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
('Neumología', 'Especialistas en enfermedades del sistema respiratorio', 'icon-lungs'),
('Urología', 'Enfermedades del sistema urinario y reproductor masculino', 'icon-kidney'),
('Oncología', 'Diagnóstico y tratamiento del cáncer', 'icon-cancer'),
('Medicina General', 'Atención médica integral y primera consulta', 'icon-stethoscope'),
('Odontología', 'Salud bucodental y tratamientos dentales', 'icon-tooth');

-- Verificar inserción
SELECT 
    COUNT(*) as total_especialidades,
    COUNT(CASE WHEN is_active = TRUE THEN 1 END) as activas,
    COUNT(CASE WHEN is_active = FALSE THEN 1 END) as inactivas
FROM specialties;

-- Mostrar todas las especialidades insertadas
SELECT id, name, icon_class, is_active FROM specialties ORDER BY name;

-- Comentarios para documentación
-- Esta tabla contiene el catálogo maestro de especialidades médicas
-- Se puede expandir fácilmente agregando nuevas especialidades
-- El campo icon_class permite asociar iconos específicos en el frontend