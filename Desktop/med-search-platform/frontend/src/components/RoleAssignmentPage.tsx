import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
// Simple URL params hook to replace useSearchParams
const useSimpleSearchParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return [urlParams];
};
import { type UserRole } from '@components/RoleSelection';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  UserIcon,
  HeartIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

export const RoleAssignmentPage: React.FC = () => {
  const { user, isLoaded } = useUser();
  const [searchParams] = useSimpleSearchParams();
  const [isAssigning, setIsAssigning] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const role = searchParams.get('role') as UserRole;
  const token = searchParams.get('token');

  const roleConfig = {
    customer: {
      title: 'Paciente',
      description: 'Busca y agenda citas con doctores',
      icon: UserIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    doctor: {
      title: 'Doctor',
      description: 'Gestiona tu consulta y pacientes',
      icon: HeartIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    company_admin: {
      title: 'Administrador',
      description: 'Administra la plataforma médica',
      icon: BuildingOfficeIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  };

  const currentRoleConfig = role ? roleConfig[role] : null;

  useEffect(() => {
    if (isLoaded && user && role && token && status === 'idle') {
      assignRole();
    }
  }, [isLoaded, user, role, token, status]);

  const assignRole = async () => {
    if (!user || !role) return;

    setIsAssigning(true);

    try {
      // Validate token (basic validation for demo)
      const isValidToken = token?.startsWith(btoa('dev-')) || 
                          token?.includes(role) ||
                          process.env.NODE_ENV === 'development';

      if (!isValidToken) {
        throw new Error('Token de asignación inválido');
      }

      // Update user metadata
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          role: role,
          onboardingCompleted: true,
          profileSetup: false,
          assignedBy: 'link',
          assignedAt: new Date().toISOString()
        }
      });

      setStatus('success');
      setMessage(`Rol de ${currentRoleConfig?.title} asignado exitosamente`);

      // Redirect to appropriate dashboard after 3 seconds
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 3000);

    } catch (error) {
      console.error('Error assigning role:', error);
      setStatus('error');
      setMessage('Error al asignar el rol. Por favor contacta al soporte.');
    } finally {
      setIsAssigning(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white rounded-lg shadow-lg p-8">
          <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Autenticación Requerida
          </h2>
          <p className="text-gray-600 mb-6">
            Debes iniciar sesión para continuar con la asignación de rol.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  if (!role || !currentRoleConfig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white rounded-lg shadow-lg p-8">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Link Inválido
          </h2>
          <p className="text-gray-600 mb-6">
            El link de asignación de rol no es válido o ha expirado.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Ir al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {status === 'idle' && isAssigning && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Asignando Rol
              </h2>
              <p className="text-gray-600">
                Configurando tu cuenta como {currentRoleConfig.title}...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${currentRoleConfig.bgColor} mb-4`}>
                <currentRoleConfig.icon className={`w-8 h-8 ${currentRoleConfig.color}`} />
              </div>
              <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Rol Asignado!
              </h2>
              <p className="text-gray-600 mb-4">
                {message}
              </p>
              <div className={`p-4 rounded-lg ${currentRoleConfig.bgColor} mb-6`}>
                <h3 className={`font-semibold ${currentRoleConfig.color} mb-2`}>
                  {currentRoleConfig.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {currentRoleConfig.description}
                </p>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Serás redirigido al panel de control en unos segundos...
              </p>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Ir al Panel de Control
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Error
              </h2>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setStatus('idle');
                    assignRole();
                  }}
                  className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Intentar de Nuevo
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Ir al Inicio
                </button>
              </div>
            </>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Usuario: {user.emailAddresses[0]?.emailAddress}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};