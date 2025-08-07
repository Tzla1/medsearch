/* ================================================================
   Med Search Platform - Components JavaScript
   Reusable UI components and widgets
   ================================================================ */

// ================================================================
// DOCTOR CARD COMPONENT
// ================================================================

/**
 * Create a doctor card element
 * @param {Object} doctor - Doctor data
 * @param {string} variant - Card variant ('list' or 'grid')
 * @returns {Element}
 */
function createDoctorCard(doctor, variant = 'list') {
  const card = createElement('div', {
    className: `doctor-card doctor-card-${variant}`,
    dataset: { doctorId: doctor.id }
  });

  // Doctor photo
  const photo = createElement('div', { className: 'doctor-photo' }, [
    createElement('img', {
      src: doctor.photo || 'assets/doctors/default-avatar.jpg',
      alt: `Dr. ${doctor.name}`,
      className: 'doctor-img',
      loading: 'lazy',
      onerror: function() {
        this.src = 'assets/doctors/default-avatar.jpg';
      }
    }),
    doctor.isVerified ? createElement('div', {
      className: 'verified-badge',
      title: 'Médico verificado'
    }, '✓') : null
  ].filter(Boolean));

  // Doctor info
  const info = createElement('div', { className: 'doctor-info' }, [
    createElement('div', { className: 'doctor-header' }, [
      createElement('h3', { className: 'doctor-name' }, doctor.name),
      createElement('span', { className: 'doctor-specialty' }, doctor.specialty)
    ]),
    
    createElement('div', { className: 'doctor-details' }, [
      // Rating
      createElement('div', { className: 'doctor-rating' }, [
        createElement('div', { className: 'rating-stars' }, 
          generateStars(doctor.rating || 0)
        ),
        createElement('span', { className: 'rating-text' }, 
          `${doctor.rating || 'S/C'} (${doctor.reviewsCount || 0} reseñas)`
        )
      ]),
      
      // Location (if available)
      doctor.location ? createElement('div', { className: 'doctor-location' }, [
        createElement('svg', {
          width: '16',
          height: '16',
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2'
        }, [
          createElement('path', { d: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' }),
          createElement('circle', { cx: '12', cy: '10', r: '3' })
        ]),
        createElement('span', {}, doctor.location)
      ]) : null,
      
      // Consultation fee
      createElement('div', { className: 'consultation-fee' }, [
        createElement('span', { className: 'fee-label' }, 'Consulta desde:'),
        createElement('span', { className: 'fee-amount' }, 
          formatCurrency(doctor.consultationFee || 0)
        )
      ])
    ].filter(Boolean))
  ]);

  // Action buttons
  const actions = createElement('div', { className: 'doctor-actions' }, [
    createElement('button', {
      className: 'btn btn-outline btn-small favorite-btn',
      dataset: { doctorId: doctor.id },
      'aria-label': 'Agregar a favoritos'
    }, [
      createElement('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '2'
      }, [
        createElement('path', { d: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' })
      ])
    ]),
    
    createElement('button', {
      className: 'btn btn-primary btn-small',
      onclick: () => viewDoctorProfile(doctor.id)
    }, 'Ver perfil'),
    
    createElement('button', {
      className: 'btn btn-success btn-small',
      onclick: () => bookAppointment(doctor.id)
    }, 'Agendar cita')
  ]);

  card.appendChild(photo);
  card.appendChild(info);
  card.appendChild(actions);

  return card;
}

/**
 * Generate star rating elements
 * @param {number} rating - Rating value (0-5)
 * @returns {Array} Array of star elements
 */
function generateStars(rating) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  
  for (let i = 0; i < 5; i++) {
    const star = createElement('span', { className: 'star' });
    
    if (i < fullStars) {
      star.classList.add('star-full');
      star.textContent = '★';
    } else if (i === fullStars && hasHalfStar) {
      star.classList.add('star-half');
      star.textContent = '☆';
    } else {
      star.classList.add('star-empty');
      star.textContent = '☆';
    }
    
    stars.push(star);
  }
  
  return stars;
}

// ================================================================
// SPECIALTY CARD COMPONENT
// ================================================================

/**
 * Create a specialty card element
 * @param {Object} specialty - Specialty data
 * @returns {Element}
 */
function createSpecialtyCard(specialty) {
  return createElement('div', {
    className: 'specialty-card',
    dataset: { specialtyId: specialty.id },
    onclick: () => searchBySpecialty(specialty.id)
  }, [
    createElement('div', { className: 'specialty-icon' }, specialty.icon || '🩺'),
    createElement('h3', { className: 'specialty-name' }, specialty.name),
    createElement('p', { className: 'specialty-description' }, 
      truncate(specialty.description || '', 80)
    ),
    createElement('div', { className: 'specialty-stats' }, [
      createElement('span', { className: 'doctor-count' }, 
        `${specialty.doctorCount || 0} doctores`
      ),
      specialty.averageRating ? createElement('span', { className: 'rating-avg' }, 
        `★ ${specialty.averageRating.toFixed(1)}`
      ) : null
    ].filter(Boolean)),
    createElement('div', { className: 'specialty-cta' }, [
      createElement('span', { className: 'cta-text' }, 'Ver especialistas →')
    ])
  ]);
}

// ================================================================
// APPOINTMENT CARD COMPONENT
// ================================================================

/**
 * Create an appointment card element
 * @param {Object} appointment - Appointment data
 * @returns {Element}
 */
function createAppointmentCard(appointment) {
  const statusClasses = {
    'scheduled': 'badge-warning',
    'confirmed': 'badge-success',
    'completed': 'badge-gray',
    'cancelled': 'badge-error'
  };

  const statusLabels = {
    'scheduled': 'Programada',
    'confirmed': 'Confirmada',
    'completed': 'Completada',
    'cancelled': 'Cancelada'
  };

  return createElement('div', {
    className: 'appointment-card card',
    dataset: { appointmentId: appointment.id }
  }, [
    createElement('div', { className: 'card-header' }, [
      createElement('div', { className: 'appointment-header' }, [
        createElement('h4', { className: 'card-title' }, 
          `Dr. ${appointment.doctorName}`
        ),
        createElement('span', {
          className: `badge ${statusClasses[appointment.status] || 'badge-gray'}`
        }, statusLabels[appointment.status] || appointment.status)
      ])
    ]),
    
    createElement('div', { className: 'card-body' }, [
      createElement('div', { className: 'appointment-details' }, [
        createElement('div', { className: 'detail-item' }, [
          createElement('span', { className: 'detail-label' }, 'Especialidad:'),
          createElement('span', { className: 'detail-value' }, appointment.specialty)
        ]),
        createElement('div', { className: 'detail-item' }, [
          createElement('span', { className: 'detail-label' }, 'Fecha:'),
          createElement('span', { className: 'detail-value' }, 
            formatDate(appointment.date)
          )
        ]),
        createElement('div', { className: 'detail-item' }, [
          createElement('span', { className: 'detail-label' }, 'Hora:'),
          createElement('span', { className: 'detail-value' }, appointment.time)
        ]),
        appointment.location ? createElement('div', { className: 'detail-item' }, [
          createElement('span', { className: 'detail-label' }, 'Ubicación:'),
          createElement('span', { className: 'detail-value' }, appointment.location)
        ]) : null
      ].filter(Boolean))
    ]),
    
    createElement('div', { className: 'card-footer' }, [
      createElement('div', { className: 'appointment-actions' }, [
        appointment.status === 'scheduled' ? [
          createElement('button', {
            className: 'btn btn-outline btn-small',
            onclick: () => rescheduleAppointment(appointment.id)
          }, 'Reprogramar'),
          createElement('button', {
            className: 'btn btn-error btn-small',
            onclick: () => cancelAppointment(appointment.id)
          }, 'Cancelar')
        ] : [],
        
        appointment.status === 'completed' && !appointment.hasReview ? 
          createElement('button', {
            className: 'btn btn-primary btn-small',
            onclick: () => leaveReview(appointment.doctorId)
          }, 'Dejar reseña') : null
      ].flat().filter(Boolean))
    ])
  ]);
}

// ================================================================
// SEARCH FILTER COMPONENT
// ================================================================

/**
 * Create a search filter section
 * @param {string} title - Filter section title
 * @param {Array} options - Filter options
 * @param {string} type - Filter type ('checkbox', 'radio', 'range')
 * @param {string} name - Filter name
 * @returns {Element}
 */
function createFilterSection(title, options, type = 'checkbox', name) {
  const section = createElement('div', { className: 'filter-section' }, [
    createElement('h4', { className: 'filter-title' }, title),
    createElement('div', { className: 'filter-options' })
  ]);

  const optionsContainer = section.querySelector('.filter-options');

  if (type === 'range') {
    // Price range slider
    const rangeContainer = createElement('div', { className: 'range-container' }, [
      createElement('div', { className: 'range-labels' }, [
        createElement('span', { className: 'range-min' }, formatCurrency(options.min)),
        createElement('span', { className: 'range-max' }, formatCurrency(options.max))
      ]),
      createElement('input', {
        type: 'range',
        className: 'range-slider',
        name: name,
        min: options.min,
        max: options.max,
        value: options.value || options.min,
        oninput: function() {
          updateRangeLabel(this);
          triggerFilterChange();
        }
      }),
      createElement('div', { className: 'range-value' }, 
        formatCurrency(options.value || options.min)
      )
    ]);
    
    optionsContainer.appendChild(rangeContainer);
  } else {
    // Checkbox or radio options
    options.forEach(option => {
      const optionElement = createElement('label', {
        className: `filter-${type}`
      }, [
        createElement('input', {
          type: type,
          name: name,
          value: option.value,
          checked: option.checked || false,
          onchange: triggerFilterChange
        }),
        createElement('span', {
          className: type === 'checkbox' ? 'checkmark' : 'radio-mark'
        }),
        createElement('span', { className: 'option-text' }, [
          option.label,
          option.count ? createElement('span', { className: 'option-count' }, 
            ` (${option.count})`
          ) : null
        ].filter(Boolean))
      ]);
      
      optionsContainer.appendChild(optionElement);
    });
  }

  return section;
}

// ================================================================
// PAGINATION COMPONENT
// ================================================================

/**
 * Create pagination navigation
 * @param {Object} paginationData - Pagination information
 * @returns {Element}
 */
function createPagination(paginationData) {
  const { currentPage, totalPages, hasNext, hasPrev } = paginationData;
  
  const pagination = createElement('nav', {
    className: 'pagination-nav',
    'aria-label': 'Navegación de páginas'
  });

  // Previous button
  if (hasPrev) {
    pagination.appendChild(
      createElement('button', {
        className: 'btn btn-outline pagination-btn',
        onclick: () => goToPage(currentPage - 1)
      }, [
        createElement('svg', {
          width: '16',
          height: '16',
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2'
        }, [
          createElement('polyline', { points: '15,18 9,12 15,6' })
        ]),
        createElement('span', {}, 'Anterior')
      ])
    );
  }

  // Page numbers
  const pageNumbers = createElement('div', { className: 'page-numbers' });
  
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);

  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = createElement('button', {
      className: `btn page-btn ${i === currentPage ? 'active' : 'btn-outline'}`,
      onclick: () => goToPage(i)
    }, i.toString());
    
    pageNumbers.appendChild(pageBtn);
  }
  
  pagination.appendChild(pageNumbers);

  // Next button
  if (hasNext) {
    pagination.appendChild(
      createElement('button', {
        className: 'btn btn-outline pagination-btn',
        onclick: () => goToPage(currentPage + 1)
      }, [
        createElement('span', {}, 'Siguiente'),
        createElement('svg', {
          width: '16',
          height: '16',
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2'
        }, [
          createElement('polyline', { points: '9,18 15,12 9,6' })
        ])
      ])
    );
  }

  return pagination;
}

