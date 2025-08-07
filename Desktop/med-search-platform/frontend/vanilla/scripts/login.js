/* ================================================================
   Med Search Platform - Login Page JavaScript
   Authentication and login functionality
   ================================================================ */

// ================================================================
// GLOBAL VARIABLES
// ================================================================

let isLoggingIn = false;
let passwordVisible = false;

// ================================================================
// PAGE INITIALIZATION
// ================================================================

document.addEventListener('DOMContentLoaded', function() {
  initializeLoginPage();
});

/**
 * Initialize login page functionality
 */
function initializeLoginPage() {
  try {
    // Check if user is already authenticated
    if (authService.isAuthenticated()) {
      redirectToIntendedPage();
      return;
    }
    
    // Initialize components
    initializeLoginForm();
    initializePasswordToggle();
    initializeSocialLogin();
    initializeForgotPassword();
    initializeFormValidation();
    
    console.log('Login page initialized successfully');
  } catch (error) {
    console.error('Error initializing login page:', error);
    showToast('Error al cargar la página', 'error');
  }
}

// ================================================================
// LOGIN FORM FUNCTIONALITY
// ================================================================

/**
 * Initialize login form
 */
function initializeLoginForm() {
  const loginForm = $('#login-form');
  if (!loginForm) return;
  
  loginForm.addEventListener('submit', handleLogin);
  
  // Add input event listeners for real-time validation
  const emailInput = $('#email');
  const passwordInput = $('#password');
  
  if (emailInput) {
    emailInput.addEventListener('blur', () => validateEmail(emailInput.value));
    emailInput.addEventListener('input', () => clearFieldError('email'));
  }
  
  if (passwordInput) {
    passwordInput.addEventListener('input', () => clearFieldError('password'));
  }
}

/**
 * Handle login form submission
 * @param {Event} event - Form submit event
 */
async function handleLogin(event) {
  event.preventDefault();
  
  if (isLoggingIn) return;
  
  const formData = getFormData(event.target);
  const { email, password, rememberMe } = formData;
  
  // Validate inputs
  if (!validateLoginForm(email, password)) {
    return;
  }
  
  try {
    isLoggingIn = true;
    updateLoginButton(true);
    clearGlobalErrors();
    
    // Attempt login
    const response = await authService.login({
      email: email.trim(),
      password,
      rememberMe: !!rememberMe
    });
    
    // Handle successful login
    showToast('Inicio de sesión exitoso', 'success');
    
    // Small delay for better UX
    setTimeout(() => {
      redirectToIntendedPage();
    }, 1000);
    
  } catch (error) {
    console.error('Login error:', error);
    handleLoginError(error);
  } finally {
    isLoggingIn = false;
    updateLoginButton(false);
  }
}

/**
 * Validate login form
 * @param {string} email - Email address
 * @param {string} password - Password
 * @returns {boolean} Is form valid
 */
function validateLoginForm(email, password) {
  let isValid = true;
  
  // Clear previous errors
  clearFieldError('email');
  clearFieldError('password');
  
  // Validate email
  if (!email || !email.trim()) {
    showFieldError('email', 'El email es requerido');
    isValid = false;
  } else if (!isValidEmail(email)) {
    showFieldError('email', 'Ingresa un email válido');
    isValid = false;
  }
  
  // Validate password
  if (!password) {
    showFieldError('password', 'La contraseña es requerida');
    isValid = false;
  } else if (password.length < 6) {
    showFieldError('password', 'La contraseña debe tener al menos 6 caracteres');
    isValid = false;
  }
  
  return isValid;
}

/**
 * Validate email field
 * @param {string} email - Email to validate
 */
function validateEmail(email) {
  if (!email || !email.trim()) {
    showFieldError('email', 'El email es requerido');
    return false;
  }
  
  if (!isValidEmail(email)) {
    showFieldError('email', 'Ingresa un email válido');
    return false;
  }
  
  clearFieldError('email');
  return true;
}

/**
 * Update login button state
 * @param {boolean} loading - Is loading
 */
