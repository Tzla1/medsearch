# Convenciones de Código - Med Search Platform

**Versión:** 1.0  
**Fecha:** Diciembre 2024  
**Aplicable a:** Todo el equipo de desarrollo  

---

## ESTÁNDARES GENERALES

### Nomenclatura de Archivos:
- **Archivos JavaScript/TypeScript:** `camelCase.js` o `PascalCase.ts`
- **Archivos CSS:** `kebab-case.css`
- **Archivos HTML:** `kebab-case.html`
- **Archivos de configuración:** `UPPER_CASE` o `lowercase`

### Estructura de Directorios:
```
/backend
  /src
    /controllers     # PascalCase para clases
    /routes         # camelCase para archivos
    /models         # PascalCase para modelos
    /middleware     # camelCase para archivos
    /services       # camelCase para archivos

/frontend
  /src
    /components     # PascalCase para componentes
    /styles         # kebab-case para archivos CSS
    /scripts        # camelCase para archivos JS
```

---

## CONVENCIONES BACKEND (Node.js/TypeScript)

### Variables y Funciones:
```typescript
// ✅ CORRECTO - camelCase
const userName = 'Juan';
const isAuthenticated = true;
const fetchUserData = async () => {};

// ❌ INCORRECTO
const user_name = 'Juan';           // snake_case
const IsAuthenticated = true;       // PascalCase
const fetch_user_data = () => {};   // snake_case
```

### Clases y Constructores:
```typescript
// ✅ CORRECTO - PascalCase
class UserController {
  constructor() {}
}

class DatabaseConnection {
  private connectionPool: any;
}

// ❌ INCORRECTO
class userController {}     // camelCase
class database_connection {} // snake_case
```

### Constantes:
```typescript
// ✅ CORRECTO - UPPER_SNAKE_CASE
const API_BASE_URL = 'http://localhost:3001';
const MAX_RETRY_ATTEMPTS = 3;
const JWT_SECRET_KEY = process.env.JWT_SECRET;

// ❌ INCORRECTO
const apiBaseUrl = 'http://localhost:3001';  // camelCase
const maxRetryAttempts = 3;                  // camelCase
```

### Interfaces y Types:
```typescript
// ✅ CORRECTO - PascalCase con prefijo 'I' para interfaces
interface IUser {
  id: number;
  username: string;
  email: string;
}

type UserRole = 'patient' | 'doctor' | 'admin';

// ❌ INCORRECTO
interface user {}        // lowercase
interface iUser {}       // incorrect prefix
```

### Funciones Async/Await:
```typescript
// ✅ CORRECTO
const fetchDoctors = async (): Promise<Doctor[]> => {
  try {
    const result = await database.query('SELECT * FROM doctors');
    return result;
  } catch (error) {
    logger.error('Error fetching doctors:', error);
    throw error;
  }
};

// ❌ INCORRECTO - sin manejo de errores
const fetchDoctors = async () => {
  return await database.query('SELECT * FROM doctors');
};
```

---

## CONVENCIONES FRONTEND (HTML/CSS/JavaScript)

### HTML:
```html
<!-- ✅ CORRECTO - atributos en kebab-case -->
<div class="search-container" data-test-id="search-form">
  <input type="text" id="doctor-name" class="form-input" />
  <button type="submit" class="btn btn-primary">Buscar</button>
</div>

<!-- ❌ INCORRECTO -->
<div class="searchContainer" data_test_id="searchForm">
  <input type="text" id="doctorName" class="formInput" />
</div>
```

### CSS:
```css
/* ✅ CORRECTO - BEM methodology */
.doctor-card {
  display: flex;
  padding: 1rem;
}

.doctor-card__title {
  font-size: 1.5rem;
  font-weight: bold;
}

.doctor-card__rating {
  color: #f39c12;
}

.doctor-card--featured {
  border: 2px solid #3498db;
}

/* ❌ INCORRECTO */
.doctorCard {}          // camelCase
.doctor_card {}         // snake_case
.DoctorCard {}          // PascalCase
```

### JavaScript:
```javascript
// ✅ CORRECTO
const searchForm = document.getElementById('search-form');
const API_ENDPOINTS = {
  DOCTORS: '/api/doctors',
  SPECIALTIES: '/api/specialties'
};

const handleSearchSubmit = async (event) => {
  event.preventDefault();
  // lógica de búsqueda
};

// ❌ INCORRECTO
const SearchForm = document.getElementById('search-form');  // PascalCase
const api_endpoints = {};  // snake_case
```

---

## CONVENCIONES DE BASE DE DATOS

### Nombres de Tablas:
```sql
-- ✅ CORRECTO - plural, snake_case
CREATE TABLE users (id INT PRIMARY KEY);
CREATE TABLE doctors (id INT PRIMARY KEY);
CREATE TABLE user_favorites (id INT PRIMARY KEY);

-- ❌ INCORRECTO
CREATE TABLE User (id INT PRIMARY KEY);     -- singular, PascalCase
CREATE TABLE userFavorites (id INT PRIMARY KEY); -- camelCase
```

### Nombres de Columnas:
```sql
-- ✅ CORRECTO - snake_case
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  email_address VARCHAR(100),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- ❌ INCORRECTO
CREATE TABLE users (
  Id INT PRIMARY KEY,           -- PascalCase
  firstName VARCHAR(50),        -- camelCase
  LastName VARCHAR(50)          -- PascalCase
);
```

