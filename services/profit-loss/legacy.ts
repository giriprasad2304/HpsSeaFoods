/**
 * Legacy P&L Summary — kept for backward compatibility.
 * New code should use getProfitLossDashboard() from the main index.
 */
import { prisma } from "@/lib/prisma";

export interface ProfitLossSummary {
  period: string;
  totalRevenue: number;
  cogsPurchases: number;
  packagingAndIceCost: number;
  directLabour: number;
  grossProfit: number;
  grossProfitMargin: number;
  operatingExpenses: number;
  netProfit: number;
  netProfitMargin: number;
  monthlyTrends: Array<{
    month: string;
    revenue: number;
    purchases: number;
    expenses: number;
    netProfit: number;
  }>;
}

export async function getProfitLossSummary(): Promise<ProfitLossSummary> {
  try {
    const sales = await prisma.sale.aggregate({
      _sum: { totalAmount: true },
    });
    const purchases = await prisma.purchase.aggregate({
      _sum: { totalAmount: true },
    });
    const expenses = await prisma.expense.aggregate({
      _sum: { amount: true },
    });
    const packing = await prisma.packingCost.aggregate({
      _sum: { totalCost: true },
    });

    const totalRev = sales._sum?.totalAmount ?? 0;
    const totalPurch = purchases._sum?.totalAmount ?? 0;
    const packCost = packing._sum.totalCost ?? 0;
    const directLab = 0;
    const grossProf = totalRev - (totalPurch + packCost + directLab);
    const opExp = expenses._sum.amount ?? 0;
    const netProf = grossProf - opExp;

    return {
      period: "All Time",
      totalRevenue: totalRev,
      cogsPurchases: totalPurch,
      packagingAndIceCost: packCost,
      directLabour: directLab,
      grossProfit: grossProf,
      grossProfitMargin: totalRev > 0 ? (grossProf / totalRev) * 100 : 0,
      operatingExpenses: opExp,
      netProfit: netProf,
      netProfitMargin: totalRev > 0 ? (netProf / totalRev) * 100 : 0,
      monthlyTrends: [],
    };
  } catch {
    return {
      period: "All Time",
      totalRevenue: 0,
      cogsPurchases: 0,
      packagingAndIceCost: 0,
      directLabour: 0,
      grossProfit: 0,
      grossProfitMargin: 0,
      operatingExpenses: 0,
      netProfit: 0,
      netProfitMargin: 0,
      monthlyTrends: [],
    };
  }
}
