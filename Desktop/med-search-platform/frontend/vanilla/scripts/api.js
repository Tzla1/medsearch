/* ================================================================
   Med Search Platform - API Client
   Handles all API communication with backend
   ================================================================ */

// ================================================================
// API CONFIGURATION
// ================================================================

const API_CONFIG = {
  baseURL: 'http://localhost:3001/api/v1',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000
};

// ================================================================
// API CLIENT CLASS
// ================================================================

class APIClient {
  constructor(config = API_CONFIG) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout;
    this.retryAttempts = config.retryAttempts;
    this.retryDelay = config.retryDelay;
    this.token = this.getStoredToken();
    
    // Request interceptors
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    
    // Setup default interceptors
    this.setupDefaultInterceptors();
  }
  
  // ================================================================
  // TOKEN MANAGEMENT
  // ================================================================
  
  getStoredToken() {
    return getStorageItem('authToken');
  }
  
  setToken(token) {
    this.token = token;
    if (token) {
      setStorageItem('authToken', token);
    } else {
      removeStorageItem('authToken');
    }
  }
  
  clearToken() {
    this.token = null;
    removeStorageItem('authToken');
    removeStorageItem('refreshToken');
    removeStorageItem('user');
  }
  
  // ================================================================
  // INTERCEPTORS
  // ================================================================
  
  setupDefaultInterceptors() {
    // Request interceptor for auth token
    this.addRequestInterceptor((config) => {
      if (this.token) {
        config.headers = {
          ...config.headers,
          'Authorization': `Bearer ${this.token}`
        };
      }
      return config;
    });
    
    // Response interceptor for token refresh
    this.addResponseInterceptor(
      (response) => response,
      async (error) => {
        if (error.status === 401 && this.token) {
          // Token expired, try to refresh
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Retry original request
            return this.request(error.config);
          } else {
            // Refresh failed, redirect to login
            this.clearToken();
            window.location.href = '/login.html';
          }
        }
        throw error;
      }
    );
  }
  
  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor);
  }
  
  addResponseInterceptor(fulfilled, rejected) {
    this.responseInterceptors.push({ fulfilled, rejected });
  }
  
  // ================================================================
  // CORE REQUEST METHOD
  // ================================================================
  
  async request(config) {
    // Apply request interceptors
    let requestConfig = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      ...config
    };
    
    for (const interceptor of this.requestInterceptors) {
      requestConfig = interceptor(requestConfig) || requestConfig;
    }
    
    const url = requestConfig.url.startsWith('http') 
      ? requestConfig.url 
      : `${this.baseURL}${requestConfig.url}`;
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    try {
      // Prepare fetch options
      const fetchOptions = {
        method: requestConfig.method,
        headers: requestConfig.headers,
        signal: controller.signal
      };
      
      // Add body for non-GET requests
      if (requestConfig.data && requestConfig.method !== 'GET') {
        if (requestConfig.data instanceof FormData) {
          fetchOptions.body = requestConfig.data;
          // Remove Content-Type to let browser set it with boundary
          delete fetchOptions.headers['Content-Type'];
        } else {
          fetchOptions.body = JSON.stringify(requestConfig.data);
        }
      }
      
      // Add query parameters for GET requests
      if (requestConfig.params && requestConfig.method === 'GET') {
        const urlObj = new URL(url);
        Object.entries(requestConfig.params).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            urlObj.searchParams.append(key, value);
          }
        });
        const response = await fetch(urlObj.toString(), fetchOptions);
        clearTimeout(timeoutId);
        return await this.handleResponse(response);
      }
      
      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);
      return await this.handleResponse(response);
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new APIError('Request timeout', 408, requestConfig);
      }
      
      // Network error or other fetch errors
      throw new APIError(
        'Network error: ' + error.message, 
        0, 
        requestConfig
      );
    }
  }
  
  async handleResponse(response) {
    let data;
    const contentType = response.headers.get('content-type');
    
    try {
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
    } catch (error) {
      data = null;
    }
    
    const result = {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      config: { url: response.url }
    };
    
    if (!response.ok) {
      // Apply response error interceptors
      for (const interceptor of this.responseInterceptors) {
        if (interceptor.rejected) {
          try {
            return await interceptor.rejected(new APIError(
              data?.message || response.statusText,
              response.status,
              result.config,
              data
            ));
          } catch (interceptorError) {
            throw interceptorError;
          }
        }
      }
      
      throw new APIError(
        data?.message || response.statusText,
        response.status,
        result.config,
        data
      );
    }
    
    // Apply response success interceptors
    for (const interceptor of this.responseInterceptors) {
      if (interceptor.fulfilled) {
        result = interceptor.fulfilled(result) || result;
      }
    }
    
    return result;
  }
  
  // ================================================================
  // HTTP METHODS
  // ================================================================
  
  async get(url, params = {}, config = {}) {
    return this.request({
      method: 'GET',
      url,
      params,
      ...config
    });
  }
  
  async post(url, data = {}, config = {}) {
    return this.request({
      method: 'POST',
      url,
      data,
      ...config
    });
  }
  
  async put(url, data = {}, config = {}) {
    return this.request({
      method: 'PUT',
      url,
      data,
      ...config
    });
  }
  
  async patch(url, data = {}, config = {}) {
    return this.request({
      method: 'PATCH',
      url,
      data,
      ...config
    });
  }
  
  async delete(url, config = {}) {
    return this.request({
      method: 'DELETE',
      url,
      ...config
    });
  }
  
  // ================================================================
  // TOKEN REFRESH
  // ================================================================
  
  async refreshToken() {
    const refreshToken = getStorageItem('refreshToken');
    if (!refreshToken) return false;
    
    try {
      const response = await this.post('/auth/refresh', {
        refreshToken
      });
      
      if (response.data.accessToken) {
        this.setToken(response.data.accessToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }
}

// ================================================================
// API ERROR CLASS
// ================================================================

class APIError extends Error {
  constructor(message, status, config, data = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.config = config;
    this.data = data;
  }
  
  get isNetworkError() {
    return this.status === 0;
  }
  
  get isTimeout() {
    return this.status === 408;
  }
  
  get isServerError() {
    return this.status >= 500;
  }
  
  get isClientError() {
    return this.status >= 400 && this.status < 500;
  }
  
  get isAuthError() {
    return this.status === 401 || this.status === 403;
  }
}

// ================================================================
// API SERVICE MODULES
// ================================================================

// Create API client instance
const apiClient = new APIClient();

// ================================================================
// AUTHENTICATION SERVICE
// ================================================================

const authService = {
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      
      if (response.data.accessToken) {
        apiClient.setToken(response.data.accessToken);
        
        if (response.data.refreshToken) {
          setStorageItem('refreshToken', response.data.refreshToken);
        }
        
        if (response.data.user) {
          setStorageItem('user', response.data.user);
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  async logout() {
    try {
      if (apiClient.token) {
        await apiClient.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      apiClient.clearToken();
    }
  },
  
  async forgotPassword(email) {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },
  
  async resetPassword(token, newPassword) {
    try {
      const response = await apiClient.post('/auth/reset-password', {
        token,
        newPassword
      });
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },
  
  getCurrentUser() {
    return getStorageItem('user');
  },
  
  isAuthenticated() {
    return !!apiClient.token && !!this.getCurrentUser();
  }
};

// ================================================================
// DOCTORS SERVICE
// ================================================================

const doctorsService = {
  async search(params = {}) {
    try {
      const response = await apiClient.get('/search/doctors', params);
      return response.data;
    } catch (error) {
      console.error('Doctor search error:', error);
      // Return fallback data if backend is not available
      return this.getFallbackSearchResults(params);
    }
  },
  
  async getById(id) {
    try {
      const response = await apiClient.get(`/doctors/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get doctor error:', error);
      throw error;
    }
  },
  
  async getBySpecialty(specialtyId, params = {}) {
    try {
      const response = await apiClient.get(`/doctors/specialty/${specialtyId}`, params);
      return response.data;
    } catch (error) {
      console.error('Get doctors by specialty error:', error);
      throw error;
    }
  },
  
  async getFeatured(limit = 6) {
    try {
      const response = await apiClient.get('/search/featured', { limit });
      return response.data;
    } catch (error) {
      console.error('Get featured doctors error:', error);
      // Return fallback data
      return this.getFallbackFeaturedDoctors();
    }
  },
  
  async getAvailability(doctorId, date) {
    try {
      const response = await apiClient.get(`/doctors/${doctorId}/availability`, {
        date: date instanceof Date ? date.toISOString().split('T')[0] : date
      });
      return response.data;
    } catch (error) {
      console.error('Get doctor availability error:', error);
      throw error;
    }
  },
  
  // Fallback data for offline/demo mode
  getFallbackFeaturedDoctors() {
    return {
      doctors: [
        {
          id: 1,
          name: 'Dr. Roberto Martínez',
          specialty: 'Cardiología',
          rating: 4.8,
          reviewCount: 127,
          consultationFee: 800,
          photo: 'assets/doctors/doctor-1.jpg',
          isVerified: true,
          nextAvailable: 'Hoy, 3:00 PM'
        },
        {
          id: 2,
          name: 'Dra. Ana García',
          specialty: 'Pediatría',
          rating: 4.9,
          reviewCount: 95,
          consultationFee: 600,
          photo: 'assets/doctors/doctor-2.jpg',
          isVerified: true,
          nextAvailable: 'Mañana, 10:00 AM'
        },
        {
          id: 3,
          name: 'Dr. Luis Rodríguez',
          specialty: 'Dermatología',
          rating: 4.7,
          reviewCount: 203,
          consultationFee: 750,
          photo: 'assets/doctors/doctor-3.jpg',
          isVerified: true,
          nextAvailable: 'Hoy, 5:30 PM'
        }
      ]
    };
  },

  // Fallback search results
  getFallbackSearchResults(params) {
    const allDoctors = [
      ...this.getFallbackFeaturedDoctors().doctors,
      {
        id: 4,
        name: 'Dra. María González',
        specialty: 'Ginecología',
        rating: 4.6,
        reviewCount: 89,
        consultationFee: 700,
        photo: 'assets/doctors/doctor-1.jpg',
        isVerified: true,
        nextAvailable: 'Mañana, 2:00 PM'
      },
      {
        id: 5,
        name: 'Dr. Carlos Hernández',
        specialty: 'Neurología',
        rating: 4.8,
        reviewCount: 145,
        consultationFee: 950,
        photo: 'assets/doctors/doctor-2.jpg',
        isVerified: true,
        nextAvailable: 'Pasado mañana, 11:00 AM'
      }
    ];

    // Filter by query if provided
    let filteredDoctors = allDoctors;
    if (params.q) {
      const query = params.q.toLowerCase();
      filteredDoctors = allDoctors.filter(doctor => 
        doctor.name.toLowerCase().includes(query) ||
        doctor.specialty.toLowerCase().includes(query)
      );
    }

    // Filter by specialty
    if (params.specialty) {
      filteredDoctors = filteredDoctors.filter(doctor => 
        doctor.specialty.toLowerCase().includes(params.specialty.toLowerCase())
      );
    }

    return {
      doctors: filteredDoctors,
      total: filteredDoctors.length,
      page: params.page || 1,
      totalPages: Math.ceil(filteredDoctors.length / (params.limit || 12)),
      hasNext: false,
      hasPrev: false
    };
  }
};

// ================================================================
// SPECIALTIES SERVICE
// ================================================================

const specialtiesService = {
  async getAll() {
    try {
      const response = await apiClient.get('/specialties');
      return response.data;
    } catch (error) {
      console.error('Get specialties error:', error);
      // Return fallback data
      return this.getFallbackSpecialties();
    }
  },
  
  async getById(id) {
    try {
      const response = await apiClient.get(`/specialties/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get specialty error:', error);
      throw error;
    }
  },
  
  // Fallback data for offline/demo mode
  getFallbackSpecialties() {
    return {
      specialties: [
        { id: 1, name: 'Cardiología', description: 'Especialistas en el corazón y sistema cardiovascular', icon: '🫀' },
        { id: 2, name: 'Pediatría', description: 'Atención médica para bebés, niños y adolescentes', icon: '👶' },
        { id: 3, name: 'Dermatología', description: 'Diagnóstico y tratamiento de enfermedades de la piel', icon: '🧴' },
        { id: 4, name: 'Neurología', description: 'Especialistas en trastornos del sistema nervioso', icon: '🧠' },
        { id: 5, name: 'Ginecología', description: 'Salud del sistema reproductivo femenino', icon: '👩' },
        { id: 6, name: 'Oftalmología', description: 'Especialistas en enfermedades y cirugía de los ojos', icon: '👁' },
        { id: 7, name: 'Traumatología', description: 'Tratamiento de lesiones del sistema musculoesquelético', icon: '🦴' },
        { id: 8, name: 'Psiquiatría', description: 'Diagnóstico y tratamiento de trastornos mentales', icon: '🧘' },
        { id: 9, name: 'Endocrinología', description: 'Especialistas en trastornos hormonales y metabólicos', icon: '⚗️' },
        { id: 10, name: 'Gastroenterología', description: 'Enfermedades del aparato digestivo', icon: '🫃' },
        { id: 11, name: 'Medicina General', description: 'Atención médica integral y primera consulta', icon: '🩺' },
        { id: 12, name: 'Odontología', description: 'Salud bucodental y tratamientos dentales', icon: '🦷' }
      ]
    };
  }
};

// ================================================================
// APPOINTMENTS SERVICE
// ================================================================

const appointmentsService = {
  async create(appointmentData) {
    try {
      const response = await apiClient.post('/appointments', appointmentData);
      return response.data;
    } catch (error) {
      console.error('Create appointment error:', error);
      throw error;
    }
  },
  
  async getByUser(userId) {
    try {
      const response = await apiClient.get(`/appointments/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get user appointments error:', error);
      throw error;
    }
  },
  
  async getByDoctor(doctorId) {
    try {
      const response = await apiClient.get(`/appointments/doctor/${doctorId}`);
      return response.data;
    } catch (error) {
      console.error('Get doctor appointments error:', error);
      throw error;
    }
  },
  
  async update(appointmentId, updateData) {
    try {
      const response = await apiClient.put(`/appointments/${appointmentId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Update appointment error:', error);
      throw error;
    }
  },
  
  async cancel(appointmentId, reason) {
    try {
      const response = await apiClient.patch(`/appointments/${appointmentId}/cancel`, {
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Cancel appointment error:', error);
      throw error;
    }
  }
};

// ================================================================
// SEARCH SERVICE
// ================================================================

const searchService = {
  async searchAll(query, filters = {}) {
    try {
      const params = {
        q: query,
        ...filters
      };
      const response = await apiClient.get('/search', params);
      return response.data;
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  },
  
  async getPopularSearches() {
    try {
      const response = await apiClient.get('/search/popular');
      return response.data;
    } catch (error) {
      console.error('Get popular searches error:', error);
      return { searches: [] };
    }
  },
  
  async logSearch(query, results) {
    try {
      // Don't await this call as it's not critical
      apiClient.post('/search/log', {
        query,
        resultsCount: results.length
      }).catch(err => {
        console.warn('Search logging failed:', err);
      });
    } catch (error) {
      // Silent fail for search logging
    }
  }
};

// ================================================================
// EXPORT API SERVICES
// ================================================================

// Global API object for use in other scripts
window.API = {
  client: apiClient,
  auth: authService,
  doctors: doctorsService,
  specialties: specialtiesService,
  appointments: appointmentsService,
  search: searchService,
  APIError
};

// Individual exports for convenience
window.apiClient = apiClient;
window.authService = authService;
window.doctorsService = doctorsService;
window.specialtiesService = specialtiesService;
window.appointmentsService = appointmentsService;
window.searchService = searchService;