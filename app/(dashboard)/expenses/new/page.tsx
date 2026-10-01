import * as React from "react";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { getExpenseLookups } from "@/services/expenses";

export const metadata = {
  title: "Add Expense | HPS SEA FOODS",
  description: "Record a business expense.",
};

export const dynamic = "force-dynamic";

export default async function NewExpensePage() {
  const { categories, sales } = await getExpenseLookups();

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800/80 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-white">Add Expense</h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Record your spending on ice, packing, transport, labour, or link directly to a sale dispatch.
        </p>
      </div>

      <ExpenseForm categories={categories} sales={sales} />
    </div>
  );
}
