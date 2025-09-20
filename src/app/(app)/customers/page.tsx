import { PageHeader } from "@/components/page-header";
import { AddSaleForm } from "./components/add-sale-form";
import { SalesList } from "./components/sales-list";
import { getCustomers, getSales, getAllInventoryItems } from "@/lib/data";

export default function CustomersPage() {
  const customers = getCustomers();
  const sales = getSales();
  const inventoryItems = getAllInventoryItems();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Customers"
          description="Manage your customer sales and records."
        />
        <AddSaleForm inventoryItems={inventoryItems} />
      </div>
      <SalesList sales={sales} customers={customers} inventoryItems={inventoryItems}/>
    </div>
  );
}
