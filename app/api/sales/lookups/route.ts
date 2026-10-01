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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { createCustomer } = await import("@/services/sales");
    const newCustomer = await createCustomer(body);
    return NextResponse.json({ data: newCustomer }, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to create customer";
    console.error("[Customer Create Error]:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
