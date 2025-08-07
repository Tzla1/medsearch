# Especificaciones Técnicas - Med Search Platform

**Versión:** 1.0  
**Fecha:** Diciembre 2024  
**Equipo:** Desarrollo Med Search Platform  

---

## 1. INFORMACIÓN GENERAL DEL PROYECTO

### 1.1 Descripción del Proyecto
Med Search Platform es una aplicación web diseñada para conectar pacientes con médicos especialistas mediante un sistema de búsqueda intuitivo y funcional. La plataforma permite a los usuarios registrarse, buscar médicos por especialidad y ubicación, visualizar perfiles profesionales detallados, y gestionar citas médicas básicas.

### 1.2 Objetivos Generales
- Desarrollar una aplicación web funcional y responsiva
- Implementar sistema de registro y autenticación de usuarios
- Crear base de datos eficiente para gestión de información médica
- Garantizar experiencia de usuario óptima en dispositivos móviles y desktop
- Desplegar aplicación en servicio gratuito con acceso público

### 1.3 Alcance del Proyecto

#### Funcionalidades Confirmadas (Must Have):
- ✅ Sistema de registro de usuarios con validación básica
- ✅ Autenticación simple con login/logout
- ✅ Búsqueda de médicos por nombre y especialidad
- ✅ Visualización de perfiles médicos detallados
- ✅ Diseño responsivo funcional (mobile-first)
- ✅ Gestión básica de citas médicas

#### Funcionalidades Opcionales (Nice to Have):
- ⭐ Sistema de calificaciones y reseñas
- ⭐ Formulario de contacto por email
- ⭐ Filtros de búsqueda avanzados
- ⭐ Integración con mapas para ubicaciones
- ⭐ Sistema de notificaciones

---

## 2. ARQUITECTURA TÉCNICA

### 2.1 Stack Tecnológico

#### Frontend:
- **Tecnología Principal:** HTML5, CSS3, JavaScript Vanilla
- **Framework CSS:** CSS Grid y Flexbox nativo
- **Preprocesador:** CSS personalizado con variables nativas
- **Justificación:** Enfoque en fundamentos web, facilita debugging, sin curva de aprendizaje adicional

#### Backend:
- **Runtime:** Node.js v18+
- **Framework:** Express.js v4.18+
- **Lenguaje:** TypeScript 5.0+
- **Justificación:** Stack unificado JavaScript, comunidad amplia, documentación abundante

#### Base de Datos:
- **Motor:** MySQL 8.0+
- **ORM/Query Builder:** Consultas SQL nativas
- **Justificación:** Sistema robusto, herramientas gráficas, compatible con hosting gratuito

### 2.2 Estructura del Proyecto

```
med-search-platform/
├── frontend/
│   ├── src/
│   │   ├── index.html          # Landing page principal
│   │   ├── search.html         # Página de resultados
│   │   ├── profile.html        # Perfil de médico
│   │   ├── login.html          # Autenticación
│   │   ├── register.html       # Registro de usuarios
│   │   ├── styles/
│   │   │   └── main.css        # Estilos principales
│   │   └── scripts/
│   │       ├── app.js          # Lógica principal
│   │       └── api.js          # Comunicación con backend
├── backend/
│   ├── src/
│   │   ├── controllers/        # Lógica de negocio
│   │   ├── routes/            # Definición de rutas API
│   │   ├── models/            # Modelos de datos
│   │   ├── middleware/        # Middleware personalizado
│   │   └── services/          # Servicios de negocio
│   └── database/
│       ├── migrations/        # Scripts de creación de BD
│       └── seeds/            # Datos iniciales
└── docs/                     # Documentación del proyecto
```

---

## 3. ESPECIFICACIONES DE BASE DE DATOS

### 3.1 Modelo de Datos Simplificado

#### Tabla: `users`
```sql
- id (PRIMARY KEY, INT, AUTO_INCREMENT)
- username (VARCHAR(50), UNIQUE, NOT NULL)
- email (VARCHAR(100), UNIQUE, NOT NULL)
- password_hash (VARCHAR(255), NOT NULL)
- first_name (VARCHAR(50), NOT NULL)
- last_name (VARCHAR(50), NOT NULL)
- phone_number (VARCHAR(15))
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)
```

#### Tabla: `doctors`
```sql
- id (PRIMARY KEY, INT, AUTO_INCREMENT)
- user_id (FOREIGN KEY -> users.id)
- specialty_id (FOREIGN KEY -> specialties.id)
- license_number (VARCHAR(50), UNIQUE, NOT NULL)
- bio (TEXT)
- experience_years (INT)
- consultation_fee (DECIMAL(10,2))
- address (VARCHAR(255))
- city (VARCHAR(100))
- state (VARCHAR(100))
- zip_code (VARCHAR(10))
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)
```

