import { NextResponse } from "next/server";
import { getExpenseCategories } from "@/services/expenses";

export async function GET() {
  try {
    const categories = await getExpenseCategories();
    return NextResponse.json({ data: { categories } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch categories";
    console.error("[Expense Lookups GET Error]:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
