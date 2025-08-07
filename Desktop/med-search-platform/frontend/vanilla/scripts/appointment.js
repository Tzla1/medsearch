/* ================================================================
   Med Search Platform - Appointment Booking JavaScript
   Handles appointment booking functionality
   ================================================================ */

// ================================================================
// GLOBAL VARIABLES
// ================================================================

let selectedDoctor = null;
let availableTimeSlots = [];
let isSubmitting = false;

// ================================================================
// PAGE INITIALIZATION
// ================================================================

document.addEventListener('DOMContentLoaded', function() {
  initializeAppointmentPage();
});

/**
 * Initialize appointment booking page
 */
async function initializeAppointmentPage() {
  try {
    // Get doctor ID from URL parameters
    const doctorId = getUrlParam('doctorId');
    
    if (!doctorId) {
      showToast('Doctor no especificado', 'error');
      setTimeout(() => {
        window.location.href = 'search.html';
      }, 2000);
      return;
    }

    // Load doctor information
    await loadDoctorInfo(doctorId);
    
    // Initialize form functionality
    initializeAppointmentForm();
    initializeDatePicker();
    initializePatientInfo();
    
    console.log('Appointment page initialized successfully');
  } catch (error) {
    console.error('Error initializing appointment page:', error);
    showToast('Error al cargar la página', 'error');
  }
}

// ================================================================
// DOCTOR INFORMATION
// ================================================================

/**
 * Load doctor information
 * @param {string} doctorId - Doctor ID
 */
async function loadDoctorInfo(doctorId) {
  try {
    showLoadingState($('#doctor-info'), 'doctor-info', 1);
    
    // Try to get doctor from API
    let doctor;
    try {
      const response = await doctorsService.getById(doctorId);
      doctor = response.doctor;
    } catch (error) {
      // Fallback to demo data
      doctor = getDemoDoctor(doctorId);
    }
    
    if (!doctor) {
      throw new Error('Doctor not found');
    }
    
    selectedDoctor = doctor;
    displayDoctorInfo(doctor);
    
  } catch (error) {
    console.error('Error loading doctor info:', error);
    showToast('Error al cargar información del doctor', 'error');
    setTimeout(() => {
      window.location.href = 'search.html';
    }, 2000);
  }
}

/**
 * Display doctor information
 * @param {Object} doctor - Doctor object
 */
function displayDoctorInfo(doctor) {
  // Update doctor image
  const doctorImage = $('#doctor-image');
  if (doctorImage) {
    doctorImage.src = doctor.photo || 'assets/doctors/doctor-1.jpg';
    doctorImage.alt = doctor.name;
  }
  
  // Update doctor name
  const doctorName = $('#doctor-name');
  if (doctorName) {
    doctorName.textContent = doctor.name;
  }
  
  // Update specialty
  const doctorSpecialty = $('#doctor-specialty');
  if (doctorSpecialty) {
    doctorSpecialty.textContent = doctor.specialty;
  }
  
  // Update rating
  const ratingScore = $('#doctor-rating');
  if (ratingScore) {
    ratingScore.textContent = doctor.rating || '4.8';
  }
  
  // Update reviews count
  const reviewsCount = $('#doctor-reviews');
  if (reviewsCount) {
    reviewsCount.textContent = `(${doctor.reviewCount || 127} reseñas)`;
  }
  
  // Update location
  const doctorLocation = $('#doctor-location');
  if (doctorLocation) {
    doctorLocation.textContent = doctor.address || 'Consultorio Médico Central';
  }
  
  // Update consultation fee
  const doctorFee = $('#doctor-fee');
  if (doctorFee) {
    doctorFee.textContent = `$${doctor.consultationFee || 800}`;
  }
  
  // Update rating stars
  updateRatingStars(doctor.rating || 4.8);
}

/**
 * Update rating stars display
 * @param {number} rating - Rating value
 */
function updateRatingStars(rating) {
  const starsContainer = $('.rating-stars');
  if (!starsContainer) return;
  
  const stars = starsContainer.querySelectorAll('.star');
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  stars.forEach((star, index) => {
    star.classList.remove('filled', 'half');
    
    if (index < fullStars) {
      star.classList.add('filled');
    } else if (index === fullStars && hasHalfStar) {
      star.classList.add('half');
    }
  });
}

/**
 * Get demo doctor data
 * @param {string} doctorId - Doctor ID
 * @returns {Object} Demo doctor object
 */
