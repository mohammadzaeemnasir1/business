import { PageHeader } from "@/components/page-header";
import { AddSaleForm } from "./components/add-sale-form";
import { getCustomers, getSales, getAllInventoryItems } from "@/lib/data";
import { CustomerView } from "./components/customer-view";

export default function CustomersPage() {
  const customers = getCustomers();
  const sales = getSales();
  const inventoryItems = getAllInventoryItems();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Customers & Sales"
          description="Manage your customer records and sales history."
        />
        <AddSaleForm inventoryItems={inventoryItems} customers={customers} />
      </div>
      <CustomerView customers={customers} sales={sales} inventoryItems={inventoryItems} />
    </div>
  );
}
