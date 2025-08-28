import React from 'react';
import { DashboardOverview } from '../../components/dashboard/DashboardOverview';
import { AdminOnly } from '../../components/auth/ProtectedRoute';

export const AdminDashboard: React.FC = () => {
  return (
    <AdminOnly>
      <DashboardOverview />
    </AdminOnly>
  );
};

export default AdminDashboard;