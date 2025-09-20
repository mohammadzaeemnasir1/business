"use client";

import type { Customer, Sale } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

type DetailedItem = {
    name: string;
    category: string;
    size: string;
    color: string;
    price: number;
    quantity: number;
}

type BillDetailsProps = {
  sale: Sale;
  customer: Customer;
  items: DetailedItem[];
};

export function BillDetails({ sale, customer, items }: BillDetailsProps) {
  
  const handlePrint = () => {
    window.print();
  };

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const balanceDue = subtotal - sale.amountPaid;

  return (
    <Card className="bill-card">
      <CardHeader className="bg-muted/50 print:bg-transparent">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
             <div className="space-y-1">
                <h1 className="font-headline text-2xl font-bold text-primary shop-name">Fancy Pearls</h1>
                <p className="text-muted-foreground text-sm">Contact us  +92 320 5271274</p>
            </div>
            <div className="flex items-center gap-2 no-print">
                <Button onClick={handlePrint} variant="outline">
                    <Printer className="mr-2"/>
                    Print Bill
                </Button>
            </div>
        </div>
        <div className="border-t pt-4 mt-4 flex justify-between text-sm">
            <div>
                <p className="font-semibold">Bill to:</p>
                <p>{customer.name}</p>
            </div>
            <div className="text-right">
                <p><span className="font-semibold">Bill Number:</span> {sale.id}</p>
                <p><span className="font-semibold">Date:</span> {format(new Date(sale.date), "dd MMM, yyyy")}</p>
            </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="text-center">Quantity</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.category} / {item.size} / {item.color}</p>
                </TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(item.price * item.quantity)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="bg-muted/50 p-6">
        <div className="w-full space-y-4">
            <div className="flex justify-end gap-4">
                <div className="w-1/3 space-y-2">
                     <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(subtotal)}</span>
                    </div>
                     <div className="flex justify-between font-semibold text-green-600">
                        <span>Paid:</span>
                        <span>{formatCurrency(sale.amountPaid)}</span>
                    </div>
                     <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2 text-destructive">
                        <span>Balance Due:</span>
                        <span>{formatCurrency(balanceDue)}</span>
                    </div>
                </div>
            </div>
            <div className="text-center text-sm text-muted-foreground pt-4 border-t thank-you">
                Thank you for your business!
            </div>
        </div>
      </CardFooter>
    </Card>
  );
}
