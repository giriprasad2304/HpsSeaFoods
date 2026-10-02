import { NextRequest, NextResponse } from "next/server";
import { updateSaleSpoilage } from "@/services/sales";
import { getCurrentUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    const body = await request.json();

    if (!body || !Array.isArray(body.items)) {
      return NextResponse.json(
        { error: "Invalid payload: 'items' array required" },
        { status: 400 }
      );
    }

    const updated = await updateSaleSpoilage(id, body, user?.id);
    return NextResponse.json({
      data: updated,
      message: "Spoilage records updated successfully",
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to record spoilage";
    console.error("[Sale Spoilage Error]:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
