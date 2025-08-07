# Wireframes - Med Search Platform

**Versión:** 1.0  
**Fecha:** Diciembre 2024  
**Tipo:** Wireframes de baja fidelidad  

---

## 1. LANDING PAGE (index.html)

```
┌─────────────────────────────────────────────────────────┐
│  [LOGO] Med Search    [Home] [About] [Contact] [Login]  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    HERO SECTION                         │
│                                                         │
│         Encuentra tu médico especialista               │
│              cerca de ti                               │
│                                                         │
│  ┌─────────────────┐ ┌──────────────┐ ┌──────────────┐ │
│  │ Buscar médico... │ │ Especialidad │ │   [Buscar]   │ │
│  └─────────────────┘ └──────────────┘ └──────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  ESPECIALIDADES                         │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │   [📱]   │ │   [🦷]   │ │   [👁]   │ │   [❤️]   │   │
│  │Cardiolog.│ │Dentista  │ │Oftalmol. │ │Pediatra  │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │   [🧠]   │ │   [🏥]   │ │   [💊]   │ │   [🔬]   │   │
│  │Neurólogo │ │Medicina  │ │Farmacol. │ │Laborat.  │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                 MÉDICOS DESTACADOS                      │
│                                                         │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────┐ │
│  │  [👨‍⚕️] Dr. López │ │  [👩‍⚕️] Dra. García│ │ [👨‍⚕️] Dr. Ruiz│ │
│  │  Cardiólogo     │ │  Pediatra       │ │ Neurólogo   │ │
│  │  ⭐⭐⭐⭐⭐ (4.9) │ │  ⭐⭐⭐⭐⭐ (4.8) │ │ ⭐⭐⭐⭐⭐ (4.7)│ │
│  │  [Ver perfil]   │ │  [Ver perfil]   │ │ [Ver perfil]│ │
│  └─────────────────┘ └─────────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   FOOTER                                │
│  © 2024 Med Search | Términos | Privacidad | Contacto  │
└─────────────────────────────────────────────────────────┘
```

---

## 2. PÁGINA DE BÚSQUEDA (search.html)

```
┌─────────────────────────────────────────────────────────┐
│  [LOGO] Med Search    [Home] [About] [Contact] [Login]  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  ┌─────────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │ Buscar médico... │ │ Especialidad │ │   [Buscar]   │   │
│  └─────────────────┘ └──────────────┘ └──────────────┘   │
└─────────────────────────────────────────────────────────┘

┌──────────────┬─────────────────────────────────────────────┐
│   FILTROS    │               RESULTADOS                    │
│              │                                             │
│ Especialidad │  ┌─────────────────────────────────────────┐ │
│ ☐ Cardiología│  │ [👨‍⚕️] Dr. Juan López - Cardiólogo      │ │
│ ☐ Pediatría  │  │ 📍 Av. Principal 123, Ciudad            │ │
│ ☐ Neurología │  │ ⭐⭐⭐⭐⭐ (4.9) - 127 reseñas          │ │
│              │  │ 💰 $500 - 🕐 Lun-Vie 9:00-17:00        │ │
│ Ubicación    │  │ [Ver perfil] [Agendar cita]            │ │
│ ☐ Zona Norte │  └─────────────────────────────────────────┘ │
│ ☐ Zona Sur   │                                             │
│ ☐ Centro     │  ┌─────────────────────────────────────────┐ │
│              │  │ [👩‍⚕️] Dra. María García - Pediatra     │ │
│ Precio       │  │ 📍 Calle Salud 456, Ciudad              │ │
│ ○ Cualquiera │  │ ⭐⭐⭐⭐⭐ (4.8) - 89 reseñas           │ │
│ ○ $0-$300    │  │ 💰 $400 - 🕐 Lun-Sab 8:00-16:00        │ │
│ ○ $300-$600  │  │ [Ver perfil] [Agendar cita]            │ │
│ ○ $600+      │  └─────────────────────────────────────────┘ │
│              │                                             │
│ [Limpiar]    │         [Anterior] [1] [2] [3] [Siguiente] │
└──────────────┴─────────────────────────────────────────────┘
```

---

## 3. PERFIL DE MÉDICO (profile.html)

