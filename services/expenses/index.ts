import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";
import { expenseFormSchema, type ExpenseFormValues, type ExpenseFilterValues } from "@/validations/expense.schema";
import type { ExpenseDTO, ExpenseCategoryDTO } from "@/types";
import type { PaymentMethod } from "@prisma/client";

/**
 * Generate sequential unique expense number, e.g. EXP-2026-0001
 */
export async function generateExpenseNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `EXP-${currentYear}-`;

  const latest = await prisma.expense.findFirst({
    where: {
      expenseNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      expenseNumber: "desc",
    },
    select: {
      expenseNumber: true,
    },
  });

  if (!latest) {
    return `${prefix}0001`;
  }

  const parts = latest.expenseNumber.split("-");
  const lastSeq = parseInt(parts[2], 10);
  const nextSeq = isNaN(lastSeq) ? 1 : lastSeq + 1;
  return `${prefix}${nextSeq.toString().padStart(4, "0")}`;
}

/**
 * Fetch list of active expense categories
 */
export async function getExpenseCategories(): Promise<ExpenseCategoryDTO[]> {
  try {
    const categories = await prisma.expenseCategory.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    return categories.map((c) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      description: c.description,
      isActive: c.isActive,
    }));
  } catch (error) {
    console.error("Failed to fetch expense categories:", error);
    return [];
  }
}

import { buildPrismaDateFilter } from "@/lib/filter-utils";

/**
 * Fetch expenses list with multi-criteria filtering
 */
export async function getExpensesList(
  filters: ExpenseFilterValues | number = {}
): Promise<ExpenseDTO[]> {
  const filterParams: ExpenseFilterValues =
    typeof filters === "number" ? { limit: filters } : filters;

  try {
    const where: Record<string, unknown> = {};

    if (filterParams.categoryId && filterParams.categoryId !== "ALL") {
      where.categoryId = filterParams.categoryId;
    }

    if (filterParams.paymentMethod && filterParams.paymentMethod !== "ALL") {
      where.paymentMethod = filterParams.paymentMethod as PaymentMethod;
    }

    const dateFilter = buildPrismaDateFilter({
      date: filterParams.date,
      startDate: filterParams.startDate,
      endDate: filterParams.endDate,
      month: filterParams.month,
      year: filterParams.year,
    });

    if (dateFilter) {
      where.expenseDate = dateFilter;
    }

    if (filterParams.search && filterParams.search.trim() !== "") {
      const q = filterParams.search.trim();
      where.OR = [
        { expenseNumber: { contains: q, mode: "insensitive" } },
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { paidTo: { contains: q, mode: "insensitive" } },
        { notes: { contains: q, mode: "insensitive" } },
        { invoiceFileName: { contains: q, mode: "insensitive" } },
        { category: { name: { contains: q, mode: "insensitive" } } },
      ];
    }

    const skip = filterParams.page && filterParams.limit ? (filterParams.page - 1) * filterParams.limit : 0;
    const take = filterParams.limit || 50;

    const expenses = await prisma.expense.findMany({
      where,
      take,
      skip,
      orderBy: { expenseDate: "desc" },
      include: {
        category: true,
        sale: {
          include: { customer: true },
        },
      },
    });

    return expenses.map((e) => ({
      id: e.id,
      expenseNumber: e.expenseNumber,
      categoryId: e.categoryId,
      categoryName: e.category.name,
      categoryCode: e.category.code,
      title: e.title,
      description: e.description,
      amount: e.amount,
      paidTo: e.paidTo,
      paymentMethod: e.paymentMethod,
      expenseDate: e.expenseDate.toISOString(),
      saleId: e.saleId,
      saleNumber: e.sale?.saleNumber || null,
      customerName: e.sale?.customer?.name || null,
      receiptUrl: e.receiptUrl,
      invoiceUrl: e.invoiceUrl,
      invoiceFileName: e.invoiceFileName,
      notes: e.notes,
    }));
  } catch (error) {
    console.error("Failed to fetch expenses list:", error);
    return [];
  }
}

/**
 * Count total expenses matching filter criteria for pagination
 */
export async function countExpenses(
  filters: ExpenseFilterValues = {}
): Promise<number> {
  try {
    const where: Record<string, unknown> = {};

    if (filters.categoryId && filters.categoryId !== "ALL") {
      where.categoryId = filters.categoryId;
    }

    if (filters.paymentMethod && filters.paymentMethod !== "ALL") {
      where.paymentMethod = filters.paymentMethod as PaymentMethod;
    }

    const dateFilter = buildPrismaDateFilter({
      date: filters.date,
      startDate: filters.startDate,
      endDate: filters.endDate,
      month: filters.month,
      year: filters.year,
    });

    if (dateFilter) {
      where.expenseDate = dateFilter;
    }

    if (filters.search && filters.search.trim() !== "") {
      const q = filters.search.trim();
      where.OR = [
        { expenseNumber: { contains: q, mode: "insensitive" } },
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { paidTo: { contains: q, mode: "insensitive" } },
        { notes: { contains: q, mode: "insensitive" } },
        { invoiceFileName: { contains: q, mode: "insensitive" } },
        { category: { name: { contains: q, mode: "insensitive" } } },
      ];
    }

    return await prisma.expense.count({ where });
  } catch {
    return 0;
  }
}

/**
 * Fetch lookup data for expenses (categories + sales for linking)
 */
