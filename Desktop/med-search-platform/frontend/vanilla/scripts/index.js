/* ================================================================
   Med Search Platform - Index Page JavaScript
   Landing page functionality and interactions
   ================================================================ */

// ================================================================
// PAGE INITIALIZATION
// ================================================================

document.addEventListener('DOMContentLoaded', function() {
  initializeLandingPage();
});

/**
 * Initialize landing page functionality
 */
async function initializeLandingPage() {
  try {
    // Initialize components
    initializeNavigation();
    initializeHeroSearch();
    await loadSpecialties();
    await loadFeaturedDoctors();
    initializeAnimations();
    initializeLazyLoading();
    
    console.log('Landing page initialized successfully');
  } catch (error) {
    console.error('Error initializing landing page:', error);
    showToast('Error al cargar la página', 'error');
  }
}

// ================================================================
// NAVIGATION FUNCTIONALITY
// ================================================================

/**
 * Initialize navigation interactions
 */
function initializeNavigation() {
  const menuToggle = $('.menu-toggle');
  const mobileMenu = $('.mobile-menu');
  
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function() {
      const isOpen = mobileMenu.classList.contains('open');
      
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
      if (!event.target.closest('.navbar') && mobileMenu.classList.contains('open')) {
        closeMobileMenu();
      }
    });
    
    // Close mobile menu on escape key
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && mobileMenu.classList.contains('open')) {
        closeMobileMenu();
      }
    });
  }
  
  // Smooth scroll for navigation links
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function(event) {
      event.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = $(`#${targetId}`);
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        
        // Close mobile menu if open
        if (mobileMenu && mobileMenu.classList.contains('open')) {
          closeMobileMenu();
        }
      }
    });
  });
}

/**
 * Open mobile menu
 */
