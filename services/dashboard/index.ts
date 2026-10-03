import { prisma } from "@/lib/prisma";
import type {
  DashboardData,
  DashboardMetrics,
  MonthlyProfitLossPoint,
  SalesTrendPoint,
  PurchaseTrendPoint,
} from "@/types/dashboard";

/**
 * Fetch all dashboard metrics and chart series directly from PostgreSQL database.
 * No hardcoded dummy numbers.
 */
export async function getDashboardData(): Promise<DashboardData> {
  const now = new Date();

  // Today boundaries
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // 14 days ago for daily trends
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
  fourteenDaysAgo.setHours(0, 0, 0, 0);

  // 6 months ago for monthly P&L
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0, 0);

  try {
    const [
      todaySalesAgg,
      todaySaleItemsWeight,
      todayPurchasesAgg,
      allSalesAgg,
      allPurchasesAgg,
      allExpensesAgg,
      allPackingAgg,
      activeFishStock,
      recentSales,
      recentPurchases,
      monthlySales,
      monthlyPurchases,
      monthlyPacking,
      monthlyExpenses,
      saleSpoilageItems,
      purchaseSpoilageItems,
      wastageTransactions,
    ] = await Promise.all([
      // 1. Today's Sales
      prisma.sale.aggregate({
        where: {
          saleDate: { gte: todayStart, lte: todayEnd },
          status: { notIn: ["CANCELLED"] },
        },
        _sum: { totalAmount: true },
        _count: { id: true },
      }),

      // Today's Sale Items Weight
      prisma.saleItem.aggregate({
        where: {
          sale: {
            saleDate: { gte: todayStart, lte: todayEnd },
            status: { notIn: ["CANCELLED"] },
          },
        },
        _sum: { weightKg: true },
      }),

      // 2. Today's Purchases
      prisma.purchase.aggregate({
        where: {
          purchaseDate: { gte: todayStart, lte: todayEnd },
          status: { notIn: ["CANCELLED"] },
        },
        _sum: { totalAmount: true, totalWeightKg: true },
        _count: { id: true },
      }),

      // 3 & 8. Total Revenue & Outstanding Receivables
      prisma.sale.aggregate({
        where: { status: { notIn: ["CANCELLED"] } },
        _sum: { totalAmount: true, balanceAmount: true },
      }),

      // Total Purchases & Outstanding Payables & Direct Purchase Charges
      prisma.purchase.aggregate({
        where: { status: { notIn: ["CANCELLED"] } },
        _sum: {
          subtotal: true,
          transportCharges: true,
          iceCharges: true,
          labourCharges: true,
          totalAmount: true,
          balanceAmount: true,
        },
      }),

      // 4. Total Expenses
      prisma.expense.aggregate({
        _sum: { amount: true },
      }),

      // Total Packing Costs
      prisma.packingCost.aggregate({
        _sum: { totalCost: true },
      }),

      // 9. Inventory Valuation via FishTypes & Transactions
      prisma.fishType.findMany({
        where: { isActive: true },
        include: {
          inventoryTransactions: {
            select: { quantityKg: true, transactionType: true, unitCost: true },
          },
        },
      }),

      // Trend: Sales in last 14 days
      prisma.sale.findMany({
        where: {
          saleDate: { gte: fourteenDaysAgo, lte: todayEnd },
          status: { notIn: ["CANCELLED"] },
        },
        include: {
          items: { select: { weightKg: true } },
        },
        orderBy: { saleDate: "asc" },
      }),

      // Trend: Purchases in last 14 days
      prisma.purchase.findMany({
        where: {
          purchaseDate: { gte: fourteenDaysAgo, lte: todayEnd },
          status: { notIn: ["CANCELLED"] },
        },
        select: {
          purchaseDate: true,
          totalAmount: true,
          totalWeightKg: true,
        },
        orderBy: { purchaseDate: "asc" },
      }),

      // Trend: 6-month sales
      prisma.sale.findMany({
        where: {
          saleDate: { gte: sixMonthsAgo, lte: todayEnd },
          status: { notIn: ["CANCELLED"] },
        },
        select: { saleDate: true, totalAmount: true },
      }),

      // Trend: 6-month purchases
      prisma.purchase.findMany({
        where: {
          purchaseDate: { gte: sixMonthsAgo, lte: todayEnd },
          status: { notIn: ["CANCELLED"] },
        },
        select: {
          purchaseDate: true,
          subtotal: true,
          transportCharges: true,
          iceCharges: true,
          labourCharges: true,
        },
      }),

      // Trend: 6-month packing
      prisma.packingCost.findMany({
        where: {
          createdAt: { gte: sixMonthsAgo, lte: todayEnd },
        },
        select: { createdAt: true, totalCost: true },
      }),

      // Trend: 6-month expenses
      prisma.expense.findMany({
        where: {
          expenseDate: { gte: sixMonthsAgo, lte: todayEnd },
        },
        select: { expenseDate: true, amount: true },
      }),

      // Spoilage: Sale items with spoiled/rejected weight
      prisma.saleItem.findMany({
        where: {
          spoiledWeightKg: { gt: 0 },
          sale: { status: { notIn: ["CANCELLED"] } },
        },
        select: {
          spoiledWeightKg: true,
          unitPricePerKg: true,
          sale: { select: { saleDate: true } },
        },
      }),

      // Spoilage: Purchase items with rejected/spoiled weight
      prisma.purchaseItem.findMany({
        where: {
          spoiledWeightKg: { gt: 0 },
          purchase: { status: { notIn: ["CANCELLED"] } },
        },
        select: {
          spoiledWeightKg: true,
          unitPricePerKg: true,
          purchase: { select: { purchaseDate: true } },
        },
      }),

      // Spoilage / Wastage: Cold storage & inventory wastage transactions
      prisma.inventoryTransaction.findMany({
        where: {
          transactionType: "WASTAGE_OUTWARD",
        },
        select: {
          quantityKg: true,
          unitCost: true,
          fishTypeId: true,
          createdAt: true,
        },
      }),
    ]);

    // Calculate Inventory Value & Total Stock Kg
    let totalStockKg = 0;
    let inventoryValue = 0;
    const fishAvgCostMap = new Map<string, number>();

    for (const fish of activeFishStock) {
      let currentStock = 0;
      let totalPurchasedKg = 0;
      let totalPurchasedCost = 0;

      for (const tx of fish.inventoryTransactions) {
        currentStock += tx.quantityKg;
        if (tx.transactionType === "PURCHASE_INWARD" || tx.quantityKg > 0) {
          totalPurchasedKg += tx.quantityKg;
          if (tx.unitCost) {
            totalPurchasedCost += tx.quantityKg * tx.unitCost;
          }
        }
      }

      const safeStock = Math.max(0, currentStock);
      const avgCost = totalPurchasedKg > 0 ? totalPurchasedCost / totalPurchasedKg : 0;
      fishAvgCostMap.set(fish.id, avgCost);
      totalStockKg += safeStock;
      inventoryValue += safeStock * avgCost;
    }

    // ────────────────────────────────────────
    // Calculate Fish Spoilage & Wastage Losses
    // ────────────────────────────────────────
    let salesSpoiledWeightKg = 0;
    let salesSpoilageLoss = 0;
    let todaySalesSpoiledWeightKg = 0;
    let todaySalesSpoilageLoss = 0;

    for (const item of saleSpoilageItems) {
      const spoiledKg = item.spoiledWeightKg || 0;
      const loss = spoiledKg * (item.unitPricePerKg || 0);
      salesSpoiledWeightKg += spoiledKg;
      salesSpoilageLoss += loss;

      const saleDate = new Date(item.sale.saleDate);
      if (saleDate >= todayStart && saleDate <= todayEnd) {
        todaySalesSpoiledWeightKg += spoiledKg;
        todaySalesSpoilageLoss += loss;
      }
    }

    let purchaseSpoiledWeightKg = 0;
    let purchaseSpoilageLoss = 0;
    let todayPurchaseSpoiledWeightKg = 0;
    let todayPurchaseSpoilageLoss = 0;

    for (const item of purchaseSpoilageItems) {
      const spoiledKg = item.spoiledWeightKg || 0;
      const loss = spoiledKg * (item.unitPricePerKg || 0);
      purchaseSpoiledWeightKg += spoiledKg;
      purchaseSpoilageLoss += loss;

      const purchaseDate = new Date(item.purchase.purchaseDate);
      if (purchaseDate >= todayStart && purchaseDate <= todayEnd) {
        todayPurchaseSpoiledWeightKg += spoiledKg;
        todayPurchaseSpoilageLoss += loss;
      }
    }

    let inventoryWastageWeightKg = 0;
    let inventoryWastageLoss = 0;
    let todayInventoryWastageWeightKg = 0;
    let todayInventoryWastageLoss = 0;

    for (const tx of wastageTransactions) {
      const wKg = Math.abs(tx.quantityKg || 0);
      const unitCost = tx.unitCost ?? fishAvgCostMap.get(tx.fishTypeId) ?? 0;
      const loss = wKg * unitCost;

      inventoryWastageWeightKg += wKg;
      inventoryWastageLoss += loss;

      const txDate = new Date(tx.createdAt);
      if (txDate >= todayStart && txDate <= todayEnd) {
        todayInventoryWastageWeightKg += wKg;
        todayInventoryWastageLoss += loss;
      }
    }

    const totalSpoilageLoss = Number(
      (salesSpoilageLoss + inventoryWastageLoss + purchaseSpoilageLoss).toFixed(2)
    );
    const totalSpoiledWeightKg = Number(
      (salesSpoiledWeightKg + inventoryWastageWeightKg + purchaseSpoiledWeightKg).toFixed(2)
    );
    const todaySpoilageLoss = Number(
      (todaySalesSpoilageLoss + todayInventoryWastageLoss + todayPurchaseSpoilageLoss).toFixed(2)
    );
    const todaySpoiledWeightKg = Number(
      (todaySalesSpoiledWeightKg + todayInventoryWastageWeightKg + todayPurchaseSpoiledWeightKg).toFixed(2)
    );

    // Financial Metrics
    const totalRevenue = allSalesAgg._sum.totalAmount ?? 0;
    const purchaseSubtotal = allPurchasesAgg._sum.subtotal ?? 0;
    const purchaseCharges =
      (allPurchasesAgg._sum.transportCharges ?? 0) +
      (allPurchasesAgg._sum.iceCharges ?? 0) +
      (allPurchasesAgg._sum.labourCharges ?? 0);
    const packingTotal = allPackingAgg._sum.totalCost ?? 0;
    const totalCOGS = purchaseSubtotal + purchaseCharges + packingTotal;

    const totalExpenses = allExpensesAgg._sum.amount ?? 0;
    const grossProfit = totalRevenue - totalCOGS;
    const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const netProfit = grossProfit - totalExpenses;
    const netProfitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    const outstandingReceivables = allSalesAgg._sum.balanceAmount ?? 0;
    const outstandingPayables = allPurchasesAgg._sum.balanceAmount ?? 0;

    const metrics: DashboardMetrics = {
      todaySalesAmount: Number((todaySalesAgg._sum.totalAmount ?? 0).toFixed(2)),
      todaySalesCount: todaySalesAgg._count.id,
      todaySalesWeightKg: Number((todaySaleItemsWeight._sum.weightKg ?? 0).toFixed(2)),

      todayPurchasesAmount: Number((todayPurchasesAgg._sum.totalAmount ?? 0).toFixed(2)),
      todayPurchasesCount: todayPurchasesAgg._count.id,
      todayPurchasesWeightKg: Number((todayPurchasesAgg._sum.totalWeightKg ?? 0).toFixed(2)),

      todaySpoilageLoss,
      todaySpoiledWeightKg: Number(todaySpoiledWeightKg.toFixed(2)),

      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalExpenses: Number(totalExpenses.toFixed(2)),
      totalCOGS: Number(totalCOGS.toFixed(2)),
      grossProfit: Number(grossProfit.toFixed(2)),
      grossProfitMargin: Number(grossProfitMargin.toFixed(1)),
      netProfit: Number(netProfit.toFixed(2)),
      netProfitMargin: Number(netProfitMargin.toFixed(1)),

      outstandingReceivables: Number(outstandingReceivables.toFixed(2)),
      outstandingPayables: Number(outstandingPayables.toFixed(2)),

      inventoryValue: Number(inventoryValue.toFixed(2)),
      totalStockKg: Number(totalStockKg.toFixed(2)),

      totalSpoilageLoss,
      totalSpoiledWeightKg,
      salesSpoilageLoss: Number(salesSpoilageLoss.toFixed(2)),
      salesSpoiledWeightKg: Number(salesSpoiledWeightKg.toFixed(2)),
      inventoryWastageLoss: Number(inventoryWastageLoss.toFixed(2)),
      inventoryWastageWeightKg: Number(inventoryWastageWeightKg.toFixed(2)),
      purchaseSpoilageLoss: Number(purchaseSpoilageLoss.toFixed(2)),
      purchaseSpoiledWeightKg: Number(purchaseSpoiledWeightKg.toFixed(2)),
    };

    // ────────────────────────────────────────
    // Build 14-day Sales Trend Series
    // ────────────────────────────────────────
    const salesTrendMap = new Map<string, { amount: number; count: number; weight: number }>();
    for (let i = 0; i < 14; i++) {
      const d = new Date(fourteenDaysAgo);
      d.setDate(d.getDate() + i);
      const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      salesTrendMap.set(key, { amount: 0, count: 0, weight: 0 });
    }

    for (const sale of recentSales) {
      const key = new Date(sale.saleDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const current = salesTrendMap.get(key);
      if (current) {
        current.amount += sale.totalAmount;
        current.count += 1;
        const saleWeight = sale.items.reduce((sum, it) => sum + it.weightKg, 0);
        current.weight += saleWeight;
      }
    }

    const salesTrend: SalesTrendPoint[] = Array.from(salesTrendMap.entries()).map(([date, val]) => ({
      date,
      salesAmount: Number(val.amount.toFixed(2)),
      ordersCount: val.count,
      weightKg: Number(val.weight.toFixed(2)),
    }));

    // ────────────────────────────────────────
    // Build 14-day Purchase Trend Series
    // ────────────────────────────────────────
    const purchaseTrendMap = new Map<string, { amount: number; count: number; weight: number }>();
    for (let i = 0; i < 14; i++) {
      const d = new Date(fourteenDaysAgo);
      d.setDate(d.getDate() + i);
      const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      purchaseTrendMap.set(key, { amount: 0, count: 0, weight: 0 });
    }

    for (const p of recentPurchases) {
      const key = new Date(p.purchaseDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const current = purchaseTrendMap.get(key);
      if (current) {
        current.amount += p.totalAmount;
        current.count += 1;
        current.weight += p.totalWeightKg;
      }
    }

    const purchaseTrend: PurchaseTrendPoint[] = Array.from(purchaseTrendMap.entries()).map(([date, val]) => ({
      date,
      purchaseAmount: Number(val.amount.toFixed(2)),
      batchesCount: val.count,
      weightKg: Number(val.weight.toFixed(2)),
    }));

    // ────────────────────────────────────────
    // Build 6-Month Profit & Loss Trend Series
    // ────────────────────────────────────────
    const monthlyMap = new Map<string, { revenue: number; cogs: number; expenses: number }>();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      monthlyMap.set(key, { revenue: 0, cogs: 0, expenses: 0 });
    }

    for (const s of monthlySales) {
      const key = new Date(s.saleDate).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      const current = monthlyMap.get(key);
      if (current) current.revenue += s.totalAmount;
    }

    for (const p of monthlyPurchases) {
      const key = new Date(p.purchaseDate).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      const current = monthlyMap.get(key);
      if (current) {
        current.cogs += p.subtotal + p.transportCharges + p.iceCharges + p.labourCharges;
      }
    }

    for (const pk of monthlyPacking) {
      const key = new Date(pk.createdAt).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      const current = monthlyMap.get(key);
      if (current) current.cogs += pk.totalCost;
    }

    for (const e of monthlyExpenses) {
      const key = new Date(e.expenseDate).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      const current = monthlyMap.get(key);
      if (current) current.expenses += e.amount;
    }

    const monthlyProfitLoss: MonthlyProfitLossPoint[] = Array.from(monthlyMap.entries()).map(([month, val]) => {
      const gross = val.revenue - val.cogs;
      const net = gross - val.expenses;
      return {
        month,
        revenue: Number(val.revenue.toFixed(2)),
        cogs: Number(val.cogs.toFixed(2)),
        expenses: Number(val.expenses.toFixed(2)),
        grossProfit: Number(gross.toFixed(2)),
        netProfit: Number(net.toFixed(2)),
      };
    });

    return {
      metrics,
      monthlyProfitLoss,
      salesTrend,
      purchaseTrend,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error generating dashboard metrics from database:", error);
    return {
      metrics: {
        todaySalesAmount: 0,
        todaySalesCount: 0,
        todaySalesWeightKg: 0,
        todayPurchasesAmount: 0,
        todayPurchasesCount: 0,
        todayPurchasesWeightKg: 0,
        todaySpoilageLoss: 0,
        todaySpoiledWeightKg: 0,
        totalRevenue: 0,
        totalExpenses: 0,
        totalCOGS: 0,
        grossProfit: 0,
        grossProfitMargin: 0,
        netProfit: 0,
        netProfitMargin: 0,
        outstandingReceivables: 0,
        outstandingPayables: 0,
        inventoryValue: 0,
        totalStockKg: 0,
        totalSpoilageLoss: 0,
        totalSpoiledWeightKg: 0,
        salesSpoilageLoss: 0,
        salesSpoiledWeightKg: 0,
        inventoryWastageLoss: 0,
        inventoryWastageWeightKg: 0,
        purchaseSpoilageLoss: 0,
        purchaseSpoiledWeightKg: 0,
      },
      monthlyProfitLoss: [],
      salesTrend: [],
      purchaseTrend: [],
      lastUpdated: new Date().toISOString(),
    };
  }
}
