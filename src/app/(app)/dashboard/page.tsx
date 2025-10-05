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


export default function DashboardPage() {
  const dealers = getDealers();
  const totalDealers = dealers.length;
  const totalOutstanding = getTotalOutstandingDebt();
  const totalInventoryValue = getTotalInventoryValue();
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

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="A high-level overview of your shop's financial health."
      />
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
