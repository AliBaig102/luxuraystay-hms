import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../store';
import type { UserRole } from '../../types/models';
import { Badge } from '../ui/badge';

import { StatCard } from './StatCard';
import { QuickAction } from './QuickAction';
import { useMockApi } from '../../hooks/useMockApi';

import {
  Building,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckSquare,
  Clock,
  AlertTriangle,
  CreditCard,
  Wrench,
  Package,
  Sparkles,
} from 'lucide-react';



interface DashboardStats {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  totalUsers: number;
  activeUsers: number;
  totalReservations: number;
  pendingReservations: number;
  todayCheckIns: number;
  todayCheckOuts: number;
  monthlyRevenue: number;
  pendingTasks: number;
  completedTasks: number;
  maintenanceRequests: number;
  inventoryAlerts: number;
}

export const DashboardOverview: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalRooms: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalReservations: 0,
    pendingReservations: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0,
    monthlyRevenue: 0,
    pendingTasks: 0,
    completedTasks: 0,
    maintenanceRequests: 0,
    inventoryAlerts: 0,
  });
  const [loading, setLoading] = useState(true);

  const { data: roomsData } = useMockApi('/rooms');
  const { data: usersData } = useMockApi('/users');
  const { data: reservationsData } = useMockApi('/reservations');
  const { data: tasksData } = useMockApi('/housekeeping');

  useEffect(() => {
    if (roomsData && usersData && reservationsData && tasksData) {
      const totalRooms = roomsData.length;
      const occupiedRooms = roomsData.filter(room => room.status === 'OCCUPIED').length;
      const availableRooms = roomsData.filter(room => room.status === 'AVAILABLE').length;
      const totalUsers = usersData.length;
      const activeUsers = usersData.filter(user => user.status === 'ACTIVE').length;
      const totalReservations = reservationsData.length;
      const pendingReservations = reservationsData.filter(res => res.status === 'PENDING').length;
      const todayCheckIns = reservationsData.filter(res => {
        const today = new Date().toDateString();
        return new Date(res.checkInDate).toDateString() === today;
      }).length;
      const todayCheckOuts = reservationsData.filter(res => {
        const today = new Date().toDateString();
        return new Date(res.checkOutDate).toDateString() === today;
      }).length;
      const monthlyRevenue = reservationsData.reduce((sum, res) => sum + res.totalAmount, 0);
      const pendingTasks = tasksData.filter(task => task.status === 'PENDING').length;
      const completedTasks = tasksData.filter(task => task.status === 'COMPLETED').length;
      
      setStats({
        totalRooms,
        occupiedRooms,
        availableRooms,
        totalUsers,
        activeUsers,
        totalReservations,
        pendingReservations,
        todayCheckIns,
        todayCheckOuts,
        monthlyRevenue,
        pendingTasks,
        completedTasks,
        maintenanceRequests: 3,
        inventoryAlerts: 5,
      });
      setLoading(false);
    }
  }, [roomsData, usersData, reservationsData, tasksData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Fallback data for when API is not available
  const fallbackStats = {
    totalRooms: 150,
    occupiedRooms: 120,
    availableRooms: 30,
    pendingReservations: 25,
    todayCheckIns: 15,
    todayCheckOuts: 12,
    totalUsers: 45,
    monthlyRevenue: 125000,
    completedTasks: 28,
    pendingTasks: 12,
    maintenanceRequests: 8,
    inventoryAlerts: 3,
  };

  // Use real stats or fallback to default data
  const displayStats = stats.totalRooms > 0 ? stats : fallbackStats;

  const renderAdminDashboard = () => (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Rooms"
          value={displayStats.totalRooms}
          description="Hotel capacity"
          icon={<Building className="h-4 w-4" />}
        />
        <StatCard
          title="Occupancy Rate"
          value={`${Math.round((displayStats.occupiedRooms / displayStats.totalRooms) * 100)}%`}
          description={`${displayStats.occupiedRooms} of ${displayStats.totalRooms} rooms`}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          title="Total Users"
          value={displayStats.totalUsers}
          description="Staff and guests"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${displayStats.monthlyRevenue.toLocaleString()}`}
          description="Revenue this month"
          icon={<DollarSign className="h-4 w-4" />}
          trend={{ value: 12.5, isPositive: true }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
        <QuickAction
          title="User Management"
          description="Manage staff accounts and permissions"
          icon={<Users className="h-5 w-5" />}
          onClick={() => navigate('/users')}
        />
        <QuickAction
          title="System Reports"
          description="Generate comprehensive reports"
          icon={<TrendingUp className="h-5 w-5" />}
          onClick={() => navigate('/reports')}
        />
        <QuickAction
          title="Hotel Settings"
          description="Configure hotel settings and preferences"
          icon={<Building className="h-5 w-5" />}
          onClick={() => navigate('/settings')}
        />
      </div>
    </>
  );

  const renderManagerDashboard = () => (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Monthly Revenue"
          value={`$${displayStats.monthlyRevenue.toLocaleString()}`}
          description="Revenue this month"
          icon={<DollarSign className="h-4 w-4" />}
          trend={{ value: 15.3, isPositive: true }}
        />
        <StatCard
          title="Room Occupancy"
          value={`${Math.round((displayStats.occupiedRooms / displayStats.totalRooms) * 100)}%`}
          description={`${displayStats.occupiedRooms} of ${displayStats.totalRooms} rooms`}
          icon={<Building className="h-4 w-4" />}
        />
        <StatCard
          title="Staff Tasks"
          value={`${stats.completedTasks}/${stats.completedTasks + stats.pendingTasks}`}
          description="Tasks completed today"
          icon={<CheckSquare className="h-4 w-4" />}
        />
        <StatCard
          title="Maintenance Issues"
          value={stats.maintenanceRequests}
          description="Pending maintenance requests"
          icon={<Wrench className="h-4 w-4" />}
          variant={stats.maintenanceRequests > 5 ? 'urgent' : 'default'}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
        <QuickAction
          title="Staff Management"
          description="Manage staff schedules and assignments"
          icon={<Users className="h-5 w-5" />}
          onClick={() => navigate('/users')}
        />
        <QuickAction
          title="Room Operations"
          description="Monitor room status and assignments"
          icon={<Building className="h-5 w-5" />}
          onClick={() => navigate('/rooms')}
        />
        <QuickAction
          title="Generate Reports"
          description="Create operational reports"
          icon={<TrendingUp className="h-5 w-5" />}
          onClick={() => navigate('/reports')}
        />
      </div>
    </>
  );

  const renderReceptionistDashboard = () => (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Check-ins"
          value={displayStats.todayCheckIns}
          description="Guests checking in today"
          icon={<Calendar className="h-4 w-4" />}
        />
        <StatCard
          title="Today's Check-outs"
          value={displayStats.todayCheckOuts}
          description="Guests checking out today"
          icon={<Clock className="h-4 w-4" />}
        />
        <StatCard
          title="Available Rooms"
          value={displayStats.availableRooms}
          description="Ready for new guests"
          icon={<Building className="h-4 w-4" />}
        />
        <StatCard
          title="Pending Reservations"
          value={displayStats.pendingReservations}
          description="Awaiting confirmation"
          icon={<AlertTriangle className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
        <QuickAction
          title="New Reservation"
          description="Create a new guest reservation"
          icon={<Calendar className="h-5 w-5" />}
          onClick={() => navigate('/reservations')}
        />
        <QuickAction
          title="Check-in Guest"
          description="Process guest check-in"
          icon={<Users className="h-5 w-5" />}
          onClick={() => navigate('/checkin')}
        />
        <QuickAction
          title="Check-out Guest"
          description="Process guest check-out"
          icon={<CreditCard className="h-5 w-5" />}
          onClick={() => navigate('/checkout')}
        />
      </div>
    </>
  );

  const renderHousekeepingDashboard = () => (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pending Tasks"
          value={displayStats.pendingTasks}
          description="Tasks assigned to you"
          icon={<CheckSquare className="h-4 w-4" />}
        />
        <StatCard
          title="Completed Today"
          value={displayStats.completedTasks}
          description="Tasks completed today"
          icon={<Sparkles className="h-4 w-4" />}
        />
        <StatCard
          title="Rooms to Clean"
          value={displayStats.totalRooms - displayStats.occupiedRooms}
          description="Rooms requiring cleaning"
          icon={<Building className="h-4 w-4" />}
        />
        <StatCard
          title="Supply Alerts"
          value={displayStats.inventoryAlerts}
          description="Low inventory items"
          icon={<Package className="h-4 w-4" />}
          variant={displayStats.inventoryAlerts > 3 ? 'urgent' : 'default'}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
        <QuickAction
          title="My Tasks"
          description="View and update your assigned tasks"
          icon={<CheckSquare className="h-5 w-5" />}
          onClick={() => navigate('/housekeeping')}
        />
        <QuickAction
          title="Room Status"
          description="Check room cleaning status"
          icon={<Building className="h-5 w-5" />}
          onClick={() => navigate('/rooms')}
        />
        <QuickAction
          title="Supplies"
          description="Check inventory and supplies"
          icon={<Package className="h-5 w-5" />}
          onClick={() => navigate('/inventory')}
        />
      </div>
    </>
  );

  const renderMaintenanceDashboard = () => (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Open Requests"
          value={displayStats.maintenanceRequests}
          description="Maintenance requests pending"
          icon={<Wrench className="h-4 w-4" />}
        />
        <StatCard
          title="Completed Today"
          value={displayStats.completedTasks}
          description="Requests completed today"
          icon={<CheckSquare className="h-4 w-4" />}
        />
        <StatCard
          title="Priority Issues"
          value={Math.floor(displayStats.maintenanceRequests / 3)}
          description="High priority maintenance"
          icon={<AlertTriangle className="h-4 w-4" />}
          variant="urgent"
        />
        <StatCard
          title="Equipment Status"
          value="92%"
          description="Equipment operational rate"
          icon={<Package className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
        <QuickAction
          title="Maintenance Requests"
          description="View and manage maintenance requests"
          icon={<Wrench className="h-5 w-5" />}
          onClick={() => navigate('/maintenance')}
        />
        <QuickAction
          title="Equipment Status"
          description="Check equipment and tools status"
          icon={<Package className="h-5 w-5" />}
          onClick={() => navigate('/inventory')}
        />
        <QuickAction
          title="Room Inspections"
          description="Schedule and perform room inspections"
          icon={<Building className="h-5 w-5" />}
          onClick={() => navigate('/rooms')}
        />
      </div>
    </>
  );

  const renderGuestDashboard = () => (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Current Stay"
          value="Room 205"
          description="Deluxe Ocean View"
          icon={<Building className="h-4 w-4" />}
        />
        <StatCard
          title="Check-out"
          value="Tomorrow"
          description="11:00 AM"
          icon={<Clock className="h-4 w-4" />}
        />
        <StatCard
          title="Total Bill"
          value="$450"
          description="Current charges"
          icon={<CreditCard className="h-4 w-4" />}
        />
        <StatCard
          title="Services Used"
          value="3"
          description="Room service, Spa, Laundry"
          icon={<Sparkles className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
        <QuickAction
          title="Request Service"
          description="Order room service or request assistance"
          icon={<Sparkles className="h-5 w-5" />}
          onClick={() => navigate('/services')}
        />
        <QuickAction
          title="View Bill"
          description="Check your current charges and bill"
          icon={<CreditCard className="h-5 w-5" />}
          onClick={() => navigate('/billing')}
        />
        <QuickAction
          title="Provide Feedback"
          description="Share your experience with us"
          icon={<Users className="h-5 w-5" />}
          onClick={() => navigate('/feedback')}
        />
      </div>
    </>
  );

  const renderDashboardContent = () => {
    if (!user) return null;

    switch (user.role) {
      case UserRole.ADMIN:
        return renderAdminDashboard();
      case UserRole.MANAGER:
        return renderManagerDashboard();
      case UserRole.RECEPTIONIST:
        return renderReceptionistDashboard();
      case UserRole.HOUSEKEEPING:
        return renderHousekeepingDashboard();
      case UserRole.MAINTENANCE:
        return renderMaintenanceDashboard();
      case UserRole.GUEST:
        return renderGuestDashboard();
      default:
        return <div>Unknown role</div>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Here's what's happening today.
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {user?.role}
        </Badge>
      </div>

      {renderDashboardContent()}
    </div>
  );
};