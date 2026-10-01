import { NextRequest, NextResponse } from "next/server";
import { createStockAdjustment, getInventoryStockSummary } from "@/services/inventory";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fishTypeId, adjustmentType, quantityKg, unitCost, batchLotNumber, storageLocation, notes } = body;

    if (!fishTypeId) {
      return NextResponse.json({ error: "Fish species is required" }, { status: 400 });
    }

    if (!quantityKg || isNaN(Number(quantityKg)) || Number(quantityKg) <= 0) {
      return NextResponse.json({ error: "Quantity must be a positive number in kg" }, { status: 400 });
    }

    if (!["ADJUSTMENT_INWARD", "ADJUSTMENT_OUTWARD", "WASTAGE_OUTWARD"].includes(adjustmentType)) {
      return NextResponse.json({ error: "Invalid adjustment type" }, { status: 400 });
    }

    const transaction = await createStockAdjustment({
      fishTypeId,
      adjustmentType,
      quantityKg: Number(quantityKg),
      unitCost: unitCost ? Number(unitCost) : undefined,
      batchLotNumber: batchLotNumber?.trim() || undefined,
      storageLocation: storageLocation?.trim() || undefined,
      notes: notes?.trim() || undefined,
    });

    const updatedSummary = await getInventoryStockSummary();

    return NextResponse.json({
      data: transaction,
      summary: updatedSummary,
      message: "Stock adjustment recorded successfully",
    }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to record stock adjustment";
    console.error("[Inventory Adjust POST Error]:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
