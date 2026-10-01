import { NextRequest, NextResponse } from "next/server";
import { getPackingCostsList, savePackingCalculation } from "@/services/packing";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 50;

    const records = await getPackingCostsList(limit);
    return NextResponse.json({ data: records });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch packing costs";
    console.error("[Packing Costs GET Error]:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();

    const record = await savePackingCalculation(body, user?.id);
    return NextResponse.json({ data: record }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to save packing calculation";
    console.error("[Packing Calculation POST Error]:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
