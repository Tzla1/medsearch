# Guía de Estilo Visual - Med Search Platform

**Versión:** 1.0  
**Fecha:** Diciembre 2024  
**Tipo:** Design System Minimalista  
**Aplicación:** Toda la interfaz de usuario  

---

## FILOSOFÍA DE DISEÑO

### Principios Fundamentales:
1. **Simplicidad:** Interfaz limpia y sin distracciones
2. **Confianza:** Colores y tipografía que inspiren profesionalismo médico
3. **Accesibilidad:** Diseño inclusivo para todos los usuarios
4. **Consistencia:** Elementos uniformes en toda la aplicación
5. **Claridad:** Información médica presentada de forma comprensible

### Personalidad de Marca:
- **Profesional:** Serio pero accesible
- **Confiable:** Seguro y establecido
- **Moderno:** Tecnología actual sin ser intimidante
- **Humano:** Centrado en el cuidado de las personas

---

## PALETA DE COLORES

### Colores Principales
```css
:root {
  /* Azul Médico - Color principal */
  --primary-50: #eff6ff;   /* Backgrounds muy sutiles */
  --primary-100: #dbeafe;  /* Hover states sutiles */
  --primary-200: #bfdbfe;  /* Borders suaves */
  --primary-300: #93c5fd;  /* Elementos decorativos */
  --primary-400: #60a5fa;  /* Botones secundarios */
  --primary-500: #3b82f6;  /* Color principal brand */
  --primary-600: #2563eb;  /* Botones principales */
  --primary-700: #1d4ed8;  /* Hover states */
  --primary-800: #1e40af;  /* Estados activos */
  --primary-900: #1e3a8a;  /* Textos enfáticos */
}
```

### Colores Semánticos
```css
:root {
  /* Success - Verde médico */
  --success-50: #f0fdf4;
  --success-500: #22c55e;
  --success-600: #16a34a;
  --success-700: #15803d;
  
  /* Warning - Naranja suave */
  --warning-50: #fffbeb;
  --warning-500: #f59e0b;
  --warning-600: #d97706;
  --warning-700: #b45309;
  
  /* Error - Rojo médico */
  --error-50: #fef2f2;
  --error-500: #ef4444;
  --error-600: #dc2626;
  --error-700: #b91c1c;
  
  /* Info - Azul información */
  --info-50: #f0f9ff;
  --info-500: #06b6d4;
  --info-600: #0891b2;
  --info-700: #0e7490;
}
```

### Escala de Grises
```css
:root {
  /* Grises neutros para textos y backgrounds */
  --gray-50: #f9fafb;    /* Backgrounds muy claros */
  --gray-100: #f3f4f6;   /* Cards y sections */
  --gray-200: #e5e7eb;   /* Borders sutiles */
  --gray-300: #d1d5db;   /* Borders normales */
  --gray-400: #9ca3af;   /* Placeholders */
  --gray-500: #6b7280;   /* Textos secundarios */
  --gray-600: #4b5563;   /* Textos normales */
  --gray-700: #374151;   /* Textos importantes */
  --gray-800: #1f2937;   /* Títulos */
  --gray-900: #111827;   /* Textos principales */
}
```

### Uso de Colores
```css
/* Aplicación práctica */
.text-primary { color: var(--primary-600); }
.bg-primary { background-color: var(--primary-600); }
.border-primary { border-color: var(--primary-300); }

.text-success { color: var(--success-600); }
.text-warning { color: var(--warning-600); }
.text-error { color: var(--error-600); }

.text-muted { color: var(--gray-500); }
.text-body { color: var(--gray-700); }
.text-heading { color: var(--gray-900); }
```

---

## TIPOGRAFÍA

### Fuente Principal
```css
:root {
  /* Inter - Fuente principal del sistema */
  --font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 
                         'Segoe UI', Roboto, 'Helvetica Neue', Arial, 
                         sans-serif;
                         
  /* Fuente monospace para códigos/números */
  --font-family-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', 
                       Consolas, 'Courier New', monospace;
}
```

