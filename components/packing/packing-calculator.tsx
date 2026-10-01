"use client";

import * as React from "react";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Box,
  Snowflake,
  Wind,
  PackageCheck,
  Users,
  Truck,
  Scale,
  Calculator,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  PieChart,
} from "lucide-react";
import { packingCalculatorSchema, type PackingCalculatorValues } from "@/validations/packing.schema";
import type { PackingCostDTO } from "@/types";

interface PackingCalculatorProps {
  onCalculationSaved: (saved: PackingCostDTO) => void;
}

export function PackingCalculator({ onCalculationSaved }: PackingCalculatorProps) {
  // Input states
  const [packingType, setPackingType] = React.useState("Thermocol Airfreight Export");
  const [thermocolBoxesCount, setThermocolBoxesCount] = React.useState<number | "">("");
  const [costPerBox, setCostPerBox] = React.useState<number | "">("");
  const [iceCost, setIceCost] = React.useState<number | "">("");
  const [oxygenCost, setOxygenCost] = React.useState<number | "">("");
  const [packingMaterialCost, setPackingMaterialCost] = React.useState<number | "">("");
  const [labourCost, setLabourCost] = React.useState<number | "">("");
  const [transportCost, setTransportCost] = React.useState<number | "">("");
  const [quantityKg, setQuantityKg] = React.useState<number | "">("");
  const [notes, setNotes] = React.useState("");

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // Parse numeric values
  const boxes = typeof thermocolBoxesCount === "number" ? thermocolBoxesCount : 0;
  const boxRate = typeof costPerBox === "number" ? costPerBox : 0;
  const ice = typeof iceCost === "number" ? iceCost : 0;
  const oxy = typeof oxygenCost === "number" ? oxygenCost : 0;
  const material = typeof packingMaterialCost === "number" ? packingMaterialCost : 0;
  const labour = typeof labourCost === "number" ? labourCost : 0;
  const transport = typeof transportCost === "number" ? transportCost : 0;
  const qty = typeof quantityKg === "number" ? quantityKg : 0;

  // Instant reactive computations
  const thermocolCost = Number((boxes * boxRate).toFixed(2));
  const totalPackingCost = Number(
    (thermocolCost + ice + oxy + material + labour + transport).toFixed(2)
  );
  const costPerKg = qty > 0 ? Number((totalPackingCost / qty).toFixed(2)) : 0;

  // Percentage shares for cost distribution
  const costBreakdown = [
    { label: "Thermocol Boxes", amount: thermocolCost, color: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
    { label: "Ice", amount: ice, color: "bg-cyan-500", text: "text-cyan-600 dark:text-cyan-400" },
    { label: "Oxygen", amount: oxy, color: "bg-purple-500", text: "text-purple-600 dark:text-purple-400" },
    { label: "Packing Materials", amount: material, color: "bg-indigo-500", text: "text-indigo-600 dark:text-indigo-400" },
    { label: "Labour", amount: labour, color: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
    { label: "Transport", amount: transport, color: "bg-sky-500", text: "text-sky-600 dark:text-sky-400" },
  ].filter((item) => item.amount > 0);

  const handleReset = () => {
    setPackingType("Thermocol Airfreight Export");
    setThermocolBoxesCount("");
    setCostPerBox("");
    setIceCost("");
    setOxygenCost("");
    setPackingMaterialCost("");
    setLabourCost("");
    setTransportCost("");
    setQuantityKg("");
    setNotes("");
    setError(null);
    setSuccessMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const payload: PackingCalculatorValues = {
      packingType: packingType.trim() || "Thermocol Airfreight Export",
      thermocolBoxesCount: boxes,
      costPerBox: boxRate,
      iceCost: ice,
      oxygenCost: oxy,
      packingMaterialCost: material,
      labourCost: labour,
      transportCost: transport,
      quantityKg: qty,
      notes: notes.trim() || undefined,
    };

    const validation = packingCalculatorSchema.safeParse(payload);
    if (!validation.success) {
      setError(validation.error.errors[0]?.message || "Please check your inputs");
      return;
    }

    if (qty <= 0) {
      setError("Please enter the total Quantity in kg (must be greater than 0) to compute cost per kg.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/packing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save packing cost calculation");
      }

      const json = await res.json();
      const savedData: PackingCostDTO = json.data || json;
      onCalculationSaved(savedData);
      setSuccessMessage(
        `Packing calculation saved successfully: ${formatCurrency(savedData.totalCost ?? 0)} (${formatCurrency(savedData.costPerKg ?? 0)}/kg)`
      );

      // Auto-clear success after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: unknown) {
      console.error("Save packing calculation error:", err);
      setError(err instanceof Error ? err.message : "Failed to save packing calculation");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Alert Banners */}
      {error && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/25 p-4 flex items-start gap-3 text-xs text-destructive animate-fade-in">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-4 flex items-start gap-3 text-xs text-emerald-600 dark:text-emerald-400 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card>
            <CardHeader className="border-b border-border/70 pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calculator className="h-4.5 w-4.5 text-primary" />
                Cost Component Inputs
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Enter packaging units, direct consumables, labour and logistics charges
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              {/* Packing Type & Shipment Reference */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Packing Configuration / Shipment Reference
                </label>
                <Input
                  type="text"
                  placeholder="e.g. 20kg Thermocol Box (Dry Ice) / Dubai Air Cargo Flight #EK531"
                  value={packingType}
                  onChange={(e) => setPackingType(e.target.value)}
                  required
                  className="bg-background text-xs sm:text-sm h-9.5"
                />
              </div>

              {/* Thermocol Boxes Subsection */}
              <div className="p-4 rounded-xl border border-border/80 bg-muted/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Box className="h-4 w-4" /> Thermocol Boxes
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                    Subtotal: {formatCurrency(thermocolCost)}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Number of Thermocol Boxes
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0"
                      value={thermocolBoxesCount}
                      onChange={(e) =>
                        setThermocolBoxesCount(e.target.value === "" ? "" : parseInt(e.target.value, 10))
                      }
                      className="bg-background text-xs sm:text-sm h-9 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Cost per Box (₹)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={costPerBox}
                      onChange={(e) =>
                        setCostPerBox(e.target.value === "" ? "" : parseFloat(e.target.value))
                      }
                      className="bg-background text-xs sm:text-sm h-9 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Other Direct Costs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Ice Cost */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Snowflake className="h-4 w-4 text-cyan-600 dark:text-cyan-400" /> Ice Cost (₹)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={iceCost}
                    onChange={(e) =>
                      setIceCost(e.target.value === "" ? "" : parseFloat(e.target.value))
                    }
                    className="bg-background text-xs sm:text-sm h-9.5 font-mono"
                  />
                </div>

                {/* Oxygen Cost */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Wind className="h-4 w-4 text-purple-600 dark:text-purple-400" /> Oxygen Cost (₹)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={oxygenCost}
                    onChange={(e) =>
                      setOxygenCost(e.target.value === "" ? "" : parseFloat(e.target.value))
                    }
                    className="bg-background text-xs sm:text-sm h-9.5 font-mono"
                  />
                </div>

                {/* Packing Material Cost */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <PackageCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> Packing Material Cost (₹)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00 (Tape, liners, gel packs)"
                    value={packingMaterialCost}
                    onChange={(e) =>
                      setPackingMaterialCost(e.target.value === "" ? "" : parseFloat(e.target.value))
                    }
                    className="bg-background text-xs sm:text-sm h-9.5 font-mono"
                  />
                </div>

                {/* Labour Cost */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Labour Cost (₹)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00 (Grading & packing labour)"
                    value={labourCost}
                    onChange={(e) =>
                      setLabourCost(e.target.value === "" ? "" : parseFloat(e.target.value))
                    }
                    className="bg-background text-xs sm:text-sm h-9.5 font-mono"
                  />
                </div>

                {/* Transport Cost */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-sky-600 dark:text-sky-400" /> Transport Cost (₹)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00 (Reefer truck / airport drop)"
                    value={transportCost}
                    onChange={(e) =>
                      setTransportCost(e.target.value === "" ? "" : parseFloat(e.target.value))
                    }
                    className="bg-background text-xs sm:text-sm h-9.5 font-mono"
                  />
                </div>

                {/* Quantity in kg */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Scale className="h-4 w-4 text-amber-600 dark:text-amber-400" /> Quantity in kg <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="number"
                    min="0.1"
                    step="0.1"
                    placeholder="Total weight (kg)"
                    value={quantityKg}
                    onChange={(e) =>
                      setQuantityKg(e.target.value === "" ? "" : parseFloat(e.target.value))
                    }
                    required
                    className="bg-background border-primary/40 text-xs sm:text-sm h-9.5 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-muted-foreground">Notes / Remarks</label>
                <Input
                  type="text"
                  placeholder="Optional packing remarks, cold chain temperatures..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-background text-xs sm:text-sm h-9"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Calculation Display & Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="border-b border-border/70 pb-3.5">
              <CardTitle className="text-base font-semibold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <PieChart className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
                  Live Cost Output
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/60 px-2.5 py-0.5 rounded-full border border-border/60">
                  Instant Preview
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-5">
              {/* Primary Key Figures */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-4 rounded-xl bg-card border border-border/80 shadow-2xs text-center">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Total Packing Cost
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-foreground block mt-1">
                    {formatCurrency(totalPackingCost)}
                  </span>
                  <span className="text-xs text-muted-foreground mt-0.5 block">
                    6 cost components
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 shadow-2xs text-center">
                  <span className="text-[11px] font-semibold text-primary uppercase tracking-wider block">
                    Unit Cost / kg
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-primary block mt-1">
                    {qty > 0 ? formatCurrency(costPerKg) : "—"}
                  </span>
                  <span className="text-xs text-primary/80 mt-0.5 block">
                    {qty > 0 ? `For ${qty.toLocaleString()} kg` : "Enter Weight (kg)"}
                  </span>
                </div>
              </div>

              {/* Cost Formula Breakdown */}
              <div className="space-y-2 pt-2 border-t border-border/70 text-xs sm:text-sm">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between mb-2">
                  <span>Component Breakdown</span>
                  <span>Amount</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-border/40 text-foreground">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Box className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    Thermocol ({boxes} × {formatCurrency(boxRate)})
                  </span>
                  <span className="font-mono font-medium text-foreground">{formatCurrency(thermocolCost)}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-border/40 text-foreground">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Snowflake className="h-4 w-4 text-cyan-600 dark:text-cyan-400" /> Ice
                  </span>
                  <span className="font-mono font-medium text-foreground">{formatCurrency(ice)}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-border/40 text-foreground">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Wind className="h-4 w-4 text-purple-600 dark:text-purple-400" /> Oxygen
                  </span>
                  <span className="font-mono font-medium text-foreground">{formatCurrency(oxy)}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-border/40 text-foreground">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <PackageCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> Packing Materials
                  </span>
                  <span className="font-mono font-medium text-foreground">{formatCurrency(material)}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-border/40 text-foreground">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Labour
                  </span>
                  <span className="font-mono font-medium text-foreground">{formatCurrency(labour)}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-border/40 text-foreground">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Truck className="h-4 w-4 text-sky-600 dark:text-sky-400" /> Transport
                  </span>
                  <span className="font-mono font-medium text-foreground">{formatCurrency(transport)}</span>
                </div>

                <div className="flex items-center justify-between pt-2.5 text-xs sm:text-sm font-bold text-foreground">
                  <span>Total Packing Cost</span>
                  <span className="font-mono text-base text-emerald-600 dark:text-emerald-400">{formatCurrency(totalPackingCost)}</span>
                </div>
              </div>

              {/* Progress Bar Distribution */}
              {totalPackingCost > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden flex">
                    {costBreakdown.map((item, i) => (
                      <div
                        key={i}
                        className={`${item.color} h-full`}
                        style={{ width: `${(item.amount / totalPackingCost) * 100}%` }}
                        title={`${item.label}: ${formatCurrency(item.amount)}`}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1 text-xs text-muted-foreground">
                    {costBreakdown.map((item, i) => (
                      <span key={i} className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${item.color}`} />
                        {item.label} ({((item.amount / totalPackingCost) * 100).toFixed(0)}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 border-t border-border/70 flex items-center gap-2.5">
                <Button
                  type="submit"
                  disabled={saving || totalPackingCost === 0 || qty <= 0}
                  className="flex-1 text-xs sm:text-sm font-semibold h-9.5 gap-2 shadow-xs"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Save Calculation Record
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="h-9.5 text-xs font-medium"
                  title="Clear inputs"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
