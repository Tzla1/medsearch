import React, { useState, useEffect } from 'react';
import { BaseModal } from './BaseModal';
import { useAuth } from '@clerk/clerk-react';
import {
  ClockIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  MapPinIcon,
  StarIcon,
  DocumentTextIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

interface AppointmentHistory {
  _id: string;
  doctorId: {
    _id: string;
    userId: {
      firstName: string;
      lastName: string;
    };
    specialties: Array<{ name: string }>;
    location?: {
      address: string;
      city: string;
    };
    rating?: number;
  };
  scheduledDate: string;
  status: string;
  appointmentType: string;
  reasonForVisit?: string;
  diagnosis?: string;
  doctorNotes?: string;
  patientNotes?: string;
  createdAt: string;
  prescriptions?: Array<{
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: string;
    temperature?: string;
    weight?: string;
  };
}

interface AppointmentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_CONFIG = {
  completed: { color: 'text-green-600 bg-green-50', label: 'Completada', icon: CheckCircleIcon },
  cancelled: { color: 'text-red-600 bg-red-50', label: 'Cancelada', icon: XCircleIcon },
  no_show: { color: 'text-red-600 bg-red-50', label: 'No Asistió', icon: XCircleIcon }
};

export const AppointmentHistoryModal: React.FC<AppointmentHistoryModalProps> = ({
  isOpen,
  onClose
}) => {
  const { getToken } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentHistory | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (isOpen) {
      fetchAppointmentHistory();
    }
  }, [isOpen]);

  const fetchAppointmentHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/appointments/customer/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar el historial');
      }

      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error('Error fetching appointment history:', error);
      setError('Error al cargar el historial de citas');
      toast.error('Error al cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (doctorId: string) => {
    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/customers/favorites`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ doctorId }),
      });

      if (response.ok) {
        toast.success('Doctor agregado a favoritos');
      } else {
        toast.error('Error al agregar a favoritos');
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      toast.error('Error al agregar a favoritos');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const getFilteredAppointments = () => {
    if (filterStatus === 'all') return appointments;
    return appointments.filter(appointment => appointment.status === filterStatus);
  };

  const filteredAppointments = getFilteredAppointments();

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => {
      const filled = index < rating;
      return filled ? (
        <StarIconSolid key={index} className="h-4 w-4 text-yellow-400" />
      ) : (
        <StarIcon key={index} className="h-4 w-4 text-gray-300" />
      );
    });
  };

  if (selectedAppointment) {
    return (
      <BaseModal 
        isOpen={isOpen} 
        onClose={() => setSelectedAppointment(null)} 
        title="Detalles de la Cita"
        size="xl"
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Dr. {selectedAppointment.doctorId.userId.firstName} {selectedAppointment.doctorId.userId.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedAppointment.doctorId.specialties?.[0]?.name || 'Médico General'}
                  </p>
                  {selectedAppointment.doctorId.rating && (
                    <div className="flex items-center space-x-1 mt-1">
                      {renderStars(selectedAppointment.doctorId.rating)}
                      <span className="text-sm text-gray-600">({selectedAppointment.doctorId.rating})</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => addToFavorites(selectedAppointment.doctorId._id)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Agregar a favoritos"
              >
                <HeartIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Appointment Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Información de la Cita</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                  <span>{formatDate(selectedAppointment.scheduledDate).date} - {formatDate(selectedAppointment.scheduledDate).time}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-4 h-4 flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </span>
                  <span>Tipo: {selectedAppointment.appointmentType}</span>
                </div>
                {selectedAppointment.doctorId.location && (
                  <div className="flex items-center space-x-2">
                    <MapPinIcon className="h-4 w-4 text-gray-400" />
                    <span>{selectedAppointment.doctorId.location.address}, {selectedAppointment.doctorId.location.city}</span>
                  </div>
                )}
              </div>
            </div>

            {selectedAppointment.vitalSigns && Object.values(selectedAppointment.vitalSigns).some(value => value) && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Signos Vitales</h4>
                <div className="space-y-2 text-sm">
                  {selectedAppointment.vitalSigns.bloodPressure && (
                    <div>Presión Arterial: <span className="font-medium">{selectedAppointment.vitalSigns.bloodPressure}</span></div>
                  )}
                  {selectedAppointment.vitalSigns.heartRate && (
                    <div>Frecuencia Cardíaca: <span className="font-medium">{selectedAppointment.vitalSigns.heartRate} bpm</span></div>
                  )}
                  {selectedAppointment.vitalSigns.temperature && (
                    <div>Temperatura: <span className="font-medium">{selectedAppointment.vitalSigns.temperature}°C</span></div>
                  )}
                  {selectedAppointment.vitalSigns.weight && (
                    <div>Peso: <span className="font-medium">{selectedAppointment.vitalSigns.weight} kg</span></div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Clinical Information */}
          {(selectedAppointment.reasonForVisit || selectedAppointment.diagnosis) && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Información Clínica</h4>
              
              {selectedAppointment.reasonForVisit && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Motivo de Consulta:</label>
                  <p className="mt-1 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {selectedAppointment.reasonForVisit}
                  </p>
                </div>
              )}

              {selectedAppointment.diagnosis && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Diagnóstico:</label>
                  <p className="mt-1 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {selectedAppointment.diagnosis}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {(selectedAppointment.doctorNotes || selectedAppointment.patientNotes) && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Notas</h4>
              
              {selectedAppointment.doctorNotes && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Notas del Doctor:</label>
                  <p className="mt-1 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    {selectedAppointment.doctorNotes}
                  </p>
                </div>
              )}

              {selectedAppointment.patientNotes && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Sus Notas:</label>
                  <p className="mt-1 text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                    {selectedAppointment.patientNotes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Prescriptions */}
          {selectedAppointment.prescriptions && selectedAppointment.prescriptions.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Prescripciones</h4>
              <div className="space-y-3">
                {selectedAppointment.prescriptions.map((prescription, index) => (
                  <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <DocumentTextIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{prescription.medication}</h5>
                        <p className="text-sm text-gray-600">
                          Dosis: {prescription.dosage} | Frecuencia: {prescription.frequency}
                        </p>
                        <p className="text-sm text-gray-600">Duración: {prescription.duration}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <button
              onClick={() => setSelectedAppointment(null)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              ← Volver
            </button>
            <div className="space-x-2">
              <button className="px-4 py-2 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200">
                Agendar Seguimiento
              </button>
              <button className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                Descargar Resumen
              </button>
            </div>
          </div>
        </div>
      </BaseModal>
    );
  }

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Historial de Citas"
      size="xl"
    >
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex space-x-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">Todas las citas</option>
            <option value="completed">Completadas</option>
            <option value="cancelled">Canceladas</option>
            <option value="no_show">No asistí</option>
          </select>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">{error}</p>
            <button
              onClick={fetchAppointmentHistory}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Reintentar
            </button>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-8">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sin historial</h3>
            <p className="text-gray-600">No hay citas en tu historial.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredAppointments.map((appointment) => {
              const dateInfo = formatDate(appointment.scheduledDate);
              const statusConfig = STATUS_CONFIG[appointment.status as keyof typeof STATUS_CONFIG];
              
              return (
                <div 
                  key={appointment._id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white"
                  onClick={() => setSelectedAppointment(appointment)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Dr. {appointment.doctorId.userId.firstName} {appointment.doctorId.userId.lastName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {appointment.doctorId.specialties?.[0]?.name || 'Médico General'}
                        </p>
                      </div>
                    </div>
                    
                    {statusConfig && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>{dateInfo.date} - {dateInfo.time}</span>
                    <span className="text-blue-600 hover:text-blue-800">Ver detalles →</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-sm text-gray-600">{filteredAppointments.length} citas en historial</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cerrar
          </button>
        </div>
      </div>
    </BaseModal>
  );
};