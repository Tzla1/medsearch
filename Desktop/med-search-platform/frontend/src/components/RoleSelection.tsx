import React, { useState } from 'react';
import { UserIcon, HeartIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

export type UserRole = 'customer' | 'doctor' | 'company_admin';

interface RoleSelectionProps {
  onRoleSelect: (role: UserRole) => void;
  selectedRole?: UserRole;
}

const roles = [
  {
    id: 'customer' as UserRole,
    title: 'Paciente',
    description: 'Busca y agenda citas con doctores',
    icon: UserIcon,
    features: [
      'Buscar doctores por especialidad',
      'Agendar citas médicas',
      'Ver historial médico',
      'Calificar doctores'
    ],
    color: 'bg-blue-50 border-blue-200 hover:bg-blue-100'
  },
  {
    id: 'doctor' as UserRole,
    title: 'Doctor',
    description: 'Gestiona tu consulta y pacientes',
    icon: HeartIcon,
    features: [
      'Gestionar horarios disponibles',
      'Ver citas programadas',
      'Acceder a historiales de pacientes',
      'Responder a reseñas'
    ],
    color: 'bg-green-50 border-green-200 hover:bg-green-100'
  },
  {
    id: 'company_admin' as UserRole,
    title: 'Administrador',
    description: 'Administra la plataforma médica',
    icon: BuildingOfficeIcon,
    features: [
      'Moderar doctores y pacientes',
      'Gestionar especialidades',
      'Ver reportes y analytics',
      'Configurar plataforma'
    ],
    color: 'bg-purple-50 border-purple-200 hover:bg-purple-100'
  }
];

export const RoleSelection: React.FC<RoleSelectionProps> = ({ onRoleSelect, selectedRole }) => {
  const [hoveredRole, setHoveredRole] = useState<UserRole | null>(null);

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          ¿Cómo planeas usar MedSearch?
        </h2>
        <p className="text-lg text-gray-600">
          Selecciona tu rol para personalizar tu experiencia
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.id;
          const isHovered = hoveredRole === role.id;

          return (
            <div
              key={role.id}
              className={`
                relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-200
                ${isSelected 
                  ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200' 
                  : role.color
                }
                ${isHovered && !isSelected ? 'transform scale-105 shadow-lg' : ''}
              `}
              onClick={() => onRoleSelect(role.id)}
              onMouseEnter={() => setHoveredRole(role.id)}
              onMouseLeave={() => setHoveredRole(null)}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 bg-indigo-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                  ✓
                </div>
              )}

              <div className="text-center">
                <div className={`
                  inline-flex items-center justify-center w-16 h-16 rounded-full mb-4
                  ${isSelected ? 'bg-indigo-100' : 'bg-white'}
                `}>
                  <Icon className={`
                    w-8 h-8
                    ${isSelected ? 'text-indigo-600' : 'text-gray-600'}
                  `} />
                </div>

                <h3 className={`
                  text-xl font-semibold mb-2
                  ${isSelected ? 'text-indigo-900' : 'text-gray-900'}
                `}>
                  {role.title}
                </h3>

                <p className={`
                  text-sm mb-4
                  ${isSelected ? 'text-indigo-700' : 'text-gray-600'}
                `}>
                  {role.description}
                </p>

                <ul className="text-left space-y-2">
                  {role.features.map((feature, index) => (
                    <li key={index} className={`
                      flex items-center text-sm
                      ${isSelected ? 'text-indigo-700' : 'text-gray-600'}
                    `}>
                      <div className={`
                        w-1.5 h-1.5 rounded-full mr-2
                        ${isSelected ? 'bg-indigo-500' : 'bg-gray-400'}
                      `} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Podrás cambiar tu rol más tarde en la configuración de tu cuenta
        </p>
      </div>
    </div>
  );
};