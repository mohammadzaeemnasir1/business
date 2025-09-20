import { notFound } from "next/navigation";
import Link from "next/link";
import { getSaleById, getCustomerById, getInventoryItemById } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { BillDetails } from "./components/bill-details";

export default function SaleDetailPage({ params }: { params: { id: string } }) {
  const sale = getSaleById(params.id);

  if (!sale) {
    notFound();
  }
  
  const customer = getCustomerById(sale.customerId);

  if (!customer) {
      notFound();
  }

  const detailedItems = sale.items.map(item => {
      const inventoryItem = getInventoryItemById(item.inventoryItemId);
      return {
          name: inventoryItem?.brand || "Unknown Item",
          category: inventoryItem?.description || "N/A",
          size: "N/A",
          color: "N/A",
          price: item.salePrice,
          quantity: item.quantity,
      }
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between no-print">
         <Button asChild variant="outline" size="sm">
            <Link href="/customers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sales
            </Link>
        </Button>
        <PageHeader
            title={`Sale #${sale.id}`}
            description={`Details for sale to ${customer.name}`}
            className="text-right"
        />
      </div>
      
      <div className="print-container">
        <BillDetails sale={sale} customer={customer} items={detailedItems} />
      </div>

    </div>
  );
}
