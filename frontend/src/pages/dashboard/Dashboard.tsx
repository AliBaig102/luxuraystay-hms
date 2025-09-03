import { useAuth } from "@/hooks/useAuth";
import { USER_ROLES } from "@/types/models";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui";
import { 
  Bed, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Wrench,
  Bell
} from "lucide-react";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { OccupancyChart } from "@/components/dashboard/OccupancyChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { MaintenanceOverview } from "@/components/dashboard/MaintenanceOverview";
import { HousekeepingOverview } from "@/components/dashboard/HousekeepingOverview";
import { FeedbackOverview } from "@/components/dashboard/FeedbackOverview";
import { NotificationsOverview } from "@/components/dashboard/NotificationsOverview";

export const Dashboard = () => {
  const { user: currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-muted-foreground">
            Loading Dashboard...
          </h2>
        </div>
      </div>
    );
  }

  const isAdmin = currentUser.role === USER_ROLES.ADMIN;
  const isManager = currentUser.role === USER_ROLES.MANAGER;
  const isReceptionist = currentUser.role === USER_ROLES.RECEPTIONIST;
  const isHousekeeping = currentUser.role === USER_ROLES.HOUSEKEEPING;
  const isMaintenance = currentUser.role === USER_ROLES.MAINTENANCE;
  const isGuest = currentUser.role === USER_ROLES.GUEST;

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {currentUser.firstName}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening at Luxury Stay Hotel today.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-right">
            <p className="text-sm font-medium">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Role-based Dashboard Content */}
      {isAdmin && (
        <>
          {/* Admin Dashboard - Full Access */}
          <StatsOverview />
          
          <div className="grid gap-6 md:grid-cols-2">
            <RevenueChart />
            <OccupancyChart />
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <MaintenanceOverview />
            <HousekeepingOverview />
            <FeedbackOverview />
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <RecentActivity />
            <NotificationsOverview />
          </div>
        </>
      )}

      {isManager && (
        <>
          {/* Manager Dashboard - Business Focus */}
          <StatsOverview />
          
          <div className="grid gap-6 md:grid-cols-2">
            <RevenueChart />
            <OccupancyChart />
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <MaintenanceOverview />
            <HousekeepingOverview />
            <FeedbackOverview />
          </div>
          
          <RecentActivity />
        </>
      )}

      {isReceptionist && (
        <>
          {/* Receptionist Dashboard - Guest Services Focus */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Today's Check-ins
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  +2 from yesterday
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Today's Check-outs
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  +1 from yesterday
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Reservations
                </CardTitle>
                <Bed className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45</div>
                <p className="text-xs text-muted-foreground">
                  85% occupancy rate
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Requests
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">
                  Service requests
                </p>
              </CardContent>
            </Card>
          </div>
          
          <RecentActivity />
        </>
      )}

      {isHousekeeping && (
        <>
          {/* Housekeeping Dashboard - Task Focus */}
          <HousekeepingOverview />
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Today's Tasks</CardTitle>
                <CardDescription>
                  Your assigned housekeeping tasks for today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Room 201 - Cleaning</span>
                    </div>
                    <span className="text-xs text-muted-foreground">9:00 AM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-sm">Room 205 - Maintenance</span>
                    </div>
                    <span className="text-xs text-muted-foreground">10:30 AM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Room 210 - Inspection</span>
                    </div>
                    <span className="text-xs text-muted-foreground">2:00 PM</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
                <CardDescription>
                  Your completion rate this week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94%</div>
                <p className="text-xs text-muted-foreground">
                  +5% from last week
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {isMaintenance && (
        <>
          {/* Maintenance Dashboard - Technical Focus */}
          <MaintenanceOverview />
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Urgent Requests</CardTitle>
                <CardDescription>
                  High priority maintenance issues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                    <div>
                      <p className="font-medium text-red-900 dark:text-red-100">
                        AC Unit - Room 301
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        Not cooling properly
                      </p>
                    </div>
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <div>
                      <p className="font-medium text-orange-900 dark:text-orange-100">
                        Elevator - Main
                      </p>
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        Unusual noise
                      </p>
                    </div>
                    <Wrench className="h-5 w-5 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
                <CardDescription>
                  Your maintenance tasks for today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Room 201 - AC Check</p>
                      <p className="text-sm text-muted-foreground">Preventive maintenance</p>
                    </div>
                    <span className="text-xs text-muted-foreground">9:00 AM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Pool - Filter Service</p>
                      <p className="text-sm text-muted-foreground">Weekly maintenance</p>
                    </div>
                    <span className="text-xs text-muted-foreground">2:00 PM</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {isGuest && (
        <>
          {/* Guest Dashboard - Personal Focus */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Your Stay
                </CardTitle>
                <Bed className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Room 205</div>
                <p className="text-xs text-muted-foreground">
                  Check-out: Tomorrow 11:00 AM
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Service Requests
                </CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">
                  Pending requests
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Your Rating
                </CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.8</div>
                <p className="text-xs text-muted-foreground">
                  Based on 3 reviews
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your recent interactions with hotel services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Room service ordered</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Maintenance request submitted</p>
                    <p className="text-xs text-muted-foreground">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Feedback submitted</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
