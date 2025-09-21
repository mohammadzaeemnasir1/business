import { PageHeader } from "@/components/page-header";
import { AddSaleForm } from "./components/add-sale-form";
import { SalesList } from "./components/sales-list";
import { getCustomers, getSales, getAllInventoryItems } from "@/lib/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerList } from "./components/customer-list";

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

      <Tabs defaultValue="sales">
        <TabsList>
          <TabsTrigger value="sales">All Sales</TabsTrigger>
          <TabsTrigger value="customers">All Customers</TabsTrigger>
        </TabsList>
        <TabsContent value="sales">
          <SalesList sales={sales} customers={customers} inventoryItems={inventoryItems}/>
        </TabsContent>
        <TabsContent value="customers">
          <CustomerList customers={customers} sales={sales} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
