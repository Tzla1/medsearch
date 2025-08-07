/* ================================================================
   Med Search Platform - Authentication Utilities
   Authentication helpers and guards
   ================================================================ */

// ================================================================
// AUTHENTICATION GUARDS
// ================================================================

/**
 * Initialize authentication guards for protected pages
 */
function initializeAuthGuards() {
  // Get current page
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  // Define protected pages
  const protectedPages = [
    'dashboard.html',
    'appointments.html',
    'favorites.html',
    'profile-edit.html',
    'doctor-dashboard.html'
  ];
  
  // Check if current page requires authentication
  if (protectedPages.includes(currentPage)) {
    requireAuthentication();
  }
  
  // Initialize auth-dependent UI elements
  initializeAuthUI();
}

/**
 * Require user authentication
 */
function requireAuthentication() {
  if (!authService.isAuthenticated()) {
    // Store intended page for redirect after login
    const currentUrl = window.location.href;
    const loginUrl = `login.html?redirect=${encodeURIComponent(currentUrl)}`;
    
    window.location.href = loginUrl;
    return;
  }
  
  // Check if user has required permissions for this page
  checkPagePermissions();
}

/**
 * Check page-specific permissions
 */
function checkPagePermissions() {
  const currentPage = window.location.pathname.split('/').pop();
  const user = authService.getCurrentUser();
  
  if (!user) return;
  
  // Doctor-only pages
  const doctorOnlyPages = ['doctor-dashboard.html'];
  if (doctorOnlyPages.includes(currentPage) && user.role !== 'doctor') {
    window.location.href = 'dashboard.html';
    return;
  }
  
  // Patient-only pages
  const patientOnlyPages = ['appointments.html', 'favorites.html'];
  if (patientOnlyPages.includes(currentPage) && user.role !== 'patient') {
    window.location.href = 'doctor-dashboard.html';
    return;
  }
}

// ================================================================
// AUTHENTICATION UI
// ================================================================

/**
 * Initialize authentication-dependent UI elements
 */
function initializeAuthUI() {
  updateNavigation();
  updateUserInfo();
  initializeLogoutButton();
}

/**
 * Update navigation based on authentication status
 */
function updateNavigation() {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();
  
  // Show/hide auth-dependent navigation items
  $$('.nav-auth-required').forEach(item => {
    item.style.display = isAuthenticated ? 'block' : 'none';
  });
  
  $$('.nav-guest-only').forEach(item => {
    item.style.display = isAuthenticated ? 'none' : 'block';
  });
  
  // Update role-specific navigation
  if (isAuthenticated && user) {
    $$('.nav-patient-only').forEach(item => {
      item.style.display = user.role === 'patient' ? 'block' : 'none';
    });
    
    $$('.nav-doctor-only').forEach(item => {
      item.style.display = user.role === 'doctor' ? 'block' : 'none';
    });
  }
}

/**
 * Update user information in UI
 */
function updateUserInfo() {
  const user = authService.getCurrentUser();
  if (!user) return;
  
  // Update user name
  $$('.user-name').forEach(element => {
    element.textContent = user.name || `${user.firstName} ${user.lastName}`;
  });
  
  // Update user email
  $$('.user-email').forEach(element => {
    element.textContent = user.email;
  });
  
  // Update user avatar
  $$('.user-avatar').forEach(element => {
    if (element.tagName === 'IMG') {
      element.src = user.avatar || 'assets/avatars/default-avatar.jpg';
      element.alt = `Avatar de ${user.name}`;
    }
  });
  
  // Update user role
  $$('.user-role').forEach(element => {
    const roleLabels = {
      patient: 'Paciente',
      doctor: 'Doctor'
    };
    element.textContent = roleLabels[user.role] || user.role;
  });
}

/**
 * Initialize logout button
 */
function initializeLogoutButton() {
  $$('.logout-btn').forEach(button => {
    button.addEventListener('click', handleLogout);
  });
}

/**
 * Handle user logout
 */
async function handleLogout() {
  try {
    // Show confirmation dialog
    const confirmed = await showLogoutConfirmation();
    if (!confirmed) return;
    
    // Perform logout
    await authService.logout();
    
    // Clear any cached data
    clearUserCache();
    
    // Show success message
    showToast('Sesión cerrada exitosamente', 'success');
    
    // Redirect to home page
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
    
  } catch (error) {
    console.error('Logout error:', error);
    showToast('Error al cerrar sesión', 'error');
  }
}

/**
 * Show logout confirmation dialog
 * @returns {Promise<boolean>} User confirmation
 */
