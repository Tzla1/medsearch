import React, { useState, useEffect } from 'react';
import { CalendarIcon, ClockIcon, MapPinIcon, StarIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { Toast } from '../components/Toast';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  experience: string;
  price: string;
  image: string;
  location: string;
}

interface AppointmentData {
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientAge: string;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
  notes: string;
  symptoms: string;
  specialtyAnswers: { [key: string]: string };
}

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  '05:00 PM', '05:30 PM'
];

const appointmentReasons = [
  'Consulta general',
  'Seguimiento',
  'Revisión médica',
  'Dolor o molestia',
  'Chequeo preventivo',
  'Resultados de estudios',
  'Segunda opinión',
  'Otro'
];

const specialtyQuestions = {
  'Cardiología': [
    '¿Tiene dolor en el pecho?',
    '¿Experimenta palpitaciones o ritmo cardíaco irregular?',
    '¿Tiene antecedentes familiares de enfermedades cardíacas?',
    '¿Toma algún medicamento para el corazón?',
    '¿Ha tenido episodios de dificultad para respirar?'
  ],
  'Dermatología': [
    '¿Qué tipo de problema de piel presenta?',
    '¿Cuándo comenzó a notar los síntomas?',
    '¿Tiene alergias conocidas?',
    '¿Usa algún medicamento o crema actualmente?',
    '¿El problema empeora con el sol o algún factor específico?'
  ],
  'Pediatría': [
    '¿Cuál es la edad del paciente?',
    '¿Está al día con las vacunas?',
    '¿Qué síntomas presenta el niño/a?',
    '¿Tiene alguna alergia alimentaria o medicamentosa?',
    '¿Es para control de crecimiento y desarrollo?'
  ],
  'Neurología': [
    '¿Experimenta dolores de cabeza frecuentes?',
    '¿Ha tenido episodios de mareos o pérdida de equilibrio?',
    '¿Tiene problemas de memoria o concentración?',
    '¿Experimenta hormigueo o entumecimiento?',
    '¿Ha tenido convulsiones o episodios similares?'
  ],
  'Ginecología': [
    '¿Es para consulta de rutina o problema específico?',
    '¿Fecha de su última menstruación?',
    '¿Toma anticonceptivos actualmente?',
    '¿Ha tenido embarazos previos?',
    '¿Experimenta dolor pélvico o irregularidades menstruales?'
  ],
  'Traumatología': [
    '¿Qué tipo de lesión o dolor presenta?',
    '¿Cuándo ocurrió la lesión?',
    '¿Fue por accidente, deporte o actividad específica?',
    '¿Ha recibido tratamiento previo para esta lesión?',
    '¿El dolor interfiere con sus actividades diarias?'
  ],
  'Psiquiatría': [
    '¿Es su primera consulta psiquiátrica?',
    '¿Qué síntomas o situaciones lo motivan a buscar ayuda?',
    '¿Toma algún medicamento psiquiátrico actualmente?',
    '¿Ha tenido episodios de ansiedad o depresión?',
    '¿Hay antecedentes familiares de problemas de salud mental?'
  ],
  'Endocrinología': [
    '¿Tiene diabetes o antecedentes familiares de diabetes?',
    '¿Experimenta síntomas como aumento de peso inexplicable?',
    '¿Ha notado cambios en su apetito o sed?',
    '¿Toma medicamentos para tiroides o diabetes?',
    '¿Ha tenido problemas hormonales previamente?'
  ]
};

const mockDoctor: Doctor = {
  id: 1,
  name: 'Dra. María González',
  specialty: 'Cardiología',
  rating: 4.9,
  reviews: 124,
  experience: '15 años',
  price: '$800',
  image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
  location: 'Consultorio Médico Central - Polanco, CDMX',
};

