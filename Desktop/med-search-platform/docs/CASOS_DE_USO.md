# Casos de Uso Principales - Med Search Platform

**Versión:** 1.0  
**Fecha:** Diciembre 2024  
**Enfoque:** Funcionalidades core simplificadas (Semana 2)  

---

## ACTORES DEL SISTEMA

### Actor Principal: **Paciente**
- **Descripción:** Usuario final que busca servicios médicos
- **Objetivo:** Encontrar y contactar médicos especialistas
- **Características:** Puede o no estar registrado en el sistema

### Actor Secundario: **Médico**
- **Descripción:** Profesional de la salud registrado en la plataforma
- **Objetivo:** Gestionar su perfil profesional y recibir pacientes
- **Características:** Usuario registrado con información profesional verificada

### Actor Técnico: **Sistema**
- **Descripción:** Plataforma automatizada
- **Objetivo:** Facilitar la conexión entre pacientes y médicos
- **Características:** Procesa búsquedas, valida datos, gestiona perfiles

---

## CASO DE USO 1: BÚSQUEDA DE MÉDICOS

### **CU-01: Usuario busca médico especialista**

#### Información Básica:
- **Actor Principal:** Paciente (no requiere registro)
- **Precondiciones:** Sistema disponible, base de datos con médicos
- **Postcondiciones:** Lista de médicos mostrada según criterios
- **Prioridad:** Alta (funcionalidad core)

#### Flujo Principal:
1. **Usuario accede** a la página principal (index.html)
2. **Usuario ingresa criterios** de búsqueda:
   - Nombre del médico (opcional)
   - Especialidad médica (opcional)
   - Ubicación/ciudad (opcional)
3. **Usuario hace clic** en "Buscar"
4. **Sistema valida** los criterios ingresados
5. **Sistema consulta** la base de datos de médicos
6. **Sistema muestra** lista de resultados en search.html
7. **Usuario revisa** los médicos encontrados
8. **Usuario puede filtrar** resultados por:
   - Precio de consulta
   - Calificación promedio
   - Años de experiencia
   - Disponibilidad
9. **Usuario selecciona** un médico de interés
10. **Sistema redirige** al perfil del médico (profile.html)

#### Flujo Alternativo 1: Sin resultados
- **4a.** Sistema no encuentra médicos que coincidan
- **4b.** Sistema muestra mensaje "No se encontraron médicos"
- **4c.** Sistema sugiere ampliar criterios de búsqueda
- **4d.** Usuario puede modificar búsqueda y reintentar

#### Flujo Alternativo 2: Error de conexión
- **5a.** Error en conexión con base de datos
- **5b.** Sistema muestra mensaje de error amigable
- **5c.** Sistema sugiere intentar más tarde
- **5d.** Usuario puede reintentar la búsqueda

#### Datos de Entrada:
```json
{
  "query": "cardiología",
  "specialty_id": 1,
  "city": "Ciudad de México",
  "min_fee": 300,
  "max_fee": 800
}
```

#### Datos de Salida:
```json
{
  "doctors": [
    {
      "id": 1,
      "name": "Dr. Juan López",
      "specialty": "Cardiología",
      "rating": 4.8,
      "reviews_count": 127,
      "consultation_fee": 500,
      "city": "Ciudad de México",
      "experience_years": 15,
      "verified": true
    }
  ],
  "total_results": 24,
  "page": 1
}
```

---

## CASO DE USO 2: REGISTRO DE USUARIOS

### **CU-02: Usuario se registra en la plataforma**

#### Información Básica:
- **Actor Principal:** Paciente o Médico
- **Precondiciones:** Usuario no tiene cuenta existente
- **Postcondiciones:** Usuario registrado exitosamente
- **Prioridad:** Alta (funcionalidad core)

#### Flujo Principal:
1. **Usuario accede** a register.html
2. **Usuario selecciona** tipo de cuenta:
   - Paciente (registro simple)
   - Médico (registro profesional)
