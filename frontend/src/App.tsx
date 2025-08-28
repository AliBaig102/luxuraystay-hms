import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/custom/ProtectedRoute';
import { PublicRoute } from '@/components/custom/PublicRoute';
import { Login } from '@/pages/Login';
import { Signup } from '@/pages/Signup';
import { Dashboard } from '@/pages/Dashboard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Unauthorized } from '@/pages/Unauthorized';
import { AdminDashboard } from '@/pages/dashboard/AdminDashboard';
import { ManagerDashboard } from '@/pages/dashboard/ManagerDashboard';
import { ReceptionistDashboard } from '@/pages/dashboard/ReceptionistDashboard';
import { HousekeepingDashboard } from '@/pages/dashboard/HousekeepingDashboard';
import { MaintenanceDashboard } from '@/pages/dashboard/MaintenanceDashboard';
import { GuestDashboard } from '@/pages/dashboard/GuestDashboard';
import { RoomManagement } from '@/pages/rooms';
import { ReservationManagement } from '@/pages/reservations';
import { HousekeepingTasks } from '@/pages/housekeeping';
import { UserManagement } from '@/pages/users';
import { USER_ROLES } from '@/types/models';
import { ProtectedRoute as RoleProtectedRoute } from '@/components/auth/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes - redirect to dashboard if authenticated */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />
        
        {/* Protected Routes - require authentication */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Default dashboard route - redirects based on role */}
          <Route index element={<Dashboard />} />
          
          {/* Role-specific dashboard routes */}
          <Route
            path="admin"
            element={
              <RoleProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                <AdminDashboard />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="manager"
            element={
              <RoleProtectedRoute allowedRoles={[USER_ROLES.MANAGER, USER_ROLES.ADMIN]}>
                <ManagerDashboard />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="receptionist"
            element={
              <RoleProtectedRoute allowedRoles={[USER_ROLES.RECEPTIONIST, USER_ROLES.MANAGER, USER_ROLES.ADMIN]}>
                <ReceptionistDashboard />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="housekeeping"
            element={
              <RoleProtectedRoute allowedRoles={[USER_ROLES.HOUSEKEEPING, USER_ROLES.MANAGER, USER_ROLES.ADMIN]}>
                <HousekeepingDashboard />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="maintenance"
            element={
              <RoleProtectedRoute allowedRoles={[USER_ROLES.MAINTENANCE, USER_ROLES.MANAGER, USER_ROLES.ADMIN]}>
                <MaintenanceDashboard />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="guest"
            element={
              <RoleProtectedRoute allowedRoles={[USER_ROLES.GUEST]}>
                <GuestDashboard />
              </RoleProtectedRoute>
            }
          />
          
          {/* Module Routes */}
          <Route
            path="rooms"
            element={
              <RoleProtectedRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.MANAGER]}>
                <RoomManagement />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="reservations"
            element={
              <RoleProtectedRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.RECEPTIONIST]}>
                <ReservationManagement />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="housekeeping-tasks"
            element={
              <RoleProtectedRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.HOUSEKEEPING]}>
                <HousekeepingTasks />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="users"
            element={
              <RoleProtectedRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.MANAGER]}>
                <UserManagement />
              </RoleProtectedRoute>
            }
          />
        </Route>
        
        {/* Unauthorized page for role-based access */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* 404 page */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-background">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-destructive mb-4">404</h1>
                <p className="text-muted-foreground mb-4">
                  The page you're looking for doesn't exist.
                </p>
                <a href="/dashboard" className="text-primary hover:underline">
                  Go back to Dashboard
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