### Escala Tipográfica
```css
:root {
  /* Tamaños de fuente - Escala modular 1.250 (Major Third) */
  --text-xs: 0.75rem;      /* 12px - Pequeñas anotaciones */
  --text-sm: 0.875rem;     /* 14px - Textos secundarios */
  --text-base: 1rem;       /* 16px - Texto base */
  --text-lg: 1.125rem;     /* 18px - Texto destacado */
  --text-xl: 1.25rem;      /* 20px - Subtítulos */
  --text-2xl: 1.5rem;      /* 24px - Títulos de sección */
  --text-3xl: 1.875rem;    /* 30px - Títulos principales */
  --text-4xl: 2.25rem;     /* 36px - Headers grandes */
  --text-5xl: 3rem;        /* 48px - Hero titles */
  
  /* Pesos de fuente */
  --font-light: 300;
  --font-regular: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  
  /* Altura de línea */
  --leading-tight: 1.25;    /* Títulos */
  --leading-snug: 1.375;    /* Subtítulos */
  --leading-normal: 1.5;    /* Texto normal */
  --leading-relaxed: 1.625; /* Párrafos largos */
}
```

### Clases de Texto
```css
/* Títulos */
.h1 {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  color: var(--gray-900);
  margin-bottom: 1rem;
}

.h2 {
  font-size: var(--text-3xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
  color: var(--gray-800);
  margin-bottom: 0.75rem;
}

.h3 {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
  color: var(--gray-800);
  margin-bottom: 0.5rem;
}

.h4 {
  font-size: var(--text-xl);
  font-weight: var(--font-medium);
  line-height: var(--leading-snug);
  color: var(--gray-700);
  margin-bottom: 0.5rem;
}

/* Textos */
.text-body {
  font-size: var(--text-base);
  font-weight: var(--font-regular);
  line-height: var(--leading-normal);
  color: var(--gray-700);
}

.text-small {
  font-size: var(--text-sm);
  font-weight: var(--font-regular);
  line-height: var(--leading-normal);
  color: var(--gray-600);
}

.text-caption {
  font-size: var(--text-xs);
  font-weight: var(--font-regular);
  line-height: var(--leading-normal);
  color: var(--gray-500);
}
```

---

## ESPACIADO Y LAYOUT

### Sistema de Espaciado
```css
:root {
  /* Escala de espaciado basada en múltiplos de 4px */
  --space-0: 0;
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */
  --space-20: 5rem;    /* 80px */
  --space-24: 6rem;    /* 96px */
}
```

### Grid y Contenedores
```css
/* Contenedores principales */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

.container-sm { max-width: 640px; }
.container-md { max-width: 768px; }
.container-lg { max-width: 1024px; }
.container-xl { max-width: 1200px; }

/* Grid system */
.grid {
  display: grid;
  gap: var(--space-6);
}

.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }

/* Flexbox utilities */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-wrap { flex-wrap: wrap; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
```

---

## COMPONENTES UI

### Botones
```css
/* Botón base */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  line-height: 1;
  border-radius: 8px;
  border: 1px solid transparent;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

/* Variantes de botones */
.btn-primary {
  background-color: var(--primary-600);
  color: white;
  border-color: var(--primary-600);
}

.btn-primary:hover {
  background-color: var(--primary-700);
  border-color: var(--primary-700);
  transform: translateY(-1px);
}

.btn-outline {
  background-color: transparent;
  color: var(--primary-600);
  border-color: var(--primary-300);
}

.btn-outline:hover {
  background-color: var(--primary-50);
  border-color: var(--primary-400);
}

.btn-secondary {
  background-color: var(--gray-100);
  color: var(--gray-700);
  border-color: var(--gray-200);
}

.btn-secondary:hover {
  background-color: var(--gray-200);
  border-color: var(--gray-300);
}

/* Tamaños de botones */
.btn-small {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
}

.btn-large {
  padding: var(--space-4) var(--space-8);
  font-size: var(--text-lg);
}

.btn-full {
  width: 100%;
}
```

### Cards
```css
.card {
  background-color: white;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  padding: var(--space-6);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.card:hover {
  border-color: var(--gray-300);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-header {
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--gray-100);
}

.card-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--gray-900);
  margin: 0;
}

.card-body {
  margin-bottom: var(--space-4);
}

.card-footer {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--gray-100);
}
```

### Formularios
```css
/* Form groups */
.form-group {
  margin-bottom: var(--space-6);
}

.form-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--gray-700);
  margin-bottom: var(--space-2);
}

.form-label.required::after {
  content: ' *';
  color: var(--error-500);
}

/* Inputs */
.form-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-base);
  line-height: 1.5;
  color: var(--gray-700);
  background-color: white;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input::placeholder {
  color: var(--gray-400);
}

.form-input:disabled {
  background-color: var(--gray-50);
  color: var(--gray-500);
  cursor: not-allowed;
}

/* Estados de error */
.form-input.error {
  border-color: var(--error-500);
}

.form-error {
  display: block;
  font-size: var(--text-sm);
  color: var(--error-600);
  margin-top: var(--space-1);
}
```

