import * as React from "react";
import { ExpenseReportView } from "@/components/reports/expense-report-view";
import { generateExpenseReport, getReportLookups } from "@/services/reports";

export const metadata = {
  title: "Expenses Report | HPS SEA FOODS",
  description: "All spending on thermocol boxes, ice, transport, labour, and daily costs.",
};

export const dynamic = "force-dynamic";

export default async function ExpenseReportPage() {
  const [initialData, lookups] = await Promise.all([
    generateExpenseReport(),
    getReportLookups(),
  ]);

  return (
    <React.Suspense fallback={<div className="h-64 flex items-center justify-center text-xs text-muted-foreground">Loading expense report...</div>}>
      <ExpenseReportView initialData={initialData} lookups={lookups} />
    </React.Suspense>
  );
}
