import React, { useState } from 'react';
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
import { useUser, SignOutButton } from '@clerk/clerk-react';
import { AppointmentStatusModal } from '@components/modals/AppointmentStatusModal';
import { AppointmentHistoryModal } from '@components/modals/AppointmentHistoryModal';
import { ProfileStatusModal } from '@components/modals/ProfileStatusModal';

export const CustomerDashboard: React.FC = () => {
  const { user } = useUser();
  const [appointmentStatusModal, setAppointmentStatusModal] = useState(false);
  const [appointmentHistoryModal, setAppointmentHistoryModal] = useState(false);
  const [profileStatusModal, setProfileStatusModal] = useState(false);

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
                <div className="space-y-4">
                  {/* Example appointments */}
                  <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <img 
                        src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=60&h=60&fit=crop&crop=face" 
                        alt="Doctor" 
                        className="w-12 h-12 rounded-full"
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <h4 className="font-semibold text-gray-900">Dra. María González</h4>
                      <p className="text-sm text-gray-600">Cardiología</p>
                      <p className="text-sm text-blue-600">Hoy, 3:00 PM</p>
                    </div>
                    <div className="flex-shrink-0">
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                        Ver Detalles
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-green-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <img 
                        src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=60&h=60&fit=crop&crop=face" 
                        alt="Doctor" 
                        className="w-12 h-12 rounded-full"
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <h4 className="font-semibold text-gray-900">Dr. Carlos Rodríguez</h4>
                      <p className="text-sm text-gray-600">Pediatría</p>
                      <p className="text-sm text-green-600">Mañana, 10:00 AM</p>
                    </div>
                    <div className="flex-shrink-0">
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <button className="text-blue-600 hover:text-blue-500 font-medium">
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
                <div className="space-y-4">
                  <div className="flex items-center">
                    <img 
                      src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=40&h=40&fit=crop&crop=face" 
                      alt="Doctor" 
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="ml-3 flex-1">
                      <p className="font-medium text-gray-900">Dra. Ana Martínez</p>
                      <p className="text-sm text-gray-600">Dermatología</p>
                    </div>
                    <div className="flex items-center">
                      <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">5.0</span>
                    </div>
                  </div>
                </div>
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