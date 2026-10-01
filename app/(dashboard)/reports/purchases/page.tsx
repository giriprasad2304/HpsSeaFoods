import * as React from "react";
import { PurchaseReportView } from "@/components/reports/purchase-report-view";
import { generatePurchaseReport, getReportLookups } from "@/services/reports";

export const metadata = {
  title: "Purchases Report | HPS SEA FOODS",
  description: "All fish bought from boats, quantities, charges, and payment status.",
};

export const dynamic = "force-dynamic";

export default async function PurchaseReportPage() {
  const [initialData, lookups] = await Promise.all([
    generatePurchaseReport(),
    getReportLookups(),
  ]);

  return (
    <React.Suspense fallback={<div className="h-64 flex items-center justify-center text-xs text-muted-foreground">Loading purchase report...</div>}>
      <PurchaseReportView initialData={initialData} lookups={lookups} />
    </React.Suspense>
  );
}