function getDemoDoctor(doctorId) {
  const demoDoctors = {
    '1': {
      id: 1,
      name: 'Dr. Roberto Martínez',
      specialty: 'Cardiología',
      rating: 4.8,
      reviewCount: 127,
      consultationFee: 800,
      photo: 'assets/doctors/doctor-1.jpg',
      address: 'Consultorio Médico Central - Polanco'
    },
    '2': {
      id: 2,
      name: 'Dra. Ana García',
      specialty: 'Pediatría',
      rating: 4.9,
      reviewCount: 95,
      consultationFee: 600,
      photo: 'assets/doctors/doctor-2.jpg',
      address: 'Hospital Infantil - Roma Norte'
    },
    '3': {
      id: 3,
      name: 'Dr. Luis Rodríguez',
      specialty: 'Dermatología',
      rating: 4.7,
      reviewCount: 203,
      consultationFee: 750,
      photo: 'assets/doctors/doctor-3.jpg',
      address: 'Clínica Dermatológica - Condesa'
    }
  };
  
  return demoDoctors[doctorId] || demoDoctors['1'];
}

// ================================================================
// APPOINTMENT FORM
// ================================================================

/**
 * Initialize appointment form
 */
function initializeAppointmentForm() {
  const appointmentForm = $('#appointment-form');
  if (!appointmentForm) return;
  
  appointmentForm.addEventListener('submit', handleAppointmentSubmission);
  
  // Initialize form validation
  initializeFormValidation();
  
  // Initialize reason selection
  initializeReasonSelection();
}

/**
 * Initialize date picker
 */
function initializeDatePicker() {
  const dateInput = $('#appointment-date');
  if (!dateInput) return;
  
  // Set minimum date to today
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];
  dateInput.min = minDate;
  
  // Set maximum date to 3 months from now
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  dateInput.max = maxDate.toISOString().split('T')[0];
  
  // Add event listener for date changes
  dateInput.addEventListener('change', handleDateChange);
}

/**
 * Handle date change
 * @param {Event} event - Change event
 */
async function handleDateChange(event) {
  const selectedDate = event.target.value;
  if (!selectedDate || !selectedDoctor) return;
  
  try {
    // Load available time slots for the selected date
    await loadAvailableTimeSlots(selectedDoctor.id, selectedDate);
  } catch (error) {
    console.error('Error loading time slots:', error);
    showToast('Error al cargar horarios disponibles', 'error');
  }
}

/**
 * Load available time slots
 * @param {string} doctorId - Doctor ID
 * @param {string} date - Selected date
 */
async function loadAvailableTimeSlots(doctorId, date) {
  const timeSelect = $('#appointment-time');
  if (!timeSelect) return;
  
  try {
    // Clear existing options
    timeSelect.innerHTML = '<option value="">Cargando horarios...</option>';
    
    // Try to get availability from API
    let timeSlots;
    try {
      const response = await doctorsService.getAvailability(doctorId, date);
      timeSlots = response.timeSlots || [];
    } catch (error) {
      // Fallback to demo time slots
      timeSlots = generateDemoTimeSlots();
    }
    
    // Populate time select
    populateTimeSlots(timeSlots);
    availableTimeSlots = timeSlots;
    
  } catch (error) {
    console.error('Error loading time slots:', error);
    timeSelect.innerHTML = '<option value="">Error al cargar horarios</option>';
  }
}

/**
 * Populate time slots
 * @param {Array} timeSlots - Available time slots
 */
function populateTimeSlots(timeSlots) {
  const timeSelect = $('#appointment-time');
  if (!timeSelect) return;
  
  // Clear existing options
  timeSelect.innerHTML = '<option value="">Seleccionar hora</option>';
  
  if (timeSlots.length === 0) {
    timeSelect.innerHTML = '<option value="">No hay horarios disponibles</option>';
    return;
  }
  
  // Add available time slots
  timeSlots.forEach(timeSlot => {
    const option = createElement('option', {
      value: timeSlot
    }, timeSlot);
    
    timeSelect.appendChild(option);
  });
}

/**
 * Generate demo time slots
 * @returns {Array} Demo time slots
 */
function generateDemoTimeSlots() {
  const slots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
    '05:00 PM'
  ];
  
  // Randomly remove some slots to simulate booking
  return slots.filter(() => Math.random() > 0.3);
}

/**
 * Initialize patient information
 */
function initializePatientInfo() {
  // Auto-fill if user is logged in
  const user = authService.getCurrentUser();
  if (user) {
    const nameInput = $('#patient-name');
    const emailInput = $('#patient-email');
    
    if (nameInput && user.firstName && user.lastName) {
      nameInput.value = `${user.firstName} ${user.lastName}`;
    }
    
    if (emailInput && user.email) {
      emailInput.value = user.email;
    }
  }
}

