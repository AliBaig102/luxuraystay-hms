import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { USER_ROLES } from '@/types/models';

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Redirect to role-specific dashboard
    switch (user.role) {
      case USER_ROLES.ADMIN:
        navigate('/dashboard/admin', { replace: true });
        break;
      case USER_ROLES.MANAGER:
        navigate('/dashboard/manager', { replace: true });
        break;
      case USER_ROLES.RECEPTIONIST:
        navigate('/dashboard/receptionist', { replace: true });
        break;
      case USER_ROLES.HOUSEKEEPING:
        navigate('/dashboard/housekeeping', { replace: true });
        break;
      case USER_ROLES.MAINTENANCE:
        navigate('/dashboard/maintenance', { replace: true });
        break;
      case USER_ROLES.GUEST:
        navigate('/dashboard/guest', { replace: true });
        break;
      default:
        navigate('/unauthorized', { replace: true });
        break;
    }
  }, [user, navigate]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}