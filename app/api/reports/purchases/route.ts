import { NextRequest, NextResponse } from "next/server";
import { generatePurchaseReport } from "@/services/reports";
import { reportFilterSchema } from "@/validations/report.schema";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawParams = Object.fromEntries(searchParams.entries());
    const validated = reportFilterSchema.parse(rawParams);

    const report = await generatePurchaseReport(validated);
    return NextResponse.json(report);
  } catch (error: unknown) {
    console.error("Purchase Report API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate purchase report" },
      { status: 500 }
    );
  }
}
