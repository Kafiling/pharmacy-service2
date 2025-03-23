import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Supplier } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Filter } from 'lucide-react';
import SupplierTable from '@/components/suppliers/supplier-table';
import SupplierForm from '@/components/suppliers/supplier-form';
import { useToast } from '@/hooks/use-toast';

export default function Suppliers() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(location.includes('?new=true'));
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Get all suppliers
  const { data: suppliers, isLoading, error } = useQuery<Supplier[]>({
    queryKey: ['/api/suppliers'],
  });

  // Filter suppliers based on search query
  const filteredSuppliers = suppliers?.filter(supplier => 
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.contactName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to load suppliers"
    });
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search happens on the client side with filteredSuppliers
  };

  const handleAddClick = () => {
    setSelectedSupplier(null);
    setShowAddForm(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowAddForm(true);
  };

  const handleFormClose = () => {
    setShowAddForm(false);
    setSelectedSupplier(null);
    // Remove query params if they exist
    if (location.includes('?')) {
      setLocation('/suppliers');
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Supplier Management</h1>
          <p className="text-sm text-gray-500">Manage medication suppliers and orders</p>
        </div>
        <div className="flex space-x-3">
          <form onSubmit={handleSearch} className="relative flex-1 min-w-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              type="text" 
              placeholder="Search suppliers..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <Button onClick={handleAddClick}>
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </div>
      </div>

      {showAddForm ? (
        <SupplierForm 
          supplier={selectedSupplier} 
          onClose={handleFormClose} 
        />
      ) : (
        <Card>
          <CardHeader className="px-6 py-4 border-b border-gray-100">
            <CardTitle className="text-lg font-medium text-gray-900">Suppliers</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <SupplierTable 
              suppliers={filteredSuppliers || []} 
              isLoading={isLoading}
              onEdit={handleEditSupplier}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
