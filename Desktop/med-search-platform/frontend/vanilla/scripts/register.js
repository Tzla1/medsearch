/* ================================================================
   Med Search Platform - Register Page JavaScript
   User registration functionality
   ================================================================ */

// ================================================================
// GLOBAL VARIABLES
// ================================================================

let currentStep = 1;
let totalSteps = 3;
let registrationData = {};
let isRegistering = false;
let userType = 'patient'; // 'patient' or 'doctor'

// ================================================================
// PAGE INITIALIZATION
// ================================================================

document.addEventListener('DOMContentLoaded', function() {
  initializeRegisterPage();
});

/**
 * Initialize register page functionality
 */
function initializeRegisterPage() {
  try {
    // Check if user is already authenticated
    if (authService.isAuthenticated()) {
      window.location.href = 'index.html';
      return;
    }
    
    // Initialize components
    initializeUserTypeSelector();
    initializeStepNavigation();
    initializeFormValidation();
    initializePasswordStrength();
    initializeFinalStep();
    
    // Set initial step
    showStep(1);
    updateProgressBar();
    
    console.log('Register page initialized successfully');
  } catch (error) {
    console.error('Error initializing register page:', error);
    showToast('Error al cargar la página', 'error');
  }
}

// ================================================================
// USER TYPE SELECTION
// ================================================================

/**
 * Initialize user type selector
 */
function initializeUserTypeSelector() {
  const userTypeCards = $$('.user-type-card');
  
  userTypeCards.forEach(card => {
    card.addEventListener('click', function() {
      selectUserType(this.dataset.type);
    });
  });
  
  // Set default selection
  selectUserType('patient');
}

/**
 * Select user type
 * @param {string} type - User type ('patient' or 'doctor')
 */
function selectUserType(type) {
  userType = type;
  registrationData.userType = type;
  
  // Update UI
  $$('.user-type-card').forEach(card => {
    card.classList.remove('selected');
  });
  
  const selectedCard = $(`.user-type-card[data-type="${type}"]`);
  if (selectedCard) {
    selectedCard.classList.add('selected');
  }
  
  // Enable next button
  const nextButton = $('.btn-next');
  if (nextButton) {
    nextButton.disabled = false;
  }
  
  // Update total steps based on user type
  totalSteps = type === 'doctor' ? 4 : 3;
  updateProgressBar();
}

// ================================================================
// STEP NAVIGATION
// ================================================================

/**
 * Initialize step navigation
 */
function initializeStepNavigation() {
  const nextButton = $('.btn-next');
  const prevButton = $('.btn-prev');
  const submitButton = $('.btn-submit');
  
  if (nextButton) {
    nextButton.addEventListener('click', handleNextStep);
  }
  
  if (prevButton) {
    prevButton.addEventListener('click', handlePrevStep);
  }
  
  if (submitButton) {
    submitButton.addEventListener('click', handleSubmit);
  }
}

/**
 * Handle next step
 */
async function handleNextStep() {
  // Validate current step
  if (!await validateCurrentStep()) {
    return;
  }
  
  // Collect current step data
  collectStepData();
  
  // Move to next step
  if (currentStep < totalSteps) {
    currentStep++;
    showStep(currentStep);
    updateProgressBar();
    updateNavigationButtons();
  }
}

/**
 * Handle previous step
 */
function handlePrevStep() {
  if (currentStep > 1) {
    currentStep--;
    showStep(currentStep);
    updateProgressBar();
    updateNavigationButtons();
  }
}

/**
 * Show specific step
 * @param {number} step - Step number
 */
function showStep(step) {
  // Hide all steps
  $$('.form-step').forEach(stepEl => {
    stepEl.classList.remove('active');
  });
  
  // Show current step
  const currentStepEl = $(`.form-step[data-step="${step}"]`);
  if (currentStepEl) {
    currentStepEl.classList.add('active');
    
    // Focus first input in step
    const firstInput = currentStepEl.querySelector('input, select');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
  }
  
  updateNavigationButtons();
}

