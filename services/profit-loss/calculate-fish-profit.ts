/**
 * Calculate Fish Type Profitability
 * ──────────────────────────────────
 * For each fish type:
 *   Revenue = Sum of sale item totals
 *   Avg Selling Price = Revenue / Total Quantity Sold
 *   Avg Purchase Cost = Total Purchase Cost / Total Purchased Kg
 *   Gross Profit = Revenue - (Avg Purchase Cost × Quantity Sold)
 */
import { prisma } from "@/lib/prisma";
import type { FishTypeProfitItem } from "@/types/report";
import type { DateRange } from "./date-utils";

export async function calculateFishTypeProfitability(
  range: DateRange
): Promise<FishTypeProfitItem[]> {
  // Sale items by fish type
  const saleItems = await prisma.saleItem.findMany({
    where: {
      sale: {
        saleDate: { gte: range.start, lte: range.end },
        status: { notIn: ["DRAFT", "CANCELLED"] },
      },
    },
    include: {
      fishType: {
        select: { id: true, name: true, category: true },
      },
    },
  });

  // Purchase items by fish type (for cost calculation)
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

  // Weighted average purchase cost per fish type
  const purchaseCostMap = new Map<string, { totalCost: number; totalKg: number }>();
  for (const item of purchaseItems) {
    const existing = purchaseCostMap.get(item.fishTypeId) || { totalCost: 0, totalKg: 0 };
    existing.totalCost += item.unitPricePerKg * item.weightKg;
    existing.totalKg += item.weightKg;
    purchaseCostMap.set(item.fishTypeId, existing);
  }

  // Aggregate sales by fish type
  const fishMap = new Map<string, {
    fishTypeId: string;
    fishTypeName: string;
    category: string;
    totalRevenue: number;
    totalKgSold: number;
  }>();

  for (const item of saleItems) {
    const fishId = item.fishType.id;
    const existing = fishMap.get(fishId) || {
      fishTypeId: fishId,
      fishTypeName: item.fishType.name,
      category: item.fishType.category,
      totalRevenue: 0,
      totalKgSold: 0,
    };
    existing.totalRevenue += item.totalPrice;
    existing.totalKgSold += item.weightKg;
    fishMap.set(fishId, existing);
  }

  const results: FishTypeProfitItem[] = [];
  for (const fish of fishMap.values()) {
    const purchaseData = purchaseCostMap.get(fish.fishTypeId);
    const avgPurchaseCost = purchaseData && purchaseData.totalKg > 0
      ? purchaseData.totalCost / purchaseData.totalKg
      : 0;
    const avgSellingPrice = fish.totalKgSold > 0
      ? fish.totalRevenue / fish.totalKgSold
      : 0;
    const cogs = avgPurchaseCost * fish.totalKgSold;
    const grossProfit = fish.totalRevenue - cogs;
    const margin = fish.totalRevenue > 0
      ? (grossProfit / fish.totalRevenue) * 100
      : 0;

    results.push({
      fishTypeId: fish.fishTypeId,
      fishTypeName: fish.fishTypeName,
      category: fish.category,
      quantitySoldKg: Number(fish.totalKgSold.toFixed(2)),
      revenue: Number(fish.totalRevenue.toFixed(2)),
      averageSellingPrice: Number(avgSellingPrice.toFixed(2)),
      averagePurchaseCost: Number(avgPurchaseCost.toFixed(2)),
      grossProfit: Number(grossProfit.toFixed(2)),
      margin: Number(margin.toFixed(1)),
    });
  }

  return results.sort((a, b) => b.grossProfit - a.grossProfit);
}
