import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Medication } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Filter } from 'lucide-react';
import InventoryTable from '@/components/inventory/inventory-table';
import MedicationForm from '@/components/inventory/medication-form';
import { useToast } from '@/hooks/use-toast';

export default function Inventory() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(location.includes('?new=true'));
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);

  // Get all medications
  const { data: medications, isLoading, error } = useQuery<Medication[]>({
    queryKey: ['/api/medications'],
  });

  // Filter medications based on search query
  const filteredMedications = medications?.filter(med => 
    med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.dosage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to load medications"
    });
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search happens on the client side with the filteredMedications
  };

  const handleAddClick = () => {
    setSelectedMedication(null);
    setShowAddForm(true);
  };

  const handleEditMedication = (medication: Medication) => {
    setSelectedMedication(medication);
    setShowAddForm(true);
  };

  const handleFormClose = () => {
    setShowAddForm(false);
    setSelectedMedication(null);
    // Remove query params if they exist
    if (location.includes('?')) {
      setLocation('/inventory');
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-sm text-gray-500">Manage medication stock and details</p>
        </div>
        <div className="flex space-x-3">
          <form onSubmit={handleSearch} className="relative flex-1 min-w-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              type="text" 
              placeholder="Search medications..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <Button onClick={handleAddClick}>
            <Plus className="h-4 w-4 mr-2" />
            Add Medication
          </Button>
        </div>
      </div>

      {showAddForm ? (
        <MedicationForm 
          medication={selectedMedication} 
          onClose={handleFormClose} 
        />
      ) : (
        <Tabs defaultValue="all">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="all">All Medications</TabsTrigger>
              <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          <TabsContent value="all">
            <Card>
              <CardHeader className="px-6 py-4 border-b border-gray-100">
                <CardTitle className="text-lg font-medium text-gray-900">Medication Inventory</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <InventoryTable 
                  medications={filteredMedications || []} 
                  isLoading={isLoading}
                  onEdit={handleEditMedication}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="low-stock">
            <Card>
              <CardHeader className="px-6 py-4 border-b border-gray-100">
                <CardTitle className="text-lg font-medium text-gray-900">Low Stock Medications</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <InventoryTable 
                  medications={(filteredMedications || []).filter(med => med.currentStock < med.minimumStock)} 
                  isLoading={isLoading}
                  onEdit={handleEditMedication}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
