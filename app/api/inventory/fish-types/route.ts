import { NextRequest, NextResponse } from "next/server";
import { createFishType } from "@/services/inventory";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const fishTypes = await prisma.fishType.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ data: fishTypes });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch fish species";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, code, category, grade, scientificName, description } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Fish species name is required" }, { status: 400 });
    }

    const newFishType = await createFishType({
      name,
      code,
      category,
      grade,
      scientificName,
      description,
    });

    return NextResponse.json({
      success: true,
      data: newFishType,
      message: `Species "${newFishType.name}" added successfully`,
    }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create fish species";
    console.error("[Create Fish Type POST Error]:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
