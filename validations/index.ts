export * from "./purchase.schema";
export * from "./sale.schema";
export * from "./expense.schema";
export * from "./packing.schema";
export * from "./report.schema";

import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const fishTypeSchema = z.object({
  code: z.string().min(2, "Code is required"),
  name: z.string().min(2, "Name is required"),
  scientificName: z.string().optional(),
  category: z.string().default("Pelagic"),
  grade: z.string().default("Grade A"),
  description: z.string().optional(),
});

export const inventoryTransactionSchema = z.object({
  fishTypeId: z.string().min(1, "Fish type is required"),
  transactionType: z.enum([
    "PURCHASE_INWARD",
    "SALE_OUTWARD",
    "WASTAGE_OUTWARD",
    "ADJUSTMENT_INWARD",
    "ADJUSTMENT_OUTWARD",
  ]),
  quantityKg: z.number().refine((val) => val !== 0, "Quantity cannot be 0"),
  unitCost: z.number().optional(),
  batchLotNumber: z.string().optional(),
  storageLocation: z.string().optional(),
  notes: z.string().optional(),
});

export const paymentSchema = z.object({
  paymentNumber: z.string().min(3, "Payment voucher number is required"),
  paymentType: z.enum(["CUSTOMER_RECEIPT", "SUPPLIER_PAYMENT", "EXPENSE_PAYMENT"]),
  amount: z.number().positive("Amount must be greater than 0"),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "CHEQUE", "UPI", "CREDIT_CARD"]),
  paymentDate: z.string(),
  referenceNumber: z.string().optional(),
  customerId: z.string().optional(),
  supplierId: z.string().optional(),
  saleId: z.string().optional(),
  purchaseId: z.string().optional(),
  expenseId: z.string().optional(),
  notes: z.string().optional(),
});

export const expenseSchema = z.object({
  expenseNumber: z.string().min(3, "Expense number is required"),
  categoryId: z.string().min(1, "Please select a category"),
  title: z.string().min(2, "Title is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  paidTo: z.string().optional(),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "CHEQUE", "UPI", "CREDIT_CARD"]),
  expenseDate: z.string(),
  notes: z.string().optional(),
});

export const packingCostSchema = z.object({
  saleId: z.string().optional(),
  packingType: z.string().min(2, "Packing type is required"),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  unitCost: z.number().nonnegative("Unit cost cannot be negative"),
  notes: z.string().optional(),
});
