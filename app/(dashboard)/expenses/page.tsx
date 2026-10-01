import * as React from "react";
import { ExpensesHeader } from "@/components/expenses/expenses-header";
import { ExpensesListView } from "@/components/expenses/expenses-list-view";
import { getExpensesList, getExpenseCategories, getExpenseSummaryMetrics } from "@/services/expenses";

export const metadata = {
  title: "Daily Expenses | HPS SEA FOODS",
  description: "Track all your daily spending — ice, boxes, transport, labour, etc.",
};

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const [expenses, categories, metrics] = await Promise.all([
    getExpensesList(50),
    getExpenseCategories(),
    getExpenseSummaryMetrics(),
  ]);

  return (
    <div className="space-y-6">
      <ExpensesHeader totalCount={metrics.totalCount} />
      <React.Suspense fallback={<div className="h-64 flex items-center justify-center text-xs text-muted-foreground">Loading expenses ledger...</div>}>
        <ExpensesListView
          initialExpenses={expenses}
          categories={categories}
          metrics={metrics}
        />
      </React.Suspense>
    </div>
  );
}
