/**
 * Profit & Loss Service
 * ─────────────────────
 * Orchestrates all P&L calculations into a single dashboard data payload.
 * All financial computations happen server-side.
 */
import type {
  ProfitLossDateFilter,
  ProfitLossReport,
  ProfitLossDashboardData,
} from "@/types/report";

import { resolveDateRange } from "./date-utils";
import { calculateRevenue, calculateCOGS, calculateGrossProfit } from "./calculate-gross-profit";
import { calculateExpenses, calculateNetProfit } from "./calculate-net-profit";
import { calculateCustomerProfitability } from "./calculate-customer-profit";
import { calculateFishTypeProfitability } from "./calculate-fish-profit";
import { calculateProfitTrends } from "./calculate-trends";

export type { ProfitLossSummary } from "./legacy";

/**
 * Generate the full P&L dashboard data for a given date filter.
 */
export async function getProfitLossDashboard(
  filter?: ProfitLossDateFilter
): Promise<ProfitLossDashboardData> {
  const range = resolveDateRange(filter);

  try {
    // Run all calculations in parallel where possible
    const [
      revenueData,
      cogs,
      expenses,
      customerProfitability,
      fishTypeProfitability,
      trends,
    ] = await Promise.all([
      calculateRevenue(range),
      calculateCOGS(range),
      calculateExpenses(range),
      calculateCustomerProfitability(range),
      calculateFishTypeProfitability(range),
      calculateProfitTrends(range),
    ]);

    const { grossProfit, grossProfitMargin } = calculateGrossProfit(
      revenueData.totalRevenue,
      cogs.totalCOGS
    );

    const { netProfit, netProfitMargin } = calculateNetProfit(
      grossProfit,
      expenses.totalExpenses,
      revenueData.totalRevenue
    );

    const report: ProfitLossReport = {
      periodLabel: range.label,
      startDate: range.start.toISOString(),
      endDate: range.end.toISOString(),
      totalRevenue: revenueData.totalRevenue,
      totalSalesCount: revenueData.salesCount,
      cogs,
      grossProfit,
      grossProfitMargin,
      expenses,
      netProfit,
      netProfitMargin,
    };

    return {
      report,
      customerProfitability,
      fishTypeProfitability,
      trends,
    };
  } catch (error) {
    console.error("Failed to generate P&L dashboard:", error);
    // Return empty/zero state
    return {
      report: {
        periodLabel: range.label,
        startDate: range.start.toISOString(),
        endDate: range.end.toISOString(),
        totalRevenue: 0,
        totalSalesCount: 0,
        cogs: {
          rawMaterialCost: 0,
          transportCharges: 0,
          iceCharges: 0,
          labourCharges: 0,
          packingCost: 0,
          totalCOGS: 0,
        },
        grossProfit: 0,
        grossProfitMargin: 0,
        expenses: { items: [], totalExpenses: 0 },
        netProfit: 0,
        netProfitMargin: 0,
      },
      customerProfitability: [],
      fishTypeProfitability: [],
      trends: [],
    };
  }
}

// Re-export the legacy function for backward compatibility
export { getProfitLossSummary } from "./legacy";
