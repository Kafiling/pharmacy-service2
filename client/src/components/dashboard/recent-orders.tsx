import { useQuery } from '@tanstack/react-query';
import { Order, Customer } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

type OrderWithCustomer = Order & { customer: Customer };

export default function RecentOrders() {
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders/recent?limit=4'],
  });

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  // Combine orders with customer names
  const ordersWithCustomers: OrderWithCustomer[] = orders?.map(order => {
    const customer = customers?.find(c => c.id === order.customerId);
    return {
      ...order,
      customer: customer || { id: 0, name: 'Unknown', phone: '', email: '', address: '', notes: '' }
    };
  }) || [];

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'default';
      case 'pending':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <CardTitle className="text-lg font-medium text-gray-900">Recent Orders</CardTitle>
        <a href="/orders" className="text-primary hover:text-primary-800 text-sm font-medium">View all</a>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-[100px]">Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(4).fill(0).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  </TableRow>
                ))
              ) : (
                ordersWithCustomers.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium text-primary">{order.orderNumber}</TableCell>
                    <TableCell className="text-gray-700">{order.customer.name}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-700">${order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell className="text-gray-500">
                      {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
