import React, { useState } from 'react';
import {
  UsersIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  PencilIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useUser, useAuth, SignOutButton } from '@clerk/clerk-react';
import { useAdminData } from '@hooks/useAdminData';
import { DoctorFormModal } from '@components/modals/DoctorFormModal';
import { SpecialtyFormModal } from '@components/modals/SpecialtyFormModal';
import { AdminManagementDashboard } from '@components/AdminManagementDashboard';
import toast, { Toaster } from 'react-hot-toast';

export const AdminDashboard: React.FC = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { stats, pendingDoctors, loading, error, refetch } = useAdminData();
  
  // View states
  const [currentView, setCurrentView] = useState<'dashboard' | 'management'>('dashboard');
  const [managementTab, setManagementTab] = useState<'doctors' | 'specialties' | 'appointments' | 'reviews'>('doctors');
  
  // Modal states
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [isSpecialtyModalOpen, setIsSpecialtyModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<any>(null);
  const [editingSpecialty, setEditingSpecialty] = useState<any>(null);

  const handleDoctorAction = async (doctorId: string, action: 'verify' | 'reject', reason?: string) => {
    try {
      const token = await getToken();
      const endpoint = action === 'verify' ? 'verify' : 'reject';
      
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}/${endpoint}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: reason ? JSON.stringify({ reason }) : undefined
      });

      if (response.ok) {
        // Refresh the data
        refetch();
        
        toast.success(`Doctor ${action === 'verify' ? 'aprobado' : 'rechazado'} exitosamente`);
      } else {
        throw new Error(`Failed to ${action} doctor`);
      }
    } catch (error) {
      console.error(`Error ${action}ing doctor:`, error);
      toast.error(`Error al ${action === 'verify' ? 'aprobar' : 'rechazar'} doctor`);
    }
  };

  const getStatusInfo = (doctor: any) => {
    const daysSinceRegistration = Math.floor(
      (new Date().getTime() - new Date(doctor.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    const hasDocuments = doctor.verificationDocuments && doctor.verificationDocuments.length > 0;
    const hasVerifiedDocuments = doctor.verificationDocuments?.some((doc: any) => doc.verifiedAt);

    if (doctor.status === 'pending_verification') {
      if (!hasDocuments) {
        return {
          message: 'Documentos incompletos',
          bgColor: 'bg-red-50 border-l-4 border-red-500',
          textColor: 'text-red-600',
          type: 'incomplete'
        };
      } else if (!hasVerifiedDocuments) {
        return {
          message: 'Documentos subidos',
          bgColor: 'bg-yellow-50 border-l-4 border-yellow-500',
          textColor: 'text-yellow-600',
          type: 'ready'
        };
      }
    }

    return {
      message: 'En revisión inicial',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      type: 'review'
    };
  };

  // Modal handlers
  const openDoctorModal = (doctor?: any) => {
    setEditingDoctor(doctor || null);
    setIsDoctorModalOpen(true);
  };

  const closeDoctorModal = () => {
    setIsDoctorModalOpen(false);
    setEditingDoctor(null);
  };

  const openSpecialtyModal = (specialty?: any) => {
    setEditingSpecialty(specialty || null);
    setIsSpecialtyModalOpen(true);
  };

  const closeSpecialtyModal = () => {
    setIsSpecialtyModalOpen(false);
    setEditingSpecialty(null);
  };

  const handleModalSuccess = () => {
    refetch(); // Refresh data when forms are successful
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Panel de Administración - {user?.firstName || 'Admin'}
              </h1>
              <p className="text-gray-600">Gestiona la plataforma médica</p>
            </div>
            <div className="flex items-center space-x-4">
              <SignOutButton>
                <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                  <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </button>
              </SignOutButton>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'dashboard'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentView('management')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'management'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Gestión
                </button>
              </div>
              
              <div className="bg-purple-100 p-3 rounded-full">
                <CogIcon className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'management' ? (
          <AdminManagementDashboard 
            activeTab={managementTab}
            onTabChange={setManagementTab}
          />
        ) : (
          <div>
            {/* Dashboard Content */}
            {/* Loading State */}
            {loading && (
              <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Cargando datos del panel...</span>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error cargando datos</h3>
                    <p className="mt-1 text-sm text-red-700">{error}</p>
                    <button 
                      onClick={refetch}
                      className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                    >
                      Intentar nuevamente
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <UserGroupIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {loading ? '...' : stats?.totalDoctors.toLocaleString() || '0'}
                    </h3>
                    <p className="text-sm text-gray-600">Doctores Activos</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-full">
                    <UsersIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {loading ? '...' : stats?.totalCustomers.toLocaleString() || '0'}
                    </h3>
                    <p className="text-sm text-gray-600">Pacientes Registrados</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <ClockIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {loading ? '...' : stats?.pendingVerification || '0'}
                    </h3>
                    <p className="text-sm text-gray-600">Pendientes Verificación</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="bg-red-100 p-3 rounded-full">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {loading ? '...' : stats?.urgentReports || '0'}
                    </h3>
                    <p className="text-sm text-gray-600">Reportes Urgentes</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Doctores Pendientes de Verificación */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Doctores Pendientes</h2>
                    <span className="bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full">
                      {loading ? '...' : `${stats?.pendingVerification || 0} pendientes`}
                    </span>
                  </div>
                  <div className="p-6">
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      </div>
                    ) : pendingDoctors.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <ClockIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p>No hay doctores pendientes de verificación</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingDoctors.map((doctor) => {
                          const statusInfo = getStatusInfo(doctor);
                          const daysSinceRegistration = Math.floor(
                            (new Date().getTime() - new Date(doctor.createdAt).getTime()) / (1000 * 60 * 60 * 24)
                          );
                          const specialtyName = doctor.specialtyIds?.[0]?.name || 'Especialidad no especificada';

                          return (
                            <div key={doctor._id} className={`flex items-center p-4 ${statusInfo.bgColor} rounded-r-lg`}>
                              <div className="flex-shrink-0">
                                <img 
                                  src={doctor.userId.profileImageUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=60&h=60&fit=crop&crop=face'} 
                                  alt="Doctor" 
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              </div>
                              <div className="ml-4 flex-1">
                                <h4 className="font-semibold text-gray-900">
                                  Dr{doctor.userId.firstName?.toLowerCase().endsWith('a') ? 'a' : ''}. {doctor.userId.firstName} {doctor.userId.lastName}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {specialtyName} - Registro: {daysSinceRegistration} día{daysSinceRegistration !== 1 ? 's' : ''}
                                </p>
                                <p className={`text-sm ${statusInfo.textColor}`}>{statusInfo.message}</p>
                              </div>
                              <div className="flex-shrink-0 space-x-2">
                                {statusInfo.type === 'ready' && (
                                  <>
                                    <button 
                                      onClick={() => handleDoctorAction(doctor._id, 'verify')}
                                      className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center"
                                    >
                                      <CheckIcon className="h-4 w-4 mr-1" />
                                      Aprobar
                                    </button>
                                    <button 
                                      onClick={() => handleDoctorAction(doctor._id, 'reject', 'Documentos necesitan revisión')}
                                      className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-300 transition-colors"
                                    >
                                      Revisar
                                    </button>
                                  </>
                                )}
                                {statusInfo.type === 'incomplete' && (
                                  <>
                                    <button 
                                      onClick={() => handleDoctorAction(doctor._id, 'reject', 'Documentos incompletos')}
                                      className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors flex items-center"
                                    >
                                      <XMarkIcon className="h-4 w-4 mr-1" />
                                      Rechazar
                                    </button>
                                    <button className="bg-yellow-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-yellow-700 transition-colors">
                                      Solicitar Docs
                                    </button>
                                  </>
                                )}
                                {statusInfo.type === 'review' && (
                                  <>
                                    <button 
                                      onClick={() => openDoctorModal(doctor)}
                                      className="bg-gray-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors flex items-center"
                                    >
                                      <PencilIcon className="h-4 w-4" />
                                    </button>
                                    <button className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center">
                                      <EyeIcon className="h-4 w-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {!loading && pendingDoctors.length > 0 && (
                      <div className="mt-6 text-center">
                        <button className="text-blue-600 hover:text-blue-500 font-medium transition-colors">
                          Ver todos los pendientes →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Acciones Rápidas */}
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h3>
                  </div>
                  <div className="p-6 space-y-3">
                    <button 
                      onClick={() => openDoctorModal()}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-blue-700 flex items-center justify-center transition-colors"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Agregar Doctor
                    </button>
                    <button 
                      onClick={() => openSpecialtyModal()}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-green-700 flex items-center justify-center transition-colors"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Agregar Especialidad
                    </button>
                    <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-purple-700 flex items-center justify-center transition-colors">
                      <ChartBarIcon className="h-4 w-4 mr-2" />
                      Ver Reportes
                    </button>
                    <button className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-gray-700 flex items-center justify-center transition-colors">
                      <CogIcon className="h-4 w-4 mr-2" />
                      Configuración
                    </button>
                  </div>
                </div>

                {/* Estadísticas Recientes */}
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Esta Semana</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Nuevos Registros</span>
                        <span className="text-sm font-semibold text-green-600">
                          {loading ? '...' : `+${stats?.weeklyStats.newRegistrations || 0}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Doctores Verificados</span>
                        <span className="text-sm font-semibold text-blue-600">
                          {loading ? '...' : stats?.weeklyStats.verifiedDoctors || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Reportes Resueltos</span>
                        <span className="text-sm font-semibold text-purple-600">
                          {loading ? '...' : stats?.weeklyStats.resolvedReports || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Satisfacción</span>
                        <span className="text-sm font-semibold text-green-600">
                          {loading ? '...' : `${stats?.weeklyStats.satisfaction || 0}%`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alertas del Sistema */}
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Alertas</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      {/* Urgent Reports Alert */}
                      {!loading && stats && stats.urgentReports > 0 && (
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {stats.urgentReports} reporte{stats.urgentReports !== 1 ? 's' : ''} urgente{stats.urgentReports !== 1 ? 's' : ''}
                            </p>
                            <p className="text-xs text-gray-600">Requieren atención inmediata</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Pending Verification Alert */}
                      {!loading && stats && stats.pendingVerification > 0 && (
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {stats.pendingVerification} doctor{stats.pendingVerification !== 1 ? 'es' : ''} pendiente{stats.pendingVerification !== 1 ? 's' : ''}
                            </p>
                            <p className="text-xs text-gray-600">Esperando verificación</p>
                          </div>
                        </div>
                      )}
                      
                      {/* System Status */}
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Sistema operativo</p>
                          <p className="text-xs text-gray-600">
                            {loading ? 'Verificando estado...' : 'Conectado a MongoDB'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Backup Info */}
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Backup automatizado</p>
                          <p className="text-xs text-gray-600">Última copia: Hace 2 horas</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <DoctorFormModal
        isOpen={isDoctorModalOpen}
        onClose={closeDoctorModal}
        doctor={editingDoctor}
        onSuccess={handleModalSuccess}
      />

      <SpecialtyFormModal
        isOpen={isSpecialtyModalOpen}
        onClose={closeSpecialtyModal}
        specialty={editingSpecialty}
        onSuccess={handleModalSuccess}
      />

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
          },
        }}
      />
    </div>
  );
};