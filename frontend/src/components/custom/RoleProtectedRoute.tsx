/* eslint-disable react-refresh/only-export-components */
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { USER_ROLES, type UserRole } from "../../types/models";
import { canAccessRoute, hasPermission } from "@/lib/permissions";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredPermission?: string;
  redirectTo?: string;
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  allowedRoles,
  requiredPermission,
  redirectTo = "/unauthorized",
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
    <RoleProtectedRoute allowedRoles={allowedRoles}>
      <Component {...props} />
    </RoleProtectedRoute>
  );
};

// Specific role protection components
export const AdminOnly: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <RoleProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
    {children}
  </RoleProtectedRoute>
);

export const ManagerOrAdmin: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <RoleProtectedRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.MANAGER]}>
    {children}
  </RoleProtectedRoute>
);

export const StaffOnly: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <RoleProtectedRoute
    allowedRoles={[
      USER_ROLES.ADMIN,
      USER_ROLES.MANAGER,
      USER_ROLES.RECEPTIONIST,
      USER_ROLES.HOUSEKEEPING,
      USER_ROLES.MAINTENANCE,
    ]}
  >
    {children}
  </RoleProtectedRoute>
);

export const GuestOnly: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <RoleProtectedRoute allowedRoles={[USER_ROLES.GUEST]}>
    {children}
  </RoleProtectedRoute>
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
  fallback = null,
}) => {
  const { user } = useAuth();

  if (!user || !hasPermission(user.role, permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
