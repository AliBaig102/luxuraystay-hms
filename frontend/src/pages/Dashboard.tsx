import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { USER_ROLES } from "@/types/models";
import { GuestDashboard } from "./dashboard/GuestDashboard";
import { AdminDashboard } from "./dashboard/AdminDashboard";
import { ManagerDashboard } from "./dashboard/ManagerDashboard";
import { ReceptionistDashboard } from "./dashboard/ReceptionistDashboard";
import { HousekeepingDashboard } from "./dashboard/HousekeepingDashboard";
import { MaintenanceDashboard } from "./dashboard/MaintenanceDashboard";

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
  }, [user, navigate]);

  switch (user?.role) {
    case USER_ROLES.ADMIN:
      return <AdminDashboard />;
    case USER_ROLES.MANAGER:
      return <ManagerDashboard />;
    case USER_ROLES.RECEPTIONIST:
      return <ReceptionistDashboard />;
    case USER_ROLES.HOUSEKEEPING:
      return <HousekeepingDashboard />;
    case USER_ROLES.MAINTENANCE:
      return <MaintenanceDashboard />;
    case USER_ROLES.GUEST:
      return <GuestDashboard />;
    default:
      return <Navigate to="/unauthorized" replace />;
  }
}
