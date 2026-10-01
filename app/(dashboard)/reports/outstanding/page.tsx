import * as React from "react";
import { OutstandingReportView } from "@/components/reports/outstanding-report-view";
import { generateOutstandingReport, getReportLookups } from "@/services/reports";

export const metadata = {
  title: "Pending Dues & Balances | HPS SEA FOODS",
  description: "Money you need to collect from customers and money you owe to suppliers.",
};

export const dynamic = "force-dynamic";

export default async function OutstandingReportPage() {
  const [initialData, lookups] = await Promise.all([
    generateOutstandingReport(),
    getReportLookups(),
  ]);

  return (
    <React.Suspense fallback={<div className="h-64 flex items-center justify-center text-xs text-muted-foreground">Loading outstanding report...</div>}>
      <OutstandingReportView initialData={initialData} lookups={lookups} />
    </React.Suspense>
  );
}
