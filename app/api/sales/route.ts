import { NextRequest, NextResponse } from "next/server";
import { listSales, countSales, createSale } from "@/services/sales";
import { getCurrentUser } from "@/lib/auth";
import type { PaymentStatus, SaleStatus } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || undefined;
    const month = searchParams.get("month") || undefined;
    const year = searchParams.get("year") || undefined;
    const customerId = searchParams.get("customerId") || undefined;
    const fishTypeId = searchParams.get("fishTypeId") || undefined;
    const paymentStatusParam = searchParams.get("paymentStatus");
    const paymentStatus = paymentStatusParam
      ? (paymentStatusParam as PaymentStatus | "ALL")
      : undefined;
    const deliveryStatusParam = searchParams.get("deliveryStatus");
    const deliveryStatus = deliveryStatusParam
      ? (deliveryStatusParam as SaleStatus | "ALL")
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
      customerId,
      fishTypeId,
      paymentStatus,
      deliveryStatus,
      invoiceNumber,
      search,
      page,
      limit,
    };

    const [sales, total] = await Promise.all([
      listSales(filterObj),
      countSales(filterObj),
    ]);

    return NextResponse.json({
      data: sales,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch sales";
    console.error("[Sales GET Error]:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();

    const sale = await createSale(body, user?.id);
    return NextResponse.json({ data: sale }, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to create sale";
    console.error("[Sales POST Error]:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