function updateLoginButton(loading) {
  const loginButton = $('.btn-login');
  if (!loginButton) return;
  
  if (loading) {
    loginButton.disabled = true;
    loginButton.innerHTML = `
      <div class="btn-loading">
        <div class="spinner"></div>
      </div>
      <span class="btn-text">Iniciando sesión...</span>
    `;
  } else {
    loginButton.disabled = false;
    loginButton.innerHTML = 'Iniciar Sesión';
  }
}

/**
 * Handle login errors
 * @param {Error} error - Login error
 */
function handleLoginError(error) {
  let errorMessage = 'Error al iniciar sesión. Intenta nuevamente.';
  
  if (error.status === 401) {
    errorMessage = 'Email o contraseña incorrectos.';
  } else if (error.status === 403) {
    errorMessage = 'Tu cuenta ha sido bloqueada. Contacta al soporte.';
  } else if (error.status === 429) {
    errorMessage = 'Demasiados intentos. Intenta nuevamente más tarde.';
  } else if (error.isNetworkError) {
    errorMessage = 'Sin conexión a internet. Verifica tu conexión.';
  }
  
  showGlobalError(errorMessage);
}

/**
 * Show global error message
 * @param {string} message - Error message
 */
function showGlobalError(message) {
  const errorContainer = $('.form-error-global');
  if (errorContainer) {
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
  } else {
    // Create error container if it doesn't exist
    const loginForm = $('#login-form');
    if (loginForm) {
      const errorDiv = createElement('div', {
        className: 'form-error-global'
      }, message);
      
      loginForm.appendChild(errorDiv);
    }
  }
}

/**
 * Clear global errors
 */
function clearGlobalErrors() {
  const errorContainer = $('.form-error-global');
  if (errorContainer) {
    errorContainer.style.display = 'none';
    errorContainer.textContent = '';
  }
}

// ================================================================
// PASSWORD VISIBILITY TOGGLE
// ================================================================

/**
 * Initialize password visibility toggle
 */
function initializePasswordToggle() {
  const passwordToggle = $('.password-toggle');
  if (!passwordToggle) return;
  
  passwordToggle.addEventListener('click', function() {
    togglePasswordVisibility();
  });
}

/**
 * Toggle password visibility
 */
function togglePasswordVisibility() {
  const passwordInput = $('#password');
  const passwordToggle = $('.password-toggle');
  
  if (!passwordInput || !passwordToggle) return;
  
  passwordVisible = !passwordVisible;
  
  // Update input type
  passwordInput.type = passwordVisible ? 'text' : 'password';
  
  // Update toggle icon
  passwordToggle.innerHTML = passwordVisible ? 
    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
       <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
       <line x1="1" y1="1" x2="23" y2="23"/>
     </svg>` :
    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
       <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
       <circle cx="12" cy="12" r="3"/>
     </svg>`;
  
  // Update aria-label
  passwordToggle.setAttribute('aria-label', 
    passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'
  );
}

// ================================================================
// SOCIAL LOGIN
// ================================================================

/**
 * Initialize social login buttons
 */
function initializeSocialLogin() {
  const googleBtn = $('.btn-google');
  const facebookBtn = $('.btn-facebook');
  
  if (googleBtn) {
    googleBtn.addEventListener('click', () => handleSocialLogin('google'));
  }
  
  if (facebookBtn) {
    facebookBtn.addEventListener('click', () => handleSocialLogin('facebook'));
  }
}

/**
 * Handle social login
 * @param {string} provider - Social provider ('google', 'facebook')
 */
async function handleSocialLogin(provider) {
  try {
    showToast(`Iniciando sesión con ${capitalize(provider)}...`, 'info');
    
    // For demo purposes, simulate social login
    // In real implementation, this would redirect to OAuth provider
    setTimeout(() => {
      showToast('Función de login social en desarrollo', 'info');
    }, 1000);
    
  } catch (error) {
    console.error(`${provider} login error:`, error);
    showToast(`Error al iniciar sesión con ${capitalize(provider)}`, 'error');
  }
}

// ================================================================
// FORGOT PASSWORD
// ================================================================

/**
 * Initialize forgot password functionality
 */
function initializeForgotPassword() {
  const forgotPasswordLink = $('.forgot-password-link');
  if (!forgotPasswordLink) return;
  
  forgotPasswordLink.addEventListener('click', function(event) {
    event.preventDefault();
    showForgotPasswordModal();
  });
}

