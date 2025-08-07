import Swal from 'sweetalert2';

// Configuración de tema personalizado para MedSearch
const customTheme = {
  customClass: {
    popup: 'rounded-2xl shadow-2xl',
    header: 'border-b border-gray-100 pb-4',
    title: 'text-2xl font-bold',
    content: 'text-base',
    confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg',
    cancelButton: 'bg-gray-400 hover:bg-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg mr-3',
    denyButton: 'bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg'
  },
  buttonsStyling: false
};

// Alerta de error dramática
export const showDramaticError = (title: string, message: string, callback?: () => void) => {
  return Swal.fire({
    ...customTheme,
    icon: 'error',
    title: '🚨 ' + title,
    html: `
      <div class="text-gray-700 mb-4">
        <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-red-800 font-semibold">${message}</p>
            </div>
          </div>
        </div>
        <p class="text-sm text-gray-500">Por favor, revise la información e inténtelo nuevamente.</p>
      </div>
    `,
    confirmButtonText: '🔄 Reintentar',
    showClass: {
      popup: 'animate__animated animate__shakeX animate__faster'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOut animate__faster'
    }
  }).then((result) => {
    if (result.isConfirmed && callback) {
      callback();
    }
  });
};

// Alerta de éxito dramática
export const showDramaticSuccess = (title: string, message: string, callback?: () => void) => {
  return Swal.fire({
    ...customTheme,
    icon: 'success',
    title: '✅ ' + title,
    html: `
      <div class="text-gray-700 mb-4">
        <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg mb-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-green-800 font-semibold">${message}</p>
            </div>
          </div>
        </div>
      </div>
    `,
    confirmButtonText: '🎉 ¡Perfecto!',
    timer: 3000,
    timerProgressBar: true,
    showClass: {
      popup: 'animate__animated animate__bounceIn animate__faster'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOut animate__faster'
    }
  }).then((result) => {
    if (callback) {
      callback();
    }
  });
};

// Alerta de advertencia dramática
export const showDramaticWarning = (title: string, message: string, confirmText: string = 'Continuar', callback?: () => void) => {
  return Swal.fire({
    ...customTheme,
    icon: 'warning',
    title: '⚠️ ' + title,
    html: `
      <div class="text-gray-700 mb-4">
        <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg mb-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-yellow-800 font-semibold">${message}</p>
            </div>
          </div>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancelar',
    showClass: {
      popup: 'animate__animated animate__pulse animate__faster'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOut animate__faster'
    }
  }).then((result) => {
    if (result.isConfirmed && callback) {
      callback();
    }
  });
};

// Alerta de confirmación dramática para acciones peligrosas
export const showDangerousConfirmation = (title: string, message: string, confirmText: string = 'Sí, eliminar', callback?: () => void) => {
  return Swal.fire({
    ...customTheme,
    icon: 'warning',
    title: '🔥 ' + title,
    html: `
      <div class="text-gray-700 mb-4">
        <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd" />
                <path fill-rule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h.01a1 1 0 100-2H10zm3 0a1 1 0 000 2h.01a1 1 0 100-2H13z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-red-800 font-bold">${message}</p>
              <p class="text-red-600 text-sm mt-2">Esta acción no se puede deshacer.</p>
            </div>
          </div>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'No, cancelar',
    reverseButtons: true,
    showClass: {
      popup: 'animate__animated animate__shakeX animate__faster'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOut animate__faster'
    }
  }).then((result) => {
    if (result.isConfirmed && callback) {
      callback();
    }
  });
};

// Alerta de información con estilo médico
export const showMedicalInfo = (title: string, message: string, callback?: () => void) => {
  return Swal.fire({
    ...customTheme,
    icon: 'info',
    title: '🏥 ' + title,
    html: `
      <div class="text-gray-700 mb-4">
        <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-blue-800 font-semibold">${message}</p>
              <p class="text-blue-600 text-sm mt-2">MedSearch - Universidad Cuauhtémoc</p>
            </div>
          </div>
        </div>
      </div>
    `,
    confirmButtonText: 'Entendido',
    showClass: {
      popup: 'animate__animated animate__fadeInDown animate__faster'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOut animate__faster'
    }
  }).then((result) => {
    if (callback) {
      callback();
    }
  });
};

// Toast notification para mensajes rápidos
export const showToast = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
  return Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  }).fire({
    icon: type as any,
    title: message,
    customClass: {
      popup: 'rounded-lg shadow-xl border-0'
    }
  });
};