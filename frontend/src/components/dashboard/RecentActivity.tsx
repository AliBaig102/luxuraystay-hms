import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Activity, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  User,
  Bed,
  DollarSign,
  Star,
  Wrench,
  Sparkles,
  Bell
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ActivityItem {
  id: string;
  type: 'checkin' | 'checkout' | 'reservation' | 'maintenance' | 'housekeeping' | 'feedback' | 'bill' | 'notification';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  priority?: string;
  user?: string;
  roomNumber?: string;
  amount?: number;
  rating?: number;
}

interface RecentActivityData {
  activities: ActivityItem[];
  totalCount: number;
}

const ACTIVITY_ICONS = {
  checkin: CheckCircle,
  checkout: CheckCircle,
  reservation: Bed,
  maintenance: Wrench,
  housekeeping: Sparkles,
  feedback: Star,
  bill: DollarSign,
  notification: Bell,
};

const ACTIVITY_COLORS = {
  checkin: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  checkout: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  reservation: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  maintenance: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  housekeeping: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  feedback: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  bill: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  notification: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export const RecentActivity = () => {
  // Use dummy data instead of API calls

  // Dummy activity data
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'checkin',
      title: 'Guest Checked In',
      description: 'John Doe checked into Room 101',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      status: 'completed',
      roomNumber: '101'
    },
    {
      id: '2',
      type: 'feedback',
      title: 'New Feedback Received',
      description: 'Excellent service and clean room!',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      rating: 5
    },
    {
      id: '3',
      type: 'maintenance',
      title: 'AC Repair Request',
      description: 'Air conditioning not working in Room 205',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      status: 'pending',
      priority: 'high'
    },
    {
      id: '4',
      type: 'checkout',
      title: 'Guest Checked Out',
      description: 'Sarah Wilson checked out from Room 203',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      status: 'completed',
      roomNumber: '203'
    },
    {
      id: '5',
      type: 'feedback',
      title: 'New Feedback Received',
      description: 'Room was comfortable but breakfast could be better',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      rating: 4
    },
    {
      id: '6',
      type: 'maintenance',
      title: 'Plumbing Issue',
      description: 'Leaky faucet in Room 156',
      timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      status: 'in_progress',
      priority: 'medium'
    }
  ];

  const activityData: RecentActivityData = {
    activities,
    totalCount: activities.length
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



  const getActivityIcon = (type: string) => {
    const IconComponent = ACTIVITY_ICONS[type as keyof typeof ACTIVITY_ICONS] || Activity;
    return <IconComponent className="h-4 w-4" />;
  };

  const getActivityColor = (type: string) => {
    return ACTIVITY_COLORS[type as keyof typeof ACTIVITY_COLORS] || ACTIVITY_COLORS.notification;
  };

  const getPriorityColor = (priority: string) => {
    return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.medium;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Latest activities and events across the hotel
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {(activityData?.activities || []).slice(0, 10).map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
              <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm truncate">{activity.title}</p>
                  {activity.priority && (
                    <Badge className={getPriorityColor(activity.priority)}>
                      {activity.priority}
                    </Badge>
                  )}
                  {activity.status && (
                    <Badge variant="outline">
                      {activity.status.replace('_', ' ')}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-1">{activity.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {activity.user && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{activity.user}</span>
                    </div>
                  )}
                  {activity.roomNumber && (
                    <div className="flex items-center gap-1">
                      <Bed className="h-3 w-3" />
                      <span>Room {activity.roomNumber}</span>
                    </div>
                  )}
                  {activity.amount && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      <span>${activity.amount}</span>
                    </div>
                  )}
                  {activity.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      <span>{activity.rating}/5</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(activity.timestamp)}
                </span>
                {activity.priority === 'urgent' && (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
                {activity.status === 'completed' && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {activity.status === 'pending' && (
                  <Clock className="h-4 w-4 text-yellow-500" />
                )}
              </div>
            </div>
          ))}
        </div>

        {(!activityData?.activities || activityData.activities.length === 0) && (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No recent activity to display</p>
          </div>
        )}

        {/* Activity Summary */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {(activityData?.activities || []).filter(a => a.status === 'completed').length}
              </div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {(activityData?.activities || []).filter(a => a.status === 'pending').length}
              </div>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {(activityData?.activities || []).filter(a => a.priority === 'urgent').length}
              </div>
              <p className="text-sm text-muted-foreground">Urgent</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
