/* ================================================================
   Med Search Platform - Utilities JavaScript
   Common utility functions and helpers
   ================================================================ */

// ================================================================
// DOM UTILITIES
// ================================================================

/**
 * Safely select a DOM element
 * @param {string} selector - CSS selector
 * @param {Element} parent - Parent element (optional)
 * @returns {Element|null}
 */
function $(selector, parent = document) {
  return parent.querySelector(selector);
}

/**
 * Select multiple DOM elements
 * @param {string} selector - CSS selector
 * @param {Element} parent - Parent element (optional)
 * @returns {NodeList}
 */
function $$(selector, parent = document) {
  return parent.querySelectorAll(selector);
}

/**
 * Create a DOM element with attributes and content
 * @param {string} tag - HTML tag name
 * @param {Object} attributes - Element attributes
 * @param {string|Element|Array} content - Element content
 * @returns {Element}
 */
function createElement(tag, attributes = {}, content = '') {
  const element = document.createElement(tag);
  
  // Set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        element.dataset[dataKey] = dataValue;
      });
    } else if (key.startsWith('on') && typeof value === 'function') {
      element.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      element.setAttribute(key, value);
    }
  });
  
  // Set content
  if (typeof content === 'string') {
    element.textContent = content;
  } else if (content instanceof Element) {
    element.appendChild(content);
  } else if (Array.isArray(content)) {
    content.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof Element) {
        element.appendChild(child);
      }
    });
  }
  
  return element;
}

/**
 * Add event listener with automatic cleanup
 * @param {Element} element - Target element
 * @param {string} event - Event type
 * @param {Function} handler - Event handler
 * @param {Object} options - Event options
 * @returns {Function} Cleanup function
 */
function addEventListenerWithCleanup(element, event, handler, options = {}) {
  element.addEventListener(event, handler, options);
  return () => element.removeEventListener(event, handler, options);
}

/**
 * Toggle class on element
 * @param {Element} element - Target element
 * @param {string} className - Class name to toggle
 * @param {boolean} force - Force add/remove
 */
function toggleClass(element, className, force) {
  if (element) {
    element.classList.toggle(className, force);
  }
}

/**
 * Add multiple classes to element
 * @param {Element} element - Target element
 * @param {...string} classNames - Class names to add
 */
function addClass(element, ...classNames) {
  if (element) {
    element.classList.add(...classNames);
  }
}

/**
 * Remove multiple classes from element
 * @param {Element} element - Target element
 * @param {...string} classNames - Class names to remove
 */
function removeClass(element, ...classNames) {
  if (element) {
    element.classList.remove(...classNames);
  }
}

// ================================================================
// STRING UTILITIES
// ================================================================

/**
 * Capitalize first letter of string
 * @param {string} str - Input string
 * @returns {string}
 */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert string to kebab-case
 * @param {string} str - Input string
 * @returns {string}
 */
function kebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Truncate string with ellipsis
 * @param {string} str - Input string
 * @param {number} length - Maximum length
 * @returns {string}
 */
function truncate(str, length = 100) {
  if (!str || str.length <= length) return str;
  return str.slice(0, length).trim() + '...';
}

/**
 * Remove accents from string
 * @param {string} str - Input string
 * @returns {string}
 */
