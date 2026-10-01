import * as React from "react";
import { SalesReportView } from "@/components/reports/sales-report-view";
import { generateSalesReport, getReportLookups } from "@/services/reports";

export const metadata = {
  title: "Sales Report | HPS SEA FOODS",
  description: "All customer sales, weights, invoices, delivery status, and payments.",
};

export const dynamic = "force-dynamic";

export default async function SalesReportPage() {
  const [initialData, lookups] = await Promise.all([
    generateSalesReport(),
    getReportLookups(),
  ]);

  return (
    <React.Suspense fallback={<div className="h-64 flex items-center justify-center text-xs text-muted-foreground">Loading sales report...</div>}>
      <SalesReportView initialData={initialData} lookups={lookups} />
    </React.Suspense>
  );
}
