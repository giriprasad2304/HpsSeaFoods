import * as React from "react";
import { notFound } from "next/navigation";
import { PurchaseDetails } from "@/components/purchases/purchase-details";
import { getPurchaseById } from "@/services/purchases";

interface PurchaseDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PurchaseDetailPageProps) {
  const { id } = await params;
  const purchase = await getPurchaseById(id);
  return {
    title: purchase
      ? `${purchase.purchaseNumber} | HPS SEA FOODS`
      : "Purchase Not Found",
  };
}

export default async function PurchaseDetailPage({
  params,
}: PurchaseDetailPageProps) {
  const { id } = await params;
  const purchase = await getPurchaseById(id);

  if (!purchase) {
    notFound();
  }

  return <PurchaseDetails purchase={purchase} />;
}
