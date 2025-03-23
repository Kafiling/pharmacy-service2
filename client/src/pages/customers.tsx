import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Customer } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Filter } from 'lucide-react';
import CustomerTable from '@/components/customers/customer-table';
import CustomerForm from '@/components/customers/customer-form';
import { useToast } from '@/hooks/use-toast';

export default function Customers() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Get all customers
  const { data: customers, isLoading, error } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  // Filter customers based on search query
  const filteredCustomers = customers?.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to load customers"
    });
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search happens on the client side with filteredCustomers
  };

  const handleAddClick = () => {
    setSelectedCustomer(null);
    setShowAddForm(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowAddForm(true);
  };

  const handleFormClose = () => {
    setShowAddForm(false);
    setSelectedCustomer(null);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-sm text-gray-500">Manage customer information and orders</p>
        </div>
        <div className="flex space-x-3">
          <form onSubmit={handleSearch} className="relative flex-1 min-w-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              type="text" 
              placeholder="Search customers..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <Button onClick={handleAddClick}>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {showAddForm ? (
        <CustomerForm 
          customer={selectedCustomer} 
          onClose={handleFormClose} 
        />
      ) : (
        <Card>
          <CardHeader className="px-6 py-4 border-b border-gray-100">
            <CardTitle className="text-lg font-medium text-gray-900">Customers</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <CustomerTable 
              customers={filteredCustomers || []} 
              isLoading={isLoading}
              onEdit={handleEditCustomer}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