function showLogoutConfirmation() {
  return new Promise((resolve) => {
    const modal = createModal(
      'logout-confirmation-modal',
      'Cerrar Sesión',
      createElement('p', {}, '¿Estás seguro de que quieres cerrar tu sesión?'),
      [
        createElement('button', {
          className: 'btn btn-outline',
          onclick: () => {
            closeModal('logout-confirmation-modal');
            resolve(false);
          }
        }, 'Cancelar'),
        createElement('button', {
          className: 'btn btn-error',
          onclick: () => {
            closeModal('logout-confirmation-modal');
            resolve(true);
          }
        }, 'Cerrar Sesión')
      ]
    );
    
    document.body.appendChild(modal);
    openModal('logout-confirmation-modal');
  });
}

/**
 * Clear user-related cached data
 */
function clearUserCache() {
  // Clear localStorage items
  const keysToRemove = [
    'userPreferences',
    'searchHistory',
    'favoriteFilters',
    'draftData'
  ];
  
  keysToRemove.forEach(key => {
    removeStorageItem(key);
  });
}

// ================================================================
// SESSION MANAGEMENT
// ================================================================

/**
 * Initialize session management
 */
function initializeSessionManagement() {
  // Check session validity on page load
  checkSessionValidity();
  
  // Set up periodic session checks
  setInterval(checkSessionValidity, 5 * 60 * 1000); // Every 5 minutes
  
  // Handle visibility change (when user returns to tab)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      checkSessionValidity();
    }
  });
  
  // Handle storage events (for multi-tab sync)
  window.addEventListener('storage', handleStorageChange);
}

/**
 * Check if current session is still valid
 */
async function checkSessionValidity() {
  if (!authService.isAuthenticated()) return;
  
  try {
    // Try to refresh token or validate session
    const isValid = await authService.refreshToken();
    
    if (!isValid) {
      handleSessionExpired();
    }
  } catch (error) {
    console.error('Session validation error:', error);
    
    if (error.status === 401) {
      handleSessionExpired();
    }
  }
}

/**
 * Handle expired session
 */
function handleSessionExpired() {
  // Clear authentication data
  authService.clearToken();
  
  // Show session expired message
  showSessionExpiredModal();
}

/**
 * Show session expired modal
 */
function showSessionExpiredModal() {
  const modal = createModal(
    'session-expired-modal',
    'Sesión Expirada',
    createElement('div', {}, [
      createElement('p', {}, 'Tu sesión ha expirado por seguridad.'),
      createElement('p', {}, 'Por favor, inicia sesión nuevamente para continuar.')
    ]),
    [
      createElement('button', {
        className: 'btn btn-primary',
        onclick: () => {
          closeModal('session-expired-modal');
          window.location.href = 'login.html';
        }
      }, 'Iniciar Sesión'),
      createElement('button', {
        className: 'btn btn-outline',
        onclick: () => {
          closeModal('session-expired-modal');
          window.location.href = 'index.html';
        }
      }, 'Continuar sin cuenta')
    ]
  );
  
  document.body.appendChild(modal);
  openModal('session-expired-modal');
}

/**
 * Handle storage changes (for multi-tab sync)
 * @param {StorageEvent} event - Storage event
 */
function handleStorageChange(event) {
  if (event.key === 'authToken') {
    if (!event.newValue && authService.isAuthenticated()) {
      // Token was removed in another tab
      authService.clearToken();
      handleSessionExpired();
    } else if (event.newValue && !authService.isAuthenticated()) {
      // Token was added in another tab
      window.location.reload();
    }
  }
}

// ================================================================
// PERMISSION HELPERS
// ================================================================

/**
 * Check if user has specific permission
 * @param {string} permission - Permission to check
 * @returns {boolean} Has permission
 */
function hasPermission(permission) {
  const user = authService.getCurrentUser();
  if (!user) return false;
  
  const permissions = {
    'view_appointments': ['patient', 'doctor'],
    'book_appointments': ['patient'],
    'manage_schedule': ['doctor'],
    'view_reviews': ['patient', 'doctor'],
    'write_reviews': ['patient'],
    'manage_profile': ['patient', 'doctor']
  };
  
  return permissions[permission]?.includes(user.role) || false;
}

/**
 * Require specific permission (throw error if not authorized)
 * @param {string} permission - Required permission
 */
function requirePermission(permission) {
  if (!hasPermission(permission)) {
    throw new Error(`Permission denied: ${permission}`);
  }
}

/**
 * Check if user can access resource
 * @param {string} resourceType - Type of resource
 * @param {string} resourceId - Resource ID
 * @param {string} action - Action to perform
 * @returns {boolean} Can access
 */
