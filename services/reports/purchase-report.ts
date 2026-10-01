import { prisma } from "@/lib/prisma";
import { buildDateFilter } from "./filter-utils";
import type {
  PurchaseReportData,
  PurchaseReportRow,
  PurchaseReportSummary,
  ReportFilterOptions,
} from "@/types/financial-reports";
import type { PaymentStatus } from "@prisma/client";

export async function generatePurchaseReport(
  filters: ReportFilterOptions = {}
): Promise<PurchaseReportData> {
  const where: Record<string, unknown> = {
    status: { notIn: ["CANCELLED"] },
  };

  const dateCond = buildDateFilter(filters);
  if (dateCond) {
    where.purchaseDate = dateCond;
  }

  if (filters.supplierId && filters.supplierId !== "ALL") {
    where.supplierId = filters.supplierId;
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
      { purchaseNumber: { contains: q, mode: "insensitive" } },
      { invoiceFileName: { contains: q, mode: "insensitive" } },
    ];
  }

  if (filters.search && filters.search.trim() !== "") {
    const q = filters.search.trim();
    where.OR = [
      { purchaseNumber: { contains: q, mode: "insensitive" } },
      { supplier: { name: { contains: q, mode: "insensitive" } } },
      { supplier: { boatName: { contains: q, mode: "insensitive" } } },
      { landingHarbor: { contains: q, mode: "insensitive" } },
      { truckNumber: { contains: q, mode: "insensitive" } },
      { notes: { contains: q, mode: "insensitive" } },
    ];
  }

  const purchases = await prisma.purchase.findMany({
    where,
    include: {
      supplier: { select: { id: true, name: true, boatName: true, harborLocation: true } },
      items: {
        include: {
          fishType: { select: { name: true, code: true } },
        },
      },
    },
    orderBy: { purchaseDate: "desc" },
  });

  let totalWeightKg = 0;
  let totalSubtotal = 0;
  let totalTransportCharges = 0;
  let totalIceCharges = 0;
  let totalLabourCharges = 0;
  let totalPurchaseSpend = 0;
  let totalPaid = 0;
  let totalOutstandingPayable = 0;

  const rows: PurchaseReportRow[] = purchases.map((p) => {
    const weight = p.totalWeightKg || p.items.reduce((acc, it) => acc + it.weightKg, 0);
    const fishSummary = p.items
      .map((it) => `${it.fishType.name} (${it.weightKg.toFixed(0)}kg)`)
      .join(", ");

    totalWeightKg += weight;
    totalSubtotal += p.subtotal;
    totalTransportCharges += p.transportCharges;
    totalIceCharges += p.iceCharges;
    totalLabourCharges += p.labourCharges;
    totalPurchaseSpend += p.totalAmount;
    totalPaid += p.paidAmount;
    totalOutstandingPayable += p.balanceAmount;

    return {
      id: p.id,
      purchaseDate: p.purchaseDate.toISOString(),
      purchaseNumber: p.purchaseNumber,
      supplierId: p.supplier.id,
      supplierName: p.supplier.name,
      boatOrHarbor: p.supplier.boatName || p.landingHarbor || p.supplier.harborLocation || null,
      fishSummary: fishSummary || "No items",
      totalWeightKg: Number(weight.toFixed(2)),
      subtotal: Number(p.subtotal.toFixed(2)),
      transportCharges: Number(p.transportCharges.toFixed(2)),
      iceCharges: Number(p.iceCharges.toFixed(2)),
      labourCharges: Number(p.labourCharges.toFixed(2)),
      totalAmount: Number(p.totalAmount.toFixed(2)),
      paidAmount: Number(p.paidAmount.toFixed(2)),
      balanceAmount: Number(p.balanceAmount.toFixed(2)),
      paymentStatus: p.paymentStatus,
    };
  });

  const summary: PurchaseReportSummary = {
    totalRecords: rows.length,
    totalWeightKg: Number(totalWeightKg.toFixed(2)),
    totalSubtotal: Number(totalSubtotal.toFixed(2)),
    totalTransportCharges: Number(totalTransportCharges.toFixed(2)),
    totalIceCharges: Number(totalIceCharges.toFixed(2)),
    totalLabourCharges: Number(totalLabourCharges.toFixed(2)),
    totalPurchaseSpend: Number(totalPurchaseSpend.toFixed(2)),
    totalPaid: Number(totalPaid.toFixed(2)),
    totalOutstandingPayable: Number(totalOutstandingPayable.toFixed(2)),
  };

  return {
    filters,
    summary,
    rows,
    generatedAt: new Date().toISOString(),
  };
}
