import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/custom/ProtectedRoute";
import { PublicRoute } from "@/components/custom/PublicRoute";
import { RoleProtectedRoute } from "@/components/custom/RoleProtectedRoute";
import { Layout } from "@/components/dashboard/Layout";
import { Login } from "@/pages/Login";
import { Signup } from "@/pages/Signup";
import { Dashboard } from "@/pages/Dashboard";
import { Unauthorized } from "@/pages/Unauthorized";
import { NotFound } from "@/pages/NotFound";
import { Reservations } from "@/pages/dashboard/Reservations";
import { USER_ROLES } from "@/types/models";
import { Users } from "@/pages/users/Users";
import { Rooms } from "@/pages/rooms/Rooms";
import { Inventory } from "@/pages/inventory/Inventory";
import { Bills } from "@/pages/bills/Bills";
import { CheckIns } from "@/pages/checkins/CheckIns";
import { CheckOuts } from "@/pages/checkouts/CheckOuts";
import { Feedback } from "@/pages/feedback/Feedback";

export const AppRoutes = () => {
  return (
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
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route
          path="users"
          element={
            <RoleProtectedRoute
              allowedRoles={[
                USER_ROLES.GUEST,
                USER_ROLES.ADMIN,
                USER_ROLES.MANAGER,
                USER_ROLES.RECEPTIONIST,
              ]}
            >
              <Users />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="rooms"
          element={
            <RoleProtectedRoute
              allowedRoles={[
                USER_ROLES.ADMIN,
                USER_ROLES.MANAGER,
                USER_ROLES.RECEPTIONIST,
              ]}
            >
              <Rooms />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="reservations"
          element={
            <RoleProtectedRoute
              allowedRoles={[
                USER_ROLES.GUEST,
                USER_ROLES.ADMIN,
                USER_ROLES.MANAGER,
                USER_ROLES.RECEPTIONIST,
              ]}
            >
              <Reservations />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="bills"
          element={
            <RoleProtectedRoute
              allowedRoles={[
                USER_ROLES.ADMIN,
                USER_ROLES.MANAGER,
              ]}
            >
              <Bills />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="inventory"
          element={
            <RoleProtectedRoute
              allowedRoles={[
                USER_ROLES.ADMIN,
                USER_ROLES.MANAGER,
              ]}
            >
              <Inventory />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="checkins"
          element={
            <RoleProtectedRoute
              allowedRoles={[
                USER_ROLES.ADMIN,
                USER_ROLES.MANAGER,
                USER_ROLES.RECEPTIONIST,
              ]}
            >
              <CheckIns />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="checkouts"
          element={
            <RoleProtectedRoute
              allowedRoles={[
                USER_ROLES.ADMIN,
                USER_ROLES.MANAGER,
                USER_ROLES.RECEPTIONIST,
              ]}
            >
              <CheckOuts />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="feedback"
          element={
            <RoleProtectedRoute
              allowedRoles={[
                USER_ROLES.ADMIN,
                USER_ROLES.MANAGER,
                USER_ROLES.RECEPTIONIST,
                USER_ROLES.GUEST,
              ]}
            >
              <Feedback />
            </RoleProtectedRoute>
          }
        />
      </Route>

      {/* Unauthorized page for role-based access */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};