DELIMITER //

CREATE PROCEDURE UpdateDoctorRating(IN p_doctor_id INT)
BEGIN
    DECLARE new_rating DECIMAL(3,2);
    DECLARE review_count INT;
    
    SELECT AVG(rating), COUNT(*) 
    INTO new_rating, review_count
    FROM reviews 
    WHERE doctor_id = p_doctor_id AND is_verified = TRUE;
    
    UPDATE doctors 
    SET rating = COALESCE(new_rating, 0.00),
        total_reviews = review_count,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_doctor_id;
END//

CREATE PROCEDURE SearchNearbyDoctors(
    IN search_lat DECIMAL(10,8),
    IN search_lng DECIMAL(11,8),
    IN max_distance INT,
    IN limit_results INT
)
BEGIN
    SELECT 
        d.*,
        u.first_name,
        u.last_name,
        s.name as specialty_name,
        (6371 * acos(
            cos(radians(search_lat)) * cos(radians(d.latitude)) * 
            cos(radians(d.longitude) - radians(search_lng)) + 
            sin(radians(search_lat)) * sin(radians(d.latitude))
        )) AS distance
    FROM doctors d
    INNER JOIN users u ON d.user_id = u.id
    INNER JOIN specialties s ON d.specialty_id = s.id
    WHERE d.is_verified = TRUE 
      AND u.is_active = TRUE
      AND d.latitude IS NOT NULL 
      AND d.longitude IS NOT NULL
    HAVING distance <= max_distance
    ORDER BY distance ASC, d.rating DESC
    LIMIT limit_results;
END//

DELIMITER ;