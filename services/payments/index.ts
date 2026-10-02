import { prisma } from "@/lib/prisma";
import type { PaymentMethod, PaymentType } from "@/types";

export interface PaymentRecordDTO {
  id: string;
  paymentNumber: string;
  paymentType: PaymentType;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  referenceNumber?: string | null;
  partyName: string;
}

export async function getPaymentsList(limit = 20): Promise<PaymentRecordDTO[]> {
  try {
    const payments = await prisma.payment.findMany({
      take: limit,
      orderBy: { paymentDate: "desc" },
      include: {
        customer: true,
        supplier: true,
      },
    });

    return payments.map((p) => ({
      id: p.id,
      paymentNumber: p.paymentNumber,
      paymentType: p.paymentType,
      amount: p.amount,
      paymentMethod: p.paymentMethod,
      paymentDate: p.paymentDate.toISOString(),
      referenceNumber: p.referenceNumber,
      partyName: p.customer?.name ?? p.supplier?.name ?? "General Payment",
    }));
  } catch (error) {
    console.error("Failed to fetch payments list:", error);
    return [];
  }
}
