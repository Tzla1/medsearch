# CodeViz Research Context

> **Note**: This file contains research context from CodeViz. Most recent contexts are at the bottom.

---

## Research Query

haz un diagrama entidad/relacion

*Session: 202e749cec16430cb74d106b44737a3a | Generated: 12/7/2025, 12:10:22*

### Analysis Summary

# Diagrama Entidad-Relación

Este informe describe el esquema de la base de datos, identificando las entidades principales y sus relaciones, basándose en los scripts de migración SQL.

## Entidades Principales

### **User**
Representa a los usuarios del sistema.
*   **Propósito:** Almacenar la información de los usuarios, incluyendo sus credenciales y datos personales.
*   **Partes Internas:**
    *   `id`: Identificador único del usuario (clave primaria).
    *   `username`: Nombre de usuario.
    *   `email`: Correo electrónico del usuario.
    *   `password_hash`: Hash de la contraseña.
    *   `created_at`: Fecha de creación del registro.
    *   `updated_at`: Fecha de última actualización del registro.
*   **Relaciones Externas:**
    *   Un usuario puede tener múltiples citas [004_create_appointments.sql](backend/src/config/database/migrations/004_create_appointments.sql).
    *   Un usuario puede dejar múltiples reseñas [005_create_reviews.sql](backend/src/config/database/migrations/005_create_reviews.sql).
    *   Un usuario puede tener múltiples doctores favoritos [006_create_user_favorites.sql](backend/src/config/database/migrations/006_create_user_favorites.sql).
    *   Un usuario puede generar múltiples registros de búsqueda [007_create_search_logs.sql](backend/src/config/database/migrations/007_create_search_logs.sql).
    *   Un usuario puede recibir múltiples notificaciones [008_create_notifications.sql](backend/src/config/database/migrations/008_create_notifications.sql).
*   **Definición:** [001_create_users.sql](backend/src/config/database/migrations/001_create_users.sql)

### **Doctor**
Representa a los profesionales de la salud.
*   **Propósito:** Almacenar la información de los doctores, incluyendo sus datos de contacto, especialidad y disponibilidad.
*   **Partes Internas:**
    *   `id`: Identificador único del doctor (clave primaria).
    *   `user_id`: Clave foránea a la tabla `users`.
    *   `first_name`: Nombre del doctor.
    *   `last_name`: Apellido del doctor.
    *   `specialty_id`: Clave foránea a la tabla `specialties`.
    *   `phone_number`: Número de teléfono.
    *   `address`: Dirección de la consulta.
    *   `city`: Ciudad.
    *   `state`: Estado.
    *   `zip_code`: Código postal.
    *   `bio`: Biografía del doctor.
    *   `created_at`: Fecha de creación del registro.
    *   `updated_at`: Fecha de última actualización del registro.
*   **Relaciones Externas:**
    *   Un doctor pertenece a una especialidad [003_create_specialties.sql](backend/src/config/database/migrations/003_create_specialties.sql).
    *   Un doctor puede tener múltiples citas [004_create_appointments.sql](backend/src/config/database/migrations/004_create_appointments.sql).
    *   Un doctor puede recibir múltiples reseñas [005_create_reviews.sql](backend/src/config/database/migrations/005_create_reviews.sql).
    *   Un doctor puede ser favorito de múltiples usuarios [006_create_user_favorites.sql](backend/src/config/database/migrations/006_create_user_favorites.sql).
*   **Definición:** [002_create_doctors.sql](backend/src/config/database/migrations/002_create_doctors.sql)

### **Specialty**
Representa las especialidades médicas.
*   **Propósito:** Categorizar a los doctores por su área de especialización.
*   **Partes Internas:**
    *   `id`: Identificador único de la especialidad (clave primaria).
    *   `name`: Nombre de la especialidad.
    *   `description`: Descripción de la especialidad.
    *   `created_at`: Fecha de creación del registro.
    *   `updated_at`: Fecha de última actualización del registro.
*   **Relaciones Externas:**
    *   Una especialidad puede tener múltiples doctores [002_create_doctors.sql](backend/src/config/database/migrations/002_create_doctors.sql).