function openMobileMenu() {
  const menuToggle = $('.menu-toggle');
  const mobileMenu = $('.mobile-menu');
  
  if (menuToggle && mobileMenu) {
    menuToggle.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

/**
 * Close mobile menu
 */
function closeMobileMenu() {
  const menuToggle = $('.menu-toggle');
  const mobileMenu = $('.mobile-menu');
  
  if (menuToggle && mobileMenu) {
    menuToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// ================================================================
// HERO SEARCH FUNCTIONALITY
// ================================================================

/**
 * Initialize hero search form
 */
function initializeHeroSearch() {
  const searchForm = $('.hero-search-form');
  const searchInput = $('#hero-search-input');
  const specialtySelect = $('#hero-specialty-select');
  
  if (searchForm) {
    searchForm.addEventListener('submit', handleHeroSearch);
  }
  
  if (searchInput) {
    // Add search suggestions
    let searchTimeout;
    searchInput.addEventListener('input', function() {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        showSearchSuggestions(this.value);
      }, 300);
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', function(event) {
      if (!event.target.closest('.hero-search-form')) {
        hideSuggestions();
      }
    });
  }
  
  // Populate specialty select
  populateSpecialtySelect();
}

/**
 * Handle hero search form submission
 * @param {Event} event - Form submit event
 */
function handleHeroSearch(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const searchQuery = formData.get('search') || '';
  const specialty = formData.get('specialty') || '';
  
  // Build search URL
  const searchParams = new URLSearchParams();
  if (searchQuery.trim()) {
    searchParams.set('q', searchQuery.trim());
  }
  if (specialty) {
    searchParams.set('specialty', specialty);
  }
  
  // Navigate to search page
  window.location.href = `search.html?${searchParams.toString()}`;
}

/**
 * Show search suggestions
 * @param {string} query - Search query
 */
async function showSearchSuggestions(query) {
  if (!query || query.length < 2) {
    hideSuggestions();
    return;
  }
  
  try {
    // For demo purposes, show static suggestions
    // In real implementation, this would call API
    const suggestions = [
      'Cardiología',
      'Pediatría',
      'Dermatología',
      'Neurología',
      'Dr. Roberto Martínez',
      'Dr. Ana García'
    ].filter(item => 
      item.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
    
    displaySuggestions(suggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
  }
}

/**
 * Display search suggestions
 * @param {Array} suggestions - Array of suggestions
 */
function displaySuggestions(suggestions) {
  const searchInput = $('#hero-search-input');
  let suggestionsList = $('.search-suggestions');
  
  // Remove existing suggestions
  if (suggestionsList) {
    suggestionsList.remove();
  }
  
  if (suggestions.length === 0) return;
  
  // Create suggestions list
  suggestionsList = createElement('ul', {
    className: 'search-suggestions'
  });
  
  suggestions.forEach(suggestion => {
    const suggestionItem = createElement('li', {
      className: 'suggestion-item',
      onclick: () => selectSuggestion(suggestion)
    }, suggestion);
    
    suggestionsList.appendChild(suggestionItem);
  });
  
  // Insert after search input
  searchInput.parentNode.appendChild(suggestionsList);
}

/**
 * Select a search suggestion
 * @param {string} suggestion - Selected suggestion
 */
function selectSuggestion(suggestion) {
  const searchInput = $('#hero-search-input');
  if (searchInput) {
    searchInput.value = suggestion;
    hideSuggestions();
    
    // Trigger search
    const searchForm = $('.hero-search-form');
    if (searchForm) {
      searchForm.dispatchEvent(new Event('submit'));
    }
  }
}

/**
 * Hide search suggestions
 */
function hideSuggestions() {
  const suggestionsList = $('.search-suggestions');
  if (suggestionsList) {
    suggestionsList.remove();
  }
}

/**
 * Populate specialty select dropdown
 */
async function populateSpecialtySelect() {
  const specialtySelect = $('#hero-specialty-select');
  if (!specialtySelect) return;
  
  try {
    const response = await specialtiesService.getAll();
    const specialties = response.specialties || [];
    
    // Clear existing options except the first one
    while (specialtySelect.children.length > 1) {
      specialtySelect.removeChild(specialtySelect.lastChild);
    }
    
    // Add specialty options
    specialties.slice(0, 10).forEach(specialty => {
      const option = createElement('option', {
        value: specialty.id
      }, specialty.name);
      
      specialtySelect.appendChild(option);
    });
    
  } catch (error) {
    console.error('Error loading specialties for select:', error);
  }
}

// ================================================================
// SPECIALTIES SECTION
// ================================================================

/**
 * Load and display specialties
 */
async function loadSpecialties() {
  const specialtiesGrid = $('.specialties-grid');
  if (!specialtiesGrid) return;
  
  try {
    // Show loading state
    showLoadingState(specialtiesGrid, 'specialty', 8);
    
    const response = await specialtiesService.getAll();
    const specialties = response.specialties || [];
    
    // Clear loading state
    specialtiesGrid.innerHTML = '';
    
    // Display specialties (show first 8)
    specialties.slice(0, 8).forEach(specialty => {
      const specialtyCard = createSpecialtyCard(specialty);
      specialtiesGrid.appendChild(specialtyCard);
    });
    
    // Animate cards into view
    animateCardsIn(specialtiesGrid);
    
  } catch (error) {
    console.error('Error loading specialties:', error);
    specialtiesGrid.innerHTML = `
      <div class="error-message">
        <p>Error al cargar las especialidades.</p>
        <button class="btn btn-outline" onclick="loadSpecialties()">
          Reintentar
        </button>
      </div>
    `;
  }
}

// ================================================================
// FEATURED DOCTORS SECTION
// ================================================================

/**
 * Load and display featured doctors
 */
async function loadFeaturedDoctors() {
  const doctorsGrid = $('.doctors-grid');
  if (!doctorsGrid) return;
  
  try {
    // Show loading state
    showLoadingState(doctorsGrid, 'doctor', 6);
    
    const response = await doctorsService.getFeatured(6);
    const doctors = response.doctors || [];
    
    // Clear loading state
    doctorsGrid.innerHTML = '';
    
    // Display doctors
    doctors.forEach(doctor => {
      const doctorCard = createDoctorCard(doctor, 'grid');
      doctorsGrid.appendChild(doctorCard);
    });
    
    // Initialize favorite buttons
    initializeFavoriteButtons();
    
    // Animate cards into view
    animateCardsIn(doctorsGrid);
    
  } catch (error) {
    console.error('Error loading featured doctors:', error);
    doctorsGrid.innerHTML = `
      <div class="error-message">
        <p>Error al cargar los doctores destacados.</p>
        <button class="btn btn-outline" onclick="loadFeaturedDoctors()">
          Reintentar
        </button>
      </div>
    `;
  }
}

/**
 * Initialize favorite button functionality
 */
function initializeFavoriteButtons() {
  $$('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', function(event) {
      event.stopPropagation();
      toggleFavorite(this);
    });
  });
}

/**
 * Toggle doctor favorite status
 * @param {Element} button - Favorite button element
 */
async function toggleFavorite(button) {
  const doctorId = button.dataset.doctorId;
  
  // Check if user is authenticated
  if (!authService.isAuthenticated()) {
    showLoginModal();
    return;
  }
  
  try {
    button.disabled = true;
    
    // Toggle favorite status (simplified for demo)
    const isFavorited = button.classList.contains('favorited');
    
    if (isFavorited) {
      // Remove from favorites
      button.classList.remove('favorited');
      button.setAttribute('aria-label', 'Agregar a favoritos');
      showToast('Eliminado de favoritos', 'success');
    } else {
      // Add to favorites
      button.classList.add('favorited');
      button.setAttribute('aria-label', 'Eliminar de favoritos');
      showToast('Agregado a favoritos', 'success');
    }
    
  } catch (error) {
    console.error('Error toggling favorite:', error);
    showToast('Error al actualizar favoritos', 'error');
  } finally {
    button.disabled = false;
  }
}

// ================================================================
// ANIMATIONS
// ================================================================

/**
 * Initialize page animations
 */
function initializeAnimations() {
  // Animate hero stats on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateStats();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  
  const heroStats = $('.hero-stats');
  if (heroStats) {
    observer.observe(heroStats);
  }
  
  // Initialize floating cards animation
  initializeFloatingCards();
}

/**
 * Animate statistics numbers
 */
function animateStats() {
  $$('.stat-number').forEach(stat => {
    const targetValue = parseInt(stat.textContent.replace(/\D/g, ''));
    animateCountUp(stat, 0, targetValue, 2000);
  });
}

/**
 * Animate count up effect
 * @param {Element} element - Target element
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} duration - Animation duration
 */
function animateCountUp(element, start, end, duration) {
  const startTime = performance.now();
  const originalSuffix = element.textContent.replace(/[\d,]/g, '');
  
  function updateCount(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const current = Math.floor(start + (end - start) * progress);
    
    element.textContent = current.toLocaleString() + originalSuffix;
    
    if (progress < 1) {
      requestAnimationFrame(updateCount);
    }
  }
  
  requestAnimationFrame(updateCount);
}

/**
 * Initialize floating cards animation
 */
function initializeFloatingCards() {
  const heroImage = $('.hero-image');
  if (!heroImage) return;
  
  // Create floating cards for visual appeal
  const cards = [
    {
      content: {
        avatar: '👨‍⚕️',
        name: 'Dr. Martínez',
        specialty: 'Cardiólogo',
        rating: '★ 4.8'
      },
      className: 'floating-card-1'
    },
    {
      content: {
        avatar: '👩‍⚕️',
        name: 'Dra. García',
        specialty: 'Pediatra',
        rating: '★ 4.9'
      },
      className: 'floating-card-2'
    }
  ];
  
  cards.forEach(cardData => {
    const card = createElement('div', {
      className: `floating-card ${cardData.className}`
    }, [
      createElement('div', { className: 'card-content' }, [
        createElement('span', { className: 'card-avatar' }, cardData.content.avatar),
        createElement('div', { className: 'card-text' }, [
          createElement('span', { className: 'card-name' }, cardData.content.name),
          createElement('span', { className: 'card-specialty' }, cardData.content.specialty)
        ]),
        createElement('span', { className: 'card-rating' }, cardData.content.rating)
      ])
    ]);
    
    heroImage.appendChild(card);
  });
}

/**
 * Animate cards into view
 * @param {Element} container - Container with cards
 */
function animateCardsIn(container) {
  const cards = container.querySelectorAll('.specialty-card, .doctor-card');
  
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      card.style.transition = 'all 0.3s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, index * 100);
  });
}