// ================================================================
// MODAL COMPONENT
// ================================================================

/**
 * Create a modal component
 * @param {string} id - Modal ID
 * @param {string} title - Modal title
 * @param {Element|string} content - Modal content
 * @param {Array} actions - Action buttons
 * @returns {Element}
 */
function createModal(id, title, content, actions = []) {
  const modal = createElement('div', {
    id: id,
    className: 'modal',
    'aria-hidden': 'true',
    'aria-labelledby': `${id}-title`,
    role: 'dialog'
  }, [
    createElement('div', {
      className: 'modal-overlay',
      onclick: () => closeModal(id)
    }),
    createElement('div', { className: 'modal-content' }, [
      createElement('div', { className: 'modal-header' }, [
        createElement('h3', {
          id: `${id}-title`,
          className: 'modal-title'
        }, title),
        createElement('button', {
          className: 'modal-close',
          onclick: () => closeModal(id),
          'aria-label': 'Cerrar modal'
        }, '✕')
      ]),
      createElement('div', { className: 'modal-body' }, 
        typeof content === 'string' ? content : [content]
      ),
      actions.length > 0 ? createElement('div', { className: 'modal-footer' }, 
        actions
      ) : null
    ].filter(Boolean))
  ]);

  return modal;
}

/**
 * Open modal
 * @param {string} modalId - Modal ID
 */
