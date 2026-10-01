"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Trash2,
  CreditCard,
  FileText,
  Anchor,
  Truck,
  Thermometer,
  Package,
  Clock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { formatCurrency, formatWeight, formatDate } from "@/lib/utils";
import { STATUS_BADGE_VARIANTS } from "@/constants";
import type { PurchaseDetailDTO } from "@/types";

interface PurchaseDetailsProps {
  purchase: PurchaseDetailDTO;
}

const PAYMENT_METHODS = [
  { label: "Bank Transfer", value: "BANK_TRANSFER" },
  { label: "Cash", value: "CASH" },
  { label: "Cheque", value: "CHEQUE" },
  { label: "UPI", value: "UPI" },
  { label: "Credit Card", value: "CREDIT_CARD" },
];

function formatPaymentMethod(method: string): string {
  return (
    PAYMENT_METHODS.find((m) => m.value === method)?.label ||
    method.replace(/_/g, " ")
  );
}

export function PurchaseDetails({ purchase }: PurchaseDetailsProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [showPaymentForm, setShowPaymentForm] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isRecordingPayment, setIsRecordingPayment] = React.useState(false);

  // Payment form state
  const [paymentAmount, setPaymentAmount] = React.useState(
    purchase.balanceAmount
  );
  const [paymentMethod, setPaymentMethod] = React.useState("BANK_TRANSFER");
  const [paymentDate, setPaymentDate] = React.useState(
    new Date().toISOString().slice(0, 16)
  );
  const [paymentRef, setPaymentRef] = React.useState("");
  const [paymentNotes, setPaymentNotes] = React.useState("");

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/purchases/${purchase.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete purchase");
      router.push("/purchases");
      router.refresh();
    } catch {
      setIsDeleting(false);
    }
  }

  async function handleRecordPayment(e: React.FormEvent) {
    e.preventDefault();
    setIsRecordingPayment(true);
    try {
      const res = await fetch(`/api/purchases/${purchase.id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: paymentAmount,
          paymentMethod,
          paymentDate,
          referenceNumber: paymentRef || null,
          notes: paymentNotes || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to record payment");
      }
      router.refresh();
      setShowPaymentForm(false);
    } catch {
      // Keep form open on error
    } finally {
      setIsRecordingPayment(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/purchases")}
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Back
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground font-mono">
                {purchase.purchaseNumber}
              </h1>
              <Badge
                variant={STATUS_BADGE_VARIANTS[purchase.status] ?? "secondary"}
              >
                {purchase.status}
              </Badge>
              <Badge
                variant={
                  STATUS_BADGE_VARIANTS[purchase.paymentStatus] ?? "secondary"
                }
              >
                {purchase.paymentStatus}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {purchase.supplierName} • {formatDate(purchase.purchaseDate)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {purchase.paymentStatus !== "PAID" && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => setShowPaymentForm(!showPaymentForm)}
            >
              <CreditCard className="h-3.5 w-3.5" />
              Record Payment
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs text-destructive hover:text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      {/* Payment Form Inline */}
      {showPaymentForm && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Record Payment for {purchase.purchaseNumber}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Amount *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={purchase.balanceAmount}
                    value={paymentAmount || ""}
                    onChange={(e) =>
                      setPaymentAmount(parseFloat(e.target.value) || 0)
                    }
                    className="h-8 text-xs font-mono"
                  />
                  <span className="text-[10px] text-muted-foreground">
                    Balance: {formatCurrency(purchase.balanceAmount)}
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Method
                  </label>
                  <Select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-8 text-xs"
                    options={PAYMENT_METHODS}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Payment Date
                  </label>
                  <Input
                    type="datetime-local"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Reference #
                  </label>
                  <Input
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    placeholder="NEFT-SBI-123"
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">
                  Payment Notes
                </label>
                <Input
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Optional payment notes..."
                  className="h-8 text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  size="sm"
                  className="gap-1 text-xs"
                  disabled={isRecordingPayment || paymentAmount <= 0}
                >
                  {isRecordingPayment && (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  )}
                  {isRecordingPayment ? "Recording..." : "Record Payment"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setShowPaymentForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Supplier & Logistics */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm">
                Supplier & Logistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-1">
                    <Anchor className="h-3 w-3" /> Supplier
                  </div>
                  <p className="text-sm font-medium">{purchase.supplierName}</p>
                  {purchase.supplierBoatName && (
                    <p className="text-xs text-muted-foreground">
                      🚢 {purchase.supplierBoatName}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    📞 {purchase.supplierPhone}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-1">
                    <Clock className="h-3 w-3" /> Purchase Date
                  </div>
                  <p className="text-sm font-medium">
                    {formatDate(purchase.purchaseDate)}
                  </p>
                </div>
                {purchase.landingHarbor && (
                  <div>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-1">
                      <Anchor className="h-3 w-3" /> Harbor
                    </div>
                    <p className="text-sm font-medium">
                      {purchase.landingHarbor}
                    </p>
                  </div>
                )}
                {purchase.truckNumber && (
                  <div>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-1">
                      <Truck className="h-3 w-3" /> Truck
                    </div>
                    <p className="text-sm font-mono font-medium">
                      {purchase.truckNumber}
                    </p>
                  </div>
                )}
                <div>
                  <div className="text-[11px] text-muted-foreground mb-1">
                    Payment Method
                  </div>
                  <p className="text-sm font-medium">
                    {formatPaymentMethod(purchase.paymentMethod)}
                  </p>
                </div>
                {purchase.invoiceUrl && (
                  <div>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-1">
                      <FileText className="h-3 w-3" /> Invoice
                    </div>
                    <Link
                      href={purchase.invoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary underline-offset-4 hover:underline"
                    >
                      {purchase.invoiceFileName || "View Invoice"}
                    </Link>
                  </div>
                )}
              </div>
              {purchase.notes && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="text-[11px] text-muted-foreground mb-1">
                    Notes
                  </div>
                  <p className="text-sm text-foreground">{purchase.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fish Items Table */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Package className="h-4 w-4" />
                Fish Items ({purchase.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="min-w-[500px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fish Type</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead className="text-center">
                        <Thermometer className="h-3 w-3 inline mr-1" />
                        Temp °C
                      </TableHead>
                      <TableHead className="text-right">Qty (kg)</TableHead>
                      <TableHead className="text-right">Rate/kg</TableHead>
                      <TableHead className="text-right">Item Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchase.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <span className="text-xs font-medium">
                              {item.fishTypeName}
                            </span>
                            <br />
                            <span className="text-[10px] font-mono text-muted-foreground">
                              {item.fishTypeCode}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          {item.grade}
                        </TableCell>
                        <TableCell className="text-center text-xs font-mono">
                          {item.temperatureC !== null &&
                          item.temperatureC !== undefined
                            ? `${item.temperatureC}°C`
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono font-medium">
                          {formatWeight(item.weightKg)}
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono">
                          {formatCurrency(item.unitPricePerKg)}
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono font-semibold">
                          {formatCurrency(item.totalCost)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          {purchase.payments.length > 0 && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payment History ({purchase.payments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table className="min-w-[500px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Voucher #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchase.payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="text-xs font-mono font-semibold text-primary">
                            {payment.paymentNumber}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDate(payment.paymentDate)}
                          </TableCell>
                          <TableCell className="text-xs">
                            {formatPaymentMethod(payment.paymentMethod)}
                          </TableCell>
                          <TableCell className="text-xs font-mono text-muted-foreground">
                            {payment.referenceNumber || "—"}
                          </TableCell>
                          <TableCell className="text-right text-xs font-mono font-semibold text-emerald-600">
                            {formatCurrency(payment.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Financial Summary */}
        <div className="space-y-6">
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total Weight</span>
                <span className="font-mono font-medium">
                  {formatWeight(purchase.totalWeightKg)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Items Subtotal</span>
                <span className="font-mono">
                  {formatCurrency(purchase.subtotal)}
                </span>
              </div>
              {purchase.transportCharges > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Transport</span>
                  <span className="font-mono">
                    +{formatCurrency(purchase.transportCharges)}
                  </span>
                </div>
              )}
              {purchase.iceCharges > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Ice</span>
                  <span className="font-mono">
                    +{formatCurrency(purchase.iceCharges)}
                  </span>
                </div>
              )}
              {purchase.labourCharges > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Labour</span>
                  <span className="font-mono">
                    +{formatCurrency(purchase.labourCharges)}
                  </span>
                </div>
              )}

              <div className="border-t border-border pt-2 mt-2">
                <div className="flex justify-between text-sm font-bold">
                  <span>Grand Total</span>
                  <span className="font-mono text-primary">
                    {formatCurrency(purchase.totalAmount)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-xs pt-1">
                <span className="text-muted-foreground">Paid</span>
                <span className="font-mono text-emerald-600">
                  -{formatCurrency(purchase.paidAmount)}
                </span>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Balance Due</span>
                <span
                  className={`font-mono ${
                    purchase.balanceAmount > 0
                      ? "text-amber-600"
                      : "text-emerald-600"
                  }`}
                >
                  {formatCurrency(purchase.balanceAmount)}
                </span>
              </div>

              <div className="pt-2 flex gap-2">
                <Badge
                  variant={
                    STATUS_BADGE_VARIANTS[purchase.paymentStatus] ?? "secondary"
                  }
                >
                  {purchase.paymentStatus}
                </Badge>
                <Badge
                  variant={
                    STATUS_BADGE_VARIANTS[purchase.status] ?? "secondary"
                  }
                >
                  {purchase.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardContent className="pt-6 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Created</span>
                <span className="text-foreground">
                  {formatDate(purchase.createdAt)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="text-foreground">
                  {formatDate(purchase.updatedAt)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Delete Purchase"
        description={`Are you sure you want to delete purchase ${purchase.purchaseNumber}? This will also remove all related inventory transactions and payment records. This action cannot be undone.`}
        confirmLabel={isDeleting ? "Deleting..." : "Delete Purchase"}
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}
