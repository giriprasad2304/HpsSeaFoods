import * as React from "react";
import { ProfitLossReportView } from "@/components/reports/profit-loss-report-view";
import { generateProfitLossStatementReport, getReportLookups } from "@/services/reports";

export const metadata = {
  title: "Profit & Loss Statement | HPS SEA FOODS",
  description: "Detailed breakdown of sales, purchases, packing, and net profit.",
};

export const dynamic = "force-dynamic";

export default async function ProfitLossReportPage() {
  const [initialData, lookups] = await Promise.all([
    generateProfitLossStatementReport(),
    getReportLookups(),
  ]);

  return (
    <React.Suspense fallback={<div className="h-64 flex items-center justify-center text-xs text-muted-foreground">Loading P&L report...</div>}>
      <ProfitLossReportView initialData={initialData} lookups={lookups} />
    </React.Suspense>
  );
}
