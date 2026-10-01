/**
 * Calculate Gross Profit
 * ─────────────────────
 * Revenue - Cost of Goods Sold = Gross Profit
 *
 * COGS includes:
 *  - Raw material (fish purchase) cost
 *  - Transport charges on purchases
 *  - Ice charges on purchases
 *  - Labour charges on purchases
 *  - Packing costs
 */
import { prisma } from "@/lib/prisma";
import type { COGSBreakdown } from "@/types/report";
import type { DateRange } from "./date-utils";

/**
 * Calculate total sales revenue within the date range.
 * Only counts CONFIRMED/DELIVERED sales (excludes DRAFT and CANCELLED).
 */
export async function calculateRevenue(range: DateRange): Promise<{ totalRevenue: number; salesCount: number }> {
  const result = await prisma.sale.aggregate({
    where: {
      saleDate: { gte: range.start, lte: range.end },
      status: { notIn: ["DRAFT", "CANCELLED"] },
    },
    _sum: { totalAmount: true },
    _count: { id: true },
  });

  return {
    totalRevenue: result._sum.totalAmount ?? 0,
    salesCount: result._count.id,
  };
}

/**
 * Calculate full COGS breakdown within the date range.
 */
export async function calculateCOGS(range: DateRange): Promise<COGSBreakdown> {
  // Raw material + purchase overhead charges
  const purchaseAgg = await prisma.purchase.aggregate({
    where: {
      purchaseDate: { gte: range.start, lte: range.end },
      status: { notIn: ["DRAFT", "CANCELLED"] },
    },
    _sum: {
      subtotal: true,
      transportCharges: true,
      iceCharges: true,
      labourCharges: true,
    },
  });

  const rawMaterialCost = purchaseAgg._sum.subtotal ?? 0;
  const transportCharges = purchaseAgg._sum.transportCharges ?? 0;
  const iceCharges = purchaseAgg._sum.iceCharges ?? 0;
  const labourCharges = purchaseAgg._sum.labourCharges ?? 0;

  // Packing costs in the period
  const packingAgg = await prisma.packingCost.aggregate({
    where: {
      createdAt: { gte: range.start, lte: range.end },
    },
    _sum: { totalCost: true },
  });
  const packingCost = packingAgg._sum.totalCost ?? 0;

  const totalCOGS = Number(
    (rawMaterialCost + transportCharges + iceCharges + labourCharges + packingCost).toFixed(2)
  );

  return {
    rawMaterialCost,
    transportCharges,
    iceCharges,
    labourCharges,
    packingCost,
    totalCOGS,
  };
}

/**
 * Calculate Gross Profit and Gross Profit Margin.
 */
export function calculateGrossProfit(
  totalRevenue: number,
  totalCOGS: number
): { grossProfit: number; grossProfitMargin: number } {
  const grossProfit = Number((totalRevenue - totalCOGS).toFixed(2));
  const grossProfitMargin = totalRevenue > 0
    ? Number(((grossProfit / totalRevenue) * 100).toFixed(2))
    : 0;
  return { grossProfit, grossProfitMargin };
}
