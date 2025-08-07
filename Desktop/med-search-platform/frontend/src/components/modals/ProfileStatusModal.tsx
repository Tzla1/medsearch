import React, { useState, useEffect } from 'react';
import { BaseModal } from './BaseModal';
import { useAuth, useUser } from '@clerk/clerk-react';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  IdentificationIcon,
  HeartIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface UserProfile {
  _id: string;
  userId: {
    firstName: string;
    lastName: string;
    email: string;
  };
  dateOfBirth?: string;
  gender?: string;
  phoneNumber?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  medicalInfo?: {
    bloodType?: string;
    allergies?: string[];
    chronicConditions?: string[];
    currentMedications?: string[];
    insuranceProvider?: string;
    insuranceNumber?: string;
  };
  preferences?: {
    preferredLanguage?: string;
    notificationSettings?: {
      email: boolean;
      sms: boolean;
      appointmentReminders: boolean;
    };
  };
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

interface ProfileStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileStatusModal: React.FC<ProfileStatusModalProps> = ({
  isOpen,
  onClose
}) => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/customers/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar el perfil');
      }

      const data = await response.json();
      setProfile(data.customer || null);
      setEditedProfile(data.customer || {});
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Error al cargar la información del perfil');
      toast.error('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!editedProfile) return;

    setLoading(true);

    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/customers/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedProfile),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.customer);
        setEditMode(false);
        toast.success('Perfil actualizado exitosamente');
      } else {
        toast.error('Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No especificado';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getAccountStatus = () => {
    if (!profile) return { status: 'unknown', color: 'text-gray-600 bg-gray-50', label: 'Desconocido' };
    
    if (profile.isActive) {
      return { status: 'active', color: 'text-green-600 bg-green-50', label: 'Activa' };
    } else {
      return { status: 'inactive', color: 'text-red-600 bg-red-50', label: 'Inactiva' };
    }
  };

  const getProfileCompleteness = () => {
    if (!profile) return 0;
    
    const fields = [
      profile.dateOfBirth,
      profile.gender,
      profile.phoneNumber,
      profile.address?.street,
      profile.emergencyContact?.name,
      profile.medicalInfo?.bloodType
    ];
    
    const filledFields = fields.filter(field => field && field.toString().trim() !== '').length;
    return Math.round((filledFields / fields.length) * 100);
  };

  if (loading) {
    return (
      <BaseModal isOpen={isOpen} onClose={onClose} title="Perfil Personal" size="xl">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </BaseModal>
    );
  }

  if (error || !profile) {
    return (
      <BaseModal isOpen={isOpen} onClose={onClose} title="Perfil Personal" size="xl">
        <div className="text-center py-12">
          <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error || 'No se pudo cargar el perfil'}</p>
          <button
            onClick={fetchProfile}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </BaseModal>
    );
  }

  const accountStatus = getAccountStatus();
  const completeness = getProfileCompleteness();
  const age = calculateAge(profile.dateOfBirth);

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Perfil Personal"
      size="xl"
    >
      <div className="space-y-6">
        {/* Header with Status */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <UserIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {profile.userId.firstName} {profile.userId.lastName}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${accountStatus.color}`}>
                    {accountStatus.label}
                  </span>
                  <span className="text-sm text-gray-600">
                    Perfil {completeness}% completo
                  </span>
                </div>
                {age && (
                  <p className="text-sm text-gray-600 mt-1">{age} años</p>
                )}
              </div>
            </div>
            
            <button
              onClick={() => setEditMode(!editMode)}
              className="flex items-center space-x-1 px-3 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
            >
              <PencilIcon className="h-4 w-4" />
              <span className="text-sm">{editMode ? 'Cancelar' : 'Editar'}</span>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600">Completitud del perfil</span>
              <span className="text-xs text-gray-600">{completeness}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completeness}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">Información de Contacto</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">{profile.userId.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <PhoneIcon className="h-5 w-5 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-700">Teléfono</label>
                {editMode ? (
                  <input
                    type="tel"
                    value={editedProfile.phoneNumber || ''}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="w-full mt-1 px-2 py-1 border rounded text-sm"
                    placeholder="Ingresa tu teléfono"
                  />
                ) : (
                  <p className="text-gray-900">{profile.phoneNumber || 'No especificado'}</p>
                )}
              </div>
            </div>
          </div>

          {profile.address && (
            <div className="flex items-start space-x-3">
              <MapPinIcon className="h-5 w-5 text-gray-400 mt-1" />
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700">Dirección</label>
                <p className="text-gray-900">
                  {profile.address.street}, {profile.address.city}, {profile.address.state}
                  {profile.address.zipCode && ` ${profile.address.zipCode}`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Personal Information */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">Información Personal</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                {editMode ? (
                  <input
                    type="date"
                    value={editedProfile.dateOfBirth || ''}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    className="w-full mt-1 px-2 py-1 border rounded text-sm"
                  />
                ) : (
                  <p className="text-gray-900">{formatDate(profile.dateOfBirth)}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <IdentificationIcon className="h-5 w-5 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-700">Género</label>
                {editMode ? (
                  <select
                    value={editedProfile.gender || ''}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full mt-1 px-2 py-1 border rounded text-sm"
                    title="Seleccionar género"
                  >
                    <option value="">Seleccionar</option>
                    <option value="male">Masculino</option>
                    <option value="female">Femenino</option>
                    <option value="other">Otro</option>
                  </select>
                ) : (
                  <p className="text-gray-900">
                    {profile.gender === 'male' ? 'Masculino' : 
                     profile.gender === 'female' ? 'Femenino' : 
                     profile.gender === 'other' ? 'Otro' : 'No especificado'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Medical Information */}
        {profile.medicalInfo && (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
              <HeartIcon className="h-5 w-5 text-red-500" />
              <span>Información Médica</span>
            </h4>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {profile.medicalInfo.bloodType && (
                  <div>
                    <span className="font-medium">Tipo de Sangre:</span>
                    <span className="ml-2">{profile.medicalInfo.bloodType}</span>
                  </div>
                )}
                
                {profile.medicalInfo.allergies && profile.medicalInfo.allergies.length > 0 && (
                  <div className="md:col-span-2">
                    <span className="font-medium">Alergias:</span>
                    <span className="ml-2">{profile.medicalInfo.allergies.join(', ')}</span>
                  </div>
                )}

                {profile.medicalInfo.chronicConditions && profile.medicalInfo.chronicConditions.length > 0 && (
                  <div className="md:col-span-2">
                    <span className="font-medium">Condiciones Crónicas:</span>
                    <span className="ml-2">{profile.medicalInfo.chronicConditions.join(', ')}</span>
                  </div>
                )}

                {profile.medicalInfo.currentMedications && profile.medicalInfo.currentMedications.length > 0 && (
                  <div className="md:col-span-2">
                    <span className="font-medium">Medicamentos Actuales:</span>
                    <span className="ml-2">{profile.medicalInfo.currentMedications.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Emergency Contact */}
        {profile.emergencyContact && (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">Contacto de Emergencia</h4>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Nombre:</span>
                  <span className="ml-2">{profile.emergencyContact.name}</span>
                </div>
                <div>
                  <span className="font-medium">Relación:</span>
                  <span className="ml-2">{profile.emergencyContact.relationship}</span>
                </div>
                <div>
                  <span className="font-medium">Teléfono:</span>
                  <span className="ml-2">{profile.emergencyContact.phone}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Account Activity */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">Actividad de la Cuenta</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Cuenta creada:</span>
              <span className="ml-2 text-gray-600">{formatDate(profile.createdAt)}</span>
            </div>
            {profile.lastLoginAt && (
              <div>
                <span className="font-medium text-gray-700">Último acceso:</span>
                <span className="ml-2 text-gray-600">{formatDate(profile.lastLoginAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          {editMode ? (
            <>
              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={updateProfile}
                disabled={loading}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </BaseModal>
  );
};