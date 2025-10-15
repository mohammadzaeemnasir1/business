import { PageHeader } from "@/components/page-header";
import {
  getDealers,
  getTotalOutstandingDebt,
  getTotalInventoryValue,
  getAllPayments,
  getOutstandingBalanceForDealer,
  getPersonalAccountSummary,
  getMonthlySales,
  getSales,
  getCustomers,
  getBills,
  getAllInventoryItems,
  getUsers,
  getOutstandingBalanceForBill,
  getPaidAmountForBill,
  getTotalProfit,
} from "@/lib/data";
import { StatsCards } from "./components/stats-cards";
import { FinancialOverview } from "./components/financial-overview";
import { RecentPayments } from "./components/recent-payments";
import { PersonalAccountSummary } from "./components/personal-account-summary";
import { SalesSummary } from "./components/sales-summary";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExportData } from "@/components/export-data";
import { formatCurrency } from "@/lib/utils";
import { MasterBackup } from "@/components/master-backup";


export default function DashboardPage() {
  const dealers = getDealers();
  const totalDealers = dealers.length;
  const totalOutstanding = getTotalOutstandingDebt();
  const totalInventoryValue = getTotalInventoryValue();
  const totalProfit = getTotalProfit();
  const payments = getAllPayments().slice(0, 5); // Show 5 most recent payments

  const dealerDataForAI = dealers.map((dealer) => ({
    name: dealer.name,
    outstandingBalance: getOutstandingBalanceForDealer(dealer.id),
  }));

  const faisalSummary = getPersonalAccountSummary("Faisal Rehman");
  const hafizSummary = getPersonalAccountSummary("Hafiz Abdul Rasheed");
  const monthlySales = getMonthlySales();

  // Data for export
  const dashboardSummaryData = [
    { Metric: "Total Outstanding Debt", Value: formatCurrency(totalOutstanding) },
    { Metric: "Total Inventory Value", Value: formatCurrency(totalInventoryValue) },
    { Metric: "Total Dealers", Value: totalDealers },
    { Metric: "Current Month Sales", Value: formatCurrency(monthlySales.currentMonth) },
    { Metric: "Previous Month Sales", Value: formatCurrency(monthlySales.previousMonth) },
    { Metric: "Faisal - Total Received", Value: formatCurrency(faisalSummary.totalReceived) },
    { Metric: "Faisal - Paid to Dealers", Value: formatCurrency(faisalSummary.totalPaidToDealers) },
    { Metric: "Faisal - Net Amount", Value: formatCurrency(faisalSummary.netAmount) },
    { Metric: "Hafiz - Total Received", Value: formatCurrency(hafizSummary.totalReceived) },
    { Metric: "Hafiz - Paid to Dealers", Value: formatCurrency(hafizSummary.totalPaidToDealers) },
    { Metric: "Hafiz - Net Amount", Value: formatCurrency(hafizSummary.netAmount) },
  ];

  // Master Backup Data
  const customers = getCustomers();
  const sales = getSales();
  const bills = getBills();
  const inventoryItems = getAllInventoryItems();
  const users = getUsers();
  
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
    "Outstanding Balance": getCustomerBalance(c.id),
  }));

  const salesExportData = sales.map(s => {
    const customer = customers.find(c => c.id === s.customerId);
    const saleTotal = s.items.reduce((acc, item) => acc + item.salePrice * item.quantity, 0);
    const balance = saleTotal - s.amountPaid;
    const itemsSummary = s.items.map(item => {
        const invItem = inventoryItems.find(i => i.id === item.inventoryItemId);
        return `${invItem?.brand || 'N/A'} (Qty: ${item.quantity}, Price: ${item.salePrice})`;
    }).join(', ');

    return {
      "Sale ID": s.id,
      "Bill No": s.billNo,
      "Date": s.date,
      "Customer Name": customer?.name || "N/A",
      "Items": itemsSummary,
      "Sale Total": saleTotal,
      "Amount Paid": s.amountPaid,
      "Balance": balance,
      "Sale Type": s.saleType,
      "Paid To": s.paidTo,
    };
  });

  const dealersExportData = dealers.map(dealer => ({
    "Dealer ID": dealer.id,
    "Name": dealer.name,
    "Contact": dealer.contact,
    "Outstanding Balance": getOutstandingBalanceForDealer(dealer.id),
  }));

  const billsExportData = bills.map(bill => {
    const dealer = dealers.find(d => d.id === bill.dealerId);
    const itemsSummary = bill.items.map(item => `${item.brand} (Qty: ${item.quantity}, Cost: ${item.costPerUnit})`).join(', ');
    const paymentsSummary = bill.payments.map(p => `${p.payer}: ${p.amount} on ${p.date}`).join(', ');

    return {
      "Bill ID": bill.id,
      "Dealer Name": dealer?.name || 'N/A',
      "Bill Number": bill.billNumber,
      "Date": bill.date,
      "Items": itemsSummary,
      "Total Amount": bill.totalAmount,
      "Paid Amount": getPaidAmountForBill(bill),
      "Balance": getOutstandingBalanceForBill(bill),
      "Payments": paymentsSummary,
    };
  });

  const inventoryExportData = inventoryItems.map(item => ({
    "Item ID": item.id,
    "Brand": item.brand,
    "Description": item.description,
    "Quantity": item.quantity,
    "Cost per Unit": item.costPerUnit,
    "Total Value": item.quantity * item.costPerUnit,
  }));

  const adminUsersExportData = users.map(u => ({
    ID: u.id,
    Name: u.name,
    Username: u.email,
    Permissions: u.permissions.join(", "),
  }));


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Dashboard"
          description="A high-level overview of your shop's financial health."
        />
         <MasterBackup
          data={{
            'Dashboard Summary': dashboardSummaryData,
            'Customers': customerExportData,
            'Sales': salesExportData,
            'Dealers': dealersExportData,
            'Bills': billsExportData,
            'Inventory': inventoryExportData,
            'Admin Users': adminUsersExportData,
          }}
          fileName="master_backup"
        />
      </div>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="space-y-8 mt-4">
            <StatsCards
              totalDealers={totalDealers}
              totalOutstanding={totalOutstanding}
              totalInventoryValue={totalInventoryValue}
              totalProfit={totalProfit}
            />
            
            <Separator />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <PersonalAccountSummary 
                  person="Faisal Rehman"
                  summary={faisalSummary}
                />
                <PersonalAccountSummary 
                  person="Hafiz Abdul Rasheed"
                  summary={hafizSummary}
                />
                <SalesSummary monthlySales={monthlySales}/>
            </div>

            <Separator />

            <div className="grid gap-8 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <FinancialOverview dealers={dealerDataForAI} />
              </div>
              <div className="lg:col-span-2">
                <RecentPayments payments={payments} />
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="backup">
            <div className="mt-4">
                <ExportData data={dashboardSummaryData} fileName="dashboard_summary_backup" />
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
