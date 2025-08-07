import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { useRoleBasedRedirect } from '@hooks/useUserRole';
import { CustomerDashboard } from '@components/dashboards/CustomerDashboard';
import { DoctorDashboard } from '@components/dashboards/DoctorDashboard';
import { AdminDashboard } from '@components/dashboards/AdminDashboard';

interface RoleRedirectHandlerProps {
  children?: React.ReactNode;
}

export const RoleRedirectHandler: React.FC<RoleRedirectHandlerProps> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const { role, isLoading } = useRoleBasedRedirect();

  // Show loading while checking authentication and role
  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show children (login page)
  if (!user) {
    return <>{children}</>;
  }

  // If user doesn't have a role, redirect to role selection
  if (!role) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Configura tu cuenta
          </h2>
          <p className="text-gray-600 mb-6">
            Necesitamos saber cómo planeas usar MedSearch para personalizar tu experiencia.
          </p>
          <button 
            onClick={() => window.location.href = '/setup-role'}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Configurar Rol
          </button>
        </div>
      </div>
    );
  }

  // Render appropriate dashboard based on role
  switch (role) {
    case 'customer':
      return <CustomerDashboard />;
    case 'doctor':
      return <DoctorDashboard />;
    case 'company_admin':
    case 'super_admin':
      return <AdminDashboard />;
    default:
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Rol no reconocido
            </h2>
            <p className="text-gray-600">
              Por favor contacta al soporte técnico.
            </p>
          </div>
        </div>
      );
  }
};