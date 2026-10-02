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
  Plus,
  Fish,
  Sparkles,
  Tag,
  Shield,
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
  const [speciesList, setSpeciesList] = React.useState<InventoryStockSummaryDTO[]>(items);
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

  // Quick Add Species State
  const [showAddSpecies, setShowAddSpecies] = React.useState(false);
  const [isCreatingSpecies, setIsCreatingSpecies] = React.useState(false);
  const [speciesError, setSpeciesError] = React.useState<string | null>(null);
  const [newSpeciesData, setNewSpeciesData] = React.useState({
    name: "",
    code: "",
    category: "Pelagic",
    grade: "Grade A",
    scientificName: "",
    description: "",
  });

  // Sync species list when items prop updates
  React.useEffect(() => {
    setSpeciesList((prev) => {
      // Merge items ensuring any locally added species persist
      const map = new Map<string, InventoryStockSummaryDTO>();
      prev.forEach((p) => map.set(p.fishTypeId, p));
      items.forEach((item) => map.set(item.fishTypeId, item));
      return Array.from(map.values());
    });
  }, [items]);

  // Initialize selected species when dialog opens or selectedFishTypeId changes
  React.useEffect(() => {
    if (open) {
      setError(null);
      setSuccessMsg(null);
      setSpeciesError(null);
      const targetId = selectedFishTypeId || items[0]?.fishTypeId || speciesList[0]?.fishTypeId || "";
      setFishTypeId(targetId);

      const found = (speciesList.length ? speciesList : items).find((i) => i.fishTypeId === targetId);
      if (found) {
        setUnitCost(found.averageCostPerKg ? found.averageCostPerKg.toFixed(2) : "");
      }
      setBatchLotNumber(`LOT-ADJ-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}`);
    }
  }, [open, selectedFishTypeId, items, speciesList]);

  const selectedFish = React.useMemo(() => {
    return speciesList.find((i) => i.fishTypeId === fishTypeId);
  }, [speciesList, fishTypeId]);

  const handleFishChange = (newId: string) => {
    setFishTypeId(newId);
    const found = speciesList.find((i) => i.fishTypeId === newId);
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

  // Handle Quick Add Fish Species submission
  const handleCreateSpecies = async (e: React.FormEvent) => {
    e.preventDefault();
    setSpeciesError(null);

    if (!newSpeciesData.name.trim()) {
      setSpeciesError("Species name is required");
      return;
    }

    setIsCreatingSpecies(true);

    try {
      const res = await fetch("/api/inventory/fish-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSpeciesData),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to create species");
      }

      const created: InventoryStockSummaryDTO = json.data;
      setSpeciesList((prev) => [created, ...prev.filter((p) => p.fishTypeId !== created.fishTypeId)]);
      setFishTypeId(created.fishTypeId);
      setAdjustmentType("ADJUSTMENT_INWARD");
      setShowAddSpecies(false);
      setSuccessMsg(`Species "${created.name}" created and selected for adjustment.`);

      // Reset new species form
      setNewSpeciesData({
        name: "",
        code: "",
        category: "Pelagic",
        grade: "Grade A",
        scientificName: "",
        description: "",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add species";
      setSpeciesError(msg);
    } finally {
      setIsCreatingSpecies(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!fishTypeId) {
      setError("Please select a fish species or add a new one.");
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

  const speciesOptions = speciesList.map((i) => ({
    id: i.fishTypeId,
    name: `${i.name} (${formatWeight(i.currentStockKg)} in stock)`,
  }));

  const locationOptions = [
    { id: "Cold Storage A", name: "Cold Storage A (Main Facility)" },
    { id: "Cold Storage B", name: "Cold Storage B (Secondary Room)" },
    { id: "Blast Freezer Room 1", name: "Blast Freezer Room 1 (-35°C)" },
    { id: "Processing Holding Hold", name: "Processing Holding Hold" },
  ];

  return (
    <>
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
            {/* Species Selector with Quick Add Option */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-foreground">
                  Fish Variety / Species <span className="text-destructive">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddSpecies(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors py-0.5 px-1.5 rounded hover:bg-primary/10"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add New Species
                </button>
              </div>

              <Select
                value={fishTypeId}
                onChange={(e) => handleFishChange(e.target.value)}
                options={speciesOptions}
                placeholder={speciesOptions.length > 0 ? "Select species..." : "No species found — click Add New Species"}
                className="w-full text-xs h-9"
              />

              {selectedFish && (
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground bg-muted/40 rounded px-2.5 py-1 border border-border">
                  <span>
                    Current Stock: <strong className="text-foreground">{formatWeight(currentStock)}</strong>
                  </span>
                  <span>
                    Avg Valuation: <strong className="text-foreground">{formatCurrency(selectedFish.averageCostPerKg)}/kg</strong>
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
                  placeholder="LOT-ADJ-20261002"
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

      {/* Quick Add Fish Species Modal */}
      <Dialog open={showAddSpecies} onOpenChange={setShowAddSpecies}>
        <form onSubmit={handleCreateSpecies} className="space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Fish className="h-4 w-4" />
              </div>
              <DialogTitle className="text-sm">Add New Fish Species</DialogTitle>
            </div>
            <DialogDescription className="text-xs">
              Register a new fish or seafood variety in your master catalog.
            </DialogDescription>
          </DialogHeader>

          {speciesError && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-2.5 text-xs font-medium text-destructive border border-destructive/20">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{speciesError}</span>
            </div>
          )}

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                  <Fish className="h-3 w-3 text-muted-foreground" /> Common Name <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Tiger Prawns / Seer Fish"
                  value={newSpeciesData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const autoCode = name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase();
                    setNewSpeciesData((prev) => ({
                      ...prev,
                      name,
                      code: prev.code && !prev.code.startsWith("FISH-") ? prev.code : autoCode ? `FISH-${autoCode}` : "",
                    }));
                  }}
                  className="h-8.5 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                  <Tag className="h-3 w-3 text-muted-foreground" /> Species Code
                </label>
                <Input
                  type="text"
                  placeholder="e.g. FISH-TPW"
                  value={newSpeciesData.code}
                  onChange={(e) => setNewSpeciesData({ ...newSpeciesData, code: e.target.value })}
                  className="h-8.5 text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-muted-foreground" /> Category
                </label>
                <Select
                  value={newSpeciesData.category}
                  onChange={(e) => setNewSpeciesData({ ...newSpeciesData, category: e.target.value })}
                  options={[
                    { id: "Pelagic", name: "Pelagic (Seer, Tuna, Mackerel)" },
                    { id: "Freshwater", name: "Freshwater (Rohu, Katla)" },
                    { id: "Crustacean", name: "Crustacean (Prawns, Crab, Lobster)" },
                    { id: "Demersal", name: "Demersal (Pomfret, Snapper, Grouper)" },
                    { id: "Cephalopod", name: "Cephalopod (Squid, Cuttlefish, Octopus)" },
                    { id: "Other", name: "Other Marine Species" },
                  ]}
                  className="w-full text-xs h-8.5"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                  <Shield className="h-3 w-3 text-muted-foreground" /> Default Grade
                </label>
                <Select
                  value={newSpeciesData.grade}
                  onChange={(e) => setNewSpeciesData({ ...newSpeciesData, grade: e.target.value })}
                  options={[
                    { id: "Grade A", name: "Grade A (Prime)" },
                    { id: "Grade AAA Export", name: "Grade AAA (Export Quality)" },
                    { id: "Grade B", name: "Grade B (Standard)" },
                    { id: "Grade C", name: "Grade C (Processing)" },
                  ]}
                  className="w-full text-xs h-8.5"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-foreground">
                Scientific Name (Optional)
              </label>
              <Input
                type="text"
                placeholder="e.g. Penaeus monodon / Scomberomorus commerson"
                value={newSpeciesData.scientificName}
                onChange={(e) => setNewSpeciesData({ ...newSpeciesData, scientificName: e.target.value })}
                className="h-8.5 text-xs italic"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddSpecies(false)}
              disabled={isCreatingSpecies}
              className="text-xs h-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isCreatingSpecies || !newSpeciesData.name.trim()}
              className="text-xs h-8 gap-1.5"
            >
              {isCreatingSpecies && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save Species & Select
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </>
  );
}

