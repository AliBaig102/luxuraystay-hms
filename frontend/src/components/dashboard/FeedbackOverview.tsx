import { useApi } from "@/hooks/useApi";
import { ENDPOINT_URLS } from "@/constants/endpoints";
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
  Star, 
  MessageSquare, 
  TrendingUp, 
  Users,
  ThumbsUp,
  ThumbsDown,
  AlertCircle
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useChartTheme } from "./chartUtils";

interface FeedbackStats {
  total: number;
  averageRating: number;
  byRating: Array<{
    rating: number;
    count: number;
    percentage: number;
  }>;
  byCategory: Array<{
    category: string;
    count: number;
    averageRating: number;
  }>;
  recentFeedback: Array<{
    id: string;
    rating: number;
    category: string;
    comment: string;
    guestName: string;
    roomNumber: string;
    createdAt: string;
    hasResponse: boolean;
  }>;
  monthlyTrend: Array<{
    month: string;
    averageRating: number;
    totalFeedback: number;
  }>;
  responseRate: number;
  topCategories: Array<{
    category: string;
    count: number;
    averageRating: number;
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

const RATING_COLORS = {
  1: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  2: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  3: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  4: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  5: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

const CATEGORY_COLORS = {
  service: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  cleanliness: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  amenities: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  staff: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  value: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  location: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
};

export const FeedbackOverview = () => {
  const { currentTheme } = useTheme();
  const { getTooltipStyle, getAxisStyle, getGridStyle } = useChartTheme();
  // Use dummy data instead of API calls
  const isLoading = false;

  // Dummy feedback data
  const feedbackData: FeedbackStats = {
    total: 89,
    averageRating: 4.2,
    byRating: [
      { rating: 5, count: 45, percentage: 50.6 },
      { rating: 4, count: 28, percentage: 31.5 },
      { rating: 3, count: 12, percentage: 13.5 },
      { rating: 2, count: 3, percentage: 3.4 },
      { rating: 1, count: 1, percentage: 1.1 }
    ],
    byCategory: [
      { category: 'service', count: 25, averageRating: 4.5 },
      { category: 'cleanliness', count: 22, averageRating: 4.3 },
      { category: 'amenities', count: 18, averageRating: 4.1 },
      { category: 'staff', count: 15, averageRating: 4.6 },
      { category: 'value', count: 6, averageRating: 3.8 },
      { category: 'location', count: 3, averageRating: 4.0 }
    ],
    recentFeedback: [
      {
        id: '1',
        rating: 5,
        category: 'service',
        comment: 'Excellent service and very clean room!',
        guestName: 'John Doe',
        roomNumber: '101',
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        hasResponse: true
      },
      {
        id: '2',
        rating: 4,
        category: 'cleanliness',
        comment: 'Room was comfortable but breakfast could be better',
        guestName: 'Sarah Wilson',
        roomNumber: '203',
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        hasResponse: false
      },
      {
        id: '3',
        rating: 5,
        category: 'staff',
        comment: 'Staff was very helpful and friendly',
        guestName: 'Mike Johnson',
        roomNumber: '156',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        hasResponse: true
      },
      {
        id: '4',
        rating: 3,
        category: 'amenities',
        comment: 'WiFi was slow and gym equipment needs updating',
        guestName: 'Emily Brown',
        roomNumber: '301',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        hasResponse: false
      },
      {
        id: '5',
        rating: 4,
        category: 'value',
        comment: 'Good value for money, would stay again',
        guestName: 'David Lee',
        roomNumber: '142',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        hasResponse: true
      }
    ],
    monthlyTrend: Array.from({ length: 6 }, (_, i) => ({
      month: new Date(Date.now() - (5 - i) * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7),
      averageRating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
      totalFeedback: Math.floor(Math.random() * 20) + 10
    })),
    responseRate: 75,
    topCategories: [
      { category: 'service', count: 25, averageRating: 4.5 },
      { category: 'cleanliness', count: 22, averageRating: 4.3 },
      { category: 'staff', count: 15, averageRating: 4.6 }
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

  const getRatingColor = (rating: number) => {
    return RATING_COLORS[rating as keyof typeof RATING_COLORS] || RATING_COLORS[3];
  };

  const getCategoryColor = (category: string) => {
    return CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.service;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating 
            ? 'text-yellow-400 fill-yellow-400' 
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Feedback Overview
        </CardTitle>
        <CardDescription>
          Guest feedback, ratings, and satisfaction metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {feedbackData?.total || 0}
            </div>
            <p className="text-sm text-muted-foreground">Total Reviews</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold flex items-center justify-center gap-1">
              {feedbackData?.averageRating ? feedbackData.averageRating.toFixed(1) : '0.0'}
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            </div>
            <p className="text-sm text-muted-foreground">Average Rating</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {feedbackData?.responseRate ? Math.round(feedbackData.responseRate) : 0}%
            </div>
            <p className="text-sm text-muted-foreground">Response Rate</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {feedbackData?.recentFeedback?.filter(f => f.hasResponse).length || 0}
            </div>
            <p className="text-sm text-muted-foreground">With Responses</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {/* Rating Distribution */}
          <div>
            <h4 className="text-sm font-medium mb-3">Rating Distribution</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={feedbackData?.byRating || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="rating" 
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
                    formatter={(value: number, name: string) => [
                      name === 'count' ? value : `${value}%`,
                      name === 'count' ? 'Reviews' : 'Percentage'
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

          {/* Category Breakdown */}
          <div>
            <h4 className="text-sm font-medium mb-3">Category Breakdown</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={feedbackData?.byCategory || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, count }) => `${category}: ${count}`}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {(feedbackData?.byCategory || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                    formatter={(value: number, name: string) => [value, 'Reviews']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3">Monthly Rating Trend</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={feedbackData?.monthlyTrend || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  className="text-xs"
                  tick={{ fontSize: 10 }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fontSize: 10 }}
                  domain={[0, 5]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'averageRating' ? value.toFixed(1) : value,
                    name === 'averageRating' ? 'Average Rating' : 'Total Reviews'
                  ]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="averageRating"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3">Recent Feedback</h4>
          <div className="space-y-3">
            {(feedbackData?.recentFeedback || []).slice(0, 5).map((feedback) => (
              <div key={feedback.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center gap-1">
                        {renderStars(feedback.rating)}
                      </div>
                      <Badge className={getCategoryColor(feedback.category)}>
                        {feedback.category}
                      </Badge>
                      {feedback.hasResponse && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Responded
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {feedback.guestName} • Room {feedback.roomNumber} • {formatDate(feedback.createdAt)}
                    </p>
                    <p className="text-sm">{feedback.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Categories */}
        <div>
          <h4 className="text-sm font-medium mb-3">Top Categories</h4>
          <div className="space-y-3">
            {(feedbackData?.topCategories || []).slice(0, 5).map((category) => (
              <div key={category.category} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getCategoryColor(category.category)}>
                      {category.category}
                    </Badge>
                    <span className="text-sm font-medium">{category.count} reviews</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {renderStars(Math.round(category.averageRating))}
                    <span className="text-sm text-muted-foreground ml-2">
                      {category.averageRating.toFixed(1)} average
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">
                    {category.averageRating.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground">avg rating</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
              {feedbackData?.averageRating ? feedbackData.averageRating.toFixed(1) : '0.0'}
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">Overall Rating</p>
          </div>
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {feedbackData?.responseRate ? Math.round(feedbackData.responseRate) : 0}%
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">Response Rate</p>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {feedbackData?.total || 0}
            </div>
            <p className="text-sm text-purple-700 dark:text-purple-300">Total Reviews</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
