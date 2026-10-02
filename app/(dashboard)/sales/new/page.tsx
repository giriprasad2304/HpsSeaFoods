import * as React from "react";
import { SalesForm } from "@/components/sales/sales-form";
import { getCustomersAndFishTypes } from "@/services/sales";

export const metadata = {
  title: "New Sale | HPS SEA FOODS",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NewSalePage() {
  const lookups = await getCustomersAndFishTypes();

  return (
    <SalesForm
      customers={lookups.customers}
      fishTypes={lookups.fishTypes}
    />
  );
}
