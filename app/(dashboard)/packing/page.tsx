import * as React from "react";
import { PackingHeader } from "@/components/packing/packing-header";
import { PackingView } from "@/components/packing/packing-view";
import { getPackingCostsList } from "@/services/packing";

export const metadata = {
  title: "Packing Cost | HPS SEA FOODS",
  description: "Calculate how much it costs to pack each kg of fish.",
};

export const dynamic = "force-dynamic";

export default async function PackingPage() {
  const records = await getPackingCostsList(50);

  return (
    <div className="space-y-6">
      <PackingHeader totalCount={records.length} />
      <PackingView initialRecords={records} />
    </div>
  );
}
