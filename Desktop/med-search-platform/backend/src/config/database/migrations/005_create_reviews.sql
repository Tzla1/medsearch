CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_id INT NULL, -- Opcional, para reviews verificadas
    
    -- Calificación y contenido
    rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    review_title VARCHAR(200),
    
    -- Aspectos específicos de calificación
    punctuality_rating TINYINT CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
    communication_rating TINYINT CHECK (communication_rating >= 1 AND communication_rating <= 5),
    professionalism_rating TINYINT CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
    facility_rating TINYINT CHECK (facility_rating >= 1 AND facility_rating <= 5),
    
    -- Configuraciones de privacidad
    is_anonymous BOOLEAN DEFAULT FALSE,
    show_patient_name BOOLEAN DEFAULT TRUE,
    
    -- Sistema de verificación
    is_verified BOOLEAN DEFAULT FALSE, -- Requiere cita completada
    verification_date TIMESTAMP NULL,
    verified_by INT, -- Admin que verificó
    
    -- Sistema de moderación
    is_flagged BOOLEAN DEFAULT FALSE,
    flag_reason TEXT,
    is_approved BOOLEAN DEFAULT TRUE,
    moderated_by INT,
    moderated_at TIMESTAMP NULL,
    
    -- Interacciones sociales
    helpful_votes INT DEFAULT 0,
    not_helpful_votes INT DEFAULT 0,
    abuse_reports INT DEFAULT 0,
    
    -- Respuesta del médico
    doctor_response TEXT,
    doctor_response_date TIMESTAMP NULL,
    
    -- Metadatos
    ip_address VARCHAR(45),
    user_agent TEXT,
    language_code VARCHAR(5) DEFAULT 'es',
    
    -- Timestamps de auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- ===============================================================
    -- RESTRICCIONES DE INTEGRIDAD
    -- ===============================================================
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (moderated_by) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Constraint único: un review por cita completada
    UNIQUE KEY unique_review_per_appointment (appointment_id),
    
    -- Prevenir múltiples reviews del mismo paciente al mismo médico
    UNIQUE KEY unique_patient_doctor_review (patient_id, doctor_id, appointment_id),
    
    -- ===============================================================
    -- ÍNDICES PARA AGREGACIONES Y BÚSQUEDA
    -- ===============================================================
    INDEX idx_reviews_doctor (doctor_id),
    INDEX idx_reviews_patient (patient_id),
    INDEX idx_reviews_rating (rating),
    INDEX idx_reviews_verified (is_verified),
    INDEX idx_reviews_approved (is_approved),
    INDEX idx_reviews_date (created_at DESC),
    INDEX idx_reviews_helpful (helpful_votes DESC),
    
    -- Índices compuestos para consultas complejas
    INDEX idx_reviews_doctor_verified (doctor_id, is_verified, is_approved),
    INDEX idx_reviews_public (doctor_id, is_approved, created_at DESC),
    INDEX idx_reviews_moderation (is_flagged, is_approved, moderated_at)
    
) ENGINE=InnoDB CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Sistema de reseñas y calificaciones con moderación avanzada';

-- ===============================================================
-- TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA DE RATINGS
-- ===============================================================
DELIMITER //

-- Trigger para actualizar rating promedio cuando se agrega review
CREATE TRIGGER update_doctor_rating_insert
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
    UPDATE doctors 
    SET 
        rating = (
            SELECT AVG(rating) 
            FROM reviews 
            WHERE doctor_id = NEW.doctor_id 
              AND is_verified = TRUE 
              AND is_approved = TRUE
        ),
        total_reviews = (
            SELECT COUNT(*) 
            FROM reviews 
            WHERE doctor_id = NEW.doctor_id 
              AND is_verified = TRUE 
              AND is_approved = TRUE
        ),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.doctor_id;
END//

-- Trigger para actualizar rating promedio cuando se modifica review
CREATE TRIGGER update_doctor_rating_update
AFTER UPDATE ON reviews
FOR EACH ROW
BEGIN
    UPDATE doctors 
    SET 
        rating = (
            SELECT AVG(rating) 
            FROM reviews 
            WHERE doctor_id = NEW.doctor_id 
              AND is_verified = TRUE 
              AND is_approved = TRUE
        ),
        total_reviews = (
            SELECT COUNT(*) 
            FROM reviews 
            WHERE doctor_id = NEW.doctor_id 
              AND is_verified = TRUE 
              AND is_approved = TRUE
        ),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.doctor_id;
END//

-- Trigger para verificación automática basada en cita completada
CREATE TRIGGER auto_verify_review
BEFORE INSERT ON reviews
FOR EACH ROW
BEGIN
    IF NEW.appointment_id IS NOT NULL THEN
        -- Verificar si existe una cita completada
        IF EXISTS (
            SELECT 1 FROM appointments 
            WHERE id = NEW.appointment_id 
              AND patient_id = NEW.patient_id 
              AND doctor_id = NEW.doctor_id 
              AND status = 'completed'
        ) THEN
            SET NEW.is_verified = TRUE;
            SET NEW.verification_date = CURRENT_TIMESTAMP;
        END IF;
    END IF;
END//

DELIMITER ;