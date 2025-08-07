/* ================================
   MEDICONSULTA - APLICACIÓN PRINCIPAL
   ================================
   Módulo principal de interacción frontend integrado con API
   Implementa patrón de diseño Module Pattern para encapsulación
*/

// =============================================================================
// CONFIGURACIÓN Y ESTADO DE LA APLICACIÓN
// =============================================================================

/**
 * Configuración base de la aplicación
 * @type {Object}
 */
const AppConfig = {
    ANIMATION_DURATION: 300,
    MODAL_Z_INDEX: 10000,
    CALENDAR_Z_INDEX: 10001,
    DEBOUNCE_DELAY: 300,
    DEFAULT_CITY: 'guadalajara'
};

/**
 * Estado global de la aplicación
 * Implementa patrón Singleton para gestión centralizada del estado
 */
const AppState = {
    currentDate: new Date(),
    selectedDate: null,
    selectedTime: null,
    currentDoctor: null,
    currentSpecialty: null,
    isModalOpen: false,
    activeTab: 'online',
    specialties: [],
    doctors: [],
    isLoading: false
};

// =============================================================================
// UTILIDADES Y HELPERS
// =============================================================================

/**
 * Función debounce para optimizar rendimiento en eventos frecuentes
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en ms
 * @returns {Function} Función debounced
 */
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

/**
 * Generador de elementos DOM con validación
 * @param {string} tag - Etiqueta HTML
 * @param {Object} attributes - Atributos del elemento
 * @param {string} content - Contenido interno
 * @returns {HTMLElement} Elemento DOM creado
 */
const createElement = (tag, attributes = {}, content = '') => {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key.startsWith('data-')) {
            element.setAttribute(key, value);
        } else {
            element[key] = value;
        }
    });
    
    if (content) {
        element.innerHTML = content;
    }
    
    return element;
};

/**
 * Generador de estrellas para rating con accesibilidad
 * @param {number} rating - Puntuación del 1 al 5
 * @returns {string} HTML de estrellas
 */
const generateStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let starsHTML = '';
    
    // Estrellas completas
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<span aria-hidden="true">★</span>';
    }
    
    // Media estrella si aplica
    if (hasHalfStar) {
        starsHTML += '<span aria-hidden="true">☆</span>';
    }
    
    // Añadir información para lectores de pantalla
    return `<span role="img" aria-label="Calificación ${rating} de 5 estrellas">${starsHTML}</span>`;
};

/**
 * Formatea el precio de consulta
 * @param {number} fee - Precio de consulta
 * @param {string} currency - Moneda
 * @returns {string} Precio formateado
 */
const formatPrice = (fee, currency = 'MXN') => {
    const formatter = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: currency
    });
    return formatter.format(fee);
};

/**
 * Muestra un indicador de carga
 * @param {boolean} show - Mostrar u ocultar
 * @param {string} message - Mensaje de carga
 */
const showLoading = (show, message = 'Cargando...') => {
    AppState.isLoading = show;
    
    let loadingElement = document.getElementById('globalLoading');
    
    if (show) {
        if (!loadingElement) {
            loadingElement = createElement('div', {
                id: 'globalLoading',
                className: 'loading-overlay',
                'aria-live': 'polite'
            }, `<p>${message}</p>`);
            document.body.appendChild(loadingElement);
        }
    } else {
        if (loadingElement) {
            loadingElement.remove();
        }
    }
};

// =============================================================================
// GESTIÓN DE MODALES
// =============================================================================

/**
 * Controlador de modales con gestión de estado y accesibilidad
 */
const ModalController = {
    /**
     * Muestra un modal con animaciones y gestión de foco
     * @param {string} modalId - ID del modal a mostrar
     */
    show(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`Modal con ID ${modalId} no encontrado`);
            return;
        }
        
        // Prevenir scroll del body
        document.body.style.overflow = 'hidden';
        
        // Mostrar modal con animación
        modal.classList.add('show');
        AppState.isModalOpen = true;
        
        // Gestión de foco para accesibilidad
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
        
        // Trap de teclado para navegación con Tab
        modal.addEventListener('keydown', this.handleKeyDown.bind(this));
    },
    
    /**
     * Cierra un modal con limpieza de estado
     * @param {string} modalId - ID del modal a cerrar
     */
    close(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
        AppState.isModalOpen = false;
        
        // Limpiar eventos
        modal.removeEventListener('keydown', this.handleKeyDown);
    },
    
    /**
     * Maneja eventos de teclado para accesibilidad
     * @param {KeyboardEvent} event - Evento de teclado
     */
    handleKeyDown(event) {
        if (event.key === 'Escape') {
            const openModal = document.querySelector('.modal.show, .calendar-modal.show');
            if (openModal) {
                this.close(openModal.id);
            }
        }
    },
    
    /**
     * Cierra modal si se hace clic fuera del contenido
     * @param {MouseEvent} event - Evento de click
     * @param {string} modalId - ID del modal
     */
    closeOnOutsideClick(event, modalId) {
        if (event.target.id === modalId) {
            this.close(modalId);
        }
    }
};

// =============================================================================
// GESTIÓN DE ESPECIALIDADES
// =============================================================================

/**
 * Controlador de especialidades médicas integrado con API
 */
