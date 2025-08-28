import React from 'react';
import { DashboardOverview } from '../../components/dashboard/DashboardOverview';
import { GuestOnly } from '../../components/auth/ProtectedRoute';

export const GuestDashboard: React.FC = () => {
  return (
    <GuestOnly>
      <DashboardOverview />
    </GuestOnly>
  );
};

export default GuestDashboard;