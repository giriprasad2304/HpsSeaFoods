import * as React from "react";
import { notFound } from "next/navigation";
import { SaleDetails } from "@/components/sales/sale-details";
import { getSaleById } from "@/services/sales";

interface SaleDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: SaleDetailPageProps) {
  const { id } = await params;
  const sale = await getSaleById(id);
  return {
    title: sale ? `${sale.saleNumber} | HPS SEA FOODS` : "Sale Order Not Found",
  };
}

export default async function SaleDetailPage({ params }: SaleDetailPageProps) {
  const { id } = await params;
  const sale = await getSaleById(id);

  if (!sale) {
    notFound();
  }

  return <SaleDetails sale={sale} />;
}
