CREATE TABLE IF NOT EXISTS doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    license_number VARCHAR(50) NOT NULL UNIQUE,
    specialty_id INT NOT NULL,
    years_of_experience INT NOT NULL DEFAULT 0,
    education TEXT NOT NULL,
    hospital_affiliations TEXT,
    consultation_fee DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'MXN',
    
    -- Horarios en formato JSON optimizado para consultas
    available_hours JSON, 
    accepts_insurance BOOLEAN DEFAULT TRUE,
    insurance_types JSON, -- Array de seguros aceptados
    
    -- Información geográfica para búsqueda espacial
    office_address TEXT NOT NULL,
    office_city VARCHAR(100) NOT NULL,
    office_state VARCHAR(100) NOT NULL,
    office_zip_code VARCHAR(20) NOT NULL,
    latitude DECIMAL(10, 8), -- Precisión GPS optimizada
    longitude DECIMAL(11, 8),
    
    -- Contacto profesional
    office_phone VARCHAR(20) NOT NULL,
    emergency_phone VARCHAR(20),
    
    -- Métricas de calidad agregadas
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    
    -- Estados de verificación y disponibilidad
    is_verified BOOLEAN DEFAULT FALSE,
    is_accepting_patients BOOLEAN DEFAULT TRUE,
    verification_date TIMESTAMP NULL,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Timestamps de auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- ===============================================================
    -- RESTRICCIONES DE INTEGRIDAD REFERENCIAL
    -- ===============================================================
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (specialty_id) REFERENCES specialties(id) ON DELETE RESTRICT,
    
    -- ===============================================================
    -- ÍNDICES OPTIMIZADOS PARA BÚSQUEDA
    -- ===============================================================
    INDEX idx_doctors_specialty (specialty_id),
    INDEX idx_doctors_location (office_city, office_state),
    INDEX idx_doctors_coordinates (latitude, longitude),
    INDEX idx_doctors_rating (rating DESC),
    INDEX idx_doctors_accepting (is_accepting_patients),
    INDEX idx_doctors_verified (is_verified),
    INDEX idx_doctors_fee (consultation_fee),
    
    -- Índice compuesto para búsquedas complejas
    INDEX idx_doctors_search_composite (specialty_id, office_city, is_accepting_patients, is_verified),
    
    -- Índice de texto completo para búsqueda avanzada
    INDEX idx_doctors_education (education(255)),
    INDEX idx_doctors_affiliations (hospital_affiliations(255))
    
) ENGINE=InnoDB CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tabla de médicos especialistas con información profesional completa';

-- ===============================================================
-- VALIDACIONES A NIVEL DE BASE DE DATOS
-- ===============================================================

-- Trigger para validar coordenadas GPS
DELIMITER //
CREATE TRIGGER validate_doctor_coordinates 
BEFORE INSERT ON doctors FOR EACH ROW
BEGIN
    IF NEW.latitude IS NOT NULL AND (NEW.latitude < -90 OR NEW.latitude > 90) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Latitud debe estar entre -90 y 90 grados';
    END IF;
    IF NEW.longitude IS NOT NULL AND (NEW.longitude < -180 OR NEW.longitude > 180) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Longitud debe estar entre -180 y 180 grados';
    END IF;
END//
DELIMITER ;