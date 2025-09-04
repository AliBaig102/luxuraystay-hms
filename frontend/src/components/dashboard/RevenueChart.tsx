import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";
import { DollarSign, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface RevenueData {
  date: string;
  revenue: number;
  bookings: number;
  averageBooking: number;
}

interface RevenueStats {
  totalRevenue: number;
  monthlyGrowth: number;
  dailyRevenue: RevenueData[];
  weeklyRevenue: RevenueData[];
  monthlyRevenue: RevenueData[];
}

export const RevenueChart = () => {
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  
  // Use dummy data instead of API calls

  // Dummy revenue data
  const revenueData: RevenueStats = {
    totalRevenue: 125000,
    monthlyGrowth: 15,
    dailyRevenue: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * 5000) + 2000,
      bookings: Math.floor(Math.random() * 10) + 5,
      averageBooking: Math.floor(Math.random() * 800) + 400
    })),
    weeklyRevenue: Array.from({ length: 12 }, (_, i) => ({
      date: `Week ${i + 1}`,
      revenue: Math.floor(Math.random() * 25000) + 15000,
      bookings: Math.floor(Math.random() * 50) + 30,
      averageBooking: Math.floor(Math.random() * 600) + 300
    })),
    monthlyRevenue: Array.from({ length: 12 }, (_, i) => ({
      date: new Date(Date.now() - (11 - i) * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7),
      revenue: Math.floor(Math.random() * 80000) + 50000,
      bookings: Math.floor(Math.random() * 200) + 100,
      averageBooking: Math.floor(Math.random() * 500) + 250
    })),
  };



  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getChartData = () => {
    switch (timeRange) {
      case 'weekly':
        return revenueData?.weeklyRevenue || [];
      case 'monthly':
        return revenueData?.monthlyRevenue || [];
      default:
        return revenueData?.dailyRevenue || [];
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
              <DollarSign className="h-5 w-5" />
              Revenue Analytics
            </CardTitle>
            <CardDescription>
              {getTimeRangeLabel()} revenue trends and performance
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
              {formatCurrency(revenueData?.totalRevenue || 0)}
            </div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold flex items-center justify-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              {revenueData?.monthlyGrowth ? `+${revenueData.monthlyGrowth}%` : '+0%'}
            </div>
            <p className="text-sm text-muted-foreground">Monthly Growth</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {chartData.length > 0 
                ? formatCurrency(chartData.reduce((sum, item) => sum + item.revenue, 0) / chartData.length)
                : '$0'
              }
            </div>
            <p className="text-sm text-muted-foreground">Average {timeRange === 'daily' ? 'Daily' : timeRange === 'weekly' ? 'Weekly' : 'Monthly'}</p>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                className="stroke-muted"
              />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === 'revenue' ? 'Revenue' : name === 'bookings' ? 'Bookings' : 'Avg Booking'
                ]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Additional Revenue Breakdown */}
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-3">Revenue Breakdown</h4>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.slice(-7)}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fontSize: 10 }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="hsl(var(--primary))" 
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
