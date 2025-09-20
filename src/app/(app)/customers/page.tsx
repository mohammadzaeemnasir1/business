import { PageHeader } from "@/components/page-header";
import { AddSaleForm } from "./components/add-sale-form";
import { CustomerList } from "./components/customer-list";
import { getCustomers, getSales } from "@/lib/data";

export default function CustomersPage() {
  const customers = getCustomers();
  const sales = getSales();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Customers"
          description="Manage your customer sales and records."
        />
        <AddSaleForm />
      </div>
      <CustomerList customers={customers} sales={sales} />
    </div>
  );
}
