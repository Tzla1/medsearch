/* ================================================================
   Med Search Platform - Profile Page JavaScript
   Doctor profile functionality and booking
   ================================================================ */

// ================================================================
// GLOBAL VARIABLES
// ================================================================

let doctorData = null;
let selectedDate = null;
let selectedTime = null;
let availableSlots = {};

// ================================================================
// PAGE INITIALIZATION
// ================================================================

document.addEventListener('DOMContentLoaded', function() {
  initializeProfilePage();
});

/**
 * Initialize profile page functionality
 */
async function initializeProfilePage() {
  try {
    // Get doctor ID from URL
    const doctorId = getUrlParam('id');
    if (!doctorId) {
      window.location.href = 'search.html';
      return;
    }
    
    // Initialize components
    initializeBackButton();
    initializeDatePicker();
    initializeBookingForm();
    
    // Load doctor data
    await loadDoctorProfile(doctorId);
    
    console.log('Profile page initialized successfully');
  } catch (error) {
    console.error('Error initializing profile page:', error);
    showProfileError();
  }
}

// ================================================================
// DOCTOR PROFILE LOADING
// ================================================================

/**
 * Load doctor profile data
 * @param {string|number} doctorId - Doctor ID
 */
async function loadDoctorProfile(doctorId) {
  try {
    showLoading('Cargando perfil del doctor...');
    
    // Fetch doctor data
    const response = await doctorsService.getById(doctorId);
    doctorData = response.doctor || response;
    
    // Update page content
    updateDoctorInfo();
    updateBreadcrumb();
    await loadAvailability();
    
    hideLoading();
    
  } catch (error) {
    console.error('Error loading doctor profile:', error);
    hideLoading();
    showProfileError();
  }
}

/**
 * Update doctor information on the page
 */
function updateDoctorInfo() {
  if (!doctorData) return;
  
  // Update page title
  document.title = `Dr. ${doctorData.name} - Med Search Platform`;
  
  // Update doctor header
  updateDoctorHeader();
  
  // Update doctor details
  updateDoctorDetails();
  
  // Update contact information
  updateContactInfo();
  
  // Update reviews section
  updateReviewsSection();
}

/**
 * Update doctor header section
 */
function updateDoctorHeader() {
  const doctorPhoto = $('.doctor-photo img');
  const doctorName = $('.doctor-name');
  const doctorSpecialty = $('.doctor-specialty');
  const verifiedBadge = $('.verified-badge');
  const ratingDisplay = $('.rating-display');
  const reviewsCount = $('.reviews-count');
  
  if (doctorPhoto) {
    doctorPhoto.src = doctorData.photo || 'assets/doctors/default-avatar.jpg';
    doctorPhoto.alt = `Dr. ${doctorData.name}`;
  }
  
  if (doctorName) {
    doctorName.textContent = `Dr. ${doctorData.name}`;
  }
  
  if (doctorSpecialty) {
    doctorSpecialty.textContent = doctorData.specialty;
  }
  
  if (verifiedBadge) {
    verifiedBadge.style.display = doctorData.isVerified ? 'block' : 'none';
  }
  
  if (ratingDisplay) {
    const rating = doctorData.rating || 0;
    ratingDisplay.innerHTML = generateStarsHTML(rating) + ` ${rating.toFixed(1)}`;
  }
  
  if (reviewsCount) {
    const count = doctorData.reviewsCount || 0;
    reviewsCount.textContent = `${count} ${count === 1 ? 'reseña' : 'reseñas'}`;
  }
}

/**
 * Update doctor details section
 */
