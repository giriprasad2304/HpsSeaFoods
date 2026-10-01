import type { PaymentStatus } from "@/types";

export interface ReportFilterOptions {
  startDate?: string;
  endDate?: string;
  month?: number;        // 1-12
  year?: number;         // e.g. 2026
  fishTypeId?: string;
  supplierId?: string;
  customerId?: string;
  paymentStatus?: PaymentStatus | "ALL";
  invoiceNumber?: string;
  search?: string;
}

export interface ReportLookupData {
  fishTypes: Array<{ id: string; name: string; code: string }>;
  suppliers: Array<{ id: string; name: string; code: string }>;
  customers: Array<{ id: string; name: string; code: string }>;
  categories: Array<{ id: string; name: string; code: string }>;
}

// ─────────────────────────────────────────────
// 1. Sales Report
// ─────────────────────────────────────────────
export interface SalesReportRow {
  id: string;
  saleDate: string;
  saleNumber: string;
  invoiceNumber?: string | null;
  customerId: string;
  customerName: string;
  fishSummary: string;
  totalWeightKg: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: PaymentStatus;
}

export interface SalesReportSummary {
  totalRecords: number;
  totalWeightKg: number;
  totalSubtotal: number;
  totalTax: number;
  totalDiscount: number;
  totalRevenue: number;
  totalPaid: number;
  totalOutstanding: number;
}

export interface SalesReportData {
  filters: ReportFilterOptions;
  summary: SalesReportSummary;
  rows: SalesReportRow[];
  generatedAt: string;
}

// ─────────────────────────────────────────────
// 2. Purchase Report
// ─────────────────────────────────────────────
export interface PurchaseReportRow {
  id: string;
  purchaseDate: string;
  purchaseNumber: string;
  supplierId: string;
  supplierName: string;
  boatOrHarbor?: string | null;
  fishSummary: string;
  totalWeightKg: number;
  subtotal: number;
  transportCharges: number;
  iceCharges: number;
  labourCharges: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: PaymentStatus;
}

export interface PurchaseReportSummary {
  totalRecords: number;
  totalWeightKg: number;
  totalSubtotal: number;
  totalTransportCharges: number;
  totalIceCharges: number;
  totalLabourCharges: number;
  totalPurchaseSpend: number;
  totalPaid: number;
  totalOutstandingPayable: number;
}

export interface PurchaseReportData {
  filters: ReportFilterOptions;
  summary: PurchaseReportSummary;
  rows: PurchaseReportRow[];
  generatedAt: string;
}

// ─────────────────────────────────────────────
// 3. Expense Report
// ─────────────────────────────────────────────
export interface ExpenseReportRow {
  id: string;
  expenseDate: string;
  expenseNumber: string;
  categoryId: string;
  categoryName: string;
  title: string;
  description?: string | null;
  paidTo?: string | null;
  paymentMethod: string;
  amount: number;
}

export interface ExpenseReportSummary {
  totalRecords: number;
  totalExpenses: number;
  byCategory: Array<{
    categoryId: string;
    categoryName: string;
    count: number;
    amount: number;
    percentage: number;
  }>;
}

export interface ExpenseReportData {
  filters: ReportFilterOptions;
  summary: ExpenseReportSummary;
  rows: ExpenseReportRow[];
  generatedAt: string;
}

// ─────────────────────────────────────────────
// 4. Outstanding Report
// ─────────────────────────────────────────────
export interface CustomerReceivableRow {
  customerId: string;
  customerCode: string;
  customerName: string;
  companyName?: string | null;
  phone: string;
  totalSalesCount: number;
  totalBilled: number;
  totalPaid: number;
  outstandingBalance: number;
  creditLimit: number;
}

export interface SupplierPayableRow {
  supplierId: string;
  supplierCode: string;
  supplierName: string;
  boatName?: string | null;
  harborLocation?: string | null;
  phone: string;
  totalPurchasesCount: number;
  totalProcured: number;
  totalPaid: number;
  outstandingPayable: number;
}

export interface OutstandingReportSummary {
  totalReceivables: number;
  totalPayables: number;
  netWorkingCapital: number;
  activeDebtorCount: number;
  activeCreditorCount: number;
}

export interface OutstandingReportData {
  filters: ReportFilterOptions;
  summary: OutstandingReportSummary;
  receivables: CustomerReceivableRow[];
  payables: SupplierPayableRow[];
  generatedAt: string;
}

// ─────────────────────────────────────────────
// 5. Profit & Loss Statement Report
// ─────────────────────────────────────────────
export interface ProfitLossStatementData {
  periodLabel: string;
  filters: ReportFilterOptions;

  // Operating Revenue
  grossSales: number;
  discounts: number;
  netRevenue: number;

  // Cost of Goods Sold
  rawFishProcurementCost: number;
  transportCharges: number;
  iceCharges: number;
  labourCharges: number;
  packingAndThermocolCosts: number;
  totalCOGS: number;

  // Gross Profit
  grossProfit: number;
  grossProfitMargin: number;

  // Operating Expenses
  operatingExpenses: Array<{
    categoryName: string;
    amount: number;
    percentage: number;
  }>;
  totalOperatingExpenses: number;

  // Net Profit
  netProfit: number;
  netProfitMargin: number;

  generatedAt: string;
}

// ─────────────────────────────────────────────
// 6. Balance Sheet Report (Managerial Financial Position)
// ─────────────────────────────────────────────
export interface BalanceSheetData {
  asOfDate: string;
  filters: ReportFilterOptions;

  assets: {
    cashAndBankEstimated: number; // Derived from total customer receipts minus supplier payments & direct expenses
    accountsReceivable: number;   // Customer outstanding balance
    inventoryValuation: number;   // In-stock fish kg * weighted avg procurement cost
    totalCurrentAssets: number;
    totalAssets: number;
  };

  liabilities: {
    accountsPayable: number;      // Supplier outstanding balance
    totalCurrentLiabilities: number;
    totalLiabilities: number;
  };

  equity: {
    retainedEarnings: number;     // Cumulative Net Profit
    totalEquity: number;
    totalLiabilitiesAndEquity: number;
  };

  isBalanced: boolean;
  disclaimer: string;
  generatedAt: string;
}
