/* ================================
   MEDICONSULTA - API CLIENT
   ================================
   Cliente API para comunicación con el backend
   Implementa patrón de diseño Singleton y manejo de errores
*/

// =============================================================================
// CONFIGURACIÓN DE LA API
// =============================================================================

/**
 * Configuración base de la API
 */
const API_CONFIG = {
    BASE_URL: 'http://localhost:3001/api/v1',
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
};

/**
 * Cliente HTTP con manejo de errores y reintentos
 */
class ApiClient {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
        this.timeout = API_CONFIG.TIMEOUT;
        this.retryAttempts = API_CONFIG.RETRY_ATTEMPTS;
        this.retryDelay = API_CONFIG.RETRY_DELAY;
    }

    /**
     * Realiza una petición HTTP con manejo de errores
     * @param {string} endpoint - Endpoint de la API
     * @param {Object} options - Opciones de la petición
     * @returns {Promise<Object>} Respuesta de la API
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Agregar token de autenticación si existe
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        let lastError;
        
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout);
                
                config.signal = controller.signal;
                
                const response = await fetch(url, config);
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new ApiError(
                        `HTTP ${response.status}: ${response.statusText}`,
                        response.status,
                        await response.text()
                    );
                }
                
                const data = await response.json();
                return data;
                
            } catch (error) {
                lastError = error;
                
                // No reintentar en errores de cliente (4xx)
                if (error.status >= 400 && error.status < 500) {
                    throw error;
                }
                
                // Esperar antes del siguiente intento
                if (attempt < this.retryAttempts) {
                    await this.delay(this.retryDelay * attempt);
                }
            }
        }
        
        throw lastError;
    }

    /**
     * Realiza una petición GET
     * @param {string} endpoint - Endpoint de la API
     * @param {Object} params - Parámetros de consulta
     * @returns {Promise<Object>} Respuesta de la API
     */
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url);
    }

    /**
     * Realiza una petición POST
     * @param {string} endpoint - Endpoint de la API
     * @param {Object} data - Datos a enviar
     * @returns {Promise<Object>} Respuesta de la API
     */
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * Realiza una petición PUT
     * @param {string} endpoint - Endpoint de la API
     * @param {Object} data - Datos a enviar
     * @returns {Promise<Object>} Respuesta de la API
     */
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * Realiza una petición DELETE
     * @param {string} endpoint - Endpoint de la API
     * @returns {Promise<Object>} Respuesta de la API
     */
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }

    /**
     * Función de utilidad para delay
     * @param {number} ms - Milisegundos a esperar
     * @returns {Promise<void>}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * Clase de error personalizada para la API
 */
class ApiError extends Error {
    constructor(message, status, response) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.response = response;
    }
}

// =============================================================================
// SERVICIOS DE LA API
// =============================================================================

/**
 * Servicio para gestión de especialidades médicas
 */
class SpecialtyService {
    constructor(apiClient) {
        this.api = apiClient;
    }

    /**
     * Obtiene todas las especialidades activas
     * @returns {Promise<Array>} Lista de especialidades
     */
    async getAll() {
        try {
            const response = await this.api.get('/specialties', {
                is_active: true,
                _sort: 'display_order,name'
            });
            return response.data || [];
        } catch (error) {
            console.error('Error al obtener especialidades:', error);
            // Retornar datos de fallback en caso de error
            return this.getFallbackSpecialties();
        }
    }

    /**
     * Obtiene especialidades populares
     * @returns {Promise<Array>} Lista de especialidades populares
     */
    async getPopular() {
        try {
            const response = await this.api.get('/specialties', {
                is_popular: true,
                is_active: true,
                _sort: 'display_order'
            });
            return response.data || [];
        } catch (error) {
            console.error('Error al obtener especialidades populares:', error);
            return this.getFallbackSpecialties().slice(0, 6);
        }
    }

    /**
     * Busca especialidades por término
     * @param {string} term - Término de búsqueda
     * @returns {Promise<Array>} Lista de especialidades encontradas
     */
    async search(term) {
        try {
            const response = await this.api.get('/specialties/search', {
                q: term,
                is_active: true
            });
            return response.data || [];
        } catch (error) {
            console.error('Error al buscar especialidades:', error);
            return [];
        }
    }