export async function getExpenseLookups() {
  try {
    const [categories, sales] = await Promise.all([
      getExpenseCategories(),
      prisma.sale.findMany({
        orderBy: { saleDate: "desc" },
        take: 50,
        select: {
          id: true,
          saleNumber: true,
          saleDate: true,
          totalAmount: true,
          customer: { select: { name: true } },
        },
      }),
    ]);

    return {
      categories,
      sales: sales.map((s) => ({
        id: s.id,
        saleNumber: s.saleNumber,
        customerName: s.customer.name,
        saleDate: s.saleDate.toISOString(),
        totalAmount: s.totalAmount,
      })),
    };
  } catch (error) {
    console.error("Failed to fetch expense lookups:", error);
    return {
      categories: await getExpenseCategories(),
      sales: [],
    };
  }
}

/**
 * Fetch a single expense by ID
 */
export async function getExpenseById(id: string): Promise<ExpenseDTO | null> {
  try {
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        category: true,
        sale: {
          include: { customer: true },
        },
      },
    });

    if (!expense) return null;

    return {
      id: expense.id,
      expenseNumber: expense.expenseNumber,
      categoryId: expense.categoryId,
      categoryName: expense.category.name,
      categoryCode: expense.category.code,
      title: expense.title,
      description: expense.description,
      amount: expense.amount,
      paidTo: expense.paidTo,
      paymentMethod: expense.paymentMethod,
      expenseDate: expense.expenseDate.toISOString(),
      saleId: expense.saleId,
      saleNumber: expense.sale?.saleNumber || null,
      customerName: expense.sale?.customer?.name || null,
      receiptUrl: expense.receiptUrl,
      invoiceUrl: expense.invoiceUrl,
      invoiceFileName: expense.invoiceFileName,
      notes: expense.notes,
    };
  } catch (error) {
    console.error(`Failed to get expense ${id}:`, error);
    return null;
  }
}

/**
 * Create a new expense record with validation and audit logging
 */
export async function createExpense(data: ExpenseFormValues, userId?: string): Promise<ExpenseDTO> {
  const validated = expenseFormSchema.parse(data);
  const expenseNumber = await generateExpenseNumber();

  const expenseDate = new Date(validated.expenseDate);

  const created = await prisma.expense.create({
    data: {
      expenseNumber,
      categoryId: validated.categoryId,
      title: validated.title.trim(),
      description: validated.description?.trim() || null,
      amount: Number(validated.amount.toFixed(2)),
      paidTo: validated.paidTo?.trim() || null,
      paymentMethod: validated.paymentMethod as PaymentMethod,
      expenseDate,
      saleId: validated.saleId && validated.saleId !== "" ? validated.saleId : null,
      invoiceUrl: validated.invoiceUrl || null,
      invoiceFileName: validated.invoiceFileName || null,
      receiptUrl: validated.invoiceUrl || null,
      notes: validated.notes?.trim() || null,
    },
    include: {
      category: true,
      sale: {
        include: { customer: true },
      },
    },
  });

  await logAuditEvent({
    action: "CREATE_EXPENSE",
    entity: "EXPENSE",
    entityId: created.id,
    userId,
    metadata: {
      expenseNumber: created.expenseNumber,
      amount: created.amount,
      category: created.category.name,
      saleId: created.saleId,
    },
  });

  return {
    id: created.id,
    expenseNumber: created.expenseNumber,
    categoryId: created.categoryId,
    categoryName: created.category.name,
    categoryCode: created.category.code,
    title: created.title,
    description: created.description,
    amount: created.amount,
    paidTo: created.paidTo,
    paymentMethod: created.paymentMethod,
    expenseDate: created.expenseDate.toISOString(),
    saleId: created.saleId,
    saleNumber: created.sale?.saleNumber || null,
    customerName: created.sale?.customer?.name || null,
    receiptUrl: created.receiptUrl,
    invoiceUrl: created.invoiceUrl,
    invoiceFileName: created.invoiceFileName,
    notes: created.notes,
  };
}

/**
 * Delete an expense record
 */
export async function deleteExpense(id: string, userId?: string): Promise<boolean> {
  try {
    const existing = await prisma.expense.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!existing) return false;

    await prisma.expense.delete({
      where: { id },
    });

    await logAuditEvent({
      action: "DELETE_EXPENSE",
      entity: "EXPENSE",
      entityId: id,
      userId,
      metadata: {
        expenseNumber: existing.expenseNumber,
        amount: existing.amount,
      },
    });

    return true;
  } catch (error) {
    console.error(`Failed to delete expense ${id}:`, error);
    throw error;
  }
}

/**
 * Summary metrics for dashboard and header
 */
export async function getExpenseSummaryMetrics() {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalAggregate, monthAggregate, categoryBreakdown] = await Promise.all([
      prisma.expense.aggregate({
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.expense.aggregate({
        where: { expenseDate: { gte: firstDayOfMonth } },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.expense.groupBy({
        by: ["categoryId"],
        _sum: { amount: true },
        _count: { id: true },
      }),
    ]);

    const categories = await prisma.expenseCategory.findMany();
    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

    const formattedCategoryBreakdown = categoryBreakdown.map((item) => ({
      categoryId: item.categoryId,
      categoryName: categoryMap.get(item.categoryId) || "Uncategorized",
      totalAmount: item._sum.amount || 0,
      count: item._count.id,
    }));

    return {
      totalAmount: totalAggregate._sum.amount || 0,
      totalCount: totalAggregate._count.id,
      thisMonthAmount: monthAggregate._sum.amount || 0,
      thisMonthCount: monthAggregate._count.id,
      categoryBreakdown: formattedCategoryBreakdown,
    };
  } catch (error) {
    console.error("Failed to compute expense summary metrics:", error);
    return {
      totalAmount: 0,
      totalCount: 0,
      thisMonthAmount: 0,
      thisMonthCount: 0,
      categoryBreakdown: [],
    };
  }
}
