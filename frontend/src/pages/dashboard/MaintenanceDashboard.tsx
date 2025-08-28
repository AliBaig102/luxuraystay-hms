import React from 'react';
import { DashboardOverview } from '../../components/dashboard/DashboardOverview';
import { StaffOnly } from '../../components/auth/ProtectedRoute';

export const MaintenanceDashboard: React.FC = () => {
  return (
    <StaffOnly>
      <DashboardOverview />
    </StaffOnly>
  );
};

export default MaintenanceDashboard;