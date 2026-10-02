"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  ArrowLeft,
  Save,
  Anchor,
  Phone,
  Mail,
  MapPin,
  Building,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { formatCurrency, formatWeight } from "@/lib/utils";
import type {
  SupplierDTO,
  FishTypeDTO,
  CreatePurchaseInput,
  PurchaseItemInput,
} from "@/types";

interface PurchaseFormProps {
  suppliers: SupplierDTO[];
  fishTypes: FishTypeDTO[];
}

const EMPTY_ITEM: PurchaseItemInput = {
  fishTypeId: "",
  grade: "Grade A",
  weightKg: 0,
  unitPricePerKg: 0,
  temperatureC: null,
  notes: null,
};

const PAYMENT_METHODS = [
  { label: "Bank Transfer", value: "BANK_TRANSFER" },
  { label: "Cash", value: "CASH" },
  { label: "Cheque", value: "CHEQUE" },
  { label: "UPI", value: "UPI" },
  { label: "Credit Card", value: "CREDIT_CARD" },
];

export function PurchaseForm({ suppliers, fishTypes }: PurchaseFormProps) {
  const router = useRouter();
  const [supplierList, setSupplierList] = React.useState<SupplierDTO[]>(suppliers);
  const [fishTypeList, setFishTypeList] = React.useState<FishTypeDTO[]>(fishTypes);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (fishTypes && fishTypes.length > 0) setFishTypeList(fishTypes);
  }, [fishTypes]);

  React.useEffect(() => {
    if (suppliers && suppliers.length > 0) setSupplierList(suppliers);
  }, [suppliers]);

  React.useEffect(() => {
    async function refreshLookups() {
      try {
        const res = await fetch("/api/purchases/lookups");
        if (res.ok) {
          const json = await res.json();
          if (json.data?.fishTypes && Array.isArray(json.data.fishTypes)) {
            setFishTypeList(json.data.fishTypes);
          }
          if (json.data?.suppliers && Array.isArray(json.data.suppliers)) {
            setSupplierList(json.data.suppliers);
          }
        }
      } catch {}
    }
    refreshLookups();
  }, []);

  // Quick Add Supplier Dialog State
  const [showAddSupplier, setShowAddSupplier] = React.useState(false);
  const [isCreatingSupplier, setIsCreatingSupplier] = React.useState(false);
  const [newSupplierData, setNewSupplierData] = React.useState({
    name: "",
    phone: "",
    boatName: "",
    harborLocation: "",
    contactPerson: "",
    email: "",
    taxNumber: "",
    address: "",
  });

  // Form state
  const [supplierId, setSupplierId] = React.useState("");
  const [purchaseDate, setPurchaseDate] = React.useState(
    new Date().toISOString().slice(0, 16)
  );
  const [landingHarbor, setLandingHarbor] = React.useState("");
  const [truckNumber, setTruckNumber] = React.useState("");
  const [transportCharges, setTransportCharges] = React.useState(0);
  const [iceCharges, setIceCharges] = React.useState(0);
  const [labourCharges, setLabourCharges] = React.useState(0);
  const [paymentMethod, setPaymentMethod] = React.useState("BANK_TRANSFER");
  const [initialPaidAmount, setInitialPaidAmount] = React.useState(0);
  const [notes, setNotes] = React.useState("");
  const [items, setItems] = React.useState<PurchaseItemInput[]>([
    { ...EMPTY_ITEM },
  ]);

  // Invoice file state
  const [invoiceFile, setInvoiceFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [invoiceUrl, setInvoiceUrl] = React.useState<string | null>(null);
  const [invoiceFileName, setInvoiceFileName] = React.useState<string | null>(
    null
  );

  // Calculations
  const calculatedItems = items.map((item) => ({
    ...item,
    totalCost: Number((item.weightKg * item.unitPricePerKg).toFixed(2)),
  }));

  const totalWeightKg = calculatedItems.reduce(
    (sum, item) => sum + item.weightKg,
    0
  );
  const subtotal = calculatedItems.reduce(
    (sum, item) => sum + item.totalCost,
    0
  );
  const grandTotal = subtotal + transportCharges + iceCharges + labourCharges;
  const balanceAmount = Math.max(0, grandTotal - initialPaidAmount);

  const paymentStatus =
    grandTotal > 0 && balanceAmount <= 0
      ? "PAID"
      : initialPaidAmount > 0
      ? "PARTIAL"
      : "UNPAID";

  // Selected supplier info
  const selectedSupplier = supplierList.find((s) => s.id === supplierId);

  async function handleCreateNewSupplier(e: React.FormEvent) {
    e.preventDefault();
    if (!newSupplierData.name || !newSupplierData.phone) {
      alert("Please provide at least a supplier/boat name and phone number.");
      return;
    }

    setIsCreatingSupplier(true);
    try {
      const res = await fetch("/api/purchases/lookups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSupplierData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create supplier");
      }

      const { data: created } = await res.json();
      setSupplierList((prev) => [created, ...prev]);
      setSupplierId(created.id);
      if (created.harborLocation && !landingHarbor) {
        setLandingHarbor(created.harborLocation);
      }
      setShowAddSupplier(false);
      setNewSupplierData({
        name: "",
        phone: "",
        boatName: "",
        harborLocation: "Cochin Fisheries Harbour",
        contactPerson: "",
        email: "",
        taxNumber: "",
        address: "",
      });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to create new supplier");
    } finally {
      setIsCreatingSupplier(false);
    }
  }

  // Item handlers
  function addItem() {
    setItems([...items, { ...EMPTY_ITEM }]);
  }

  function removeItem(index: number) {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(
    index: number,
    field: keyof PurchaseItemInput,
    value: string | number | null
  ) {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  }

  // Invoice upload
  async function handleInvoiceUpload(file: File) {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "purchases/invoices");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setInvoiceUrl(data.url || data.data?.url);
      setInvoiceFileName(file.name);
    } catch {
      setError("Failed to upload invoice. You can still save the purchase.");
    } finally {
      setIsUploading(false);
    }
  }

  // Form submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validations
    if (!supplierId) {
      setError("Please select a supplier");
      return;
    }
    if (!purchaseDate) {
      setError("Please select a purchase date");
      return;
    }

    const validItems = items.filter(
      (item) =>
        item.fishTypeId && item.weightKg > 0 && item.unitPricePerKg > 0
    );
    if (validItems.length === 0) {
      setError(
        "At least one fish item with valid quantity and rate is required"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreatePurchaseInput = {
        supplierId,
        purchaseDate,
        landingHarbor: landingHarbor || null,
        truckNumber: truckNumber || null,
        transportCharges,
        iceCharges,
        labourCharges,
        paymentMethod: paymentMethod as CreatePurchaseInput["paymentMethod"],
        initialPaidAmount,
        notes: notes || null,
        invoiceUrl,
        invoiceFileName,
        invoiceFileType: invoiceFile?.type || null,
        invoiceFileSize: invoiceFile?.size || null,
        items: validItems,
      };

      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create purchase");
      }

      router.push("/purchases");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create purchase";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Add New Purchase
            </h1>
            <p className="text-xs text-muted-foreground">
              Enter the details of fish you bought today
            </p>
          </div>
        </div>
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting}
          className="w-full sm:w-auto gap-1.5"
        >
          {isSubmitting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          {isSubmitting ? "Saving..." : "Save Purchase"}
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Supplier & Logistics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Supplier & Date */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm">
                Supplier & Purchase Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground">
                      Supplier / Boat *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAddSupplier(true)}
                      className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Add New Supplier / Boat
                    </button>
                  </div>
                  <Select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="h-9 text-sm"
                  >
                    <option value="">Select Supplier...</option>
                    {supplierList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                        {s.boatName ? ` (${s.boatName})` : ""}
                      </option>
                    ))}
                  </Select>
                  {selectedSupplier && (
                    <div className="text-[11px] text-muted-foreground mt-1 flex flex-wrap gap-x-3">
                      <span>📞 {selectedSupplier.phone}</span>
                      {selectedSupplier.harborLocation && (
                        <span>⚓ {selectedSupplier.harborLocation}</span>
                      )}
                      {selectedSupplier.balance > 0 && (
                        <span className="text-amber-600 font-medium">
                          Outstanding: {formatCurrency(selectedSupplier.balance)}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Purchase Date & Time *
                  </label>
                  <Input
                    type="datetime-local"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Landing Harbor
                  </label>
                  <Input
                    value={landingHarbor}
                    onChange={(e) => setLandingHarbor(e.target.value)}
                    placeholder="e.g. Cochin Fisheries Harbour"
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Truck Number
                  </label>
                  <Input
                    value={truckNumber}
                    onChange={(e) => setTruckNumber(e.target.value)}
                    placeholder="e.g. KL-07-CD-8921"
                    className="h-9 text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fish Items */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">
                  Fish Items ({items.length})
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  className="gap-1 text-xs"
                >
                  <Plus className="h-3 w-3" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-border bg-muted/30 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Item #{index + 1}
                    </span>
                    <div className="flex items-center gap-3">
                      {item.fishTypeId &&
                        item.weightKg > 0 &&
                        item.unitPricePerKg > 0 && (
                          <span className="text-xs font-mono font-semibold text-primary">
                            = {formatCurrency(calculatedItems[index].totalCost)}
                          </span>
                        )}
                      {items.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[11px] font-medium text-muted-foreground">
                        Fish Type *
                      </label>
                      <Select
                        value={item.fishTypeId}
                        onChange={(e) =>
                          updateItem(index, "fishTypeId", e.target.value)
                        }
                        className="h-8 text-xs"
                      >
                        <option value="">Select Fish...</option>
                        {fishTypeList.map((ft) => (
                          <option key={ft.id} value={ft.id}>
                            {ft.name} ({ft.code})
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-muted-foreground">
                        Grade
                      </label>
                      <Select
                        value={item.grade || "Grade A"}
                        onChange={(e) =>
                          updateItem(index, "grade", e.target.value)
                        }
                        className="h-8 text-xs"
                      >
                        <option value="Grade AAA Export">
                          Grade AAA Export
                        </option>
                        <option value="Grade A Export">Grade A Export</option>
                        <option value="Grade A">Grade A</option>
                        <option value="Grade B">Grade B</option>
                        <option value="Grade C">Grade C</option>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-muted-foreground">
                        Temperature °C
                      </label>
                      <Input
                        type="number"
                        step="0.1"
                        value={item.temperatureC ?? ""}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "temperatureC",
                            e.target.value ? parseFloat(e.target.value) : null
                          )
                        }
                        placeholder="-1.5"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-muted-foreground">
                        Quantity (kg) *
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.weightKg || ""}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "weightKg",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="0.00"
                        className="h-8 text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-muted-foreground">
                        Rate per kg *
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitPricePerKg || ""}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "unitPricePerKg",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="0.00"
                        className="h-8 text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-muted-foreground">
                        Item Total
                      </label>
                      <div className="h-8 flex items-center px-3 rounded-md bg-muted text-xs font-mono font-semibold text-foreground">
                        {formatCurrency(calculatedItems[index].totalCost)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-muted-foreground">
                      Item Notes
                    </label>
                    <Input
                      value={item.notes || ""}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "notes",
                          e.target.value || null
                        )
                      }
                      placeholder="Notes about this fish item..."
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notes & Invoice */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm">Notes & Invoice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Purchase Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes about this purchase..."
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Invoice Upload
                </label>
                {invoiceFileName ? (
                  <div className="flex items-center gap-2 p-3 rounded-md border border-border bg-muted/50">
                    <span className="text-xs text-foreground font-medium truncate flex-1">
                      📄 {invoiceFileName}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setInvoiceFile(null);
                        setInvoiceUrl(null);
                        setInvoiceFileName(null);
                      }}
                      className="h-7 text-xs"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 p-4 rounded-md border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {isUploading
                          ? "Uploading..."
                          : "Click to upload invoice (PDF, JPG, PNG)"}
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setInvoiceFile(file);
                            handleInvoiceUpload(file);
                          }
                        }}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Payment & Summary */}
        <div className="space-y-6">
          {/* Additional Charges */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm">Additional Charges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Transport Charges
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={transportCharges || ""}
                  onChange={(e) =>
                    setTransportCharges(parseFloat(e.target.value) || 0)
                  }
                  placeholder="0.00"
                  className="h-9 text-sm font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Ice Charges
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={iceCharges || ""}
                  onChange={(e) =>
                    setIceCharges(parseFloat(e.target.value) || 0)
                  }
                  placeholder="0.00"
                  className="h-9 text-sm font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Labour Charges
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={labourCharges || ""}
                  onChange={(e) =>
                    setLabourCharges(parseFloat(e.target.value) || 0)
                  }
                  placeholder="0.00"
                  className="h-9 text-sm font-mono"
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm">Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Payment Method
                </label>
                <Select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-9 text-sm"
                  options={PAYMENT_METHODS}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Initial Payment Amount
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={initialPaidAmount || ""}
                  onChange={(e) =>
                    setInitialPaidAmount(parseFloat(e.target.value) || 0)
                  }
                  placeholder="0.00"
                  className="h-9 text-sm font-mono"
                />
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Purchase Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total Weight</span>
                <span className="font-mono font-medium">
                  {formatWeight(totalWeightKg)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  Fish Items Subtotal
                </span>
                <span className="font-mono">{formatCurrency(subtotal)}</span>
              </div>

              {transportCharges > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    Transport Charges
                  </span>
                  <span className="font-mono">
                    +{formatCurrency(transportCharges)}
                  </span>
                </div>
              )}
              {iceCharges > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Ice Charges</span>
                  <span className="font-mono">
                    +{formatCurrency(iceCharges)}
                  </span>
                </div>
              )}
              {labourCharges > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Labour Charges</span>
                  <span className="font-mono">
                    +{formatCurrency(labourCharges)}
                  </span>
                </div>
              )}

              <div className="border-t border-border pt-2 mt-2">
                <div className="flex justify-between text-sm font-bold">
                  <span>Grand Total</span>
                  <span className="font-mono text-primary">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>

              {initialPaidAmount > 0 && (
                <>
                  <div className="flex justify-between text-xs pt-1">
                    <span className="text-muted-foreground">Paid Amount</span>
                    <span className="font-mono text-success">
                      -{formatCurrency(initialPaidAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">Balance Due</span>
                    <span className="font-mono text-warning">
                      {formatCurrency(balanceAmount)}
                    </span>
                  </div>
                </>
              )}

              <div className="pt-2">
                <Badge
                  variant={
                    paymentStatus === "PAID"
                      ? "success"
                      : paymentStatus === "PARTIAL"
                      ? "warning"
                      : "destructive"
                  }
                >
                  {paymentStatus}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Add Supplier / Boat Dialog */}
      <Dialog open={showAddSupplier} onOpenChange={setShowAddSupplier}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Anchor className="h-4.5 w-4.5 text-primary" />
            Add New Supplier / Boat Company
          </DialogTitle>
          <DialogDescription className="text-xs">
            Register a new dockside trawler or seafood supplier instantly.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateNewSupplier} className="space-y-3.5 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                Supplier / Trader Name *
              </label>
              <Input
                placeholder="e.g. Antony Fernandez Fisheries"
                value={newSupplierData.name}
                onChange={(e) =>
                  setNewSupplierData({ ...newSupplierData, name: e.target.value })
                }
                required
                className="h-8.5 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Boat / Trawler Name & ID
              </label>
              <Input
                placeholder="e.g. St. Jude Trawler #7"
                value={newSupplierData.boatName}
                onChange={(e) =>
                  setNewSupplierData({ ...newSupplierData, boatName: e.target.value })
                }
                className="h-8.5 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <Phone className="h-3 w-3 text-muted-foreground" /> Phone Number *
              </label>
              <Input
                placeholder="+91 98471 22334"
                value={newSupplierData.phone}
                onChange={(e) =>
                  setNewSupplierData({ ...newSupplierData, phone: e.target.value })
                }
                required
                className="h-8.5 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Harbor / Landing Dock
              </label>
              <Input
                placeholder="e.g. Cochin Fisheries Harbour"
                value={newSupplierData.harborLocation}
                onChange={(e) =>
                  setNewSupplierData({ ...newSupplierData, harborLocation: e.target.value })
                }
                className="h-8.5 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Contact Person
              </label>
              <Input
                placeholder="e.g. Captain Antony"
                value={newSupplierData.contactPerson}
                onChange={(e) =>
                  setNewSupplierData({ ...newSupplierData, contactPerson: e.target.value })
                }
                className="h-8.5 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3 text-muted-foreground" /> Email (Optional)
              </label>
              <Input
                type="email"
                placeholder="antony@seafood.in"
                value={newSupplierData.email}
                onChange={(e) =>
                  setNewSupplierData({ ...newSupplierData, email: e.target.value })
                }
                className="h-8.5 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3 text-muted-foreground" /> Base Address / Dock Office
            </label>
            <Input
              placeholder="e.g. Harbor Road, Thoppumpady, Kochi"
              value={newSupplierData.address}
              onChange={(e) =>
                setNewSupplierData({ ...newSupplierData, address: e.target.value })
              }
              className="h-8.5 text-xs"
            />
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddSupplier(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isCreatingSupplier}
              className="gap-1.5"
            >
              {isCreatingSupplier ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                </>
              ) : (
                "Save & Select Supplier"
              )}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </form>
  );
}