const SpecialtyController = {
    /**
     * Inicializa las especialidades cargándolas desde la API
     */
    async init() {
        try {
            showLoading(true, 'Cargando especialidades...');
            AppState.specialties = await API.specialties.getAll();
            this.renderSpecialtiesGrid();
            this.updateDoctorCount();
        } catch (error) {
            console.error('Error al cargar especialidades:', error);
            // Usar datos de fallback
            AppState.specialties = API.specialties.getFallbackSpecialties();
            this.renderSpecialtiesGrid();
        } finally {
            showLoading(false);
        }
    },

    /**
     * Renderiza la grilla de especialidades
     */
    renderSpecialtiesGrid() {
        const grid = document.getElementById('specialtiesGrid');
        if (!grid) return;

        grid.innerHTML = '';
        
        AppState.specialties.forEach(specialty => {
            const card = createElement('div', {
                className: 'specialty-card',
                'data-specialty-id': specialty.id,
                onclick: `SpecialtyController.openModal(${specialty.id})`
            }, `<h3>${specialty.name}</h3>`);
            
            grid.appendChild(card);
        });
    },

    /**
     * Actualiza el contador de doctores en el hero
     */
    async updateDoctorCount() {
        try {
            // En una implementación real, esto vendría de una API de estadísticas
            const totalDoctors = AppState.specialties.reduce((sum, specialty) => 
                sum + (specialty.doctor_count || 0), 0);
            
            const countElement = document.getElementById('doctorCount');
            if (countElement && totalDoctors > 0) {
                countElement.textContent = `${totalDoctors.toLocaleString()} profesionales`;
            }
        } catch (error) {
            console.error('Error al actualizar contador de doctores:', error);
        }
    },
    
    /**
     * Abre modal de especialidad con datos dinámicos desde la API
     * @param {number} specialtyId - ID de la especialidad
     */
    async openModal(specialtyId) {
        try {
            showLoading(true, 'Cargando información...');
            
            const specialty = AppState.specialties.find(s => s.id === specialtyId);
            if (!specialty) {
                throw new Error('Especialidad no encontrada');
            }

            AppState.currentSpecialty = specialty;
            
            // Actualizar contenido del modal
            this.updateModalContent(specialty);
            
            // Cargar doctores de la especialidad
            const doctors = await API.doctors.getBySpecialty(specialtyId);
            AppState.doctors = doctors;
            
            // Renderizar lista de doctores
            this.renderDoctorsList(doctors);
            
            // Mostrar modal
            ModalController.show('specialtyModal');
            
        } catch (error) {
            console.error('Error al abrir modal de especialidad:', error);
            showNotification('Error al cargar la información de la especialidad', 'error');
        } finally {
            showLoading(false);
        }
    },
    
    /**
     * Actualiza el contenido principal del modal
     * @param {Object} specialty - Datos de la especialidad
     */
    updateModalContent(specialty) {
        const titleElement = document.getElementById('modalTitle');
        const descriptionElement = document.getElementById('modalDescription');
        
        if (titleElement) titleElement.textContent = specialty.name;
        if (descriptionElement) {
            descriptionElement.textContent = specialty.description || 
                `Encuentra los mejores especialistas en ${specialty.name.toLowerCase()}.`;
        }
    },
    
    /**
     * Renderiza la lista de doctores con optimización DOM
     * @param {Array} doctors - Array de doctores
     */
    renderDoctorsList(doctors) {
        const doctorsList = document.getElementById('doctorsList');
        if (!doctorsList) return;
        
        // Limpiar lista anterior
        doctorsList.innerHTML = '';
        
        if (doctors.length === 0) {
            doctorsList.innerHTML = '<p>No se encontraron médicos disponibles en este momento.</p>';
            return;
        }
        
        // Crear fragmento para mejor rendimiento
        const fragment = document.createDocumentFragment();
        
        doctors.forEach(doctor => {
            const doctorCard = this.createDoctorCard(doctor);
            fragment.appendChild(doctorCard);
        });
        
        doctorsList.appendChild(fragment);
    },
    
    /**
     * Crea una tarjeta de doctor con estructura semántica
     * @param {Object} doctor - Datos del doctor
     * @returns {HTMLElement} Elemento de tarjeta
     */
    createDoctorCard(doctor) {
        const doctorCard = createElement('article', {
            className: 'doctor-card',
            role: 'article'
        });
        
        const priceRange = doctor.consultation_fee ? 
            formatPrice(doctor.consultation_fee * 0.8) + ' - ' + formatPrice(doctor.consultation_fee * 1.2) :
            'Consultar precio';
        
        doctorCard.innerHTML = `
            <div class="doctor-info">
                <div class="doctor-details">
                    <h4>${doctor.name}</h4>
                    <p aria-label="Ubicación">📍 ${doctor.location || doctor.office_city}</p>
                    <p aria-label="Experiencia">🎓 ${doctor.experience || doctor.years_of_experience + ' años de experiencia'}</p>
                    <p aria-label="Precio">💰 ${priceRange}</p>
                    <div class="doctor-rating">
                        <span class="stars">${generateStars(doctor.rating || 4.5)}</span>
                        <span>${doctor.rating || 4.5} (${doctor.reviews || doctor.total_reviews || 0} opiniones)</span>
                    </div>
                </div>
                <div class="doctor-actions">
                    <button class="btn btn-primary" 
                            onclick="AppointmentController.initBooking(${doctor.id})"
                            aria-label="Agendar cita con ${doctor.name}">
                        📅 Pedir Cita
                    </button>
                    <button class="btn btn-outline" 
                            onclick="SpecialtyController.viewProfile(${doctor.id})"
                            aria-label="Ver perfil de ${doctor.name}">
                        👤 Ver Perfil
                    </button>
                </div>
            </div>
        `;
        
        return doctorCard;
    },
    
    /**
     * Muestra el perfil completo del doctor
     * @param {number} doctorId - ID del doctor
     */
    async viewProfile(doctorId) {
        try {
            showLoading(true, 'Cargando perfil...');
            
            // En una implementación real, esto cargaría el perfil completo
            const doctor = AppState.doctors.find(d => d.id === doctorId);
            if (doctor) {
                showNotification(`Mostrando perfil de ${doctor.name}`, 'info');
            }
            
        } catch (error) {
            console.error('Error al cargar perfil:', error);
            showNotification('Error al cargar el perfil del médico', 'error');
        } finally {
            showLoading(false);
        }
    }
};

// =============================================================================
// GESTIÓN DE CITAS MÉDICAS
// =============================================================================

/**
 * Controlador de sistema de citas con validación avanzada e integración API
 */
