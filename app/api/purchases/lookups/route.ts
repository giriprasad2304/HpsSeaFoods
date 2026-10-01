import { NextResponse } from "next/server";
import { getSuppliersAndFishTypes } from "@/services/purchases";

export async function GET() {
  try {
    const lookups = await getSuppliersAndFishTypes();
    return NextResponse.json({ data: lookups });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch lookups";
    console.error("[Lookups GET Error]:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { createSupplier } = await import("@/services/purchases");
    const newSupplier = await createSupplier(body);
    return NextResponse.json({ data: newSupplier }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create supplier";
    console.error("[Supplier Create Error]:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
