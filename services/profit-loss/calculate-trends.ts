/**
 * Calculate Profit Trends
 * ────────────────────────
 * Generate time-series data points for revenue, COGS, expenses, and profit.
 * Automatically groups by:
 *  - Days (if range ≤ 31 days)
 *  - Weeks (if range ≤ 90 days)
 *  - Months (otherwise)
 */
import { prisma } from "@/lib/prisma";
import type { ProfitTrendPoint } from "@/types/report";
import type { DateRange } from "./date-utils";

interface BucketData {
  revenue: number;
  cogs: number;
  expenses: number;
}

function getBucketKey(date: Date, mode: "day" | "week" | "month"): string {
  switch (mode) {
    case "day":
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    case "week": {
      // ISO week start (Monday)
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      d.setDate(diff);
      return `W${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    }
    case "month":
      return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  }
}

/**
 * Generate a list of all bucket keys in order between start and end.
 */
function generateBucketKeys(start: Date, end: Date, mode: "day" | "week" | "month"): string[] {
  const keys: string[] = [];
  const current = new Date(start);

  while (current <= end) {
    const key = getBucketKey(current, mode);
    if (!keys.includes(key)) {
      keys.push(key);
    }
    switch (mode) {
      case "day":
        current.setDate(current.getDate() + 1);
        break;
      case "week":
        current.setDate(current.getDate() + 7);
        break;
      case "month":
        current.setMonth(current.getMonth() + 1);
        break;
    }
  }

  return keys;
}

export async function calculateProfitTrends(range: DateRange): Promise<ProfitTrendPoint[]> {
  const diffDays = Math.ceil((range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24));
  const mode: "day" | "week" | "month" =
    diffDays <= 31 ? "day" : diffDays <= 90 ? "week" : "month";

  // Fetch raw data
  const [sales, purchases, packingCosts, expenseList] = await Promise.all([
    prisma.sale.findMany({
      where: {
        saleDate: { gte: range.start, lte: range.end },
        status: { notIn: ["DRAFT", "CANCELLED"] },
      },
      select: { saleDate: true, totalAmount: true },
    }),
    prisma.purchase.findMany({
      where: {
        purchaseDate: { gte: range.start, lte: range.end },
        status: { notIn: ["DRAFT", "CANCELLED"] },
      },
      select: {
        purchaseDate: true,
        subtotal: true,
        transportCharges: true,
        iceCharges: true,
        labourCharges: true,
      },
    }),
    prisma.packingCost.findMany({
      where: {
        createdAt: { gte: range.start, lte: range.end },
      },
      select: { createdAt: true, totalCost: true },
    }),
    prisma.expense.findMany({
      where: {
        expenseDate: { gte: range.start, lte: range.end },
      },
      select: { expenseDate: true, amount: true },
    }),
  ]);

  // Initialize all buckets
  const allKeys = generateBucketKeys(range.start, range.end, mode);
  const buckets = new Map<string, BucketData>();
  for (const key of allKeys) {
    buckets.set(key, { revenue: 0, cogs: 0, expenses: 0 });
  }

  // Fill revenue
  for (const sale of sales) {
    const key = getBucketKey(new Date(sale.saleDate), mode);
    const b = buckets.get(key);
    if (b) b.revenue += sale.totalAmount;
  }

  // Fill COGS (purchases + packing)
  for (const p of purchases) {
    const key = getBucketKey(new Date(p.purchaseDate), mode);
    const b = buckets.get(key);
    if (b) {
      b.cogs += p.subtotal + p.transportCharges + p.iceCharges + p.labourCharges;
    }
  }
  for (const pc of packingCosts) {
    const key = getBucketKey(new Date(pc.createdAt), mode);
    const b = buckets.get(key);
    if (b) b.cogs += pc.totalCost;
  }

  // Fill expenses
  for (const exp of expenseList) {
    const key = getBucketKey(new Date(exp.expenseDate), mode);
    const b = buckets.get(key);
    if (b) b.expenses += exp.amount;
  }

  // Build trend points in order
  const trends: ProfitTrendPoint[] = allKeys.map((key) => {
    const data = buckets.get(key)!;
    const grossProfit = data.revenue - data.cogs;
    const netProfit = grossProfit - data.expenses;
    return {
      label: key,
      revenue: Number(data.revenue.toFixed(2)),
      cogs: Number(data.cogs.toFixed(2)),
      expenses: Number(data.expenses.toFixed(2)),
      grossProfit: Number(grossProfit.toFixed(2)),
      netProfit: Number(netProfit.toFixed(2)),
    };
  });

  return trends;
}
