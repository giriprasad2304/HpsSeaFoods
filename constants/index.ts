export * from "./navigation";

export const APP_NAME = "HPS SEA FOODS";
export const APP_DESCRIPTION = "HPS SEA FOODS - Commercial Fish Business & Operations Management System";

export const DELIVERY_STATUSES = [
  { label: "Draft / Pending", value: "DRAFT" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Processing / Packed", value: "PACKED" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
] as const;

export const STATUS_BADGE_VARIANTS: Record<
  string,
  "default" | "secondary" | "outline" | "destructive" | "success" | "warning" | "info"
> = {
  // Purchase Statuses
  DRAFT: "secondary",
  RECEIVED: "info",
  INSPECTED: "warning",
  STORED: "success",
  CANCELLED: "destructive",

  // Sale / Delivery Statuses
  PENDING: "secondary",
  CONFIRMED: "info",
  PROCESSING: "warning",
  PACKED: "warning",
  SHIPPED: "info",
  DELIVERED: "success",

  // Payment Statuses
  UNPAID: "destructive",
  PARTIAL: "warning",
  PAID: "success",
  REFUNDED: "secondary",

  // Stock Statuses
  IN_STOCK: "success",
  LOW_STOCK: "warning",
  DEPLETED: "secondary",
  SPOILED: "destructive",

  // Packing Statuses
  PLANNED: "secondary",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
};
