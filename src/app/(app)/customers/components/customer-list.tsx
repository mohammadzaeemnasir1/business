"use client";

import type { Customer, Sale } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type CustomerListProps = {
  customers: Customer[];
  sales: Sale[];
};

export function CustomerList({ customers, sales }: CustomerListProps) {
    if (customers.length === 0) {
        return (
             <div className="border rounded-lg h-96 flex items-center justify-center">
                <p className="text-muted-foreground">No customers match your search.</p>
            </div>
        )
    }
  
    const getCustomerBalance = (customerId: string) => {
        const customerSales = sales.filter(s => s.customerId === customerId);
        return customerSales.reduce((totalBalance, sale) => {
            const saleTotal = sale.items.reduce((acc, item) => acc + item.salePrice * item.quantity, 0);
            const saleBalance = saleTotal - sale.amountPaid;
            return totalBalance + saleBalance;
        }, 0);
    }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {customers.map((customer) => {
        const balance = getCustomerBalance(customer.id);
        return (
          <Card key={customer.id} className="flex flex-col">
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={customer.avatarUrl} alt={customer.name} />
                <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{customer.name}</CardTitle>
                 {customer.contact && <CardDescription>{customer.contact}</CardDescription>}
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="text-sm text-muted-foreground">Outstanding Balance</div>
                <div className={`text-2xl font-bold ${balance > 0 ? 'text-destructive' : 'text-green-600'}`}>
                    {formatCurrency(balance)}
                </div>
            </CardContent>
            <CardFooter>
                <Button asChild variant="outline" className="w-full">
                    <Link href={`/customers/${customer.id}`}>
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
