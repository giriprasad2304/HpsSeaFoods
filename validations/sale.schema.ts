import { z } from "zod";

export const saleItemSchema = z.object({
  fishTypeId: z.string().min(1, "Please select a fish variety"),
  grade: z.string().default("Grade A"),
  weightKg: z
    .number({ invalid_type_error: "Quantity must be a valid number" })
    .positive("Quantity sold in kg must be greater than 0"),
  unitPricePerKg: z
    .number({ invalid_type_error: "Selling price must be a valid number" })
    .positive("Selling price per kg must be greater than 0"),
  notes: z.string().optional().nullable(),
});

export const createSaleSchema = z.object({
  saleNumber: z.string().optional(),
  customerId: z.string().min(1, "Please select a customer / company"),
  saleDate: z.string().min(1, "Sale date & time is required"),
  deliveryDate: z.string().optional().nullable(),
  status: z
    .enum(["DRAFT", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"])
    .default("CONFIRMED"),
  paymentStatus: z.enum(["UNPAID", "PARTIAL", "PAID"]).default("UNPAID"),
  paymentMethod: z
    .enum(["CASH", "BANK_TRANSFER", "CHEQUE", "UPI", "CREDIT_CARD"])
    .default("BANK_TRANSFER"),
  initialPaidAmount: z
    .number()
    .nonnegative("Paid amount cannot be negative")
    .default(0),
  taxAmount: z.number().nonnegative("Tax cannot be negative").default(0),
  discountAmount: z
    .number()
    .nonnegative("Discount cannot be negative")
    .default(0),
  invoiceUrl: z.string().optional().nullable(),
  invoiceFileName: z.string().optional().nullable(),
  invoiceFileType: z.string().optional().nullable(),
  invoiceFileSize: z.number().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z
    .array(saleItemSchema)
    .min(1, "At least one fish item is required in a sale order"),
});

export const updateSaleSchema = createSaleSchema.partial().extend({
  status: z
    .enum(["DRAFT", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"])
    .optional(),
});

export const saleFilterSchema = z.object({
  date: z.string().optional(),
  month: z.string().optional(),
  year: z.string().optional(),
  customerId: z.string().optional(),
  fishTypeId: z.string().optional(),
  paymentStatus: z.enum(["ALL", "UNPAID", "PARTIAL", "PAID", "REFUNDED"]).optional(),
  deliveryStatus: z
    .enum(["ALL", "DRAFT", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"])
    .optional(),
  invoiceNumber: z.string().optional(),
  search: z.string().optional(),
});

export const recordSalePaymentSchema = z.object({
  amount: z.number().positive("Payment amount must be greater than 0"),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "CHEQUE", "UPI", "CREDIT_CARD"]),
  paymentDate: z.string().min(1, "Payment date is required"),
  referenceNumber: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const saleSchema = createSaleSchema;

export type CreateSaleInputValidated = z.infer<typeof createSaleSchema>;
export type UpdateSaleInputValidated = z.infer<typeof updateSaleSchema>;
export type SaleFilterValues = z.infer<typeof saleFilterSchema>;
export type RecordSalePaymentInputValidated = z.infer<typeof recordSalePaymentSchema>;