// ================================================================
// LAZY LOADING
// ================================================================

/**
 * Initialize lazy loading for images
 */
function initializeLazyLoading() {
  // Use the utility function from utils.js
  lazyLoadImages();
  
  // Set up lazy loading for dynamically added images
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const lazyImages = node.querySelectorAll('img[data-src]');
            if (lazyImages.length > 0) {
              lazyLoadImages('img[data-src]');
            }
          }
        });
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// ================================================================
// SCROLL EFFECTS
// ================================================================

/**
 * Initialize scroll-based effects
 */
function initializeScrollEffects() {
  let ticking = false;
  
  function updateScrollEffects() {
    const scrollTop = window.pageYOffset;
    const header = $('.header-main');
    
    // Add/remove header shadow on scroll
    if (header) {
      if (scrollTop > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
    
    ticking = false;
  }
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateScrollEffects);
      ticking = true;
    }
  });
}

// Initialize scroll effects
document.addEventListener('DOMContentLoaded', initializeScrollEffects);

// ================================================================
// ERROR HANDLING
// ================================================================

/**
 * Handle global errors
 */
window.addEventListener('error', function(event) {
  console.error('Global error:', event.error);
  
  // Don't show toast for network errors in background
  if (!event.error.message.includes('Failed to fetch')) {
    showToast('Ha ocurrido un error inesperado', 'error');
  }
});

/**
 * Handle unhandled promise rejections
 */
window.addEventListener('unhandledrejection', function(event) {
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault();
});

// ================================================================
// EXPORT FOR ES6 MODULES
// ================================================================

// If using ES6 modules, uncomment the following:
/*
export {
  initializeLandingPage,
  loadSpecialties,
  loadFeaturedDoctors,
  handleHeroSearch
};
*/