### Badges y Tags
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.badge-primary {
  background-color: var(--primary-100);
  color: var(--primary-800);
}

.badge-success {
  background-color: var(--success-100);
  color: var(--success-800);
}

.badge-warning {
  background-color: var(--warning-100);
  color: var(--warning-800);
}

.badge-error {
  background-color: var(--error-100);
  color: var(--error-800);
}
```

---

## ICONOGRAFÍA

### Iconos del Sistema
```css
:root {
  /* Tamaños estándar de iconos */
  --icon-xs: 12px;
  --icon-sm: 16px;
  --icon-md: 20px;
  --icon-lg: 24px;
  --icon-xl: 32px;
  --icon-2xl: 48px;
}

.icon {
  display: inline-block;
  width: var(--icon-md);
  height: var(--icon-md);
  fill: currentColor;
  vertical-align: middle;
}

.icon-sm { width: var(--icon-sm); height: var(--icon-sm); }
.icon-lg { width: var(--icon-lg); height: var(--icon-lg); }
.icon-xl { width: var(--icon-xl); height: var(--icon-xl); }
```

### Iconos Médicos Específicos
```html
<!-- Especialidades médicas -->
🫀 Cardiología
👶 Pediatría  
🧴 Dermatología
🧠 Neurología
👩 Ginecología
👁 Oftalmología
🦴 Traumatología
🧘 Psiquiatría
⚗️ Endocrinología
🫃 Gastroenterología
🫁 Neumología
🩺 Medicina General
🦷 Odontología

<!-- Estados y acciones -->
✅ Verificado
⭐ Calificación
📍 Ubicación
💰 Precio
🕐 Horario
📞 Contacto
✉️ Email
📅 Cita
❤️ Favorito
🔍 Buscar
```

---

## RESPONSIVE DESIGN

### Breakpoints
```css
:root {
  /* Breakpoints del sistema */
  --bp-sm: 640px;   /* Tablets pequeñas */
  --bp-md: 768px;   /* Tablets */
  --bp-lg: 1024px;  /* Laptops */
  --bp-xl: 1280px;  /* Desktops */
  --bp-2xl: 1536px; /* Pantallas grandes */
}

/* Media queries */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

### Adaptaciones Móviles
```css
/* Mobile-first approach */
.mobile-hidden { display: none; }
.desktop-hidden { display: block; }

@media (min-width: 768px) {
  .mobile-hidden { display: block; }
  .desktop-hidden { display: none; }
  
  /* Ajustes para tablet/desktop */
  .container { padding: 0 var(--space-8); }
  
  .btn {
    padding: var(--space-3) var(--space-6);
  }
  
  .card {
    padding: var(--space-8);
  }
}
```

---

## ESTADOS INTERACTIVOS

### Hover States
```css
.interactive:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-interactive:hover {
  border-color: var(--primary-300);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}
```

### Focus States
```css
.focusable:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}
```

### Loading States
```css
.loading {
  position: relative;
  color: transparent;
}

.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 16px;
  height: 16px;
  margin: -8px 0 0 -8px;
  border: 2px solid var(--gray-300);
  border-top-color: var(--primary-600);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

## ACCESIBILIDAD

### Contraste de Colores
- **AA Normal:** Mínimo 4.5:1
- **AA Grande:** Mínimo 3:1  
- **AAA:** Mínimo 7:1

### Focus Visible
```css
.focus-visible:focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}
```

### Screen Readers
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

---

## IMPLEMENTACIÓN

### CSS Custom Properties Setup
```css
/* Cargar en el archivo principal CSS */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

:root {
  /* Todas las custom properties definidas arriba */
}

/* Reset básico */
*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: var(--font-family-primary);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--gray-700);
  background-color: var(--gray-50);
}
```

### Nomenclatura de Clases
- **Componentes:** `.card`, `.btn`, `.form-input`
- **Modificadores:** `.btn-primary`, `.card-large`
- **Estados:** `.is-active`, `.is-loading`, `.is-disabled`
- **Utilidades:** `.text-center`, `.mb-4`, `.flex`

---

**Esta guía de estilo proporciona la base visual completa para implementar una interfaz consistente, profesional y accesible en Med Search Platform.**