3. **Usuario completa** formulario con información requerida
4. **Usuario acepta** términos y condiciones
5. **Usuario hace clic** en "Registrarse"
6. **Sistema valida** la información ingresada
7. **Sistema verifica** que email no esté en uso
8. **Sistema encripta** la contraseña
9. **Sistema guarda** usuario en base de datos
10. **Sistema envía** confirmación de registro
11. **Sistema redirige** a página de inicio con usuario logueado

#### Flujo Alternativo 1: Email ya existe
- **7a.** Email ya está registrado en el sistema
- **7b.** Sistema muestra error "Email ya en uso"
- **7c.** Sistema sugiere iniciar sesión o usar otro email
- **7d.** Usuario puede corregir y reintentar

#### Flujo Alternativo 2: Validación fallida
- **6a.** Información no cumple con validaciones
- **6b.** Sistema muestra errores específicos por campo
- **6c.** Usuario corrige información
- **6d.** Usuario reintenta registro

#### Validaciones del Sistema:
```javascript
// Validaciones implementadas
{
  email: {
    required: true,
    format: "email válido",
    unique: true
  },
  password: {
    required: true,
    minLength: 8,
    pattern: "al menos 1 mayúscula, 1 número"
  },
  firstName: {
    required: true,
    minLength: 2,
    maxLength: 50
  },
  lastName: {
    required: true,
    minLength: 2,
    maxLength: 50
  },
  phone: {
    format: "número válido",
    optional: true
  }
}
```

---

## CASO DE USO 3: GESTIÓN DE PERFIL MÉDICO

### **CU-03: Médico actualiza su perfil profesional**

#### Información Básica:
- **Actor Principal:** Médico registrado
- **Precondiciones:** Médico autenticado en el sistema
- **Postcondiciones:** Perfil médico actualizado
- **Prioridad:** Media (funcionalidad importante)

#### Flujo Principal:
1. **Médico inicia sesión** en el sistema
2. **Médico accede** a su panel de control
3. **Médico selecciona** "Editar Perfil"
4. **Sistema muestra** formulario con información actual
5. **Médico modifica** campos deseados:
   - Especialidad médica
   - Biografía profesional
   - Años de experiencia
   - Tarifa de consulta
   - Dirección del consultorio
   - Horarios de atención
6. **Médico hace clic** en "Guardar Cambios"
7. **Sistema valida** la información actualizada
8. **Sistema actualiza** registro en base de datos
9. **Sistema confirma** actualización exitosa
10. **Sistema actualiza** perfil público del médico

#### Flujo Alternativo 1: Información inválida
- **7a.** Algunos campos no pasan validación
- **7b.** Sistema resalta campos con errores
- **7c.** Médico corrige información
- **7d.** Médico reintenta guardar

#### Campos Editables:
```json
{
  "specialty_id": 1,
  "bio": "Texto descriptivo de la experiencia profesional",
  "experience_years": 15,
  "consultation_fee": 500.00,
  "address": "Av. Principal 123, Col. Centro",
  "city": "Ciudad de México"
}
```

---

## CASO DE USO 4: VISUALIZACIÓN DE PERFIL MÉDICO

### **CU-04: Usuario visualiza información detallada de médico**

#### Información Básica:
- **Actor Principal:** Paciente (registrado o no)
- **Precondiciones:** Médico existe en el sistema
- **Postcondiciones:** Información médica mostrada
- **Prioridad:** Alta (funcionalidad core)

#### Flujo Principal:
1. **Usuario selecciona** un médico desde búsqueda
2. **Sistema carga** profile.html con ID del médico
3. **Sistema consulta** información completa del médico
4. **Sistema muestra** perfil con:
   - Información personal y profesional
   - Especialidad y subespecialidades
   - Años de experiencia
   - Calificación promedio y número de reseñas
   - Tarifa de consulta
   - Ubicación del consultorio
   - Biografía profesional
   - Estado de verificación
5. **Usuario puede** realizar acciones:
   - Agregar a favoritos (si está registrado)
   - Enviar mensaje
   - Ver disponibilidad
   - Compartir perfil