#### Tabla: `specialties`
```sql
- id (PRIMARY KEY, INT, AUTO_INCREMENT)
- name (VARCHAR(100), UNIQUE, NOT NULL)
- description (TEXT)
- icon_url (VARCHAR(255))
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
```

### 3.2 Relaciones
- **users** 1:1 **doctors** (Un usuario puede ser un doctor)
- **specialties** 1:N **doctors** (Una especialidad tiene múltiples doctores)

---

## 4. ESPECIFICACIONES DE API

### 4.1 Endpoints Principales

#### Autenticación:
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/logout` - Cerrar sesión

#### Médicos:
- `GET /api/doctors` - Listar médicos (con paginación)
- `GET /api/doctors/search?q=nombre&specialty=id` - Búsqueda avanzada
- `GET /api/doctors/:id` - Obtener perfil específico
- `PUT /api/doctors/:id` - Actualizar perfil (solo médico autenticado)

#### Especialidades:
- `GET /api/specialties` - Listar todas las especialidades

### 4.2 Códigos de Respuesta
- `200` - Éxito
- `201` - Creado exitosamente
- `400` - Error de validación
- `401` - No autorizado
- `404` - Recurso no encontrado
- `500` - Error interno del servidor

---

## 5. ESPECIFICACIONES DE FRONTEND

### 5.1 Páginas Requeridas

#### 5.1.1 Landing Page (index.html)
- **Propósito:** Página de inicio con búsqueda rápida
- **Componentes:**
  - Header con navegación
  - Hero section con barra de búsqueda
  - Grid de especialidades médicas
  - Sección "Cómo funciona"
  - Footer informativo

#### 5.1.2 Página de Búsqueda (search.html)
- **Propósito:** Mostrar resultados de búsqueda con filtros
- **Componentes:**
  - Barra de búsqueda refinada
  - Filtros laterales (especialidad, ubicación, precio)
  - Grid de resultados con cards de médicos
  - Paginación

#### 5.1.3 Perfil de Médico (profile.html)
- **Propósito:** Mostrar información detallada del médico
- **Componentes:**
  - Información personal y profesional
  - Especialidades y certificaciones
  - Horarios de atención
  - Sistema de reseñas (futuro)
  - Botón de contacto/cita

#### 5.1.4 Login (login.html)
- **Propósito:** Autenticación de usuarios
- **Componentes:**
  - Formulario de login (email/password)
  - Validación en tiempo real
  - Enlaces a registro y recuperación

#### 5.1.5 Registro (register.html)
- **Propósito:** Creación de nuevas cuentas
- **Componentes:**
  - Formulario multi-paso
  - Validación de campos
  - Términos y condiciones

### 5.2 Diseño Responsivo
- **Breakpoints:**
  - Mobile: 320px - 767px
  - Tablet: 768px - 1199px
  - Desktop: 1200px+
- **Metodología:** Mobile-first approach

---

## 6. REQUISITOS TÉCNICOS

### 6.1 Compatibilidad
- **Navegadores:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Dispositivos:** Smartphones, tablets, laptops, desktops
- **Resoluciones:** 320px a 1920px de ancho

### 6.2 Performance
- **Tiempo de carga:** < 3 segundos en conexión 3G
- **Primera renderización:** < 1.5 segundos
- **Interactividad:** < 100ms respuesta a clicks

### 6.3 Seguridad
- **Autenticación:** JWT tokens
- **Validación:** Backend y frontend
- **HTTPS:** Obligatorio en producción
- **Sanitización:** Entrada de datos

---

## 7. PLAN DE DESARROLLO

### 7.1 Metodología
- **Enfoque:** Desarrollo iterativo por semanas
- **Control de versiones:** Git con flujo feature-branch
- **Testing:** Manual documentado + automatizado (futuro)

### 7.2 Entorno de Desarrollo
- **Editor recomendado:** VS Code
- **Extensiones:** Live Server, MySQL Workbench
- **Node.js:** v18.0.0+
- **MySQL:** 8.0+

### 7.3 Criterios de Aceptación
- ✅ Aplicación funcional en ambiente local
- ✅ Responsive design verificado
- ✅ Validaciones funcionando correctamente
- ✅ Base de datos poblada con datos de prueba
- ✅ Documentación completa de instalación

---

**Documento revisado y aprobado para inicio de desarrollo - Semana 1**