import ExcelJS from "exceljs";
import { formatCurrency, formatDate } from "@/lib/utils";
import type {
  SalesReportData,
  PurchaseReportData,
  ExpenseReportData,
  OutstandingReportData,
  ProfitLossStatementData,
  BalanceSheetData,
} from "@/types/financial-reports";

export async function exportSalesToExcel(data: SalesReportData): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "HPS SEA FOODS";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Sales Report");

  // Title Block
  worksheet.mergeCells("A1:K1");
  const titleCell = worksheet.getCell("A1");
  titleCell.value = "HPS SEA FOODS - Commercial Sales Ledger";
  titleCell.font = { name: "Arial", size: 14, bold: true, color: { argb: "FFFFFFFF" } };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0284C7" } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getRow(1).height = 30;

  // Metadata Row
  worksheet.addRow([
    `Generated: ${formatDate(data.generatedAt)}`,
    "",
    `Total Records: ${data.summary.totalRecords}`,
    "",
    `Total Volume: ${data.summary.totalWeightKg} kg`,
    "",
    `Total Revenue: ${formatCurrency(data.summary.totalRevenue)}`,
    "",
    `Total Paid: ${formatCurrency(data.summary.totalPaid)}`,
    "",
    `Total Outstanding: ${formatCurrency(data.summary.totalOutstanding)}`,
  ]);
  worksheet.getRow(2).font = { italic: true, size: 9 };
  worksheet.addRow([]); // Blank row

  // Table Headers
  const headers = [
    "Date",
    "Sale Number",
    "Invoice #",
    "Customer / Company",
    "Fish Species Details",
    "Weight (kg)",
    "Subtotal (₹)",
    "Tax (₹)",
    "Total (₹)",
    "Paid (₹)",
    "Balance (₹)",
    "Status",
  ];
  const headerRow = worksheet.addRow(headers);
  headerRow.height = 24;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin" },
      bottom: { style: "medium" },
    };
  });

  // Data Rows
  data.rows.forEach((row) => {
    worksheet.addRow([
      formatDate(row.saleDate),
      row.saleNumber,
      row.invoiceNumber || "-",
      row.customerName,
      row.fishSummary,
      row.totalWeightKg,
      row.subtotal,
      row.taxAmount,
      row.totalAmount,
      row.paidAmount,
      row.balanceAmount,
      row.paymentStatus,
    ]);
  });

  // Totals Row
  const totalRow = worksheet.addRow([
    "TOTALS",
    "",
    "",
    "",
    "",
    data.summary.totalWeightKg,
    data.summary.totalSubtotal,
    data.summary.totalTax,
    data.summary.totalRevenue,
    data.summary.totalPaid,
    data.summary.totalOutstanding,
    "",
  ]);
  totalRow.height = 22;
  totalRow.font = { bold: true, size: 10 };
  totalRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
    cell.border = { top: { style: "thin" }, bottom: { style: "double" } };
  });

  // Adjust Column Widths
  worksheet.columns.forEach((column) => {
    column.width = 16;
  });
  worksheet.getColumn(4).width = 28; // Customer
  worksheet.getColumn(5).width = 32; // Fish details

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export async function exportPurchasesToExcel(data: PurchaseReportData): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Purchase Report");

  worksheet.mergeCells("A1:L1");
  const titleCell = worksheet.getCell("A1");
  titleCell.value = "HPS SEA FOODS - Fish Procurement & Inward Spend Ledger";
  titleCell.font = { name: "Arial", size: 14, bold: true, color: { argb: "FFFFFFFF" } };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF97316" } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getRow(1).height = 30;

  worksheet.addRow([
    `Generated: ${formatDate(data.generatedAt)}`,
    "",
    `Total Batches: ${data.summary.totalRecords}`,
    "",
    `Total Weight: ${data.summary.totalWeightKg} kg`,
    "",
    `Total Spend: ${formatCurrency(data.summary.totalPurchaseSpend)}`,
    "",
    `Total Paid: ${formatCurrency(data.summary.totalPaid)}`,
    "",
    `Outstanding Payable: ${formatCurrency(data.summary.totalOutstandingPayable)}`,
  ]);
  worksheet.addRow([]);

  const headers = [
    "Date",
    "Purchase #",
    "Supplier Vessel",
    "Landing Harbor",
    "Species Summary",
    "Weight (kg)",
    "Subtotal (₹)",
    "Transport (₹)",
    "Ice & Labour (₹)",
    "Total (₹)",
    "Paid (₹)",
    "Balance (₹)",
    "Status",
  ];
  const headerRow = worksheet.addRow(headers);
  headerRow.height = 24;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  data.rows.forEach((row) => {
    worksheet.addRow([
      formatDate(row.purchaseDate),
      row.purchaseNumber,
      row.supplierName,
      row.boatOrHarbor || "-",
      row.fishSummary,
      row.totalWeightKg,
      row.subtotal,
      row.transportCharges,
      row.iceCharges + row.labourCharges,
      row.totalAmount,
      row.paidAmount,
      row.balanceAmount,
      row.paymentStatus,
    ]);
  });

  const totalRow = worksheet.addRow([
    "TOTALS",
    "",
    "",
    "",
    "",
    data.summary.totalWeightKg,
    data.summary.totalSubtotal,
    data.summary.totalTransportCharges,
    data.summary.totalIceCharges + data.summary.totalLabourCharges,
    data.summary.totalPurchaseSpend,
    data.summary.totalPaid,
    data.summary.totalOutstandingPayable,
    "",
  ]);
  totalRow.height = 22;
  totalRow.font = { bold: true };
  totalRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
    cell.border = { top: { style: "thin" }, bottom: { style: "double" } };
  });

  worksheet.columns.forEach((column) => {
    column.width = 16;
  });
  worksheet.getColumn(3).width = 24;
  worksheet.getColumn(5).width = 30;

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export async function exportExpensesToExcel(data: ExpenseReportData): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Expenses Report");

  worksheet.mergeCells("A1:G1");
  const titleCell = worksheet.getCell("A1");
  titleCell.value = "HPS SEA FOODS - Operating Expenses Register";
  titleCell.font = { name: "Arial", size: 14, bold: true, color: { argb: "FFFFFFFF" } };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF7C3AED" } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getRow(1).height = 30;

  worksheet.addRow([
    `Generated: ${formatDate(data.generatedAt)}`,
    "",
    `Total Records: ${data.summary.totalRecords}`,
    "",
    `Total Expenses: ${formatCurrency(data.summary.totalExpenses)}`,
  ]);
  worksheet.addRow([]);

  const headers = [
    "Date",
    "Expense #",
    "Category",
    "Expense Title",
    "Paid To / Vendor",
    "Payment Method",
    "Amount (₹)",
  ];
  const headerRow = worksheet.addRow(headers);
  headerRow.height = 24;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  data.rows.forEach((row) => {
    worksheet.addRow([
      formatDate(row.expenseDate),
      row.expenseNumber,
      row.categoryName,
      row.title,
      row.paidTo || "-",
      row.paymentMethod,
      row.amount,
    ]);
  });

  const totalRow = worksheet.addRow([
    "TOTALS",
    "",
    "",
    "",
    "",
    "",
    data.summary.totalExpenses,
  ]);
  totalRow.height = 22;
  totalRow.font = { bold: true };
  totalRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
    cell.border = { top: { style: "thin" }, bottom: { style: "double" } };
  });

  worksheet.columns.forEach((col) => {
    col.width = 18;
  });
  worksheet.getColumn(4).width = 30;

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export async function exportOutstandingToExcel(data: OutstandingReportData): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const recSheet = workbook.addWorksheet("Customer Receivables");

  // Receivables Sheet
  recSheet.addRow(["HPS SEA FOODS - Accounts Receivable (Customer Balances)"]).font = { bold: true, size: 14 };
  recSheet.addRow([`Total Receivables: ${formatCurrency(data.summary.totalReceivables)}`, `Debtors: ${data.summary.activeDebtorCount}`]);
  recSheet.addRow([]);

  const recHeaders = ["Code", "Customer Name", "Company", "Phone", "Sales Count", "Total Billed (₹)", "Total Paid (₹)", "Outstanding Due (₹)", "Credit Limit (₹)"];
  const recHRow = recSheet.addRow(recHeaders);
  recHRow.eachCell((c) => {
    c.font = { bold: true, color: { argb: "FFFFFFFF" } };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0284C7" } };
  });

  data.receivables.forEach((r) => {
    recSheet.addRow([r.customerCode, r.customerName, r.companyName || "-", r.phone, r.totalSalesCount, r.totalBilled, r.totalPaid, r.outstandingBalance, r.creditLimit]);
  });
  recSheet.columns.forEach((c) => { c.width = 18; });

  // Payables Sheet
  const paySheet = workbook.addWorksheet("Supplier Payables");
  paySheet.addRow(["HPS SEA FOODS - Accounts Payable (Supplier Liabilities)"]).font = { bold: true, size: 14 };
  paySheet.addRow([`Total Payables: ${formatCurrency(data.summary.totalPayables)}`, `Creditors: ${data.summary.activeCreditorCount}`]);
  paySheet.addRow([]);

  const payHeaders = ["Code", "Supplier Name", "Boat / Vessel", "Harbor", "Phone", "Purchases Count", "Total Procured (₹)", "Total Paid (₹)", "Outstanding Payable (₹)"];
  const payHRow = paySheet.addRow(payHeaders);
  payHRow.eachCell((c) => {
    c.font = { bold: true, color: { argb: "FFFFFFFF" } };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF97316" } };
  });

  data.payables.forEach((p) => {
    paySheet.addRow([p.supplierCode, p.supplierName, p.boatName || "-", p.harborLocation || "-", p.phone, p.totalPurchasesCount, p.totalProcured, p.totalPaid, p.outstandingPayable]);
  });
  paySheet.columns.forEach((c) => { c.width = 18; });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export async function exportProfitLossToExcel(data: ProfitLossStatementData): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Profit & Loss Statement");

  worksheet.mergeCells("A1:C1");
  const title = worksheet.getCell("A1");
  title.value = `HPS SEA FOODS - Profit & Loss Statement (${data.periodLabel})`;
  title.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
  title.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } };
  title.alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getRow(1).height = 30;

  worksheet.addRow([]);

  const addLine = (label: string, amount: number, bold = false, indent = 0) => {
    const row = worksheet.addRow([" ".repeat(indent * 4) + label, amount]);
    if (bold) row.font = { bold: true };
    return row;
  };

  addLine("1. OPERATING REVENUE", data.netRevenue, true);
  addLine("Gross Sales", data.grossSales, false, 1);
  addLine("Less: Discounts & Deductions", -data.discounts, false, 1);
  addLine("Net Revenue", data.netRevenue, true, 1);
  worksheet.addRow([]);

  addLine("2. COST OF GOODS SOLD (COGS)", data.totalCOGS, true);
  addLine("Raw Seafood Dockside Purchases", data.rawFishProcurementCost, false, 1);
  addLine("Freight & Transport Inward", data.transportCharges, false, 1);
  addLine("Ice Preservation Charges", data.iceCharges, false, 1);
  addLine("Direct Procurement Labour", data.labourCharges, false, 1);
  addLine("Thermocol & Packaging Materials", data.packingAndThermocolCosts, false, 1);
  addLine("Total Cost of Goods Sold", data.totalCOGS, true, 1);
  worksheet.addRow([]);

  addLine(`GROSS PROFIT (${data.grossProfitMargin}% Margin)`, data.grossProfit, true);
  worksheet.addRow([]);

  addLine("3. OPERATING EXPENSES", data.totalOperatingExpenses, true);
  data.operatingExpenses.forEach((exp) => {
    addLine(`${exp.categoryName} (${exp.percentage}%)`, exp.amount, false, 1);
  });
  addLine("Total Operating Expenses", data.totalOperatingExpenses, true, 1);
  worksheet.addRow([]);

  addLine(`NET PROFIT (${data.netProfitMargin}% Margin)`, data.netProfit, true);

  worksheet.getColumn(1).width = 45;
  worksheet.getColumn(2).width = 22;

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export async function exportBalanceSheetToExcel(data: BalanceSheetData): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Balance Sheet");

  worksheet.mergeCells("A1:C1");
  const title = worksheet.getCell("A1");
  title.value = `HPS SEA FOODS - Statement of Financial Position (As of ${formatDate(data.asOfDate)})`;
  title.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
  title.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } };
  title.alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getRow(1).height = 30;

  worksheet.addRow([]);
  worksheet.addRow([data.disclaimer]).font = { italic: true, size: 9 };
  worksheet.addRow([]);

  const addLine = (label: string, amount: number, bold = false, indent = 0) => {
    const row = worksheet.addRow([" ".repeat(indent * 4) + label, amount]);
    if (bold) row.font = { bold: true };
    return row;
  };

  addLine("ASSETS", data.assets.totalAssets, true);
  addLine("Estimated Liquid Cash & Bank Receipts", data.assets.cashAndBankEstimated, false, 1);
  addLine("Accounts Receivable (Uncollected Customer Invoices)", data.assets.accountsReceivable, false, 1);
  addLine("Cold Storage Seafood Inventory Valuation", data.assets.inventoryValuation, false, 1);
  addLine("TOTAL CURRENT ASSETS", data.assets.totalCurrentAssets, true, 1);
  addLine("TOTAL ASSETS", data.assets.totalAssets, true);
  worksheet.addRow([]);

  addLine("LIABILITIES", data.liabilities.totalLiabilities, true);
  addLine("Accounts Payable (Outstanding Supplier Liabilities)", data.liabilities.accountsPayable, false, 1);
  addLine("TOTAL CURRENT LIABILITIES", data.liabilities.totalCurrentLiabilities, true, 1);
  addLine("TOTAL LIABILITIES", data.liabilities.totalLiabilities, true);
  worksheet.addRow([]);

  addLine("OWNER'S EQUITY", data.equity.totalEquity, true);
  addLine("Retained Earnings (Cumulative Realized Net Profit)", data.equity.retainedEarnings, false, 1);
  addLine("TOTAL EQUITY", data.equity.totalEquity, true, 1);
  worksheet.addRow([]);

  addLine("TOTAL LIABILITIES & EQUITY", data.equity.totalLiabilitiesAndEquity, true);

  worksheet.getColumn(1).width = 55;
  worksheet.getColumn(2).width = 25;

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
