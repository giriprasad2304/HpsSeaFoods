import { NextRequest, NextResponse } from "next/server";
import { listPurchases, countPurchases, createPurchase } from "@/services/purchases";
import { getCurrentUser } from "@/lib/auth";
import type { PaymentStatus } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || undefined;
    const month = searchParams.get("month") || undefined;
    const year = searchParams.get("year") || undefined;
    const supplierId = searchParams.get("supplierId") || undefined;
    const fishTypeId = searchParams.get("fishTypeId") || undefined;
    const paymentStatusParam = searchParams.get("paymentStatus");
    const paymentStatus = paymentStatusParam
      ? (paymentStatusParam as PaymentStatus | "ALL")
      : undefined;
    const invoiceNumber = searchParams.get("invoiceNumber") || undefined;
    const search = searchParams.get("search") || undefined;
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const limit = limitParam ? parseInt(limitParam, 10) : 50;

    const filterObj = {
      date,
      month,
      year,
      supplierId,
      fishTypeId,
      paymentStatus,
      invoiceNumber,
      search,
      page,
      limit,
    };

    const [purchases, total] = await Promise.all([
      listPurchases(filterObj),
      countPurchases(filterObj),
    ]);

    return NextResponse.json({
      data: purchases,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch purchases";
    console.error("[Purchases GET Error]:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();

    const purchase = await createPurchase(body, user?.id);
    return NextResponse.json({ data: purchase }, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to create purchase";
    console.error("[Purchases POST Error]:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
