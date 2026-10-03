import { NextRequest, NextResponse } from "next/server";
import { getExpenseCategories, createExpenseCategory } from "@/services/expenses";

export async function GET() {
  try {
    const categories = await getExpenseCategories();
    return NextResponse.json({ data: categories });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch expense categories";
    console.error("[Expense Categories GET Error]:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, code, description } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const category = await createExpenseCategory({
      name,
      code,
      description,
    });

    return NextResponse.json({
      success: true,
      data: category,
      message: `Category "${category.name}" created successfully`,
    }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create expense category";
    console.error("[Expense Categories POST Error]:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
