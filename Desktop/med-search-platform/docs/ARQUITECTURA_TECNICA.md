# Arquitectura Técnica Simplificada - Med Search Platform

**Versión:** 1.0  
**Fecha:** Diciembre 2024  
**Enfoque:** Arquitectura minimalista y escalable  

---

## VISIÓN GENERAL DE LA ARQUITECTURA

### Principios de Diseño:
1. **Simplicidad:** Arquitectura clara y fácil de entender
2. **Separación de responsabilidades:** Frontend, Backend y Base de Datos bien definidos
3. **Escalabilidad horizontal:** Preparado para crecimiento futuro
4. **Mantenibilidad:** Código limpio y documentado
5. **Performance:** Optimizado para respuesta rápida

---

## ARQUITECTURA DE ALTO NIVEL

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTE (Browser)                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │
│  │   Mobile    │ │   Tablet    │ │      Desktop        │ │
│  │   375px+    │ │   768px+    │ │      1200px+        │ │
│  └─────────────┘ └─────────────┘ └─────────────────────┘ │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTP/HTTPS
                          │ JSON API
┌─────────────────────────▼───────────────────────────────┐
│                  FRONTEND LAYER                         │
│  ┌─────────────────────────────────────────────────────┐ │
│  │           HTML5 + CSS3 + JavaScript Vanilla        │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌───────────────┐  │ │
│  │  │   Views     │ │   Styles    │ │    Scripts    │  │ │
│  │  │ (.html)     │ │ (.css)      │ │    (.js)      │  │ │
│  │  └─────────────┘ └─────────────┘ └───────────────┘  │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────┬───────────────────────────────┘
                          │ REST API Calls
                          │ Fetch API
┌─────────────────────────▼───────────────────────────────┐
│                   BACKEND LAYER                         │
│  ┌─────────────────────────────────────────────────────┐ │
│  │            Node.js + Express.js + TypeScript       │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │ │
│  │  │   Auth   │ │   API    │ │Business  │ │  Utils  │ │ │
│  │  │   Layer  │ │  Routes  │ │  Logic   │ │ Helpers │ │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └─────────┘ │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────┬───────────────────────────────┘
                          │ SQL Queries
                          │ Connection Pool
┌─────────────────────────▼───────────────────────────────┐
│                   DATABASE LAYER                        │
│  ┌─────────────────────────────────────────────────────┐ │
│  │                    MySQL 8.0+                      │ │
│  │  ┌────────────┐ ┌────────────┐ ┌─────────────────┐  │ │
│  │  │   Tables   │ │   Indexes  │ │   Constraints   │  │ │
│  │  │ (3 main)   │ │ (optimized)│ │   (integrity)   │  │ │
│  │  └────────────┘ └────────────┘ └─────────────────┘  │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## CAPA FRONTEND (Presentation Layer)

### Tecnologías Seleccionadas:
- **HTML5:** Estructura semántica y accesible
- **CSS3:** Estilos con Grid, Flexbox y Custom Properties
- **JavaScript Vanilla:** Lógica del cliente sin frameworks
- **Responsive Design:** Mobile-first approach

### Estructura de Archivos:
```
frontend/
├── src/
│   ├── index.html           # Landing page
│   ├── search.html          # Página de búsqueda
│   ├── profile.html         # Perfil de médico
│   ├── login.html           # Autenticación
│   ├── register.html        # Registro
│   ├── styles/
│   │   ├── main.css         # Estilos principales
│   │   ├── components.css   # Componentes reutilizables
│   │   └── responsive.css   # Media queries
│   └── scripts/
│       ├── app.js           # Lógica principal de la app
│       ├── api.js           # Cliente API REST
│       ├── auth.js          # Manejo de autenticación
│       └── utils.js         # Utilidades comunes
```

### Patrones de Diseño Frontend:
1. **Module Pattern:** Organización del código JavaScript
2. **Observer Pattern:** Manejo de eventos del DOM
3. **Factory Pattern:** Creación de elementos dinámicos
4. **Singleton Pattern:** Gestión de estado global

