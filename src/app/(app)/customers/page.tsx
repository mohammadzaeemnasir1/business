import { PageHeader } from "@/components/page-header";

export default function CustomersPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Customers"
          description="Manage your customer sales and records."
        />
      </div>
      <div className="border rounded-lg h-96 flex items-center justify-center">
        <p className="text-muted-foreground">Customer sales functionality coming soon.</p>
      </div>
    </div>
  );
}
