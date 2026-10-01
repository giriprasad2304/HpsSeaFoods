import * as React from "react";
import { InventoryListView } from "@/components/inventory/inventory-list-view";
import { getInventoryStockSummary } from "@/services/inventory";

export const metadata = {
  title: "Current Stock | HPS SEA FOODS",
};

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const stockSummary = await getInventoryStockSummary();

  return (
    <div className="space-y-6">
      <React.Suspense fallback={<div className="h-64 flex items-center justify-center text-xs text-muted-foreground">Loading cold storage ledger...</div>}>
        <InventoryListView initialItems={stockSummary} />
      </React.Suspense>
    </div>
  );
}
