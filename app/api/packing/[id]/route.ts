import { NextRequest, NextResponse } from "next/server";
import { deletePackingCalculation } from "@/services/packing";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    const success = await deletePackingCalculation(id, user?.id);

    if (!success) {
      return NextResponse.json({ error: "Packing calculation not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete packing calculation";
    console.error("[Packing DELETE Error]:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
