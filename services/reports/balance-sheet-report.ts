import { prisma } from "@/lib/prisma";
import type {
  BalanceSheetData,
  ReportFilterOptions,
} from "@/types/financial-reports";

export async function generateBalanceSheetReport(
  filters: ReportFilterOptions = {}
): Promise<BalanceSheetData> {
  const asOf = filters.endDate ? new Date(filters.endDate) : new Date();
  asOf.setHours(23, 59, 59, 999);

  const [
    salesAgg,
    purchasesAgg,
    expensesAgg,
    packingAgg,
    customerReceiptsAgg,
    supplierPaymentsAgg,
    expensePaymentsAgg,
    activeFishStock,
  ] = await Promise.all([
    // Sales as of date
    prisma.sale.aggregate({
      where: {
        saleDate: { lte: asOf },
        status: { notIn: ["CANCELLED"] },
      },
      _sum: { totalAmount: true, paidAmount: true, balanceAmount: true },
    }),

    // Purchases as of date
    prisma.purchase.aggregate({
      where: {
        purchaseDate: { lte: asOf },
        status: { notIn: ["CANCELLED"] },
      },
      _sum: {
        subtotal: true,
        transportCharges: true,
        iceCharges: true,
        labourCharges: true,
        totalAmount: true,
        paidAmount: true,
        balanceAmount: true,
      },
    }),

    // Expenses as of date
    prisma.expense.aggregate({
      where: {
        expenseDate: { lte: asOf },
      },
      _sum: { amount: true },
    }),

    // Packing Costs as of date
    prisma.packingCost.aggregate({
      where: {
        createdAt: { lte: asOf },
      },
      _sum: { totalCost: true },
    }),

    // Customer Receipts recorded in payments
    prisma.payment.aggregate({
      where: {
        paymentType: "CUSTOMER_RECEIPT",
        paymentDate: { lte: asOf },
      },
      _sum: { amount: true },
    }),

    // Supplier Disbursements recorded in payments
    prisma.payment.aggregate({
      where: {
        paymentType: "SUPPLIER_PAYMENT",
        paymentDate: { lte: asOf },
      },
      _sum: { amount: true },
    }),

    // Expense Disbursements recorded in payments
    prisma.payment.aggregate({
      where: {
        paymentType: "EXPENSE_PAYMENT",
        paymentDate: { lte: asOf },
      },
      _sum: { amount: true },
    }),

    // Inventory transactions as of date for stock valuation
    prisma.fishType.findMany({
      where: { isActive: true },
      include: {
        inventoryTransactions: {
          where: { createdAt: { lte: asOf } },
          select: { quantityKg: true, transactionType: true, unitCost: true },
        },
      },
    }),
  ]);

  // Inventory valuation
  let totalInventoryValuation = 0;
  for (const fish of activeFishStock) {
    let currentStock = 0;
    let totalPurchasedKg = 0;
    let totalPurchasedCost = 0;

    for (const tx of fish.inventoryTransactions) {
      currentStock += tx.quantityKg;
      if (tx.transactionType === "PURCHASE_INWARD" || tx.quantityKg > 0) {
        totalPurchasedKg += tx.quantityKg;
        if (tx.unitCost) {
          totalPurchasedCost += tx.quantityKg * tx.unitCost;
        }
      }
    }

    const safeStock = Math.max(0, currentStock);
    const avgCost = totalPurchasedKg > 0 ? totalPurchasedCost / totalPurchasedKg : 0;
    totalInventoryValuation += safeStock * avgCost;
  }

  // Assets Calculation
  const accountsReceivable = salesAgg._sum.balanceAmount ?? 0;
  const directReceipts = (customerReceiptsAgg._sum.amount ?? 0) || (salesAgg._sum.paidAmount ?? 0);
  const directDisbursements =
    ((supplierPaymentsAgg._sum.amount ?? 0) || (purchasesAgg._sum.paidAmount ?? 0)) +
    ((expensePaymentsAgg._sum.amount ?? 0) || (expensesAgg._sum.amount ?? 0));
  const cashAndBankEstimated = Math.max(0, directReceipts - directDisbursements);

  const inventoryValuation = totalInventoryValuation;
  const totalCurrentAssets = cashAndBankEstimated + accountsReceivable + inventoryValuation;
  const totalAssets = totalCurrentAssets;

  // Liabilities Calculation
  const accountsPayable = purchasesAgg._sum.balanceAmount ?? 0;
  const totalCurrentLiabilities = accountsPayable;
  const totalLiabilities = totalCurrentLiabilities;

  // Equity & Retained Earnings Calculation
  const totalRevenue = salesAgg._sum.totalAmount ?? 0;
  const totalCOGS =
    (purchasesAgg._sum.subtotal ?? 0) +
    (purchasesAgg._sum.transportCharges ?? 0) +
    (purchasesAgg._sum.iceCharges ?? 0) +
    (purchasesAgg._sum.labourCharges ?? 0) +
    (packingAgg._sum.totalCost ?? 0);
  const totalExpenses = expensesAgg._sum.amount ?? 0;
  const cumulativeNetProfit = totalRevenue - totalCOGS - totalExpenses;

  const retainedEarnings = cumulativeNetProfit;
  const totalEquity = retainedEarnings;
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  return {
    asOfDate: asOf.toISOString(),
    filters,
    assets: {
      cashAndBankEstimated: Number(cashAndBankEstimated.toFixed(2)),
      accountsReceivable: Number(accountsReceivable.toFixed(2)),
      inventoryValuation: Number(inventoryValuation.toFixed(2)),
      totalCurrentAssets: Number(totalCurrentAssets.toFixed(2)),
      totalAssets: Number(totalAssets.toFixed(2)),
    },
    liabilities: {
      accountsPayable: Number(accountsPayable.toFixed(2)),
      totalCurrentLiabilities: Number(totalCurrentLiabilities.toFixed(2)),
      totalLiabilities: Number(totalLiabilities.toFixed(2)),
    },
    equity: {
      retainedEarnings: Number(retainedEarnings.toFixed(2)),
      totalEquity: Number(totalEquity.toFixed(2)),
      totalLiabilitiesAndEquity: Number(totalLiabilitiesAndEquity.toFixed(2)),
    },
    isBalanced: Math.abs(totalAssets - totalLiabilitiesAndEquity) < 1.0,
    disclaimer:
      "Managerial Statement of Financial Position derived from live operational data (Customer Accounts Receivable, Supplier Accounts Payable, Cold Storage Inventory Valuation, and Inflow/Outflow Collections). This internal management report reflects available system records and is not an audited statutory accounting filing.",
    generatedAt: new Date().toISOString(),
  };
}