/**
 * Show forgot password modal
 */
function showForgotPasswordModal() {
  const modalContent = createElement('div', { className: 'forgot-password-form' }, [
    createElement('p', {}, 'Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.'),
    createElement('form', { id: 'forgot-password-form' }, [
      createElement('div', { className: 'form-group' }, [
        createElement('label', { 
          className: 'form-label',
          htmlFor: 'forgot-email'
        }, 'Email'),
        createElement('input', {
          type: 'email',
          id: 'forgot-email',
          name: 'email',
          className: 'form-input',
          placeholder: 'tu@email.com',
          required: true,
          autocomplete: 'email'
        }),
        createElement('span', {
          id: 'forgot-email-error',
          className: 'form-error'
        })
      ])
    ])
  ]);
  
  const modal = createModal(
    'forgot-password-modal',
    'Recuperar Contraseña',
    modalContent,
    [
      createElement('button', {
        type: 'button',
        className: 'btn btn-outline',
        onclick: () => closeModal('forgot-password-modal')
      }, 'Cancelar'),
      createElement('button', {
        type: 'submit',
        form: 'forgot-password-form',
        className: 'btn btn-primary'
      }, 'Enviar enlace')
    ]
  );
  
  // Add form submission handler
  const forgotForm = modal.querySelector('#forgot-password-form');
  forgotForm.addEventListener('submit', handleForgotPassword);
  
  document.body.appendChild(modal);
  openModal('forgot-password-modal');
  
  // Focus email input
  setTimeout(() => {
    const emailInput = modal.querySelector('#forgot-email');
    if (emailInput) emailInput.focus();
  }, 100);
}

/**
 * Handle forgot password form submission
 * @param {Event} event - Form submit event
 */
async function handleForgotPassword(event) {
  event.preventDefault();
  
  const formData = getFormData(event.target);
  const { email } = formData;
  
  // Validate email
  if (!email || !isValidEmail(email)) {
    showFieldError('forgot-email', 'Ingresa un email válido', event.target);
    return;
  }
  
  try {
    const submitButton = event.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';
    
    // Call forgot password API
    await authService.forgotPassword(email);
    
    // Show success message
    closeModal('forgot-password-modal');
    showToast('Enlace de recuperación enviado a tu email', 'success');
    
  } catch (error) {
    console.error('Forgot password error:', error);
    
    let errorMessage = 'Error al enviar el enlace. Intenta nuevamente.';
    if (error.status === 404) {
      errorMessage = 'No existe una cuenta con este email.';
    }
    
    showFieldError('forgot-email', errorMessage, event.target);
  } finally {
    const submitButton = event.target.querySelector('button[type="submit"]');
    submitButton.disabled = false;
    submitButton.textContent = 'Enviar enlace';
  }
}

// ================================================================
// FORM VALIDATION
// ================================================================

/**
 * Initialize real-time form validation
 */
function initializeFormValidation() {
  const emailInput = $('#email');
  const passwordInput = $('#password');
  
  if (emailInput) {
    // Add input formatting
    emailInput.addEventListener('input', function() {
      this.value = this.value.toLowerCase().trim();
    });
  }
  
  if (passwordInput) {
    // Add password strength indicator (optional)
    passwordInput.addEventListener('input', function() {
      // Could add password strength visualization here
    });
  }
}

// ================================================================
// REDIRECT HANDLING
// ================================================================

/**
 * Redirect to intended page after login
 */
function redirectToIntendedPage() {
  // Check for redirect parameter
  const redirectUrl = getUrlParam('redirect');
  
  if (redirectUrl) {
    // Validate that redirect URL is from our domain for security
    try {
      const url = new URL(redirectUrl, window.location.origin);
      if (url.origin === window.location.origin) {
        window.location.href = redirectUrl;
        return;
      }
    } catch (error) {
      console.warn('Invalid redirect URL:', redirectUrl);
    }
  }
  
  // Default redirect to dashboard or home
  const user = authService.getCurrentUser();
  if (user && user.role === 'doctor') {
    window.location.href = 'doctor-dashboard.html';
  } else {
    window.location.href = 'index.html';
  }
}

