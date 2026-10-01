import { z } from "zod";

export const ExpenseCategoryEnum = z.enum([
  "EXP-CAT-BOX",
  "EXP-CAT-ICE",
  "EXP-CAT-PKG",
  "EXP-CAT-LAB",
  "EXP-CAT-TRN",
  "EXP-CAT-OXY",
  "EXP-CAT-OTH",
]);

export const PaymentMethodEnum = z.enum([
  "CASH",
  "BANK_TRANSFER",
  "CHEQUE",
  "UPI",
  "CREDIT_CARD",
]);

export const expenseFormSchema = z.object({
  expenseDate: z.string().min(1, "Expense date is required"),
  categoryId: z.string().min(1, "Please select an expense category"),
  title: z.string().min(2, "Title is required").max(120, "Title is too long"),
  description: z.string().optional(),
  amount: z
    .number({ invalid_type_error: "Amount must be a valid number" })
    .positive("Amount must be greater than 0"),
  paidTo: z.string().optional(),
  paymentMethod: PaymentMethodEnum.default("CASH"),
  invoiceUrl: z.string().url("Invalid invoice URL").optional().nullable().or(z.literal("")),
  invoiceFileName: z.string().optional().nullable().or(z.literal("")),
  notes: z.string().optional(),
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

export const expenseFilterSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  paymentMethod: z.string().optional(),
  date: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  month: z.string().optional(),
  year: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
});

export type ExpenseFilterValues = {
  search?: string;
  categoryId?: string;
  paymentMethod?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  month?: string;
  year?: string;
  page?: number;
  limit?: number;
};

