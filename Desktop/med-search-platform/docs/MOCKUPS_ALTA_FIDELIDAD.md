# Mockups de Alta Fidelidad - Med Search Platform

**Versión:** 1.0  
**Fecha:** Diciembre 2024  
**Herramienta:** Especificaciones detalladas para implementación  
**Resoluciones:** Mobile (375px), Tablet (768px), Desktop (1200px)

---

## PALETA DE COLORES DEFINIDA

```css
:root {
  /* Colores principales */
  --primary-blue: #2563eb;      /* Azul médico profesional */
  --primary-blue-dark: #1d4ed8; /* Hover states */
  --primary-blue-light: #dbeafe; /* Backgrounds sutiles */
  
  /* Colores secundarios */
  --success-green: #10b981;     /* Estados exitosos */
  --warning-orange: #f59e0b;    /* Alertas */
  --error-red: #ef4444;         /* Errores */
  
  /* Grises neutros */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-600: #4b5563;
  --gray-800: #1f2937;
  --gray-900: #111827;
  
  /* Tipografía */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  
  /* Espaciado */
  --spacing-1: 0.25rem;   /* 4px */
  --spacing-2: 0.5rem;    /* 8px */
  --spacing-3: 0.75rem;   /* 12px */
  --spacing-4: 1rem;      /* 16px */
  --spacing-6: 1.5rem;    /* 24px */
  --spacing-8: 2rem;      /* 32px */
  --spacing-12: 3rem;     /* 48px */
  
  /* Sombras */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
```

---

## 1. LANDING PAGE (index.html) - MOCKUP DETALLADO

### Header Navigation
```html
<!-- Desktop & Tablet (768px+) -->
<header class="header-main">
  <div class="container-xl">
    <nav class="navbar">
      <!-- Logo area -->
      <div class="navbar-brand">
        <img src="logo.svg" alt="Med Search" class="logo" width="140" height="32">
      </div>
      
      <!-- Navigation links -->
      <ul class="navbar-nav">
        <li><a href="#inicio" class="nav-link active">Inicio</a></li>
        <li><a href="#especialidades" class="nav-link">Especialidades</a></li>
        <li><a href="#como-funciona" class="nav-link">Cómo funciona</a></li>
        <li><a href="#contacto" class="nav-link">Contacto</a></li>
      </ul>
      
      <!-- Auth buttons -->
      <div class="navbar-actions">
        <a href="login.html" class="btn btn-outline">Iniciar Sesión</a>
        <a href="register.html" class="btn btn-primary">Registrarse</a>
      </div>
    </nav>
  </div>
</header>

<!-- Mobile (375px-767px) -->
<header class="header-mobile">
  <div class="mobile-nav">
    <img src="logo.svg" alt="Med Search" class="logo-mobile">
    <button class="menu-toggle" aria-label="Menú">
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </button>
  </div>
</header>
```

**Estilos CSS específicos:**
```css
.header-main {
  background: white;
  border-bottom: 1px solid var(--gray-200);
  padding: var(--spacing-4) 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-nav {
  display: flex;
  gap: var(--spacing-8);
  list-style: none;
}

.nav-link {
  color: var(--gray-600);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-link:hover,
.nav-link.active {
  color: var(--primary-blue);
}
```

