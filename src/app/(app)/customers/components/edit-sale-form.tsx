"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Loader2, Trash2, PlusCircle } from "lucide-react";
import { updateSale } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { cn, formatCurrency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import type { InventoryItem, Customer, Sale } from "@/lib/types";
import { format } from "date-fns";

const saleItemSchema = z.object({
  inventoryItemId: z.string().min(1, "Please select an item."),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
  salePrice: z.coerce.number().min(0, "Price must be a positive number."),
});

const saleFormSchema = z.object({
  id: z.string(),
  customerName: z.string().min(1, "Customer name is required."),
  customerContact: z.string().optional(),
  saleType: z.enum(["cash", "credit"]),
  items: z.array(saleItemSchema).min(1, "At least one item is required."),
  amountPaid: z.coerce.number().min(0, "Paid amount cannot be negative."),
  paymentMethod: z.enum(["cash", "card", "mobile_payment"]),
  paidTo: z.enum(["Faisal Rehman", "Hafiz Abdul Rasheed"]),
});

type EditSaleFormProps = {
    sale: Sale;
    inventoryItems: InventoryItem[];
    customers: Customer[];
    sales: Sale[];
}

export function EditSaleForm({ sale, inventoryItems: allInventory, customers, sales }: EditSaleFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  // To calculate available stock, we need to add back the items from the sale being edited
  const availableInventory = allInventory.map(item => {
    const saleItem = sale.items.find(si => si.inventoryItemId === item.id);
    if (saleItem) {
      return { ...item, quantity: item.quantity + saleItem.quantity };
    }
    return item;
  }).filter(item => item.quantity > 0);

  const customer = customers.find(c => c.id === sale.customerId);

  const [customerDetails, setCustomerDetails] = useState<{balance: number, lastPurchase: string | null} | null>(null);

  const form = useForm<z.infer<typeof saleFormSchema>>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      id: sale.id,
      customerName: customer?.name || "",
      customerContact: customer?.contact || "",
      saleType: sale.saleType,
      items: sale.items,
      amountPaid: sale.amountPaid,
      paymentMethod: sale.paymentMethod,
      paidTo: sale.paidTo || "Faisal Rehman",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items");
  const watchedAmountPaid = form.watch("amountPaid");
  const watchedCustomerName = form.watch("customerName");

  const calculateCustomerDetails = useCallback((name: string) => {
    const currentCustomer = customers.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (currentCustomer) {
        const customerSales = sales.filter(s => s.customerId === currentCustomer.id && s.id !== sale.id);
        const balance = customerSales.reduce((totalBalance, s) => {
            const saleTotal = s.items.reduce((acc, item) => acc + item.salePrice * item.quantity, 0);
            const saleBalance = saleTotal - s.amountPaid;
            return totalBalance + saleBalance;
        }, 0);
        
        let lastPurchase: string | null = null;
        if (customerSales.length > 0) {
            const lastSale = customerSales.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
            lastPurchase = format(new Date(lastSale.date), "dd MMM, yyyy");
        }
        setCustomerDetails({ balance, lastPurchase });
        form.setValue("customerContact", currentCustomer.contact || "");
    } else {
        setCustomerDetails(null);
        form.setValue("customerContact", "");
    }
  }, [customers, sales, form, sale.id]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (watchedCustomerName) {
        calculateCustomerDetails(watchedCustomerName);
      } else {
        setCustomerDetails(null);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [watchedCustomerName, calculateCustomerDetails]);
  
  // Set initial customer details on mount
  useEffect(() => {
    if (customer?.name) {
      calculateCustomerDetails(customer.name);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPrice = watchedItems.reduce((acc, item) => {
    const price = item.salePrice || 0;
    return acc + price * (item.quantity || 0);
  }, 0);

  const remainingBalance = totalPrice - watchedAmountPaid;
  const newTotalBalance = (customerDetails?.balance || 0) + remainingBalance;

  async function onSubmit(values: z.infer<typeof saleFormSchema>) {
    for (const item of values.items) {
      const inventoryItem = availableInventory.find(i => i.id === item.inventoryItemId);
      if (!inventoryItem || item.quantity > inventoryItem.quantity) {
        toast({
          variant: "destructive",
          title: "Error",
          description: `Not enough stock for ${inventoryItem?.brand}. Only ${inventoryItem?.quantity} available.`,
        });
        return;
      }
    }
    
    try {
      await updateSale(values);
      toast({
        title: "Success",
        description: "Sale has been updated.",
      });
      setOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update sale. Please try again.",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Sale #{sale.billNo}</DialogTitle>
          <DialogDescription>
            Update the details for this sale.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto pr-6">
            <div className="grid grid-cols-2 gap-4">
                <FormItem>
                    <FormLabel>Bill No.</FormLabel>
                    <FormControl>
                        <Input readOnly value={sale.billNo} />
                    </FormControl>
                </FormItem>
                 <FormField
                    control={form.control}
                    name="paidTo"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Paid To</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select who gets paid" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="Faisal Rehman">Faisal Rehman</SelectItem>
                            <SelectItem value="Hafiz Abdul Rasheed">Hafiz Abdul Rasheed</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Customer Name</FormLabel>
                        <FormControl>
                            <Input placeholder="Enter customer name to search" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="customerContact"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Customer Contact</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., 0300-1234567" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            {customerDetails !== null && (
                 <div className="grid grid-cols-2 gap-4">
                    <FormItem>
                        <FormLabel>Outstanding Balance (Excluding this bill)</FormLabel>
                        <FormControl>
                            <Input readOnly value={formatCurrency(customerDetails.balance)} className="font-semibold text-destructive"/>
                        </FormControl>
                    </FormItem>
                    <FormItem>
                        <FormLabel>Last Purchase Date</FormLabel>
                         <FormControl>
                            <Input readOnly value={customerDetails.lastPurchase || 'N/A'} />
                        </FormControl>
                    </FormItem>
                 </div>
            )}


             <div className="grid grid-cols-1">
                 <FormField
                    control={form.control}
                    name="saleType"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Sale Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a sale type" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="credit">Credit</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
             </div>
            
            <Separator />
            
            <div className="space-y-2">
                <FormLabel>Items</FormLabel>
                {fields.map((field, index) => {
                    const selectedItemId = form.watch(`items.${index}.inventoryItemId`);
                    const selectedItem = availableInventory.find(i => i.id === selectedItemId);
                    return (
                        <div key={field.id} className="grid grid-cols-5 gap-2 items-end">
                            <FormField
                                control={form.control}
                                name={`items.${index}.inventoryItemId`}
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                    <FormLabel className="sr-only">Item</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an item" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                        {availableInventory.map(item => (
                                            <SelectItem key={item.id} value={item.id}>
                                                {item.brand} ({item.quantity} left)
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
                                name={`items.${index}.quantity`}
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel className="sr-only">Quantity</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="Qty" {...field} max={selectedItem?.quantity}/>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`items.${index}.salePrice`}
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel className="sr-only">Sale Price</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="Sale Price" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} disabled={fields.length === 1}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    )
                })}
                 <Button type="button" variant="outline" size="sm" onClick={() => append({ inventoryItemId: "", quantity: 1, salePrice: 0 })}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Item
                </Button>
                 <FormMessage>{form.formState.errors.items?.message}</FormMessage>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="amountPaid"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Amount Paid on This Bill</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="e.g., 5000" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                         <Select onValueChange={field.onChange} defaultValue={field.value} disabled={watchedAmountPaid <= 0}>
                            <FormControl>
                               <SelectTrigger>
                                    <SelectValue placeholder="Select payment method" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="card">Card</SelectItem>
                                <SelectItem value="mobile_payment">Mobile Payment</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            
            <Separator />
            
            <div className="space-y-2 rounded-lg bg-muted p-4">
                <div className="flex justify-between items-center">
                    <span>Total Price (Current Sale):</span>
                    <span className="font-semibold text-lg">{formatCurrency(totalPrice)}</span>
                </div>
                 <div className="flex justify-between items-center text-sm">
                    <span>Balance (Current Sale):</span>
                    <span>{formatCurrency(remainingBalance)}</span>
                </div>
                 <div className={cn("flex justify-between items-center font-semibold text-xl pt-2 border-t mt-2", newTotalBalance > 0 ? 'text-destructive' : 'text-green-600')}>
                    <span>New Total Balance:</span>
                    <span>{formatCurrency(newTotalBalance)}</span>
                </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
