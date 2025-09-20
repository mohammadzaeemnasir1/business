import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getDealerById,
  getBillsForDealer,
  getOutstandingBalanceForDealer,
  getPaidAmountForBill,
  getOutstandingBalanceForBill,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { AddBillForm } from "../components/add-bill-form";

export default function DealerDetailPage({ params }: { params: { id: string } }) {
  const dealer = getDealerById(params.id);

  if (!dealer) {
    notFound();
  }

  const bills = getBillsForDealer(dealer.id);
  const outstandingBalance = getOutstandingBalanceForDealer(dealer.id);

  return (
    <div className="space-y-8">
      <Button asChild variant="outline" size="sm">
        <Link href="/dealers">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dealers
        </Link>
      </Button>

      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={dealer.avatarUrl} alt={dealer.name} data-ai-hint="portrait person"/>
              <AvatarFallback className="text-2xl">{dealer.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="font-headline text-3xl">{dealer.name}</CardTitle>
              <CardDescription>{dealer.contact}</CardDescription>
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
        <div className="flex items-center justify-between">
            <h2 className="font-headline text-2xl font-semibold">Transaction History</h2>
            <AddBillForm dealerId={dealer.id} totalLeftBehind={outstandingBalance} />
        </div>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Bill #</TableHead>
                <TableHead>Paid By</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead className="text-right">Amount Paid</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bills.map((bill) => {
                const paidAmount = getPaidAmountForBill(bill);
                const balance = getOutstandingBalanceForBill(bill);
                const payers = bill.payments.map(p => p.payer).join(', ');

                return (
                  <TableRow key={bill.id}>
                    <TableCell>{new Date(bill.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{bill.billNumber}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {payers || 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(bill.totalAmount)}</TableCell>
                    <TableCell className="text-right text-green-600">{formatCurrency(paidAmount)}</TableCell>
                    <TableCell className="text-right font-semibold">
                        <Badge variant={balance > 0 ? 'destructive' : 'secondary'}>{formatCurrency(balance)}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
              {bills.length === 0 && (
                <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                        No bills logged for this dealer.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