### Hero Section
```html
<section class="hero-section">
  <div class="container-xl">
    <div class="hero-content">
      <!-- Text content -->
      <div class="hero-text">
        <h1 class="hero-title">
          Encuentra tu <span class="text-primary">médico especialista</span> 
          cerca de ti
        </h1>
        <p class="hero-description">
          Conectamos pacientes con los mejores profesionales de la salud. 
          Busca, compara y agenda citas de forma rápida y segura.
        </p>
        
        <!-- Search form -->
        <form class="hero-search-form">
          <div class="search-input-group">
            <div class="input-with-icon">
              <svg class="search-icon" width="20" height="20"><!-- search icon --></svg>
              <input 
                type="text" 
                placeholder="Buscar médico o especialidad..."
                class="search-input"
                id="hero-search">
            </div>
            
            <select class="specialty-select">
              <option value="">Todas las especialidades</option>
              <option value="1">Cardiología</option>
              <option value="2">Pediatría</option>
              <option value="3">Dermatología</option>
            </select>
            
            <button type="submit" class="btn btn-primary btn-search">
              <svg class="search-btn-icon" width="16" height="16"><!-- search icon --></svg>
              Buscar
            </button>
          </div>
        </form>
        
        <!-- Quick stats -->
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-number">500+</span>
            <span class="stat-label">Médicos registrados</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">15</span>
            <span class="stat-label">Especialidades</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">1000+</span>
            <span class="stat-label">Pacientes satisfechos</span>
          </div>
        </div>
      </div>
      
      <!-- Hero image -->
      <div class="hero-image">
        <img src="hero-doctor.jpg" alt="Médico profesional" class="hero-img">
        <!-- Floating elements for visual appeal -->
        <div class="floating-card floating-card-1">
          <div class="card-content">
            <div class="card-avatar"></div>
            <div class="card-text">
              <span class="card-name">Dr. García</span>
              <span class="card-specialty">Cardiólogo</span>
            </div>
            <div class="card-rating">⭐ 4.9</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

### Especialidades Grid
```html
<section class="specialties-section" id="especialidades">
  <div class="container-xl">
    <div class="section-header">
      <h2 class="section-title">Especialidades Médicas</h2>
      <p class="section-description">
        Encuentra el especialista que necesitas en tu área
      </p>
    </div>
    
    <div class="specialties-grid">
      <!-- Specialty card template -->
      <div class="specialty-card">
        <div class="specialty-icon">
          <svg class="icon-cardiology" width="48" height="48"><!-- heart icon --></svg>
        </div>
        <h3 class="specialty-name">Cardiología</h3>
        <p class="specialty-description">Especialistas en el corazón y sistema cardiovascular</p>
        <div class="specialty-stats">
          <span class="doctor-count">45 médicos</span>
          <span class="rating-avg">⭐ 4.8</span>
        </div>
        <a href="search.html?specialty=cardiology" class="btn btn-outline btn-small">
          Ver médicos
        </a>
      </div>
      
      <!-- Repeat for: Pediatría, Dermatología, Neurología, Ginecología, etc. -->
    </div>
  </div>
</section>
```

---

## 2. PÁGINA DE BÚSQUEDA (search.html) - MOCKUP DETALLADO

### Search Header
```html
<section class="search-header">
  <div class="container-xl">
    <div class="search-bar-container">
      <form class="advanced-search-form">
        <div class="search-row">
          <div class="search-field">
            <label for="search-query" class="search-label">Buscar médico</label>
            <input 
              type="text" 
              id="search-query"
              placeholder="Nombre del médico o especialidad"
              class="search-input-main"
              value="Cardiólogo">
          </div>
          
          <div class="search-field">
            <label for="location" class="search-label">Ubicación</label>
            <input 
              type="text" 
              id="location"
              placeholder="Ciudad o código postal"
              class="search-input-main">
          </div>
          
          <div class="search-field">
            <button type="submit" class="btn btn-primary btn-search-main">
              <svg class="search-icon" width="20" height="20"></svg>
              Buscar
            </button>
          </div>
        </div>
        
        <!-- Quick filters -->
        <div class="quick-filters">
          <span class="filter-label">Filtros populares:</span>
          <button class="filter-chip active">Disponible hoy</button>
          <button class="filter-chip">Consulta online</button>
          <button class="filter-chip">Mejor calificado</button>
          <button class="filter-chip">Cerca de mí</button>
        </div>
      </form>
    </div>
  </div>
