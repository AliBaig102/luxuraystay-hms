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
  Cell,
  LineChart,
  Line
} from "recharts";
import { 
  Sparkles, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Users
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";


interface HousekeepingStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  byType: Array<{
    type: string;
    count: number;
    completed: number;
  }>;
  byStatus: Array<{
    status: string;
    count: number;
  }>;
  byStaff: Array<{
    staffId: string;
    staffName: string;
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
  }>;
  recentTasks: Array<{
    id: string;
    taskType: string;
    status: string;
    priority: string;
    roomNumber: string;
    assignedStaff: string;
    scheduledDate: string;
    completedDate?: string;
  }>;
  dailyCompletion: Array<{
    date: string;
    completed: number;
    total: number;
    completionRate: number;
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

const TASK_TYPE_COLORS = {
  cleaning: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  maintenance: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  inspection: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  deep_cleaning: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  setup: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
};

export const HousekeepingOverview = () => {
  // Use dummy data instead of API calls
  const isLoading = false;

  // Dummy housekeeping data
  const housekeepingData: HousekeepingStats = {
    total: 78,
    pending: 15,
    inProgress: 12,
    completed: 48,
    overdue: 3,
    byType: [
      { type: 'cleaning', count: 35, completed: 28 },
      { type: 'maintenance', count: 20, completed: 12 },
      { type: 'inspection', count: 15, completed: 6 },
      { type: 'deep_cleaning', count: 8, completed: 2 }
    ],
    byStatus: [
      { status: 'pending', count: 15 },
      { status: 'in_progress', count: 12 },
      { status: 'completed', count: 48 },
      { status: 'cancelled', count: 3 }
    ],
    byStaff: [
      { staffId: '1', staffName: 'Maria Garcia', totalTasks: 25, completedTasks: 22, completionRate: 88 },
      { staffId: '2', staffName: 'John Smith', totalTasks: 20, completedTasks: 18, completionRate: 90 },
      { staffId: '3', staffName: 'Sarah Johnson', totalTasks: 18, completedTasks: 15, completionRate: 83 },
      { staffId: '4', staffName: 'Mike Wilson', totalTasks: 15, completedTasks: 12, completionRate: 80 }
    ],
    recentTasks: [
      {
        id: '1',
        taskType: 'cleaning',
        status: 'completed',
        priority: 'medium',
        roomNumber: '101',
        assignedStaff: 'Maria Garcia',
        scheduledDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        completedDate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        taskType: 'maintenance',
        status: 'in_progress',
        priority: 'high',
        roomNumber: '205',
        assignedStaff: 'John Smith',
        scheduledDate: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        taskType: 'inspection',
        status: 'pending',
        priority: 'low',
        roomNumber: '156',
        assignedStaff: 'Sarah Johnson',
        scheduledDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '4',
        taskType: 'deep_cleaning',
        status: 'completed',
        priority: 'medium',
        roomNumber: '301',
        assignedStaff: 'Mike Wilson',
        scheduledDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        completedDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '5',
        taskType: 'cleaning',
        status: 'overdue',
        priority: 'high',
        roomNumber: '142',
        assignedStaff: 'Maria Garcia',
        scheduledDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      }
    ],
    dailyCompletion: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      completed: Math.floor(Math.random() * 15) + 5,
      total: Math.floor(Math.random() * 20) + 10,
      completionRate: Math.floor(Math.random() * 30) + 70
    }))
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

  const getPriorityColor = (priority: string) => {
    return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.medium;
  };

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.pending;
  };

  const getTaskTypeColor = (type: string) => {
    return TASK_TYPE_COLORS[type as keyof typeof TASK_TYPE_COLORS] || TASK_TYPE_COLORS.cleaning;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Housekeeping Overview
        </CardTitle>
        <CardDescription>
          Task management, staff performance, and completion metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {housekeepingData?.total || 0}
            </div>
            <p className="text-sm text-muted-foreground">Total Tasks</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {housekeepingData?.completed || 0}
            </div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {housekeepingData?.overdue || 0}
            </div>
            <p className="text-sm text-muted-foreground">Overdue</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {housekeepingData?.total > 0 
                ? Math.round((housekeepingData.completed / housekeepingData.total) * 100)
                : 0
              }%
            </div>
            <p className="text-sm text-muted-foreground">Completion Rate</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {/* Task Type Distribution */}
          <div>
            <h4 className="text-sm font-medium mb-3">Task Type Distribution</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={housekeepingData?.byType || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, count }) => `${type}: ${count}`}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {(housekeepingData?.byType || []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                    formatter={(value: number) => [value, 'Tasks']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Distribution */}
          <div>
            <h4 className="text-sm font-medium mb-3">Status Distribution</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={housekeepingData?.byStatus || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="status" 
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
                    formatter={(value: number) => [value, 'Tasks']}
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

        {/* Daily Completion Trend */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3">Daily Completion Trend</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={housekeepingData?.dailyCompletion || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fontSize: 10 }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => `${value}%`}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                  formatter={(value: number, name: string) => [
                    `${value}%`,
                    name === 'completionRate' ? 'Completion Rate' : name === 'completed' ? 'Completed' : 'Total'
                  ]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="completionRate"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Staff Performance */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3">Staff Performance</h4>
          <div className="space-y-3">
            {(housekeepingData?.byStaff || []).slice(0, 5).map((staff) => (
              <div key={staff.staffId} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium text-sm">{staff.staffName}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{staff.completedTasks}/{staff.totalTasks} tasks</span>
                    <span>{staff.completionRate}% completion rate</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${staff.completionRate}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{staff.completionRate}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Tasks */}
        <div>
          <h4 className="text-sm font-medium mb-3">Recent Tasks</h4>
          <div className="space-y-3">
            {(housekeepingData?.recentTasks || []).slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">Room {task.roomNumber}</p>
                    <Badge className={getTaskTypeColor(task.taskType)}>
                      {task.taskType.replace('_', ' ')}
                    </Badge>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Assigned to: {task.assignedStaff}</span>
                    <span>Scheduled: {formatDate(task.scheduledDate)}</span>
                    {task.completedDate && (
                      <span>Completed: {formatDate(task.completedDate)}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {task.status === 'completed' && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {task.status === 'in_progress' && (
                    <Clock className="h-4 w-4 text-blue-500" />
                  )}
                  {task.priority === 'urgent' && (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {housekeepingData?.completed || 0}
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">Tasks Completed Today</p>
          </div>
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {housekeepingData?.total > 0 
                ? Math.round((housekeepingData.completed / housekeepingData.total) * 100)
                : 0
              }%
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">Overall Completion Rate</p>
          </div>
          <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {housekeepingData?.overdue || 0}
            </div>
            <p className="text-sm text-orange-700 dark:text-orange-300">Overdue Tasks</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
