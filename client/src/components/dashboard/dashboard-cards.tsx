import { DashboardStats } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Pill, ShoppingCart, AlertCircle, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardCardsProps {
  stats?: DashboardStats;
  isLoading: boolean;
}

export default function DashboardCards({ stats, isLoading }: DashboardCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Medications */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <Pill className="text-blue-600 h-5 w-5" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Medications</h3>
              {isLoading ? (
                <Skeleton className="h-8 w-24 mt-1" />
              ) : (
                <p className="text-2xl font-semibold text-gray-900">{stats?.totalMedications.toLocaleString()}</p>
              )}
            </div>
          </div>
          <div className="mt-3 flex items-center text-sm">
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              <>
                <span className="text-green-500 flex items-center">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  {stats?.medicationsGrowth}%
                </span>
                <span className="text-gray-500 ml-2">from last month</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Today's Orders */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <ShoppingCart className="text-green-600 h-5 w-5" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Today's Orders</h3>
              {isLoading ? (
                <Skeleton className="h-8 w-12 mt-1" />
              ) : (
                <p className="text-2xl font-semibold text-gray-900">{stats?.todaysOrders}</p>
              )}
            </div>
          </div>
          <div className="mt-3 flex items-center text-sm">
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              <>
                <span className="text-green-500 flex items-center">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  {stats?.ordersGrowth}%
                </span>
                <span className="text-gray-500 ml-2">from yesterday</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Low Stock Items */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertCircle className="text-red-600 h-5 w-5" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Low Stock Items</h3>
              {isLoading ? (
                <Skeleton className="h-8 w-8 mt-1" />
              ) : (
                <p className="text-2xl font-semibold text-gray-900">{stats?.lowStockItems}</p>
              )}
            </div>
          </div>
          <div className="mt-3 flex items-center text-sm">
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              <>
                <span className="text-red-500 flex items-center">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  {stats?.lowStockChange}
                </span>
                <span className="text-gray-500 ml-2">more than yesterday</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Revenue (Today) */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <DollarSign className="text-purple-600 h-5 w-5" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Revenue (Today)</h3>
              {isLoading ? (
                <Skeleton className="h-8 w-24 mt-1" />
              ) : (
                <p className="text-2xl font-semibold text-gray-900">${stats?.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              )}
            </div>
          </div>
          <div className="mt-3 flex items-center text-sm">
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              <>
                <span className="text-green-500 flex items-center">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  {stats?.revenueGrowth}%
                </span>
                <span className="text-gray-500 ml-2">from yesterday</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