---

## COMENTARIOS Y DOCUMENTACIÓN

### Backend Comments:
```typescript
/**
 * Busca médicos basado en criterios específicos
 * @param query - Término de búsqueda
 * @param specialty - ID de especialidad (opcional)
 * @param location - Ubicación (opcional)
 * @returns Promise con array de médicos encontrados
 */
const searchDoctors = async (
  query: string,
  specialty?: number,
  location?: string
): Promise<Doctor[]> => {
  // Validar parámetros de entrada
  if (!query || query.trim().length < 2) {
    throw new Error('Query must be at least 2 characters long');
  }

  // Construir consulta SQL dinámica
  let sqlQuery = 'SELECT * FROM doctors WHERE';
  const params: any[] = [];

  // TODO: Implementar búsqueda por ubicación
  // FIXME: Optimizar consulta para grandes volúmenes de datos
  
  return results;
};
```

### Frontend Comments:
```javascript
/**
 * Maneja el envío del formulario de búsqueda
 * Valida datos y envía request al backend
 */
const handleSearchSubmit = async (event) => {
  event.preventDefault();
  
  // Obtener datos del formulario
  const formData = new FormData(event.target);
  const query = formData.get('query');
  
  // Validación básica
  if (!query || query.length < 2) {
    showErrorMessage('Por favor ingresa al menos 2 caracteres');
    return;
  }
  
  // Mostrar loading state
  showLoadingSpinner(true);
  
  try {
    // Llamada a la API
    const results = await searchAPI.findDoctors(query);
    displaySearchResults(results);
  } catch (error) {
    showErrorMessage('Error en la búsqueda. Intenta nuevamente.');
  } finally {
    showLoadingSpinner(false);
  }
};
```

---

## MANEJO DE ERRORES

### Backend Error Handling:
```typescript
// ✅ CORRECTO - Error handling consistente
try {
  const user = await userService.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
} catch (error) {
  if (error instanceof AppError) {
    throw error; // Re-throw custom errors
  }
  logger.error('Unexpected error in findUser:', error);
  throw new AppError('Internal server error', 500);
}

// ❌ INCORRECTO - Error handling inconsistente
try {
  const user = await userService.findById(userId);
  return user;
} catch (error) {
  console.log(error); // Usar logger, no console.log
  return null;        // No retornar null sin manejar error
}
```

### Frontend Error Handling:
```javascript
// ✅ CORRECTO
const fetchDoctors = async () => {
  try {
    showLoadingState(true);
    const response = await fetch('/api/doctors');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const doctors = await response.json();
    displayDoctors(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    showErrorMessage('No se pudieron cargar los médicos. Intenta nuevamente.');
  } finally {
    showLoadingState(false);
  }
};
```

---

## VALIDACIONES

### Input Validation:
```typescript
// ✅ CORRECTO - Validación robusta
const validateUserInput = (userData: any): ValidationResult => {
  const errors: string[] = [];
  
  // Email validation
  if (!userData.email || !/\S+@\S+\.\S+/.test(userData.email)) {
    errors.push('Email válido es requerido');
  }
  
  // Password validation
  if (!userData.password || userData.password.length < 8) {
    errors.push('Contraseña debe tener al menos 8 caracteres');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
```

---

## PERFORMANCE Y OPTIMIZACIÓN

### Database Queries:
```typescript
// ✅ CORRECTO - Query optimizada
const findDoctorsBySpecialty = async (specialtyId: number, limit = 10) => {
  const query = `
    SELECT d.*, s.name as specialty_name 
    FROM doctors d 
    JOIN specialties s ON d.specialty_id = s.id 
    WHERE d.specialty_id = ? 
    LIMIT ?
  `;
  return await db.query(query, [specialtyId, limit]);
};

// ❌ INCORRECTO - No usar SELECT *
const findDoctors = async () => {
  return await db.query('SELECT * FROM doctors'); // Sin límite
};
```

### Frontend Performance:
```javascript
// ✅ CORRECTO - Debounce en búsqueda
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const debouncedSearch = debounce(performSearch, 300);
```

---

## TESTING

### Test Naming:
```typescript
// ✅ CORRECTO - Nombres descriptivos
describe('UserController', () => {
  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // test implementation
    });
    
    it('should throw error when email is invalid', async () => {
      // test implementation
    });
    
    it('should hash password before saving', async () => {
      // test implementation
    });
  });
});
```

---

## GIT CONVENTIONS

### Commit Messages:
```bash
# ✅ CORRECTO - Conventional Commits
feat: add doctor search functionality
fix: resolve database connection timeout
docs: update installation guide
style: fix eslint warnings in auth controller
refactor: simplify user validation logic
test: add unit tests for doctor service

# ❌ INCORRECTO
Added stuff
Fix bug
Update code
```

### Branch Naming:
```bash
# ✅ CORRECTO
feature/doctor-search
fix/database-connection
hotfix/security-vulnerability
docs/api-documentation

# ❌ INCORRECTO
new-feature
bug-fix
johns-branch
```

---

**Estas convenciones deben seguirse estrictamente para mantener código limpio y consistente en todo el proyecto.**