import { useQuery } from '@tanstack/react-query';
import { Medication, Supplier } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  Pill, TestTube, Tablets, FlaskConical
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type MedicationWithSupplier = Medication & { supplier: Supplier };

export default function LowStock() {
  const { toast } = useToast();
  
  const { data: medications, isLoading } = useQuery<Medication[]>({
    queryKey: ['/api/medications/low-stock'],
  });

  const { data: suppliers } = useQuery<Supplier[]>({
    queryKey: ['/api/suppliers'],
  });

  // Combine medications with their suppliers
  const medicationsWithSuppliers: MedicationWithSupplier[] = medications?.map(medication => {
    const supplier = suppliers?.find(s => s.id === medication.supplierId);
    return {
      ...medication,
      supplier: supplier || { id: 0, name: 'Unknown', phone: '', contactName: '', email: '', address: '', notes: '' }
    };
  }) || [];

  const getStatusBadge = (medication: Medication) => {
    const threshold = medication.minimumStock * 0.5;
    const isCritical = medication.currentStock <= threshold;
    
    return (
      <Badge variant={isCritical ? "destructive" : "secondary"}>
        {isCritical ? "Critical" : "Low"}
      </Badge>
    );
  };

  const getMedicationIcon = (category: string) => {
    switch (category) {
      case 'antibiotic':
        return <TestTube className="text-primary h-5 w-5" />;
      case 'analgesic':
        return <Pill className="text-primary h-5 w-5" />;
      case 'cardiovascular':
        return <FlaskConical className="text-primary h-5 w-5" />;
      default:
        return <Tablets className="text-primary h-5 w-5" />;
    }
  };

  const handleOrderClick = (medication: MedicationWithSupplier) => {
    toast({
      title: "Order Initiated",
      description: `Creating order for ${medication.name} from ${medication.supplier.name}`
    });
  };

  return (
    <Card>
      <CardHeader className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <CardTitle className="text-lg font-medium text-gray-900">Low Stock Medications</CardTitle>
        <Button variant="ghost" className="text-primary hover:text-primary-800 text-sm font-medium">
          Place Order
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(4).fill(0).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center">
                        <Skeleton className="h-10 w-10 rounded" />
                        <div className="ml-4">
                          <Skeleton className="h-5 w-24" />
                          <Skeleton className="h-4 w-12 mt-1" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                  </TableRow>
                ))
              ) : (
                medicationsWithSuppliers.map((medication) => (
                  <TableRow key={medication.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                          {getMedicationIcon(medication.category)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{medication.name}</div>
                          <div className="text-sm text-gray-500">{medication.dosage}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900">{medication.currentStock} {medication.unit}s</div>
                      <div className="text-xs text-gray-500">Min: {medication.minimumStock} {medication.unit}s</div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(medication)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">{medication.supplier.name}</TableCell>
                    <TableCell>
                      <Button 
                        variant="link" 
                        onClick={() => handleOrderClick(medication)}
                        className="text-primary hover:text-primary-800"
                      >
                        Order
                      </Button>
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