function updateDoctorDetails() {
  // Bio
  const doctorBio = $('.doctor-bio');
  if (doctorBio) {
    doctorBio.textContent = doctorData.bio || 'No hay información adicional disponible.';
  }
  
  // Experience
  const experienceYears = $('.experience-years');
  if (experienceYears) {
    experienceYears.textContent = `${doctorData.experienceYears || 'N/A'} años de experiencia`;
  }
  
  // Education
  const educationList = $('.education-list');
  if (educationList && doctorData.education) {
    educationList.innerHTML = '';
    doctorData.education.forEach(edu => {
      const eduItem = createElement('li', { className: 'education-item' }, [
        createElement('strong', {}, edu.degree),
        createElement('br'),
        createElement('span', {}, edu.institution),
        createElement('br'),
        createElement('small', { className: 'text-muted' }, edu.year)
      ]);
      educationList.appendChild(eduItem);
    });
  }
  
  // Languages
  const languagesList = $('.languages-list');
  if (languagesList && doctorData.languages) {
    languagesList.innerHTML = '';
    doctorData.languages.forEach(lang => {
      const langBadge = createElement('span', { className: 'badge badge-gray' }, lang);
      languagesList.appendChild(langBadge);
    });
  }
  
  // Consultation fee
  const consultationFee = $('.consultation-fee');
  if (consultationFee) {
    consultationFee.textContent = formatCurrency(doctorData.consultationFee || 0);
  }
}

/**
 * Update contact information
 */
function updateContactInfo() {
  const addressText = $('.address-text');
  const phoneText = $('.phone-text');
  const emailText = $('.email-text');
  
  if (addressText) {
    const address = doctorData.address || 'Dirección no disponible';
    const city = doctorData.city || '';
    const fullAddress = city ? `${address}, ${city}` : address;
    addressText.textContent = fullAddress;
  }
  
  if (phoneText) {
    phoneText.textContent = formatPhone(doctorData.phone || 'No disponible');
  }
  
  if (emailText) {
    emailText.textContent = doctorData.email || 'No disponible';
  }
}

/**
 * Update reviews section
 */
function updateReviewsSection() {
  const reviewsList = $('.reviews-list');
  if (!reviewsList) return;
  
  // For demo purposes, generate sample reviews
  const sampleReviews = generateSampleReviews();
  
  reviewsList.innerHTML = '';
  
  if (sampleReviews.length === 0) {
    const noReviews = createElement('p', { className: 'text-muted' }, 
      'Aún no hay reseñas para este doctor.'
    );
    reviewsList.appendChild(noReviews);
    return;
  }
  
  sampleReviews.forEach(review => {
    const reviewCard = createReviewCard(review);
    reviewsList.appendChild(reviewCard);
  });
}

/**
 * Generate sample reviews for demo
 * @returns {Array} Sample reviews
 */
function generateSampleReviews() {
  if (!doctorData.reviewsCount || doctorData.reviewsCount === 0) {
    return [];
  }
  
  return [
    {
      id: 1,
      patientName: 'María González',
      rating: 5,
      comment: 'Excelente atención, muy profesional y dedicado. Resolvió todas mis dudas.',
      date: '2024-01-15',
      helpful: 12
    },
    {
      id: 2,
      patientName: 'Carlos Rodríguez',
      rating: 4,
      comment: 'Buen doctor, explicaciones claras. El tiempo de espera fue un poco largo.',
      date: '2024-01-10',
      helpful: 8
    },
    {
      id: 3,
      patientName: 'Ana Martínez',
      rating: 5,
      comment: 'Muy recomendado. Diagnóstico preciso y tratamiento efectivo.',
      date: '2024-01-05',
      helpful: 15
    }
  ].slice(0, Math.min(3, doctorData.reviewsCount));
}

/**
 * Create review card element
 * @param {Object} review - Review data
 * @returns {Element}
 */
function createReviewCard(review) {
  return createElement('div', { className: 'review-card' }, [
    createElement('div', { className: 'review-header' }, [
      createElement('div', { className: 'reviewer-info' }, [
        createElement('strong', { className: 'reviewer-name' }, review.patientName),
        createElement('div', { className: 'review-rating' }, 
          generateStarsHTML(review.rating)
        )
      ]),
      createElement('time', { className: 'review-date' }, formatDate(review.date))
    ]),
    createElement('div', { className: 'review-body' }, [
      createElement('p', { className: 'review-comment' }, review.comment)
    ]),
    createElement('div', { className: 'review-footer' }, [
      createElement('button', {
        className: 'btn-helpful',
        onclick: () => markReviewHelpful(review.id)
      }, [
        createElement('svg', {
          width: '16',
          height: '16',
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2'
        }, [
          createElement('path', { d: 'M7 10v12' }),
          createElement('path', { d: 'M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h3.73a2 2 0 0 1 1.92 2.56z' })
        ]),
        createElement('span', {}, `Útil (${review.helpful})`)
      ])
    ])
  ]);
}

