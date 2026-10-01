"use client";

import * as React from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatCurrency, formatWeight } from "@/lib/utils";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Warehouse,
} from "lucide-react";
import type { InventoryStockSummaryDTO } from "@/types";

interface StockAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: InventoryStockSummaryDTO[];
  selectedFishTypeId?: string;
  onSuccess?: (updatedItems?: InventoryStockSummaryDTO[]) => void;
}

export function StockAdjustmentDialog({
  open,
  onOpenChange,
  items,
  selectedFishTypeId,
  onSuccess,
}: StockAdjustmentDialogProps) {
  const [fishTypeId, setFishTypeId] = React.useState<string>("");
  const [adjustmentType, setAdjustmentType] = React.useState<
    "ADJUSTMENT_INWARD" | "ADJUSTMENT_OUTWARD" | "WASTAGE_OUTWARD"
  >("ADJUSTMENT_INWARD");
  const [quantityKg, setQuantityKg] = React.useState<string>("");
  const [unitCost, setUnitCost] = React.useState<string>("");
  const [storageLocation, setStorageLocation] = React.useState<string>("Cold Storage A");
  const [batchLotNumber, setBatchLotNumber] = React.useState<string>("");
  const [notes, setNotes] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  // Initialize selected species when dialog opens or selectedFishTypeId changes
  React.useEffect(() => {
    if (open) {
      setError(null);
      setSuccessMsg(null);
      const targetId = selectedFishTypeId || items[0]?.fishTypeId || "";
      setFishTypeId(targetId);

      const found = items.find((i) => i.fishTypeId === targetId);
      if (found) {
        setUnitCost(found.averageCostPerKg ? found.averageCostPerKg.toFixed(2) : "");
      }
      setBatchLotNumber(`LOT-ADJ-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}`);
    }
  }, [open, selectedFishTypeId, items]);

  const selectedFish = React.useMemo(() => {
    return items.find((i) => i.fishTypeId === fishTypeId);
  }, [items, fishTypeId]);

  const handleFishChange = (newId: string) => {
    setFishTypeId(newId);
    const found = items.find((i) => i.fishTypeId === newId);
    if (found && !unitCost) {
      setUnitCost(found.averageCostPerKg ? found.averageCostPerKg.toFixed(2) : "");
    }
  };

  const currentStock = selectedFish?.currentStockKg ?? 0;
  const numQty = parseFloat(quantityKg) || 0;
  const projectedStock =
    adjustmentType === "ADJUSTMENT_INWARD"
      ? currentStock + numQty
      : currentStock - numQty;

  const isDeduction = adjustmentType !== "ADJUSTMENT_INWARD";
  const wouldGoNegative = isDeduction && projectedStock < 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!fishTypeId) {
      setError("Please select a fish species.");
      return;
    }

    if (!quantityKg || numQty <= 0) {
      setError("Please enter a valid positive quantity in kg.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fishTypeId,
          adjustmentType,
          quantityKg: numQty,
          unitCost: unitCost ? parseFloat(unitCost) : undefined,
          storageLocation,
          batchLotNumber,
          notes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save stock adjustment");
      }

      setSuccessMsg("Stock adjustment saved successfully!");
      setQuantityKg("");
      setNotes("");

      if (onSuccess) {
        onSuccess(result.summary);
      }

      setTimeout(() => {
        onOpenChange(false);
      }, 700);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving adjustment";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const speciesOptions = items.map((i) => ({
    id: i.fishTypeId,
    name: `${i.name} (${formatWeight(i.currentStockKg)} available)`,
  }));

  const locationOptions = [
    { id: "Cold Storage A", name: "Cold Storage A (Visakhapatnam Main)" },
    { id: "Cold Storage B", name: "Cold Storage B (Secondary Room)" },
    { id: "Blast Freezer Room 1", name: "Blast Freezer Room 1 (-35°C)" },
    { id: "Processing Holding Hold", name: "Processing Holding Hold" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Warehouse className="h-4 w-4 text-primary" />
            <DialogTitle>Cold Storage Stock Adjustment</DialogTitle>
          </div>
          <DialogDescription>
            Record physical inventory count reconciliations, inbound adjustments, trimming losses, or spoilage wastage.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-md bg-destructive/10 p-2.5 text-xs font-medium text-destructive border border-destructive/20">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-md bg-emerald-500/10 p-2.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="space-y-4 text-xs">
          {/* Species Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-foreground mb-1">
              Fish Variety / Species <span className="text-destructive">*</span>
            </label>
            <Select
              value={fishTypeId}
              onChange={(e) => handleFishChange(e.target.value)}
              options={speciesOptions}
              placeholder="Select species..."
              className="w-full text-xs h-9"
            />
            {selectedFish && (
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground bg-muted/40 rounded px-2.5 py-1 border border-border">
                <span>
                  Current Stock: <strong className="text-foreground">{formatWeight(currentStock)}</strong>
                </span>
                <span>
                  Avg Purchase Cost: <strong className="text-foreground">{formatCurrency(selectedFish.averageCostPerKg)}/kg</strong>
                </span>
              </div>
            )}
          </div>

          {/* Adjustment Type Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-foreground mb-1">
              Adjustment Type <span className="text-destructive">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAdjustmentType("ADJUSTMENT_INWARD")}
                className={`flex flex-col items-center justify-center p-2 rounded-md border text-center transition-all ${
                  adjustmentType === "ADJUSTMENT_INWARD"
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-semibold shadow-xs"
                    : "border-border hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <ArrowUpCircle className="h-4 w-4 mb-1 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[11px]">Inward (+)</span>
                <span className="text-[9px] text-muted-foreground">Found / Surplus</span>
              </button>

              <button
                type="button"
                onClick={() => setAdjustmentType("ADJUSTMENT_OUTWARD")}
                className={`flex flex-col items-center justify-center p-2 rounded-md border text-center transition-all ${
                  adjustmentType === "ADJUSTMENT_OUTWARD"
                    ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 font-semibold shadow-xs"
                    : "border-border hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <ArrowDownCircle className="h-4 w-4 mb-1 text-amber-600 dark:text-amber-400" />
                <span className="text-[11px]">Outward (-)</span>
                <span className="text-[9px] text-muted-foreground">Count / Trimming</span>
              </button>

              <button
                type="button"
                onClick={() => setAdjustmentType("WASTAGE_OUTWARD")}
                className={`flex flex-col items-center justify-center p-2 rounded-md border text-center transition-all ${
                  adjustmentType === "WASTAGE_OUTWARD"
                    ? "border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 font-semibold shadow-xs"
                    : "border-border hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <AlertTriangle className="h-4 w-4 mb-1 text-rose-600 dark:text-rose-400" />
                <span className="text-[11px]">Wastage (-)</span>
                <span className="text-[9px] text-muted-foreground">Spoilage / Loss</span>
              </button>
            </div>
          </div>

          {/* Quantity and Unit Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-foreground mb-1">
                Quantity (kg) <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="e.g. 50"
                value={quantityKg}
                onChange={(e) => setQuantityKg(e.target.value)}
                className="h-9 text-xs"
                required
              />
              {numQty > 0 && (
                <p className={`mt-1 text-[10px] ${wouldGoNegative ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                  Projected Stock: <strong>{formatWeight(projectedStock)}</strong>
                  {wouldGoNegative && " (Warning: Exceeds stock!)"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-foreground mb-1">
                Valuation Rate (₹/kg)
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="e.g. 280"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                className="h-9 text-xs"
              />
              {numQty > 0 && parseFloat(unitCost) > 0 && (
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Impact Value: <strong>{formatCurrency(numQty * parseFloat(unitCost))}</strong>
                </p>
              )}
            </div>
          </div>

          {/* Storage Location & Batch Lot Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-foreground mb-1">
                Storage Location
              </label>
              <Select
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                options={locationOptions}
                className="w-full text-xs h-9"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-foreground mb-1">
                Batch / Lot # (Optional)
              </label>
              <Input
                type="text"
                placeholder="LOT-ADJ-20260929"
                value={batchLotNumber}
                onChange={(e) => setBatchLotNumber(e.target.value)}
                className="h-9 text-xs font-mono"
              />
            </div>
          </div>

          {/* Notes / Reason */}
          <div>
            <label className="block text-[11px] font-semibold text-foreground mb-1">
              Adjustment Reason / Remarks
            </label>
            <Input
              type="text"
              placeholder="e.g. Monthly physical stock audit reconciliation, blast freeze moisture delta"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="text-xs h-8"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isLoading || !fishTypeId || numQty <= 0}
            className="gap-1.5 text-xs h-8"
          >
            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Save Adjustment
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
