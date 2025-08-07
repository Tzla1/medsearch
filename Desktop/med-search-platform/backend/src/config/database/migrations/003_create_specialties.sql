CREATE TABLE IF NOT EXISTS specialties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    
    -- Metadatos para presentación
    is_active BOOLEAN DEFAULT TRUE,
    icon_url VARCHAR(500),
    display_order INT DEFAULT 0,
    color_code VARCHAR(7), -- Código hexadecimal para UI
    
    -- Configuración de búsqueda
    search_keywords TEXT, -- Palabras clave para búsqueda
    is_popular BOOLEAN DEFAULT FALSE, -- Para destacar especialidades
    
    -- Estadísticas agregadas (actualizadas por triggers)
    doctor_count INT DEFAULT 0,
    avg_consultation_fee DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Timestamps de auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- ===============================================================
    -- ÍNDICES PARA OPTIMIZACIÓN DE CONSULTAS
    -- ===============================================================
    INDEX idx_specialties_active (is_active),
    INDEX idx_specialties_category (category),
    INDEX idx_specialties_popular (is_popular),
    INDEX idx_specialties_order (display_order),
    INDEX idx_specialties_name (name),
    
    -- Índice compuesto para filtros comunes
    INDEX idx_specialties_filter (category, is_active, display_order)
    
) ENGINE=InnoDB CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Catálogo de especialidades médicas con categorización jerárquica';

-- ===============================================================
-- TRIGGER PARA ACTUALIZAR ESTADÍSTICAS
-- ===============================================================
DELIMITER //
CREATE TRIGGER update_specialty_stats_insert 
AFTER INSERT ON doctors FOR EACH ROW
BEGIN
    UPDATE specialties 
    SET doctor_count = (
        SELECT COUNT(*) FROM doctors 
        WHERE specialty_id = NEW.specialty_id AND is_verified = TRUE
    ),
    avg_consultation_fee = (
        SELECT AVG(consultation_fee) FROM doctors 
        WHERE specialty_id = NEW.specialty_id AND is_verified = TRUE
    )
    WHERE id = NEW.specialty_id;
END//

CREATE TRIGGER update_specialty_stats_update 
AFTER UPDATE ON doctors FOR EACH ROW
BEGIN
    -- Actualizar estadísticas de la especialidad antigua
    IF OLD.specialty_id != NEW.specialty_id THEN
        UPDATE specialties 
        SET doctor_count = (
            SELECT COUNT(*) FROM doctors 
            WHERE specialty_id = OLD.specialty_id AND is_verified = TRUE
        ),
        avg_consultation_fee = (
            SELECT AVG(consultation_fee) FROM doctors 
            WHERE specialty_id = OLD.specialty_id AND is_verified = TRUE
        )
        WHERE id = OLD.specialty_id;
    END IF;
    
    -- Actualizar estadísticas de la especialidad nueva
    UPDATE specialties 
    SET doctor_count = (
        SELECT COUNT(*) FROM doctors 
        WHERE specialty_id = NEW.specialty_id AND is_verified = TRUE
    ),
    avg_consultation_fee = (
        SELECT AVG(consultation_fee) FROM doctors 
        WHERE specialty_id = NEW.specialty_id AND is_verified = TRUE
    )
    WHERE id = NEW.specialty_id;
END//
DELIMITER ;