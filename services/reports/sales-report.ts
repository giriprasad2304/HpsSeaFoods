import { prisma } from "@/lib/prisma";
import { buildDateFilter } from "./filter-utils";
import type {
  ReportFilterOptions,
  SalesReportData,
  SalesReportRow,
  SalesReportSummary,
} from "@/types/financial-reports";
import type { PaymentStatus } from "@prisma/client";

export async function generateSalesReport(
  filters: ReportFilterOptions = {}
): Promise<SalesReportData> {
  const where: Record<string, unknown> = {
    status: { notIn: ["CANCELLED"] },
  };

  const dateCond = buildDateFilter(filters);
  if (dateCond) {
    where.saleDate = dateCond;
  }

  if (filters.customerId && filters.customerId !== "ALL") {
    where.customerId = filters.customerId;
  }

  if (filters.paymentStatus && filters.paymentStatus !== "ALL") {
    where.paymentStatus = filters.paymentStatus as PaymentStatus;
  }

  if (filters.fishTypeId && filters.fishTypeId !== "ALL") {
    where.items = {
      some: {
        fishTypeId: filters.fishTypeId,
      },
    };
  }

  if (filters.invoiceNumber && filters.invoiceNumber.trim() !== "") {
    const q = filters.invoiceNumber.trim();
    where.OR = [
      { saleNumber: { contains: q, mode: "insensitive" } },
      { invoice: { invoiceNumber: { contains: q, mode: "insensitive" } } },
    ];
  }

  if (filters.search && filters.search.trim() !== "") {
    const q = filters.search.trim();
    where.OR = [
      { saleNumber: { contains: q, mode: "insensitive" } },
      { customer: { name: { contains: q, mode: "insensitive" } } },
      { customer: { companyName: { contains: q, mode: "insensitive" } } },
      { notes: { contains: q, mode: "insensitive" } },
    ];
  }

  const sales = await prisma.sale.findMany({
    where,
    include: {
      customer: { select: { id: true, name: true, companyName: true } },
      invoice: { select: { invoiceNumber: true } },
      items: {
        include: {
          fishType: { select: { name: true, code: true } },
        },
      },
    },
    orderBy: { saleDate: "desc" },
  });

  let totalWeightKg = 0;
  let totalSubtotal = 0;
  let totalTax = 0;
  let totalDiscount = 0;
  let totalRevenue = 0;
  let totalPaid = 0;
  let totalOutstanding = 0;

  const rows: SalesReportRow[] = sales.map((sale) => {
    const saleWeight = sale.items.reduce((acc, item) => acc + item.weightKg, 0);
    const fishSummary = sale.items
      .map((it) => `${it.fishType.name} (${it.weightKg.toFixed(0)}kg)`)
      .join(", ");

    totalWeightKg += saleWeight;
    totalSubtotal += sale.subtotal;
    totalTax += sale.taxAmount;
    totalDiscount += sale.discountAmount;
    totalRevenue += sale.totalAmount;
    totalPaid += sale.paidAmount;
    totalOutstanding += sale.balanceAmount;

    return {
      id: sale.id,
      saleDate: sale.saleDate.toISOString(),
      saleNumber: sale.saleNumber,
      invoiceNumber: sale.invoice?.invoiceNumber || null,
      customerId: sale.customer.id,
      customerName: sale.customer.companyName
        ? `${sale.customer.name} (${sale.customer.companyName})`
        : sale.customer.name,
      fishSummary: fishSummary || "No items",
      totalWeightKg: Number(saleWeight.toFixed(2)),
      subtotal: Number(sale.subtotal.toFixed(2)),
      taxAmount: Number(sale.taxAmount.toFixed(2)),
      discountAmount: Number(sale.discountAmount.toFixed(2)),
      totalAmount: Number(sale.totalAmount.toFixed(2)),
      paidAmount: Number(sale.paidAmount.toFixed(2)),
      balanceAmount: Number(sale.balanceAmount.toFixed(2)),
      paymentStatus: sale.paymentStatus,
    };
  });

  const summary: SalesReportSummary = {
    totalRecords: rows.length,
    totalWeightKg: Number(totalWeightKg.toFixed(2)),
    totalSubtotal: Number(totalSubtotal.toFixed(2)),
    totalTax: Number(totalTax.toFixed(2)),
    totalDiscount: Number(totalDiscount.toFixed(2)),
    totalRevenue: Number(totalRevenue.toFixed(2)),
    totalPaid: Number(totalPaid.toFixed(2)),
    totalOutstanding: Number(totalOutstanding.toFixed(2)),
  };

  return {
    filters,
    summary,
    rows,
    generatedAt: new Date().toISOString(),
  };
}
