CREATE INDEX idx_doctors_specialty_city_rating 
ON doctors(specialty_id, office_city, rating DESC, is_accepting_patients);

CREATE INDEX idx_doctors_location_active 
ON doctors(office_state, office_city, is_verified, is_accepting_patients);

CREATE INDEX idx_appointments_doctor_date_status 
ON appointments(doctor_id, appointment_date, status);

CREATE INDEX idx_appointments_patient_status_date 
ON appointments(patient_id, status, appointment_date DESC);