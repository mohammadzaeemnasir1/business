import type { Customer, Sale, InventoryItem } from "@/lib/types";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { DeleteSaleDialog } from "./delete-sale-dialog";

type SalesListProps = {
  sales: Sale[];
  customers: Customer[];
  inventoryItems: InventoryItem[];
};

export function SalesList({ sales, customers, inventoryItems }: SalesListProps) {
  if (sales.length === 0) {
    return (
      <div className="border rounded-lg h-96 flex items-center justify-center">
        <p className="text-muted-foreground">
          No sales found. Log a sale to see it here.
        </p>
      </div>
    );
  }

  const getSaleDetails = (sale: Sale) => {
    const customer = customers.find((c) => c.id === sale.customerId);
    const saleTotal = sale.items.reduce(
      (acc, item) => acc + item.salePrice * item.quantity,
      0
    );
    const balance = saleTotal - sale.amountPaid;
    const status = balance <= 0 ? "Paid in Full" : "Balance Due";

    return {
      customerName: customer?.name || "Unknown",
      totalAmount: saleTotal,
      status,
      balance,
    };
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="w-[180px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((sale) => {
            const { customerName, totalAmount, status } = getSaleDetails(sale);
            return (
              <TableRow key={sale.id}>
                <TableCell className="font-medium">{customerName}</TableCell>
                <TableCell>{format(new Date(sale.date), "dd MMM, yyyy")}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(totalAmount)}
                </TableCell>
                <TableCell className="text-center">
                    <Badge variant={status === 'Paid in Full' ? 'secondary' : 'destructive'}>
                        {status}
                    </Badge>
                </TableCell>
                <TableCell className="text-right flex justify-end gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/sales/${sale.id}`}>Print Bill</Link>
                  </Button>
                  <DeleteSaleDialog saleId={sale.id} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