    /**
     * Datos de fallback para especialidades
     * @returns {Array} Lista de especialidades básicas
     */
    getFallbackSpecialties() {
        return [
            { id: 1, name: 'Ginecólogo', description: 'Especialista en salud femenina', category: 'Medicina General' },
            { id: 2, name: 'Psicólogo', description: 'Especialista en salud mental', category: 'Salud Mental' },
            { id: 3, name: 'Dermatólogo', description: 'Especialista en piel', category: 'Medicina Especializada' },
            { id: 4, name: 'Oftalmólogo', description: 'Especialista en ojos', category: 'Medicina Especializada' },
            { id: 5, name: 'Urólogo', description: 'Especialista en sistema urinario', category: 'Medicina Especializada' },
            { id: 6, name: 'Ortopedista', description: 'Especialista en huesos y articulaciones', category: 'Medicina Especializada' },
            { id: 7, name: 'Otorrinolaringólogo', description: 'Especialista en oído, nariz y garganta', category: 'Medicina Especializada' },
            { id: 8, name: 'Pediatra', description: 'Especialista en niños', category: 'Medicina General' },
            { id: 9, name: 'Psiquiatra', description: 'Especialista en trastornos mentales', category: 'Salud Mental' },
            { id: 10, name: 'Cirujano general', description: 'Especialista en cirugía', category: 'Cirugía' },
            { id: 11, name: 'Internista', description: 'Especialista en medicina interna', category: 'Medicina General' },
            { id: 12, name: 'Traumatólogo', description: 'Especialista en traumatismos', category: 'Medicina Especializada' }
        ];
    }
}

/**
 * Servicio para gestión de médicos
 */
class DoctorService {
    constructor(apiClient) {
        this.api = apiClient;
    }

    /**
     * Busca médicos por especialidad y ubicación
     * @param {Object} filters - Filtros de búsqueda
     * @returns {Promise<Array>} Lista de médicos
     */
    async search(filters = {}) {
        try {
            const response = await this.api.get('/doctors/search', {
                specialty_id: filters.specialtyId,
                city: filters.city,
                is_accepting_patients: true,
                is_verified: true,
                _sort: 'rating',
                _order: 'desc',
                _limit: filters.limit || 20
            });
            return response.data || [];
        } catch (error) {
            console.error('Error al buscar médicos:', error);
            return this.getFallbackDoctors(filters.specialtyId);
        }
    }

    /**
     * Obtiene médicos por especialidad
     * @param {number} specialtyId - ID de la especialidad
     * @returns {Promise<Array>} Lista de médicos
     */
    async getBySpecialty(specialtyId) {
        try {
            const response = await this.api.get('/doctors', {
                specialty_id: specialtyId,
                is_accepting_patients: true,
                is_verified: true,
                _sort: 'rating',
                _order: 'desc'
            });
            return response.data || [];
        } catch (error) {
            console.error('Error al obtener médicos por especialidad:', error);
            return this.getFallbackDoctors(specialtyId);
        }
    }

    /**
     * Obtiene disponibilidad de un médico
     * @param {number} doctorId - ID del médico
     * @param {string} date - Fecha en formato YYYY-MM-DD
     * @returns {Promise<Array>} Lista de horarios disponibles
     */
    async getAvailability(doctorId, date) {
        try {
            const response = await this.api.get(`/doctors/${doctorId}/availability`, {
                date: date
            });
            return response.data || [];
        } catch (error) {
            console.error('Error al obtener disponibilidad:', error);
            return this.getFallbackAvailability();
        }
    }

    /**
     * Datos de fallback para médicos
     * @param {number} specialtyId - ID de la especialidad
     * @returns {Array} Lista de médicos básicos
     */
    getFallbackDoctors(specialtyId) {
        const doctors = [
            {
                id: 1,
                name: "Dra. María Elena González",
                specialty: "Ginecología",
                location: "Zona Centro, Guadalajara",
                experience: "15 años de experiencia",
                rating: 4.8,
                reviews: 234,
                consultation_fee: 1000,
                currency: "MXN",
                is_accepting_patients: true
            },
            {
                id: 2,
                name: "Psic. Ana Patricia Morales",
                specialty: "Psicología",
                location: "Providencia, Guadalajara",
                experience: "10 años de experiencia",
                rating: 4.9,
                reviews: 298,
                consultation_fee: 750,
                currency: "MXN",
                is_accepting_patients: true
            },
            {
                id: 3,
                name: "Dr. Carlos Mendoza",
                specialty: "Dermatología",
                location: "Zona Minerva, Guadalajara",
                experience: "18 años de experiencia",
                rating: 4.9,
                reviews: 312,
                consultation_fee: 1250,
                currency: "MXN",
                is_accepting_patients: true
            }
        ];

        return doctors.filter(doctor => !specialtyId || doctor.id === specialtyId);
    }

    /**
     * Horarios de fallback
     * @returns {Array} Lista de horarios disponibles
     */
    getFallbackAvailability() {
        return [
            '08:00', '09:00', '10:00', '11:00', '11:30',
            '12:00', '12:30', '15:00', '16:00', '17:00', '18:00', '19:00'
        ].filter(() => Math.random() > 0.3); // Simular disponibilidad aleatoria
    }
}