/**
 * Generate stars HTML
 * @param {number} rating - Rating value
 * @returns {string}
 */
function generateStarsHTML(rating) {
  let starsHTML = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      starsHTML += '<span class="star star-full">★</span>';
    } else if (i - 0.5 <= rating) {
      starsHTML += '<span class="star star-half">☆</span>';
    } else {
      starsHTML += '<span class="star star-empty">☆</span>';
    }
  }
  return starsHTML;
}

// ================================================================
// BREADCRUMB UPDATE
// ================================================================

/**
 * Update breadcrumb navigation
 */
function updateBreadcrumb() {
  const breadcrumbCurrent = $('.breadcrumb-current');
  if (breadcrumbCurrent && doctorData) {
    breadcrumbCurrent.textContent = `Dr. ${doctorData.name}`;
  }
}

// ================================================================
// BACK BUTTON
// ================================================================

/**
 * Initialize back button functionality
 */
function initializeBackButton() {
  const backButton = $('.back-link');
  if (backButton) {
    backButton.addEventListener('click', function(event) {
      event.preventDefault();
      
      // Check if there's a referrer from our site
      if (document.referrer && document.referrer.includes(window.location.host)) {
        window.history.back();
      } else {
        window.location.href = 'search.html';
      }
    });
  }
}

// ================================================================
// APPOINTMENT BOOKING
// ================================================================

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
  
  // Handle date change
  dateInput.addEventListener('change', function() {
    selectedDate = this.value;
    loadAvailableTimes(selectedDate);
  });
}

/**
 * Load doctor availability
 */
async function loadAvailability() {
  const dateInput = $('#appointment-date');
  if (!dateInput || !doctorData) return;
  
  try {
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const defaultDate = tomorrow.toISOString().split('T')[0];
    
    dateInput.value = defaultDate;
    selectedDate = defaultDate;
    
    await loadAvailableTimes(defaultDate);
    
  } catch (error) {
    console.error('Error loading availability:', error);
  }
}

/**
 * Load available time slots for a date
 * @param {string} date - Selected date
 */
async function loadAvailableTimes(date) {
  const timeSlotsContainer = $('.time-slots');
  if (!timeSlotsContainer || !doctorData) return;
  
  try {
    // Show loading state
    timeSlotsContainer.innerHTML = '<div class="loading-times">Cargando horarios...</div>';
    
    // For demo purposes, generate sample time slots
    // In real implementation, this would call API
    const timeSlots = generateSampleTimeSlots(date);
    
    // Render time slots
    renderTimeSlots(timeSlots);
    
  } catch (error) {
    console.error('Error loading time slots:', error);
    timeSlotsContainer.innerHTML = '<div class="error-times">Error al cargar horarios disponibles.</div>';
  }
}

/**
 * Generate sample time slots for demo
 * @param {string} date - Selected date
 * @returns {Array} Time slots
 */
function generateSampleTimeSlots(date) {
  const dayOfWeek = new Date(date).getDay();
  
  // No appointments on Sundays
  if (dayOfWeek === 0) {
    return [];
  }
  
  const baseSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];
  
  // Randomly mark some slots as unavailable
  return baseSlots.map(time => ({
    time,
    available: Math.random() > 0.3, // 70% chance of being available
    price: doctorData.consultationFee || 800
  }));
}

/**
 * Render time slots
 * @param {Array} timeSlots - Available time slots
 */