function canAccessResource(resourceType, resourceId, action = 'view') {
  const user = authService.getCurrentUser();
  if (!user) return false;
  
  // Basic resource access rules
  switch (resourceType) {
    case 'appointment':
      // Users can only access their own appointments
      return action === 'view' || action === 'cancel';
      
    case 'profile':
      // Users can only edit their own profile
      return action === 'view' || (action === 'edit' && hasPermission('manage_profile'));
      
    case 'review':
      // Patients can write reviews, everyone can view
      if (action === 'view') return true;
      if (action === 'write') return hasPermission('write_reviews');
      return false;
      
    default:
      return false;
  }
}

// ================================================================
// AUTH STATE OBSERVERS
// ================================================================

/**
 * Observable authentication state
 */
class AuthStateObserver {
  constructor() {
    this.observers = [];
  }
  
  /**
   * Subscribe to auth state changes
   * @param {Function} callback - Callback function
   */
  subscribe(callback) {
    this.observers.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.observers = this.observers.filter(obs => obs !== callback);
    };
  }
  
  /**
   * Notify all observers of auth state change
   * @param {Object} state - New auth state
   */
  notify(state) {
    this.observers.forEach(callback => {
      try {
        callback(state);
      } catch (error) {
        console.error('Auth observer error:', error);
      }
    });
  }
}

// Create global auth state observer
const authStateObserver = new AuthStateObserver();

/**
 * Initialize auth state monitoring
 */
function initializeAuthStateMonitoring() {
  // Monitor auth changes
  let lastAuthState = authService.isAuthenticated();
  
  setInterval(() => {
    const currentAuthState = authService.isAuthenticated();
    
    if (currentAuthState !== lastAuthState) {
      lastAuthState = currentAuthState;
      
      authStateObserver.notify({
        isAuthenticated: currentAuthState,
        user: authService.getCurrentUser()
      });
    }
  }, 1000);
}

// ================================================================
// INITIALIZATION
// ================================================================

/**
 * Initialize all authentication features
 */
function initializeAuth() {
  initializeAuthGuards();
  initializeSessionManagement();
  initializeAuthStateMonitoring();
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', initializeAuth);

// ================================================================
// UTILITY FUNCTIONS
// ================================================================

/**
 * Get authentication redirect URL
 * @returns {string} Login URL with redirect
 */
function getLoginUrl() {
  const currentUrl = window.location.href;
  return `login.html?redirect=${encodeURIComponent(currentUrl)}`;
}

/**
 * Redirect to login if not authenticated
 */
function redirectToLogin() {
  window.location.href = getLoginUrl();
}

/**
 * Show login modal for unauthenticated actions
 */
function showLoginModal() {
  const loginModal = createModal(
    'login-required-modal',
    'Iniciar Sesión Requerido',
    createElement('div', {}, [
      createElement('p', {}, 'Necesitas iniciar sesión para realizar esta acción.'),
      createElement('div', { className: 'auth-buttons' }, [
        createElement('a', {
          href: getLoginUrl(),
          className: 'btn btn-primary btn-full'
        }, 'Iniciar Sesión'),
        createElement('a', {
          href: 'register.html',
          className: 'btn btn-outline btn-full'
        }, 'Crear Cuenta')
      ])
    ])
  );
  
  document.body.appendChild(loginModal);
  openModal('login-required-modal');
}

/**
 * Create protected action wrapper
 * @param {Function} action - Action to protect
 * @param {string} permission - Required permission
 * @returns {Function} Protected action
 */
function createProtectedAction(action, permission = null) {
  return function(...args) {
    if (!authService.isAuthenticated()) {
      showLoginModal();
      return;
    }
    
    if (permission && !hasPermission(permission)) {
      showToast('No tienes permisos para realizar esta acción', 'error');
      return;
    }
    
    return action.apply(this, args);
  };
}

// ================================================================
// EXPORT FOR GLOBAL USE
// ================================================================

// Make auth utilities available globally
window.authGuards = {
  requireAuthentication,
  hasPermission,
  requirePermission,
  canAccessResource,
  redirectToLogin,
  showLoginModal,
  createProtectedAction,
  authStateObserver
};

// ================================================================
// EXPORT FOR ES6 MODULES
// ================================================================

// If using ES6 modules, uncomment the following:
/*
export {
  initializeAuth,
  requireAuthentication,
  hasPermission,
  requirePermission,
  canAccessResource,
  redirectToLogin,
  showLoginModal,
  createProtectedAction,
  authStateObserver
};
*/