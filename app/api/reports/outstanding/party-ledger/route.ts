import { NextRequest, NextResponse } from "next/server";
import { getSupplierLedger, getCustomerLedger } from "@/services/reports/party-ledger";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partyType = searchParams.get("type")?.toUpperCase();
    const partyId = searchParams.get("id");

    if (!partyId) {
      return NextResponse.json(
        { error: "Missing required query parameter: id" },
        { status: 400 }
      );
    }

    if (partyType === "SUPPLIER") {
      const ledger = await getSupplierLedger(partyId);
      if (!ledger) {
        return NextResponse.json(
          { error: "Supplier not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(ledger);
    } else if (partyType === "CUSTOMER") {
      const ledger = await getCustomerLedger(partyId);
      if (!ledger) {
        return NextResponse.json(
          { error: "Customer not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(ledger);
    } else {
      return NextResponse.json(
        { error: "Invalid party type. Must be SUPPLIER or CUSTOMER." },
        { status: 400 }
      );
    }
  } catch (error: unknown) {
    console.error("Party Ledger API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load party ledger" },
      { status: 500 }
    );
  }
}
