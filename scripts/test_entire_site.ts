import { prisma } from "../lib/prisma";
import { getDashboardData } from "../services/dashboard";
import { getPurchasesList, countPurchases, getSuppliersAndFishTypes } from "../services/purchases";
import { listSales, countSales, getCustomersAndFishTypes } from "../services/sales";
import { getInventoryStockSummary, getInventoryTransactionsList } from "../services/inventory";
import { getPackingCostsList } from "../services/packing";
import { getExpensesList, getExpenseCategories, getExpenseSummaryMetrics } from "../services/expenses";
import { getPaymentsList } from "../services/payments";
import { getProfitLossDashboard } from "../services/profit-loss";
import { generateSalesReport } from "../services/reports/sales-report";
import { generatePurchaseReport } from "../services/reports/purchase-report";
import { generateExpenseReport } from "../services/reports/expense-report";
import { generateOutstandingReport } from "../services/reports/outstanding-report";
import { generateProfitLossStatementReport } from "../services/reports/profit-loss-report";
import { generateBalanceSheetReport } from "../services/reports/balance-sheet-report";

async function testAll() {
  console.log("🔍 ========================================================");
  console.log("🚀 Testing Entire Application with Branch 2 Database");
  console.log("🔍 ========================================================\n");

  const results: { category: string; test: string; status: "PASSED" | "FAILED"; details?: string }[] = [];

  async function runTest(category: string, name: string, fn: () => Promise<any>) {
    try {
      const data = await fn();
      console.log(`  ✓ [PASS] [${category}] ${name}`);
      results.push({ category, test: name, status: "PASSED" });
      return data;
    } catch (err: any) {
      console.error(`  ✗ [FAIL] [${category}] ${name}:`, err.message);
      results.push({ category, test: name, status: "FAILED", details: err.message });
    }
  }

  // 1. Core Model Counts
  console.log("📦 1. Database Table Verification:");
  await runTest("Prisma", "prisma.supplier.count() (Fixed Original Error)", async () => {
    const count = await prisma.supplier.count();
    if (count !== 1) throw new Error(`Expected 1 supplier, found ${count}`);
  });

  await runTest("Prisma", "prisma.customer.count()", async () => {
    const count = await prisma.customer.count();
    if (count !== 1) throw new Error(`Expected 1 customer, found ${count}`);
  });

  await runTest("Prisma", "prisma.fishType.count()", async () => {
    const count = await prisma.fishType.count();
    if (count !== 1) throw new Error(`Expected 1 fish type, found ${count}`);
  });

  await runTest("Prisma", "prisma.user.count()", async () => {
    const count = await prisma.user.count();
    if (count !== 1) throw new Error(`Expected 1 user, found ${count}`);
  });

  await runTest("Prisma", "prisma.purchase.count()", async () => {
    const count = await prisma.purchase.count();
    if (count !== 1) throw new Error(`Expected 1 purchase, found ${count}`);
  });

  await runTest("Prisma", "prisma.sale.count()", async () => {
    const count = await prisma.sale.count();
    if (count !== 1) throw new Error(`Expected 1 sale, found ${count}`);
  });

  await runTest("Prisma", "prisma.inventoryTransaction.count()", async () => {
    const count = await prisma.inventoryTransaction.count();
    if (count !== 1) throw new Error(`Expected 1 inventory transaction, found ${count}`);
  });

  await runTest("Prisma", "prisma.packingCost.count()", async () => {
    const count = await prisma.packingCost.count();
    if (count !== 1) throw new Error(`Expected 1 packing cost, found ${count}`);
  });

  await runTest("Prisma", "prisma.invoice.count()", async () => {
    const count = await prisma.invoice.count();
    if (count !== 1) throw new Error(`Expected 1 invoice, found ${count}`);
  });

  await runTest("Prisma", "prisma.expense.count()", async () => {
    const count = await prisma.expense.count();
    if (count !== 1) throw new Error(`Expected 1 expense, found ${count}`);
  });

  await runTest("Prisma", "prisma.payment.count()", async () => {
    const count = await prisma.payment.count();
    if (count !== 1) throw new Error(`Expected 1 payment, found ${count}`);
  });

  await runTest("Prisma", "prisma.auditLog.count()", async () => {
    const count = await prisma.auditLog.count();
    if (count !== 1) throw new Error(`Expected 1 audit log, found ${count}`);
  });

  // 2. Dashboard Service
  console.log("\n📊 2. Dashboard Services:");
  await runTest("Dashboard", "getDashboardData()", async () => {
    const data = await getDashboardData();
    if (!data.metrics) throw new Error("Missing dashboard metrics");
  });

  // 3. Purchases Service
  console.log("\n🐟 3. Purchases Services:");
  await runTest("Purchases", "getPurchasesList() & countPurchases()", async () => {
    const list = await getPurchasesList();
    const total = await countPurchases();
    if (list.length !== 1 || total !== 1) throw new Error(`Expected 1 purchase in list, got ${list.length}`);
  });

  await runTest("Purchases", "getSuppliersAndFishTypes()", async () => {
    const lookups = await getSuppliersAndFishTypes();
    if (lookups.suppliers.length !== 1 || lookups.fishTypes.length !== 1) {
      throw new Error("Lookups missing suppliers or fish types");
    }
  });

  // 4. Sales Service
  console.log("\n💼 4. Sales Services:");
  await runTest("Sales", "listSales() & countSales()", async () => {
    const list = await listSales();
    const total = await countSales();
    if (list.length !== 1 || total !== 1) throw new Error(`Expected 1 sale, got ${list.length}`);
  });

  await runTest("Sales", "getCustomersAndFishTypes()", async () => {
    const lookups = await getCustomersAndFishTypes();
    if (lookups.customers.length !== 1 || lookups.fishTypes.length !== 1) {
      throw new Error("Lookups missing customers or fish types");
    }
  });

  // 5. Inventory Service
  console.log("\n📦 5. Inventory Services:");
  await runTest("Inventory", "getInventoryStockSummary()", async () => {
    const summary = await getInventoryStockSummary();
    if (summary.length !== 1) throw new Error(`Expected 1 stock summary item, got ${summary.length}`);
  });

  await runTest("Inventory", "getInventoryTransactionsList()", async () => {
    const txs = await getInventoryTransactionsList();
    if (txs.length !== 1) throw new Error(`Expected 1 transaction, got ${txs.length}`);
  });

  // 6. Packing Service
  console.log("\n📦 6. Packing Cost Services:");
  await runTest("Packing", "getPackingCostsList()", async () => {
    const list = await getPackingCostsList();
    if (list.length !== 1) throw new Error(`Expected 1 packing cost item, got ${list.length}`);
  });

  // 7. Expenses Service
  console.log("\n💰 7. Expenses Services:");
  await runTest("Expenses", "getExpensesList() & getExpenseCategories()", async () => {
    const list = await getExpensesList();
    const categories = await getExpenseCategories();
    const metrics = await getExpenseSummaryMetrics();
    if (list.length !== 1 || categories.length !== 1) throw new Error("Expense data mismatch");
  });

  // 8. Payments Service
  console.log("\n💳 8. Payments Services:");
  await runTest("Payments", "getPaymentsList()", async () => {
    const list = await getPaymentsList();
    if (list.length !== 1) throw new Error(`Expected 1 payment, got ${list.length}`);
  });

  // 9. Profit & Loss Service
  console.log("\n📈 9. Profit & Loss Services:");
  await runTest("P&L", "getProfitLossDashboard()", async () => {
    const pl = await getProfitLossDashboard();
    if (!pl.report) throw new Error("P&L report missing");
  });

  // 10. Reports Services
  console.log("\n📑 10. Financial & Business Reports:");
  await runTest("Reports", "generateSalesReport()", async () => {
    return await generateSalesReport({});
  });

  await runTest("Reports", "generatePurchaseReport()", async () => {
    return await generatePurchaseReport({});
  });

  await runTest("Reports", "generateExpenseReport()", async () => {
    return await generateExpenseReport({});
  });

  await runTest("Reports", "generateOutstandingReport()", async () => {
    return await generateOutstandingReport();
  });

  await runTest("Reports", "generateProfitLossStatementReport()", async () => {
    return await generateProfitLossStatementReport({});
  });

  await runTest("Reports", "generateBalanceSheetReport()", async () => {
    return await generateBalanceSheetReport();
  });

  // Final summary
  const passed = results.filter((r) => r.status === "PASSED").length;
  const failed = results.filter((r) => r.status === "FAILED").length;

  console.log("\n========================================================");
  console.log(`🎯 Test Summary: ${passed} Passed, ${failed} Failed out of ${results.length} Tests`);
  console.log("========================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

testAll()
  .catch((e) => {
    console.error("Fatal test error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
