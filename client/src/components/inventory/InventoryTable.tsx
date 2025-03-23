import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Medication, Supplier } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

type EditMedicationFormValues = {
  name: string;
  description: string;
  dosage: string;
  category: string;
  stock: number;
  minStock: number;
  price: string;
  expiryDate: string;
  supplierId: number;
};

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  dosage: z.string().min(1, "Dosage is required"),
  category: z.string().optional(),
  stock: z.number().min(0, "Stock cannot be negative"),
  minStock: z.number().min(1, "Minimum stock must be at least 1"),
  price: z.string().min(1, "Price is required"),
  expiryDate: z.string().optional(),
  supplierId: z.number().min(1, "Supplier is required"),
});

const InventoryTable = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [currentMedication, setCurrentMedication] = useState<Medication | null>(null);

  const { data: medications, isLoading: isMedicationsLoading } = useQuery<Medication[]>({
    queryKey: ['/api/medications'],
  });

  const { data: suppliers } = useQuery<Supplier[]>({
    queryKey: ['/api/suppliers'],
  });

  const form = useForm<EditMedicationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      dosage: "",
      category: "",
      stock: 0,
      minStock: 10,
      price: "",
      expiryDate: "",
      supplierId: 0,
    },
  });

  const updateMedicationMutation = useMutation({
    mutationFn: async (data: EditMedicationFormValues) => {
      if (!currentMedication) return;
      return apiRequest("PUT", `/api/medications/${currentMedication.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/medications'] });
      setShowEditDialog(false);
      toast({
        title: "Medication updated",
        description: "The medication has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update medication.",
        variant: "destructive",
      });
    },
  });

  const handleEditMedication = (medication: Medication) => {
    setCurrentMedication(medication);
    form.reset({
      name: medication.name,
      description: medication.description || "",
      dosage: medication.dosage,
      category: medication.category || "",
      stock: medication.stock,
      minStock: medication.minStock,
      price: medication.price.toString(),
      expiryDate: medication.expiryDate ? new Date(medication.expiryDate).toISOString().split("T")[0] : "",
      supplierId: medication.supplierId,
    });
    setShowEditDialog(true);
  };

  const onSubmit = (data: EditMedicationFormValues) => {
    updateMedicationMutation.mutate(data);
  };

  const filteredMedications = medications?.filter(med => {
    // Category filter
    if (categoryFilter && med.category !== categoryFilter) {
      return false;
    }
    
    // Search by name or description
    if (searchTerm && 
        !(med.name.toLowerCase().includes(searchTerm.toLowerCase())) && 
        !(med.description && med.description.toLowerCase().includes(searchTerm.toLowerCase()))) {
      return false;
    }
    
    return true;
  });

  // Get unique categories for filter
  const categories = [...new Set(medications?.map(med => med.category).filter(Boolean))];

  return (
    <>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Medication Inventory</CardTitle>
          <CardDescription>
            Manage your pharmacy's medication inventory
          </CardDescription>
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="relative max-w-xs w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="ri-search-line text-neutral-400"></i>
              </div>
              <Input 
                type="text" 
                placeholder="Search medications..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map((category, index) => (
                    <SelectItem key={index} value={category || ""}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="ml-auto">
              <i className="ri-add-line mr-2"></i>
              Add New Medication
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Dosage</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isMedicationsLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Loading medications...
                  </TableCell>
                </TableRow>
              ) : filteredMedications && filteredMedications.length > 0 ? (
                filteredMedications.map((medication) => (
                  <TableRow key={medication.id}>
                    <TableCell className="font-medium">{medication.name}</TableCell>
                    <TableCell>{medication.dosage}</TableCell>
                    <TableCell>{medication.category || "-"}</TableCell>
                    <TableCell className="text-right">
                      <span className={
                        medication.stock < medication.minStock * 0.5
                          ? "text-error"
                          : medication.stock < medication.minStock
                          ? "text-warning" 
                          : ""
                      }>
                        {medication.stock} units
                      </span>
                    </TableCell>
                    <TableCell className="text-right">${parseFloat(medication.price.toString()).toFixed(2)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleEditMedication(medication)}>
                        <i className="ri-edit-line mr-1"></i> Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No medications found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Medication Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Medication</DialogTitle>
            <DialogDescription>
              Update the details of this medication
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dosage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dosage</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Stock</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="minStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Stock</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers?.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id.toString()}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={updateMedicationMutation.isPending}
                >
                  {updateMedicationMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InventoryTable;
