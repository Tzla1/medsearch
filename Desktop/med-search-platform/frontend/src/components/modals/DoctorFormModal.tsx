import React, { useState, useEffect } from 'react';
import { BaseModal } from './BaseModal';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

interface Specialty {
  _id: string;
  name: string;
  nameEn: string;
}

interface DoctorFormData {
  licenseNumber: string;
  specialtyIds: string[];
  consultationFee: number;
  consultationDuration: number;
  languages: string[];
  about: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  availability: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isActive: boolean;
  }>;
  insuranceAccepted: string[];
  isAvailableForEmergency: boolean;
}

interface DoctorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor?: any; // For editing existing doctor
  onSuccess: () => void;
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' }
];

const COMMON_LANGUAGES = ['Español', 'Inglés', 'Francés', 'Portugués', 'Alemán'];
const COMMON_INSURANCE = ['IMSS', 'ISSSTE', 'Seguro Popular', 'Seguros Monterrey', 'GNP', 'AXA'];

export const DoctorFormModal: React.FC<DoctorFormModalProps> = ({
  isOpen,
  onClose,
  doctor,
  onSuccess
}) => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [formData, setFormData] = useState<DoctorFormData>({
    licenseNumber: '',
    specialtyIds: [],
    consultationFee: 1000,
    consultationDuration: 30,
    languages: ['Español'],
    about: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: 'México',
      zipCode: ''
    },
    availability: DAYS_OF_WEEK.slice(0, 5).map(day => ({
      dayOfWeek: day.value,
      startTime: '09:00',
      endTime: '17:00',
      isActive: true
    })),
    insuranceAccepted: [],
    isAvailableForEmergency: false
  });

  // Load specialties and populate form if editing
  useEffect(() => {
    if (isOpen) {
      fetchSpecialties();
      if (doctor) {
        populateFormData(doctor);
      } else {
        resetForm();
      }
    }
  }, [isOpen, doctor]);

  const fetchSpecialties = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/specialties?active=true`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSpecialties(data.specialties || []);
      }
    } catch (error) {
      console.error('Error fetching specialties:', error);
      toast.error('Error cargando especialidades');
    }
  };

  const populateFormData = (doctorData: any) => {
    setFormData({
      licenseNumber: doctorData.licenseNumber || '',
      specialtyIds: doctorData.specialtyIds?.map((s: any) => s._id || s) || [],
      consultationFee: doctorData.consultationFee || 1000,
      consultationDuration: doctorData.consultationDuration || 30,
      languages: doctorData.languages || ['Español'],
      about: doctorData.about || '',
      address: {
        street: doctorData.address?.street || '',
        city: doctorData.address?.city || '',
        state: doctorData.address?.state || '',
        country: doctorData.address?.country || 'México',
        zipCode: doctorData.address?.zipCode || ''
      },
      availability: doctorData.availability || formData.availability,
      insuranceAccepted: doctorData.insuranceAccepted || [],
      isAvailableForEmergency: doctorData.isAvailableForEmergency || false
    });
  };

  const resetForm = () => {
    setFormData({
      licenseNumber: '',
      specialtyIds: [],
      consultationFee: 1000,
      consultationDuration: 30,
      languages: ['Español'],
      about: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: 'México',
        zipCode: ''
      },
      availability: DAYS_OF_WEEK.slice(0, 5).map(day => ({
        dayOfWeek: day.value,
        startTime: '09:00',
        endTime: '17:00',
        isActive: true
      })),
      insuranceAccepted: [],
      isAvailableForEmergency: false
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await getToken();
      const url = doctor 
        ? `${import.meta.env.VITE_API_URL}/doctors/${doctor._id}`
        : `${import.meta.env.VITE_API_URL}/doctors`;
      
      const method = doctor ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(doctor ? 'Doctor actualizado exitosamente' : 'Doctor creado exitosamente');
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Error al guardar doctor');
      }
    } catch (error) {
      console.error('Error saving doctor:', error);
      toast.error('Error al guardar doctor');
    } finally {
      setLoading(false);
    }
  };

  const addLanguage = (language: string) => {
    if (!formData.languages.includes(language)) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, language]
      }));
    }
  };

  const removeLanguage = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang !== language)
    }));
  };

  const addInsurance = (insurance: string) => {
    if (!formData.insuranceAccepted.includes(insurance)) {
      setFormData(prev => ({
        ...prev,
        insuranceAccepted: [...prev.insuranceAccepted, insurance]
      }));
    }
  };

  const removeInsurance = (insurance: string) => {
    setFormData(prev => ({
      ...prev,
      insuranceAccepted: prev.insuranceAccepted.filter(ins => ins !== insurance)
    }));
  };

  const updateAvailability = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.map((avail, i) => 
        i === index ? { ...avail, [field]: value } : avail
      )
    }));
  };

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={doctor ? 'Editar Doctor' : 'Agregar Doctor'}
      size="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Cédula *
            </label>
            <input
              type="text"
              required
              value={formData.licenseNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ej: MED-12345-CDX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Especialidades *
            </label>
            <select
              multiple
              required
              value={formData.specialtyIds}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                specialtyIds: Array.from(e.target.selectedOptions, option => option.value)
              }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-24"
            >
              {specialties.map(specialty => (
                <option key={specialty._id} value={specialty._id}>
                  {specialty.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Mantén Ctrl para seleccionar múltiples</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tarifa de Consulta (MXN) *
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.consultationFee}
              onChange={(e) => setFormData(prev => ({ ...prev, consultationFee: Number(e.target.value) }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duración de Consulta (minutos)
            </label>
            <select
              value={formData.consultationDuration}
              onChange={(e) => setFormData(prev => ({ ...prev, consultationDuration: Number(e.target.value) }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value={15}>15 minutos</option>
              <option value={30}>30 minutos</option>
              <option value={45}>45 minutos</option>
              <option value={60}>1 hora</option>
            </select>
          </div>
        </div>

        {/* About */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción Profesional *
          </label>
          <textarea
            required
            value={formData.about}
            onChange={(e) => setFormData(prev => ({ ...prev, about: e.target.value }))}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Describe tu experiencia, especialización y enfoque médico..."
          />
        </div>

        {/* Address */}
        <div className="border-t pt-4">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Dirección del Consultorio</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calle y Número *
              </label>
              <input
                type="text"
                required
                value={formData.address.street}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  address: { ...prev.address, street: e.target.value }
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad *</label>
              <input
                type="text"
                required
                value={formData.address.city}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  address: { ...prev.address, city: e.target.value }
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado *</label>
              <input
                type="text"
                required
                value={formData.address.state}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  address: { ...prev.address, state: e.target.value }
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Código Postal *</label>
              <input
                type="text"
                required
                value={formData.address.zipCode}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  address: { ...prev.address, zipCode: e.target.value }
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">País</label>
              <input
                type="text"
                value={formData.address.country}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  address: { ...prev.address, country: e.target.value }
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
        </div>
        </div>

        {/* Languages */}
        <div className="border-t pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Idiomas</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.languages.map(language => (
              <span key={language} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800">
                {language}
                <button
                  type="button"
                  onClick={() => removeLanguage(language)}
                  className="ml-2 text-indigo-600 hover:text-indigo-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <select
            onChange={(e) => {
              if (e.target.value) {
                addLanguage(e.target.value);
                e.target.value = '';
              }
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Agregar idioma...</option>
            {COMMON_LANGUAGES.filter(lang => !formData.languages.includes(lang)).map(language => (
              <option key={language} value={language}>{language}</option>
            ))}
          </select>
        </div>

        {/* Insurance */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Seguros Aceptados</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.insuranceAccepted.map(insurance => (
              <span key={insurance} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                {insurance}
                <button
                  type="button"
                  onClick={() => removeInsurance(insurance)}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <select
            onChange={(e) => {
              if (e.target.value) {
                addInsurance(e.target.value);
                e.target.value = '';
              }
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Agregar seguro...</option>
            {COMMON_INSURANCE.filter(ins => !formData.insuranceAccepted.includes(ins)).map(insurance => (
              <option key={insurance} value={insurance}>{insurance}</option>
            ))}
          </select>
        </div>

        {/* Availability */}
        <div className="border-t pt-4">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Horarios de Atención</h4>
          <div className="space-y-3">
            {formData.availability.map((avail, index) => {
              const day = DAYS_OF_WEEK.find(d => d.value === avail.dayOfWeek);
              return (
                <div key={avail.dayOfWeek} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-20">
                    <span className="text-sm font-medium">{day?.label}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={avail.isActive}
                    onChange={(e) => updateAvailability(index, 'isActive', e.target.checked)}
                    className="text-indigo-600"
                  />
                  <input
                    type="time"
                    value={avail.startTime}
                    onChange={(e) => updateAvailability(index, 'startTime', e.target.value)}
                    disabled={!avail.isActive}
                    className="border border-gray-300 rounded px-2 py-1 text-sm disabled:bg-gray-200"
                  />
                  <span className="text-gray-500">a</span>
                  <input
                    type="time"
                    value={avail.endTime}
                    onChange={(e) => updateAvailability(index, 'endTime', e.target.value)}
                    disabled={!avail.isActive}
                    className="border border-gray-300 rounded px-2 py-1 text-sm disabled:bg-gray-200"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Emergency availability */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="emergency"
            checked={formData.isAvailableForEmergency}
            onChange={(e) => setFormData(prev => ({ ...prev, isAvailableForEmergency: e.target.checked }))}
            className="text-indigo-600"
          />
          <label htmlFor="emergency" className="ml-2 text-sm text-gray-700">
            Disponible para emergencias
          </label>
        </div>

        {/* Submit buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-gray-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : (doctor ? 'Actualizar Doctor' : 'Crear Doctor')}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};