import { useQuery } from '@tanstack/react-query';
import { DashboardStats } from '@shared/schema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Search, Plus } from 'lucide-react';
import DashboardCards from '@/components/dashboard/dashboard-cards';
import RecentOrders from '@/components/dashboard/recent-orders';
import LowStock from '@/components/dashboard/low-stock';
import SalesOverview from '@/components/dashboard/sales-overview';
import QuickLinks from '@/components/dashboard/quick-links';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { toast } = useToast();

  const { data: stats, error, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });

  if (error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to load dashboard data"
    });
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Would typically navigate to search results page
    toast({
      description: "Search functionality will be implemented"
    });
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back, Dr. Sarah</p>
        </div>
        <div className="flex space-x-3">
          <form onSubmit={handleSearch} className="relative flex-1 min-w-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              type="text" 
              placeholder="Search medications..." 
              className="pl-9"
            />
          </form>
          <Button>
            <span className="hidden md:inline mr-2">Quick Order</span>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Low stock alert */}
      {stats && stats.lowStockItems > 0 && (
        <Alert variant="warning" className="mb-6 border-l-4 border-amber-500 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-800">Low Stock Alert</AlertTitle>
          <AlertDescription className="text-amber-700">
            {stats.lowStockItems} medications are running low on stock.{' '}
            <a href="/inventory" className="font-medium underline">View all</a>
          </AlertDescription>
        </Alert>
      )}

      {/* Dashboard Cards */}
      <DashboardCards stats={stats} isLoading={isLoading} />

      {/* Recent Orders and Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <RecentOrders />
        <LowStock />
      </div>
        
      {/* Sales Overview */}
      <SalesOverview stats={stats?.salesData} isLoading={isLoading} />
        
      {/* Quick Links */}
      <QuickLinks />
    </div>
  );
}
