import * as React from "react";
import { notFound } from "next/navigation";
import { PurchaseForm } from "@/components/purchases/purchase-form";
import { getPurchaseById, getSuppliersAndFishTypes } from "@/services/purchases";

interface EditPurchasePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditPurchasePageProps) {
  const { id } = await params;
  const purchase = await getPurchaseById(id);
  return {
    title: purchase ? `Edit ${purchase.purchaseNumber} | HPS SEA FOODS` : "Edit Purchase | HPS SEA FOODS",
  };
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditPurchasePage({ params }: EditPurchasePageProps) {
  const { id } = await params;
  const [purchase, lookups] = await Promise.all([
    getPurchaseById(id),
    getSuppliersAndFishTypes(),
  ]);

  if (!purchase) {
    notFound();
  }

  return (
    <PurchaseForm
      suppliers={lookups.suppliers}
      fishTypes={lookups.fishTypes}
      initialData={purchase}
    />
  );
}
