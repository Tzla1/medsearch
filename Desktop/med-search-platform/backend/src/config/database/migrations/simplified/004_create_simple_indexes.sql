-- ================================================
-- MIGRACIÓN SIMPLIFICADA: Índices Optimizados
-- Archivo: 004_create_simple_indexes.sql
-- Propósito: Índices para optimizar consultas principales
-- Enfoque: Solo índices esenciales para búsquedas frecuentes
-- ================================================

-- Índices adicionales para optimizar consultas específicas del sistema

-- ================================================
-- ÍNDICES PARA TABLA USERS
-- ================================================

-- Índice para búsqueda de médicos por nombre
CREATE INDEX idx_users_fullname ON users (first_name, last_name);

-- Índice para búsquedas por tipo y fecha
CREATE INDEX idx_users_type_date ON users (user_type, created_at);

-- ================================================
-- ÍNDICES PARA TABLA DOCTORS
-- ================================================

-- Índice compuesto para búsqueda principal (especialidad + ciudad + rating)
CREATE INDEX idx_doctors_search_main ON doctors (specialty_id, city, rating_avg DESC, is_verified);

-- Índice para búsqueda por rango de tarifas
CREATE INDEX idx_doctors_fee_range ON doctors (consultation_fee, is_verified);

-- Índice para médicos por experiencia
CREATE INDEX idx_doctors_experience ON doctors (experience_years DESC, is_verified);

-- Índice para búsqueda por ubicación específica
CREATE INDEX idx_doctors_location ON doctors (city, address);

-- ================================================
-- ÍNDICES PARA TABLA SPECIALTIES
-- ================================================

-- Índice para búsqueda de texto en especialidades
CREATE INDEX idx_specialties_search ON specialties (name, is_active);

-- ================================================
-- ESTADÍSTICAS DE ÍNDICES
-- ================================================

-- Verificar que los índices se crearon correctamente
SELECT 
    table_name,
    index_name,
    column_name,
    seq_in_index
FROM information_schema.statistics 
WHERE table_schema = DATABASE()
AND table_name IN ('users', 'doctors', 'specialties')
ORDER BY table_name, index_name, seq_in_index;

-- ================================================
-- CONSULTAS DE PRUEBA OPTIMIZADAS
-- ================================================

-- Consulta 1: Búsqueda de médicos por especialidad y ciudad
EXPLAIN SELECT 
    d.id,
    CONCAT(u.first_name, ' ', u.last_name) as doctor_name,
    s.name as specialty,
    d.rating_avg,
    d.consultation_fee,
    d.city
FROM doctors d
JOIN users u ON d.user_id = u.id
JOIN specialties s ON d.specialty_id = s.id
WHERE d.specialty_id = 1 
AND d.city = 'Ciudad de México'
AND d.is_verified = TRUE
ORDER BY d.rating_avg DESC
LIMIT 10;

-- Consulta 2: Búsqueda de médicos por rango de precio
EXPLAIN SELECT 
    d.id,
    CONCAT(u.first_name, ' ', u.last_name) as doctor_name,
    d.consultation_fee,
    d.rating_avg
FROM doctors d
JOIN users u ON d.user_id = u.id
WHERE d.consultation_fee BETWEEN 400 AND 800
AND d.is_verified = TRUE
ORDER BY d.consultation_fee ASC
LIMIT 10;

-- Consulta 3: Búsqueda de médicos por nombre
EXPLAIN SELECT 
    d.id,
    CONCAT(u.first_name, ' ', u.last_name) as doctor_name,
    s.name as specialty,
    d.rating_avg
FROM doctors d
JOIN users u ON d.user_id = u.id
JOIN specialties s ON d.specialty_id = s.id
WHERE (u.first_name LIKE '%Ana%' OR u.last_name LIKE '%García%')
AND d.is_verified = TRUE
ORDER BY d.rating_avg DESC;

-- ================================================
-- ANÁLISIS DE PERFORMANCE
-- ================================================

-- Tamaño de las tablas
SELECT 
    table_name,
    table_rows,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) as table_size_mb
FROM information_schema.tables 
WHERE table_schema = DATABASE()
AND table_name IN ('users', 'doctors', 'specialties')
ORDER BY table_rows DESC;

-- Estadísticas de los índices por tabla
SELECT 
    table_name,
    COUNT(DISTINCT index_name) as total_indexes,
    SUM(CASE WHEN index_name = 'PRIMARY' THEN 1 ELSE 0 END) as primary_keys,
    SUM(CASE WHEN index_name != 'PRIMARY' THEN 1 ELSE 0 END) as secondary_indexes
FROM information_schema.statistics 
WHERE table_schema = DATABASE()
AND table_name IN ('users', 'doctors', 'specialties')
GROUP BY table_name;

-- ================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- ================================================

/*
ÍNDICES CREADOS PARA OPTIMIZACIÓN:

1. TABLA USERS:
   - idx_users_fullname: Para búsquedas por nombre completo de médicos
   - idx_users_type_date: Para filtrar por tipo de usuario y fecha

2. TABLA DOCTORS:
   - idx_doctors_search_main: Índice compuesto principal para búsquedas
   - idx_doctors_fee_range: Para filtros por rango de precio
   - idx_doctors_experience: Para ordenar por experiencia
   - idx_doctors_location: Para búsquedas geográficas

3. TABLA SPECIALTIES:
   - idx_specialties_search: Para búsquedas en nombres de especialidades

CONSULTAS OPTIMIZADAS:
- Búsqueda por especialidad + ciudad: Usa idx_doctors_search_main
- Filtro por precio: Usa idx_doctors_fee_range
- Búsqueda por nombre: Usa idx_users_fullname
- Todas incluyen filtro is_verified para mostrar solo médicos verificados

PERFORMANCE ESPERADO:
- Consultas de búsqueda < 50ms con hasta 1000 médicos
- Filtros combinados < 100ms
- Ordenamiento por rating optimizado
*/