import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Bell, 
  AlertTriangle, 
  Eye,
  EyeOff
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  urgent: number;
  byType: Array<{
    type: string;
    count: number;
    unread: number;
  }>;
  byPriority: Array<{
    priority: string;
    count: number;
  }>;
  recentNotifications: Array<{
    id: string;
    title: string;
    message: string;
    type: string;
    priority: string;
    isRead: boolean;
    createdAt: string;
    recipientType: string;
  }>;
  readPercentage: number;
  responseRate: number;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const TYPE_COLORS = {
  booking: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  maintenance: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  housekeeping: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  billing: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  system: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  reminder: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
};

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export const NotificationsOverview = () => {
  // Use dummy data instead of API calls


  // Mock data for notifications overview
  const notificationData: NotificationStats = {
    total: 156,
    unread: 23,
    read: 133,
    urgent: 5,
    byType: [
      { type: 'system', count: 45, unread: 8 },
      { type: 'booking', count: 38, unread: 6 },
      { type: 'maintenance', count: 32, unread: 5 },
      { type: 'payment', count: 25, unread: 3 },
      { type: 'guest', count: 16, unread: 1 }
    ],
    byPriority: [
      { priority: 'low', count: 78 },
      { priority: 'medium', count: 53 },
      { priority: 'high', count: 20 },
      { priority: 'urgent', count: 5 }
    ],
    recentNotifications: [
      {
        id: '1',
        title: 'Room 205 Maintenance Required',
        message: 'Air conditioning unit needs immediate attention',
        type: 'maintenance',
        priority: 'urgent',
        recipientType: 'staff',
        isRead: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        title: 'New Booking Confirmation',
        message: 'Booking #BK-2024-001 has been confirmed',
        type: 'booking',
        priority: 'medium',
        recipientType: 'staff',
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        title: 'Payment Received',
        message: 'Payment of $450 received for booking #BK-2024-002',
        type: 'payment',
        priority: 'low',
        recipientType: 'admin',
        isRead: false,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      }
    ],
    readPercentage: 85,
    responseRate: 92.1
  };



  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getTypeColor = (type: string) => {
    return TYPE_COLORS[type as keyof typeof TYPE_COLORS] || TYPE_COLORS.system;
  };

  const getPriorityColor = (priority: string) => {
    return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.medium;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications Overview
        </CardTitle>
        <CardDescription>
          Notification statistics, types, and recent alerts
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {notificationData?.total || 0}
            </div>
            <p className="text-sm text-muted-foreground">Total Notifications</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {notificationData?.unread || 0}
            </div>
            <p className="text-sm text-muted-foreground">Unread</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {notificationData?.urgent || 0}
            </div>
            <p className="text-sm text-muted-foreground">Urgent</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {notificationData?.readPercentage || 0}%
            </div>
            <p className="text-sm text-muted-foreground">Read Rate</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {/* Type Distribution */}
          <div>
            <h4 className="text-sm font-medium mb-3">Notification Types</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={notificationData?.byType || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, count }) => `${type}: ${count}`}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {(notificationData?.byType || []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                    formatter={(value: number) => [value, 'Notifications']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Priority Distribution */}
          <div>
            <h4 className="text-sm font-medium mb-3">Priority Distribution</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={notificationData?.byPriority || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="priority" 
                    className="text-xs"
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                    formatter={(value: number) => [value, 'Notifications']}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="hsl(var(--primary))" 
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3">Recent Notifications</h4>
          <div className="space-y-3">
            {(notificationData?.recentNotifications || []).slice(0, 5).map((notification) => (
              <div key={notification.id} className={`p-3 border rounded-lg ${!notification.isRead ? 'bg-accent/50' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <Badge className={getTypeColor(notification.type)}>
                        {notification.type}
                      </Badge>
                      <Badge className={getPriorityColor(notification.priority)}>
                        {notification.priority}
                      </Badge>
                      {!notification.isRead && (
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{notification.recipientType}</span>
                      <span>{formatTimestamp(notification.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {notification.isRead ? (
                      <Eye className="h-4 w-4 text-green-500" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-blue-500" />
                    )}
                    {notification.priority === 'urgent' && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notification Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {notificationData?.unread || 0}
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">Unread Notifications</p>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {notificationData?.readPercentage || 0}%
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">Read Rate</p>
          </div>
          <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {notificationData?.urgent || 0}
            </div>
            <p className="text-sm text-red-700 dark:text-red-300">Urgent Alerts</p>
          </div>
        </div>

        {/* Notification Types Summary */}
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-3">Notification Types Summary</h4>
          <div className="grid gap-3 md:grid-cols-2">
            {(notificationData?.byType || []).map((type) => (
              <div key={type.type} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Badge className={getTypeColor(type.type)}>
                    {type.type}
                  </Badge>
                  <span className="text-sm font-medium">{type.count} total</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {type.unread} unread
                  </span>
                  <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${type.count > 0 ? (type.unread / type.count) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
