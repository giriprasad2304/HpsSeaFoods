import { prisma } from "@/lib/prisma";
import type {
  CustomerReceivableRow,
  OutstandingReportData,
  OutstandingReportSummary,
  ReportFilterOptions,
  SupplierPayableRow,
} from "@/types/financial-reports";

export async function generateOutstandingReport(
  filters: ReportFilterOptions = {}
): Promise<OutstandingReportData> {
  // 1. Fetch Customers with sales and balances
  const customerWhere: Record<string, unknown> = { isActive: true };
  if (filters.customerId && filters.customerId !== "ALL") {
    customerWhere.id = filters.customerId;
  }
  if (filters.search && filters.search.trim() !== "") {
    const q = filters.search.trim();
    customerWhere.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { companyName: { contains: q, mode: "insensitive" } },
      { code: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
    ];
  }

  const customers = await prisma.customer.findMany({
    where: customerWhere,
    include: {
      sales: {
        where: { status: { notIn: ["CANCELLED"] } },
        select: {
          totalAmount: true,
          paidAmount: true,
          balanceAmount: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  // 2. Fetch Suppliers with purchases and balances
  const supplierWhere: Record<string, unknown> = { isActive: true };
  if (filters.supplierId && filters.supplierId !== "ALL") {
    supplierWhere.id = filters.supplierId;
  }
  if (filters.search && filters.search.trim() !== "") {
    const q = filters.search.trim();
    supplierWhere.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { code: { contains: q, mode: "insensitive" } },
      { boatName: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
    ];
  }

  const suppliers = await prisma.supplier.findMany({
    where: supplierWhere,
    include: {
      purchases: {
        where: { status: { notIn: ["CANCELLED"] } },
        select: {
          totalAmount: true,
          paidAmount: true,
          balanceAmount: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  let totalReceivables = 0;
  let activeDebtorCount = 0;

  const receivables: CustomerReceivableRow[] = customers
    .map((c) => {
      const salesCount = c.sales.length;
      const totalBilled = c.sales.reduce((sum, s) => sum + s.totalAmount, 0);
      const totalPaid = c.sales.reduce((sum, s) => sum + s.paidAmount, 0);
      const outstanding = c.sales.reduce((sum, s) => sum + s.balanceAmount, 0);

      if (outstanding > 0) {
        totalReceivables += outstanding;
        activeDebtorCount += 1;
      }

      return {
        customerId: c.id,
        customerCode: c.code,
        customerName: c.name,
        companyName: c.companyName,
        phone: c.phone,
        totalSalesCount: salesCount,
        totalBilled: Number(totalBilled.toFixed(2)),
        totalPaid: Number(totalPaid.toFixed(2)),
        outstandingBalance: Number(outstanding.toFixed(2)),
        creditLimit: c.creditLimit,
      };
    })
    .filter((c) => (filters.paymentStatus === "UNPAID" ? c.outstandingBalance > 0 : true))
    .sort((a, b) => b.outstandingBalance - a.outstandingBalance);

  let totalPayables = 0;
  let activeCreditorCount = 0;

  const payables: SupplierPayableRow[] = suppliers
    .map((s) => {
      const purchasesCount = s.purchases.length;
      const totalProcured = s.purchases.reduce((sum, p) => sum + p.totalAmount, 0);
      const totalPaid = s.purchases.reduce((sum, p) => sum + p.paidAmount, 0);
      const outstanding = s.purchases.reduce((sum, p) => sum + p.balanceAmount, 0);

      if (outstanding > 0) {
        totalPayables += outstanding;
        activeCreditorCount += 1;
      }

      return {
        supplierId: s.id,
        supplierCode: s.code,
        supplierName: s.name,
        boatName: s.boatName,
        harborLocation: s.harborLocation,
        phone: s.phone,
        totalPurchasesCount: purchasesCount,
        totalProcured: Number(totalProcured.toFixed(2)),
        totalPaid: Number(totalPaid.toFixed(2)),
        outstandingPayable: Number(outstanding.toFixed(2)),
      };
    })
    .filter((s) => (filters.paymentStatus === "UNPAID" ? s.outstandingPayable > 0 : true))
    .sort((a, b) => b.outstandingPayable - a.outstandingPayable);

  const summary: OutstandingReportSummary = {
    totalReceivables: Number(totalReceivables.toFixed(2)),
    totalPayables: Number(totalPayables.toFixed(2)),
    netWorkingCapital: Number((totalReceivables - totalPayables).toFixed(2)),
    activeDebtorCount,
    activeCreditorCount,
  };

  return {
    filters,
    summary,
    receivables,
    payables,
    generatedAt: new Date().toISOString(),
  };
}