*   **Definición:** [003_create_specialties.sql](backend/src/config/database/migrations/003_create_specialties.sql)

### **Appointment**
Representa las citas agendadas entre usuarios y doctores.
*   **Propósito:** Registrar las citas médicas.
*   **Partes Internas:**
    *   `id`: Identificador único de la cita (clave primaria).
    *   `user_id`: Clave foránea a la tabla `users`.
    *   `doctor_id`: Clave foránea a la tabla `doctors`.
    *   `appointment_date`: Fecha y hora de la cita.
    *   `status`: Estado de la cita (e.g., "scheduled", "completed", "cancelled").
    *   `created_at`: Fecha de creación del registro.
    *   `updated_at`: Fecha de última actualización del registro.
*   **Relaciones Externas:**
    *   Una cita está asociada a un usuario y un doctor.
*   **Definición:** [004_create_appointments.sql](backend/src/config/database/migrations/004_create_appointments.sql)

### **Review**
Representa las reseñas que los usuarios dejan sobre los doctores.
*   **Propósito:** Permitir a los usuarios calificar y comentar sobre los doctores.
*   **Partes Internas:**
    *   `id`: Identificador único de la reseña (clave primaria).
    *   `user_id`: Clave foránea a la tabla `users`.
    *   `doctor_id`: Clave foránea a la tabla `doctors`.
    *   `rating`: Calificación numérica.
    *   `comment`: Comentario de la reseña.
    *   `created_at`: Fecha de creación del registro.
    *   `updated_at`: Fecha de última actualización del registro.
*   **Relaciones Externas:**
    *   Una reseña está asociada a un usuario y un doctor.
*   **Definición:** [005_create_reviews.sql](backend/src/config/database/migrations/005_create_reviews.sql)

### **UserFavorite**
Representa los doctores favoritos de un usuario.
*   **Propósito:** Permitir a los usuarios guardar doctores como favoritos.
*   **Partes Internas:**
    *   `id`: Identificador único del favorito (clave primaria).
    *   `user_id`: Clave foránea a la tabla `users`.
    *   `doctor_id`: Clave foránea a la tabla `doctors`.
    *   `created_at`: Fecha de creación del registro.
*   **Relaciones Externas:**
    *   Un favorito está asociado a un usuario y un doctor.
*   **Definición:** [006_create_user_favorites.sql](backend/src/config/database/migrations/006_create_user_favorites.sql)

### **SearchLog**
Representa los registros de búsqueda realizados por los usuarios.
*   **Propósito:** Almacenar el historial de búsquedas de los usuarios para análisis o personalización.
*   **Partes Internas:**
    *   `id`: Identificador único del registro de búsqueda (clave primaria).
    *   `user_id`: Clave foránea a la tabla `users` (puede ser nulo si la búsqueda es de un usuario no autenticado).
    *   `query`: La cadena de búsqueda.
    *   `search_date`: Fecha y hora de la búsqueda.
    *   `results_count`: Número de resultados obtenidos.
*   **Relaciones Externas:**
    *   Un registro de búsqueda puede estar asociado a un usuario.
*   **Definición:** [007_create_search_logs.sql](backend/src/config/database/migrations/007_create_search_logs.sql)

### **Notification**
Representa las notificaciones enviadas a los usuarios.
*   **Propósito:** Gestionar las notificaciones para los usuarios.
*   **Partes Internas:**
    *   `id`: Identificador único de la notificación (clave primaria).
    *   `user_id`: Clave foránea a la tabla `users`.
    *   `type`: Tipo de notificación (e.g., "appointment_reminder", "new_review").
    *   `message`: Contenido del mensaje de la notificación.
    *   `is_read`: Indica si la notificación ha sido leída.
    *   `created_at`: Fecha de creación del registro.
*   **Relaciones Externas:**
    *   Una notificación está asociada a un usuario.
*   **Definición:** [008_create_notifications.sql](backend/src/config/database/migrations/008_create_notifications.sql)

### **View**
Representa las vistas de la base de datos.
*   **Propósito:** Crear vistas para simplificar consultas complejas o para propósitos de reporting.
*   **Partes Internas:**
    *   `doctor_avg_rating`: Vista que calcula la calificación promedio de los doctores.
