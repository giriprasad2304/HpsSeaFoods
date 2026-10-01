import { NextResponse } from "next/server";
import { getCustomersAndFishTypes } from "@/services/sales";

export async function GET() {
  try {
    const lookups = await getCustomersAndFishTypes();
    return NextResponse.json({ data: lookups });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch sales lookups";
    console.error("[Sales Lookups GET Error]:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