/**
 * Update progress bar
 */
function updateProgressBar() {
  const progressBar = $('.progress-bar');
  const progressText = $('.progress-text');
  
  if (progressBar) {
    const progress = (currentStep / totalSteps) * 100;
    progressBar.style.width = `${progress}%`;
  }
  
  if (progressText) {
    progressText.textContent = `Paso ${currentStep} de ${totalSteps}`;
  }
  
  // Update step indicators
  $$('.step-indicator').forEach((indicator, index) => {
    const stepNumber = index + 1;
    indicator.classList.remove('active', 'completed');
    
    if (stepNumber < currentStep) {
      indicator.classList.add('completed');
    } else if (stepNumber === currentStep) {
      indicator.classList.add('active');
    }
  });
}

/**
 * Update navigation buttons
 */
function updateNavigationButtons() {
  const nextButton = $('.btn-next');
  const prevButton = $('.btn-prev');
  const submitButton = $('.btn-submit');
  
  if (prevButton) {
    prevButton.style.display = currentStep > 1 ? 'inline-flex' : 'none';
  }
  
  if (nextButton) {
    nextButton.style.display = currentStep < totalSteps ? 'inline-flex' : 'none';
  }
  
  if (submitButton) {
    submitButton.style.display = currentStep === totalSteps ? 'inline-flex' : 'none';
  }
}

// ================================================================
// FORM VALIDATION
// ================================================================

/**
 * Initialize form validation
 */
function initializeFormValidation() {
  // Real-time validation for all inputs
  $$('input, select').forEach(input => {
    input.addEventListener('blur', function() {
      validateField(this);
    });
    
    input.addEventListener('input', function() {
      clearFieldError(this.name);
    });
  });
  
  // Email availability check
  const emailInput = $('#email');
  if (emailInput) {
    const debouncedEmailCheck = debounce(checkEmailAvailability, 1000);
    emailInput.addEventListener('input', debouncedEmailCheck);
  }
  
  // Phone formatting
  const phoneInput = $('#phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', formatPhoneInput);
  }
}

/**
 * Validate current step
 * @returns {boolean} Is step valid
 */
async function validateCurrentStep() {
  const currentStepEl = $(`.form-step[data-step="${currentStep}"]`);
  if (!currentStepEl) return true;
  
  const inputs = currentStepEl.querySelectorAll('input, select');
  let isValid = true;
  
  for (const input of inputs) {
    if (!validateField(input)) {
      isValid = false;
    }
  }
  
  // Additional step-specific validation
  if (currentStep === 2) {
    isValid = await validateStep2() && isValid;
  } else if (currentStep === 3 && userType === 'doctor') {
    isValid = validateStep3Doctor() && isValid;
  }
  
  return isValid;
}

/**
 * Validate individual field
 * @param {Element} field - Form field
 * @returns {boolean} Is field valid
 */