const AppointmentController = {
    /**
     * Inicia el proceso de reserva de cita
     * @param {number} doctorId - ID del doctor seleccionado
     */
    async initBooking(doctorId) {
        try {
            // Verificar autenticación
            if (!API.auth.isAuthenticated()) {
                showNotification('Debes iniciar sesión para agendar una cita', 'info');
                // Aquí se podría abrir un modal de login
                return;
            }

            const doctor = AppState.doctors.find(d => d.id === doctorId);
            if (!doctor) {
                throw new Error('Doctor no encontrado');
            }
            
            // Actualizar estado global
            AppState.currentDoctor = doctor;
            AppState.selectedDate = null;
            AppState.selectedTime = null;
            
            // Actualizar interfaz del modal de calendario
            this.updateCalendarModal(doctor);
            
            // Cerrar modal de especialidad y abrir calendario
            ModalController.close('specialtyModal');
            ModalController.show('calendarModal');
            
            // Inicializar calendario
            CalendarController.init();
            
        } catch (error) {
            console.error('Error al iniciar reserva:', error);
            showNotification('Error al iniciar el proceso de reserva', 'error');
        }
    },
    
    /**
     * Actualiza la información del doctor en el modal de calendario
     * @param {Object} doctor - Datos del doctor
     */
    updateCalendarModal(doctor) {
        const elements = {
            name: document.getElementById('selectedDoctorName'),
            specialty: document.getElementById('selectedDoctorSpecialty'),
            location: document.getElementById('selectedDoctorLocation')
        };
        
        if (elements.name) elements.name.textContent = doctor.name;
        if (elements.specialty) {
            elements.specialty.textContent = AppState.currentSpecialty?.name || 'Especialista';
        }
        if (elements.location) {
            elements.location.textContent = `📍 ${doctor.location || doctor.office_city}`;
        }
        
        // Resetear campos de resumen
        this.resetSummaryFields();
        this.updateSummary();
    },
    
    /**
     * Resetea los campos del resumen de cita
     */
    resetSummaryFields() {
        const fields = ['selectedDateText', 'summaryDate', 'summaryTime'];
        
        fields.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                element.textContent = fieldId === 'selectedDateText' ? 'Selecciona una fecha' : '-';
            }
        });
    },
    
    /**
     * Actualiza el resumen de la cita con validación
     */
    updateSummary() {
        const summaryElements = {
            doctor: document.getElementById('summaryDoctor'),
            date: document.getElementById('summaryDate'),
            time: document.getElementById('summaryTime'),
            cost: document.getElementById('summaryCost')
        };
        
        // Actualizar información del doctor
        if (AppState.currentDoctor && summaryElements.doctor) {
            summaryElements.doctor.textContent = AppState.currentDoctor.name;
        }
        
        if (AppState.currentDoctor && summaryElements.cost) {
            const fee = AppState.currentDoctor.consultation_fee || 1000;
            summaryElements.cost.textContent = formatPrice(fee);
        }
        
        // Actualizar fecha seleccionada
        if (AppState.selectedDate && summaryElements.date) {
            summaryElements.date.textContent = AppState.selectedDate.toLocaleDateString('es-ES');
        }
        
        // Actualizar hora seleccionada
        if (AppState.selectedTime && summaryElements.time) {
            summaryElements.time.textContent = AppState.selectedTime;
        }
    },
    
    /**
     * Confirma la cita con validación completa e integración API
     */
    async confirm() {
        try {
            // Validar datos requeridos
            const validationResult = this.validateAppointmentData();
            
            if (!validationResult.isValid) {
                showNotification(validationResult.message, 'error');
                return;
            }
            
            showLoading(true, 'Confirmando cita...');
            
            // Preparar datos de la cita
            const appointmentData = {
                doctor_id: AppState.currentDoctor.id,
                appointment_date: AppState.selectedDate.toISOString().split('T')[0],
                appointment_time: AppState.selectedTime,
                reason_for_visit: 'Consulta general', // En una implementación real, esto se preguntaría al usuario
                contact_phone: '5555555555', // Obtener del perfil del usuario
                contact_email: API.auth.getCurrentUser()?.email || 'usuario@ejemplo.com'
            };
            
            // Crear la cita a través de la API
            const appointment = await API.appointments.create(appointmentData);
            
            // Mostrar confirmación
            this.showConfirmation(appointment);
            
            // Cerrar modal y limpiar estado
            ModalController.close('calendarModal');
            this.resetAppointmentState();
            
        } catch (error) {
            console.error('Error al confirmar cita:', error);
            showNotification('Error al confirmar la cita. Por favor, intenta nuevamente.', 'error');
        } finally {
            showLoading(false);
        }
    },
    
    /**
     * Valida los datos de la cita
     * @returns {Object} Resultado de validación
     */
    validateAppointmentData() {
        if (!AppState.selectedDate || !AppState.selectedTime) {
            return {
                isValid: false,
                message: 'Por favor selecciona una fecha y hora para la cita.'
            };
        }
        
        if (!AppState.currentDoctor) {
            return {
                isValid: false,
                message: 'Error: No se ha seleccionado un doctor válido.'
            };
        }
        
        // Validar que la fecha no sea en el pasado
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (AppState.selectedDate < today) {
            return {
                isValid: false,
                message: 'No se pueden agendar citas en fechas pasadas.'
            };
        }
        
        return { isValid: true };
    },
    
    /**
     * Muestra la confirmación de la cita
     * @param {Object} appointment - Datos de la cita confirmada
     */
    showConfirmation(appointment) {
        const confirmationMessage = `¡Cita confirmada exitosamente!\n\n` +
            `Doctor: ${AppState.currentDoctor.name}\n` +
            `Fecha: ${AppState.selectedDate.toLocaleDateString('es-ES')}\n` +
            `Hora: ${AppState.selectedTime}\n` +
            `Costo: ${formatPrice(AppState.currentDoctor.consultation_fee || 1000)}\n\n` +
            `Recibirás un email de confirmación en breve.`;
        
        showNotification('¡Cita confirmada exitosamente!', 'success');
        alert(confirmationMessage); // En una implementación real, esto sería un modal personalizado
    },
    
    /**
     * Resetea el estado de la aplicación después de una cita
     */
    resetAppointmentState() {
        AppState.currentDoctor = null;
        AppState.selectedDate = null;
        AppState.selectedTime = null;
        AppState.currentSpecialty = null;
    }
};

