/* ================================================================
   Med Search Platform - Search Page JavaScript
   Search functionality and filters
   ================================================================ */

// ================================================================
// GLOBAL VARIABLES
// ================================================================

let currentPage = 1;
let currentFilters = {};
let searchQuery = '';
let viewMode = 'list'; // 'list' or 'grid'
let isLoading = false;
let searchResults = [];
let totalPages = 1;

// ================================================================
// PAGE INITIALIZATION
// ================================================================

document.addEventListener('DOMContentLoaded', function() {
  initializeSearchPage();
});

/**
 * Initialize search page functionality
 */
async function initializeSearchPage() {
  try {
    // Parse URL parameters
    parseUrlParameters();
    
    // Initialize components
    initializeSearchForm();
    initializeFilters();
    initializeViewToggle();
    initializePagination();
    
    // Load initial data
    await loadFiltersData();
    await performSearch();
    
    console.log('Search page initialized successfully');
  } catch (error) {
    console.error('Error initializing search page:', error);
    showToast('Error al cargar la página de búsqueda', 'error');
  }
}

// ================================================================
// URL PARAMETER HANDLING
// ================================================================

/**
 * Parse URL parameters to set initial state
 */
function parseUrlParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  
  searchQuery = urlParams.get('q') || '';
  currentPage = parseInt(urlParams.get('page')) || 1;
  viewMode = urlParams.get('view') || 'list';
  
  // Parse filters
  const specialty = urlParams.get('specialty');
  const location = urlParams.get('location');
  const priceRange = urlParams.get('price');
  const rating = urlParams.get('rating');
  
  if (specialty) currentFilters.specialty = [specialty];
  if (location) currentFilters.location = location;
  if (priceRange) currentFilters.priceRange = parseInt(priceRange);
  if (rating) currentFilters.rating = parseInt(rating);
  
  // Set search input value
  const searchInput = $('#search-input-main');
  if (searchInput && searchQuery) {
    searchInput.value = searchQuery;
  }
}

/**
 * Update URL with current search state
 */
function updateUrl() {
  const url = new URL(window.location);
  const params = url.searchParams;
  
  // Clear existing parameters
  params.delete('q');
  params.delete('page');
  params.delete('view');
  params.delete('specialty');
  params.delete('location');
  params.delete('price');
  params.delete('rating');
  
  // Set current parameters
  if (searchQuery) params.set('q', searchQuery);
  if (currentPage > 1) params.set('page', currentPage);
  if (viewMode !== 'list') params.set('view', viewMode);
  
  // Set filter parameters
  if (currentFilters.specialty?.length) {
    params.set('specialty', currentFilters.specialty[0]);
  }
  if (currentFilters.location) {
    params.set('location', currentFilters.location);
  }
  if (currentFilters.priceRange) {
    params.set('price', currentFilters.priceRange);
  }
  if (currentFilters.rating) {
    params.set('rating', currentFilters.rating);
  }
  
  window.history.replaceState({}, '', url);
}

// ================================================================
// SEARCH FORM FUNCTIONALITY
// ================================================================

/**
 * Initialize search form
 */
function initializeSearchForm() {
  const searchForm = $('#advanced-search-form');
  const searchInput = $('#search-input-main');
  
  if (searchForm) {
    searchForm.addEventListener('submit', handleSearch);
  }
  
  if (searchInput) {
    // Debounced search on input
    const debouncedSearch = debounce(() => {
      searchQuery = searchInput.value.trim();
      currentPage = 1;
      performSearch();
    }, 500);
    
    searchInput.addEventListener('input', debouncedSearch);
  }
  
  // Quick filters
  initializeQuickFilters();
}

/**
 * Handle search form submission
 * @param {Event} event - Form submit event
 */
function handleSearch(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  searchQuery = formData.get('search') || '';
  
  // Reset to first page
  currentPage = 1;
  
  // Perform search
  performSearch();
}

/**
 * Initialize quick filters
 */
function initializeQuickFilters() {
  $$('.filter-chip').forEach(chip => {
    chip.addEventListener('click', function() {
      const filterType = this.dataset.filter;
      const filterValue = this.dataset.value;
      
      // Toggle active state
      this.classList.toggle('active');
      
      // Update filters
      if (filterType === 'specialty') {
        if (!currentFilters.specialty) currentFilters.specialty = [];
        
        if (this.classList.contains('active')) {
          if (!currentFilters.specialty.includes(filterValue)) {
            currentFilters.specialty.push(filterValue);
          }
        } else {
          currentFilters.specialty = currentFilters.specialty.filter(v => v !== filterValue);
          if (currentFilters.specialty.length === 0) {
            delete currentFilters.specialty;
          }
        }
      } else {
        if (this.classList.contains('active')) {
          currentFilters[filterType] = filterValue;
        } else {
          delete currentFilters[filterType];
        }
      }
      
      // Reset to first page and search
      currentPage = 1;
      performSearch();
    });
  });
}