function renderTimeSlots(timeSlots) {
  const timeSlotsContainer = $('.time-slots');
  if (!timeSlotsContainer) return;
  
  timeSlotsContainer.innerHTML = '';
  
  if (timeSlots.length === 0) {
    const noSlots = createElement('div', { className: 'no-slots' }, 
      'No hay horarios disponibles para esta fecha. Selecciona otra fecha.'
    );
    timeSlotsContainer.appendChild(noSlots);
    return;
  }
  
  const availableSlots = timeSlots.filter(slot => slot.available);
  
  if (availableSlots.length === 0) {
    const noAvailable = createElement('div', { className: 'no-slots' }, 
      'Todos los horarios están ocupados para esta fecha.'
    );
    timeSlotsContainer.appendChild(noAvailable);
    return;
  }
  
  // Group slots by time period
  const morningSlots = availableSlots.filter(slot => parseInt(slot.time) < 12);
  const afternoonSlots = availableSlots.filter(slot => parseInt(slot.time) >= 12);
  
  if (morningSlots.length > 0) {
    const morningSection = createElement('div', { className: 'time-period' }, [
      createElement('h4', { className: 'period-title' }, 'Mañana'),
      createElement('div', { className: 'slots-grid' })
    ]);
    
    const morningGrid = morningSection.querySelector('.slots-grid');
    morningSlots.forEach(slot => {
      const slotButton = createTimeSlotButton(slot);
      morningGrid.appendChild(slotButton);
    });
    
    timeSlotsContainer.appendChild(morningSection);
  }
  
  if (afternoonSlots.length > 0) {
    const afternoonSection = createElement('div', { className: 'time-period' }, [
      createElement('h4', { className: 'period-title' }, 'Tarde'),
      createElement('div', { className: 'slots-grid' })
    ]);
    
    const afternoonGrid = afternoonSection.querySelector('.slots-grid');
    afternoonSlots.forEach(slot => {
      const slotButton = createTimeSlotButton(slot);
      afternoonGrid.appendChild(slotButton);
    });
    
    timeSlotsContainer.appendChild(afternoonSection);
  }
}

/**
 * Create time slot button
 * @param {Object} slot - Time slot data
 * @returns {Element}
 */
function createTimeSlotButton(slot) {
  return createElement('button', {
    className: 'time-slot-btn',
    dataset: { time: slot.time },
    onclick: () => selectTimeSlot(slot.time)
  }, [
    createElement('span', { className: 'slot-time' }, slot.time),
    createElement('span', { className: 'slot-price' }, formatCurrency(slot.price))
  ]);
}

/**
 * Select a time slot
 * @param {string} time - Selected time
 */