/**
 * Servicio para gestión de citas
 */
class AppointmentService {
    constructor(apiClient) {
        this.api = apiClient;
    }

    /**
     * Crea una nueva cita
     * @param {Object} appointmentData - Datos de la cita
     * @returns {Promise<Object>} Cita creada
     */
    async create(appointmentData) {
        try {
            const response = await this.api.post('/appointments', appointmentData);
            return response.data;
        } catch (error) {
            console.error('Error al crear cita:', error);
            throw error;
        }
    }

    /**
     * Obtiene las citas del usuario
     * @param {number} userId - ID del usuario
     * @returns {Promise<Array>} Lista de citas
     */
    async getUserAppointments(userId) {
        try {
            const response = await this.api.get('/appointments', {
                patient_id: userId,
                _sort: 'appointment_date,appointment_time'
            });
            return response.data || [];
        } catch (error) {
            console.error('Error al obtener citas del usuario:', error);
            return [];
        }
    }

    /**
     * Cancela una cita
     * @param {number} appointmentId - ID de la cita
     * @param {string} reason - Razón de cancelación
     * @returns {Promise<Object>} Resultado de la cancelación
     */
    async cancel(appointmentId, reason) {
        try {
            const response = await this.api.put(`/appointments/${appointmentId}/cancel`, {
                cancellation_reason: reason,
                cancelled_by: 'patient'
            });
            return response.data;
        } catch (error) {
            console.error('Error al cancelar cita:', error);
            throw error;
        }
    }
}

/**
 * Servicio para autenticación
 */
class AuthService {
    constructor(apiClient) {
        this.api = apiClient;
    }

    /**
     * Inicia sesión de usuario
     * @param {string} email - Email del usuario
     * @param {string} password - Contraseña del usuario
     * @returns {Promise<Object>} Datos del usuario y token
     */
    async login(email, password) {
        try {
            const response = await this.api.post('/auth/login', {
                email,
                password
            });
            
            if (response.token) {
                localStorage.setItem('authToken', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
            }
            
            return response;
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            throw error;
        }
    }

    /**
     * Registra un nuevo usuario
     * @param {Object} userData - Datos del usuario
     * @returns {Promise<Object>} Usuario registrado
     */
    async register(userData) {
        try {
            const response = await this.api.post('/auth/register', userData);
            return response;
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            throw error;
        }
    }

    /**
     * Cierra sesión del usuario
     */
    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    }

    /**
     * Verifica si el usuario está autenticado
     * @returns {boolean} Estado de autenticación
     */
    isAuthenticated() {
        return !!localStorage.getItem('authToken');
    }

    /**
     * Obtiene el usuario actual
     * @returns {Object|null} Datos del usuario
     */
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }
}

// =============================================================================
// INSTANCIA GLOBAL DE LA API
// =============================================================================

// Crear instancia única del cliente API
const apiClient = new ApiClient();

// Crear instancias de los servicios
const specialtyService = new SpecialtyService(apiClient);
const doctorService = new DoctorService(apiClient);
const appointmentService = new AppointmentService(apiClient);
const authService = new AuthService(apiClient);

// Exportar servicios para uso global
window.API = {
    client: apiClient,
    specialties: specialtyService,
    doctors: doctorService,
    appointments: appointmentService,
    auth: authService,
    ApiError
};

// =============================================================================
// MANEJO GLOBAL DE ERRORES DE RED
// =============================================================================

/**
 * Maneja errores de red de forma global
 * @param {Error} error - Error capturado
 */
function handleNetworkError(error) {
    console.error('Error de red:', error);
    
    let message = 'Error de conexión. Por favor, verifica tu conexión a internet.';
    
    if (error instanceof ApiError) {
        switch (error.status) {
            case 401:
                message = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
                authService.logout();
                break;
            case 403:
                message = 'No tienes permisos para realizar esta acción.';
                break;
            case 404:
                message = 'El recurso solicitado no fue encontrado.';
                break;
            case 500:
                message = 'Error interno del servidor. Por favor, intenta más tarde.';
                break;
            default:
                message = error.message || message;
        }
    }
    
    // Mostrar notificación al usuario
    showNotification(message, 'error');
}

/**
 * Muestra una notificación al usuario
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de notificación (error, success, info)
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'assertive');
    
    document.body.appendChild(notification);
    
    // Remover después de 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// Configurar manejo global de errores no capturados
window.addEventListener('unhandledrejection', (event) => {
    if (event.reason instanceof ApiError) {
        handleNetworkError(event.reason);
        event.preventDefault();
    }
});

console.log('API Client inicializado correctamente');