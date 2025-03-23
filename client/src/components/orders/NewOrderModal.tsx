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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
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
  timingSchedule: z.enum(["morning", "afternoon", "evening", "multiple"]),
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
      
      const totalAmount = parseFloat(selectedMedication.price.toString()) * data.medication.quantity;
      
      const orderData = {
        order: {
          customerId: data.customerId,
          totalAmount: totalAmount,
          status: "pending",
          orderNumber: `ORD-${Math.floor(Math.random() * 10000)}`,
          notes: `Timing: ${data.timingSchedule}${data.notes ? `. ${data.notes}` : ''}`,
        },
        items: [
          {
            medicationId: data.medication.id,
            quantity: data.medication.quantity,
            unitPrice: selectedMedication.price,
            total: totalAmount
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
      timingSchedule: "morning",
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
                <FormItem className="flex flex-col">
                  <FormLabel>Customer</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value && customers
                            ? customers.find(customer => customer.id === field.value)?.name
                            : "Select customer"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder="Search customer..." />
                        <CommandEmpty>No customer found.</CommandEmpty>
                        <CommandGroup>
                          {customers?.map((customer) => (
                            <CommandItem
                              key={customer.id}
                              value={customer.name}
                              onSelect={() => {
                                field.onChange(customer.id);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  customer.id === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {customer.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="medication.id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Medication</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value && medications
                            ? medications.find(med => med.id === field.value)?.name
                            : "Select medication"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder="Search medication..." />
                        <CommandEmpty>No medication found.</CommandEmpty>
                        <CommandGroup>
                          {medications?.map((medication) => (
                            <CommandItem
                              key={medication.id}
                              value={medication.name}
                              onSelect={() => {
                                field.onChange(medication.id);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  medication.id === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {medication.name} ({medication.dosage})
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
              name="timingSchedule"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Medication Timing</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="morning" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Morning
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="afternoon" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Afternoon
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="evening" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Evening
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="multiple" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Multiple times per day
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
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
