"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ExportData } from "@/components/export-data";
import { formatCurrency } from "@/lib/utils";
import type { InventoryItem } from "@/lib/types";
import { Eye, EyeOff } from "lucide-react";

type InventoryViewProps = {
  displayItems: InventoryItem[];
  isAdmin: boolean;
};

export function InventoryView({ displayItems, isAdmin }: InventoryViewProps) {
  const [showCosts, setShowCosts] = useState(false);

  const exportData = displayItems.map((item) => {
    const baseData: any = {
      Brand: item.brand,
      Description: item.description,
      Quantity: item.quantity,
    };
    if (isAdmin) {
      baseData["Cost per Unit"] = formatCurrency(item.costPerUnit);
      baseData["Total Value"] = formatCurrency(item.quantity * item.costPerUnit);
    }
    return baseData;
  });

  return (
    <Tabs defaultValue="inventory">
      <div className="flex justify-between items-center">
        <TabsList>
          <TabsTrigger value="inventory">Current Stock</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>
        {isAdmin && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCosts(!showCosts)}
          >
            {showCosts ? (
              <EyeOff className="mr-2" />
            ) : (
              <Eye className="mr-2" />
            )}
            {showCosts ? "Hide Cost" : "Show Cost"}
          </Button>
        )}
      </div>
      <TabsContent value="inventory">
        <div className="border rounded-lg mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brand</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                {showCosts && (
                  <>
                    <TableHead className="text-right">Cost/Unit</TableHead>
                    <TableHead className="text-right">Total Value</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.brand}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.description}
                  </TableCell>
                  <TableCell className="text-center font-semibold">
                    {item.quantity}
                  </TableCell>
                  {showCosts && (
                    <>
                      <TableCell className="text-right">
                        {formatCurrency(item.costPerUnit)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(item.quantity * item.costPerUnit)}
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
              {displayItems.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={showCosts ? 5 : 3}
                    className="text-center text-muted-foreground h-24"
                  >
                    No inventory items found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
      <TabsContent value="backup">
        <div className="mt-4">
          <ExportData data={exportData} fileName="inventory_backup" />
        </div>
      </TabsContent>
    </Tabs>
  );
}
