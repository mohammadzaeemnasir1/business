"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { PlusCircle, Loader2, CalendarIcon } from "lucide-react";
import { addBill } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const billFormSchema = z.object({
  billNumber: z.string().min(1, "Bill number is required."),
  date: z.date({
    required_error: "A bill date is required.",
  }),
  totalAmount: z.coerce.number().min(1, "Total amount must be greater than 0."),
});

type AddBillFormProps = {
  dealerId: string;
};

export function AddBillForm({ dealerId }: AddBillFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof billFormSchema>>({
    resolver: zodResolver(billFormSchema),
    defaultValues: {
      billNumber: "",
      totalAmount: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof billFormSchema>) {
    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2" />
          Log New Bill
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log New Bill</DialogTitle>
          <DialogDescription>
            Enter the details for the new bill. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
            <FormField
              control={form.control}
              name="totalAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 50000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
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
