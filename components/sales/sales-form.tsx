"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  ArrowLeft,
  Save,
  Loader2,
  Upload,
  X,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatWeight } from "@/lib/utils";
import { DELIVERY_STATUSES } from "@/constants";
import type {
  CustomerDTO,
  FishTypeWithStockDTO,
  CreateSaleInput,
  SaleItemInput,
} from "@/types";

interface SalesFormProps {
  customers: CustomerDTO[];
  fishTypes: FishTypeWithStockDTO[];
}

const EMPTY_ITEM: SaleItemInput = {
  fishTypeId: "",
  grade: "Grade A",
  weightKg: 0,
  unitPricePerKg: 0,
  notes: null,
};

const PAYMENT_METHODS = [
  { label: "Bank Transfer", value: "BANK_TRANSFER" },
  { label: "Cash", value: "CASH" },
  { label: "Cheque", value: "CHEQUE" },
  { label: "UPI", value: "UPI" },
  { label: "Credit Card", value: "CREDIT_CARD" },
];

export function SalesForm({ customers, fishTypes }: SalesFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Form state
  const [customerId, setCustomerId] = React.useState("");
  const [saleDate, setSaleDate] = React.useState(
    new Date().toISOString().slice(0, 16)
  );
  const [deliveryDate, setDeliveryDate] = React.useState("");
  const [deliveryStatus, setDeliveryStatus] = React.useState<CreateSaleInput["status"]>("CONFIRMED");
  const [paymentMethod, setPaymentMethod] = React.useState("BANK_TRANSFER");
  const [initialPaidAmount, setInitialPaidAmount] = React.useState(0);
  const [taxAmount, setTaxAmount] = React.useState(0);
  const [discountAmount, setDiscountAmount] = React.useState(0);
  const [notes, setNotes] = React.useState("");
  const [items, setItems] = React.useState<SaleItemInput[]>([
    { ...EMPTY_ITEM },
  ]);

  // Invoice file upload state
  const [invoiceFile, setInvoiceFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [invoiceUrl, setInvoiceUrl] = React.useState<string | null>(null);
  const [invoiceFileName, setInvoiceFileName] = React.useState<string | null>(null);

  // Authoritative calculations on client preview
  const calculatedItems = items.map((item) => {
    const selectedFish = fishTypes.find((f) => f.id === item.fishTypeId);
    const availableStock = selectedFish ? selectedFish.availableStockKg : 0;
    const isOverStock = item.fishTypeId && item.weightKg > availableStock;
    return {
      ...item,
      totalPrice: Number((item.weightKg * item.unitPricePerKg).toFixed(2)),
      availableStock,
      isOverStock,
    };
  });

  const totalWeightKg = calculatedItems.reduce(
    (sum, item) => sum + item.weightKg,
    0
  );
  const subtotal = calculatedItems.reduce(
    (sum, item) => sum + item.totalPrice,
    0
  );
  const grandTotal = Math.max(0, subtotal + taxAmount - discountAmount);
  const dueAmount = Math.max(0, grandTotal - initialPaidAmount);

  const paymentStatus =
    grandTotal > 0 && dueAmount <= 0
      ? "PAID"
      : initialPaidAmount > 0
      ? "PARTIAL"
      : "UNPAID";

  const selectedCustomer = customers.find((c) => c.id === customerId);
  const hasOverStockItems = calculatedItems.some((i) => i.isOverStock);

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
    field: keyof SaleItemInput,
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
      formData.append("folder", "fish_business/invoices");

      const res = await fetch("/api/upload/invoice", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setInvoiceUrl(data.url || data.data?.url);
      setInvoiceFileName(file.name);
    } catch {
      setError("Failed to upload invoice. You can still save the sale order.");
    } finally {
      setIsUploading(false);
    }
  }

  // Form submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validations
    if (!customerId) {
      setError("Please select a customer or buyer company");
      return;
    }
    if (!saleDate) {
      setError("Please select a sale date & time");
      return;
    }

    const validItems = items.filter(
      (item) =>
        item.fishTypeId && item.weightKg > 0 && item.unitPricePerKg > 0
    );
    if (validItems.length === 0) {
      setError("At least one fish item with quantity and selling price is required");
      return;
    }

    if (hasOverStockItems) {
      setError("One or more items exceed current warehouse stock. Please adjust quantities.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateSaleInput = {
        customerId,
        saleDate,
        deliveryDate: deliveryDate || null,
        status: deliveryStatus,
        paymentStatus,
        paymentMethod: paymentMethod as CreateSaleInput["paymentMethod"],
        initialPaidAmount,
        taxAmount,
        discountAmount,
        notes: notes || null,
        invoiceUrl,
        invoiceFileName,
        invoiceFileType: invoiceFile?.type || null,
        invoiceFileSize: invoiceFile?.size || null,
        items: validItems,
      };

      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create sale order");
      }

      router.push("/sales");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create sale order";
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
              New Sale & Invoice Order
            </h1>
            <p className="text-xs text-muted-foreground">
              Create customer order, allocate stock, and issue outward dispatch
            </p>
          </div>
        </div>
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting || hasOverStockItems}
          className="w-full sm:w-auto gap-1.5 shadow-xs"
        >
          {isSubmitting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          {isSubmitting ? "Generating..." : "Create Sale Order"}
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => setError(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Customer & Fish Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Delivery Schedule */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm">Customer & Order Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Customer / Buyer Company *
                  </label>
                  <Select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="h-9 text-sm"
                  >
                    <option value="">Select Customer...</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.companyName ? `(${c.companyName})` : ""}
                      </option>
                    ))}
                  </Select>
                  {selectedCustomer && (
                    <div className="text-[11px] text-muted-foreground mt-1 flex flex-wrap gap-x-3">
                      <span>📞 {selectedCustomer.phone}</span>
                      {selectedCustomer.deliveryAddress && (
                        <span>📍 {selectedCustomer.deliveryAddress}</span>
                      )}
                      {selectedCustomer.outstandingBalance > 0 && (
                        <span className="text-warning font-medium">
                          Current Due: {formatCurrency(selectedCustomer.outstandingBalance)}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Sale Date & Time *
                  </label>
                  <Input
                    type="datetime-local"
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Target Delivery Date
                  </label>
                  <Input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Delivery Status
                  </label>
                  <Select
                    value={deliveryStatus}
                    onChange={(e) =>
                      setDeliveryStatus(e.target.value as CreateSaleInput["status"])
                    }
                    className="h-9 text-sm"
                  >
                    {DELIVERY_STATUSES.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fish Items Table */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">
                  Fish Varieties & Quantities ({items.length})
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  className="gap-1 text-xs"
                >
                  <Plus className="h-3 w-3" />
                  Add Variety
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => {
                const calculated = calculatedItems[index];
                return (
                  <div
                    key={index}
                    className={`rounded-lg border p-4 space-y-3 transition-colors ${
                      calculated.isOverStock
                        ? "border-destructive/40 bg-destructive/5"
                        : "border-border bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground">
                          Line Item #{index + 1}
                        </span>
                        {item.fishTypeId && (
                          <Badge
                            variant={calculated.isOverStock ? "destructive" : "secondary"}
                            className="text-[10px]"
                          >
                            In Stock: {formatWeight(calculated.availableStock)}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {item.fishTypeId &&
                          item.weightKg > 0 &&
                          item.unitPricePerKg > 0 && (
                            <span className="text-xs font-mono font-semibold text-primary">
                              = {formatCurrency(calculated.totalPrice)}
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

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[11px] font-medium text-muted-foreground">
                          Fish Species *
                        </label>
                        <Select
                          value={item.fishTypeId}
                          onChange={(e) =>
                            updateItem(index, "fishTypeId", e.target.value)
                          }
                          className="h-8 text-xs"
                        >
                          <option value="">Select Fish Variety...</option>
                          {fishTypes.map((ft) => (
                            <option key={ft.id} value={ft.id}>
                              {ft.name} ({ft.code}) — {formatWeight(ft.availableStockKg)} avail
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
                          <option value="Grade AAA Export">Grade AAA Export</option>
                          <option value="Grade A Export">Grade A Export</option>
                          <option value="Grade A">Grade A</option>
                          <option value="Grade B">Grade B</option>
                          <option value="Grade C">Grade C</option>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] font-medium text-muted-foreground">
                            Quantity Sold (kg) *
                          </label>
                          {calculated.isOverStock && (
                            <span className="text-[10px] text-destructive font-medium">
                              Exceeds Stock!
                            </span>
                          )}
                        </div>
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
                          className={`h-8 text-xs font-mono ${
                            calculated.isOverStock
                              ? "border-destructive focus-visible:ring-destructive"
                              : ""
                          }`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-muted-foreground">
                          Selling Price / kg *
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
                          {formatCurrency(calculated.totalPrice)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Invoice Document Upload & Notes */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm">Invoice & Order Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Order Notes / Shipping Instructions
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Export crate packaging with dry ice at -20°C..."
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Sales Invoice / Packing List Document
                </label>
                {invoiceFileName ? (
                  <div className="flex items-center gap-2 p-3 rounded-md border border-border bg-muted/50">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    <span className="text-xs text-foreground font-medium truncate flex-1">
                      {invoiceFileName}
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
                          ? "Uploading to Cloudinary..."
                          : "Click to upload sales invoice / manifest (PDF, JPG, PNG)"}
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

        {/* Right Column: Pricing & Payment Breakdown */}
        <div className="space-y-6">
          {/* Tax & Discounts */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm">Adjustments & Taxes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Tax Amount ($)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={taxAmount || ""}
                  onChange={(e) =>
                    setTaxAmount(parseFloat(e.target.value) || 0)
                  }
                  placeholder="0.00"
                  className="h-9 text-sm font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Discount Amount ($)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={discountAmount || ""}
                  onChange={(e) =>
                    setDiscountAmount(parseFloat(e.target.value) || 0)
                  }
                  placeholder="0.00"
                  className="h-9 text-sm font-mono"
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Terms */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm">Payment Details</CardTitle>
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
                  Initial Payment Received ($)
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

          {/* Authoritative Order Summary */}
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Sale Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total Weight</span>
                <span className="font-mono font-medium">
                  {formatWeight(totalWeightKg)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Items Subtotal</span>
                <span className="font-mono">{formatCurrency(subtotal)}</span>
              </div>

              {taxAmount > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-mono">+{formatCurrency(taxAmount)}</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="font-mono text-success">
                    -{formatCurrency(discountAmount)}
                  </span>
                </div>
              )}

              <div className="border-t border-border pt-2 mt-2">
                <div className="flex justify-between text-sm font-bold">
                  <span>Total Amount</span>
                  <span className="font-mono text-primary">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>

              {initialPaidAmount > 0 && (
                <>
                  <div className="flex justify-between text-xs pt-1">
                    <span className="text-muted-foreground">Amount Paid</span>
                    <span className="font-mono text-success">
                      -{formatCurrency(initialPaidAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">Due Amount</span>
                    <span className="font-mono text-warning">
                      {formatCurrency(dueAmount)}
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
    </form>
  );
}