/**
 * Initialize reason selection
 */
function initializeReasonSelection() {
  const reasonSelect = $('#appointment-reason');
  if (!reasonSelect) return;
  
  reasonSelect.addEventListener('change', function() {
    if (this.value === 'otro') {
      // Could show additional text field for custom reason
      showCustomReasonField();
    } else {
      hideCustomReasonField();
    }
  });
}

/**
 * Show custom reason field
 */
function showCustomReasonField() {
  const reasonGroup = $('#appointment-reason').closest('.form-group');
  if (!reasonGroup) return;
  
  // Check if custom field already exists
  if (reasonGroup.querySelector('#custom-reason')) return;
  
  const customField = createElement('div', { className: 'form-group' }, [
    createElement('label', {
      htmlFor: 'custom-reason',
      className: 'form-label'
    }, 'Especifique el motivo:'),
    createElement('input', {
      type: 'text',
      id: 'custom-reason',
      name: 'customReason',
      className: 'form-input',
      placeholder: 'Describa brevemente el motivo...'
    })
  ]);
  
  reasonGroup.insertAdjacentElement('afterend', customField);
}

/**
 * Hide custom reason field
 */
function hideCustomReasonField() {
  const customField = $('#custom-reason');
  if (customField) {
    customField.closest('.form-group').remove();
  }
}

// ================================================================
// FORM VALIDATION
// ================================================================

/**
 * Initialize form validation
 */
function initializeFormValidation() {
  const form = $('#appointment-form');
  if (!form) return;
  
  // Add real-time validation for required fields
  const requiredFields = form.querySelectorAll('[required]');
  
  requiredFields.forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => clearFieldError(field.name));
  });
  
  // Phone number formatting
  const phoneInput = $('#patient-phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', formatPhoneNumber);
  }
  
  // Email validation
  const emailInput = $('#patient-email');
  if (emailInput) {
    emailInput.addEventListener('blur', () => validateEmail(emailInput.value, 'patient-email'));
  }
}

/**
 * Validate form field
 * @param {Element} field - Form field element
 */
function validateField(field) {
  const fieldName = field.name;
  const value = field.value.trim();
  
  // Clear previous errors
  clearFieldError(fieldName);
  
  // Required field validation
  if (field.required && !value) {
    showFieldError(fieldName, `${getFieldLabel(field)} es requerido`);
    return false;
  }
  
  // Specific field validations
  switch (fieldName) {
    case 'patientEmail':
      return validateEmail(value, fieldName);
    case 'patientPhone':
      return validatePhone(value, fieldName);
    case 'patientAge':
      return validateAge(value, fieldName);
    case 'appointmentDate':
      return validateDate(value, fieldName);
    default:
      return true;
  }
}

/**
 * Validate email
 * @param {string} email - Email value
 * @param {string} fieldName - Field name
 * @returns {boolean} Is valid
 */
function validateEmail(email, fieldName) {
  if (!isValidEmail(email)) {
    showFieldError(fieldName, 'Ingrese un email válido');
    return false;
  }
  return true;
}

/**
 * Validate phone number
 * @param {string} phone - Phone value
 * @param {string} fieldName - Field name
 * @returns {boolean} Is valid
 */
function validatePhone(phone, fieldName) {
  const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
  if (!phoneRegex.test(phone)) {
    showFieldError(fieldName, 'Ingrese un número de teléfono válido');
    return false;
  }
  return true;
}

/**
 * Validate age
 * @param {string} age - Age value
 * @param {string} fieldName - Field name
 * @returns {boolean} Is valid
 */
function validateAge(age, fieldName) {
  const ageNum = parseInt(age);
  if (age && (isNaN(ageNum) || ageNum < 1 || ageNum > 120)) {
    showFieldError(fieldName, 'Ingrese una edad válida (1-120)');
    return false;
  }
  return true;
}

/**
 * Validate appointment date
 * @param {string} date - Date value
 * @param {string} fieldName - Field name
 * @returns {boolean} Is valid
 */
function validateDate(date, fieldName) {
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (selectedDate < today) {
    showFieldError(fieldName, 'La fecha no puede ser anterior a hoy');
    return false;
  }
  
  return true;
}

/**
 * Format phone number input
 * @param {Event} event - Input event
 */
function formatPhoneNumber(event) {
  let value = event.target.value.replace(/\D/g, '');
  
  // Limit to 10 digits
  if (value.length > 10) {
    value = value.slice(0, 10);
  }
  
  // Format as (XXX) XXX-XXXX
  if (value.length >= 6) {
    value = `${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6)}`;
  } else if (value.length >= 3) {
    value = `${value.slice(0, 3)} ${value.slice(3)}`;
  }
  
  event.target.value = value;
}

