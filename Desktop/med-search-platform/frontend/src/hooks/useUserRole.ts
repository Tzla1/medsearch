import { useUser } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';

export type UserRole = 'customer' | 'doctor' | 'company_admin' | 'super_admin';

interface UserRoleData {
  role: UserRole | null;
  isLoading: boolean;
  hasRole: boolean;
  metadata: {
    onboardingCompleted?: boolean;
    profileSetup?: boolean;
    [key: string]: any;
  };
}

export const useUserRole = (): UserRoleData => {
  const { user, isLoaded } = useUser();
  const [roleData, setRoleData] = useState<UserRoleData>({
    role: null,
    isLoading: true,
    hasRole: false,
    metadata: {}
  });

  useEffect(() => {
    if (!isLoaded) {
      setRoleData(prev => ({ ...prev, isLoading: true }));
      return;
    }

    if (!user) {
      setRoleData({
        role: null,
        isLoading: false,
        hasRole: false,
        metadata: {}
      });
      return;
    }

    // Get role from publicMetadata first, then unsafeMetadata as fallback
    const publicRole = user.publicMetadata?.role as UserRole;
    const unsafeRole = user.unsafeMetadata?.role as UserRole;
    const role = publicRole || unsafeRole || null;

    // Get additional metadata
    const metadata = {
      ...user.unsafeMetadata,
      ...user.publicMetadata
    };

    setRoleData({
      role,
      isLoading: false,
      hasRole: Boolean(role),
      metadata
    });
  }, [user, isLoaded]);

  return roleData;
};

// Hook to redirect users based on their role
export const useRoleBasedRedirect = () => {
  const { role, isLoading, hasRole, metadata } = useUserRole();

  const getRedirectPath = (): string => {
    if (!hasRole || !role) {
      return '/onboarding'; // Redirect to role selection if no role
    }

    // Check if onboarding is completed
    if (!metadata.onboardingCompleted) {
      return `/onboarding/${role}`;
    }

    // Redirect based on role
    switch (role) {
      case 'customer':
        return '/patient/dashboard';
      case 'doctor':
        return '/doctor/dashboard';
      case 'company_admin':
      case 'super_admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  const shouldRedirect = !isLoading && hasRole;

  return {
    shouldRedirect,
    redirectPath: getRedirectPath(),
    role,
    isLoading,
    hasRole,
    metadata
  };
};

// Hook to check if user has specific permission
export const usePermissions = () => {
  const { role } = useUserRole();

  const hasPermission = (permission: string): boolean => {
    if (!role) return false;

    const rolePermissions = {
      customer: [
        'view_doctors',
        'book_appointments',
        'view_own_appointments',
        'rate_doctors',
        'view_own_profile'
      ],
      doctor: [
        'view_own_appointments',
        'manage_availability',
        'view_patient_info',
        'respond_to_reviews',
        'manage_own_profile'
      ],
      company_admin: [
        'moderate_doctors',
        'moderate_customers', 
        'view_reports',
        'manage_specialties',
        'view_all_appointments'
      ],
      super_admin: ['*'] // All permissions
    };

    const userPermissions = rolePermissions[role] || [];
    
    return userPermissions.includes('*') || userPermissions.includes(permission);
  };

  const isAdmin = (): boolean => {
    return role === 'company_admin' || role === 'super_admin';
  };

  const isDoctor = (): boolean => {
    return role === 'doctor';
  };

  const isCustomer = (): boolean => {
    return role === 'customer';
  };

  return {
    hasPermission,
    isAdmin,
    isDoctor,
    isCustomer,
    role
  };
};