function openModal(modalId) {
  const modal = $(`#${modalId}`);
  if (modal) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // Focus first focusable element
    const firstFocusable = modal.querySelector('button, input, select, textarea, [tabindex]');
    if (firstFocusable) {
      firstFocusable.focus();
    }
  }
}

/**
 * Close modal
 * @param {string} modalId - Modal ID
 */
function closeModal(modalId) {
  const modal = $(`#${modalId}`);
  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

// ================================================================
// LOADING STATES COMPONENT
// ================================================================

/**
 * Create skeleton loading card
 * @param {string} type - Type of skeleton ('doctor', 'specialty', 'appointment')
 * @returns {Element}
 */
function createSkeletonCard(type = 'doctor') {
  const skeleton = createElement('div', {
    className: `skeleton-card skeleton-${type}`
  });

  if (type === 'doctor') {
    skeleton.innerHTML = `
      <div class="skeleton-photo animate-pulse"></div>
      <div class="skeleton-content">
        <div class="skeleton-line skeleton-title animate-pulse"></div>
        <div class="skeleton-line skeleton-subtitle animate-pulse"></div>
        <div class="skeleton-line skeleton-text animate-pulse"></div>
        <div class="skeleton-buttons">
          <div class="skeleton-button animate-pulse"></div>
          <div class="skeleton-button animate-pulse"></div>
        </div>
      </div>
    `;
  } else if (type === 'specialty') {
    skeleton.innerHTML = `
      <div class="skeleton-icon animate-pulse"></div>
      <div class="skeleton-line skeleton-title animate-pulse"></div>
      <div class="skeleton-line skeleton-text animate-pulse"></div>
      <div class="skeleton-line skeleton-text animate-pulse"></div>
    `;
  }

  return skeleton;
}

/**
 * Show loading state for a container
 * @param {Element} container - Container element
 * @param {string} type - Type of skeleton
 * @param {number} count - Number of skeleton items
 */
function showLoadingState(container, type = 'doctor', count = 6) {
  container.innerHTML = '';
  
  for (let i = 0; i < count; i++) {
    container.appendChild(createSkeletonCard(type));
  }
}

// ================================================================
// UTILITY FUNCTIONS FOR COMPONENTS
// ================================================================

/**
 * Update range slider label
 * @param {Element} slider - Range slider element
 */
function updateRangeLabel(slider) {
  const valueDisplay = slider.parentNode.querySelector('.range-value');
  if (valueDisplay) {
    valueDisplay.textContent = formatCurrency(parseInt(slider.value));
  }
}

/**
 * Trigger filter change event
 */
function triggerFilterChange() {
  const event = new CustomEvent('filtersChanged', {
    detail: getActiveFilters()
  });
  document.dispatchEvent(event);
}

/**
 * Get active filters from the page
 * @returns {Object} Active filters
 */
function getActiveFilters() {
  const filters = {};
  
  // Get checkbox filters
  $$('.filter-checkbox input:checked').forEach(input => {
    if (!filters[input.name]) filters[input.name] = [];
    filters[input.name].push(input.value);
  });
  
  // Get radio filters
  $$('.filter-radio input:checked').forEach(input => {
    filters[input.name] = input.value;
  });
  
  // Get range filters
  $$('.range-slider').forEach(input => {
    filters[input.name] = parseInt(input.value);
  });
  
  return filters;
}

/**
 * Navigate to doctor profile
 * @param {string|number} doctorId - Doctor ID
 */
function viewDoctorProfile(doctorId) {
  window.location.href = `profile.html?id=${doctorId}`;
}

/**
 * Start booking appointment flow
 * @param {string|number} doctorId - Doctor ID
 */
function bookAppointment(doctorId) {
  // Check if user is authenticated
  if (!authService.isAuthenticated()) {
    showLoginModal();
    return;
  }
  
  window.location.href = `booking.html?doctor=${doctorId}`;
}

/**
 * Search by specialty
 * @param {string|number} specialtyId - Specialty ID
 */
function searchBySpecialty(specialtyId) {
  window.location.href = `search.html?specialty=${specialtyId}`;
}

/**
 * Navigate to specific page
 * @param {number} page - Page number
 */
function goToPage(page) {
  const url = new URL(window.location);
  url.searchParams.set('page', page);
  window.location.href = url.toString();
}

/**
 * Show login modal if not authenticated
 */
function showLoginModal() {
  const loginModal = createModal(
    'login-modal',
    'Iniciar Sesión',
    createElement('div', {}, [
      createElement('p', {}, 'Necesitas iniciar sesión para agendar una cita.'),
      createElement('div', { className: 'auth-buttons' }, [
        createElement('a', {
          href: 'login.html',
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
  openModal('login-modal');
}

// ================================================================
// PLACEHOLDER FUNCTIONS (to be implemented in page-specific files)
// ================================================================

function rescheduleAppointment(appointmentId) {
  console.log('Reschedule appointment:', appointmentId);
  showToast('Función de reprogramación en desarrollo', 'info');
}

function cancelAppointment(appointmentId) {
  console.log('Cancel appointment:', appointmentId);
  showToast('Función de cancelación en desarrollo', 'info');
}

function leaveReview(doctorId) {
  console.log('Leave review for doctor:', doctorId);
  showToast('Función de reseñas en desarrollo', 'info');
}

function bookAppointment(doctorId) {
  console.log('Book appointment with doctor:', doctorId);
  window.location.href = `appointment.html?doctorId=${doctorId}`;
}

function viewDoctorProfile(doctorId) {
  console.log('View doctor profile:', doctorId);
  // For now, redirect to booking page
  window.location.href = `appointment.html?doctorId=${doctorId}`;
}

function searchBySpecialty(specialtyId) {
  console.log('Search by specialty:', specialtyId);
  window.location.href = `search.html?specialty=${specialtyId}`;
}

// ================================================================
// EXPORT COMPONENTS (if using ES6 modules)
// ================================================================

// If using ES6 modules, uncomment the following:
/*
export {
  createDoctorCard,
  createSpecialtyCard,
  createAppointmentCard,
  createFilterSection,
  createPagination,
  createModal,
  createSkeletonCard,
  openModal,
  closeModal,
  showLoadingState,
  viewDoctorProfile,
  bookAppointment,
  searchBySpecialty
};
*/