// =============================================================================
// CONTROLADOR DE CALENDARIO
// =============================================================================

/**
 * Controlador del calendario con lógica de disponibilidad e integración API
 */
const CalendarController = {
    /**
     * Inicializa el calendario con la fecha actual
     */
    init() {
        AppState.currentDate = new Date();
        this.updateDisplay();
    },
    
    /**
     * Actualiza la visualización del calendario
     */
    updateDisplay() {
        this.updateMonthYear();
        this.generateCalendar(AppState.currentDate.getFullYear(), AppState.currentDate.getMonth());
        this.clearTimeSlots();
    },
    
    /**
     * Actualiza el display de mes y año
     */
    updateMonthYear() {
        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        const monthYearElement = document.getElementById('monthYear');
        if (monthYearElement) {
            monthYearElement.textContent = 
                `${monthNames[AppState.currentDate.getMonth()]} ${AppState.currentDate.getFullYear()}`;
        }
    },
    
    /**
     * Genera el calendario para un mes específico
     * @param {number} year - Año
     * @param {number} month - Mes (0-11)
     */
    generateCalendar(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        const calendarDays = document.getElementById('calendarDays');
        if (!calendarDays) return;
        
        // Limpiar calendario anterior
        calendarDays.innerHTML = '';
        
        // Agregar celdas vacías para el inicio del mes
        for (let i = 0; i < startingDayOfWeek; i++) {
            const emptyDay = createElement('div', {
                className: 'day-cell disabled',
                'aria-hidden': 'true'
            });
            calendarDays.appendChild(emptyDay);
        }
        
        // Agregar días del mes
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = this.createDayCell(year, month, day);
            calendarDays.appendChild(dayCell);
        }
    },
    
    /**
     * Crea una celda de día con validación de disponibilidad
     * @param {number} year - Año
     * @param {number} month - Mes
     * @param {number} day - Día
     * @returns {HTMLElement} Elemento de celda
     */
    createDayCell(year, month, day) {
        const dayCell = createElement('div', {
            className: 'day-cell',
            role: 'button',
            tabIndex: '0'
        }, day.toString());
        
        const cellDate = new Date(year, month, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Validar si el día está disponible
        if (cellDate < today) {
            dayCell.classList.add('disabled');
            dayCell.setAttribute('aria-disabled', 'true');
            dayCell.setAttribute('aria-label', `${day} - No disponible`);
        } else {
            // Simular disponibilidad (en una implementación real vendría de la API)
            if (Math.random() > 0.3) {
                dayCell.classList.add('has-appointments');
                dayCell.setAttribute('aria-label', `${day} - Disponible`);
            } else {
                dayCell.setAttribute('aria-label', `${day} - Sin disponibilidad`);
            }
            
            // Agregar eventos de interacción
            dayCell.addEventListener('click', () => this.selectDate(year, month, day, dayCell));
            dayCell.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.selectDate(year, month, day, dayCell);
                }
            });
        }
        
        return dayCell;
    },
    
    /**
     * Selecciona una fecha específica y carga disponibilidad desde API
     * @param {number} year - Año
     * @param {number} month - Mes
     * @param {number} day - Día
     * @param {HTMLElement} element - Elemento DOM clickeado
     */
    async selectDate(year, month, day, element) {
        try {
            // Remover selección anterior
            document.querySelectorAll('.day-cell.selected').forEach(cell => {
                cell.classList.remove('selected');
                cell.setAttribute('aria-selected', 'false');
            });
            
            // Marcar nueva selección
            element.classList.add('selected');
            element.setAttribute('aria-selected', 'true');
            
            // Actualizar estado
            AppState.selectedDate = new Date(year, month, day);
            AppState.selectedTime = null; // Resetear tiempo al cambiar fecha
            
            // Actualizar interfaz
            this.updateSelectedDateText();
            
            // Cargar disponibilidad desde la API
            await this.loadAvailability();
            
            AppointmentController.updateSummary();
            
        } catch (error) {
            console.error('Error al seleccionar fecha:', error);
            showNotification('Error al cargar la disponibilidad', 'error');
        }
    },
    
    /**
     * Carga la disponibilidad del doctor para la fecha seleccionada
     */
    async loadAvailability() {
        if (!AppState.currentDoctor || !AppState.selectedDate) return;
        
        try {
            showLoading(true, 'Cargando horarios disponibles...');
            
            const dateStr = AppState.selectedDate.toISOString().split('T')[0];
            const availability = await API.doctors.getAvailability(AppState.currentDoctor.id, dateStr);
            
            this.generateTimeSlots(availability);
            
        } catch (error) {
            console.error('Error al cargar disponibilidad:', error);
            // Usar horarios de fallback
            this.generateTimeSlots();
        } finally {
            showLoading(false);
        }
    },
    
    /**
     * Actualiza el texto de fecha seleccionada
     */
    updateSelectedDateText() {
        const selectedDateElement = document.getElementById('selectedDateText');
        if (selectedDateElement && AppState.selectedDate) {
            const dateText = AppState.selectedDate.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            selectedDateElement.textContent = dateText;
        }
    },
    
    /**
     * Genera slots de tiempo disponibles
     * @param {Array} availability - Horarios disponibles desde la API
     */
    generateTimeSlots(availability = null) {
        const timeSlots = document.getElementById('timeSlots');
        if (!timeSlots) return;
        
        // Limpiar slots anteriores
        timeSlots.innerHTML = '';
        
        // Usar horarios de la API o fallback
        const availableSlots = availability || [
            '08:00', '09:00', '10:00', '11:00', '11:30', 
            '12:00', '12:30', '15:00', '16:00', '17:00', '18:00', '19:00'
        ].filter(() => Math.random() > 0.3);
        
        if (availableSlots.length === 0) {
            timeSlots.innerHTML = '<p>No hay horarios disponibles para esta fecha.</p>';
            return;
        }
        
        // Crear fragmento para mejor rendimiento
        const fragment = document.createDocumentFragment();
        
        availableSlots.forEach(time => {
            const slot = this.createTimeSlot(time);
            fragment.appendChild(slot);
        });
        
        timeSlots.appendChild(fragment);
    },
    
    /**
     * Crea un slot de tiempo seleccionable
     * @param {string} time - Hora en formato HH:MM
     * @returns {HTMLElement} Elemento de slot
     */
    createTimeSlot(time) {
        const slot = createElement('button', {
            className: 'time-slot',
            type: 'button',
            'data-time': time,
            'aria-label': `Seleccionar horario ${time}`
        }, time);
        
        slot.addEventListener('click', () => this.selectTime(time, slot));
        
        return slot;
    },
    
    /**
     * Selecciona un horario específico
     * @param {string} time - Hora seleccionada
     * @param {HTMLElement} element - Elemento clickeado
     */
    selectTime(time, element) {
        // Remover selección anterior
        document.querySelectorAll('.time-slot.selected').forEach(slot => {
            slot.classList.remove('selected');
            slot.setAttribute('aria-selected', 'false');
        });
        
        // Marcar nueva selección
        element.classList.add('selected');
        element.setAttribute('aria-selected', 'true');
        
        // Actualizar estado
        AppState.selectedTime = time;
        
        // Actualizar resumen
        AppointmentController.updateSummary();
    },
    
    /**
     * Limpia los slots de tiempo
     */
    clearTimeSlots() {
        const timeSlots = document.getElementById('timeSlots');
        if (timeSlots) {
            timeSlots.innerHTML = '<p>Selecciona una fecha para ver horarios disponibles.</p>';
        }
    },
    
    /**
     * Navega al mes anterior
     */
    previousMonth() {
        AppState.currentDate.setMonth(AppState.currentDate.getMonth() - 1);
        this.updateDisplay();
    },
    
    /**
     * Navega al mes siguiente
     */
    nextMonth() {
        AppState.currentDate.setMonth(AppState.currentDate.getMonth() + 1);
        this.updateDisplay();
    }
};

