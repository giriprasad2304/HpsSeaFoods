import { NextResponse } from "next/server";
import { getExpenseLookups } from "@/services/expenses";

export async function GET() {
  try {
    const lookups = await getExpenseLookups();
    return NextResponse.json({ data: lookups });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch expense lookups";
    console.error("[Expense Lookups GET Error]:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
