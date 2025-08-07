import React, { useState, useEffect } from 'react';
import { BaseModal } from './BaseModal';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: any;
  onSuccess: () => void;
}

const APPOINTMENT_STATUSES = [
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
  'rescheduled'
];

const APPOINTMENT_TYPES = [
  'consultation',
  'follow_up',
  'emergency',
  'preventive',
  'procedure',
  'telemedicine'
];

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onSuccess
}) => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    status: 'pending',
    appointmentType: 'consultation',
    reasonForVisit: '',
    symptoms: [] as string[],
    diagnosis: '',
    doctorNotes: '',
    patientNotes: '',
    followUpRequired: false,
    followUpDate: '',
    prescriptions: [] as Array<{
      medication: string;
      dosage: string;
      frequency: string;
      duration: string;
      notes: string;
    }>,
    vitalSigns: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      weight: '',
      height: ''
    }
  });

  useEffect(() => {
    if (isOpen && appointment) {
      populateFormData(appointment);
    }
  }, [isOpen, appointment]);

  const populateFormData = (appointmentData: any) => {
    setFormData({
      status: appointmentData.status || 'pending',
      appointmentType: appointmentData.appointmentType || 'consultation',
      reasonForVisit: appointmentData.reasonForVisit || '',
      symptoms: appointmentData.symptoms || [],
      diagnosis: appointmentData.diagnosis || '',
      doctorNotes: appointmentData.doctorNotes || '',
      patientNotes: appointmentData.patientNotes || '',
      followUpRequired: appointmentData.followUpRequired || false,
      followUpDate: appointmentData.followUpDate ? new Date(appointmentData.followUpDate).toISOString().slice(0, 16) : '',
      prescriptions: appointmentData.prescriptions || [],
      vitalSigns: {
        bloodPressure: appointmentData.vitalSigns?.bloodPressure || '',
        heartRate: appointmentData.vitalSigns?.heartRate || '',
        temperature: appointmentData.vitalSigns?.temperature || '',
        weight: appointmentData.vitalSigns?.weight || '',
        height: appointmentData.vitalSigns?.height || ''
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment) return;

    setLoading(true);

    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/appointments/${appointment._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          followUpDate: formData.followUpDate ? new Date(formData.followUpDate) : null
        })
      });

      if (response.ok) {
        toast.success('Cita actualizada exitosamente');
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Error al actualizar cita');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Error al actualizar cita');
    } finally {
      setLoading(false);
    }
  };

  const addPrescription = () => {
    setFormData(prev => ({
      ...prev,
      prescriptions: [
        ...prev.prescriptions,
        { medication: '', dosage: '', frequency: '', duration: '', notes: '' }
      ]
    }));
  };

  const updatePrescription = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      prescriptions: prev.prescriptions.map((prescription, i) =>
        i === index ? { ...prescription, [field]: value } : prescription
      )
    }));
  };

  const removePrescription = (index: number) => {
    setFormData(prev => ({
      ...prev,
      prescriptions: prev.prescriptions.filter((_, i) => i !== index)
    }));
  };

  if (!appointment) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'confirmed': return 'text-blue-600 bg-blue-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      case 'in_progress': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Cita - ${appointment.customerId?.userId?.firstName || 'Paciente'}`}
      size="2xl"
    >
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Paciente:</span> {appointment.customerId?.userId?.firstName} {appointment.customerId?.userId?.lastName}
          </div>
          <div>
            <span className="font-medium">Doctor:</span> Dr. {appointment.doctorId?.userId?.firstName} {appointment.doctorId?.userId?.lastName}
          </div>
          <div>
            <span className="font-medium">Fecha:</span> {new Date(appointment.scheduledDate).toLocaleString()}
          </div>
          <div>
            <span className="font-medium">Estado actual:</span> 
            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(appointment.status)}`}>
              {appointment.status}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Status and Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado de la Cita
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {APPOINTMENT_STATUSES.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Cita
            </label>
            <select
              value={formData.appointmentType}
              onChange={(e) => setFormData(prev => ({ ...prev, appointmentType: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {APPOINTMENT_TYPES.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clinical Information */}
        <div className="border-t pt-4">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Información Clínica</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo de Consulta
              </label>
              <textarea
                value={formData.reasonForVisit}
                onChange={(e) => setFormData(prev => ({ ...prev, reasonForVisit: e.target.value }))}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diagnóstico
              </label>
              <textarea
                value={formData.diagnosis}
                onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Diagnóstico médico..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas del Doctor
                </label>
                <textarea
                  value={formData.doctorNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, doctorNotes: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas del Paciente
                </label>
                <textarea
                  value={formData.patientNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, patientNotes: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Comentarios del paciente..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Vital Signs */}
        <div className="border-t pt-4">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Signos Vitales</h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Presión Arterial
              </label>
              <input
                type="text"
                value={formData.vitalSigns.bloodPressure}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  vitalSigns: { ...prev.vitalSigns, bloodPressure: e.target.value }
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="120/80"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frecuencia Cardíaca
              </label>
              <input
                type="number"
                value={formData.vitalSigns.heartRate}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  vitalSigns: { ...prev.vitalSigns, heartRate: e.target.value }
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="bpm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperatura (°C)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.vitalSigns.temperature}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  vitalSigns: { ...prev.vitalSigns, temperature: e.target.value }
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="36.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Peso (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.vitalSigns.weight}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  vitalSigns: { ...prev.vitalSigns, weight: e.target.value }
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Altura (cm)
              </label>
              <input
                type="number"
                value={formData.vitalSigns.height}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  vitalSigns: { ...prev.vitalSigns, height: e.target.value }
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Follow-up */}
        <div className="border-t pt-4">
          <div className="flex items-center mb-3">
            <input
              type="checkbox"
              id="followUpRequired"
              checked={formData.followUpRequired}
              onChange={(e) => setFormData(prev => ({ ...prev, followUpRequired: e.target.checked }))}
              className="text-indigo-600"
            />
            <label htmlFor="followUpRequired" className="ml-2 text-sm font-medium text-gray-700">
              Requiere seguimiento
            </label>
          </div>
          
          {formData.followUpRequired && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Seguimiento
              </label>
              <input
                type="datetime-local"
                value={formData.followUpDate}
                onChange={(e) => setFormData(prev => ({ ...prev, followUpDate: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          )}
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
            {loading ? 'Guardando...' : 'Actualizar Cita'}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};