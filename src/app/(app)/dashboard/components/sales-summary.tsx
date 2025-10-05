"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Calendar, TrendingUp } from "lucide-react";

type SalesSummaryProps = {
  monthlySales: {
    currentMonth: number;
    previousMonth: number;
  };
};

export function SalesSummary({ monthlySales }: SalesSummaryProps) {
    const percentageChange = monthlySales.previousMonth > 0
        ? ((monthlySales.currentMonth - monthlySales.previousMonth) / monthlySales.previousMonth) * 100
        : monthlySales.currentMonth > 0 ? 100 : 0;

  return (
    <Card className="col-span-2 md:col-span-1 lg:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Calendar className="text-muted-foreground" />
          <span>Monthly Sales</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
            <p className="text-sm text-muted-foreground">This Month</p>
            <p className="text-2xl font-bold">{formatCurrency(monthlySales.currentMonth)}</p>
        </div>
         <div>
            <p className="text-sm text-muted-foreground">Previous Month</p>
            <p className="text-lg font-semibold text-muted-foreground">{formatCurrency(monthlySales.previousMonth)}</p>
        </div>
        {monthlySales.previousMonth > 0 && (
             <div className="flex items-center gap-2 text-sm">
                <TrendingUp className={`h-4 w-4 ${percentageChange >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                <span className={`${percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {percentageChange.toFixed(1)}%
                </span>
                <span className="text-muted-foreground">from last month</span>
             </div>
        )}
      </CardContent>
    </Card>
  );
}
