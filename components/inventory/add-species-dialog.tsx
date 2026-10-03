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
import {
  Fish,
  Sparkles,
  Tag,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Layers,
  PackagePlus,
  Warehouse,
} from "lucide-react";
import type { InventoryStockSummaryDTO, FishTypeDTO } from "@/types";

interface AddSpeciesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (createdSpecies: InventoryStockSummaryDTO & FishTypeDTO) => void;
}

const COMMON_SPECIES_SUGGESTIONS = [
  "Yellowfin Tuna",
  "King Fish / Surmai",
  "Silver Pomfret",
  "Black Pomfret",
  "Tiger Prawns (Jumbo)",
  "White Prawns",
  "Squid / Calamari",
  "Octopus",
  "Red Snapper",
  "Cobia (Modha)",
  "Indian Mackerel",
  "Sardines",
  "Barramundi / Bhetki",
  "Grouper / Reef Cod",
  "Ribbon Fish",
  "Mud Crab",
  "Blue Crab",
  "Seabream",
];

const CATEGORIES = [
  { value: "Pelagic", label: "Pelagic (Surface / Midwater Fish)" },
  { value: "Demersal", label: "Demersal (Deep Sea / Bottom Fish)" },
  { value: "Crustacean", label: "Crustacean (Prawns, Shrimps, Crabs, Lobsters)" },
  { value: "Cephalopod", label: "Cephalopod (Squid, Cuttlefish, Octopus)" },
  { value: "Freshwater", label: "Freshwater / Brackish Aquaculture" },
  { value: "Shellfish", label: "Shellfish / Bivalves (Oysters, Clams)" },
  { value: "Other", label: "Other Exotic / Specialty Seafood" },
];

const QUALITY_GRADES = [
  { value: "Grade AAA Export", label: "Grade AAA Export (Highest Sashimi / EU Standard)" },
  { value: "Grade AA Premium", label: "Grade AA Premium (Top Commercial Export)" },
  { value: "Grade A Standard", label: "Grade A Standard (Fresh Table Fish)" },
  { value: "Grade B Commercial", label: "Grade B Commercial (Domestic / Processing)" },
  { value: "Local Market", label: "Local Market Grade" },
];

