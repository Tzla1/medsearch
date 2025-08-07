import React from 'react';
import {
  CalendarIcon,
  UsersIcon,
  StarIcon,
  CurrencyDollarIcon,
  BellIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useUser, SignOutButton } from '@clerk/clerk-react';

export const DoctorDashboard: React.FC = () => {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Panel de Doctor - Dr. {user?.firstName || 'Doctor'}
              </h1>
              <p className="text-gray-600">Gestiona tu consulta y pacientes</p>
            </div>
            <div className="flex items-center space-x-4">
              <SignOutButton>
                <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                  <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </button>
              </SignOutButton>
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <BellIcon className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </button>
              <div className="bg-green-100 p-3 rounded-full">
                <UsersIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">12</h3>
                <p className="text-sm text-gray-600">Citas Hoy</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <UsersIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">156</h3>
                <p className="text-sm text-gray-600">Pacientes Totales</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full">
                <StarIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">4.9</h3>
                <p className="text-sm text-gray-600">Calificación</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">$8,450</h3>
                <p className="text-sm text-gray-600">Ingresos del Mes</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Citas de Hoy */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Citas de Hoy</h2>
                <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                  12 citas
                </span>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {/* Current appointment */}
                  <div className="flex items-center p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                        AH
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <h4 className="font-semibold text-gray-900">Ana Hernández</h4>
                      <p className="text-sm text-gray-600">Consulta de seguimiento</p>
                      <p className="text-sm text-green-600 font-medium">AHORA - 10:30 AM</p>
                    </div>
                    <div className="flex-shrink-0 space-x-2">
                      <button className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700">
                        Iniciar
                      </button>
                    </div>
                  </div>

                  {/* Upcoming appointments */}
                  <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        CM
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <h4 className="font-semibold text-gray-900">Carlos Morales</h4>
                      <p className="text-sm text-gray-600">Primera consulta</p>
                      <p className="text-sm text-blue-600">11:00 AM</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        En 30 min
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center text-white font-bold">
                        LR
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <h4 className="font-semibold text-gray-900">Laura Rodríguez</h4>
                      <p className="text-sm text-gray-600">Control mensual</p>
                      <p className="text-sm text-gray-600">11:30 AM</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                        En 1 hora
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <button className="text-blue-600 hover:text-blue-500 font-medium">
                    Ver todas las citas del día →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Horarios Disponibles */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Disponibilidad</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Lunes</span>
                    <span className="text-sm text-green-600">9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Martes</span>
                    <span className="text-sm text-green-600">9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Miércoles</span>
                    <span className="text-sm text-red-600">No disponible</span>
                  </div>
                </div>
                <div className="mt-4">
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-blue-700">
                    Gestionar Horarios
                  </button>
                </div>
              </div>
            </div>

            {/* Estadísticas Rápidas */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Esta Semana</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Citas Completadas</span>
                    <span className="text-sm font-semibold text-gray-900">28</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Nuevos Pacientes</span>
                    <span className="text-sm font-semibold text-gray-900">5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Reseñas Recibidas</span>
                    <span className="text-sm font-semibold text-gray-900">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Ingresos</span>
                    <span className="text-sm font-semibold text-green-600">$2,340</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notificaciones */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Notificaciones</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Nueva reseña</p>
                      <p className="text-xs text-gray-600">Hace 2 horas</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Pago recibido</p>
                      <p className="text-xs text-gray-600">Hace 4 horas</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Cita cancelada</p>
                      <p className="text-xs text-gray-600">Ayer</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};