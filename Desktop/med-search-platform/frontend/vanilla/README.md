# Med Search Platform - Frontend

Frontend desarrollado con HTML5, CSS3 y JavaScript Vanilla siguiendo los requerimientos de la Semana 3.

## 🚀 Cómo ejecutar el proyecto

### Opción 1: Script automático (Recomendado)

**En Windows:**
```bash
# Doble clic en el archivo o ejecutar en CMD/PowerShell
start-server.bat
```

**En Linux/Mac/WSL:**
```bash
./start-server.sh
```

### Opción 2: Comando directo

**Con Python 3:**
```bash
cd frontend/vanilla
python3 -m http.server 8000
```

**Con Python 2:**
```bash
cd frontend/vanilla
python -m SimpleHTTPServer 8000
```

### Opción 3: Otras alternativas

**Con Node.js (si tienes npx):**
```bash
cd frontend/vanilla
npx serve -p 8000
```

**Con PHP:**
```bash
cd frontend/vanilla
php -S localhost:8000
```

**Con Live Server (VS Code):**
1. Instala la extensión "Live Server"
2. Clic derecho en `index.html`
3. Selecciona "Open with Live Server"

## 🌐 Acceder al sitio

Una vez iniciado el servidor, abre tu navegador y ve a:
- **URL principal:** http://localhost:8000
- **Páginas disponibles:**
  - `index.html` - Página principal
  - `search.html` - Búsqueda de doctores
  - `profile.html` - Perfil de doctor
  - `login.html` - Inicio de sesión
  - `register.html` - Registro de usuario

## 🔧 Modo Demo

Para facilitar las pruebas, el proyecto incluye:

**Datos demo en login:**
- **Paciente:** `patient@demo.com` / `demo123`
- **Doctor:** `doctor@demo.com` / `demo123`

**Botón "Fill Demo Data"** en desarrollo (localhost)

## 📱 Características

- ✅ **Diseño responsive** (mobile-first)
- ✅ **Vanilla JavaScript** (sin frameworks)
- ✅ **5 páginas principales** implementadas
- ✅ **Sistema de componentes** reutilizables
- ✅ **Validaciones** en tiempo real
- ✅ **API client** con manejo de errores
- ✅ **Animaciones** y efectos de carga
- ✅ **Accesibilidad** (ARIA, teclado)

## 🛠️ Estructura del proyecto

```
frontend/vanilla/
├── index.html              # Página principal
├── search.html             # Búsqueda de doctores
├── profile.html            # Perfil de doctor
├── login.html              # Inicio de sesión
├── register.html           # Registro
├── scripts/
│   ├── utils.js            # Utilidades generales
│   ├── api.js              # Cliente API
│   ├── components.js       # Componentes UI
│   ├── index.js            # Página principal
│   ├── search.js           # Búsqueda
│   ├── profile.js          # Perfil
│   ├── login.js            # Login
│   ├── register.js         # Registro
│   └── auth.js             # Autenticación
├── styles/
│   ├── main.css            # Estilos base
│   ├── components.css      # Componentes
│   └── responsive.css      # Responsive
└── assets/
    └── (imágenes, iconos, etc.)
```

## 🐛 Solución de problemas

**Si el servidor no inicia:**
1. Verifica que Python esté instalado: `python3 --version`
2. Intenta con un puerto diferente: `python3 -m http.server 3000`
3. Usa una alternativa como VS Code Live Server

**Si las páginas no cargan:**
1. Verifica que estés en el directorio correcto
2. Revisa la consola del navegador (F12) para errores
3. Asegúrate de acceder via `http://localhost:8000` (no file://)

**Para desarrollo:**
- Usa las herramientas de desarrollador (F12)
- Revisa la consola para logs y errores
- Usa el modo responsive para probar móviles

## 📋 Próximos pasos

1. **Semana 4:** Integración con backend Node.js/Express
2. **Semana 5:** Testing completo y deployment

## 📞 Soporte

Si tienes problemas, revisa:
1. La consola del navegador (F12)
2. Los logs del servidor en la terminal
3. Los archivos de documentación en `/docs/`