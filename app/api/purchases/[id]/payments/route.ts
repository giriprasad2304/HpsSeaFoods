import { NextRequest, NextResponse } from "next/server";
import { recordPurchasePayment } from "@/services/purchases";
import { getCurrentUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    const body = await request.json();

    const payment = await recordPurchasePayment(id, body, user?.id);
    return NextResponse.json({ data: payment }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to record payment";
    console.error("[Purchase Payment POST Error]:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
