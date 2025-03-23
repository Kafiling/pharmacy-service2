import { useEffect, useState } from 'react';
import { 
  Customer, 
  Medication, 
  insertOrderSchema, 
  insertOrderItemSchema,
  Order 
} from '@shared/schema';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Extend the order schema for the form
const formSchema = z.object({
  orderInfo: insertOrderSchema.omit({ 
    totalAmount: true
  }).extend({
    customerId: z.coerce.number(),
  }),
  items: z.array(
    insertOrderItemSchema.omit({ 
      orderId: true,
      total: true
    }).extend({
      medicationId: z.coerce.number(),
      quantity: z.coerce.number().positive("Quantity must be positive"),
      unitPrice: z.coerce.number().positive("Unit price must be positive"),
    })
  ).min(1, "At least one item is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface OrderFormProps {
  order: Order | null;
  onClose: () => void;
}

export default function OrderForm({ order, onClose }: OrderFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = !!order;
  const [itemTotals, setItemTotals] = useState<number[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  // Get customers for the dropdown
  const { data: customers, isLoading: customersLoading } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  // Get medications for the dropdown
  const { data: medications, isLoading: medicationsLoading } = useQuery<Medication[]>({
    queryKey: ['/api/medications'],
  });

  // Create form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      orderInfo: {
        orderNumber: `ORD-${Math.floor(Math.random() * 10000)}`,
        customerId: customers?.[0]?.id || 0,
        status: 'pending',
        notes: '',
      },
      items: [
        {
          medicationId: 0,
          quantity: 1,
          unitPrice: 0,
        }
      ]
    }
  });

  // Use field array for dynamic item fields
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Watch for changes in items to calculate totals
  const watchedItems = form.watch("items");
  
  useEffect(() => {
    // Calculate individual item totals and overall total
    const newItemTotals = watchedItems.map(item => {
      const total = item.quantity * item.unitPrice;
      return isNaN(total) ? 0 : total;
    });
    
    const newTotalAmount = newItemTotals.reduce((sum, total) => sum + total, 0);
    
    setItemTotals(newItemTotals);
    setTotalAmount(newTotalAmount);
  }, [watchedItems]);

  // Set medication price when medication is selected
  const updateMedicationPrice = (index: number, medicationId: number) => {
    const medication = medications?.find(m => m.id === medicationId);
    if (medication) {
      const newItems = [...form.getValues().items];
      newItems[index].unitPrice = medication.price;
      form.setValue(`items.${index}.unitPrice`, medication.price);
    }
  };

  // Create mutation for adding order
  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      // Add total for each item and calculate overall total
      const itemsWithTotal = values.items.map((item, index) => ({
        ...item,
        orderId: 0, // Will be set by backend
        total: itemTotals[index]
      }));

      const orderData = {
        order: {
          ...values.orderInfo,
          totalAmount
        },
        items: itemsWithTotal
      };

      return apiRequest('POST', '/api/orders', orderData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Order Created",
        description: "The order has been successfully created",
      });
      onClose();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create order",
      });
    }
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  const addItem = () => {
    append({
      medicationId: 0,
      quantity: 1,
      unitPrice: 0,
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Create New Order</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="orderInfo.orderNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Order number" {...field} readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="orderInfo.customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer <span className="text-red-500">*</span></FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value.toString()}
                      disabled={customersLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers?.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            {customer.name}
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
                name="orderInfo.status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="orderInfo.notes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter any order notes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Order Items</h3>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medication</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price ($)</TableHead>
                    <TableHead>Total ($)</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`items.${index}.medicationId`}
                          render={({ field }) => (
                            <FormItem>
                              <Select 
                                onValueChange={(value) => {
                                  field.onChange(parseInt(value));
                                  updateMedicationPrice(index, parseInt(value));
                                }} 
                                value={field.value.toString()}
                                disabled={medicationsLoading}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select medication" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {medications?.map((medication) => (
                                    <SelectItem key={medication.id} value={medication.id.toString()}>
                                      {medication.name} ({medication.dosage})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(parseInt(e.target.value) || 0);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`items.${index}.unitPrice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01" 
                                  min="0" 
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(parseFloat(e.target.value) || 0);
                                  }} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        {itemTotals[index]?.toFixed(2) || "0.00"}
                      </TableCell>
                      <TableCell>
                        {fields.length > 1 && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-end mt-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-xl font-bold">${totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <CardFooter className="px-0 pt-6 border-t flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Order...
                  </>
                ) : (
                  "Create Order"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