// ================================================================
// FILTERS FUNCTIONALITY
// ================================================================

/**
 * Initialize filters sidebar
 */
function initializeFilters() {
  // Mobile filters toggle
  const mobileToggle = $('.mobile-filters-toggle');
  const filtersSidebar = $('.filters-sidebar');
  
  if (mobileToggle && filtersSidebar) {
    mobileToggle.addEventListener('click', function() {
      filtersSidebar.classList.toggle('mobile-open');
      document.body.classList.toggle('filters-open');
    });
  }
  
  // Clear filters button
  const clearFiltersBtn = $('#clear-filters');
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', clearAllFilters);
  }
  
  // Listen for filter changes
  document.addEventListener('filtersChanged', function(event) {
    currentFilters = { ...currentFilters, ...event.detail };
    currentPage = 1;
    performSearch();
  });
}

/**
 * Load filters data from API
 */
async function loadFiltersData() {
  const filtersSidebar = $('.filters-sidebar');
  if (!filtersSidebar) return;
  
  try {
    // Load specialties for filter
    const specialtiesResponse = await specialtiesService.getAll();
    const specialties = specialtiesResponse.specialties || [];
    
    // Create specialty filter
    const specialtyOptions = specialties.map(specialty => ({
      label: specialty.name,
      value: specialty.id.toString(),
      count: specialty.doctorCount || 0,
      checked: currentFilters.specialty?.includes(specialty.id.toString()) || false
    }));
    
    const specialtyFilter = createFilterSection(
      'Especialidad',
      specialtyOptions,
      'checkbox',
      'specialty'
    );
    
    // Location filter (example cities)
    const locationOptions = [
      { label: 'Ciudad de México', value: 'cdmx', count: 245 },
      { label: 'Guadalajara', value: 'gdl', count: 128 },
      { label: 'Monterrey', value: 'mty', count: 95 },
      { label: 'Puebla', value: 'pue', count: 67 },
      { label: 'Tijuana', value: 'tij', count: 54 }
    ].map(option => ({
      ...option,
      checked: currentFilters.location === option.value
    }));
    
    const locationFilter = createFilterSection(
      'Ubicación',
      locationOptions,
      'radio',
      'location'
    );
    
    // Rating filter
    const ratingOptions = [
      { label: '4.5+ estrellas', value: '4.5', count: 89 },
      { label: '4.0+ estrellas', value: '4.0', count: 156 },
      { label: '3.5+ estrellas', value: '3.5', count: 203 },
      { label: '3.0+ estrellas', value: '3.0', count: 267 }
    ].map(option => ({
      ...option,
      checked: currentFilters.rating === parseFloat(option.value)
    }));
    
    const ratingFilter = createFilterSection(
      'Calificación mínima',
      ratingOptions,
      'radio',
      'rating'
    );
    
    // Price range filter
    const priceFilter = createFilterSection(
      'Precio de consulta',
      {
        min: 300,
        max: 2000,
        value: currentFilters.priceRange || 1000
      },
      'range',
      'priceRange'
    );
    
    // Insert filters into sidebar
    const filtersContainer = $('.filters-sidebar');
    const existingFilters = filtersContainer.querySelector('.filter-sections');
    
    if (existingFilters) {
      existingFilters.remove();
    }
    
    const filterSections = createElement('div', { className: 'filter-sections' }, [
      specialtyFilter,
      locationFilter,
      ratingFilter,
      priceFilter
    ]);
    
    filtersContainer.appendChild(filterSections);
    
  } catch (error) {
    console.error('Error loading filters data:', error);
  }
}

/**
 * Clear all active filters
 */
function clearAllFilters() {
  currentFilters = {};
  currentPage = 1;
  
  // Clear quick filter chips
  $$('.filter-chip.active').forEach(chip => {
    chip.classList.remove('active');
  });
  
  // Clear sidebar filters
  $$('.filters-sidebar input:checked').forEach(input => {
    input.checked = false;
  });
  
  // Reset range sliders
  $$('.range-slider').forEach(slider => {
    slider.value = slider.min;
    updateRangeLabel(slider);
  });
  
  // Perform search
  performSearch();
}