export const Appointment: React.FC = () => {
  const [doctor] = useState<Doctor>(mockDoctor);
  const [formData, setFormData] = useState<AppointmentData>({
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    patientAge: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    notes: '',
    symptoms: '',
    specialtyAnswers: {}
  });
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>({
    show: false,
    message: '',
    type: 'info'
  });

  // Toast helper function
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ show: true, message, type });
  };

  // Load user data if logged in
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setFormData(prev => ({
          ...prev,
          patientName: userData.name || '',
          patientEmail: userData.email || ''
        }));
      } catch (error) {
        console.log('Error parsing user data');
      }
    }
  }, []);

  // Set minimum date to today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('appointmentDate') as HTMLInputElement;
    if (dateInput) {
      dateInput.min = today;
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    setFormData(prev => ({ ...prev, appointmentDate: selectedDate, appointmentTime: '' }));
    
    if (selectedDate) {
      // Simulate loading available time slots
      setIsLoading(true);
      setTimeout(() => {
        // Randomly remove some slots to simulate booking
        const available = timeSlots.filter(() => Math.random() > 0.3);
        setAvailableSlots(available);
        setIsLoading(false);
        showToast(`${available.length} horarios disponibles para ${formatDate(selectedDate)}`, 'info');
      }, 800);
    } else {
      setAvailableSlots([]);
    }
  };

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const limited = digits.slice(0, 10);
    
    if (limited.length >= 6) {
      return `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6)}`;
    } else if (limited.length >= 3) {
      return `${limited.slice(0, 3)} ${limited.slice(3)}`;
    }
    return limited;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData(prev => ({ ...prev, patientPhone: formatted }));
    
    if (errors.patientPhone) {
      setErrors(prev => ({ ...prev, patientPhone: '' }));
    }
  };

  const handleSpecialtyAnswerChange = (question: string, answer: string) => {
    setFormData(prev => ({
      ...prev,
      specialtyAnswers: {
        ...prev.specialtyAnswers,
        [question]: answer
      }
    }));
  };

  const getSpecialtyQuestions = () => {
    return specialtyQuestions[doctor.specialty as keyof typeof specialtyQuestions] || [];
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Required fields
    if (!formData.patientName.trim()) {
      newErrors.patientName = 'El nombre es requerido';
    }

    if (!formData.patientEmail) {
      newErrors.patientEmail = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.patientEmail)) {
      newErrors.patientEmail = 'El email no es válido';
    }

    if (!formData.patientPhone) {
      newErrors.patientPhone = 'El teléfono es requerido';
    } else if (!/^[\d\s]{12,}$/.test(formData.patientPhone)) {
      newErrors.patientPhone = 'El teléfono no es válido';
    }

    if (!formData.appointmentDate) {
      newErrors.appointmentDate = 'La fecha es requerida';
    } else {
      const selectedDate = new Date(formData.appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.appointmentDate = 'La fecha no puede ser anterior a hoy';
      }
    }

    if (!formData.appointmentTime) {
      newErrors.appointmentTime = 'La hora es requerida';
    }

    if (!formData.reason) {
      newErrors.reason = 'El motivo de la cita es requerido';
    }

    if (formData.patientAge && (parseInt(formData.patientAge) < 1 || parseInt(formData.patientAge) > 120)) {
      newErrors.patientAge = 'La edad debe estar entre 1 y 120 años';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('Por favor corrige los errores en el formulario', 'error');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      showToast('¡Cita agendada exitosamente!', 'success');
      setShowConfirmation(true);

      // Store appointment details
      const appointmentDetails = {
        ...formData,
        doctor: doctor,
        confirmationNumber: 'MEDSEARCH-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        status: 'confirmed',
        createdAt: new Date().toISOString()
      };

      localStorage.setItem('lastAppointment', JSON.stringify(appointmentDetails));

    } catch (error) {
      showToast('Error al agendar la cita. Intenta nuevamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <ShieldCheckIcon className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">¡Cita Confirmada!</h2>
            <p className="text-gray-600 mt-2">Tu cita ha sido agendada exitosamente</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">Detalles de la cita:</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Doctor:</strong> {doctor.name}</div>
              <div><strong>Especialidad:</strong> {doctor.specialty}</div>
              <div><strong>Fecha:</strong> {formatDate(formData.appointmentDate)}</div>
              <div><strong>Hora:</strong> {formData.appointmentTime}</div>
              <div><strong>Paciente:</strong> {formData.patientName}</div>
              <div><strong>Costo:</strong> {doctor.price}</div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Recibirás un recordatorio 24 horas antes de tu cita
            </p>
            <button
              onClick={() => {
                window.location.href = '/';
              }}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Volver al inicio
            </button>
            <button
              onClick={() => {
                showToast('Función de historial en desarrollo', 'info');
              }}
              className="w-full text-indigo-600 border border-indigo-600 py-3 px-4 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Ver mis citas
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="mb-6 flex items-center text-indigo-600 hover:text-indigo-500"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Doctor Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-6">
              <div className="text-center">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                />
                <h2 className="text-xl font-bold text-gray-900">{doctor.name}</h2>
                <p className="text-indigo-600 font-medium">{doctor.specialty}</p>
                
                <div className="flex items-center justify-center mt-2">
                  <div className="flex items-center">
                    {renderStars(doctor.rating)}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {doctor.rating} ({doctor.reviews} reseñas)
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center text-gray-600">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  {doctor.experience} de experiencia
                </div>
                <div className="flex items-start text-gray-600">
                  <MapPinIcon className="h-4 w-4 mr-2 mt-0.5" />
                  <span>{doctor.location}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Costo de consulta:</span>
                  <span className="text-2xl font-bold text-gray-900">{doctor.price}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Appointment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Agendar Cita</h1>
                <p className="text-gray-600 mt-2">Complete el formulario para agendar su cita médica</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Patient Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Paciente</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        name="patientName"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                          errors.patientName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Nombre y apellidos"
                        value={formData.patientName}
                        onChange={handleInputChange}
                      />
                      {errors.patientName && (
                        <p className="mt-1 text-sm text-red-600">{errors.patientName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Edad
                      </label>
                      <input
                        type="number"
                        name="patientAge"
                        min="1"
                        max="120"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                          errors.patientAge ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Edad en años"
                        value={formData.patientAge}
                        onChange={handleInputChange}
                      />
                      {errors.patientAge && (
                        <p className="mt-1 text-sm text-red-600">{errors.patientAge}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Correo electrónico *
                      </label>
                      <input
                        type="email"
                        name="patientEmail"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                          errors.patientEmail ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="tu@email.com"
                        value={formData.patientEmail}
                        onChange={handleInputChange}
                      />
                      {errors.patientEmail && (
                        <p className="mt-1 text-sm text-red-600">{errors.patientEmail}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        name="patientPhone"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                          errors.patientPhone ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="555 123 4567"
                        value={formData.patientPhone}
                        onChange={handlePhoneChange}
                      />
                      {errors.patientPhone && (
                        <p className="mt-1 text-sm text-red-600">{errors.patientPhone}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Appointment Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalles de la Cita</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de la cita *
                      </label>
                      <input
                        type="date"
                        id="appointmentDate"
                        name="appointmentDate"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                          errors.appointmentDate ? 'border-red-300' : 'border-gray-300'
                        }`}
                        value={formData.appointmentDate}
                        onChange={handleDateChange}
                      />
                      {errors.appointmentDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.appointmentDate}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hora *
                      </label>
                      <select
                        name="appointmentTime"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                          errors.appointmentTime ? 'border-red-300' : 'border-gray-300'
                        }`}
                        value={formData.appointmentTime}
                        onChange={handleInputChange}
                        disabled={!formData.appointmentDate}
                      >
                        <option value="">
                          {!formData.appointmentDate 
                            ? 'Primero selecciona una fecha' 
                            : availableSlots.length === 0 
                              ? 'Cargando horarios...' 
                              : 'Selecciona una hora'
                          }
                        </option>
                        {availableSlots.map(slot => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                      {errors.appointmentTime && (
                        <p className="mt-1 text-sm text-red-600">{errors.appointmentTime}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Motivo de la consulta *
                    </label>
                    <select
                      name="reason"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                        errors.reason ? 'border-red-300' : 'border-gray-300'
                      }`}
                      value={formData.reason}
                      onChange={handleInputChange}
                    >
                      <option value="">Selecciona el motivo</option>
                      {appointmentReasons.map(reason => (
                        <option key={reason} value={reason}>{reason}</option>
                      ))}
                    </select>
                    {errors.reason && (
                      <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
                    )}
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Síntomas principales
                    </label>
                    <textarea
                      name="symptoms"
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                      placeholder="Describe brevemente tus síntomas principales..."
                      value={formData.symptoms}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Specialty-Specific Questions */}
                {getSpecialtyQuestions().length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Preguntas específicas para {doctor.specialty}</h3>
                    
                    <div className="space-y-4">
                      {getSpecialtyQuestions().map((question, index) => (
                        <div key={index}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {question}
                          </label>
                          <textarea
                            rows={2}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                            placeholder="Tu respuesta..."
                            value={formData.specialtyAnswers[question] || ''}
                            onChange={(e) => handleSpecialtyAnswerChange(question, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Notes */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Adicional</h3>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notas adicionales
                    </label>
                    <textarea
                      name="notes"
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                      placeholder="Cualquier información adicional que consideres importante..."
                      value={formData.notes}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Agendando cita...
                      </>
                    ) : (
                      <>
                        <CalendarIcon className="h-5 w-5 mr-2" />
                        Agendar Cita
                      </>
                    )}
                  </button>
                  
                  <p className="text-sm text-gray-500 text-center mt-3">
                    Al agendar confirmas que la información proporcionada es correcta
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};

export default Appointment;