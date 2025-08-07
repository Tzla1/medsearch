import React, { useState, useEffect } from 'react';
import { BaseModal } from './BaseModal';
import { useAuth } from '@clerk/clerk-react';
import {
  ClockIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Appointment {
  _id: string;
  doctorId: {
    userId: {
      firstName: string;
      lastName: string;
      email?: string;
    };
    specialties: Array<{ name: string }>;
    location?: {
      address: string;
      city: string;
    };
    contactInfo?: {
      phone: string;
    };
  };
  scheduledDate: string;
  status: string;
  appointmentType: string;
  reasonForVisit?: string;
  createdAt: string;
}

interface AppointmentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_CONFIG = {
  pending: {
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    icon: ClockIcon,
    label: 'Pendiente'
  },
  confirmed: {
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    icon: CheckCircleIcon,
    label: 'Confirmada'
  },
  completed: {
    color: 'text-green-600 bg-green-50 border-green-200',
    icon: CheckCircleIcon,
    label: 'Completada'
  },
  cancelled: {
    color: 'text-red-600 bg-red-50 border-red-200',
    icon: XCircleIcon,
    label: 'Cancelada'
  },
  in_progress: {
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    icon: ClockIcon,
    label: 'En Proceso'
  },
  no_show: {
    color: 'text-red-600 bg-red-50 border-red-200',
    icon: ExclamationTriangleIcon,
    label: 'No Asistió'
  },
  rescheduled: {
    color: 'text-orange-600 bg-orange-50 border-orange-200',
    icon: ClockIcon,
    label: 'Reprogramada'
  }
};

export const AppointmentStatusModal: React.FC<AppointmentStatusModalProps> = ({
  isOpen,
  onClose
}) => {
  const { getToken } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'all'>('upcoming');

  useEffect(() => {
    if (isOpen) {
      fetchAppointments();
    }
  }, [isOpen]);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/appointments/customer`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar las citas');
      }

      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Error al cargar las citas');
      toast.error('Error al cargar las citas');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const appointmentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const daysDiff = Math.floor((appointmentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    let dateLabel = '';
    if (daysDiff === 0) {
      dateLabel = 'Hoy';
    } else if (daysDiff === 1) {
      dateLabel = 'Mañana';
    } else if (daysDiff === -1) {
      dateLabel = 'Ayer';
    } else if (daysDiff > 0) {
      dateLabel = `En ${daysDiff} días`;
    } else {
      dateLabel = `Hace ${Math.abs(daysDiff)} días`;
    }

    return {
      dateLabel,
      fullDate: date.toLocaleDateString('es-ES', {
        weekday: 'long',
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
    const now = new Date();
    
    if (activeTab === 'upcoming') {
      return appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.scheduledDate);
        return appointmentDate >= now && appointment.status !== 'cancelled' && appointment.status !== 'completed';
      });
    }
    
    return appointments;
  };

  const filteredAppointments = getFilteredAppointments();

  const StatusIcon = ({ status }: { status: string }) => {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
    if (!config) return null;
    
    const IconComponent = config.icon;
    return <IconComponent className="h-5 w-5" />;
  };

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Estado de Mis Citas"
      size="xl"
    >
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'upcoming'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Próximas Citas
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'all'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Todas las Citas
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">{error}</p>
            <button
              onClick={fetchAppointments}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Reintentar
            </button>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === 'upcoming' ? 'No tienes citas próximas' : 'No tienes citas registradas'}
            </h3>
            <p className="text-gray-600 mb-4">
              {activeTab === 'upcoming' 
                ? 'Todas tus citas están completadas o no tienes citas programadas.'
                : 'Aún no has agendado ninguna cita médica.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredAppointments.map((appointment) => {
              const dateInfo = formatDate(appointment.scheduledDate);
              const statusConfig = STATUS_CONFIG[appointment.status as keyof typeof STATUS_CONFIG];
              
              return (
                <div 
                  key={appointment._id} 
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Dr. {appointment.doctorId.userId.firstName} {appointment.doctorId.userId.lastName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {appointment.doctorId.specialties?.[0]?.name || 'Médico General'}
                        </p>
                      </div>
                    </div>
                    
                    {statusConfig && (
                      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                        <StatusIcon status={appointment.status} />
                        <span>{statusConfig.label}</span>
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      <div>
                        <span className="font-medium">{dateInfo.dateLabel}</span>
                        <span className="text-gray-600 ml-2">{dateInfo.time}</span>
                        <p className="text-gray-500 text-xs">{dateInfo.fullDate}</p>
                      </div>
                    </div>

                    {appointment.doctorId.location && (
                      <div className="flex items-center space-x-2">
                        <MapPinIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {appointment.doctorId.location.address}, {appointment.doctorId.location.city}
                        </span>
                      </div>
                    )}

                    {appointment.doctorId.contactInfo?.phone && (
                      <div className="flex items-center space-x-2">
                        <PhoneIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{appointment.doctorId.contactInfo.phone}</span>
                      </div>
                    )}

                    {appointment.reasonForVisit && (
                      <div className="md:col-span-2">
                        <p className="text-gray-600">
                          <span className="font-medium">Motivo:</span> {appointment.reasonForVisit}
                        </p>
                      </div>
                    )}
                  </div>

                  {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
                    <div className="mt-4 flex space-x-2">
                      <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                        Ver Detalles
                      </button>
                      <button className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300">
                        Reprogramar
                      </button>
                      <button className="px-3 py-2 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200">
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-sm text-gray-600">
            {filteredAppointments.length} 
            {activeTab === 'upcoming' ? ' citas próximas' : ' citas en total'}
          </p>
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