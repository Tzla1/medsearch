import React, { useState, useEffect } from 'react';
import {
  CalendarIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  ClockIcon,
  UserIcon,
  StarIcon,
  ArrowRightOnRectangleIcon,
  DocumentTextIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { useUser, useAuth, SignOutButton } from '@clerk/clerk-react';
import { AppointmentStatusModal } from '@components/modals/AppointmentStatusModal';
import { AppointmentHistoryModal } from '@components/modals/AppointmentHistoryModal';
import { ProfileStatusModal } from '@components/modals/ProfileStatusModal';
import { showDramaticError, showToast } from '../../utils/alerts';

interface Appointment {
  _id: string;
  doctorId: {
    userId: {
      firstName: string;
      lastName: string;
      profileImageUrl?: string;
    };
    specialties: Array<{ name: string }>;
  };
  scheduledDate: string;
  status: string;
}

interface FavoriteDoctor {
  _id: string;
  userId: {
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
  specialties: Array<{ name: string }>;
  ratings?: {
    average: number;
    count: number;
  };
}

export const CustomerDashboard: React.FC = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  
  // Modal states
  const [appointmentStatusModal, setAppointmentStatusModal] = useState(false);
  const [appointmentHistoryModal, setAppointmentHistoryModal] = useState(false);
  const [profileStatusModal, setProfileStatusModal] = useState(false);
  
  // Data states
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [favoriteDoctors, setFavoriteDoctors] = useState<FavoriteDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUpcomingAppointments(),
        fetchFavoriteDoctors()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUpcomingAppointments = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/appointments/customer?limit=3`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const upcoming = data.appointments?.filter((appointment: Appointment) => {
          const appointmentDate = new Date(appointment.scheduledDate);
          const now = new Date();
          return appointmentDate >= now &&
                 appointment.status !== 'cancelled' &&
                 appointment.status !== 'completed';
        }).slice(0, 3) || [];
        
        setUpcomingAppointments(upcoming);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      showDramaticError(
        'Error de Citas',
        'No se pudieron cargar sus próximas citas. Verifique su conexión.',
        () => fetchUpcomingAppointments()
      );
    }
  };
  
  const fetchFavoriteDoctors = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/customers/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFavoriteDoctors(data.favorites?.slice(0, 3) || []);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      // Silent error for favorites as it's not critical
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
    } else if (daysDiff > 0) {
      dateLabel = `En ${daysDiff} días`;
    }
    
    const time = date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `${dateLabel}, ${time}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Bienvenido, {user?.firstName || 'Paciente'}
              </h1>
              <p className="text-gray-600">Gestiona tu salud de manera fácil y segura</p>
            </div>
            <div className="flex items-center space-x-4">
              <SignOutButton>
                <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                  <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </button>
              </SignOutButton>
              <div className="bg-blue-100 p-3 rounded-full">
                <UserIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <MagnifyingGlassIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Buscar Doctor</h3>
                <p className="text-sm text-gray-600">Encuentra especialistas</p>
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setAppointmentStatusModal(true)}
          >
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <CalendarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Mis Citas</h3>
                <p className="text-sm text-gray-600">Ver estado de citas</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-full">
                <HeartIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Favoritos</h3>
                <p className="text-sm text-gray-600">Doctores guardados</p>
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setAppointmentHistoryModal(true)}
          >
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <ClockIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Historial</h3>
                <p className="text-sm text-gray-600">Citas anteriores</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Status Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Estado de la Cuenta</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                onClick={() => setProfileStatusModal(true)}
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <CogIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Mi Perfil</h4>
                    <p className="text-sm text-gray-600">Ver información personal</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <DocumentTextIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Expediente</h4>
                    <p className="text-sm text-gray-600">Información médica</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <StarIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Reseñas</h4>
                    <p className="text-sm text-gray-600">Mis valoraciones</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Próximas Citas */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Próximas Citas</h2>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : upcomingAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No tienes citas próximas
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Agenda una cita con tu especialista favorito.
                    </p>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                      Buscar Doctor
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment, index) => (
                      <div key={appointment._id} className={`flex items-center p-4 rounded-lg ${
                        index === 0 ? 'bg-blue-50' : index === 1 ? 'bg-green-50' : 'bg-purple-50'
                      }`}>
                        <div className="flex-shrink-0">
                          <img
                            src={appointment.doctorId.userId.profileImageUrl || '/api/placeholder/48/48'}
                            alt="Doctor"
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <h4 className="font-semibold text-gray-900">
                            Dr. {appointment.doctorId.userId.firstName} {appointment.doctorId.userId.lastName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {appointment.doctorId.specialties?.[0]?.name || 'Médico General'}
                          </p>
                          <p className={`text-sm font-medium ${
                            index === 0 ? 'text-blue-600' : index === 1 ? 'text-green-600' : 'text-purple-600'
                          }`}>
                            {formatDate(appointment.scheduledDate)}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <button
                            onClick={() => setAppointmentStatusModal(true)}
                            className={`text-white px-4 py-2 rounded-lg text-sm transition-colors ${
                              index === 0 ? 'bg-blue-600 hover:bg-blue-700' :
                              index === 1 ? 'bg-green-600 hover:bg-green-700' :
                              'bg-purple-600 hover:bg-purple-700'
                            }`}
                          >
                            Ver Detalles
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 text-center">
                  <button
                    onClick={() => setAppointmentStatusModal(true)}
                    className="text-blue-600 hover:text-blue-500 font-medium"
                  >
                    Ver todas las citas →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Doctores Favoritos */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Doctores Favoritos</h3>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                ) : favoriteDoctors.length === 0 ? (
                  <div className="text-center py-6">
                    <HeartIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No tienes doctores favoritos</p>
                    <p className="text-xs text-gray-500 mt-1">Agrega doctores desde tu historial</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {favoriteDoctors.map((doctor) => (
                      <div key={doctor._id} className="flex items-center">
                        <img
                          src={doctor.userId.profileImageUrl || '/api/placeholder/40/40'}
                          alt="Doctor"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="ml-3 flex-1">
                          <p className="font-medium text-gray-900">
                            Dr. {doctor.userId.firstName} {doctor.userId.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {doctor.specialties?.[0]?.name || 'Médico General'}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">
                            {doctor.ratings?.average?.toFixed(1) || '5.0'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 text-center">
                  <button className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                    Ver todos →
                  </button>
                </div>
              </div>
            </div>

            {/* Recordatorios */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recordatorios</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Tomar medicamento</p>
                      <p className="text-xs text-gray-600">Cada 8 horas</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Control mensual</p>
                      <p className="text-xs text-gray-600">En 5 días</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Modals */}
      <AppointmentStatusModal
        isOpen={appointmentStatusModal}
        onClose={() => setAppointmentStatusModal(false)}
      />
      
      <AppointmentHistoryModal
        isOpen={appointmentHistoryModal}
        onClose={() => setAppointmentHistoryModal(false)}
      />
      
      <ProfileStatusModal
        isOpen={profileStatusModal}
        onClose={() => setProfileStatusModal(false)}
      />
    </div>
  );
};