// ================================================================
// VIEW TOGGLE FUNCTIONALITY
// ================================================================

/**
 * Initialize view toggle buttons
 */
function initializeViewToggle() {
  const viewBtns = $$('.view-btn');
  const doctorsList = $('.doctors-list');
  
  viewBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const newViewMode = this.dataset.view;
      
      if (newViewMode !== viewMode) {
        viewMode = newViewMode;
        
        // Update button states
        viewBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        // Update list class
        if (doctorsList) {
          doctorsList.classList.remove('list-view', 'grid-view');
          doctorsList.classList.add(`${viewMode}-view`);
        }
        
        // Update URL
        updateUrl();
        
        // Re-render results with new view mode
        renderSearchResults(searchResults);
      }
    });
  });
  
  // Set initial view mode
  const activeBtn = $(`.view-btn[data-view="${viewMode}"]`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }
  
  const doctorsList = $('.doctors-list');
  if (doctorsList) {
    doctorsList.classList.add(`${viewMode}-view`);
  }
}

// ================================================================
// SEARCH EXECUTION
// ================================================================

/**
 * Perform search with current parameters
 */
async function performSearch() {
  if (isLoading) return;
  
  isLoading = true;
  const resultsContainer = $('.doctors-list');
  const resultsHeader = $('.results-header');
  
  try {
    // Update URL
    updateUrl();
    
    // Show loading state
    if (resultsContainer) {
      showLoadingState(resultsContainer, 'doctor', 9);
    }
    
    // Build search parameters
    const searchParams = {
      q: searchQuery,
      page: currentPage,
      limit: 12,
      ...currentFilters
    };
    
    // Perform search
    const response = await doctorsService.search(searchParams);
    
    // Update results
    searchResults = response.doctors || [];
    totalPages = response.totalPages || 1;
    
    // Update UI
    updateResultsHeader(response);
    renderSearchResults(searchResults);
    updatePagination();
    
    // Log search for analytics
    if (searchQuery) {
      searchService.logSearch(searchQuery, searchResults);
    }
    
  } catch (error) {
    console.error('Search error:', error);
    showSearchError();
  } finally {
    isLoading = false;
  }
}

/**
 * Update search results header
 * @param {Object} response - Search response
 */
function updateResultsHeader(response) {
  const resultsCount = $('.results-count h2');
  const resultsSubtitle = $('.results-subtitle');
  
  if (resultsCount) {
    const total = response.total || 0;
    resultsCount.textContent = `${total} ${total === 1 ? 'doctor encontrado' : 'doctores encontrados'}`;
  }
  
  if (resultsSubtitle) {
    let subtitle = '';
    if (searchQuery) {
      subtitle += `para "${searchQuery}"`;
    }
    if (currentFilters.specialty?.length) {
      const specialtyNames = currentFilters.specialty.map(id => {
        // This would normally come from the specialties data
        return `Especialidad ${id}`;
      }).join(', ');
      subtitle += subtitle ? ` en ${specialtyNames}` : specialtyNames;
    }
    resultsSubtitle.textContent = subtitle || 'Todos los doctores disponibles';
  }
}

/**
 * Render search results
 * @param {Array} doctors - Array of doctor objects
 */