// =============================================================================
// CONTROLADOR DE BÚSQUEDA
// =============================================================================

/**
 * Controlador de búsqueda con filtros avanzados e integración API
 */
const SearchController = {
    /**
     * Inicializa el sistema de búsqueda
     */
    init() {
        this.setupSearchInput();
        this.setupLocationFilter();
        this.setupTabSwitching();
    },
    
    /**
     * Configura el input de búsqueda con debounce
     */
    setupSearchInput() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;
        
        const debouncedSearch = debounce(this.performSearch.bind(this), AppConfig.DEBOUNCE_DELAY);
        
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length >= 2) {
                debouncedSearch(query);
            } else if (query.length === 0) {
                this.clearSearchResults();
            }
        });
        
        // Búsqueda al presionar Enter
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.performSearch(e.target.value.trim());
            }
        });
    },
    
    /**
     * Configura el filtro de ubicación
     */
    setupLocationFilter() {
        const locationSelect = document.getElementById('locationSelect');
        if (!locationSelect) return;
        
        locationSelect.addEventListener('change', (e) => {
            const selectedLocation = e.target.value;
            this.filterByLocation(selectedLocation);
        });
    },
    
    /**
     * Configura el cambio entre tabs (online/presencial)
     */
    setupTabSwitching() {
        const tabs = document.querySelectorAll('.tab-button');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabType = e.target.dataset.tab;
                this.switchTab(tabType);
            });
        });
    },
    
    /**
     * Realiza búsqueda a través de la API
     * @param {string} query - Término de búsqueda
     */
    async performSearch(query) {
        if (!query || query.length < 2) return;
        
        try {
            showLoading(true, 'Buscando...');
            
            // Realizar búsqueda a través de la API
            const results = await API.search.doctors(query, {
                location: AppState.selectedLocation || AppConfig.DEFAULT_CITY,
                consultation_type: AppState.activeTab
            });
            
            this.displaySearchResults(results, query);
            
        } catch (error) {
            console.error('Error en búsqueda:', error);
            showNotification('Error al realizar la búsqueda', 'error');
        } finally {
            showLoading(false);
        }
    },
    
    /**
     * Muestra los resultados de búsqueda
     * @param {Array} results - Resultados de la búsqueda
     * @param {string} query - Término buscado
     */
    displaySearchResults(results, query) {
        const resultsContainer = document.getElementById('searchResults');
        if (!resultsContainer) return;
        
        // Limpiar resultados anteriores
        resultsContainer.innerHTML = '';
        
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <p>No se encontraron resultados para "${query}"</p>
                    <p>Intenta con otros términos de búsqueda o revisa las especialidades disponibles.</p>
                </div>
            `;
            return;
        }
        
        // Mostrar contador de resultados
        const countElement = createElement('div', {
            className: 'results-count'
        }, `Se encontraron ${results.length} resultado${results.length !== 1 ? 's' : ''} para "${query}"`);
        
        resultsContainer.appendChild(countElement);
        
        // Crear fragmento para mejor rendimiento
        const fragment = document.createDocumentFragment();
        
        results.forEach(doctor => {
            const doctorCard = SpecialtyController.createDoctorCard(doctor);
            doctorCard.classList.add('search-result');
            fragment.appendChild(doctorCard);
        });
        
        resultsContainer.appendChild(fragment);
        
        // Scroll suave a los resultados
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    },
    
    /**
     * Limpia los resultados de búsqueda
     */
    clearSearchResults() {
        const resultsContainer = document.getElementById('searchResults');
        if (resultsContainer) {
            resultsContainer.innerHTML = '';
        }
    },
    
    /**
     * Filtra por ubicación
     * @param {string} location - Ubicación seleccionada
     */
    filterByLocation(location) {
        AppState.selectedLocation = location;
        
        // Si hay una búsqueda activa, re-ejecutarla con el nuevo filtro
        const searchInput = document.getElementById('searchInput');
        if (searchInput && searchInput.value.trim()) {
            this.performSearch(searchInput.value.trim());
        }
    },
    
    /**
     * Cambia entre tabs de consulta
     * @param {string} tabType - Tipo de tab (online/presencial)
     */
    switchTab(tabType) {
        // Actualizar estado
        AppState.activeTab = tabType;
        
        // Actualizar interfaz
        document.querySelectorAll('.tab-button').forEach(tab => {
            tab.classList.remove('active');
            tab.setAttribute('aria-selected', 'false');
        });
        
        const activeTab = document.querySelector(`[data-tab="${tabType}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
            activeTab.setAttribute('aria-selected', 'true');
        }
        
        // Re-ejecutar búsqueda si hay una activa
        const searchInput = document.getElementById('searchInput');
        if (searchInput && searchInput.value.trim()) {
            this.performSearch(searchInput.value.trim());
        }
    }
};

