import React from 'react';
import { DashboardOverview } from '../../components/dashboard/DashboardOverview';
import { ManagerOrAdmin } from '../../components/auth/ProtectedRoute';

export const ManagerDashboard: React.FC = () => {
  return (
    <ManagerOrAdmin>
      <DashboardOverview />
    </ManagerOrAdmin>
  );
};

export default ManagerDashboard;