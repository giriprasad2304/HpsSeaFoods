import { NextRequest, NextResponse } from "next/server";
import { generateSalesReport } from "@/services/reports";
import { reportFilterSchema } from "@/validations/report.schema";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawParams = Object.fromEntries(searchParams.entries());
    const validated = reportFilterSchema.parse(rawParams);

    const report = await generateSalesReport(validated);
    return NextResponse.json(report);
  } catch (error: unknown) {
    console.error("Sales Report API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate sales report" },
      { status: 500 }
    );
  }
}
