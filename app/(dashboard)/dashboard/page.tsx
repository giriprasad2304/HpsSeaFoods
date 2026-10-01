import * as React from "react";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { getDashboardData } from "@/services/dashboard";

export const metadata = {
  title: "Business Overview | HPS SEA FOODS",
  description: "Today's summary of your buying, selling, stock, and profit numbers.",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const initialData = await getDashboardData();

  return <DashboardView initialData={initialData} />;
}
