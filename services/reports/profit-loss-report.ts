import { prisma } from "@/lib/prisma";
import { buildDateFilter } from "./filter-utils";
import type {
  ProfitLossStatementData,
  ReportFilterOptions,
} from "@/types/financial-reports";

export async function generateProfitLossStatementReport(
  filters: ReportFilterOptions = {}
): Promise<ProfitLossStatementData> {
  const dateCond = buildDateFilter(filters);

  // Sales Query
  const saleWhere: Record<string, unknown> = {
    status: { notIn: ["CANCELLED"] },
  };
  if (dateCond) saleWhere.saleDate = dateCond;

  // Purchase Query
  const purchaseWhere: Record<string, unknown> = {
    status: { notIn: ["CANCELLED"] },
  };
  if (dateCond) purchaseWhere.purchaseDate = dateCond;

  // Packing Query
  const packingWhere: Record<string, unknown> = {};
  if (dateCond) packingWhere.createdAt = dateCond;

  // Expense Query
  const expenseWhere: Record<string, unknown> = {};
  if (dateCond) expenseWhere.expenseDate = dateCond;

  const [salesAgg, purchaseAgg, packingAgg, groupedExpenses, categories] = await Promise.all([
    prisma.sale.aggregate({
      where: saleWhere,
      _sum: {
        subtotal: true,
        discountAmount: true,
        totalAmount: true,
      },
    }),
    prisma.purchase.aggregate({
      where: purchaseWhere,
      _sum: {
        subtotal: true,
        transportCharges: true,
        iceCharges: true,
        labourCharges: true,
        totalAmount: true,
      },
    }),
    prisma.packingCost.aggregate({
      where: packingWhere,
      _sum: {
        totalCost: true,
      },
    }),
    prisma.expense.groupBy({
      by: ["categoryId"],
      where: expenseWhere,
      _sum: {
        amount: true,
      },
    }),
    prisma.expenseCategory.findMany({
      select: { id: true, name: true },
    }),
  ]);

  const grossSales = salesAgg._sum.subtotal ?? 0;
  const discounts = salesAgg._sum.discountAmount ?? 0;
  const netRevenue = salesAgg._sum.totalAmount ?? 0;

  const rawFishProcurementCost = purchaseAgg._sum.subtotal ?? 0;
  const transportCharges = purchaseAgg._sum.transportCharges ?? 0;
  const iceCharges = purchaseAgg._sum.iceCharges ?? 0;
  const labourCharges = purchaseAgg._sum.labourCharges ?? 0;
  const packingAndThermocolCosts = packingAgg._sum.totalCost ?? 0;

  const totalCOGS =
    rawFishProcurementCost +
    transportCharges +
    iceCharges +
    labourCharges +
    packingAndThermocolCosts;

  const grossProfit = netRevenue - totalCOGS;
  const grossProfitMargin = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const totalOperatingExpenses = groupedExpenses.reduce(
    (sum, it) => sum + (it._sum.amount ?? 0),
    0
  );

  const operatingExpenses = groupedExpenses
    .map((g) => {
      const amount = g._sum.amount ?? 0;
      return {
        categoryName: categoryMap.get(g.categoryId) || "General Expenses",
        amount: Number(amount.toFixed(2)),
        percentage:
          totalOperatingExpenses > 0
            ? Number(((amount / totalOperatingExpenses) * 100).toFixed(1))
            : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const netProfit = grossProfit - totalOperatingExpenses;
  const netProfitMargin = netRevenue > 0 ? (netProfit / netRevenue) * 100 : 0;

  let periodLabel = "All Time";
  if (filters.year) {
    periodLabel = filters.month
      ? `${new Date(filters.year, filters.month - 1, 1).toLocaleString("en-US", { month: "long" })} ${filters.year}`
      : `Full Year ${filters.year}`;
  } else if (filters.startDate || filters.endDate) {
    periodLabel = `${filters.startDate || "Beginning"} to ${filters.endDate || "Present"}`;
  }

  return {
    periodLabel,
    filters,
    grossSales: Number(grossSales.toFixed(2)),
    discounts: Number(discounts.toFixed(2)),
    netRevenue: Number(netRevenue.toFixed(2)),
    rawFishProcurementCost: Number(rawFishProcurementCost.toFixed(2)),
    transportCharges: Number(transportCharges.toFixed(2)),
    iceCharges: Number(iceCharges.toFixed(2)),
    labourCharges: Number(labourCharges.toFixed(2)),
    packingAndThermocolCosts: Number(packingAndThermocolCosts.toFixed(2)),
    totalCOGS: Number(totalCOGS.toFixed(2)),
    grossProfit: Number(grossProfit.toFixed(2)),
    grossProfitMargin: Number(grossProfitMargin.toFixed(1)),
    operatingExpenses,
    totalOperatingExpenses: Number(totalOperatingExpenses.toFixed(2)),
    netProfit: Number(netProfit.toFixed(2)),
    netProfitMargin: Number(netProfitMargin.toFixed(1)),
    generatedAt: new Date().toISOString(),
  };
}
