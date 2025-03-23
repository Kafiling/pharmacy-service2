import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { OrderWithItems } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

type OrderStatusBadgeProps = {
  status: string;
};

const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {
  const getStatusStyles = () => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-success/10 text-success';
      case 'processing':
        return 'bg-warning/10 text-warning';
      case 'cancelled':
        return 'bg-error/10 text-error';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  return (
    <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyles()}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </p>
  );
};

const OrderTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("today");

  const { data: orders, isLoading } = useQuery<OrderWithItems[]>({
    queryKey: ['/api/orders/recent'],
  });

  const filteredOrders = orders?.filter(order => {
    // Status filter
    if (statusFilter && order.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    
    // Search by customer name or order ID
    if (searchTerm && 
        !(`Order #${order.id}`.toLowerCase().includes(searchTerm.toLowerCase())) && 
        !(order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()))) {
      return false;
    }
    
    return true;
  });

  if (isLoading) {
    return (
      <div className="mt-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
          <Skeleton className="h-10 w-full max-w-xs" />
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-neutral-200">
              {[1, 2, 3, 4, 5].map((i) => (
                <li key={i} className="p-4">
                  <div className="flex justify-between mb-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="relative max-w-xs w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="ri-search-line text-neutral-400"></i>
          </div>
          <Input 
            type="text" 
            placeholder="Search orders..." 
            className="pl-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-3">
          <div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="last7days">Last 7 days</SelectItem>
                <SelectItem value="last30days">Last 30 days</SelectItem>
                <SelectItem value="thismonth">This month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" className="divide-y divide-neutral-200">
          {filteredOrders?.map((order) => (
            <li key={order.id}>
              <div className="block hover:bg-neutral-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-primary truncate">
                        Order #{order.id}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <OrderStatusBadge status={order.status} />
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex items-center text-sm text-neutral-500">
                      <i className="ri-time-line mr-1.5 text-neutral-400"></i>
                      <span>
                        {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-neutral-500">
                        <i className="ri-user-3-line flex-shrink-0 mr-1.5 text-neutral-400"></i>
                        <span>{order.customer.name}</span>
                      </p>
                      <p className="mt-2 flex items-center text-sm text-neutral-500 sm:mt-0 sm:ml-6">
                        <i className="ri-medicine-bottle-line flex-shrink-0 mr-1.5 text-neutral-400"></i>
                        <span>{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-neutral-500 sm:mt-0">
                      <span className="font-medium text-neutral-900">
                        ${parseFloat(order.totalAmount.toString()).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        
        {/* Pagination */}
        <div className="px-4 py-3 flex items-center justify-between border-t border-neutral-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <a href="#" className="relative inline-flex items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50">
              Previous
            </a>
            <a href="#" className="ml-3 relative inline-flex items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50">
              Next
            </a>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-neutral-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of{" "}
                <span className="font-medium">{orders?.length || 0}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-neutral-300 bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50">
                  <span className="sr-only">Previous</span>
                  <i className="ri-arrow-left-s-line text-lg"></i>
                </a>
                <a href="#" aria-current="page" className="z-10 bg-primary text-white relative inline-flex items-center px-4 py-2 border border-primary text-sm font-medium">
                  1
                </a>
                <a href="#" className="bg-white border-neutral-300 text-neutral-500 hover:bg-neutral-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                  2
                </a>
                <a href="#" className="bg-white border-neutral-300 text-neutral-500 hover:bg-neutral-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                  3
                </a>
                <span className="relative inline-flex items-center px-4 py-2 border border-neutral-300 bg-white text-sm font-medium text-neutral-700">
                  ...
                </span>
                <a href="#" className="bg-white border-neutral-300 text-neutral-500 hover:bg-neutral-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                  5
                </a>
                <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-neutral-300 bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50">
                  <span className="sr-only">Next</span>
                  <i className="ri-arrow-right-s-line text-lg"></i>
                </a>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTable;