// =============================================================================
// SISTEMA DE NOTIFICACIONES
// =============================================================================

/**
 * Sistema de notificaciones toast con diferentes tipos
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de notificación (success, error, info, warning)
 * @param {number} duration - Duración en ms (default: 5000)
 */
const showNotification = (message, type = 'info', duration = 5000) => {
    // Crear contenedor si no existe
    let container = document.getElementById('notificationContainer');
    if (!container) {
        container = createElement('div', {
            id: 'notificationContainer',
            className: 'notification-container',
            'aria-live': 'polite'
        });
        document.body.appendChild(container);
    }
    
    // Crear notificación
    const notification = createElement('div', {
        className: `notification notification-${type}`,
        role: 'alert'
    });
    
    // Icono según el tipo
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
    };
    
    notification.innerHTML = `
        <span class="notification-icon">${icons[type] || icons.info}</span>
        <span class="notification-message">${message}</span>
        <button class="notification-close" aria-label="Cerrar notificación">×</button>
    `;
    
    // Agregar evento de cierre
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // Agregar al contenedor
    container.appendChild(notification);
    
    // Auto-remover después del tiempo especificado
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, duration);
};

// =============================================================================
// CONTROLADOR DE NAVEGACIÓN
// =============================================================================

/**
 * Controlador de navegación y scroll suave
 */
const NavigationController = {
    /**
     * Inicializa la navegación
     */
    init() {
        this.setupSmoothScrolling();
        this.setupMobileMenu();
        this.setupScrollToTop();
    },
    
    /**
     * Configura el scroll suave para enlaces internos
     */
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    },
    
    /**
     * Configura el menú móvil
     */
    setupMobileMenu() {
        const mobileToggle = document.getElementById('mobileMenuToggle');
        const mobileMenu = document.getElementById('mobileMenu');
        
        if (mobileToggle && mobileMenu) {
            mobileToggle.addEventListener('click', () => {
                const isOpen = mobileMenu.classList.contains('show');
                
                if (isOpen) {
                    mobileMenu.classList.remove('show');
                    mobileToggle.setAttribute('aria-expanded', 'false');
                } else {
                    mobileMenu.classList.add('show');
                    mobileToggle.setAttribute('aria-expanded', 'true');
                }
            });
        }
    },
    
    /**
     * Configura el botón de scroll to top
     */
    setupScrollToTop() {
        const scrollTopBtn = document.getElementById('scrollToTop');
        
        if (scrollTopBtn) {
            // Mostrar/ocultar botón según scroll
            window.addEventListener('scroll', () => {
                if (window.pageYOffset > 300) {
                    scrollTopBtn.classList.add('show');
                } else {
                    scrollTopBtn.classList.remove('show');
                }
            });
            
            // Funcionalidad de scroll to top
            scrollTopBtn.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }
};

// =============================================================================
// INICIALIZACIÓN DE LA APLICACIÓN
// =============================================================================

/**
 * Controlador principal de inicialización
 */
const AppController = {
    /**
     * Inicializa toda la aplicación
     */
    async init() {
        try {
            console.log('🚀 Iniciando MediConsulta...');
            
            // Verificar dependencias críticas
            this.checkDependencies();
            
            // Inicializar API
            await API.init();
            
            // Inicializar controladores
            await this.initializeControllers();
            
            // Configurar eventos globales
            this.setupGlobalEvents();
            
            // Cargar datos iniciales
            await this.loadInitialData();
            
            console.log('✅ MediConsulta inicializado correctamente');
            
        } catch (error) {
            console.error('❌ Error al inicializar la aplicación:', error);
            showNotification('Error al cargar la aplicación. Por favor, recarga la página.', 'error');
        }
    },
    
    /**
     * Verifica que las dependencias críticas estén disponibles
     */
    checkDependencies() {
        const requiredElements = [
            'specialtiesGrid',
            'searchInput',
            'specialtyModal',
            'calendarModal'
        ];
        
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        
        if (missingElements.length > 0) {
            throw new Error(`Elementos requeridos no encontrados: ${missingElements.join(', ')}`);
        }
    },
    
    /**
     * Inicializa todos los controladores
     */
    async initializeControllers() {
        // Inicializar controladores en orden de dependencia
        NavigationController.init();
        SearchController.init();
        
        // Inicializar especialidades (carga datos de API)
        await SpecialtyController.init();
        
        console.log('📋 Controladores inicializados');
    },
    
    /**
     * Configura eventos globales de la aplicación
     */
    setupGlobalEvents() {
        // Cerrar modales con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && AppState.isModalOpen) {
                const openModal = document.querySelector('.modal.show, .calendar-modal.show');
                if (openModal) {
                    ModalController.close(openModal.id);
                }
            }
        });
        
        // Cerrar modales al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal') || e.target.classList.contains('calendar-modal')) {
                ModalController.close(e.target.id);
            }
        });
        
        // Manejar errores globales
        window.addEventListener('error', (e) => {
            console.error('Error global:', e.error);
            showNotification('Ha ocurrido un error inesperado', 'error');
        });
        
        // Manejar errores de promesas no capturadas
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Promesa rechazada no manejada:', e.reason);
            showNotification('Error de conexión. Verifica tu internet.', 'error');
        });
        
        console.log('🔧 Eventos globales configurados');
    },
    
    /**
     * Carga datos iniciales necesarios
     */
    async loadInitialData() {
        try {
            // Las especialidades ya se cargan en SpecialtyController.init()
            // Aquí se pueden cargar otros datos iniciales si es necesario
            
            console.log('📊 Datos iniciales cargados');
            
        } catch (error) {
            console.error('Error al cargar datos iniciales:', error);
            // No lanzar error aquí para permitir que la app funcione con datos de fallback
        }
    }
};

