import React, { useState, useEffect } from 'react';
import { BaseModal } from './BaseModal';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

interface SpecialtyFormData {
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
  category: string;
  commonConditions: string[];
  commonProcedures: string[];
  priority: number;
  seoKeywords: string[];
}

interface SpecialtyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  specialty?: any;
  onSuccess: () => void;
}

const CATEGORIES = [
  'Medical',
  'Surgical', 
  'Diagnostic',
  'Mental Health',
  'Pediatric',
  'Women Health',
  'Emergency',
  'Preventive',
  'Alternative'
];

const COMMON_ICONS = [
  '❤️', '🧠', '👁️', '🦴', '🩺', '💊', '🔬', '🩹', 
  '👶', '👩‍⚕️', '🚨', '🧴', '💉', '🩻', '🔬', '⚕️'
];

export const SpecialtyFormModal: React.FC<SpecialtyFormModalProps> = ({
  isOpen,
  onClose,
  specialty,
  onSuccess
}) => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SpecialtyFormData>({
    name: '',
    nameEn: '',
    description: '',
    descriptionEn: '',
    icon: '🩺',
    category: 'Medical',
    commonConditions: [],
    commonProcedures: [],
    priority: 5,
    seoKeywords: []
  });
  const [newCondition, setNewCondition] = useState('');
  const [newProcedure, setNewProcedure] = useState('');
  const [newKeyword, setNewKeyword] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (specialty) {
        populateFormData(specialty);
      } else {
        resetForm();
      }
    }
  }, [isOpen, specialty]);

  const populateFormData = (specialtyData: any) => {
    setFormData({
      name: specialtyData.name || '',
      nameEn: specialtyData.nameEn || '',
      description: specialtyData.description || '',
      descriptionEn: specialtyData.descriptionEn || '',
      icon: specialtyData.icon || '🩺',
      category: specialtyData.category || 'Medical',
      commonConditions: specialtyData.commonConditions || [],
      commonProcedures: specialtyData.commonProcedures || [],
      priority: specialtyData.priority || 5,
      seoKeywords: specialtyData.seoKeywords || []
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nameEn: '',
      description: '',
      descriptionEn: '',
      icon: '🩺',
      category: 'Medical',
      commonConditions: [],
      commonProcedures: [],
      priority: 5,
      seoKeywords: []
    });
    setNewCondition('');
    setNewProcedure('');
    setNewKeyword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await getToken();
      const url = specialty 
        ? `${import.meta.env.VITE_API_URL}/specialties/${specialty._id}`
        : `${import.meta.env.VITE_API_URL}/specialties`;
      
      const method = specialty ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(specialty ? 'Especialidad actualizada exitosamente' : 'Especialidad creada exitosamente');
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Error al guardar especialidad');
      }
    } catch (error) {
      console.error('Error saving specialty:', error);
      toast.error('Error al guardar especialidad');
    } finally {
      setLoading(false);
    }
  };

  const addCondition = () => {
    if (newCondition.trim() && !formData.commonConditions.includes(newCondition.trim())) {
      setFormData(prev => ({
        ...prev,
        commonConditions: [...prev.commonConditions, newCondition.trim()]
      }));
      setNewCondition('');
    }
  };

  const removeCondition = (condition: string) => {
    setFormData(prev => ({
      ...prev,
      commonConditions: prev.commonConditions.filter(c => c !== condition)
    }));
  };

  const addProcedure = () => {
    if (newProcedure.trim() && !formData.commonProcedures.includes(newProcedure.trim())) {
      setFormData(prev => ({
        ...prev,
        commonProcedures: [...prev.commonProcedures, newProcedure.trim()]
      }));
      setNewProcedure('');
    }
  };

  const removeProcedure = (procedure: string) => {
    setFormData(prev => ({
      ...prev,
      commonProcedures: prev.commonProcedures.filter(p => p !== procedure)
    }));
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.seoKeywords.includes(newKeyword.trim().toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        seoKeywords: [...prev.seoKeywords, newKeyword.trim().toLowerCase()]
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      seoKeywords: prev.seoKeywords.filter(k => k !== keyword)
    }));
  };

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={specialty ? 'Editar Especialidad' : 'Agregar Especialidad'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre (Español) *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ej: Cardiología"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre (Inglés) *
            </label>
            <input
              type="text"
              required
              value={formData.nameEn}
              onChange={(e) => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ej: Cardiology"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icono *
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                value={formData.icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Emoji o icono"
              />
              <div className="flex gap-1">
                {COMMON_ICONS.slice(0, 8).map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, icon }))}
                    className="p-1 text-lg hover:bg-gray-100 rounded"
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prioridad (1-10)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: Number(e.target.value) }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">Mayor número = mayor prioridad en listados</p>
          </div>
        </div>

        {/* Descriptions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción (Español) *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              maxLength={500}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Describe la especialidad médica..."
            />
            <p className="text-xs text-gray-500 mt-1">{formData.description.length}/500</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción (Inglés) *
            </label>
            <textarea
              required
              value={formData.descriptionEn}
              onChange={(e) => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
              rows={3}
              maxLength={500}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Describe the medical specialty in English..."
            />
            <p className="text-xs text-gray-500 mt-1">{formData.descriptionEn.length}/500</p>
          </div>
        </div>

        {/* Common Conditions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Condiciones Comunes
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.commonConditions.map(condition => (
              <span key={condition} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                {condition}
                <button
                  type="button"
                  onClick={() => removeCondition(condition)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCondition}
              onChange={(e) => setNewCondition(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCondition())}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ej: Hipertensión arterial"
            />
            <button
              type="button"
              onClick={addCondition}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Agregar
            </button>
          </div>
        </div>

        {/* Common Procedures */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Procedimientos Comunes
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.commonProcedures.map(procedure => (
              <span key={procedure} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                {procedure}
                <button
                  type="button"
                  onClick={() => removeProcedure(procedure)}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newProcedure}
              onChange={(e) => setNewProcedure(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addProcedure())}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ej: Electrocardiograma"
            />
            <button
              type="button"
              onClick={addProcedure}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Agregar
            </button>
          </div>
        </div>

        {/* SEO Keywords */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Palabras Clave SEO
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.seoKeywords.map(keyword => (
              <span key={keyword} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                {keyword}
                <button
                  type="button"
                  onClick={() => removeKeyword(keyword)}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ej: corazón, cardiología"
            />
            <button
              type="button"
              onClick={addKeyword}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Agregar
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Las palabras clave ayudan a los pacientes a encontrar especialistas</p>
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
            {loading ? 'Guardando...' : (specialty ? 'Actualizar Especialidad' : 'Crear Especialidad')}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};