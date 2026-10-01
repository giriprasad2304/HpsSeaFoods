import * as React from "react";
import { SalesHeader } from "@/components/sales/sales-header";
import { SalesListView } from "@/components/sales/sales-list-view";
import { listSales, getCustomersAndFishTypes } from "@/services/sales";

export const metadata = {
  title: "Fish Selling | HPS SEA FOODS",
};

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const [sales, lookups] = await Promise.all([
    listSales({ limit: 50 }),
    getCustomersAndFishTypes(),
  ]);

  return (
    <div className="space-y-6">
      <SalesHeader />
      <React.Suspense fallback={<div className="h-64 flex items-center justify-center text-xs text-muted-foreground">Loading sales ledger...</div>}>
        <SalesListView
          initialSales={sales}
          customers={lookups.customers}
          fishTypes={lookups.fishTypes}
        />
      </React.Suspense>
    </div>
  );
}