function removeAccents(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Generate random ID
 * @param {number} length - ID length
 * @returns {string}
 */
function generateId(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ================================================================
// VALIDATION UTILITIES
// ================================================================

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Mexican format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean}
 */
function isValidPhone(phone) {
  const phoneRegex = /^(\+52\s?)?(\d{2}\s?\d{4}\s?\d{4}|\d{10})$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result
 */
function validatePassword(password) {
  const result = {
    isValid: false,
    strength: 'weak',
    score: 0,
    requirements: {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
  };
  
  // Calculate score
  Object.values(result.requirements).forEach(met => {
    if (met) result.score++;
  });
  
  // Determine strength
  if (result.score >= 4) result.strength = 'strong';
  else if (result.score >= 3) result.strength = 'medium';
  else result.strength = 'weak';
  
  // Check if valid (at least length, uppercase, and number)
  result.isValid = result.requirements.length && 
                  result.requirements.uppercase && 
                  result.requirements.number;
  
  return result;
}

/**
 * Sanitize input string
 * @param {string} input - Input to sanitize
 * @returns {string}
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .slice(0, 1000); // Limit length
}

// ================================================================
// FORMATTING UTILITIES
// ================================================================

/**
 * Format currency in Mexican pesos
 * @param {number} amount - Amount to format
 * @returns {string}
 */
function formatCurrency(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return '$0';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format date in Spanish
 * @param {Date|string} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string}
 */
function formatDate(date, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  const finalOptions = { ...defaultOptions, ...options };
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    return new Intl.DateTimeFormat('es-MX', finalOptions).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Fecha inválida';
  }
}

/**
 * Format relative time (time ago)
 * @param {Date|string} date - Date to format
 * @returns {string}
 */
function formatTimeAgo(date) {
  try {
    const now = new Date();
    const past = date instanceof Date ? date : new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);
    
    if (diffInSeconds < 60) return 'hace unos segundos';
    if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 2592000) return `hace ${Math.floor(diffInSeconds / 86400)} días`;
    if (diffInSeconds < 31536000) return `hace ${Math.floor(diffInSeconds / 2592000)} meses`;
    return `hace ${Math.floor(diffInSeconds / 31536000)} años`;
  } catch (error) {
    console.error('Error formatting time ago:', error);
    return 'hace un tiempo';
  }
}

/**
 * Format phone number for display
 * @param {string} phone - Phone number to format
 * @returns {string}
 */
function formatPhone(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)} ${cleaned.slice(6)}`;
  } else if (cleaned.length === 12 && cleaned.startsWith('52')) {
    return `+52 ${cleaned.slice(2, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8)}`;
  }
  
  return phone;
}

// ================================================================
// PERFORMANCE UTILITIES
// ================================================================

/**
 * Debounce function execution
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Execute immediately
 * @returns {Function}
 */
function debounce(func, wait, immediate = false) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
}

/**
 * Throttle function execution
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function}
 */
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Lazy load images when they enter viewport
 * @param {string} selector - Image selector
 * @param {Object} options - Intersection observer options
 */
function lazyLoadImages(selector = 'img[data-src]', options = {}) {
  if (!('IntersectionObserver' in window)) {
    // Fallback for older browsers
    $$(selector).forEach(img => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
        delete img.dataset.src;
      }
    });
    return;
  }
  
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          delete img.dataset.src;
          addClass(img, 'loaded');
        }
        observer.unobserve(img);
      }
    });
  }, { ...defaultOptions, ...options });
  
  $$(selector).forEach(img => observer.observe(img));
}

// ================================================================
// LOCAL STORAGE UTILITIES
// ================================================================

/**
 * Safe localStorage getItem with fallback
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if not found
 * @returns {*}
 */
function getStorageItem(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Safe localStorage setItem
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @returns {boolean} Success status
 */
function setStorageItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Remove item from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} Success status
 */
function removeStorageItem(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
    return false;
  }
}

// ================================================================
// URL UTILITIES
// ================================================================

/**
 * Get URL parameter value
 * @param {string} param - Parameter name
 * @returns {string|null}
 */
function getUrlParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

/**
 * Set URL parameter without page reload
 * @param {string} param - Parameter name
 * @param {string} value - Parameter value
 */
function setUrlParam(param, value) {
  const url = new URL(window.location);
  if (value) {
    url.searchParams.set(param, value);
  } else {
    url.searchParams.delete(param);
  }
  window.history.replaceState({}, '', url);
}

/**
 * Build query string from object
 * @param {Object} params - Parameters object
 * @returns {string}
 */
function buildQueryString(params) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, value);
    }
  });
  return searchParams.toString();
}

// ================================================================
// LOADING & UI UTILITIES
// ================================================================

/**
 * Show loading overlay
 * @param {string} message - Loading message
 */
function showLoading(message = 'Cargando...') {
  let overlay = $('#loading-overlay');
  if (!overlay) {
    overlay = createElement('div', {
      id: 'loading-overlay',
      className: 'loading-overlay'
    }, [
      createElement('div', { className: 'loading-spinner' }, [
        createElement('div', { className: 'spinner' }),
        createElement('p', { className: 'loading-text' }, message)
      ])
    ]);
    document.body.appendChild(overlay);
  } else {
    const loadingText = overlay.querySelector('.loading-text');
    if (loadingText) loadingText.textContent = message;
  }
  overlay.style.display = 'flex';
}

/**
 * Hide loading overlay
 */
function hideLoading() {
  const overlay = $('#loading-overlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

/**
 * Show toast notification
 * @param {string} message - Toast message
 * @param {string} type - Toast type (success, error, warning, info)
 * @param {number} duration - Duration in milliseconds
 */
function showToast(message, type = 'info', duration = 5000) {
  const toastId = `toast-${generateId()}`;
  const toast = createElement('div', {
    id: toastId,
    className: `toast toast-${type}`
  }, [
    createElement('div', { className: 'toast-content' }, [
      createElement('svg', {
        className: 'toast-icon',
        width: '20',
        height: '20',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor'
      }),
      createElement('span', { className: 'toast-message' }, message)
    ]),
    createElement('button', {
      className: 'toast-close',
      'aria-label': 'Cerrar',
      onclick: () => removeToast(toastId)
    })
  ]);
  
  document.body.appendChild(toast);
  
  // Auto remove after duration
  setTimeout(() => removeToast(toastId), duration);
  
  return toastId;
}

/**
 * Remove toast notification
 * @param {string} toastId - Toast element ID
 */
function removeToast(toastId) {
  const toast = $(`#${toastId}`);
  if (toast) {
    addClass(toast, 'fade-out');
    setTimeout(() => toast.remove(), 300);
  }
}