/**
 * Get field label
 * @param {Element} field - Form field
 * @returns {string} Field label
 */
function getFieldLabel(field) {
  const label = document.querySelector(`label[for="${field.id}"]`);
  return label ? label.textContent.replace('*', '').trim() : field.name;
}

// ================================================================
// FORM SUBMISSION
// ================================================================

/**
 * Handle appointment form submission
 * @param {Event} event - Submit event
 */
async function handleAppointmentSubmission(event) {
  event.preventDefault();
  
  if (isSubmitting) return;
  
  try {
    isSubmitting = true;
    updateSubmitButton(true);
    
    // Validate form
    if (!validateAppointmentForm()) {
      return;
    }
    
    // Collect form data
    const appointmentData = collectFormData();
    
    // Submit appointment
    await submitAppointment(appointmentData);
    
    // Show success
    showAppointmentConfirmation(appointmentData);
    
  } catch (error) {
    console.error('Appointment submission error:', error);
    handleSubmissionError(error);
  } finally {
    isSubmitting = false;
    updateSubmitButton(false);
  }
}

/**
 * Validate entire appointment form
 * @returns {boolean} Is form valid
 */
function validateAppointmentForm() {
  const form = $('#appointment-form');
  if (!form) return false;
  
  let isValid = true;
  const requiredFields = form.querySelectorAll('[required]');
  
  // Validate all required fields
  requiredFields.forEach(field => {
    if (!validateField(field)) {
      isValid = false;
    }
  });
  
  // Additional validations
  if (!availableTimeSlots.length && $('#appointment-date').value) {
    showFieldError('appointment-time', 'Seleccione una hora disponible');
    isValid = false;
  }
  
  return isValid;
}

/**
 * Collect form data
 * @returns {Object} Form data object
 */
function collectFormData() {
  const form = $('#appointment-form');
  const formData = new FormData(form);
  
  const appointmentData = {
    doctorId: selectedDoctor.id,
    patientName: formData.get('patientName'),
    patientEmail: formData.get('patientEmail'),
    patientPhone: formData.get('patientPhone'),
    patientAge: formData.get('patientAge'),
    appointmentDate: formData.get('appointmentDate'),
    appointmentTime: formData.get('appointmentTime'),
    reason: formData.get('appointmentReason'),
    notes: formData.get('appointmentNotes'),
    customReason: formData.get('customReason')
  };
  
  // Use custom reason if "otro" is selected
  if (appointmentData.reason === 'otro' && appointmentData.customReason) {
    appointmentData.reason = appointmentData.customReason;
  }
  
  return appointmentData;
}

/**
 * Submit appointment to backend
 * @param {Object} appointmentData - Appointment data
 */
async function submitAppointment(appointmentData) {
  try {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      // Store form data and redirect to login
      setStorageItem('pendingAppointment', appointmentData);
      setStorageItem('returnUrl', window.location.href);
      window.location.href = 'login.html';
      return;
    }
    
    // Submit to API
    const response = await appointmentsService.create(appointmentData);
    
    if (!response.success && !response.appointment) {
      throw new Error(response.message || 'Error al agendar la cita');
    }
    
    // Store appointment details for confirmation
    setStorageItem('lastAppointment', response.appointment || appointmentData);
    
  } catch (error) {
    console.error('API submission error:', error);
    
    // For demo purposes, simulate successful submission
    if (error.isNetworkError || error.status === 0) {
      console.log('Demo mode: Simulating successful appointment creation');
      setStorageItem('lastAppointment', {
        ...appointmentData,
        id: Date.now(),
        status: 'scheduled',
        confirmationNumber: 'DEMO-' + Math.random().toString(36).substr(2, 9).toUpperCase()
      });
    } else {
      throw error;
    }
  }
}

/**
 * Show appointment confirmation
 * @param {Object} appointmentData - Appointment data
 */
