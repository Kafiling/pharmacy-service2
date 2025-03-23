import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardStats, Medication, Order } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { Download, PieChart as PieChartIcon, BarChart2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Sample data for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Reports() {
  const { toast } = useToast();
  const [reportPeriod, setReportPeriod] = useState<'week' | 'month' | 'year'>('month');

  // Fetch data
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: medications, isLoading: medicationsLoading } = useQuery<Medication[]>({
    queryKey: ['/api/medications'],
  });

  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });

  // Calculate medication category data for pie chart
  const categoryData = React.useMemo(() => {
    if (!medications) return [];
    
    const categories: Record<string, number> = {};
    
    medications.forEach(med => {
      if (categories[med.category]) {
        categories[med.category]++;
      } else {
        categories[med.category] = 1;
      }
    });
    
    return Object.entries(categories).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));
  }, [medications]);

  // Format order data for the bar chart
  const orderData = React.useMemo(() => {
    if (!orders) return [];
    
    // Group by date and sum amounts
    const ordersMap: Record<string, number> = {};
    
    // Get last 7 days for week, 30 for month
    const days = reportPeriod === 'week' ? 7 : reportPeriod === 'month' ? 30 : 12;
    const dateFormat = reportPeriod === 'year' ? { month: 'short' } : { month: 'short', day: 'numeric' };
    
    // Create all dates as keys with zero values
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      if (reportPeriod === 'year') {
        date.setMonth(today.getMonth() - i);
      } else {
        date.setDate(today.getDate() - i);
      }
      const dateKey = date.toLocaleDateString('en-US', dateFormat as any);
      ordersMap[dateKey] = 0;
    }
    
    // Fill with actual data
    orders.forEach(order => {
      const orderDate = new Date(order.date);
      
      // Only include orders from the relevant period
      const daysDiff = Math.floor((today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
      if (
        (reportPeriod === 'week' && daysDiff <= 7) ||
        (reportPeriod === 'month' && daysDiff <= 30) ||
        (reportPeriod === 'year' && orderDate.getFullYear() === today.getFullYear())
      ) {
        const dateKey = orderDate.toLocaleDateString('en-US', dateFormat as any);
        ordersMap[dateKey] = (ordersMap[dateKey] || 0) + order.totalAmount;
      }
    });
    
    // Convert to array for chart
    return Object.entries(ordersMap).map(([date, amount]) => ({
      date,
      amount
    }));
  }, [orders, reportPeriod]);

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your report is being generated for download"
    });
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500">View sales and inventory analytics</p>
        </div>
        <div className="flex space-x-3">
          <Select 
            value={reportPeriod} 
            onValueChange={(value) => setReportPeriod(value as 'week' | 'month' | 'year')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sales">
        <TabsList className="mb-4">
          <TabsTrigger value="sales">
            <BarChart2 className="h-4 w-4 mr-2" />
            Sales Report
          </TabsTrigger>
          <TabsTrigger value="inventory">
            <PieChartIcon className="h-4 w-4 mr-2" />
            Inventory Report
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <div className="grid gap-6">
            {/* Sales Overview Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {ordersLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <Skeleton className="h-64 w-full" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={orderData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
                      >
                        <XAxis 
                          dataKey="date" 
                          angle={-45} 
                          textAnchor="end" 
                          height={70}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value}`, 'Sales']} />
                        <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders Table */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordersLoading ? (
                      Array(5).fill(0).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        </TableRow>
                      ))
                    ) : (
                      orders?.slice(0, 5).map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.orderNumber}</TableCell>
                          <TableCell>
                            {new Date(order.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </TableCell>
                          <TableCell className="capitalize">{order.status}</TableCell>
                          <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Medication by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Medication by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {medicationsLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <Skeleton className="h-64 w-full rounded-full" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Low Stock Items */}
            <Card>
              <CardHeader>
                <CardTitle>Low Stock Medications</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medication</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Min Stock</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medicationsLoading ? (
                      Array(5).fill(0).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        </TableRow>
                      ))
                    ) : (
                      medications?.filter(med => med.currentStock < med.minimumStock)
                        .slice(0, 5)
                        .map((medication) => (
                          <TableRow key={medication.id}>
                            <TableCell className="font-medium">
                              {medication.name} ({medication.dosage})
                            </TableCell>
                            <TableCell>{medication.currentStock}</TableCell>
                            <TableCell>{medication.minimumStock}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                medication.currentStock <= medication.minimumStock / 2
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {medication.currentStock <= medication.minimumStock / 2
                                  ? 'Critical'
                                  : 'Low'}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
