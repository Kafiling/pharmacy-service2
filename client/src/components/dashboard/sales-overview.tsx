import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Bar } from 'recharts';

interface SalesData {
  totalSales: number;
  customers: number;
  orders: number;
  avgOrderValue: number;
}

interface SalesOverviewProps {
  stats?: SalesData;
  isLoading: boolean;
}

// Sample data for the chart
const mockWeeklyData = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 5000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 4890 },
  { name: 'Sat', sales: 3390 },
  { name: 'Sun', sales: 2500 },
];

export default function SalesOverview({ stats, isLoading }: SalesOverviewProps) {
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');

  return (
    <Card className="mb-8">
      <CardHeader className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between">
        <CardTitle className="text-lg font-medium text-gray-900">Sales Overview</CardTitle>
        <div className="flex mt-2 md:mt-0 space-x-2">
          <Button 
            variant={timeframe === 'weekly' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setTimeframe('weekly')}
          >
            Weekly
          </Button>
          <Button 
            variant={timeframe === 'monthly' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setTimeframe('monthly')}
          >
            Monthly
          </Button>
          <Button 
            variant={timeframe === 'yearly' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setTimeframe('yearly')}
          >
            Yearly
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Sales Chart */}
        <div className="h-64 mb-4">
          {isLoading ? (
            <div className="h-full w-full flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
              <Skeleton className="h-40 w-[90%]" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={mockWeeklyData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        
        {/* Stats under chart */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-gray-50">
            <p className="text-sm text-gray-500">Total Sales</p>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mx-auto mt-1" />
            ) : (
              <p className="text-2xl font-bold text-primary">${stats?.totalSales.toLocaleString()}</p>
            )}
          </div>
          
          <div className="text-center p-3 rounded-lg bg-gray-50">
            <p className="text-sm text-gray-500">Customers</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mx-auto mt-1" />
            ) : (
              <p className="text-2xl font-bold text-primary">{stats?.customers.toLocaleString()}</p>
            )}
          </div>
          
          <div className="text-center p-3 rounded-lg bg-gray-50">
            <p className="text-sm text-gray-500">Orders</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mx-auto mt-1" />
            ) : (
              <p className="text-2xl font-bold text-primary">{stats?.orders.toLocaleString()}</p>
            )}
          </div>
          
          <div className="text-center p-3 rounded-lg bg-gray-50">
            <p className="text-sm text-gray-500">Avg. Order Value</p>
            {isLoading ? (
              <Skeleton className="h-8 w-20 mx-auto mt-1" />
            ) : (
              <p className="text-2xl font-bold text-primary">${stats?.avgOrderValue.toFixed(2)}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
