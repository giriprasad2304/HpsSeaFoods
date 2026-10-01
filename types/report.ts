/**
 * Profit & Loss Report Types
 * ---------------------------
 * Server-side calculated financial types.
 * All monetary values are in the base currency (default: INR/USD per config).
 */

// ────────────────────────────────────────
// Date Range Filter
// ────────────────────────────────────────
export type ProfitLossPeriod = "today" | "this_week" | "this_month" | "this_quarter" | "this_year" | "custom";

export interface ProfitLossDateFilter {
  period: ProfitLossPeriod;
  startDate?: string; // ISO string
  endDate?: string;   // ISO string
}

// ────────────────────────────────────────
// Cost of Goods Sold Breakdown
// ────────────────────────────────────────
export interface COGSBreakdown {
  /** Raw fish purchase costs (sum of PurchaseItem.totalCost) */
  rawMaterialCost: number;
  /** Transport charges on purchases */
  transportCharges: number;
  /** Ice charges on purchases */
  iceCharges: number;
  /** Labour charges on purchases */
  labourCharges: number;
  /** Packing costs (thermocol, material, etc.) */
  packingCost: number;
  /** Sum of all COGS components */
  totalCOGS: number;
}

// ────────────────────────────────────────
// Expense Breakdown by Category
// ────────────────────────────────────────
export interface ExpenseBreakdownItem {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number; // % of total expenses
}

export interface ExpenseBreakdown {
  items: ExpenseBreakdownItem[];
  totalExpenses: number;
}

// ────────────────────────────────────────
// Gross & Net Profit Summary
// ────────────────────────────────────────
export interface ProfitLossReport {
  /** Human-readable period label */
  periodLabel: string;
  /** ISO start date */
  startDate: string;
  /** ISO end date */
  endDate: string;

  // Revenue
  totalRevenue: number;
  totalSalesCount: number;

  // COGS
  cogs: COGSBreakdown;

  // Gross Profit
  grossProfit: number;
  grossProfitMargin: number; // percentage

  // Operating Expenses
  expenses: ExpenseBreakdown;

  // Net Profit
  netProfit: number;
  netProfitMargin: number; // percentage
}

// ────────────────────────────────────────
// Customer Profitability
// ────────────────────────────────────────
export interface CustomerProfitItem {
  customerId: string;
  customerName: string;
  companyName?: string | null;
  revenue: number;
  cogs: number;
  grossProfit: number;
  margin: number; // percentage
  salesCount: number;
}

// ────────────────────────────────────────
// Fish Type Profitability
// ────────────────────────────────────────
export interface FishTypeProfitItem {
  fishTypeId: string;
  fishTypeName: string;
  category: string;
  quantitySoldKg: number;
  revenue: number;
  averageSellingPrice: number;
  averagePurchaseCost: number;
  grossProfit: number;
  margin: number; // percentage
}

// ────────────────────────────────────────
// Trend Data Points
// ────────────────────────────────────────
export interface ProfitTrendPoint {
  label: string; // e.g. "Jan 2026", "Week 12", "2026-09-28"
  revenue: number;
  cogs: number;
  expenses: number;
  grossProfit: number;
  netProfit: number;
}

// ────────────────────────────────────────
// Full P&L Dashboard Data
// ────────────────────────────────────────
export interface ProfitLossDashboardData {
  report: ProfitLossReport;
  customerProfitability: CustomerProfitItem[];
  fishTypeProfitability: FishTypeProfitItem[];
  trends: ProfitTrendPoint[];
}
