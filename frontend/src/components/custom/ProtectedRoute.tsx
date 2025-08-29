import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store';
import  type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles are required, check if user has the required role
  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If user is authenticated and has required role (if specified), render children
  return <>{children}</>;
}