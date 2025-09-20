"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { PlusCircle, Loader2, CalendarIcon, Trash2 } from "lucide-react";
import { addBill } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { cn, formatCurrency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const itemSchema = z.object({
  name: z.string().min(1, "Item name is required."),
  pricePerPiece: z.coerce.number().min(0, "Price must be a positive number."),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
});

const billFormSchema = z.object({
  billNumber: z.string().min(1, "Bill number is required."),
  date: z.date({
    required_error: "A bill date is required.",
  }),
  items: z.array(itemSchema).min(1, "At least one item is required."),
  paidAmount: z.coerce.number().min(0, "Paid amount cannot be negative."),
  payer: z.enum(["Muhammad Faisal", "Mr. Hafiz Abdul Rasheed"]).nullable(),
});

type AddBillFormProps = {
  dealerId: string;
  totalLeftBehind: number;
};

export function AddBillForm({ dealerId, totalLeftBehind }: AddBillFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof billFormSchema>>({
    resolver: zodResolver(billFormSchema),
    defaultValues: {
      billNumber: "",
      items: [{ name: "", pricePerPiece: 0, quantity: 1 }],
      paidAmount: 0,
      payer: null,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items");
  const watchedPaidAmount = form.watch("paidAmount");

  const totalPrice = watchedItems.reduce(
    (acc, item) => acc + (item.pricePerPiece || 0) * (item.quantity || 0),
    0
  );
  
  const balanceForCurrentBill = totalPrice - watchedPaidAmount;
  const newTotalLeftBehind = totalLeftBehind + balanceForCurrentBill;

  async function onSubmit(values: z.infer<typeof billFormSchema>) {
    if (values.paidAmount > 0 && !values.payer) {
        form.setError("payer", { type: "manual", message: "Please select who paid."});
        return;
    }

    try {
      await addBill({ ...values, dealerId });
      toast({
        title: "Success",
        description: "New bill has been logged.",
      });
      form.reset();
      setOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log bill. Please try again.",
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
          Log New Bill
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Log New Bill</DialogTitle>
          <DialogDescription>
            Enter the details for the new bill. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="billNumber"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Bill Number</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., SS-2024-003" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Bill Date</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                            )}
                            >
                            {field.value ? (
                                format(field.value, "PPP")
                            ) : (
                                <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
                <FormLabel>Items</FormLabel>
                {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-end">
                         <FormField
                            control={form.control}
                            name={`items.${index}.name`}
                            render={({ field }) => (
                                <FormItem className="flex-grow">
                                <FormLabel className="sr-only">Item Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Item Name" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`items.${index}.pricePerPiece`}
                            render={({ field }) => (
                                <FormItem>
                                 <FormLabel className="sr-only">Price/Piece</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="Price/Piece" {...field} />
                                </FormControl>
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
                                    <Input type="number" placeholder="Quantity" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} disabled={fields.length === 1}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                 <Button type="button" variant="outline" size="sm" onClick={() => append({ name: "", pricePerPiece: 0, quantity: 1 })}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Item
                </Button>
                 <FormMessage>{form.formState.errors.items?.message}</FormMessage>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="paidAmount"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Total Paid</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="e.g., 50000" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="payer"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Paid By</FormLabel>
                         <Select onValueChange={field.onChange} defaultValue={field.value || ""} disabled={watchedPaidAmount <= 0}>
                            <FormControl>
                               <SelectTrigger>
                                    <SelectValue placeholder="Select payer" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Muhammad Faisal">Muhammad Faisal</SelectItem>
                                <SelectItem value="Mr. Hafiz Abdul Rasheed">Mr. Hafiz Abdul Rasheed</SelectItem>
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
                    <span className="font-medium">Total Price:</span>
                    <span className="font-bold text-lg">{formatCurrency(totalPrice)}</span>
                </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Balance from Current Bill:</span>
                    <span>{formatCurrency(balanceForCurrentBill)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Previous Balance:</span>
                    <span>{formatCurrency(totalLeftBehind)}</span>
                </div>
                 <div className="flex justify-between items-center font-semibold text-primary text-xl pt-2 border-t mt-2">
                    <span>New Total Balance:</span>
                    <span>{formatCurrency(newTotalLeftBehind)}</span>
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
                  "Save Bill"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