function validateField(field) {
  const value = field.value.trim();
  const fieldName = field.name;
  let isValid = true;
  
  // Clear previous errors
  clearFieldError(fieldName);
  
  // Required field validation
  if (field.hasAttribute('required') && !value) {
    showFieldError(fieldName, 'Este campo es requerido');
    return false;
  }
  
  // Specific field validation
  switch (fieldName) {
    case 'email':
      if (value && !isValidEmail(value)) {
        showFieldError(fieldName, 'Ingresa un email válido');
        isValid = false;
      }
      break;
      
    case 'password':
      if (value) {
        const validation = validatePassword(value);
        if (!validation.isValid) {
          showFieldError(fieldName, 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número');
          isValid = false;
        }
      }
      break;
      
    case 'confirmPassword':
      const passwordField = $('#password');
      if (value && passwordField && value !== passwordField.value) {
        showFieldError(fieldName, 'Las contraseñas no coinciden');
        isValid = false;
      }
      break;
      
    case 'phone':
      if (value && !isValidPhone(value)) {
        showFieldError(fieldName, 'Ingresa un número de teléfono válido');
        isValid = false;
      }
      break;
      
    case 'firstName':
    case 'lastName':
      if (value && value.length < 2) {
        showFieldError(fieldName, 'Debe tener al menos 2 caracteres');
        isValid = false;
      }
      break;
  }
  
  return isValid;
}

/**
 * Validate step 2 (personal information)
 * @returns {boolean} Is step valid
 */
async function validateStep2() {
  let isValid = true;
  
  // Additional validation for step 2
  const birthDate = $('#birthDate');
  if (birthDate && birthDate.value) {
    const age = calculateAge(new Date(birthDate.value));
    if (age < 13) {
      showFieldError('birthDate', 'Debes tener al menos 13 años');
      isValid = false;
    } else if (age > 120) {
      showFieldError('birthDate', 'Ingresa una fecha válida');
      isValid = false;
    }
  }
  
  return isValid;
}

/**
 * Validate step 3 for doctors (professional information)
 * @returns {boolean} Is step valid
 */
function validateStep3Doctor() {
  let isValid = true;
  
  const licenseNumber = $('#licenseNumber');
  if (licenseNumber && licenseNumber.value) {
    // Basic license number validation (simplified)
    if (licenseNumber.value.length < 6) {
      showFieldError('licenseNumber', 'Número de cédula debe tener al menos 6 caracteres');
      isValid = false;
    }
  }
  
  return isValid;
}

/**
 * Check email availability
 */
async function checkEmailAvailability() {
  const emailInput = $('#email');
  if (!emailInput || !emailInput.value) return;
  
  const email = emailInput.value.trim();
  if (!isValidEmail(email)) return;
  
  try {
    // For demo purposes, simulate email check
    // In real implementation, this would call API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulate some emails as taken
    const takenEmails = ['test@example.com', 'admin@example.com'];
    if (takenEmails.includes(email)) {
      showFieldError('email', 'Este email ya está registrado');
    }
    
  } catch (error) {
    console.error('Email availability check error:', error);
  }
}

/**
 * Format phone input
 */
function formatPhoneInput() {
  const phoneInput = $('#phone');
  if (!phoneInput) return;
  
  let value = phoneInput.value.replace(/\D/g, '');
  
  // Format as Mexican phone number
  if (value.length >= 10) {
    value = value.slice(0, 10);
    value = `${value.slice(0, 2)} ${value.slice(2, 6)} ${value.slice(6)}`;
  } else if (value.length >= 6) {
    value = `${value.slice(0, 2)} ${value.slice(2, 6)} ${value.slice(6)}`;
  } else if (value.length >= 2) {
    value = `${value.slice(0, 2)} ${value.slice(2)}`;
  }
  
  phoneInput.value = value;
}

/**
 * Calculate age from birth date
 * @param {Date} birthDate - Birth date
 * @returns {number} Age in years
 */
function calculateAge(birthDate) {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// ================================================================
// PASSWORD STRENGTH
// ================================================================

/**
 * Initialize password strength indicator
 */
function initializePasswordStrength() {
  const passwordInput = $('#password');
  if (!passwordInput) return;
  
  passwordInput.addEventListener('input', function() {
    updatePasswordStrength(this.value);
  });
}

/**
 * Update password strength indicator
 * @param {string} password - Password value
 */
function updatePasswordStrength(password) {
  const strengthIndicator = $('.password-strength');
  const strengthText = $('.strength-text');
  const requirements = $('.password-requirements');
  
  if (!strengthIndicator) return;
  
  const validation = validatePassword(password);
  
  // Update strength bar
  strengthIndicator.className = `password-strength strength-${validation.strength}`;
  
  // Update strength text
  if (strengthText) {
    const strengthLabels = {
      weak: 'Débil',
      medium: 'Media',
      strong: 'Fuerte'
    };
    strengthText.textContent = password ? strengthLabels[validation.strength] : '';
  }
  
  // Update requirements checklist
  if (requirements) {
    const requirementsList = requirements.querySelectorAll('.requirement-item');
    
    requirementsList.forEach(item => {
      const requirement = item.dataset.requirement;
      const isMet = validation.requirements[requirement];
      
      item.classList.toggle('met', isMet);
      
      const icon = item.querySelector('.requirement-icon');
      if (icon) {
        icon.textContent = isMet ? '✓' : '○';
      }
    });
  }
}

// ================================================================
// DATA COLLECTION
// ================================================================

/**
 * Collect data from current step
 */
function collectStepData() {
  const currentStepEl = $(`.form-step[data-step="${currentStep}"]`);
  if (!currentStepEl) return;
  
  const formData = getFormData(currentStepEl);
  Object.assign(registrationData, formData);
}

/**
 * Collect all registration data
 */
function collectAllData() {
  $$('.form-step').forEach(step => {
    const stepData = getFormData(step);
    Object.assign(registrationData, stepData);
  });
  
  // Clean up data
  delete registrationData.confirmPassword;
  
  return registrationData;
}

// ================================================================
// FINAL STEP
// ================================================================

/**
 * Initialize final step
 */
function initializeFinalStep() {
  // Terms and conditions checkbox
  const termsCheckbox = $('#terms');
  if (termsCheckbox) {
    termsCheckbox.addEventListener('change', function() {
      const submitButton = $('.btn-submit');
      if (submitButton) {
        submitButton.disabled = !this.checked;
      }
    });
  }
}

/**
 * Handle form submission
 */
async function handleSubmit() {
  if (isRegistering) return;
  
  // Final validation
  if (!await validateCurrentStep()) {
    return;
  }
  
  // Check terms acceptance
  const termsCheckbox = $('#terms');
  if (termsCheckbox && !termsCheckbox.checked) {
    showToast('Debes aceptar los términos y condiciones', 'warning');
    return;
  }
  
  try {
    isRegistering = true;
    updateSubmitButton(true);
    
    // Collect all data
    const finalData = collectAllData();
    
    // Submit registration
    const response = await authService.register(finalData);
    
    // Show success message
    showRegistrationSuccess();
    
  } catch (error) {
    console.error('Registration error:', error);
    handleRegistrationError(error);
  } finally {
    isRegistering = false;
    updateSubmitButton(false);
  }
}

/**
 * Update submit button state
 * @param {boolean} loading - Is loading
 */
function updateSubmitButton(loading) {
  const submitButton = $('.btn-submit');
  if (!submitButton) return;
  
  if (loading) {
    submitButton.disabled = true;
    submitButton.innerHTML = `
      <div class="btn-loading">
        <div class="spinner"></div>
      </div>
      <span class="btn-text">Creando cuenta...</span>
    `;
  } else {
    const termsCheckbox = $('#terms');
    submitButton.disabled = !termsCheckbox?.checked;
    submitButton.innerHTML = 'Crear Cuenta';
  }
}

/**
 * Handle registration errors
 * @param {Error} error - Registration error
 */
function handleRegistrationError(error) {
  let errorMessage = 'Error al crear la cuenta. Intenta nuevamente.';
  
  if (error.status === 409) {
    errorMessage = 'Ya existe una cuenta con este email.';
  } else if (error.status === 400) {
    errorMessage = 'Datos inválidos. Verifica la información ingresada.';
  } else if (error.isNetworkError) {
    errorMessage = 'Sin conexión a internet. Verifica tu conexión.';
  }
  
  showToast(errorMessage, 'error');
}

/**
 * Show registration success
 */
function showRegistrationSuccess() {
  const successContent = createElement('div', { className: 'success-content' }, [
    createElement('div', { className: 'success-icon' }, '🎉'),
    createElement('h3', {}, '¡Cuenta creada exitosamente!'),
    createElement('p', {}, 
      userType === 'doctor' 
        ? 'Tu cuenta ha sido creada y está pendiente de verificación. Te contactaremos pronto.'
        : 'Tu cuenta ha sido creada. Ya puedes comenzar a buscar doctores.'
    ),
    createElement('div', { className: 'success-actions' }, [
      createElement('button', {
        className: 'btn btn-primary',
        onclick: () => {
          closeModal('success-modal');
          window.location.href = 'login.html';
        }
      }, 'Iniciar Sesión'),
      createElement('button', {
        className: 'btn btn-outline',
        onclick: () => {
          closeModal('success-modal');
          window.location.href = 'index.html';
        }
      }, 'Explorar')
    ])
  ]);
  
  const modal = createModal(
    'success-modal',
    'Registro Exitoso',
    successContent
  );
  
  document.body.appendChild(modal);
  openModal('success-modal');
}

// ================================================================
// DEMO MODE
// ================================================================

/**
 * Initialize demo mode functionality
 */
function initializeDemoMode() {
  // Only show in development
  if (window.location.hostname !== 'localhost') return;
  
  const demoButton = createElement('button', {
    className: 'btn btn-outline btn-small demo-fill',
    onclick: fillDemoData,
    style: 'position: fixed; top: 10px; right: 10px; z-index: 9999;'
  }, 'Fill Demo Data');
  
  document.body.appendChild(demoButton);
}

/**
 * Fill demo data for testing
 */
function fillDemoData() {
  const demoData = {
    patient: {
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan.perez@demo.com',
      password: 'Demo123!',
      confirmPassword: 'Demo123!',
      phone: '55 1234 5678',
      birthDate: '1990-05-15',
      gender: 'male'
    },
    doctor: {
      firstName: 'Dra. María',
      lastName: 'González',
      email: 'maria.gonzalez@demo.com',
      password: 'Demo123!',
      confirmPassword: 'Demo123!',
      phone: '55 9876 5432',
      birthDate: '1985-03-20',
      gender: 'female',
      specialty: '1',
      licenseNumber: 'MED123456',
      experience: '8'
    }
  };
  
  const data = demoData[userType];
  
  Object.entries(data).forEach(([key, value]) => {
    const field = $(`[name="${key}"]`);
    if (field) {
      field.value = value;
      field.dispatchEvent(new Event('input'));
    }
  });
  
  // Check terms
  const termsCheckbox = $('#terms');
  if (termsCheckbox) {
    termsCheckbox.checked = true;
    termsCheckbox.dispatchEvent(new Event('change'));
  }
}

// Initialize demo mode on page load
document.addEventListener('DOMContentLoaded', initializeDemoMode);

// ================================================================
// ACCESSIBILITY
// ================================================================

/**
 * Initialize accessibility features
 */
function initializeAccessibility() {
  // Announce step changes to screen readers
  const stepObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && 
          mutation.attributeName === 'class' &&
          mutation.target.classList.contains('form-step')) {
        
        if (mutation.target.classList.contains('active')) {
          const stepTitle = mutation.target.querySelector('h2');
          if (stepTitle) {
            stepTitle.setAttribute('aria-live', 'polite');
            stepTitle.focus();
          }
        }
      }
    });
  });
  
  $$('.form-step').forEach(step => {
    stepObserver.observe(step, { attributes: true });
  });
}

// Initialize accessibility
document.addEventListener('DOMContentLoaded', initializeAccessibility);

// ================================================================
// EXPORT FOR ES6 MODULES
// ================================================================

// If using ES6 modules, uncomment the following:
/*
export {
  initializeRegisterPage,
  handleNextStep,
  handlePrevStep,
  handleSubmit,
  validateCurrentStep
};
*/