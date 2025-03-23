import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Customer, Medication, insertOrderSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

type NewOrderModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const orderFormSchema = z.object({
  customerId: z.number().min(1, "Please select a customer"),
  medication: z.object({
    id: z.number(),
    quantity: z.number().min(1, "Quantity must be at least 1"),
  }),
  prescription: z.string().optional(),
  notes: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

const NewOrderModal = ({ isOpen, onClose }: NewOrderModalProps) => {
  const { toast } = useToast();
  
  const { data: customers } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  const { data: medications } = useQuery<Medication[]>({
    queryKey: ['/api/medications'],
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: OrderFormValues) => {
      const selectedMedication = medications?.find(med => med.id === data.medication.id);
      
      if (!selectedMedication) {
        throw new Error("Selected medication not found");
      }
      
      const orderData = {
        order: {
          customerId: data.customerId,
          totalAmount: (parseFloat(selectedMedication.price.toString()) * data.medication.quantity).toString(),
          status: "pending",
          prescription: data.prescription,
          notes: data.notes,
        },
        orderItems: [
          {
            medicationId: data.medication.id,
            quantity: data.medication.quantity,
            price: (parseFloat(selectedMedication.price.toString()) * data.medication.quantity).toString(),
          },
        ],
      };
      
      return apiRequest("POST", "/api/orders", orderData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/medications'] });
      onClose();
      toast({
        title: "Order created successfully",
        description: "The new order has been added to the system",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating order",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customerId: 0,
      medication: { id: 0, quantity: 1 },
      prescription: "",
      notes: "",
    },
  });

  const onSubmit = (data: OrderFormValues) => {
    createOrderMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Order</DialogTitle>
          <DialogDescription>
            Create a new medication order for a customer.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a customer" />
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
              name="medication.id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medication</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a medication" />
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

            <FormField
              control={form.control}
              name="medication.quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
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
              name="prescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prescription</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Prescription type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Required - On file">Required - On file</SelectItem>
                      <SelectItem value="Required - New">Required - New</SelectItem>
                      <SelectItem value="Not required">Not required</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional information"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createOrderMutation.isPending}
              >
                {createOrderMutation.isPending ? "Creating..." : "Create Order"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewOrderModal;
