"use client";

import { useState } from "react";
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
import { PlusCircle, Loader2, Trash2 } from "lucide-react";
import { addSale } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { cn, formatCurrency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import type { InventoryItem } from "@/lib/types";


const saleItemSchema = z.object({
  inventoryItemId: z.string().min(1, "Please select an item."),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
  salePrice: z.coerce.number().min(0, "Price must be a positive number."),
});

const saleFormSchema = z.object({
  customerName: z.string().min(2, "Customer name is required."),
  saleType: z.enum(["cash", "credit"]),
  items: z.array(saleItemSchema).min(1, "At least one item is required."),
  amountPaid: z.coerce.number().min(0, "Paid amount cannot be negative."),
  paymentMethod: z.enum(["cash", "card", "mobile_payment"]),
});

type AddSaleFormProps = {
    inventoryItems: InventoryItem[];
}

export function AddSaleForm({ inventoryItems }: AddSaleFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const availableInventory = inventoryItems.filter(item => item.quantity > 0);

  const form = useForm<z.infer<typeof saleFormSchema>>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      customerName: "",
      saleType: "cash",
      items: [{ inventoryItemId: "", quantity: 1, salePrice: 0 }],
      amountPaid: 0,
      paymentMethod: "cash",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items");
  const watchedAmountPaid = form.watch("amountPaid");

  const totalPrice = watchedItems.reduce((acc, item) => {
    const price = item.salePrice || 0;
    return acc + price * (item.quantity || 0);
  }, 0);

  const remainingBalance = totalPrice - watchedAmountPaid;

  async function onSubmit(values: z.infer<typeof saleFormSchema>) {
    // Validate item quantities against inventory
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
      await addSale(values);
      toast({
        title: "Success",
        description: "New sale has been logged.",
      });
      form.reset();
      setOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log sale. Please try again.",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) {
            form.reset();
        }
        setOpen(isOpen);
    }}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2" />
          Log New Sale
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Log New Sale</DialogTitle>
          <DialogDescription>
            Enter the details for the new sale.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto pr-6">
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Customer Name</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
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
                        <FormLabel>Amount Paid</FormLabel>
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
                <div className="flex justify-between items-center font-semibold text-lg">
                    <span>Total Price:</span>
                    <span>{formatCurrency(totalPrice)}</span>
                </div>
                 <div className={cn("flex justify-between items-center font-semibold text-xl pt-2 border-t mt-2", remainingBalance > 0 ? 'text-destructive' : 'text-green-600')}>
                    <span>Balance:</span>
                    <span>{formatCurrency(remainingBalance)}</span>
                </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Sale"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
