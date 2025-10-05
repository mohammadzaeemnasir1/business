import { notFound } from "next/navigation";
import Link from "next/link";
import { getSaleById, getCustomerById, getInventoryItemById, getSalesByCustomerId } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { BillDetails } from "./components/bill-details";
import { format } from "date-fns";

export default function SaleDetailPage({ params }: { params: { id: string } }) {
  const sale = getSaleById(params.id);

  if (!sale) {
    notFound();
  }
  
  const customer = getCustomerById(sale.customerId);

  if (!customer) {
      notFound();
  }

  const customerSales = getSalesByCustomerId(customer.id);
  
  const outstandingBalance = customerSales.reduce((totalBalance, s) => {
      const saleTotal = s.items.reduce((acc, item) => acc + item.salePrice * item.quantity, 0);
      const saleBalance = saleTotal - s.amountPaid;
      return totalBalance + saleBalance;
  }, 0);

  let lastPurchase: string | null = null;
  if (customerSales.length > 0) {
      const lastSale = customerSales.filter(s => s.id !== sale.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      if (lastSale) {
        lastPurchase = format(new Date(lastSale.date), "dd MMM, yyyy");
      }
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
            title={`Sale #${sale.billNo}`}
            description={`Details for sale to ${customer.name}`}
            className="text-right"
        />
      </div>
      
      <div className="print-container">
        <BillDetails 
            sale={sale} 
            customer={customer} 
            items={detailedItems} 
            totalOutstanding={outstandingBalance}
            lastPurchaseDate={lastPurchase}
        />
      </div>

    </div>
  );
}
