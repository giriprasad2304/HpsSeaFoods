import { NextRequest, NextResponse } from "next/server";
import { getExpensesList, countExpenses, createExpense } from "@/services/expenses";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const paymentMethod = searchParams.get("paymentMethod") || undefined;
    const date = searchParams.get("date") || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const month = searchParams.get("month") || undefined;
    const year = searchParams.get("year") || undefined;
    const search = searchParams.get("search") || undefined;
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const limit = limitParam ? parseInt(limitParam, 10) : 50;

    const filterObj = {
      categoryId,
      paymentMethod,
      date,
      startDate,
      endDate,
      month,
      year,
      search,
      page,
      limit,
    };

    const [expenses, total] = await Promise.all([
      getExpensesList(filterObj),
      countExpenses(filterObj),
    ]);

    return NextResponse.json({
      data: expenses,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch expenses";
    console.error("[Expenses GET Error]:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();

    const expense = await createExpense(body, user?.id);
    return NextResponse.json({ data: expense }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create expense";
    console.error("[Expenses POST Error]:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
