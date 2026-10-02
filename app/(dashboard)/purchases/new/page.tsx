import * as React from "react";
import { PurchaseForm } from "@/components/purchases/purchase-form";
import { getSuppliersAndFishTypes } from "@/services/purchases";

export const metadata = {
  title: "New Purchase | HPS SEA FOODS",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NewPurchasePage() {
  const lookups = await getSuppliersAndFishTypes();

  return (
    <PurchaseForm
      suppliers={lookups.suppliers}
      fishTypes={lookups.fishTypes}
    />
  );
}
