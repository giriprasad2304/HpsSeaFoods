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
