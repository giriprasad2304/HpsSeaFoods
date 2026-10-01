/**
 * Centralized filter constants for AquaFlow ERP.
 * Standardized options across Sales, Purchases, Expenses, Inventory, and Reports.
 */

export interface FilterOption {
  label: string;
  value: string;
}

export const MONTH_OPTIONS: FilterOption[] = [
  { label: "All Months", value: "ALL" },
  { label: "01 - January", value: "01" },
  { label: "02 - February", value: "02" },
  { label: "03 - March", value: "03" },
  { label: "04 - April", value: "04" },
  { label: "05 - May", value: "05" },
  { label: "06 - June", value: "06" },
  { label: "07 - July", value: "07" },
  { label: "08 - August", value: "08" },
  { label: "09 - September", value: "09" },
  { label: "10 - October", value: "10" },
  { label: "11 - November", value: "11" },
  { label: "12 - December", value: "12" },
];

const currentYear = new Date().getFullYear();
export const YEAR_OPTIONS: FilterOption[] = [
  { label: "All Years", value: "ALL" },
  { label: String(currentYear + 1), value: String(currentYear + 1) },
  { label: String(currentYear), value: String(currentYear) },
  { label: String(currentYear - 1), value: String(currentYear - 1) },
  { label: String(currentYear - 2), value: String(currentYear - 2) },
  { label: String(currentYear - 3), value: String(currentYear - 3) },
];

export const PAYMENT_STATUS_OPTIONS: FilterOption[] = [
  { label: "All Payment Statuses", value: "ALL" },
  { label: "Paid", value: "PAID" },
  { label: "Partially Paid", value: "PARTIAL" },
  { label: "Unpaid / Due", value: "UNPAID" },
];

export const DELIVERY_STATUS_OPTIONS: FilterOption[] = [
  { label: "All Deliveries", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Dispatched", value: "DISPATCHED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export const STOCK_STATUS_OPTIONS: FilterOption[] = [
  { label: "All Stock Levels", value: "ALL" },
  { label: "In Stock (>500kg)", value: "IN_STOCK" },
  { label: "Low Stock (<500kg)", value: "LOW_STOCK" },
  { label: "Depleted (0kg)", value: "DEPLETED" },
];

export const EXPENSE_PAYMENT_METHOD_OPTIONS: FilterOption[] = [
  { label: "All Methods", value: "ALL" },
  { label: "Cash", value: "CASH" },
  { label: "Bank Transfer", value: "BANK_TRANSFER" },
  { label: "Cheque", value: "CHEQUE" },
  { label: "Online", value: "ONLINE" },
];

export const PAGE_SIZE_OPTIONS: FilterOption[] = [
  { label: "10 per page", value: "10" },
  { label: "25 per page", value: "25" },
  { label: "50 per page", value: "50" },
  { label: "100 per page", value: "100" },
];
