import { prisma } from "@/lib/prisma";
import { buildDateFilter } from "./filter-utils";
import type {
  ExpenseReportData,
  ExpenseReportRow,
  ExpenseReportSummary,
  ReportFilterOptions,
} from "@/types/financial-reports";
import type { PaymentMethod } from "@prisma/client";

export async function generateExpenseReport(
  filters: ReportFilterOptions = {}
): Promise<ExpenseReportData> {
  const where: Record<string, unknown> = {};

  const dateCond = buildDateFilter(filters);
  if (dateCond) {
    where.expenseDate = dateCond;
  }

  if (filters.paymentStatus && filters.paymentStatus !== "ALL") {
    // Payment method mapping if needed
  }

  if (filters.invoiceNumber && filters.invoiceNumber.trim() !== "") {
    const q = filters.invoiceNumber.trim();
    where.OR = [
      { expenseNumber: { contains: q, mode: "insensitive" } },
      { invoiceFileName: { contains: q, mode: "insensitive" } },
    ];
  }

  if (filters.search && filters.search.trim() !== "") {
    const q = filters.search.trim();
    where.OR = [
      { expenseNumber: { contains: q, mode: "insensitive" } },
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { paidTo: { contains: q, mode: "insensitive" } },
      { category: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  const expenses = await prisma.expense.findMany({
    where,
    include: {
      category: { select: { id: true, name: true, code: true } },
    },
    orderBy: { expenseDate: "desc" },
  });

  let totalExpenses = 0;
  const categoryMap = new Map<string, { name: string; count: number; amount: number }>();

  const rows: ExpenseReportRow[] = expenses.map((e) => {
    totalExpenses += e.amount;

    const cat = categoryMap.get(e.categoryId) || {
      name: e.category.name,
      count: 0,
      amount: 0,
    };
    cat.count += 1;
    cat.amount += e.amount;
    categoryMap.set(e.categoryId, cat);

    return {
      id: e.id,
      expenseDate: e.expenseDate.toISOString(),
      expenseNumber: e.expenseNumber,
      categoryId: e.categoryId,
      categoryName: e.category.name,
      title: e.title,
      description: e.description,
      paidTo: e.paidTo,
      paymentMethod: e.paymentMethod,
      amount: Number(e.amount.toFixed(2)),
    };
  });

  const byCategory = Array.from(categoryMap.entries())
    .map(([id, val]) => ({
      categoryId: id,
      categoryName: val.name,
      count: val.count,
      amount: Number(val.amount.toFixed(2)),
      percentage: totalExpenses > 0 ? Number(((val.amount / totalExpenses) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const summary: ExpenseReportSummary = {
    totalRecords: rows.length,
    totalExpenses: Number(totalExpenses.toFixed(2)),
    byCategory,
  };

  return {
    filters,
    summary,
    rows,
    generatedAt: new Date().toISOString(),
  };
}
