"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, DollarSign, Boxes } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type StatsCardsProps = {
  totalDealers: number;
  totalOutstanding: number;
  totalInventoryValue: number;
};

export function StatsCards({
  totalDealers,
  totalOutstanding,
  totalInventoryValue,
}: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Outstanding
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(totalOutstanding)}
          </div>
          <p className="text-xs text-muted-foreground">
            Total amount owed to all dealers
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Inventory Value
          </CardTitle>
          <Boxes className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(totalInventoryValue)}
          </div>
          <p className="text-xs text-muted-foreground">
            Based on cost per unit
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Dealers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{totalDealers}</div>
          <p className="text-xs text-muted-foreground">
            Suppliers you work with
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
