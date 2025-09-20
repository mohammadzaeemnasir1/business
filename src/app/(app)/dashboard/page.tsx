import { PageHeader } from "@/components/page-header";
import {
  getDealers,
  getTotalOutstandingDebt,
  getTotalInventoryValue,
  getAllPayments,
  getOutstandingBalanceForDealer,
} from "@/lib/data";
import { StatsCards } from "./components/stats-cards";
import { FinancialOverview } from "./components/financial-overview";
import { RecentPayments } from "./components/recent-payments";

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

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="A high-level overview of your shop's financial health."
      />

      <StatsCards
        totalDealers={totalDealers}
        totalOutstanding={totalOutstanding}
        totalInventoryValue={totalInventoryValue}
      />

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <FinancialOverview dealers={dealerDataForAI} />
        </div>
        <div className="lg:col-span-2">
          <RecentPayments payments={payments} />
        </div>
      </div>
    </div>
  );
}
