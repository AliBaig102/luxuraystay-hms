import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store';
import { ReactNode } from 'react';

interface PublicRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export function PublicRoute({ children, redirectTo = '/dashboard' }: PublicRouteProps) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // If user is authenticated, redirect to dashboard or specified route
  if (isAuthenticated) {
    // Check if there's a 'from' location in state (where user was trying to go before login)
    const from = location.state?.from?.pathname || redirectTo;
    return <Navigate to={from} replace />;
  }

  // If user is not authenticated, render the public route (login/signup)
  return <>{children}</>;
}