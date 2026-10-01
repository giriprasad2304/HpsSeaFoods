"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Tag,
  CreditCard,
  User,
  Upload,
  FileCheck,
  Loader2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { expenseFormSchema, type ExpenseFormValues } from "@/validations/expense.schema";
import type { ExpenseCategoryDTO } from "@/types";

interface ExpenseFormProps {
  categories: ExpenseCategoryDTO[];
}

export function ExpenseForm({ categories }: ExpenseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Form State
  const [formData, setFormData] = React.useState<Partial<ExpenseFormValues>>({
    expenseDate: new Date().toISOString().slice(0, 16),
    categoryId: categories[0]?.id || "",
    title: "",
    description: "",
    amount: undefined,
    paidTo: "",
    paymentMethod: "CASH",
    invoiceUrl: "",
    invoiceFileName: "",
    notes: "",
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const data = new FormData();
      data.append("file", file);

      const res = await fetch("/api/upload/invoice", {
        method: "POST",
        body: data,
      });

      if (!res.ok) {
        throw new Error("Failed to upload invoice attachment");
      }

      const json = await res.json();
      setFormData((prev) => ({
        ...prev,
        invoiceUrl: json.url,
        invoiceFileName: json.fileName || file.name,
      }));
    } catch (err: unknown) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Failed to upload invoice");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      expenseDate: formData.expenseDate ? new Date(formData.expenseDate).toISOString() : new Date().toISOString(),
      categoryId: formData.categoryId,
      title: formData.title,
      description: formData.description || "",
      amount: Number(formData.amount),
      paidTo: formData.paidTo || "",
      paymentMethod: formData.paymentMethod || "CASH",
      invoiceUrl: formData.invoiceUrl || "",
      invoiceFileName: formData.invoiceFileName || "",
      notes: formData.notes || "",
    };

    const validation = expenseFormSchema.safeParse(payload);
    if (!validation.success) {
      setError(validation.error.errors[0]?.message || "Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to record expense voucher");
      }

      router.push("/expenses");
      router.refresh();
    } catch (err: unknown) {
      console.error("Expense creation error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <Link href="/expenses">
          <Button type="button" variant="outline" size="sm" className="h-9 gap-2 text-xs sm:text-sm font-medium">
            <ArrowLeft className="h-4 w-4" />
            Back to Expenses
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            type="submit"
            disabled={loading || uploading}
            size="sm"
            className="h-9 px-5 text-xs sm:text-sm font-semibold shadow-xs"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              "Save Expense Voucher"
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/25 p-4 flex items-start gap-3 text-xs text-destructive animate-fade-in">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Expense Details Card */}
      <Card>
        <CardHeader className="border-b border-border/70 pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FileText className="h-4.5 w-4.5 text-primary" />
            Expense Voucher Details
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Record direct cost or operational disbursement with full financial classification
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date & Time */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-muted-foreground" /> Date & Time <span className="text-destructive">*</span>
              </label>
              <Input
                type="datetime-local"
                value={formData.expenseDate}
                onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                required
                className="h-9.5 text-xs sm:text-sm bg-background"
              />
            </div>

            {/* Expense Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Tag className="h-4 w-4 text-muted-foreground" /> Expense Category <span className="text-destructive">*</span>
              </label>
              <Select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                required
                className="h-9.5 text-xs sm:text-sm bg-background"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} {cat.description ? `(${cat.description})` : ""}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Title / Expense Purpose <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. 100x 20kg Thermocol Boxes / 25 Tons Crushed Tube Ice"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="h-9.5 text-xs sm:text-sm bg-background"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Detailed Description / Specifications (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Specify vendor breakdown, rates, batch number, or operational notes..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg bg-background border border-input text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            {/* Amount */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Amount (₹ / $) <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={formData.amount !== undefined ? formData.amount : ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amount: e.target.value === "" ? undefined : parseFloat(e.target.value),
                  })
                }
                required
                className="h-9.5 text-xs sm:text-sm font-mono font-bold bg-background"
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-muted-foreground" /> Payment Method <span className="text-destructive">*</span>
              </label>
              <Select
                value={formData.paymentMethod}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentMethod: e.target.value as "CASH" | "BANK_TRANSFER" | "CHEQUE" | "UPI" | "CREDIT_CARD",
                  })
                }
                required
                className="h-9.5 text-xs sm:text-sm bg-background"
              >
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
                <option value="UPI">UPI / Instant Digital</option>
                <option value="CHEQUE">Cheque</option>
                <option value="CREDIT_CARD">Credit Card</option>
              </Select>
            </div>

            {/* Paid To */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <User className="h-4 w-4 text-muted-foreground" /> Paid To (Vendor / Contractor)
              </label>
              <Input
                type="text"
                placeholder="Vendor or contractor name"
                value={formData.paidTo}
                onChange={(e) => setFormData({ ...formData, paidTo: e.target.value })}
                className="h-9.5 text-xs sm:text-sm bg-background"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Attachment & Verification Card */}
      <Card>
        <CardHeader className="border-b border-border/70 pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Upload className="h-4.5 w-4.5 text-primary" />
            Invoice / Receipt Attachment
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Upload merchant bill, tax invoice or weighbridge cash voucher (PDF, PNG, JPG)
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <label className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-border hover:border-primary/50 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer flex-1">
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                disabled={uploading}
                className="sr-only"
              />
              <div className="flex flex-col items-center text-center space-y-1.5">
                {uploading ? (
                  <>
                    <Loader2 className="h-6 w-6 text-primary animate-spin mb-1" />
                    <span className="text-xs sm:text-sm font-medium text-foreground">Uploading to Cloud Storage...</span>
                  </>
                ) : formData.invoiceUrl ? (
                  <>
                    <FileCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mb-1" />
                    <span className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {formData.invoiceFileName || "Invoice Uploaded Successfully"}
                    </span>
                    <span className="text-xs text-muted-foreground">Click to replace file</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                    <span className="text-xs sm:text-sm font-medium text-foreground">Click or drag bill / invoice here</span>
                    <span className="text-xs text-muted-foreground">PDF, JPG, PNG up to 10MB</span>
                  </>
                )}
              </div>
            </label>

            {formData.invoiceUrl && (
              <div className="p-4 rounded-xl border border-border/80 bg-card flex flex-col justify-center sm:w-64 space-y-2 shadow-2xs">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Attached Document</span>
                <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{formData.invoiceFileName || "invoice.pdf"}</p>
                <a
                  href={formData.invoiceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                >
                  Preview Document ↗
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Link href="/expenses">
          <Button type="button" variant="outline" size="sm" className="h-9 font-medium">
            Cancel
          </Button>
        </Link>
        <Button
          type="submit"
          disabled={loading || uploading}
          size="sm"
          className="h-9 px-6 text-xs sm:text-sm font-semibold shadow-xs"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            "Record Expense Voucher"
          )}
        </Button>
      </div>
    </form>
  );
}
