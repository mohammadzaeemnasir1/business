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
import { ArrowLeft } from "lucide-react";
import { AddBillForm } from "../components/add-bill-form";
import { TransactionHistory } from "../components/transaction-history";

export default function DealerDetailPage({ params }: { params: { id: string } }) {
  const dealer = getDealerById(params.id);

  if (!dealer) {
    notFound();
  }

  const bills = getBillsForDealer(dealer.id);
  const outstandingBalance = getOutstandingBalanceForDealer(dealer.id);

  const transactionData = bills.map(bill => {
    const paidAmount = getPaidAmountForBill(bill);
    const balance = getOutstandingBalanceForBill(bill);
    const payers = bill.payments.map(p => p.payer).join(', ');
    return {
        id: bill.id,
        date: bill.date,
        billNumber: bill.billNumber,
        totalAmount: bill.totalAmount,
        paidAmount,
        balance,
        payers: payers || 'N/A',
    }
  }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
        <TransactionHistory data={transactionData} />
      </div>
    </div>
  );
}
