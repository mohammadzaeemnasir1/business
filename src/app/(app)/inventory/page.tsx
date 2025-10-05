import { PageHeader } from "@/components/page-header";
import { getAllInventoryItems } from "@/lib/data";
import { auth } from "@/lib/auth";
import { InventoryView } from "./components/inventory-view";

export default async function InventoryPage() {
  const inventoryItems = getAllInventoryItems();
  const session = await auth();
  const isAdmin = session?.permissions.includes("admin") ?? false;

  // Aggregate items by brand and description
  const aggregatedItems = inventoryItems.reduce((acc, item) => {
    const key = `${item.brand}-${item.description}-${item.costPerUnit}`;
    if (!acc[key]) {
      acc[key] = { ...item, quantity: 0 };
    }
    acc[key].quantity += item.quantity;
    return acc;
  }, {} as Record<string, (typeof inventoryItems)[0]>);

  const displayItems = Object.values(aggregatedItems).sort((a, b) =>
    a.brand.localeCompare(b.brand)
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Inventory"
        description="A real-time view of all your stock."
      />
      <InventoryView displayItems={displayItems} isAdmin={isAdmin} />
    </div>
  );
}