### API Client Architecture:
```javascript
// Estructura del cliente API
class APIClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('authToken');
  }
  
  async request(endpoint, options = {}) {
    // Manejo centralizado de requests
  }
  
  // Métodos específicos por entidad
  auth = {
    login: (credentials) => {},
    register: (userData) => {},
    logout: () => {}
  };
  
  doctors = {
    search: (query, filters) => {},
    getById: (id) => {},
    getBySpecialty: (specialtyId) => {}
  };
  
  specialties = {
    getAll: () => {}
  };
}
```

---

## CAPA BACKEND (Business Logic Layer)

### Tecnologías Seleccionadas:
- **Node.js v18+:** Runtime JavaScript del servidor
- **Express.js v4:** Framework web minimalista
- **TypeScript:** Tipado estático para mejor desarrollo
- **JWT:** Autenticación stateless

### Arquitectura MVC Simplificada:
```
backend/src/
├── controllers/           # Lógica de controladores
│   ├── authController.ts   # Autenticación y autorización
│   ├── doctorController.ts # CRUD de médicos
│   └── searchController.ts # Lógica de búsqueda
├── services/              # Lógica de negocio
│   ├── authService.ts      # Servicios de autenticación
│   ├── doctorService.ts    # Servicios de médicos
│   └── searchService.ts    # Servicios de búsqueda
├── models/                # Modelos de datos
│   ├── User.ts            # Modelo de usuario
│   ├── Doctor.ts          # Modelo de médico
│   └── Specialty.ts       # Modelo de especialidad
├── routes/                # Definición de rutas
│   ├── authRoutes.ts      # Rutas de autenticación
│   ├── doctorRoutes.ts    # Rutas de médicos
│   └── searchRoutes.ts    # Rutas de búsqueda
├── middleware/            # Middleware personalizado
│   ├── auth.ts            # Verificación de tokens
│   ├── validation.ts      # Validación de datos
│   └── errorHandler.ts    # Manejo global de errores
├── config/                # Configuración
│   ├── database.ts        # Configuración de BD
│   ├── environment.ts     # Variables de entorno
│   └── cors.ts            # Configuración CORS
└── app.ts                 # Configuración principal
```

### Flujo de Request/Response:
```
1. HTTP Request → Express Router
2. Router → Middleware (auth, validation)
3. Middleware → Controller
4. Controller → Service (business logic)
5. Service → Database (via connection pool)
6. Database → Service (data results)
7. Service → Controller (processed data)
8. Controller → JSON Response
```

### Manejo de Errores Centralizado:
```typescript
// Error handling strategy
class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

// Global error handler middleware
const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { statusCode = 500, message } = err;
  
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong' 
      : message
  });
};
```

---

## CAPA BASE DE DATOS (Data Layer)

### Tecnología Seleccionada:
- **MySQL 8.0+:** Base de datos relacional robusta
- **Connection Pooling:** Optimización de conexiones
- **SQL Nativo:** Consultas optimizadas sin ORM

### Esquema Simplificado (3 Tablas Principales):

#### 1. Tabla `users`
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  phone VARCHAR(15),
  user_type ENUM('patient', 'doctor') DEFAULT 'patient',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_user_type (user_type)
);
```

#### 2. Tabla `doctors`
```sql
CREATE TABLE doctors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  specialty_id INT NOT NULL,
  license_number VARCHAR(50) UNIQUE NOT NULL,
  bio TEXT,
  experience_years INT DEFAULT 0,
  consultation_fee DECIMAL(10,2),
  address VARCHAR(255),
  city VARCHAR(100),
  rating_avg DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INT DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (specialty_id) REFERENCES specialties(id),
  INDEX idx_specialty (specialty_id),
  INDEX idx_city (city),
  INDEX idx_rating (rating_avg),
  INDEX idx_verified (is_verified)
);
```

#### 3. Tabla `specialties`
```sql
CREATE TABLE specialties (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon_url VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_active (is_active)
);
```

### Connection Pool Configuration:
```typescript
// Database connection setup
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

