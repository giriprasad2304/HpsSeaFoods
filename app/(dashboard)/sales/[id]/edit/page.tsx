import * as React from "react";
import { notFound } from "next/navigation";
import { SalesForm } from "@/components/sales/sales-form";
import { getSaleById, getCustomersAndFishTypes } from "@/services/sales";

interface EditSalePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditSalePageProps) {
  const { id } = await params;
  const sale = await getSaleById(id);
  return {
    title: sale ? `Edit ${sale.saleNumber} | HPS SEA FOODS` : "Edit Sale | HPS SEA FOODS",
  };
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditSalePage({ params }: EditSalePageProps) {
  const { id } = await params;
  const [sale, lookups] = await Promise.all([
    getSaleById(id),
    getCustomersAndFishTypes(),
  ]);

  if (!sale) {
    notFound();
  }

  return (
    <SalesForm
      customers={lookups.customers}
      fishTypes={lookups.fishTypes}
      initialData={sale}
    />
  );
}
