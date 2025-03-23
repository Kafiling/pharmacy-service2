import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Order } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Filter } from 'lucide-react';
import OrderTable from '@/components/orders/order-table';
import OrderForm from '@/components/orders/order-form';
import NewOrderModal from '@/components/orders/NewOrderModal';
import { useToast } from '@/hooks/use-toast';

export default function Orders() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(location.includes('?new=true'));
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);

  // Get all orders
  const { data: orders, isLoading, error } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });

  // Filter orders based on search query
  const filteredOrders = orders?.filter(order => 
    order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to load orders"
    });
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search happens on the client side with the filteredOrders
  };

  const handleAddClick = () => {
    setShowNewOrderModal(true);
  };

  const handleNewOrderModalClose = () => {
    setShowNewOrderModal(false);
  };

  const handleFormClose = () => {
    setShowAddForm(false);
    setSelectedOrder(null);
    // Remove query params if they exist
    if (location.includes('?')) {
      setLocation('/orders');
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-sm text-gray-500">Process and track customer orders</p>
        </div>
        <div className="flex space-x-3">
          <form onSubmit={handleSearch} className="relative flex-1 min-w-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              type="text" 
              placeholder="Search order number..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <Button onClick={handleAddClick}>
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      {showAddForm ? (
        <OrderForm 
          order={selectedOrder} 
          onClose={handleFormClose} 
        />
      ) : (
        <Tabs defaultValue="all">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="all">All Orders</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          <TabsContent value="all">
            <Card>
              <CardHeader className="px-6 py-4 border-b border-gray-100">
                <CardTitle className="text-lg font-medium text-gray-900">All Orders</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <OrderTable 
                  orders={filteredOrders || []} 
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending">
            <Card>
              <CardHeader className="px-6 py-4 border-b border-gray-100">
                <CardTitle className="text-lg font-medium text-gray-900">Pending Orders</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <OrderTable 
                  orders={(filteredOrders || []).filter(order => order.status === 'pending')} 
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="processing">
            <Card>
              <CardHeader className="px-6 py-4 border-b border-gray-100">
                <CardTitle className="text-lg font-medium text-gray-900">Processing Orders</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <OrderTable 
                  orders={(filteredOrders || []).filter(order => order.status === 'processing')} 
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardHeader className="px-6 py-4 border-b border-gray-100">
                <CardTitle className="text-lg font-medium text-gray-900">Completed Orders</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <OrderTable 
                  orders={(filteredOrders || []).filter(order => order.status === 'completed')} 
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
      
      {/* New Order Modal */}
      <NewOrderModal 
        isOpen={showNewOrderModal} 
        onClose={handleNewOrderModalClose} 
      />
    </div>
  );
}
