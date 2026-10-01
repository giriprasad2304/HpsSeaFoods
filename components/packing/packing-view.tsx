"use client";

import * as React from "react";
import { PackingCalculator } from "./packing-calculator";
import { PackingHistoryTable } from "./packing-history-table";
import type { PackingCostDTO } from "@/types";

interface PackingViewProps {
  initialRecords: PackingCostDTO[];
}

export function PackingView({ initialRecords }: PackingViewProps) {
  const [records, setRecords] = React.useState<PackingCostDTO[]>(initialRecords);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const handleCalculationSaved = (saved: PackingCostDTO) => {
    setRecords((prev) => [saved, ...prev]);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this packing calculation?")) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/packing/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setRecords((prev) => prev.filter((r) => r.id !== id));
      } else {
        const json = await res.json();
        alert(json.error || "Failed to delete packing calculation");
      }
    } catch (err) {
      console.error("Delete packing calculation error:", err);
      alert("Failed to delete. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Interactive Calculator */}
      <PackingCalculator onCalculationSaved={handleCalculationSaved} />

      {/* History Table */}
      <PackingHistoryTable
        records={records}
        onDelete={handleDelete}
        isDeleting={deletingId}
      />
    </div>
  );
}