</section>
```

### Results Layout
```html
<section class="search-results">
  <div class="container-xl">
    <div class="results-layout">
      <!-- Sidebar filters -->
      <aside class="filters-sidebar">
        <div class="filter-section">
          <h3 class="filter-title">Especialidad</h3>
          <div class="filter-options">
            <label class="filter-checkbox">
              <input type="checkbox" checked>
              <span class="checkmark"></span>
              Cardiología (45)
            </label>
            <label class="filter-checkbox">
              <input type="checkbox">
              <span class="checkmark"></span>
              Pediatría (32)
            </label>
          </div>
        </div>
        
        <div class="filter-section">
          <h3 class="filter-title">Precio de consulta</h3>
          <div class="price-range">
            <input type="range" class="price-slider" min="200" max="1000" value="600">
            <div class="price-display">$200 - $1000</div>
          </div>
        </div>
        
        <div class="filter-section">
          <h3 class="filter-title">Disponibilidad</h3>
          <div class="filter-options">
            <label class="filter-radio">
              <input type="radio" name="availability" value="today">
              <span class="radio-mark"></span>
              Disponible hoy
            </label>
            <label class="filter-radio">
              <input type="radio" name="availability" value="week">
              <span class="radio-mark"></span>
              Esta semana
            </label>
          </div>
        </div>
      </aside>
      
      <!-- Results content -->
      <main class="results-content">
        <!-- Results header -->
        <div class="results-header">
          <div class="results-count">
            <h2>Encontrados 24 médicos</h2>
            <p>Cardiología en Ciudad de México</p>
          </div>
          <div class="results-controls">
            <select class="sort-select">
              <option value="relevance">Más relevante</option>
              <option value="rating">Mejor calificados</option>
              <option value="price">Menor precio</option>
              <option value="availability">Disponibilidad</option>
            </select>
          </div>
        </div>
        
        <!-- Doctor cards list -->
        <div class="doctors-list">
          <!-- Doctor card detailed -->
          <article class="doctor-card">
            <div class="doctor-main-info">
              <div class="doctor-avatar">
                <img src="doctor-1.jpg" alt="Dr. Juan López" class="doctor-photo">
                <div class="verification-badge" title="Médico verificado">
                  <svg class="verified-icon" width="16" height="16"><!-- check icon --></svg>
                </div>
              </div>
              
              <div class="doctor-details">
                <div class="doctor-header">
                  <h3 class="doctor-name">Dr. Juan López Martínez</h3>
                  <div class="doctor-rating">
                    <div class="stars">⭐⭐⭐⭐⭐</div>
                    <span class="rating-number">4.9</span>
                    <span class="reviews-count">(127 reseñas)</span>
                  </div>
                </div>
                
                <div class="doctor-specialty">
                  <span class="specialty-badge">Cardiología</span>
                  <span class="experience">15 años de experiencia</span>
                </div>
                
                <div class="doctor-location">
                  <svg class="location-icon" width="16" height="16"><!-- location icon --></svg>
                  <span>Hospital ABC, Col. Polanco</span>
                  <span class="distance">2.3 km</span>
                </div>
                
                <div class="doctor-highlights">
                  <span class="highlight-item">
                    <svg class="clock-icon" width="14" height="14"></svg>
                    Disponible hoy
                  </span>
                  <span class="highlight-item">
                    <svg class="video-icon" width="14" height="14"></svg>
                    Consulta online
                  </span>
                </div>
              </div>
            </div>
            
            <div class="doctor-actions">
              <div class="consultation-price">
                <span class="price-label">Consulta desde</span>
                <span class="price-amount">$500</span>
              </div>
              
              <div class="action-buttons">
                <button class="btn btn-outline btn-small">Ver perfil</button>
                <button class="btn btn-primary btn-small">Agendar cita</button>
              </div>
              
              <button class="favorite-button" aria-label="Agregar a favoritos">
                <svg class="heart-icon" width="20" height="20"><!-- heart icon --></svg>
              </button>
            </div>
          </article>
        </div>
        
        <!-- Pagination -->
        <nav class="pagination-nav">
          <button class="btn btn-outline" disabled>Anterior</button>
          <div class="page-numbers">
            <button class="page-btn active">1</button>
            <button class="page-btn">2</button>
            <button class="page-btn">3</button>
            <span class="page-dots">...</span>
            <button class="page-btn">8</button>
          </div>
          <button class="btn btn-outline">Siguiente</button>
        </nav>
      </main>
    </div>
  </div>
</section>
```

---

## 3. PERFIL DE MÉDICO (profile.html) - MOCKUP DETALLADO

### Doctor Header
```html
<section class="doctor-profile-header">
  <div class="container-xl">
    <div class="profile-hero">
      <div class="profile-main">
        <div class="profile-photo-section">
          <img src="doctor-detail.jpg" alt="Dr. Juan López" class="profile-photo">
          <div class="verification-badge-large">
            <svg class="verified-icon" width="24" height="24"></svg>
            <span>Verificado</span>
          </div>
        </div>
        
        <div class="profile-info">
          <div class="profile-header">
            <h1 class="doctor-name-large">Dr. Juan López Martínez</h1>
            <div class="doctor-rating-large">
              <div class="stars-large">⭐⭐⭐⭐⭐</div>
              <span class="rating-number-large">4.9</span>
              <span class="reviews-count-large">(127 reseñas)</span>
            </div>
          </div>
          
          <div class="profile-specialties">
            <span class="specialty-badge-large">Cardiología</span>
            <span class="subspecialty">Cardiología Intervencionista</span>
          </div>
          
          <div class="profile-experience">
            <div class="experience-item">
              <svg class="graduation-icon" width="20" height="20"></svg>
              <span>15 años de experiencia</span>
            </div>
            <div class="experience-item">
              <svg class="certificate-icon" width="20" height="20"></svg>
              <span>Certificado por Consejo Mexicano</span>
            </div>
          </div>
          
          <div class="profile-location">
            <svg class="location-icon" width="20" height="20"></svg>
            <div class="location-details">
              <span class="hospital-name">Hospital ABC Santa Fe</span>
              <span class="address">Av. Carlos Graef Fernández 154, Tlalpan</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="profile-actions">
        <div class="consultation-info">
          <div class="price-info">
            <span class="price-label">Consulta presencial</span>
            <span class="price-large">$500</span>
          </div>
          <div class="price-info">
            <span class="price-label">Consulta en línea</span>
            <span class="price-large">$400</span>
          </div>
        </div>
        
        <div class="availability-quick">
          <span class="availability-label">Próxima disponibilidad:</span>
          <span class="next-slot">Hoy 3:00 PM</span>
        </div>
        
        <div class="action-buttons-large">
          <button class="btn btn-primary btn-large">
            <svg class="calendar-icon" width="20" height="20"></svg>
            Agendar Cita
          </button>
          <button class="btn btn-outline btn-large">
            <svg class="message-icon" width="20" height="20"></svg>
            Enviar Mensaje
          </button>
        </div>
      </div>
    </div>
  </div>
