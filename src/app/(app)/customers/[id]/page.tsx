import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getCustomerById,
  getSalesByCustomerId,
  getAllInventoryItems,
} from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { SalesList } from "../components/sales-list";

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const customer = getCustomerById(params.id);

  if (!customer) {
    notFound();
  }

  const sales = getSalesByCustomerId(customer.id);
  const allCustomers = [customer]; // SalesList expects an array
  const inventoryItems = getAllInventoryItems();

  const outstandingBalance = sales.reduce((totalBalance, sale) => {
      const saleTotal = sale.items.reduce((acc, item) => acc + item.salePrice * item.quantity, 0);
      const saleBalance = saleTotal - sale.amountPaid;
      return totalBalance + saleBalance;
  }, 0);


  return (
    <div className="space-y-8">
      <Button asChild variant="outline" size="sm">
        <Link href="/customers">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Customers
        </Link>
      </Button>

      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={customer.avatarUrl} alt={customer.name} data-ai-hint="portrait person"/>
              <AvatarFallback className="text-2xl">{customer.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="font-headline text-3xl">{customer.name}</CardTitle>
              <CardDescription>{customer.contact}</CardDescription>
            </div>
          </div>
          <div className="text-left md:text-right">
            <p className="text-sm text-muted-foreground">Total Outstanding</p>
            <p className={`text-3xl font-bold ${outstandingBalance > 0 ? 'text-destructive' : 'text-green-600'}`}>
              {formatCurrency(outstandingBalance)}
            </p>
          </div>
        </CardHeader>
      </Card>
      
      <div className="space-y-4">
        <h2 className="font-headline text-2xl font-semibold">Sales History</h2>
        <SalesList sales={sales} customers={allCustomers} inventoryItems={inventoryItems} />
      </div>
    </div>
  );
}