function selectTimeSlot(time) {
  // Update UI
  $$('.time-slot-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  
  const selectedBtn = $(`.time-slot-btn[data-time="${time}"]`);
  if (selectedBtn) {
    selectedBtn.classList.add('selected');
  }
  
  selectedTime = time;
  
  // Enable booking button
  const bookButton = $('.btn-book-appointment');
  if (bookButton) {
    bookButton.disabled = false;
  }
  
  // Update booking summary
  updateBookingSummary();
}

/**
 * Update booking summary
 */
function updateBookingSummary() {
  const summaryDate = $('.summary-date');
  const summaryTime = $('.summary-time');
  const summaryPrice = $('.summary-price');
  
  if (summaryDate && selectedDate) {
    summaryDate.textContent = formatDate(selectedDate);
  }
  
  if (summaryTime && selectedTime) {
    summaryTime.textContent = selectedTime;
  }
  
  if (summaryPrice && doctorData) {
    summaryPrice.textContent = formatCurrency(doctorData.consultationFee || 0);
  }
}

/**
 * Initialize booking form
 */
function initializeBookingForm() {
  const bookButton = $('.btn-book-appointment');
  const favoriteButton = $('.btn-add-favorite');
  
  if (bookButton) {
    bookButton.addEventListener('click', handleBookAppointment);
  }
  
  if (favoriteButton) {
    favoriteButton.addEventListener('click', handleAddToFavorites);
  }
}

/**
 * Handle appointment booking
 */
async function handleBookAppointment() {
  // Check authentication
  if (!authService.isAuthenticated()) {
    showLoginModal();
    return;
  }
  
  if (!selectedDate || !selectedTime) {
    showToast('Selecciona una fecha y hora para la cita', 'warning');
    return;
  }
  
  try {
    const bookButton = $('.btn-book-appointment');
    if (bookButton) {
      bookButton.disabled = true;
      bookButton.textContent = 'Procesando...';
    }
    
    // Create appointment data
    const appointmentData = {
      doctorId: doctorData.id,
      date: selectedDate,
      time: selectedTime,
      type: 'consultation',
      notes: ''
    };
    
    // For demo purposes, simulate booking
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Show success message
    showBookingSuccess();
    
  } catch (error) {
    console.error('Error booking appointment:', error);
    showToast('Error al agendar la cita. Intenta nuevamente.', 'error');
  } finally {
    const bookButton = $('.btn-book-appointment');
    if (bookButton) {
      bookButton.disabled = false;
      bookButton.textContent = 'Agendar Cita';
    }
  }
}

/**
 * Show booking success modal
 */
function showBookingSuccess() {
  const successModal = createModal(
    'booking-success-modal',
    'Cita Agendada',
    createElement('div', { className: 'booking-success-content' }, [
      createElement('div', { className: 'success-icon' }, '✅'),
      createElement('h4', {}, 'Tu cita ha sido agendada exitosamente'),
      createElement('div', { className: 'appointment-details' }, [
        createElement('p', {}, `Doctor: Dr. ${doctorData.name}`),
        createElement('p', {}, `Fecha: ${formatDate(selectedDate)}`),
        createElement('p', {}, `Hora: ${selectedTime}`),
        createElement('p', {}, `Costo: ${formatCurrency(doctorData.consultationFee)}`)
      ]),
      createElement('p', { className: 'success-note' }, 
        'Recibirás una confirmación por email con los detalles de tu cita.'
      )
    ]),
    [
      createElement('button', {
        className: 'btn btn-primary',
        onclick: () => {
          closeModal('booking-success-modal');
          window.location.href = 'dashboard.html'; // Would redirect to user dashboard
        }
      }, 'Ver mis citas'),
      createElement('button', {
        className: 'btn btn-outline',
        onclick: () => closeModal('booking-success-modal')
      }, 'Cerrar')
    ]
  );
  
  document.body.appendChild(successModal);
  openModal('booking-success-modal');
}

/**
 * Handle add to favorites
 */
async function handleAddToFavorites() {
  if (!authService.isAuthenticated()) {
    showLoginModal();
    return;
  }
  
  try {
    const favoriteButton = $('.btn-add-favorite');
    if (!favoriteButton) return;
    
    favoriteButton.disabled = true;
    
    const isFavorited = favoriteButton.classList.contains('favorited');
    
    if (isFavorited) {
      favoriteButton.classList.remove('favorited');
      favoriteButton.innerHTML = '<svg>...</svg> Agregar a favoritos';
      showToast('Eliminado de favoritos', 'success');
    } else {
      favoriteButton.classList.add('favorited');
      favoriteButton.innerHTML = '<svg>...</svg> En favoritos';
      showToast('Agregado a favoritos', 'success');
    }
    
  } catch (error) {
    console.error('Error updating favorites:', error);
    showToast('Error al actualizar favoritos', 'error');
  } finally {
    const favoriteButton = $('.btn-add-favorite');
    if (favoriteButton) {
      favoriteButton.disabled = false;
    }
  }
}

// ================================================================
// ERROR HANDLING
// ================================================================

/**
 * Show profile error page
 */
function showProfileError() {
  const mainContent = $('main');
  if (mainContent) {
    mainContent.innerHTML = `
      <div class="error-container">
        <div class="error-content">
          <h1>Doctor no encontrado</h1>
          <p>El perfil del doctor que buscas no existe o no está disponible.</p>
          <div class="error-actions">
            <a href="search.html" class="btn btn-primary">Buscar doctores</a>
            <a href="index.html" class="btn btn-outline">Volver al inicio</a>
          </div>
        </div>
      </div>
    `;
  }
}

/**
 * Mark review as helpful
 * @param {number} reviewId - Review ID
 */
function markReviewHelpful(reviewId) {
  // Placeholder for marking review as helpful
  showToast('Gracias por tu feedback', 'success');
}

// ================================================================
// EXPORT FOR ES6 MODULES
// ================================================================

// If using ES6 modules, uncomment the following:
/*
export {
  initializeProfilePage,
  loadDoctorProfile,
  selectTimeSlot,
  handleBookAppointment
};
*/