</section>
```

---

## 4. LOGIN/REGISTRO - MOCKUPS DETALLADOS

### Login Form
```html
<section class="auth-section">
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <img src="logo.svg" alt="Med Search" class="auth-logo">
        <h1 class="auth-title">Iniciar Sesión</h1>
        <p class="auth-subtitle">Accede a tu cuenta para continuar</p>
      </div>
      
      <form class="auth-form">
        <div class="form-group">
          <label for="email" class="form-label">Correo electrónico</label>
          <input 
            type="email" 
            id="email"
            class="form-input"
            placeholder="tu@email.com"
            required>
          <div class="form-error" id="email-error"></div>
        </div>
        
        <div class="form-group">
          <label for="password" class="form-label">Contraseña</label>
          <div class="password-input-group">
            <input 
              type="password" 
              id="password"
              class="form-input"
              placeholder="••••••••"
              required>
            <button type="button" class="password-toggle" aria-label="Mostrar contraseña">
              <svg class="eye-icon" width="20" height="20"></svg>
            </button>
          </div>
          <div class="form-error" id="password-error"></div>
        </div>
        
        <div class="form-options">
          <label class="checkbox-label">
            <input type="checkbox" id="remember">
            <span class="checkbox-custom"></span>
            Recordarme
          </label>
          <a href="forgot-password.html" class="forgot-link">¿Olvidaste tu contraseña?</a>
        </div>
        
        <button type="submit" class="btn btn-primary btn-full">
          <span class="btn-text">Iniciar Sesión</span>
          <div class="btn-loading" hidden>
            <svg class="spinner" width="20" height="20"></svg>
          </div>
        </button>
        
        <div class="auth-divider">
          <span>o continúa con</span>
        </div>
        
        <div class="social-buttons">
          <button type="button" class="btn btn-social">
            <svg class="google-icon" width="20" height="20"></svg>
            Google
          </button>
          <button type="button" class="btn btn-social">
            <svg class="facebook-icon" width="20" height="20"></svg>
            Facebook
          </button>
        </div>
        
        <div class="auth-footer">
          <span>¿No tienes cuenta? </span>
          <a href="register.html" class="auth-link">Regístrate aquí</a>
        </div>
      </form>
    </div>
    
    <!-- Side illustration -->
    <div class="auth-illustration">
      <img src="auth-illustration.svg" alt="Médicos profesionales" class="illustration-img">
      <div class="illustration-content">
        <h2>Conecta con los mejores médicos</h2>
        <p>Más de 500 profesionales de la salud te esperan</p>
      </div>
    </div>
  </div>
</section>
```

---

## RESPONSIVE BREAKPOINTS

### Mobile (375px - 767px)
```css
@media (max-width: 767px) {
  .hero-content {
    flex-direction: column;
    text-align: center;
  }
  
  .hero-search-form {
    flex-direction: column;
    gap: var(--spacing-3);
  }
  
  .specialties-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-4);
  }
  
  .results-layout {
    flex-direction: column;
  }
  
  .filters-sidebar {
    order: 2;
    margin-top: var(--spacing-6);
  }
}
```

### Tablet (768px - 1199px)
```css
@media (min-width: 768px) and (max-width: 1199px) {
  .specialties-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .doctor-card {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .doctor-actions {
    width: 100%;
    margin-top: var(--spacing-4);
  }
}
```

### Desktop (1200px+)
```css
@media (min-width: 1200px) {
  .specialties-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .results-layout {
    display: flex;
    gap: var(--spacing-8);
  }
  
  .filters-sidebar {
    width: 280px;
    flex-shrink: 0;
  }
}
```

---

**Estos mockups proporcionan especificaciones completas para la implementación frontend de Semana 3, con todos los componentes, estilos y comportamientos responsivos definidos.**