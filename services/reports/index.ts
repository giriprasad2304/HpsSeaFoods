export * from "./sales-report";
export * from "./purchase-report";
export * from "./expense-report";
export * from "./outstanding-report";
export * from "./profit-loss-report";
export * from "./balance-sheet-report";
export * from "./export-excel";
export * from "./lookups";
export * from "./filter-utils";
export * from "./party-ledger";

export interface ReportTemplateDTO {
  id: string;
  title: string;
  category: "FINANCIAL" | "INVENTORY" | "PURCHASES" | "EXPORT_SALES" | "AUDIT";
  description: string;
  format: "EXCEL" | "PDF" | "CSV";
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "ON_DEMAND";
  href: string;
}

export const FINANCIAL_REPORTS_LIST: ReportTemplateDTO[] = [
  {
    id: "rep-profit-loss",
    title: "Profit & Loss Statement",
    category: "FINANCIAL",
    description: "Detailed breakdown of sales, fish purchase costs, packing, expenses, and net profit.",
    format: "PDF",
    frequency: "MONTHLY",
    href: "/reports/profit-loss",
  },
  {
    id: "rep-balance-sheet",
    title: "Balance Sheet",
    category: "FINANCIAL",
    description: "Summary of business assets (cash, stock, unpaid customer bills) and supplier liabilities.",
    format: "PDF",
    frequency: "MONTHLY",
    href: "/reports/balance-sheet",
  },
  {
    id: "rep-sales-ledger",
    title: "Sales Report",
    category: "EXPORT_SALES",
    description: "All customer sales, weights, invoices, delivery status, and payments received.",
    format: "EXCEL",
    frequency: "DAILY",
    href: "/reports/sales",
  },
  {
    id: "rep-purchase-inward",
    title: "Purchases Report",
    category: "PURCHASES",
    description: "All fish bought from boats, quantities, ice/transport charges, and payment status.",
    format: "EXCEL",
    frequency: "DAILY",
    href: "/reports/purchases",
  },
  {
    id: "rep-expenses-register",
    title: "Expenses Report",
    category: "FINANCIAL",
    description: "All spending on thermocol boxes, ice, transport, labour, and daily costs.",
    format: "EXCEL",
    frequency: "MONTHLY",
    href: "/reports/expenses",
  },
  {
    id: "rep-outstanding-aging",
    title: "Pending Dues & Balances",
    category: "FINANCIAL",
    description: "Money you need to collect from customers and money you owe to suppliers.",
    format: "EXCEL",
    frequency: "WEEKLY",
    href: "/reports/outstanding",
  },
];
