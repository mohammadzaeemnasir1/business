import { PageHeader } from "@/components/page-header";
import { getAllInventoryItems } from "@/lib/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

export default function InventoryPage() {
  const inventoryItems = getAllInventoryItems();

  // Aggregate items by brand and description
  const aggregatedItems = inventoryItems.reduce((acc, item) => {
    const key = `${item.brand}-${item.description}-${item.costPerUnit}`;
    if (!acc[key]) {
      acc[key] = { ...item, quantity: 0 };
    }
    acc[key].quantity += item.quantity;
    return acc;
  }, {} as Record<string, typeof inventoryItems[0]>);

  const displayItems = Object.values(aggregatedItems).sort((a,b) => a.brand.localeCompare(b.brand));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Inventory"
        description="A real-time view of all your stock."
      />

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Brand</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-center">Quantity</TableHead>
              <TableHead className="text-right">Cost/Unit</TableHead>
              <TableHead className="text-right">Total Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayItems.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.brand}</TableCell>
                <TableCell className="text-muted-foreground">{item.description}</TableCell>
                <TableCell className="text-center font-semibold">{item.quantity}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.costPerUnit)}</TableCell>
                <TableCell className="text-right font-bold">{formatCurrency(item.quantity * item.costPerUnit)}</TableCell>
              </TableRow>
            ))}
             {displayItems.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                        No inventory items found.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
