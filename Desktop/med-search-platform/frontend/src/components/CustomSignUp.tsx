import React, { useState } from 'react';
import { SignUp } from '@clerk/clerk-react';
import { RoleSelection, type UserRole } from '@components/RoleSelection';

interface CustomSignUpProps {
  onComplete?: () => void;
}

export const CustomSignUp: React.FC<CustomSignUpProps> = () => {
  const [step, setStep] = useState<'role' | 'signup'>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleContinueToSignup = () => {
    if (selectedRole) {
      setStep('signup');
    }
  };

  const handleBackToRole = () => {
    setStep('role');
  };

  if (step === 'role') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full">
          <RoleSelection 
            onRoleSelect={handleRoleSelect} 
            selectedRole={selectedRole || undefined}
          />
          
          {selectedRole && (
            <div className="text-center mt-8">
              <button
                onClick={handleContinueToSignup}
                className="bg-indigo-600 text-white px-8 py-3 rounded-full hover:bg-indigo-700 transition-colors font-semibold"
              >
                Continuar como {selectedRole === 'customer' ? 'Paciente' : selectedRole === 'doctor' ? 'Doctor' : 'Administrador'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <button
            onClick={handleBackToRole}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-500 mb-4"
          >
            ← Cambiar rol
          </button>
          <h2 className="text-3xl font-bold text-gray-900">
            Crear cuenta como {selectedRole === 'customer' ? 'Paciente' : selectedRole === 'doctor' ? 'Doctor' : 'Administrador'}
          </h2>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <SignUp
            appearance={{
              elements: {
                formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-sm',
                card: 'shadow-none',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                socialButtonsBlockButton: 'border-gray-300 hover:bg-gray-50',
                formFieldInput: 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500',
                footerActionLink: 'text-indigo-600 hover:text-indigo-500'
              }
            }}
            signInUrl="/login"
            afterSignUpUrl="/dashboard"
            unsafeMetadata={{
              role: selectedRole,
              onboardingCompleted: false,
              profileSetup: false
            }}
          />
        </div>
      </div>
    </div>
  );
};