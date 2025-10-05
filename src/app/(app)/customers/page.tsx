import { PageHeader } from "@/components/page-header";
import { AddSaleForm } from "./components/add-sale-form";
import { getCustomers, getSales, getAllInventoryItems } from "@/lib/data";
import { CustomerView } from "./components/customer-view";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExportData } from "@/components/export-data";
import { formatCurrency } from "@/lib/utils";

export default function CustomersPage() {
  const customers = getCustomers();
  const sales = getSales();
  const inventoryItems = getAllInventoryItems();

  const nextBillNo = `B-${(sales.length + 1).toString().padStart(3, '0')}`;

  const getCustomerBalance = (customerId: string) => {
    const customerSales = sales.filter(s => s.customerId === customerId);
    return customerSales.reduce((totalBalance, sale) => {
        const saleTotal = sale.items.reduce((acc, item) => acc + item.salePrice * item.quantity, 0);
        const saleBalance = saleTotal - sale.amountPaid;
        return totalBalance + saleBalance;
    }, 0);
  }

  const customerExportData = customers.map(c => ({
    "Customer ID": c.id,
    "Name": c.name,
    "Contact": c.contact,
    "Outstanding Balance": formatCurrency(getCustomerBalance(c.id)),
  }));

  const salesExportData = sales.map(s => {
    const customer = customers.find(c => c.id === s.customerId);
    const saleTotal = s.items.reduce((acc, item) => acc + item.salePrice * item.quantity, 0);
    const balance = saleTotal - s.amountPaid;
    return {
      "Sale ID": s.id,
      "Bill No": s.billNo,
      "Date": s.date,
      "Customer Name": customer?.name || "N/A",
      "Sale Total": formatCurrency(saleTotal),
      "Amount Paid": formatCurrency(s.amountPaid),
      "Balance": formatCurrency(balance),
      "Sale Type": s.saleType,
      "Paid To": s.paidTo,
    };
  });


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Customers & Sales"
          description="Manage your customer records and sales history."
        />
        <AddSaleForm inventoryItems={inventoryItems} customers={customers} sales={sales} nextBillNo={nextBillNo} />
      </div>
      <Tabs defaultValue="overview">
        <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <CustomerView customers={customers} sales={sales} inventoryItems={inventoryItems} />
        </TabsContent>
        <TabsContent value="backup">
            <div className="space-y-4 mt-4">
                <div className="space-y-2">
                    <h3 className="font-semibold">Export Customers</h3>
                    <ExportData data={customerExportData} fileName="customers_backup" buttonText="Export All Customers"/>
                </div>
                 <div className="space-y-2">
                    <h3 className="font-semibold">Export Sales</h3>
                    <ExportData data={salesExportData} fileName="sales_backup" buttonText="Export All Sales"/>
                </div>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
