import * as React from "react";
import { PurchasesHeader } from "@/components/purchases/purchases-header";
import { PurchasesListView } from "@/components/purchases/purchases-list-view";
import { listPurchases, getSuppliersAndFishTypes } from "@/services/purchases";

export const metadata = {
  title: "Fish Buying | HPS SEA FOODS",
};

export const dynamic = "force-dynamic";

export default async function PurchasesPage() {
  const [batches, lookups] = await Promise.all([
    listPurchases({ limit: 50 }),
    getSuppliersAndFishTypes(),
  ]);

  return (
    <div className="space-y-6">
      <PurchasesHeader />
      <React.Suspense fallback={<div className="h-64 flex items-center justify-center text-xs text-muted-foreground">Loading purchases landings...</div>}>
        <PurchasesListView
          initialBatches={batches}
          suppliers={lookups.suppliers}
          fishTypes={lookups.fishTypes}
        />
      </React.Suspense>
    </div>
  );
}