*   **Relaciones Externas:**
    *   Depende de las tablas `doctors` y `reviews`.
*   **Definición:** [009_create_views.sql](backend/src/config/database/migrations/009_create_views.sql)

### **Procedure**
Representa los procedimientos almacenados de la base de datos.
*   **Propósito:** Encapsular lógica de negocio compleja o tareas repetitivas en la base de datos.
*   **Partes Internas:**
    *   `update_doctor_avg_rating`: Procedimiento que actualiza la calificación promedio de los doctores.
*   **Relaciones Externas:**
    *   Interactúa con las tablas `doctors` y `reviews`.
*   **Definición:** [010_create_procedures.sql](backend/src/config/database/migrations/010_create_procedures.sql)

### **Index**
Representa los índices de la base de datos.
*   **Propósito:** Mejorar el rendimiento de las consultas.
*   **Partes Internas:**
    *   `idx_users_email`: Índice en la columna `email` de la tabla `users`.
    *   `idx_doctors_specialty_id`: Índice en la columna `specialty_id` de la tabla `doctors`.
    *   `idx_appointments_user_doctor`: Índice en las columnas `user_id` y `doctor_id` de la tabla `appointments`.
    *   `idx_reviews_doctor_id`: Índice en la columna `doctor_id` de la tabla `reviews`.
    *   `idx_user_favorites_user_doctor`: Índice en las columnas `user_id` y `doctor_id` de la tabla `user_favorites`.
    *   `idx_search_logs_user_id`: Índice en la columna `user_id` de la tabla `search_logs`.
    *   `idx_notifications_user_id`: Índice en la columna `user_id` de la tabla `notifications`.
*   **Relaciones Externas:**
    *   Mejoran el acceso a las tablas correspondientes.
*   **Definición:** [011_create_indexes.sql](backend/src/config/database/migrations/011_create_indexes.sql)

## Relaciones entre Entidades

Las relaciones se establecen principalmente a través de claves foráneas (FK).

*   **User** `1` -- `N` **Appointment** (FK: `user_id` en `appointments`)
*   **User** `1` -- `N` **Review** (FK: `user_id` en `reviews`)
*   **User** `1` -- `N` **UserFavorite** (FK: `user_id` en `user_favorites`)
*   **User** `1` -- `N` **SearchLog** (FK: `user_id` en `search_logs`, puede ser nulo)
*   **User** `1` -- `N` **Notification** (FK: `user_id` en `notifications`)
*   **User** `1` -- `1` **Doctor** (FK: `user_id` en `doctors`, un doctor es un tipo de usuario)

*   **Doctor** `1` -- `N` **Appointment** (FK: `doctor_id` en `appointments`)
*   **Doctor** `1` -- `N` **Review** (FK: `doctor_id` en `reviews`)
*   **Doctor** `1` -- `N` **UserFavorite** (FK: `doctor_id` en `user_favorites`)
*   **Doctor** `N` -- `1` **Specialty** (FK: `specialty_id` en `doctors`)

*   **Specialty** `1` -- `N` **Doctor** (FK: `specialty_id` en `doctors`)

## Vistas y Procedimientos

*   La vista `doctor_avg_rating` [009_create_views.sql](backend/src/config/database/migrations/009_create_views.sql) se basa en las tablas `doctors` y `reviews` para calcular la calificación promedio de cada doctor.
*   El procedimiento `update_doctor_avg_rating` [010_create_procedures.sql](backend/src/config/database/migrations/010_create_procedures.sql) interactúa con las tablas `doctors` y `reviews` para mantener actualizada la calificación promedio.

## Índices

Los índices [011_create_indexes.sql](backend/src/config/database/migrations/011_create_indexes.sql) están diseñados para optimizar las consultas en las siguientes columnas:
*   `users.email`
*   `doctors.specialty_id`
*   `appointments.user_id`, `appointments.doctor_id`
*   `reviews.doctor_id`
*   `user_favorites.user_id`, `user_favorites.doctor_id`
*   `search_logs.user_id`
*   `notifications.user_id`