// ================================================================
// FORM UTILITIES
// ================================================================

/**
 * Get form data as object
 * @param {HTMLFormElement} form - Form element
 * @returns {Object}
 */
function getFormData(form) {
  const formData = new FormData(form);
  const data = {};
  
  for (const [key, value] of formData.entries()) {
    if (data[key]) {
      // Convert to array if multiple values
      if (Array.isArray(data[key])) {
        data[key].push(value);
      } else {
        data[key] = [data[key], value];
      }
    } else {
      data[key] = value;
    }
  }
  
  return data;
}

/**
 * Reset form and clear errors
 * @param {HTMLFormElement} form - Form element
 */
function resetForm(form) {
  form.reset();
  // Clear error messages
  $$('.form-error', form).forEach(error => {
    error.textContent = '';
  });
  // Remove error classes
  $$('.form-input.error', form).forEach(input => {
    removeClass(input, 'error');
  });
}

/**
 * Show form field error
 * @param {string} fieldName - Field name
 * @param {string} message - Error message
 * @param {HTMLFormElement} form - Form element
 */
function showFieldError(fieldName, message, form = document) {
  const field = $(`[name="${fieldName}"]`, form);
  const errorElement = $(`#${fieldName}-error`, form);
  
  if (field) {
    addClass(field, 'error');
  }
  
  if (errorElement) {
    errorElement.textContent = message;
  }
}

/**
 * Clear form field error
 * @param {string} fieldName - Field name
 * @param {HTMLFormElement} form - Form element
 */
function clearFieldError(fieldName, form = document) {
  const field = $(`[name="${fieldName}"]`, form);
  const errorElement = $(`#${fieldName}-error`, form);
  
  if (field) {
    removeClass(field, 'error');
  }
  
  if (errorElement) {
    errorElement.textContent = '';
  }
}

// ================================================================
// EXPORT FOR ES6 MODULES (if needed)
// ================================================================

// If using ES6 modules, uncomment the following:
/*
export {
  $, $$, createElement, addEventListenerWithCleanup,
  toggleClass, addClass, removeClass,
  capitalize, kebabCase, truncate, removeAccents, generateId,
  isValidEmail, isValidPhone, validatePassword, sanitizeInput,
  formatCurrency, formatDate, formatTimeAgo, formatPhone,
  debounce, throttle, lazyLoadImages,
  getStorageItem, setStorageItem, removeStorageItem,
  getUrlParam, setUrlParam, buildQueryString,
  showLoading, hideLoading, showToast, removeToast,
  getFormData, resetForm, showFieldError, clearFieldError
};
*/