// Connection health check
const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await pool.execute('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};
```

---

## FLUJO DE DATOS COMPLETO

### Caso de Uso: Búsqueda de Médicos

1. **Frontend (Client)**
   ```javascript
   // Usuario ingresa búsqueda
   const searchQuery = document.getElementById('search-input').value;
   
   // Llamada a API
   const results = await apiClient.doctors.search({
     query: searchQuery,
     specialty: selectedSpecialty,
     location: userLocation
   });
   
   // Renderizar resultados
   displaySearchResults(results);
   ```

2. **Backend (API Route)**
   ```typescript
   // Route handler
   router.get('/doctors/search', async (req, res, next) => {
     try {
       const { query, specialty, location } = req.query;
       
       // Validación
       const validatedParams = validateSearchParams(req.query);
       
       // Business logic
       const results = await doctorService.searchDoctors(validatedParams);
       
       // Response
       res.json({
         status: 'success',
         data: results,
         total: results.length
       });
     } catch (error) {
       next(error);
     }
   });
   ```

3. **Database (SQL Query)**
   ```sql
   SELECT 
     d.id,
     CONCAT(u.first_name, ' ', u.last_name) as doctor_name,
     s.name as specialty_name,
     d.rating_avg,
     d.total_reviews,
     d.consultation_fee,
     d.city
   FROM doctors d
   JOIN users u ON d.user_id = u.id
   JOIN specialties s ON d.specialty_id = s.id
   WHERE 
     (CONCAT(u.first_name, ' ', u.last_name) LIKE ? OR s.name LIKE ?)
     AND (? IS NULL OR d.specialty_id = ?)
     AND (? IS NULL OR d.city = ?)
     AND d.is_verified = TRUE
   ORDER BY d.rating_avg DESC, d.total_reviews DESC
   LIMIT 20;
   ```

---

## SEGURIDAD Y PERFORMANCE

### Medidas de Seguridad:
1. **Autenticación JWT:** Tokens con expiración
2. **Validación de entrada:** Sanitización de datos
3. **CORS configurado:** Origins permitidos específicos
4. **Rate limiting:** Prevención de abuso de API
5. **HTTPS obligatorio:** En producción
6. **SQL injection prevention:** Consultas parametrizadas

### Optimizaciones de Performance:
1. **Connection pooling:** Reutilización de conexiones DB
2. **Índices de base de datos:** Consultas optimizadas
3. **Debouncing:** En búsquedas del frontend
4. **Lazy loading:** Carga de imágenes bajo demanda
5. **Minificación:** CSS y JavaScript comprimidos
6. **Caching:** Headers HTTP apropiados

---

## DEPLOYMENT Y ESCALABILIDAD

### Arquitectura de Deployment:
```
┌─────────────────────────────────────────┐
│              Load Balancer              │
│               (Nginx)                   │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│          Application Server             │
│         (Node.js + Express)             │
│  ┌─────────────────────────────────────┐ │
│  │   Instance 1   │   Instance 2      │ │
│  │   Port 3001    │   Port 3002       │ │
│  └─────────────────────────────────────┘ │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│            Database Server              │
│             (MySQL 8.0)                 │
│  ┌─────────────────────────────────────┐ │
│  │   Master DB    │   Replica DB      │ │
│  │   (Read/Write) │   (Read Only)     │ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Escalabilidad Horizontal:
- **Frontend:** CDN para assets estáticos
- **Backend:** Múltiples instancias de Node.js
- **Database:** Master-Slave replication para lectura
- **Caching:** Redis para sesiones y cache

---

## MONITOREO Y LOGGING

### Logging Strategy:
```typescript
// Structured logging
const logger = {
  info: (message: string, meta?: object) => {
    console.log(JSON.stringify({
      level: 'info',
      timestamp: new Date().toISOString(),
      message,
      ...meta
    }));
  },
  
  error: (message: string, error?: Error, meta?: object) => {
    console.error(JSON.stringify({
      level: 'error',
      timestamp: new Date().toISOString(),
      message,
      error: error?.stack,
      ...meta
    }));
  }
};
```

### Health Checks:
- **API Health:** `/api/health` endpoint
- **Database Health:** Connection status
- **Memory Usage:** Process monitoring
- **Response Times:** Request duration tracking

---

**Esta arquitectura proporciona una base sólida, escalable y mantenible para el desarrollo de Med Search Platform, siguiendo las mejores prácticas de la industria.**