// ================================================================
// DEMO MODE FUNCTIONALITY
// ================================================================

/**
 * Initialize demo login buttons (for development/demo)
 */
function initializeDemoMode() {
  // Only show in development environment
  if (window.location.hostname !== 'localhost') return;
  
  const loginForm = $('#login-form');
  if (!loginForm) return;
  
  const demoSection = createElement('div', { className: 'demo-section' }, [
    createElement('h4', {}, 'Demo Mode'),
    createElement('p', { className: 'text-small' }, 'Use these credentials for testing:'),
    createElement('div', { className: 'demo-buttons' }, [
      createElement('button', {
        type: 'button',
        className: 'btn btn-outline btn-small',
        onclick: () => fillDemoCredentials('patient')
      }, 'Demo Patient'),
      createElement('button', {
        type: 'button',
        className: 'btn btn-outline btn-small',
        onclick: () => fillDemoCredentials('doctor')
      }, 'Demo Doctor')
    ])
  ]);
  
  loginForm.appendChild(demoSection);
}

/**
 * Fill demo credentials
 * @param {string} type - User type ('patient', 'doctor')
 */
function fillDemoCredentials(type) {
  const emailInput = $('#email');
  const passwordInput = $('#password');
  
  if (!emailInput || !passwordInput) return;
  
  if (type === 'patient') {
    emailInput.value = 'patient@demo.com';
    passwordInput.value = 'demo123';
  } else if (type === 'doctor') {
    emailInput.value = 'doctor@demo.com';
    passwordInput.value = 'demo123';
  }
  
  // Clear any validation errors
  clearFieldError('email');
  clearFieldError('password');
}

// Initialize demo mode on page load
document.addEventListener('DOMContentLoaded', initializeDemoMode);

// ================================================================
// ACCESSIBILITY IMPROVEMENTS
// ================================================================

/**
 * Initialize accessibility features
 */
function initializeAccessibility() {
  // Add keyboard navigation for password toggle
  const passwordToggle = $('.password-toggle');
  if (passwordToggle) {
    passwordToggle.addEventListener('keydown', function(event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        togglePasswordVisibility();
      }
    });
  }
  
  // Announce form errors to screen readers
  const errorObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE && 
              node.classList.contains('form-error') && 
              node.textContent.trim()) {
            // Announce error to screen readers
            node.setAttribute('role', 'alert');
            node.setAttribute('aria-live', 'polite');
          }
        });
      }
    });
  });
  
  errorObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Initialize accessibility on page load
document.addEventListener('DOMContentLoaded', initializeAccessibility);

// ================================================================
// ERROR HANDLING
// ================================================================

/**
 * Handle global errors
 */
window.addEventListener('error', function(event) {
  console.error('Login page error:', event.error);
  
  // Don't show generic errors for network issues
  if (!event.error.message.includes('Failed to fetch')) {
    showToast('Ha ocurrido un error inesperado', 'error');
  }
});

/**
 * Handle form field errors specifically
 * @param {string} fieldName - Field name
 * @param {string} message - Error message
 * @param {Element} form - Form element
 */
function showFieldError(fieldName, message, form = document) {
  const field = form.querySelector(`[name="${fieldName}"]`);
  const errorElement = form.querySelector(`#${fieldName}-error`);
  
  if (field) {
    field.classList.add('error');
    field.setAttribute('aria-invalid', 'true');
  }
  
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.setAttribute('role', 'alert');
  }
}

/**
 * Clear field error
 * @param {string} fieldName - Field name
 * @param {Element} form - Form element
 */
function clearFieldError(fieldName, form = document) {
  const field = form.querySelector(`[name="${fieldName}"]`);
  const errorElement = form.querySelector(`#${fieldName}-error`);
  
  if (field) {
    field.classList.remove('error');
    field.removeAttribute('aria-invalid');
  }
  
  if (errorElement) {
    errorElement.textContent = '';
    errorElement.removeAttribute('role');
  }
}

// ================================================================
// EXPORT FOR ES6 MODULES
// ================================================================

// If using ES6 modules, uncomment the following:
/*
export {
  initializeLoginPage,
  handleLogin,
  validateLoginForm,
  redirectToIntendedPage
};
*/