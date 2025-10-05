"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { User, ArrowUpCircle, ArrowDownCircle, Banknote } from "lucide-react";
import { Separator } from "@/components/ui/separator";

type PersonalAccountSummaryProps = {
  person: string;
  summary: {
    totalReceived: number;
    totalPaidToDealers: number;
    netAmount: number;
  };
};

export function PersonalAccountSummary({ person, summary }: PersonalAccountSummaryProps) {
  return (
    <Card className="col-span-2 md:col-span-1 lg:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
            <User className="text-muted-foreground"/>
            <span>{person}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ArrowUpCircle className="text-green-500" />
                <span>Total Received</span>
            </div>
            <span className="font-semibold">{formatCurrency(summary.totalReceived)}</span>
        </div>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ArrowDownCircle className="text-red-500" />
                <span>Paid to Dealers</span>
            </div>
            <span className="font-semibold">{formatCurrency(summary.totalPaidToDealers)}</span>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 pt-2">
        <Separator />
         <div className="flex items-center justify-between w-full pt-2">
            <div className="flex items-center gap-2 font-bold text-lg">
                <Banknote className="text-primary"/>
                <span>Net Amount</span>
            </div>
            <span className={`font-bold text-lg ${summary.netAmount >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                {formatCurrency(summary.netAmount)}
            </span>
        </div>
        <p className="text-xs text-muted-foreground">This is the net amount in hand after dealer payments.</p>
      </CardFooter>
    </Card>
  );
}
