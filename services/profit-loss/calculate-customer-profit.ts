/**
 * Calculate Customer Profitability
 * ─────────────────────────────────
 * For each customer:
 *   Revenue = Sum of sale totals
 *   COGS = Weighted average purchase cost × quantity sold
 *   Gross Profit = Revenue - COGS
 */
import { prisma } from "@/lib/prisma";
import type { CustomerProfitItem } from "@/types/report";
import type { DateRange } from "./date-utils";

export async function calculateCustomerProfitability(
  range: DateRange
): Promise<CustomerProfitItem[]> {
  // Get sales grouped by customer, including items for COGS calculation
  const sales = await prisma.sale.findMany({
    where: {
      saleDate: { gte: range.start, lte: range.end },
      status: { notIn: ["DRAFT", "CANCELLED"] },
    },
    include: {
      customer: {
        select: { id: true, name: true, companyName: true },
      },
      items: {
        select: {
          fishTypeId: true,
          weightKg: true,
          totalPrice: true,
        },
      },
    },
  });

  // Get average purchase cost per fish type for COGS estimation
  const purchaseItems = await prisma.purchaseItem.findMany({
    where: {
      purchase: {
        purchaseDate: { gte: range.start, lte: range.end },
        status: { notIn: ["DRAFT", "CANCELLED"] },
      },
    },
    select: {
      fishTypeId: true,
      weightKg: true,
      unitPricePerKg: true,
    },
  });

  // Weighted average cost per fish type
  const fishCostMap = new Map<string, { totalCost: number; totalKg: number }>();
  for (const item of purchaseItems) {
    const existing = fishCostMap.get(item.fishTypeId) || { totalCost: 0, totalKg: 0 };
    existing.totalCost += item.unitPricePerKg * item.weightKg;
    existing.totalKg += item.weightKg;
    fishCostMap.set(item.fishTypeId, existing);
  }

  const avgCostPerKg = new Map<string, number>();
  for (const [fishId, data] of fishCostMap.entries()) {
    avgCostPerKg.set(fishId, data.totalKg > 0 ? data.totalCost / data.totalKg : 0);
  }

  // Aggregate by customer
  const customerMap = new Map<string, CustomerProfitItem>();

  for (const sale of sales) {
    const custId = sale.customer.id;
    const existing = customerMap.get(custId) || {
      customerId: custId,
      customerName: sale.customer.name,
      companyName: sale.customer.companyName,
      revenue: 0,
      cogs: 0,
      grossProfit: 0,
      margin: 0,
      salesCount: 0,
    };

    existing.revenue += sale.totalAmount;
    existing.salesCount += 1;

    // Estimate COGS for this sale based on avg purchase cost per fish type
    for (const item of sale.items) {
      const costPerKg = avgCostPerKg.get(item.fishTypeId) ?? 0;
      existing.cogs += costPerKg * item.weightKg;
    }

    customerMap.set(custId, existing);
  }

  // Compute profit and margin
  const results: CustomerProfitItem[] = [];
  for (const item of customerMap.values()) {
    item.revenue = Number(item.revenue.toFixed(2));
    item.cogs = Number(item.cogs.toFixed(2));
    item.grossProfit = Number((item.revenue - item.cogs).toFixed(2));
    item.margin = item.revenue > 0
      ? Number(((item.grossProfit / item.revenue) * 100).toFixed(1))
      : 0;
    results.push(item);
  }

  return results.sort((a, b) => b.grossProfit - a.grossProfit);
}
