import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";
import { Bed } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface OccupancyData {
  date: string;
  occupancy: number;
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
}

interface RoomTypeData {
  type: string;
  count: number;
  occupied: number;
  percentage: number;
}

interface OccupancyStats {
  currentOccupancy: number;
  averageOccupancy: number;
  peakOccupancy: number;
  dailyOccupancy: OccupancyData[];
  weeklyOccupancy: OccupancyData[];
  monthlyOccupancy: OccupancyData[];
  roomTypeBreakdown: RoomTypeData[];
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export const OccupancyChart = () => {
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  
  // Use dummy data instead of API calls


  // Dummy occupancy data
  const totalRooms = 45;
  const currentOccupancy = 78;

  const occupancyData: OccupancyStats = {
    currentOccupancy,
    averageOccupancy: 72,
    peakOccupancy: 95,
    dailyOccupancy: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      occupancy: Math.floor(Math.random() * 40) + 50,
      totalRooms,
      occupiedRooms: Math.floor(Math.random() * totalRooms * 0.8) + Math.floor(totalRooms * 0.3),
      availableRooms: totalRooms - (Math.floor(Math.random() * totalRooms * 0.8) + Math.floor(totalRooms * 0.3))
    })),
    weeklyOccupancy: Array.from({ length: 12 }, (_, i) => ({
      date: `Week ${i + 1}`,
      occupancy: Math.floor(Math.random() * 30) + 60,
      totalRooms,
      occupiedRooms: Math.floor(Math.random() * totalRooms * 0.7) + Math.floor(totalRooms * 0.4),
      availableRooms: totalRooms - (Math.floor(Math.random() * totalRooms * 0.7) + Math.floor(totalRooms * 0.4))
    })),
    monthlyOccupancy: Array.from({ length: 12 }, (_, i) => ({
      date: new Date(Date.now() - (11 - i) * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7),
      occupancy: Math.floor(Math.random() * 25) + 65,
      totalRooms,
      occupiedRooms: Math.floor(Math.random() * totalRooms * 0.6) + Math.floor(totalRooms * 0.5),
      availableRooms: totalRooms - (Math.floor(Math.random() * totalRooms * 0.6) + Math.floor(totalRooms * 0.5))
    })),
    roomTypeBreakdown: [
      { type: 'Deluxe', count: 15, occupied: 12, percentage: 80 },
      { type: 'Standard', count: 20, occupied: 15, percentage: 75 },
      { type: 'Suite', count: 8, occupied: 6, percentage: 75 },
      { type: 'Presidential', count: 2, occupied: 2, percentage: 100 }
    ]
  };



  const formatPercentage = (value: number) => {
    return `${Math.round(value)}%`;
  };

  const getChartData = () => {
    switch (timeRange) {
      case 'weekly':
        return occupancyData?.weeklyOccupancy || [];
      case 'monthly':
        return occupancyData?.monthlyOccupancy || [];
      default:
        return occupancyData?.dailyOccupancy || [];
    }
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'weekly':
        return 'Last 12 Weeks';
      case 'monthly':
        return 'Last 12 Months';
      default:
        return 'Last 30 Days';
    }
  };

  const chartData = getChartData();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bed className="h-5 w-5" />
              Occupancy Analytics
            </CardTitle>
            <CardDescription>
              {getTimeRangeLabel()} occupancy rates and room utilization
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={timeRange === 'daily' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('daily')}
            >
              Daily
            </Button>
            <Button
              variant={timeRange === 'weekly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('weekly')}
            >
              Weekly
            </Button>
            <Button
              variant={timeRange === 'monthly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('monthly')}
            >
              Monthly
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {formatPercentage(occupancyData?.currentOccupancy || 0)}
            </div>
            <p className="text-sm text-muted-foreground">Current Occupancy</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {formatPercentage(occupancyData?.averageOccupancy || 0)}
            </div>
            <p className="text-sm text-muted-foreground">Average Occupancy</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {formatPercentage(occupancyData?.peakOccupancy || 0)}
            </div>
            <p className="text-sm text-muted-foreground">Peak Occupancy</p>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fontSize: 12 }}
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
                  name === 'occupancy' ? 'Occupancy Rate' : name === 'occupiedRooms' ? 'Occupied Rooms' : 'Available Rooms'
                ]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="occupancy"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Room Type Breakdown */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="text-sm font-medium mb-3">Room Type Distribution</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={occupancyData?.roomTypeBreakdown || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, percentage }) => `${type}: ${percentage}%`}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {(occupancyData?.roomTypeBreakdown || []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                    formatter={(value: number) => [value, 'Rooms']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-3">Room Type Occupancy</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={occupancyData?.roomTypeBreakdown || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="type" 
                    className="text-xs"
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
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
                    formatter={(value: number) => [`${value}%`, 'Occupancy Rate']}
                  />
                  <Bar 
                    dataKey="percentage" 
                    fill="hsl(var(--primary))" 
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Room Status Summary */}
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-3">Current Room Status</h4>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">
                  {chartData.length > 0 ? chartData[chartData.length - 1]?.occupiedRooms || 0 : 0} Occupied
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">Currently in use</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  {chartData.length > 0 ? chartData[chartData.length - 1]?.availableRooms || 0 : 0} Available
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">Ready for guests</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <div>
                <p className="font-medium text-orange-900 dark:text-orange-100">
                  {chartData.length > 0 ? (chartData[chartData.length - 1]?.totalRooms || 0) - (chartData[chartData.length - 1]?.occupiedRooms || 0) - (chartData[chartData.length - 1]?.availableRooms || 0) : 0} Maintenance
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300">Under maintenance</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
