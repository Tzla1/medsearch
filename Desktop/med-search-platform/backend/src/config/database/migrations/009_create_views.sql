CREATE OR REPLACE VIEW doctors_public_view AS
SELECT 
    d.id,
    u.first_name,
    u.last_name,
    d.license_number,
    s.name as specialty_name,
    s.category as specialty_category,
    d.years_of_experience,
    d.education,
    d.hospital_affiliations,
    d.consultation_fee,
    d.currency,
    d.available_hours,
    d.accepts_insurance,
    d.insurance_types,
    d.office_address,
    d.office_city,
    d.office_state,
    d.office_zip_code,
    d.latitude,
    d.longitude,
    d.office_phone,
    d.rating,
    d.total_reviews,
    d.is_accepting_patients,
    d.created_at
FROM doctors d
INNER JOIN users u ON d.user_id = u.id
INNER JOIN specialties s ON d.specialty_id = s.id
WHERE d.is_verified = TRUE 
  AND u.is_active = TRUE;
