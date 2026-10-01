import { NextResponse } from "next/server";
import { getProfitLossDashboard } from "@/services/profit-loss";
import type { ProfitLossDateFilter, ProfitLossPeriod } from "@/types/report";

const VALID_PERIODS: ProfitLossPeriod[] = [
  "today",
  "this_week",
  "this_month",
  "this_quarter",
  "this_year",
  "custom",
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get("period") || "this_month") as ProfitLossPeriod;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    if (!VALID_PERIODS.includes(period)) {
      return NextResponse.json(
        { error: `Invalid period. Must be one of: ${VALID_PERIODS.join(", ")}` },
        { status: 400 }
      );
    }

    const filter: ProfitLossDateFilter = { period, startDate, endDate };
    const data = await getProfitLossDashboard(filter);

    return NextResponse.json(data);
  } catch (error) {
    console.error("P&L API error:", error);
    return NextResponse.json(
      { error: "Failed to generate profit & loss report" },
      { status: 500 }
    );
  }
}