#### Información Mostrada:
```json
{
  "doctor_info": {
    "id": 1,
    "name": "Dr. Juan López Martínez",
    "specialty": "Cardiología",
    "subspecialty": "Cardiología Intervencionista",
    "experience_years": 15,
    "rating_avg": 4.8,
    "total_reviews": 127,
    "consultation_fee": 500,
    "bio": "Especialista en...",
    "address": "Av. Principal 123",
    "city": "Ciudad de México",
    "verified": true,
    "license_number": "MED-CARD-001"
  }
}
```

---

## DIAGRAMA DE CASOS DE USO

```
    [Paciente]
        |
        |-- CU-01: Buscar médico
        |-- CU-02: Registrarse (paciente)
        |-- CU-04: Ver perfil médico
        |
    [Médico]
        |
        |-- CU-02: Registrarse (médico)
        |-- CU-03: Actualizar perfil
        |
    [Sistema]
        |
        |-- Validar datos
        |-- Procesar búsquedas
        |-- Gestionar autenticación
        |-- Mantener integridad de datos
```

---

## REGLAS DE NEGOCIO

### RN-01: Búsqueda de Médicos
- Solo médicos **verificados** aparecen en resultados de búsqueda
- Resultados ordenados por **calificación** y **número de reseñas**
- Máximo **20 resultados** por página
- Búsqueda **insensible** a mayúsculas/minúsculas

### RN-02: Registro de Usuarios
- **Email único** por usuario en el sistema
- **Contraseña** mínimo 8 caracteres, al menos 1 mayúscula y 1 número
- **Médicos** requieren número de cédula profesional
- **Verificación** manual de médicos antes de aparecer en búsquedas

### RN-03: Gestión de Perfiles
- Solo el **médico propietario** puede editar su perfil
- **Tarifa de consulta** debe ser mayor a $100 pesos
- **Biografía** máximo 500 caracteres
- **Cambios** se reflejan inmediatamente en perfil público

### RN-04: Visualización de Información
- **Información básica** visible para todos los usuarios
- **Datos de contacto** solo para usuarios registrados
- **Perfiles no verificados** no aparecen en búsquedas públicas

---

## CRITERIOS DE ACEPTACIÓN

### Para CU-01 (Búsqueda):
- ✅ Búsqueda funciona sin criterios (muestra todos)
- ✅ Filtros combinados funcionan correctamente
- ✅ Resultados vacíos muestran mensaje apropiado
- ✅ Paginación funciona para más de 20 resultados
- ✅ Tiempo de respuesta menor a 2 segundos

### Para CU-02 (Registro):
- ✅ Validaciones client-side y server-side
- ✅ Email único verificado
- ✅ Contraseña encriptada antes de almacenar
- ✅ Confirmación de registro enviada
- ✅ Login automático después de registro

### Para CU-03 (Perfil Médico):
- ✅ Solo médico autenticado puede editar
- ✅ Cambios se guardan exitosamente
- ✅ Validaciones apropiadas por campo
- ✅ Perfil público se actualiza inmediatamente

### Para CU-04 (Visualización):
- ✅ Toda la información relevante mostrada
- ✅ Diseño responsive en todos los dispositivos
- ✅ Manejo de errores si médico no existe
- ✅ Tiempo de carga menor a 3 segundos

---

## MATRIZ DE TRAZABILIDAD

| Requisito | CU-01 | CU-02 | CU-03 | CU-04 | Prioridad |
|-----------|-------|-------|-------|-------|-----------|
| Búsqueda básica | ✅ | | | | Alta |
| Sistema de usuarios | | ✅ | ✅ | | Alta |
| Gestión de perfiles | | | ✅ | ✅ | Media |
| Interfaz responsive | ✅ | ✅ | ✅ | ✅ | Alta |
| Validaciones | ✅ | ✅ | ✅ | | Alta |
| Seguridad | | ✅ | ✅ | | Media |

---

**Estos casos de uso cubren las funcionalidades principales requeridas para la Semana 2, proporcionando una base sólida para el desarrollo de la aplicación.**