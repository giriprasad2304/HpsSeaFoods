import * as React from "react";
import { BalanceSheetReportView } from "@/components/reports/balance-sheet-report-view";
import { generateBalanceSheetReport, getReportLookups } from "@/services/reports";

export const metadata = {
  title: "Balance Sheet | HPS SEA FOODS",
  description: "Summary of business assets and liabilities.",
};

export const dynamic = "force-dynamic";

export default async function BalanceSheetReportPage() {
  const [initialData, lookups] = await Promise.all([
    generateBalanceSheetReport(),
    getReportLookups(),
  ]);

  return (
    <React.Suspense fallback={<div className="h-64 flex items-center justify-center text-xs text-muted-foreground">Loading balance sheet...</div>}>
      <BalanceSheetReportView initialData={initialData} lookups={lookups} />
    </React.Suspense>
  );
}
