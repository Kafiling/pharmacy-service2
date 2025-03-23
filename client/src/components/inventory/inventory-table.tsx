import { useState } from 'react';
import { Medication, Supplier } from '@shared/schema';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { apiRequest } from '@/lib/queryClient';
import { Pencil, Trash2, Pill, TestTube, Tablets } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InventoryTableProps {
  medications: Medication[];
  isLoading: boolean;
  onEdit: (medication: Medication) => void;
}

export default function InventoryTable({ medications, isLoading, onEdit }: InventoryTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [medicationToDelete, setMedicationToDelete] = useState<Medication | null>(null);

  // Get suppliers for displaying names
  const { data: suppliers } = useQuery<Supplier[]>({
    queryKey: ['/api/suppliers'],
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/medications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/medications'] });
      toast({
        title: "Medication deleted",
        description: "The medication has been successfully removed from inventory",
      });
      setMedicationToDelete(null);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete medication",
      });
    },
  });

  const getSupplierName = (supplierId: number) => {
    const supplier = suppliers?.find(s => s.id === supplierId);
    return supplier?.name || 'Unknown';
  };

  const getMedicationIcon = (category: string) => {
    switch (category) {
      case 'antibiotic':
        return <TestTube className="text-primary h-5 w-5" />;
      case 'analgesic':
        return <Pill className="text-primary h-5 w-5" />;
      default:
        return <Tablets className="text-primary h-5 w-5" />;
    }
  };

  const confirmDelete = (medication: Medication) => {
    setMedicationToDelete(medication);
  };

  const handleDelete = () => {
    if (medicationToDelete) {
      deleteMutation.mutate(medicationToDelete.id);
    }
  };

  const getStockStatus = (medication: Medication) => {
    if (medication.currentStock <= 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (medication.currentStock < medication.minimumStock) {
      return <Badge variant="secondary">Low Stock</Badge>;
    } else {
      return <Badge variant="outline">In Stock</Badge>;
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Medication</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Dosage</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center">
                      <Skeleton className="h-10 w-10 rounded" />
                      <Skeleton className="h-4 w-32 ml-4" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : (
              medications.map((medication) => (
                <TableRow key={medication.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                        {getMedicationIcon(medication.category)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{medication.name}</div>
                        <div className="text-xs text-gray-500">{medication.description?.substring(0, 30)}...</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">
                    {medication.category}
                  </TableCell>
                  <TableCell>{medication.dosage}</TableCell>
                  <TableCell>${medication.price.toFixed(2)}</TableCell>
                  <TableCell>
                    {medication.currentStock} {medication.unit}s
                  </TableCell>
                  <TableCell>
                    {getStockStatus(medication)}
                  </TableCell>
                  <TableCell>{getSupplierName(medication.supplierId)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onEdit(medication)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => confirmDelete(medication)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!medicationToDelete} onOpenChange={() => setMedicationToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {medicationToDelete?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMedicationToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
