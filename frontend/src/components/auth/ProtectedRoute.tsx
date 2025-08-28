import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { type UserRole } from '../../types/models';
import { canAccessRoute, hasPermission } from '../../utils/permissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredPermission?: string;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requiredPermission,
  redirectTo = '/unauthorized'
}) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user role is allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check if user can access the current route
  if (!canAccessRoute(user.role, location.pathname)) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check specific permission if required
  if (requiredPermission) {
    if (!hasPermission(user.role, requiredPermission)) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  return <>{children}</>;
};

// Higher-order component for role-based protection
export const withRoleProtection = (
  Component: React.ComponentType<any>,
  allowedRoles: UserRole[]
) => {
  return (props: any) => (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

// Specific role protection components
export const AdminOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
    {children}
  </ProtectedRoute>
);

export const ManagerOrAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
    {children}
  </ProtectedRoute>
);

export const StaffOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST, UserRole.HOUSEKEEPING, UserRole.MAINTENANCE]}>
    {children}
  </ProtectedRoute>
);

export const GuestOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={[UserRole.GUEST]}>
    {children}
  </ProtectedRoute>
);

// Permission-based component
interface PermissionGuardProps {
  children: React.ReactNode;
  permission: string;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  fallback = null
}) => {
  const { user } = useAuth();

  if (!user || !hasPermission(user.role, permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};