/**
 * Dashboard Types
 * ----------------
 * Real database aggregate metrics, chart series, and realtime events.
 */

export interface DashboardMetrics {
  // Today's metrics
  todaySalesAmount: number;
  todaySalesCount: number;
  todaySalesWeightKg: number;

  todayPurchasesAmount: number;
  todayPurchasesCount: number;
  todayPurchasesWeightKg: number;

  // Financial overview
  totalRevenue: number;
  totalExpenses: number;
  totalCOGS: number;
  grossProfit: number;
  grossProfitMargin: number;
  netProfit: number;
  netProfitMargin: number;

  // Outstanding balances
  outstandingReceivables: number; // Customer balance owed to us
  outstandingPayables: number;    // Supplier balance owed by us

  // Inventory valuation
  inventoryValue: number;
  totalStockKg: number;

  // Fish Spoilage / Wastage Loss
  totalSpoilageLoss: number;
  totalSpoiledWeightKg: number;
  todaySpoilageLoss: number;
  todaySpoiledWeightKg: number;
  salesSpoilageLoss: number;
  salesSpoiledWeightKg: number;
  inventoryWastageLoss: number;
  inventoryWastageWeightKg: number;
  purchaseSpoilageLoss: number;
  purchaseSpoiledWeightKg: number;
}

export interface MonthlyProfitLossPoint {
  month: string;       // e.g. "Jan 2026"
  revenue: number;
  cogs: number;
  expenses: number;
  grossProfit: number;
  netProfit: number;
}

export interface SalesTrendPoint {
  date: string;        // e.g. "Sep 20"
  salesAmount: number;
  ordersCount: number;
  weightKg: number;
}

export interface PurchaseTrendPoint {
  date: string;        // e.g. "Sep 20"
  purchaseAmount: number;
  batchesCount: number;
  weightKg: number;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  monthlyProfitLoss: MonthlyProfitLossPoint[];
  salesTrend: SalesTrendPoint[];
  purchaseTrend: PurchaseTrendPoint[];
  lastUpdated: string;
}
