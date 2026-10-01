import { NextRequest, NextResponse } from "next/server";
import { getExpenseById, deleteExpense } from "@/services/expenses";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const expense = await getExpenseById(id);

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json({ data: expense });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch expense";
    console.error("[Expense GET ID Error]:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    const success = await deleteExpense(id, user?.id);

    if (!success) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete expense";
    console.error("[Expense DELETE Error]:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