// =============================================================================
// EVENTOS DE VENTANA GLOBAL
// =============================================================================

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    AppController.init();
});

// Manejar cambios de tamaño de ventana
window.addEventListener('resize', debounce(() => {
    // Reajustar elementos si es necesario
    if (AppState.isModalOpen) {
        // Reposicionar modales si es necesario
    }
}, 250));

// =============================================================================
// EXPORTAR PARA USO GLOBAL
// =============================================================================

// Hacer controladores disponibles globalmente para uso en HTML
window.MediConsulta = {
    SpecialtyController,
    AppointmentController,
    CalendarController,
    SearchController,
    ModalController,
    NavigationController,
    AppController,
    showNotification,
    AppState,
    AppConfig
};

// Alias para compatibilidad
window.SpecialtyController = SpecialtyController;
window.AppointmentController = AppointmentController;
window.CalendarController = CalendarController;
window.ModalController = ModalController;
window.showNotification = showNotification;

// =============================================================================
// FUNCIONES GLOBALES PARA EL HTML
// =============================================================================

/**
 * Cambia entre pestañas (online/presencial)
 * @param {HTMLElement} element - Elemento de pestaña clickeado
 */
function switchTab(element) {
    // Remover clase activa de todas las pestañas
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Agregar clase activa al elemento clickeado
    element.classList.add('active');
    
    // Determinar el tipo de pestaña seleccionada
    const tabType = element.textContent.includes('En línea') ? 'online' : 'presencial';
    
    // Actualizar estado global
    AppState.activeTab = tabType;
}

/**
 * Maneja la búsqueda desde el formulario principal
 * @param {Event} event - Evento del formulario
 * @returns {boolean} False para prevenir el comportamiento por defecto
 */
function handleSearch(event) {
    event.preventDefault();
    
    // Obtener valor de búsqueda
    const searchInput = event.target.querySelector('input[type="text"]');
    const locationSelect = event.target.querySelector('select');
    
    if (!searchInput || !searchInput.value.trim()) {
        showNotification('Por favor ingresa un término de búsqueda', 'warning');
        return false;
    }
    
    // Actualizar ubicación en el estado global
    if (locationSelect && locationSelect.value !== 'p. ej. Guadalajara') {
        AppState.selectedLocation = locationSelect.value;
    }
    
    // Realizar búsqueda
    SearchController.performSearch(searchInput.value.trim());
    
    return false;
}

/**
 * Abre el modal de especialidad y carga la información de doctores
 * @param {string} specialtyCode - Código de la especialidad
 */
