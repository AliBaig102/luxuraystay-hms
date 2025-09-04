import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui";
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
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  Clock
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";


interface MaintenanceStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  overdue: number;
  avgCost: number;
  totalCost: number;
  byCategory: Array<{
    category: string;
    count: number;
    avgCost: number;
  }>;
  byPriority: Array<{
    priority: string;
    count: number;
  }>;
  byStatus: Array<{
    status: string;
    count: number;
  }>;
  recentRequests: Array<{
    id: string;
    title: string;
    category: string;
    priority: string;
    status: string;
    createdAt: string;
    roomNumber?: string;
  }>;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

export const MaintenanceOverview = () => {
  // Use dummy data instead of API calls
  const isLoading = false;

  // Dummy maintenance data
  const maintenanceData: MaintenanceStats = {
    total: 45,
    pending: 12,
    inProgress: 8,
    completed: 22,
    cancelled: 3,
    overdue: 5,
    avgCost: 150,
    totalCost: 6750,
    byCategory: [
      { category: 'Plumbing', count: 15, avgCost: 120 },
      { category: 'Electrical', count: 12, avgCost: 180 },
      { category: 'HVAC', count: 10, avgCost: 200 },
      { category: 'General', count: 8, avgCost: 100 }
    ],
    byPriority: [
      { priority: 'low', count: 15 },
      { priority: 'medium', count: 20 },
      { priority: 'high', count: 8 },
      { priority: 'urgent', count: 2 }
    ],
    byStatus: [
      { status: 'pending', count: 12 },
      { status: 'in_progress', count: 8 },
      { status: 'completed', count: 22 },
      { status: 'cancelled', count: 3 }
    ],
    recentRequests: [
      {
        id: '1',
        title: 'AC Repair - Room 205',
        category: 'HVAC',
        priority: 'high',
        status: 'pending',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        roomNumber: '205'
      },
      {
        id: '2',
        title: 'Leaky Faucet - Room 156',
        category: 'Plumbing',
        priority: 'medium',
        status: 'in_progress',
        createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        roomNumber: '156'
      },
      {
        id: '3',
        title: 'Light Fixture Replacement',
        category: 'Electrical',
        priority: 'low',
        status: 'completed',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        roomNumber: '301'
      },
      {
        id: '4',
        title: 'Door Handle Repair',
        category: 'General',
        priority: 'medium',
        status: 'completed',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        roomNumber: '142'
      },
      {
        id: '5',
        title: 'Power Outlet Issue',
        category: 'Electrical',
        priority: 'urgent',
        status: 'pending',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        roomNumber: '208'
      }
    ]
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPriorityColor = (priority: string) => {
    return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.medium;
  };

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.pending;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Maintenance Overview
        </CardTitle>
        <CardDescription>
          Maintenance requests, costs, and performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {maintenanceData?.total || 0}
            </div>
            <p className="text-sm text-muted-foreground">Total Requests</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {maintenanceData?.overdue || 0}
            </div>
            <p className="text-sm text-muted-foreground">Overdue</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {maintenanceData?.completed || 0}
            </div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {formatCurrency(maintenanceData?.totalCost || 0)}
            </div>
            <p className="text-sm text-muted-foreground">Total Cost</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {/* Status Distribution */}
          <div>
            <h4 className="text-sm font-medium mb-3">Status Distribution</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={maintenanceData?.byStatus || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, count }) => `${status}: ${count}`}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {(maintenanceData?.byStatus || []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                    formatter={(value: number) => [value, 'Requests']}
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
                <BarChart data={maintenanceData?.byPriority || []}>
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
                    formatter={(value: number) => [value, 'Requests']}
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

        {/* Category Breakdown */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3">Category Breakdown</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={maintenanceData?.byCategory || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="category" 
                  className="text-xs"
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
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
                  formatter={(value: number, name: string) => [
                    name === 'count' ? value : formatCurrency(value),
                    name === 'count' ? 'Requests' : 'Avg Cost'
                  ]}
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

        {/* Recent Requests */}
        <div>
          <h4 className="text-sm font-medium mb-3">Recent Requests</h4>
          <div className="space-y-3">
            {(maintenanceData?.recentRequests || []).slice(0, 5).map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">{request.title}</p>
                    <Badge className={getPriorityColor(request.priority)}>
                      {request.priority}
                    </Badge>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{request.category}</span>
                    {request.roomNumber && <span>Room {request.roomNumber}</span>}
                    <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {request.priority === 'urgent' && (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                  {request.status === 'completed' && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {request.status === 'in_progress' && (
                    <Clock className="h-4 w-4 text-blue-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {maintenanceData?.total > 0 
                ? Math.round((maintenanceData.completed / maintenanceData.total) * 100)
                : 0
              }%
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">Completion Rate</p>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(maintenanceData?.avgCost || 0)}
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">Average Cost</p>
          </div>
          <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {maintenanceData?.overdue || 0}
            </div>
            <p className="text-sm text-orange-700 dark:text-orange-300">Overdue Items</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