function renderSearchResults(doctors) {
  const resultsContainer = $('.doctors-list');
  if (!resultsContainer) return;
  
  resultsContainer.innerHTML = '';
  
  if (doctors.length === 0) {
    renderEmptyState();
    return;
  }
  
  // Render doctor cards
  doctors.forEach((doctor, index) => {
    const doctorCard = createDoctorCard(doctor, viewMode);
    
    // Add animation delay
    doctorCard.style.animationDelay = `${index * 50}ms`;
    
    resultsContainer.appendChild(doctorCard);
  });
  
  // Initialize favorite buttons
  initializeFavoriteButtons();
  
  // Scroll to results on mobile
  if (window.innerWidth < 768 && currentPage === 1) {
    const resultsSection = $('.search-results');
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

/**
 * Render empty state when no results found
 */
function renderEmptyState() {
  const resultsContainer = $('.doctors-list');
  if (!resultsContainer) return;
  
  const emptyState = createElement('div', { className: 'empty-state' }, [
    createElement('div', { className: 'empty-icon' }, [
      createElement('svg', {
        width: '48',
        height: '48',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '1'
      }, [
        createElement('circle', { cx: '11', cy: '11', r: '8' }),
        createElement('path', { d: 'm21 21-4.35-4.35' })
      ])
    ]),
    createElement('h3', { className: 'empty-title' }, 'No se encontraron doctores'),
    createElement('p', { className: 'empty-description' }, [
      'No pudimos encontrar doctores que coincidan con tu búsqueda. ',
      'Intenta ajustar los filtros o usar términos diferentes.'
    ]),
    createElement('div', { className: 'empty-actions' }, [
      createElement('button', {
        className: 'btn btn-outline',
        onclick: clearAllFilters
      }, 'Limpiar filtros'),
      createElement('button', {
        className: 'btn btn-primary',
        onclick: () => window.location.href = 'index.html'
      }, 'Volver al inicio')
    ])
  ]);
  
  resultsContainer.appendChild(emptyState);
}

/**
 * Show search error state
 */
function showSearchError() {
  const resultsContainer = $('.doctors-list');
  if (!resultsContainer) return;
  
  resultsContainer.innerHTML = `
    <div class="error-state">
      <div class="error-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <h3 class="error-title">Error al cargar los resultados</h3>
      <p class="error-description">
        Ocurrió un problema al buscar doctores. Por favor, intenta nuevamente.
      </p>
      <div class="error-actions">
        <button class="btn btn-primary" onclick="performSearch()">
          Reintentar búsqueda
        </button>
      </div>
    </div>
  `;
}

// ================================================================
// PAGINATION
// ================================================================

/**
 * Initialize pagination
 */
function initializePagination() {
  // Pagination will be created dynamically
}

/**
 * Update pagination component
 */
function updatePagination() {
  const paginationContainer = $('.pagination-container');
  if (!paginationContainer || totalPages <= 1) {
    if (paginationContainer) {
      paginationContainer.innerHTML = '';
    }
    return;
  }
  
  const paginationData = {
    currentPage,
    totalPages,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1
  };
  
  const pagination = createPagination(paginationData);
  paginationContainer.innerHTML = '';
  paginationContainer.appendChild(pagination);
}

/**
 * Navigate to specific page
 * @param {number} page - Page number
 */
function goToPage(page) {
  if (page < 1 || page > totalPages || page === currentPage) {
    return;
  }
  
  currentPage = page;
  performSearch();
  
  // Scroll to top of results
  const resultsSection = $('.search-results');
  if (resultsSection) {
    resultsSection.scrollIntoView({ behavior: 'smooth' });
  }
}

// ================================================================
// FAVORITE FUNCTIONALITY
// ================================================================

/**
 * Initialize favorite buttons
 */
function initializeFavoriteButtons() {
  $$('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', function(event) {
      event.stopPropagation();
      event.preventDefault();
      toggleFavorite(this);
    });
  });
}

/**
 * Toggle doctor favorite status
 * @param {Element} button - Favorite button
 */
async function toggleFavorite(button) {
  const doctorId = button.dataset.doctorId;
  
  // Check authentication
  if (!authService.isAuthenticated()) {
    showLoginModal();
    return;
  }
  
  try {
    button.disabled = true;
    
    const isFavorited = button.classList.contains('favorited');
    
    // Update UI immediately for better UX
    if (isFavorited) {
      button.classList.remove('favorited');
      button.setAttribute('aria-label', 'Agregar a favoritos');
      showToast('Eliminado de favoritos', 'success');
    } else {
      button.classList.add('favorited');
      button.setAttribute('aria-label', 'Eliminar de favoritos');
      showToast('Agregado a favoritos', 'success');
    }
    
    // Here you would make API call to update favorites
    // await favoritesService.toggle(doctorId);
    
  } catch (error) {
    console.error('Error toggling favorite:', error);
    
    // Revert UI changes on error
    button.classList.toggle('favorited');
    showToast('Error al actualizar favoritos', 'error');
  } finally {
    button.disabled = false;
  }
}

// ================================================================
// SORT FUNCTIONALITY
// ================================================================

/**
 * Initialize sort dropdown
 */
function initializeSort() {
  const sortSelect = $('.sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', function() {
      const sortValue = this.value;
      currentFilters.sortBy = sortValue;
      currentPage = 1;
      performSearch();
    });
  }
}

// Initialize sort on page load
document.addEventListener('DOMContentLoaded', initializeSort);

// ================================================================
// EXPORT FOR ES6 MODULES
// ================================================================

// If using ES6 modules, uncomment the following:
/*
export {
  initializeSearchPage,
  performSearch,
  goToPage,
  clearAllFilters
};
*/