function openSpecialtyModal(specialtyCode) {
    // Mapeo de códigos a IDs (en una implementación real, esto vendría de la API)
    const specialtyMap = {
        'ginecologo': 1,
        'psicologo': 2,
        'dermatologo': 3,
        'oftalmologo': 4,
        'urologo': 5,
        'ortopedista': 6,
        'otorrinolaringologo': 7,
        'pediatra': 8,
        'psiquiatra': 9,
        'cirujano': 10,
        'internista': 11,
        'traumatologo': 12
    };
    
    const specialtyId = specialtyMap[specialtyCode];
    
    if (specialtyId) {
        // Mostrar el modal inmediatamente con animación
        const modal = document.getElementById('specialtyModal');
        if (!modal) return;
        
        // Actualizar título del modal según la especialidad
        const titleElement = document.getElementById('modalTitle');
        if (titleElement) {
            const specialtyNames = {
                'ginecologo': 'Ginecología',
                'psicologo': 'Psicología',
                'dermatologo': 'Dermatología',
                'oftalmologo': 'Oftalmología',
                'urologo': 'Urología',
                'ortopedista': 'Ortopedia',
                'otorrinolaringologo': 'Otorrinolaringología',
                'pediatra': 'Pediatría',
                'psiquiatra': 'Psiquiatría',
                'cirujano': 'Cirugía General',
                'internista': 'Medicina Interna',
                'traumatologo': 'Traumatología'
            };
            
            titleElement.textContent = specialtyNames[specialtyCode] || specialtyCode;
        }
        
        // Actualizar descripción
        const descriptionElement = document.getElementById('modalDescription');
        if (descriptionElement) {
            const descriptions = {
                'ginecologo': 'La ginecología es la especialidad médica dedicada al cuidado del sistema reproductivo femenino.',
                'psicologo': 'La psicología se dedica al estudio y tratamiento de la mente y el comportamiento humano.',
                'dermatologo': 'La dermatología se especializa en el diagnóstico y tratamiento de enfermedades de la piel.',
                'oftalmologo': 'La oftalmología se dedica al diagnóstico y tratamiento de enfermedades de los ojos.',
                'urologo': 'La urología se especializa en el diagnóstico y tratamiento de enfermedades del sistema urinario.',
                'ortopedista': 'La ortopedia se dedica al diagnóstico y tratamiento de enfermedades del sistema músculo-esquelético.',
                'otorrinolaringologo': 'La otorrinolaringología se especializa en enfermedades de oído, nariz y garganta.',
                'pediatra': 'La pediatría se dedica al cuidado de la salud de niños y adolescentes.',
                'psiquiatra': 'La psiquiatría se especializa en el diagnóstico y tratamiento de enfermedades mentales.',
                'cirujano': 'La cirugía general se dedica a procedimientos quirúrgicos de diversas partes del cuerpo.',
                'internista': 'La medicina interna se dedica al diagnóstico y tratamiento de enfermedades en adultos.',
                'traumatologo': 'La traumatología se especializa en lesiones del sistema músculo-esquelético.'
            };
            
            descriptionElement.textContent = descriptions[specialtyCode] || 
                `Especialidad médica enfocada en el diagnóstico y tratamiento de enfermedades.`;
        }
        
        // Cargar doctores de ejemplo mientras se espera la respuesta de la API
        const doctorsList = document.getElementById('doctorsList');
        if (doctorsList) {
            // Limpiar lista anterior
            doctorsList.innerHTML = '';
            
            // Crear doctor de ejemplo (similar al de la imagen)
            const doctorData = {
                id: 1,
                name: 'Dra. María Elena González',
                location: 'Zona Centro, Guadalajara',
                experience: '15 años de experiencia',
                consultation_fee: 1000,
                rating: 4.8,
                reviews: 234
            };
            
            const doctorCard = document.createElement('article');
            doctorCard.className = 'doctor-card';
            doctorCard.role = 'article';
            
            const priceRange = formatPrice(doctorData.consultation_fee * 0.8) + ' - ' + 
                              formatPrice(doctorData.consultation_fee * 1.2);
            
            doctorCard.innerHTML = `
                <div class="doctor-info">
                    <div class="doctor-details">
                        <h4>${doctorData.name}</h4>
                        <p aria-label="Ubicación">📍 ${doctorData.location}</p>
                        <p aria-label="Experiencia">🎓 ${doctorData.experience}</p>
                        <p aria-label="Precio">💰 ${priceRange}</p>
                        <div class="doctor-rating">
                            <span class="stars">★★★★★</span>
                            <span>${doctorData.rating} (${doctorData.reviews} opiniones)</span>
                        </div>
                    </div>
                    <div class="doctor-actions">
                        <button class="btn btn-primary" 
                                onclick="pedirCita(${doctorData.id})"
                                aria-label="Agendar cita con ${doctorData.name}">
                            📅 Pedir Cita
                        </button>
                        <button class="btn btn-outline" 
                                onclick="verPerfil(${doctorData.id})"
                                aria-label="Ver perfil de ${doctorData.name}">
                            👤 Ver Perfil
                        </button>
                    </div>
                </div>
            `;
            
            doctorsList.appendChild(doctorCard);
        }
        
        // Mostrar modal
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Intentar obtener datos actualizados de la API
        setTimeout(() => {
            try {
                if (typeof SpecialtyController !== 'undefined' && 
                    typeof SpecialtyController.openModal === 'function') {
                    SpecialtyController.openModal(specialtyId);
                }
            } catch (error) {
                console.error('Error al cargar datos desde la API:', error);
            }
        }, 100);
    } else {
        console.error(`Especialidad no encontrada: ${specialtyCode}`);
        showNotification('Especialidad no disponible', 'error');
    }
}

/**
 * Cierra el modal al hacer clic fuera del contenido
 * @param {Event} event - Evento de clic
 * @param {string} modalId - ID del modal
 */
function closeModalOnOutside(event, modalId) {
    if (event.target.id === modalId) {
        closeModal(modalId);
    }
}

/**
 * Cierra un modal específico
 * @param {string} modalId - ID del modal a cerrar
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
    
    // También usar el controlador si está disponible
    if (typeof ModalController !== 'undefined' && 
        typeof ModalController.close === 'function') {
        ModalController.close(modalId);
    }
}
/**
 * Función para pedir cita con un doctor específico
 * @param {number} doctorId - ID del doctor
 */
function pedirCita(doctorId) {
    // Cerrar modal de especialidad
    closeModal('specialtyModal');
    
    // Mostrar modal de calendario
    const calendarModal = document.getElementById('calendarModal');
    if (calendarModal) {
        // Actualizar información del doctor en el modal
        const doctorName = document.getElementById('selectedDoctorName');
        const doctorSpecialty = document.getElementById('selectedDoctorSpecialty');
        const doctorLocation = document.getElementById('selectedDoctorLocation');
        
        if (doctorName) doctorName.textContent = 'Dra. María Elena González';
        if (doctorSpecialty) doctorSpecialty.textContent = document.getElementById('modalTitle').textContent;
        if (doctorLocation) doctorLocation.textContent = '📍 Zona Centro, Guadalajara';
        
        // Mostrar modal de calendario
        calendarModal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Intentar usar el controlador si está disponible
        if (typeof AppointmentController !== 'undefined' && 
            typeof AppointmentController.initBooking === 'function') {
            try {
                AppointmentController.initBooking(doctorId);
            } catch (error) {
                console.error('Error al iniciar reserva:', error);
            }
        }
    }
}

/**
 * Función para ver el perfil de un doctor
 * @param {number} doctorId - ID del doctor
 */
function verPerfil(doctorId) {
    // Mostrar notificación de perfil
    showNotification('Mostrando perfil del doctor', 'info');
    
    // Intentar usar el controlador si está disponible
    if (typeof SpecialtyController !== 'undefined' && 
        typeof SpecialtyController.viewProfile === 'function') {
        try {
            SpecialtyController.viewProfile(doctorId);
        } catch (error) {
            console.error('Error al cargar perfil:', error);
        }
    }
}
/**
 * Cambia el mes en el calendario
 * @param {number} direction - Dirección del cambio (-1: anterior, 1: siguiente)
 */
function changeMonth(direction) {
    if (direction < 0) {
        CalendarController.previousMonth();
    } else {
        CalendarController.nextMonth();
    }
}

/**
 * Confirma la cita médica
 */
function confirmAppointment() {
    AppointmentController.confirm();
}

console.log('🎯 MediConsulta App cargado - Versión 1.0.0');