# 🏥 MedSearch Platform - Guía de Instalación y Uso

## 🚀 Instalación Completa

### 1. Requisitos Previos
- Node.js 16+ instalado
- MySQL 8.0+ (opcional, funciona en modo demo sin BD)
- Visual Studio Code (recomendado)

### 2. Instalación del Frontend (React + Vite)

```bash
# Navegar al directorio del frontend
cd frontend

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

La aplicación se abrirá en `http://localhost:5173`

### 3. Instalación del Backend (Opcional)

```bash
# Navegar al directorio del backend
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno (crear archivo .env)
cp .env.example .env

# Ejecutar en modo desarrollo
npm run dev
```

El backend se ejecutará en `http://localhost:3001`

## 🎯 Funcionalidades Implementadas

### ✅ Sistema de Autenticación
- **Registro de usuarios** con validación completa
- **Login seguro** con JWT
- **Protección de rutas** - requiere login para agendar citas

### ✅ Búsqueda de Doctores
- **20 doctores por especialidad** con datos realistas
- **Filtros avanzados** por especialidad, ubicación, precio, rating
- **8 especialidades principales** completamente pobladas:
  - Medicina General
  - Medicina Familiar
  - Cardiología
  - Dermatología
  - Endocrinología
  - Ginecología
  - Pediatría
  - Neurología
  - Psiquiatría
  - Ortopedia y Traumatología

### ✅ Sistema de Citas Médicas
- **Formulario inteligente** que se adapta a cada especialidad
- **Preguntas específicas** según el tipo de doctor:
  - **Cardiología**: Dolor en pecho, palpitaciones, antecedentes familiares
  - **Dermatología**: Tipo de problema de piel, alergias, medicamentos
  - **Pediatría**: Edad del paciente, vacunas, síntomas del niño
  - **Neurología**: Dolores de cabeza, mareos, problemas de memoria
  - **Ginecología**: Tipo de consulta, última menstruación, anticonceptivos
  - Y más...

### ✅ Interfaz de Usuario Completa
- **Diseño responsivo** que funciona en móviles y desktop
- **Navegación fluida** entre todas las páginas
- **Notificaciones Toast** para mejor UX
- **Estados de carga** y validación en tiempo real

## 🔐 Credenciales de Prueba

### Para Login Demo:
- **Email**: `paciente@demo.com`
- **Contraseña**: `demo123`

### O crear nueva cuenta:
- Usar el formulario de registro con datos reales
- La cuenta se guardará en la base de datos (si está configurada)

## 📱 Flujo de Uso Completo

### 1. Página Principal
- Ver doctores destacados
- Buscar por especialidad
- Hacer búsqueda con filtros

### 2. Intentar Agendar Cita (Sin Login)
- Click en "Agendar cita" en cualquier doctor
- Sistema redirige automáticamente a login
- Mensaje: "Debes iniciar sesión para agendar una cita"

### 3. Proceso de Autenticación
- **Opción A**: Login con credenciales demo
- **Opción B**: Crear nueva cuenta con el registro
- Validación completa de todos los campos

### 4. Agendamiento de Cita (Con Login)
- Click en "Agendar cita" ahora funciona
- Formulario con información del paciente
- **Preguntas específicas según la especialidad del doctor**
- Selección de fecha y hora
- Confirmación de la cita

### 5. Confirmación
- Resumen completo de la cita
- Detalles del doctor y costo
- Número de confirmación

## 🛠️ Modo Demo vs Modo Completo

### Modo Demo (Solo Frontend)
- ✅ Funciona sin base de datos
- ✅ Datos de prueba precargados
- ✅ Todas las funciones de UI funcionan
- ✅ Autenticación en localStorage
- ✅ 160+ doctores de prueba
- ✅ Sistema de citas completo

### Modo Completo (Frontend + Backend + BD)
- ✅ Base de datos real MySQL
- ✅ Autenticación JWT segura
- ✅ API REST completa
- ✅ Persistencia de datos
- ✅ Sistema de búsqueda optimizado

## 🎨 Características Técnicas

### Frontend (React + TypeScript + Vite)
- **Componentes reutilizables** con TypeScript
- **Estados de carga** y manejo de errores
- **Validación de formularios** en tiempo real
- **Toast notifications** para mejor UX
- **Responsive design** con Tailwind CSS

### Backend (Node.js + Express + TypeScript)
- **API REST** con documentación
- **Autenticación JWT** segura
- **Validación de datos** con Joi
- **Base de datos MySQL** optimizada
- **Middleware de seguridad** con Helmet y CORS

### Base de Datos
- **Esquema completo** con relaciones
- **160+ doctores** distribuidos en 10 especialidades
- **Sistema de ratings** y reseñas
- **Índices optimizados** para búsquedas rápidas

## 🚨 Resolución de Problemas

### Si el Frontend no carga:
```bash
cd frontend
npm install
npm run dev
```

### Si los botones no funcionan:
- Verificar que estás usando la versión React (`npm run dev` en frontend)
- No la versión vanilla HTML (que está en `frontend/vanilla/`)

### Si el Backend no conecta:
- El frontend funciona en modo demo automáticamente
- Todas las funciones están disponibles sin backend

### Para ver la versión completamente funcional:
1. `cd frontend`
2. `npm install`
3. `npm run dev`
4. Abrir `http://localhost:5173`
5. Probar el flujo completo de autenticación y citas

## 🎉 ¡Todo Funcionando!

El sistema está **100% funcional** y resuelve completamente la problemática de:
- ✅ Conectar pacientes con doctores especializados
- ✅ Sistema de autenticación seguro
- ✅ Agendamiento inteligente de citas médicas
- ✅ Preguntas específicas por especialidad
- ✅ Interfaz moderna y responsive
- ✅ Experiencia de usuario completa

**¡Disfruta explorando la plataforma médica más completa!** 🩺✨