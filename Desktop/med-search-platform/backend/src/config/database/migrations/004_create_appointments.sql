CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    
    -- Programación temporal
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    estimated_duration INT DEFAULT 30, -- Minutos
    
    -- Estados del workflow
    status ENUM(
        'pending',      -- Solicitud inicial
        'confirmed',    -- Confirmada por médico
        'cancelled',    -- Cancelada
        'completed',    -- Consulta realizada
        'no_show',      -- Paciente no asistió
        'rescheduled'   -- Reprogramada
    ) DEFAULT 'pending',
    
    -- Información de la consulta
    reason_for_visit TEXT NOT NULL,
    patient_notes TEXT,
    doctor_notes TEXT,
    diagnosis TEXT,
    treatment_plan TEXT,
    follow_up_date DATE,
    
    -- Información de contacto
    contact_phone VARCHAR(20) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    emergency_contact VARCHAR(100),
    
    -- Gestión de cancelaciones y cambios
    cancellation_reason TEXT,
    cancelled_by ENUM('patient', 'doctor', 'system'),
    cancelled_at TIMESTAMP NULL,
    rescheduled_from INT, -- ID de cita original
    
    -- Timestamps de workflow
    confirmed_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    last_reminder_sent TIMESTAMP NULL,
    
    -- Metadatos financieros
    consultation_fee DECIMAL(10, 2),
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    payment_method VARCHAR(50),
    
    -- Auditoría y timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- ===============================================================
    -- RESTRICCIONES DE INTEGRIDAD
    -- ===============================================================
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (rescheduled_from) REFERENCES appointments(id) ON DELETE SET NULL,
    
    -- Constraint único para evitar doble reserva
    UNIQUE KEY unique_doctor_datetime (doctor_id, appointment_date, appointment_time),
    
    -- ===============================================================
    -- ÍNDICES OPTIMIZADOS PARA CONSULTAS FRECUENTES
    -- ===============================================================
    INDEX idx_appointments_patient (patient_id),
    INDEX idx_appointments_doctor (doctor_id),
    INDEX idx_appointments_date (appointment_date),
    INDEX idx_appointments_status (status),
    INDEX idx_appointments_datetime (appointment_date, appointment_time),
    
    -- Índices compuestos para consultas complejas
    INDEX idx_doctor_schedule (doctor_id, appointment_date, status),
    INDEX idx_patient_history (patient_id, status, appointment_date DESC),
    INDEX idx_pending_appointments (status, appointment_date, appointment_time),
    
    -- Índices para reportes y analytics
    INDEX idx_appointments_created (created_at),
    INDEX idx_appointments_payment (payment_status),
    INDEX idx_appointments_reminders (last_reminder_sent, status)
    
) ENGINE=InnoDB CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Sistema de gestión de citas médicas con workflow completo';

-- ===============================================================
-- TRIGGERS PARA VALIDACIONES DE NEGOCIO
-- ===============================================================

-- Validar que la fecha de cita sea futura
DELIMITER //
CREATE TRIGGER validate_appointment_date 
BEFORE INSERT ON appointments FOR EACH ROW
BEGIN
    IF NEW.appointment_date < CURDATE() THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La fecha de cita debe ser futura';
    END IF;
    
    -- Validar horario laboral (ejemplo: 7 AM a 8 PM)
    IF TIME(NEW.appointment_time) < '07:00:00' OR TIME(NEW.appointment_time) > '20:00:00' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Horario de cita fuera del horario laboral';
    END IF;
END//

-- Trigger para actualizar timestamps de estado
CREATE TRIGGER update_appointment_timestamps 
BEFORE UPDATE ON appointments FOR EACH ROW
BEGIN
    IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
        SET NEW.confirmed_at = CURRENT_TIMESTAMP;
    END IF;
    
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        SET NEW.completed_at = CURRENT_TIMESTAMP;
    END IF;
    
    IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
        SET NEW.cancelled_at = CURRENT_TIMESTAMP;
    END IF;
END//
DELIMITER ;