function showAppointmentConfirmation(appointmentData) {
  const modal = $('#confirmation-modal');
  const summaryContainer = $('#appointment-summary');
  
  if (!modal || !summaryContainer) return;
  
  // Create appointment summary
  const summary = createElement('div', { className: 'summary-content' }, [
    createElement('div', { className: 'summary-row' }, [
      createElement('strong', {}, 'Doctor: '),
      createElement('span', {}, selectedDoctor.name)
    ]),
    createElement('div', { className: 'summary-row' }, [
      createElement('strong', {}, 'Especialidad: '),
      createElement('span', {}, selectedDoctor.specialty)
    ]),
    createElement('div', { className: 'summary-row' }, [
      createElement('strong', {}, 'Fecha: '),
      createElement('span', {}, formatDate(appointmentData.appointmentDate))
    ]),
    createElement('div', { className: 'summary-row' }, [
      createElement('strong', {}, 'Hora: '),
      createElement('span', {}, appointmentData.appointmentTime)
    ]),
    createElement('div', { className: 'summary-row' }, [
      createElement('strong', {}, 'Paciente: '),
      createElement('span', {}, appointmentData.patientName)
    ]),
    createElement('div', { className: 'summary-row' }, [
      createElement('strong', {}, 'Costo: '),
      createElement('span', {}, `$${selectedDoctor.consultationFee}`)
    ])
  ]);
  
  summaryContainer.innerHTML = '';
  summaryContainer.appendChild(summary);
  
  // Show modal
  modal.style.display = 'flex';
}

/**
 * Update submit button state
 * @param {boolean} loading - Is loading
 */
function updateSubmitButton(loading) {
  const submitButton = $('#submit-appointment');
  if (!submitButton) return;
  
  const btnText = submitButton.querySelector('.btn-text');
  const btnLoading = submitButton.querySelector('.btn-loading');
  
  if (loading) {
    submitButton.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'flex';
  } else {
    submitButton.disabled = false;
    btnText.style.display = 'inline';
    btnLoading.style.display = 'none';
  }
}

/**
 * Handle submission error
 * @param {Error} error - Submission error
 */
function handleSubmissionError(error) {
  let errorMessage = 'Error al agendar la cita. Intente nuevamente.';
  
  if (error.status === 409) {
    errorMessage = 'El horario seleccionado ya no está disponible. Seleccione otro horario.';
    // Reload time slots
    const selectedDate = $('#appointment-date').value;
    if (selectedDate) {
      loadAvailableTimeSlots(selectedDoctor.id, selectedDate);
    }
  } else if (error.status === 400) {
    errorMessage = error.message || 'Datos de la cita inválidos.';
  } else if (error.isNetworkError) {
    errorMessage = 'Error de conexión. Verifique su conexión a internet.';
  }
  
  showToast(errorMessage, 'error');
}

// ================================================================
// UTILITY FUNCTIONS
// ================================================================

/**
 * Format date for display
 * @param {string} dateStr - Date string
 * @returns {string} Formatted date
 */
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Show field error
 * @param {string} fieldName - Field name
 * @param {string} message - Error message
 */
function showFieldError(fieldName, message) {
  const field = $(`[name="${fieldName}"]`);
  const errorElement = $(`#${fieldName}-error`);
  
  if (field) {
    field.classList.add('error');
  }
  
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
}

/**
 * Clear field error
 * @param {string} fieldName - Field name
 */
function clearFieldError(fieldName) {
  const field = $(`[name="${fieldName}"]`);
  const errorElement = $(`#${fieldName}-error`);
  
  if (field) {
    field.classList.remove('error');
  }
  
  if (errorElement) {
    errorElement.textContent = '';
    errorElement.style.display = 'none';
  }
}

// ================================================================
// MODAL HANDLING
// ================================================================

/**
 * Close modal
 * @param {string} modalId - Modal ID
 */
function closeModal(modalId) {
  const modal = $(`#${modalId}`);
  if (modal) {
    modal.style.display = 'none';
  }
}

// Close modal when clicking overlay
document.addEventListener('click', function(event) {
  if (event.target.classList.contains('modal-overlay')) {
    const modal = event.target.closest('.modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }
});

// ================================================================
// AUTO-RESTORE PENDING APPOINTMENT
// ================================================================

/**
 * Check for pending appointment data
 */
function checkPendingAppointment() {
  const pendingAppointment = getStorageItem('pendingAppointment');
  
  if (pendingAppointment && authService.isAuthenticated()) {
    // Restore form data
    restoreFormData(pendingAppointment);
    removeStorageItem('pendingAppointment');
    
    showToast('Datos de cita restaurados', 'info');
  }
}

/**
 * Restore form data
 * @param {Object} data - Form data to restore
 */
function restoreFormData(data) {
  Object.keys(data).forEach(key => {
    const field = $(`[name="${key}"]`);
    if (field && data[key]) {
      field.value = data[key];
    }
  });
}

// Check for pending appointment on page load
document.addEventListener('DOMContentLoaded', checkPendingAppointment);

// ================================================================
// EXPORT FOR ES6 MODULES
// ================================================================

// If using ES6 modules, uncomment the following:
/*
export {
  initializeAppointmentPage,
  loadDoctorInfo,
  handleAppointmentSubmission,
  validateAppointmentForm
};
*/