export function AddSpeciesDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddSpeciesDialogProps) {
  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState("");
  const [category, setCategory] = React.useState("Pelagic");
  const [grade, setGrade] = React.useState("Grade A Standard");
  const [scientificName, setScientificName] = React.useState("");
  const [description, setDescription] = React.useState("");

  // Optional initial stock
  const [includeInitialStock, setIncludeInitialStock] = React.useState(false);
  const [initialStockKg, setInitialStockKg] = React.useState("");
  const [initialCostPerKg, setInitialCostPerKg] = React.useState("");
  const [storageLocation, setStorageLocation] = React.useState("Cold Storage A");

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  // Auto-generate code preview when name changes if user hasn't typed custom code
  const handleNameChange = (val: string) => {
    setName(val);
    if (!code || code.startsWith("FISH-")) {
      const clean = val.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase();
      if (clean) {
        setCode(`FISH-${clean}`);
      }
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    handleNameChange(suggestion);
    if (suggestion.toLowerCase().includes("prawn") || suggestion.toLowerCase().includes("crab")) {
      setCategory("Crustacean");
    } else if (suggestion.toLowerCase().includes("squid") || suggestion.toLowerCase().includes("octopus")) {
      setCategory("Cephalopod");
    } else if (suggestion.toLowerCase().includes("snapper") || suggestion.toLowerCase().includes("grouper")) {
      setCategory("Demersal");
    } else {
      setCategory("Pelagic");
    }
  };

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setError(null);
      setSuccessMsg(null);
    } else {
      setTimeout(() => {
        setName("");
        setCode("");
        setCategory("Pelagic");
        setGrade("Grade A Standard");
        setScientificName("");
        setDescription("");
        setIncludeInitialStock(false);
        setInitialStockKg("");
        setInitialCostPerKg("");
        setStorageLocation("Cold Storage A");
        setError(null);
        setSuccessMsg(null);
      }, 200);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Please enter the fish species name.");
      return;
    }

    let parsedStock = 0;
    let parsedCost = 0;
    if (includeInitialStock) {
      parsedStock = parseFloat(initialStockKg);
      if (isNaN(parsedStock) || parsedStock < 0) {
        setError("Please enter a valid positive initial stock weight (kg).");
        return;
      }
      parsedCost = parseFloat(initialCostPerKg);
      if (initialCostPerKg && (isNaN(parsedCost) || parsedCost < 0)) {
        setError("Please enter a valid cost per kg.");
        return;
      }
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/inventory/fish-types", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          code: code.trim() || undefined,
          category,
          grade,
          scientificName: scientificName.trim() || undefined,
          description: description.trim() || undefined,
          initialStockKg: includeInitialStock && parsedStock > 0 ? parsedStock : undefined,
          initialCostPerKg: includeInitialStock && parsedCost > 0 ? parsedCost : undefined,
          storageLocation: includeInitialStock ? storageLocation : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create fish species");
      }

      setSuccessMsg(`Fish species "${result.data.name}" added successfully!`);
      
      if (onSuccess) {
        onSuccess(result.data);
      }

      setTimeout(() => {
        onOpenChange(false);
      }, 900);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <Fish className="h-5 w-5" />
            <DialogTitle className="text-base font-semibold">
              Add New Fish Species / Type
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Register a new fish or seafood variety into the catalogue master database.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="my-3 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="my-3 flex items-start gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-3">
          {/* Quick suggestions pills */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary" /> Popular Seafood Varieties (Click to autofill)
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto p-1.5 border border-border/60 rounded-md bg-muted/30">
              {COMMON_SPECIES_SUGGESTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleSelectSuggestion(item)}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-background border border-border hover:border-primary hover:text-primary transition-colors cursor-pointer"
                >
                  + {item}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-foreground">
                Species / Variety Name <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="e.g. Yellowfin Tuna / Surmai / King Fish"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                className="h-9 text-xs"
                autoFocus
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Tag className="h-3 w-3" /> Species Code / SKU
              </label>
              <Input
                placeholder="e.g. FISH-YFT, FISH-SUR"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="h-8.5 text-xs font-mono uppercase"
              />
              <p className="text-[10px] text-muted-foreground">
                Auto-generated if left blank
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <Layers className="h-3 w-3 text-muted-foreground" /> Category <span className="text-destructive">*</span>
              </label>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-8.5 text-xs"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                Default Quality Grade
              </label>
              <Select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="h-8.5 text-xs"
              >
                {QUALITY_GRADES.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Scientific / Regional Name (Optional)
              </label>
              <Input
                placeholder="e.g. Thunnus albacares / Vanjaram"
                value={scientificName}
                onChange={(e) => setScientificName(e.target.value)}
                className="h-8.5 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Description / Notes (Optional)
            </label>
            <Input
              placeholder="e.g. Sourced from deep-sea hooks, preferred for export"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-8.5 text-xs"
            />
          </div>

          {/* Optional Initial Opening Stock Section */}
          <div className="rounded-lg border border-border/80 bg-card/60 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeInitialStock}
                  onChange={(e) => setIncludeInitialStock(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary h-3.5 w-3.5"
                />
                <PackagePlus className="h-3.5 w-3.5 text-primary" />
                Add Initial Opening Stock now?
              </label>
              <span className="text-[10px] text-muted-foreground">
                {includeInitialStock ? "Creates initial inward ledger entry" : "Starts with 0 kg"}
              </span>
            </div>

            {includeInitialStock && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-border/50">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-foreground">
                    Initial Stock (kg) *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 250"
                    value={initialStockKg}
                    onChange={(e) => setInitialStockKg(e.target.value)}
                    required={includeInitialStock}
                    className="h-8 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-foreground">
                    Avg Unit Cost (₹ / kg)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 350.00"
                    value={initialCostPerKg}
                    onChange={(e) => setInitialCostPerKg(e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-foreground flex items-center gap-1">
                    <Warehouse className="h-3 w-3 text-muted-foreground" /> Location
                  </label>
                  <Select
                    value={storageLocation}
                    onChange={(e) => setStorageLocation(e.target.value)}
                    className="h-8 text-xs"
                  >
                    <option value="Cold Storage A">Cold Storage A</option>
                    <option value="Cold Storage B">Cold Storage B</option>
                    <option value="Blast Freezer Room">Blast Freezer Room</option>
                    <option value="Dock Receiving Bay">Dock Receiving Bay</option>
                    <option value="Chilled Hold #1">Chilled Hold #1</option>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="h-8 text-xs gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving Species...
                </>
              ) : (
                <>
                  <Fish className="h-3.5 w-3.5" /> Save Fish Species
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </div>
    </Dialog>
  );
}
