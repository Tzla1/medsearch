import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { type UserRole } from '@components/RoleSelection';
import { 
  UserIcon, 
  HeartIcon, 
  BuildingOfficeIcon, 
  KeyIcon,
  LinkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface DevRoleToolProps {
  isDevMode?: boolean;
}

export const DevRoleTool: React.FC<DevRoleToolProps> = ({ isDevMode = false }) => {
  const { user } = useUser();
  // const clerk = useClerk(); // Not used in current implementation
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [targetUserId, setTargetUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [generatedLinks, setGeneratedLinks] = useState<{ role: UserRole; link: string }[]>([]);

  // Only show in development or if user is super admin
  const isAuthorized = isDevMode || user?.publicMetadata?.role === 'super_admin';

  useEffect(() => {
    // Generate role assignment links
    const baseUrl = window.location.origin;
    const links = [
      { role: 'customer' as UserRole, link: `${baseUrl}/assign-role?role=customer&token=${btoa('dev-customer-' + Date.now())}` },
      { role: 'doctor' as UserRole, link: `${baseUrl}/assign-role?role=doctor&token=${btoa('dev-doctor-' + Date.now())}` },
      { role: 'company_admin' as UserRole, link: `${baseUrl}/assign-role?role=company_admin&token=${btoa('dev-admin-' + Date.now())}` }
    ];
    setGeneratedLinks(links);
  }, []);

  const handleAssignRole = async () => {
    if (!targetUserId.trim()) {
      setMessage({ type: 'error', text: 'Por favor ingresa un User ID' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Note: This would require server-side implementation
      // For now, show a message that this feature needs backend support
      throw new Error('Esta funcionalidad requiere implementación del servidor');

      setMessage({ 
        type: 'success', 
        text: `Rol ${selectedRole} asignado exitosamente al usuario ${targetUserId}` 
      });
      setTargetUserId('');
    } catch (error) {
      console.error('Error assigning role:', error);
      setMessage({ 
        type: 'error', 
        text: 'Error al asignar rol. Verifica que el User ID sea válido.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelfAssignRole = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setMessage(null);

    try {
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          role: selectedRole,
          onboardingCompleted: true,
          profileSetup: false,
          assignedBy: 'self',
          assignedAt: new Date().toISOString()
        }
      });

      setMessage({ 
        type: 'success', 
        text: `Rol ${selectedRole} asignado a tu cuenta. Recarga la página para ver los cambios.` 
      });
    } catch (error) {
      console.error('Error self-assigning role:', error);
      setMessage({ 
        type: 'error', 
        text: 'Error al asignar rol a tu cuenta.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setMessage({ type: 'success', text: 'Link copiado al portapapeles' });
  };

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <details className="relative">
        <summary className="bg-red-600 text-white p-3 rounded-full cursor-pointer shadow-lg hover:bg-red-700 transition-colors">
          <KeyIcon className="h-6 w-6" />
        </summary>
        
        <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-xl border p-6 w-96 max-h-96 overflow-y-auto">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
              <KeyIcon className="h-5 w-5 mr-2 text-red-600" />
              Dev Role Tool
            </h3>
            <p className="text-sm text-gray-600">
              Herramienta de desarrollo para asignar roles
            </p>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-lg flex items-center ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800' 
                : 'bg-red-50 text-red-800'
            }`}>
              {message.type === 'success' ? (
                <CheckCircleIcon className="h-5 w-5 mr-2" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          {/* Role Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Rol
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { role: 'customer', icon: UserIcon, label: 'Paciente', color: 'bg-blue-50 border-blue-200' },
                { role: 'doctor', icon: HeartIcon, label: 'Doctor', color: 'bg-green-50 border-green-200' },
                { role: 'company_admin', icon: BuildingOfficeIcon, label: 'Admin', color: 'bg-purple-50 border-purple-200' }
              ].map(({ role, icon: Icon, label, color }) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role as UserRole)}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    selectedRole === role
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                      : color
                  }`}
                >
                  <Icon className="h-6 w-6 mx-auto mb-1" />
                  <span className="text-xs">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Assign to Self */}
          <div className="mb-4">
            <button
              onClick={handleSelfAssignRole}
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Asignando...' : `Asignarme rol: ${selectedRole}`}
            </button>
          </div>

          {/* Assign to Other User */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Asignar a otro usuario
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                placeholder="User ID de Clerk"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                onClick={handleAssignRole}
                disabled={isLoading || !targetUserId.trim()}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Asignar
              </button>
            </div>
          </div>

          {/* Generated Links */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Links de Asignación Rápida
            </h4>
            <div className="space-y-2">
              {generatedLinks.map(({ role, link }) => (
                <div key={role} className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 w-16 capitalize">
                    {role}
                  </span>
                  <input
                    type="text"
                    value={link}
                    readOnly
                    className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs bg-gray-50"
                  />
                  <button
                    onClick={() => copyToClipboard(link)}
                    className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-300"
                  >
                    <LinkIcon className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Current User Info */}
          <div className="text-xs text-gray-500 border-t pt-2">
            <p>Usuario actual: {user?.emailAddresses[0]?.emailAddress}</p>
            <p>Rol actual: {user?.publicMetadata?.role as string || 'No asignado'}</p>
            <p>User ID: {user?.id}</p>
          </div>
        </div>
      </details>
    </div>
  );
};