```
┌─────────────────────────────────────────────────────────┐
│  [LOGO] Med Search    [Home] [About] [Contact] [Login]  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    PERFIL MÉDICO                        │
│                                                         │
│  ┌──────────┐  Dr. Juan López                          │
│  │          │  Cardiólogo Certificado                   │
│  │   [👨‍⚕️]   │  ⭐⭐⭐⭐⭐ (4.9) - 127 reseñas          │
│  │          │  📍 Av. Principal 123, Ciudad             │
│  └──────────┘  📞 (555) 123-4567                       │
│                 ✉️ dr.lopez@email.com                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   INFORMACIÓN                           │
│                                                         │
│  🎓 Educación:                                          │
│     • Universidad Nacional - Medicina (2010)           │
│     • Especialización en Cardiología (2015)            │
│                                                         │
│  💼 Experiencia: 12 años                               │
│                                                         │
│  🏥 Certificaciones:                                    │
│     • Colegio Médico Nacional #12345                   │
│     • Sociedad de Cardiología                          │
│                                                         │
│  💰 Consulta: $500                                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   HORARIOS                              │
│                                                         │
│  Lunes    │ 09:00 - 17:00                              │
│  Martes   │ 09:00 - 17:00                              │
│  Miércoles│ 09:00 - 17:00                              │
│  Jueves   │ 09:00 - 17:00                              │
│  Viernes  │ 09:00 - 17:00                              │
│  Sábado   │ Cerrado                                     │
│  Domingo  │ Cerrado                                     │
│                                                         │
│           [Agendar Cita] [Enviar Mensaje]               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   RESEÑAS (127)                         │
│                                                         │
│  ⭐⭐⭐⭐⭐ "Excelente atención..." - María S. (hace 2 días)│
│  ⭐⭐⭐⭐⭐ "Muy profesional..." - Carlos R. (hace 1 semana)│
│  ⭐⭐⭐⭐⭐ "Recomendado..." - Ana L. (hace 2 semanas)      │
│                                                         │
│                    [Ver todas]                          │
└─────────────────────────────────────────────────────────┘
```

---

## 4. LOGIN (login.html)

```
┌─────────────────────────────────────────────────────────┐
│  [LOGO] Med Search    [Home] [About] [Contact] [Login]  │
└─────────────────────────────────────────────────────────┘

                ┌─────────────────────────┐
                │                         │
                │      INICIAR SESIÓN     │
                │                         │
                │  ┌───────────────────┐  │
                │  │ Email             │  │
                │  │ ejemplo@email.com │  │
                │  └───────────────────┘  │
                │                         │
                │  ┌───────────────────┐  │
                │  │ Contraseña        │  │
                │  │ ••••••••••••••••  │  │
                │  └───────────────────┘  │
                │                         │
                │  ☐ Recordarme           │
                │                         │
                │     [INICIAR SESIÓN]    │
                │                         │
                │  ¿Olvidaste tu          │
                │  contraseña?            │
                │                         │
                │  ¿No tienes cuenta?     │
                │  [Regístrate aquí]      │
                │                         │
                └─────────────────────────┘
```

---

## 5. REGISTRO (register.html)

```
┌─────────────────────────────────────────────────────────┐
│  [LOGO] Med Search    [Home] [About] [Contact] [Login]  │
└─────────────────────────────────────────────────────────┘

                ┌─────────────────────────┐
                │                         │
                │      CREAR CUENTA       │
                │                         │
                │  ┌───────────────────┐  │
                │  │ Nombre            │  │
                │  │                   │  │
                │  └───────────────────┘  │
                │                         │
                │  ┌───────────────────┐  │
                │  │ Apellido          │  │
                │  │                   │  │
                │  └───────────────────┘  │
                │                         │
                │  ┌───────────────────┐  │
                │  │ Email             │  │
                │  │                   │  │
                │  └───────────────────┘  │
                │                         │
                │  ┌───────────────────┐  │
                │  │ Teléfono          │  │
                │  │                   │  │
                │  └───────────────────┘  │
                │                         │
                │  ┌───────────────────┐  │
                │  │ Contraseña        │  │
                │  │                   │  │
                │  └───────────────────┘  │
                │                         │
                │  ┌───────────────────┐  │
                │  │ Confirmar         │  │
                │  │ Contraseña        │  │
                │  └───────────────────┘  │
                │                         │
                │  ○ Paciente             │
                │  ○ Médico               │
                │                         │
                │  ☐ Acepto términos y    │
                │    condiciones          │
                │                         │
                │     [REGISTRARSE]       │
                │                         │
                │  ¿Ya tienes cuenta?     │
                │  [Inicia sesión]        │
                │                         │
                └─────────────────────────┘
```

---

## NOTAS DE DISEÑO

### Principios de Diseño:
1. **Simplicidad:** Wireframes limpios y funcionales
2. **Navegación intuitiva:** Flujo lógico entre páginas
3. **Responsive:** Adaptable a diferentes tamaños de pantalla
4. **Accesibilidad:** Etiquetas claras y estructura semántica

### Elementos Comunes:
- **Header:** Logo + navegación principal
- **Footer:** Links importantes y copyright
- **Botones:** Diseño consistente con calls-to-action claros
- **Cards:** Estructura uniforme para médicos y especialidades

### Paleta de Símbolos:
- 👨‍⚕️👩‍⚕️ Médicos
- 📱🦷👁❤️🧠🏥💊🔬 Especialidades médicas
- ⭐ Calificaciones
- 📍 Ubicaciones
- 💰 Precios
- 🕐 Horarios
- 📞✉️ Contacto

---

**Wireframes aprobados para desarrollo - Semana 1**