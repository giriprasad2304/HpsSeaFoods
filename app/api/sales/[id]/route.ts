import { NextRequest, NextResponse } from "next/server";
import { getSaleById, updateSale, deleteSale } from "@/services/sales";
import { getCurrentUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const sale = await getSaleById(id);

    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    return NextResponse.json({ data: sale });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch sale";
    console.error("[Sale GET Error]:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    const body = await request.json();

    const updated = await updateSale(id, body, user?.id);
    return NextResponse.json({ data: updated });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to update sale";
    console.error("[Sale PATCH Error]:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    await deleteSale(id, user?.id);
    return NextResponse.json({ data: { success: true } });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to delete sale";
    console.error("[Sale DELETE Error]:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
