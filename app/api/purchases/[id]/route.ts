import { NextRequest, NextResponse } from "next/server";
import { getPurchaseById, updatePurchase, deletePurchase } from "@/services/purchases";
import { getCurrentUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const purchase = await getPurchaseById(id);

    if (!purchase) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: purchase });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch purchase";
    console.error("[Purchase GET Error]:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    const body = await request.json();

    const updated = await updatePurchase(id, body, user?.id);
    return NextResponse.json({ data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update purchase";
    console.error("[Purchase PATCH Error]:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    await deletePurchase(id, user?.id);
    return NextResponse.json({ data: { success: true } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete purchase";
    console.error("[Purchase DELETE Error]:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
