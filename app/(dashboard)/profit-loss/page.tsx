import * as React from "react";
import { ProfitLossView } from "@/components/profit-loss/profit-loss-view";
import { getProfitLossDashboard } from "@/services/profit-loss";

export const metadata = {
  title: "Profit & Loss | HPS SEA FOODS",
  description: "See how much money you're making or losing across sales, purchases, and expenses.",
};

export const dynamic = "force-dynamic";

export default async function ProfitLossPage() {
  const initialData = await getProfitLossDashboard({ period: "this_month" });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Profit & Loss
          </h1>
          <p className="text-xs text-muted-foreground">
            See how much money you&apos;re making or losing
          </p>
        </div>
      </div>

      <ProfitLossView initialData={initialData} />
    </div>
  );
}
