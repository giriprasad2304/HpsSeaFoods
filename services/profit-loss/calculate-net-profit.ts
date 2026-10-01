/**
 * Calculate Net Profit
 * ────────────────────
 * Gross Profit - Operating Expenses = Net Profit
 */
import { prisma } from "@/lib/prisma";
import type { ExpenseBreakdown, ExpenseBreakdownItem } from "@/types/report";
import type { DateRange } from "./date-utils";

/**
 * Calculate operating expenses breakdown by category within the date range.
 */
export async function calculateExpenses(range: DateRange): Promise<ExpenseBreakdown> {
  const groupedExpenses = await prisma.expense.groupBy({
    by: ["categoryId"],
    where: {
      expenseDate: { gte: range.start, lte: range.end },
    },
    _sum: { amount: true },
  });

  const totalExpenses = groupedExpenses.reduce(
    (sum, item) => sum + (item._sum.amount ?? 0),
    0
  );

  // Fetch category names
  const categoryIds = groupedExpenses.map((g) => g.categoryId);
  const categories = categoryIds.length > 0
    ? await prisma.expenseCategory.findMany({
        where: { id: { in: categoryIds } },
        select: { id: true, name: true },
      })
    : [];
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const items: ExpenseBreakdownItem[] = groupedExpenses
    .map((g) => ({
      categoryId: g.categoryId,
      categoryName: categoryMap.get(g.categoryId) || "Uncategorized",
      amount: g._sum.amount ?? 0,
      percentage: totalExpenses > 0
        ? Number((((g._sum.amount ?? 0) / totalExpenses) * 100).toFixed(1))
        : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    items,
    totalExpenses: Number(totalExpenses.toFixed(2)),
  };
}

/**
 * Calculate Net Profit and Net Profit Margin.
 */
export function calculateNetProfit(
  grossProfit: number,
  totalExpenses: number,
  totalRevenue: number
): { netProfit: number; netProfitMargin: number } {
  const netProfit = Number((grossProfit - totalExpenses).toFixed(2));
  const netProfitMargin = totalRevenue > 0
    ? Number(((netProfit / totalRevenue) * 100).toFixed(2))
    : 0;
  return { netProfit, netProfitMargin };
}
