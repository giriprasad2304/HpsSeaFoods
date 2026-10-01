import { z } from "zod";

export const reportFilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  month: z.coerce.number().min(1).max(12).optional(),
  year: z.coerce.number().min(2000).max(2100).optional(),
  fishTypeId: z.string().optional(),
  supplierId: z.string().optional(),
  customerId: z.string().optional(),
  paymentStatus: z.enum(["ALL", "UNPAID", "PARTIAL", "PAID", "REFUNDED"]).optional(),
  invoiceNumber: z.string().optional(),
  search: z.string().optional(),
});

export type ReportFilterSchemaValues = z.infer<typeof reportFilterSchema>;
