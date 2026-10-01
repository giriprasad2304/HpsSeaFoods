import { NextRequest, NextResponse } from "next/server";
import {
  generateSalesReport,
  generatePurchaseReport,
  generateExpenseReport,
  generateOutstandingReport,
  generateProfitLossStatementReport,
  generateBalanceSheetReport,
  exportSalesToExcel,
  exportPurchasesToExcel,
  exportExpensesToExcel,
  exportOutstandingToExcel,
  exportProfitLossToExcel,
  exportBalanceSheetToExcel,
} from "@/services/reports";
import { reportFilterSchema } from "@/validations/report.schema";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get("reportType");
    const rawParams = Object.fromEntries(searchParams.entries());
    const filters = reportFilterSchema.parse(rawParams);

    let buffer: Buffer;
    let filename = `hps-report-${Date.now()}.xlsx`;

    switch (reportType) {
      case "sales": {
        const data = await generateSalesReport(filters);
        buffer = await exportSalesToExcel(data);
        filename = `hps-sales-report-${Date.now()}.xlsx`;
        break;
      }
      case "purchases": {
        const data = await generatePurchaseReport(filters);
        buffer = await exportPurchasesToExcel(data);
        filename = `hps-purchase-report-${Date.now()}.xlsx`;
        break;
      }
      case "expenses": {
        const data = await generateExpenseReport(filters);
        buffer = await exportExpensesToExcel(data);
        filename = `hps-expenses-report-${Date.now()}.xlsx`;
        break;
      }
      case "outstanding": {
        const data = await generateOutstandingReport(filters);
        buffer = await exportOutstandingToExcel(data);
        filename = `hps-outstanding-report-${Date.now()}.xlsx`;
        break;
      }
      case "profit-loss": {
        const data = await generateProfitLossStatementReport(filters);
        buffer = await exportProfitLossToExcel(data);
        filename = `hps-profit-loss-statement-${Date.now()}.xlsx`;
        break;
      }
      case "balance-sheet": {
        const data = await generateBalanceSheetReport(filters);
        buffer = await exportBalanceSheetToExcel(data);
        filename = `hps-balance-sheet-${Date.now()}.xlsx`;
        break;
      }
      default:
        return NextResponse.json(
          { error: "Invalid reportType. Supported: sales, purchases, expenses, outstanding, profit-loss, balance-sheet" },
          { status: 400 }
        );
    }

    return new Response(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: unknown) {
    console.error("Excel Export API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to export Excel report" },
      { status: 500 }
    );
  }
}
