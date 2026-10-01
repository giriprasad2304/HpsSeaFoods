import { z } from "zod";

export const purchaseItemSchema = z.object({
  fishTypeId: z.string().min(1, "Please select a fish variety"),
  grade: z.string().default("Grade A"),
  weightKg: z
    .number({ invalid_type_error: "Quantity must be a valid number" })
    .positive("Quantity in kg must be greater than 0"),
  unitPricePerKg: z
    .number({ invalid_type_error: "Rate must be a valid number" })
    .positive("Rate per kg must be greater than 0"),
  temperatureC: z.number().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const createPurchaseSchema = z.object({
  purchaseNumber: z.string().optional(),
  supplierId: z.string().min(1, "Please select a supplier"),
  purchaseDate: z.string().min(1, "Purchase date & time is required"),
  landingHarbor: z.string().optional().nullable(),
  truckNumber: z.string().optional().nullable(),
  transportCharges: z.number().nonnegative("Transport charges cannot be negative").default(0),
  iceCharges: z.number().nonnegative("Ice charges cannot be negative").default(0),
  labourCharges: z.number().nonnegative("Labour charges cannot be negative").default(0),
  paymentStatus: z.enum(["UNPAID", "PARTIAL", "PAID"]).default("UNPAID"),
  paymentMethod: z
    .enum(["CASH", "BANK_TRANSFER", "CHEQUE", "UPI", "CREDIT_CARD"])
    .default("BANK_TRANSFER"),
  initialPaidAmount: z.number().nonnegative("Initial paid amount cannot be negative").default(0),
  invoiceUrl: z.string().optional().nullable(),
  invoiceFileName: z.string().optional().nullable(),
  invoiceFileType: z.string().optional().nullable(),
  invoiceFileSize: z.number().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(purchaseItemSchema).min(1, "At least one fish item is required in a purchase"),
});

export const updatePurchaseSchema = createPurchaseSchema.partial().extend({
  status: z.enum(["DRAFT", "RECEIVED", "INSPECTED", "COMPLETED", "CANCELLED"]).optional(),
});

export const purchaseFilterSchema = z.object({
  date: z.string().optional(),
  month: z.string().optional(),
  year: z.string().optional(),
  supplierId: z.string().optional(),
  fishTypeId: z.string().optional(),
  paymentStatus: z.enum(["ALL", "UNPAID", "PARTIAL", "PAID", "REFUNDED"]).optional(),
  invoiceNumber: z.string().optional(),
  search: z.string().optional(),
});

export const recordPurchasePaymentSchema = z.object({
  amount: z.number().positive("Payment amount must be greater than 0"),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "CHEQUE", "UPI", "CREDIT_CARD"]),
  paymentDate: z.string().min(1, "Payment date is required"),
  referenceNumber: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const purchaseSchema = createPurchaseSchema;

export type CreatePurchaseInputValidated = z.infer<typeof createPurchaseSchema>;
export type UpdatePurchaseInputValidated = z.infer<typeof updatePurchaseSchema>;
export type PurchaseFilterValues = z.infer<typeof purchaseFilterSchema>;
export type RecordPurchasePaymentInputValidated = z.infer<typeof recordPurchasePaymentSchema>;
