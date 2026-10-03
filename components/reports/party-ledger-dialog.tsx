"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  X,
  Loader2,
  Building2,
  Phone,
  MapPin,
  Anchor,
  Receipt,
  Printer,
  ChevronDown,
  ChevronUp,
  Search,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { formatCurrency, formatWeight, formatDate } from "@/lib/utils";
import type { PartyLedgerDTO } from "@/types/party-ledger";

interface PartyLedgerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  partyType: "SUPPLIER" | "CUSTOMER" | null;
  partyId: string | null;
  partyName?: string;
}

export function PartyLedgerDialog({
  isOpen,
  onClose,
  partyType,
  partyId,
  partyName,
}: PartyLedgerDialogProps) {
  const [mounted, setMounted] = React.useState(false);
  const [ledger, setLedger] = React.useState<PartyLedgerDTO | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<"transactions" | "payments" | "species">("transactions");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = React.useState<string>("ALL");
  const [expandedTxId, setExpandedTxId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const fetchLedger = React.useCallback(async () => {
    if (!partyType || !partyId) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/reports/outstanding/party-ledger?type=${partyType}&id=${partyId}`
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to load party ledger");
      }
      const data: PartyLedgerDTO = await res.json();
      setLedger(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [partyType, partyId]);

  React.useEffect(() => {
    if (isOpen && partyId && partyType) {
      fetchLedger();
      setSearchQuery("");
      setPaymentStatusFilter("ALL");
      setExpandedTxId(null);
      setActiveTab("transactions");
    } else {
      setLedger(null);
    }
  }, [isOpen, partyId, partyType, fetchLedger]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const isSupplier = partyType === "SUPPLIER";
  const party = ledger?.party;
  const summary = ledger?.financialSummary;

  // Filter transactions
  const filteredTransactions = (ledger?.transactions || []).filter((tx) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      tx.transactionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.items.some((it) => it.fishName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tx.notes && tx.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      paymentStatusFilter === "ALL" || tx.paymentStatus === paymentStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Filter payments
  const filteredPayments = (ledger?.payments || []).filter((pm) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      pm.paymentNumber.toLowerCase().includes(q) ||
      (pm.referenceNumber && pm.referenceNumber.toLowerCase().includes(q)) ||
      (pm.relatedTransactionNumber && pm.relatedTransactionNumber.toLowerCase().includes(q)) ||
      (pm.notes && pm.notes.toLowerCase().includes(q))
    );
  });

  const toggleExpand = (txId: string) => {
    setExpandedTxId((prev) => (prev === txId ? null : txId));
  };

  const handlePrint = () => {
    window.print();
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 md:p-8 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Container - Locked to Viewport Center with Own Scroll Context */}
      <div className="relative z-[100000] w-full max-w-6xl rounded-2xl border border-border bg-card text-card-foreground shadow-2xl overflow-hidden flex flex-col h-[90vh] max-h-[90vh] animate-in zoom-in-95 duration-150">
        
        {/* Sticky Header Strip */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-border bg-card/95 backdrop-blur-md shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 shrink-0">
              {isSupplier ? <Anchor className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                  {party?.name || partyName || "Party Ledger"}
                </h2>
                {party?.code && (
                  <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0">
                    {party.code}
                  </Badge>
                )}
                <Badge variant={isSupplier ? "secondary" : "default"} className="text-[10px] px-2 py-0.5">
                  {isSupplier ? "Supplier (Creditor)" : "Customer (Debtor)"}
                </Badge>
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5 flex flex-wrap items-center gap-3">
                {isSupplier && party?.boatName && (
                  <span className="flex items-center gap-1">
                    <Anchor className="h-3 w-3 text-primary" /> Boat: <strong className="text-foreground">{party.boatName}</strong>
                  </span>
                )}
                {isSupplier && party?.harborLocation && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-primary" /> Harbor: {party.harborLocation}
                  </span>
                )}
                {!isSupplier && party?.companyName && (
                  <span>Company: <strong className="text-foreground">{party.companyName}</strong></span>
                )}
                {party?.phone && (
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="h-3 w-3 text-primary" /> {party.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="h-8.5 text-xs gap-1.5 hidden sm:flex"
            >
              <Printer className="h-3.5 w-3.5" />
              Print Statement
            </Button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 pb-12">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-xs font-medium">Loading comprehensive transaction history & costs...</p>
            </div>
          ) : error ? (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-5 text-center space-y-3">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
              <p className="text-sm font-semibold text-destructive">{error}</p>
              <Button size="sm" variant="outline" onClick={fetchLedger}>
                Try Again
              </Button>
            </div>
          ) : ledger && summary ? (
            <>
              {/* Financial KPI Strip & Cost Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Outstanding Net Balance (Highlighted) */}
                <Card className={`p-3.5 border-l-4 ${
                  isSupplier
                    ? summary.totalOutstandingAmount > 0
                      ? "border-l-orange-500 bg-orange-500/5 dark:bg-orange-950/20"
                      : "border-l-emerald-500 bg-emerald-500/5"
                    : summary.totalOutstandingAmount > 0
                    ? "border-l-amber-500 bg-amber-500/5 dark:bg-amber-950/20"
                    : "border-l-emerald-500 bg-emerald-500/5"
                }`}>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {isSupplier ? "Total Amount to Pay" : "Total Amount to Get"}
                  </span>
                  <div className={`text-xl sm:text-2xl font-bold font-mono mt-1 ${
                    summary.totalOutstandingAmount > 0
                      ? isSupplier ? "text-orange-600 dark:text-orange-400" : "text-amber-600 dark:text-amber-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}>
                    {formatCurrency(summary.totalOutstandingAmount)}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">
                    {summary.totalOutstandingAmount > 0 ? "Pending balance" : "Fully settled"}
                  </span>
                </Card>

                {/* Total Procured / Billed */}
                <Card className="p-3.5 bg-card border border-border">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {isSupplier ? "Total Fish Procured" : "Total Orders Billed"}
                  </span>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-foreground mt-1">
                    {formatCurrency(summary.totalBilledAmount)}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">
                    {summary.totalTransactionsCount} batches ({formatWeight(summary.totalWeightKg)})
                  </span>
                </Card>

                {/* Total Paid / Collected */}
                <Card className="p-3.5 bg-card border border-border">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {isSupplier ? "Total Paid to Supplier" : "Total Collected"}
                  </span>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                    {formatCurrency(summary.totalPaidAmount)}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">
                    {ledger.payments.length} payment records
                  </span>
                </Card>

                {/* Raw Fish Material Cost */}
                <Card className="p-3.5 bg-card border border-border">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Raw Fish Cost
                  </span>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-sky-600 dark:text-sky-400 mt-1">
                    {formatCurrency(summary.costBreakdown.rawFishCost)}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">
                    Base seafood purchase price
                  </span>
                </Card>
              </div>

              {/* Detailed Cost Breakdown Summary Strip */}
              <div className="rounded-lg border border-border/80 bg-muted/20 p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Receipt className="h-3.5 w-3.5 text-primary" />
                    All Costs Breakdown for this Company
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Total Volume: <strong>{formatWeight(summary.totalWeightKg)}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
                  <div className="p-2 rounded bg-card border border-border/60">
                    <span className="text-[10px] text-muted-foreground block">Raw Fish Cost</span>
                    <span className="font-mono font-bold text-foreground">
                      {formatCurrency(summary.costBreakdown.rawFishCost)}
                    </span>
                  </div>

                  <div className="p-2 rounded bg-card border border-border/60">
                    <span className="text-[10px] text-muted-foreground block">Ice Cost</span>
                    <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                      {formatCurrency(summary.costBreakdown.iceCost)}
                    </span>
                  </div>

                  <div className="p-2 rounded bg-card border border-border/60">
                    <span className="text-[10px] text-muted-foreground block">Transport Cost</span>
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                      {formatCurrency(summary.costBreakdown.transportCost)}
                    </span>
                  </div>

                  <div className="p-2 rounded bg-card border border-border/60">
                    <span className="text-[10px] text-muted-foreground block">Labour Cost</span>
                    <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                      {formatCurrency(summary.costBreakdown.labourCost)}
                    </span>
                  </div>

                  <div className="p-2 rounded bg-card border border-border/60">
                    <span className="text-[10px] text-muted-foreground block">Packing / Boxes</span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {formatCurrency(summary.costBreakdown.packingCost + summary.costBreakdown.thermocolBoxCost)}
                    </span>
                  </div>

                  <div className="p-2 rounded bg-card border border-border/60">
                    <span className="text-[10px] text-muted-foreground block">Total Transaction Value</span>
                    <span className="font-mono font-bold text-primary">
                      {formatCurrency(summary.costBreakdown.totalCost)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs & Search Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-3">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab("transactions")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      activeTab === "transactions"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    All Past Transactions ({ledger.transactions.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("payments")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      activeTab === "payments"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    Payment History ({ledger.payments.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("species")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      activeTab === "species"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    Fish Species ({ledger.speciesBreakdown.length})
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative w-full sm:w-56">
                    <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search batch, fish, notes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-8 pl-8 text-xs"
                    />
                  </div>

                  {activeTab === "transactions" && (
                    <select
                      value={paymentStatusFilter}
                      onChange={(e) => setPaymentStatusFilter(e.target.value)}
                      className="h-8 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="ALL">All Status</option>
                      <option value="UNPAID">Unpaid</option>
                      <option value="PARTIAL">Partial</option>
                      <option value="PAID">Paid</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Tab 1: All Past Transactions */}
              {activeTab === "transactions" && (
                <div className="space-y-3">
                  <div className="rounded-lg border border-border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50 text-[11px]">
                          <TableHead className="w-8"></TableHead>
                          <TableHead className="font-semibold">Date & Number</TableHead>
                          <TableHead className="font-semibold">Weight</TableHead>
                          <TableHead className="font-semibold text-right">Raw Fish Cost</TableHead>
                          <TableHead className="font-semibold text-right">Ice Cost</TableHead>
                          <TableHead className="font-semibold text-right">Transport Cost</TableHead>
                          <TableHead className="font-semibold text-right">Labour Cost</TableHead>
                          <TableHead className="font-semibold text-right">Packing Cost</TableHead>
                          <TableHead className="font-semibold text-right">Total Amount</TableHead>
                          <TableHead className="font-semibold text-right">Paid</TableHead>
                          <TableHead className="font-semibold text-right">Balance Due</TableHead>
                          <TableHead className="font-semibold text-center">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTransactions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={12} className="text-center py-10 text-xs text-muted-foreground">
                              No transactions match the filter criteria.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredTransactions.map((tx) => {
                            const isExpanded = expandedTxId === tx.id;
                            return (
                              <React.Fragment key={tx.id}>
                                <TableRow
                                  className={`text-xs cursor-pointer hover:bg-muted/40 transition-colors ${
                                    isExpanded ? "bg-muted/30" : ""
                                  }`}
                                  onClick={() => toggleExpand(tx.id)}
                                >
                                  <TableCell className="p-2 text-center text-muted-foreground">
                                    {isExpanded ? (
                                      <ChevronUp className="h-4 w-4 mx-auto" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4 mx-auto" />
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <div className="font-mono font-semibold text-foreground">
                                      {tx.transactionNumber}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground">
                                      {formatDate(tx.date)}
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-mono text-muted-foreground">
                                    {formatWeight(tx.totalWeightKg)}
                                  </TableCell>
                                  <TableCell className="text-right font-mono text-foreground font-medium">
                                    {formatCurrency(tx.costs.rawFishCost)}
                                  </TableCell>
                                  <TableCell className="text-right font-mono text-sky-600 dark:text-sky-400">
                                    {tx.costs.iceCost > 0 ? formatCurrency(tx.costs.iceCost) : "-"}
                                  </TableCell>
                                  <TableCell className="text-right font-mono text-amber-600 dark:text-amber-400">
                                    {tx.costs.transportCost > 0 ? formatCurrency(tx.costs.transportCost) : "-"}
                                  </TableCell>
                                  <TableCell className="text-right font-mono text-purple-600 dark:text-purple-400">
                                    {tx.costs.labourCost > 0 ? formatCurrency(tx.costs.labourCost) : "-"}
                                  </TableCell>
                                  <TableCell className="text-right font-mono text-indigo-600 dark:text-indigo-400">
                                    {tx.costs.packingCost > 0 ? formatCurrency(tx.costs.packingCost) : "-"}
                                  </TableCell>
                                  <TableCell className="text-right font-mono font-bold text-foreground">
                                    {formatCurrency(tx.totalAmount)}
                                  </TableCell>
                                  <TableCell className="text-right font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                                    {formatCurrency(tx.paidAmount)}
                                  </TableCell>
                                  <TableCell className={`text-right font-mono font-bold ${
                                    tx.balanceAmount > 0
                                      ? isSupplier ? "text-orange-600 dark:text-orange-400" : "text-amber-600 dark:text-amber-400"
                                      : "text-muted-foreground"
                                  }`}>
                                    {formatCurrency(tx.balanceAmount)}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Badge
                                      variant={
                                        tx.paymentStatus === "PAID"
                                          ? "secondary"
                                          : tx.paymentStatus === "PARTIAL"
                                          ? "outline"
                                          : "destructive"
                                      }
                                      className="text-[9px] px-1.5 py-0 uppercase"
                                    >
                                      {tx.paymentStatus}
                                    </Badge>
                                  </TableCell>
                                </TableRow>

                                {/* Expanded Itemized Fish Lots & Cost Details */}
                                {isExpanded && (
                                  <TableRow className="bg-muted/15 border-b border-border">
                                    <TableCell colSpan={12} className="p-3">
                                      <div className="rounded-lg border border-border/70 bg-card p-3 space-y-3">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/50 pb-2">
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-foreground">
                                              Itemized Fish Lots for {tx.transactionNumber}
                                            </span>
                                            <span className="text-[11px] text-muted-foreground">
                                              ({tx.items.length} items, Total {formatWeight(tx.totalWeightKg)})
                                            </span>
                                          </div>
                                          {tx.notes && (
                                            <span className="text-[11px] text-muted-foreground italic">
                                              Notes: {tx.notes}
                                            </span>
                                          )}
                                        </div>

                                        {/* Fish Items Table */}
                                        <div className="rounded-md border border-border/60 overflow-hidden">
                                          <Table>
                                            <TableHeader>
                                              <TableRow className="bg-muted/40 text-[10px]">
                                                <TableHead>Fish Name / Species</TableHead>
                                                <TableHead>Category</TableHead>
                                                <TableHead>Grade</TableHead>
                                                <TableHead className="text-right">Quantity (kg)</TableHead>
                                                <TableHead className="text-right">Rate / kg</TableHead>
                                                <TableHead className="text-right">Total Fish Cost</TableHead>
                                              </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                              {tx.items.map((it, idx) => (
                                                <TableRow key={idx} className="text-xs">
                                                  <TableCell className="font-semibold text-foreground">
                                                    {it.fishName}
                                                    {it.fishCode && (
                                                      <span className="text-[10px] text-muted-foreground font-mono ml-1.5">
                                                        ({it.fishCode})
                                                      </span>
                                                    )}
                                                  </TableCell>
                                                  <TableCell className="text-muted-foreground text-[11px]">
                                                    {it.category}
                                                  </TableCell>
                                                  <TableCell>
                                                    <Badge variant="outline" className="text-[10px]">
                                                      {it.grade}
                                                    </Badge>
                                                  </TableCell>
                                                  <TableCell className="text-right font-mono font-medium">
                                                    {formatWeight(it.weightKg)}
                                                  </TableCell>
                                                  <TableCell className="text-right font-mono text-muted-foreground">
                                                    {formatCurrency(it.unitPricePerKg)}
                                                  </TableCell>
                                                  <TableCell className="text-right font-mono font-bold text-foreground">
                                                    {formatCurrency(it.totalCost)}
                                                  </TableCell>
                                                </TableRow>
                                              ))}
                                            </TableBody>
                                          </Table>
                                        </div>

                                        {/* Linked Direct Order Expenses */}
                                        {tx.expenses && tx.expenses.length > 0 && (
                                          <div className="space-y-2 pt-2 border-t border-border/60">
                                            <div className="flex items-center justify-between">
                                              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                                <Receipt className="h-3.5 w-3.5 text-primary" />
                                                Linked Order Expenses ({tx.expenses.length})
                                              </span>
                                              <span className="text-[11px] font-mono font-semibold text-primary">
                                                Total Order Expenses: {formatCurrency(tx.expenses.reduce((s, e) => s + e.amount, 0))}
                                              </span>
                                            </div>

                                            <div className="rounded-md border border-border/60 overflow-hidden bg-card">
                                              <Table>
                                                <TableHeader>
                                                  <TableRow className="bg-muted/40 text-[10px]">
                                                    <TableHead>Expense #</TableHead>
                                                    <TableHead>Category</TableHead>
                                                    <TableHead>Purpose / Description</TableHead>
                                                    <TableHead>Paid To</TableHead>
                                                    <TableHead>Payment Mode</TableHead>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead className="text-right">Amount</TableHead>
                                                  </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                  {tx.expenses.map((exp) => (
                                                    <TableRow key={exp.id} className="text-xs hover:bg-muted/30 transition-colors">
                                                      <TableCell className="font-mono font-semibold text-foreground">
                                                        {exp.expenseNumber}
                                                      </TableCell>
                                                      <TableCell>
                                                        <Badge variant="outline" className="text-[10px]">
                                                          {exp.categoryName}
                                                        </Badge>
                                                      </TableCell>
                                                      <TableCell className="font-medium text-foreground">
                                                        {exp.title}
                                                        {exp.notes && (
                                                          <span className="text-[10px] text-muted-foreground block truncate max-w-xs">
                                                            {exp.notes}
                                                          </span>
                                                        )}
                                                      </TableCell>
                                                      <TableCell className="text-muted-foreground text-[11px]">
                                                        {exp.paidTo || "-"}
                                                      </TableCell>
                                                      <TableCell>
                                                        <Badge variant="secondary" className="text-[9px]">
                                                          {exp.paymentMethod.replace(/_/g, " ")}
                                                        </Badge>
                                                      </TableCell>
                                                      <TableCell className="font-mono text-muted-foreground text-[11px]">
                                                        {formatDate(exp.expenseDate)}
                                                      </TableCell>
                                                      <TableCell className="text-right font-mono font-bold text-foreground">
                                                        {formatCurrency(exp.amount)}
                                                      </TableCell>
                                                    </TableRow>
                                                  ))}
                                                </TableBody>
                                              </Table>
                                            </div>
                                          </div>
                                        )}

                                        {/* Cost Elements Breakdown */}
                                        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                                          <span className="text-muted-foreground font-medium">Specific Charges & Costs:</span>
                                          <span className="px-2 py-0.5 rounded bg-muted/60 text-muted-foreground">
                                            Raw Fish: <strong className="text-foreground">{formatCurrency(tx.costs.rawFishCost)}</strong>
                                          </span>
                                          <span className="px-2 py-0.5 rounded bg-muted/60 text-muted-foreground">
                                            Ice: <strong className="text-sky-600 dark:text-sky-400">{formatCurrency(tx.costs.iceCost)}</strong>
                                          </span>
                                          <span className="px-2 py-0.5 rounded bg-muted/60 text-muted-foreground">
                                            Transport: <strong className="text-amber-600 dark:text-amber-400">{formatCurrency(tx.costs.transportCost)}</strong>
                                          </span>
                                          <span className="px-2 py-0.5 rounded bg-muted/60 text-muted-foreground">
                                            Labour: <strong className="text-purple-600 dark:text-purple-400">{formatCurrency(tx.costs.labourCost)}</strong>
                                          </span>
                                          {tx.costs.packingCost > 0 && (
                                            <span className="px-2 py-0.5 rounded bg-muted/60 text-muted-foreground">
                                              Packing: <strong className="text-indigo-600 dark:text-indigo-400">{formatCurrency(tx.costs.packingCost)}</strong>
                                            </span>
                                          )}
                                          {tx.costs.otherCost > 0 && (
                                            <span className="px-2 py-0.5 rounded bg-muted/60 text-muted-foreground">
                                              Other Expenses: <strong className="text-rose-600 dark:text-rose-400">{formatCurrency(tx.costs.otherCost)}</strong>
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                )}
                              </React.Fragment>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Tab 2: Payment History */}
              {activeTab === "payments" && (
                <div className="space-y-3">
                  <div className="rounded-lg border border-border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50 text-[11px]">
                          <TableHead className="font-semibold">Date</TableHead>
                          <TableHead className="font-semibold">Payment Voucher #</TableHead>
                          <TableHead className="font-semibold">Payment Mode</TableHead>
                          <TableHead className="font-semibold">Reference #</TableHead>
                          <TableHead className="font-semibold">Related Order / Bill</TableHead>
                          <TableHead className="font-semibold text-right">Amount</TableHead>
                          <TableHead className="font-semibold">Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPayments.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-10 text-xs text-muted-foreground">
                              No payment records found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredPayments.map((pm) => (
                            <TableRow key={pm.id} className="text-xs hover:bg-muted/30 transition-colors">
                              <TableCell className="font-mono text-muted-foreground">
                                {formatDate(pm.paymentDate)}
                              </TableCell>
                              <TableCell className="font-mono font-semibold text-foreground">
                                {pm.paymentNumber}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-[10px]">
                                  {pm.paymentMethod.replace(/_/g, " ")}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono text-muted-foreground">
                                {pm.referenceNumber || "-"}
                              </TableCell>
                              <TableCell className="font-mono font-medium text-foreground">
                                {pm.relatedTransactionNumber || "-"}
                              </TableCell>
                              <TableCell className="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(pm.amount)}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-[11px] max-w-xs truncate">
                                {pm.notes || "-"}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                      {filteredPayments.length > 0 && (
                        <tfoot>
                          <tr className="bg-muted/70 font-semibold text-xs border-t border-border">
                            <td className="p-3 font-bold text-foreground" colSpan={5}>
                              TOTAL RECORDED PAYMENTS ({filteredPayments.length} Transactions)
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(filteredPayments.reduce((s, p) => s + p.amount, 0))}
                            </td>
                            <td className="p-3" />
                          </tr>
                        </tfoot>
                      )}
                    </Table>
                  </div>
                </div>
              )}

              {/* Tab 3: Fish Species Traded */}
              {activeTab === "species" && (
                <div className="space-y-3">
                  <div className="rounded-lg border border-border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50 text-[11px]">
                          <TableHead className="font-semibold">Fish Species Name</TableHead>
                          <TableHead className="font-semibold">Category</TableHead>
                          <TableHead className="font-semibold text-right">Transactions Count</TableHead>
                          <TableHead className="font-semibold text-right">Total Quantity (kg)</TableHead>
                          <TableHead className="font-semibold text-right">Average Rate / kg</TableHead>
                          <TableHead className="font-semibold text-right">Total Fish Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ledger.speciesBreakdown.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-10 text-xs text-muted-foreground">
                              No fish species records for this party.
                            </TableCell>
                          </TableRow>
                        ) : (
                          ledger.speciesBreakdown.map((sp, idx) => (
                            <TableRow key={idx} className="text-xs hover:bg-muted/30 transition-colors">
                              <TableCell className="font-semibold text-foreground">
                                {sp.fishName}
                                {sp.fishCode && (
                                  <span className="text-[10px] text-muted-foreground font-mono ml-1.5">
                                    ({sp.fishCode})
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-[11px]">
                                {sp.category}
                              </TableCell>
                              <TableCell className="text-right font-mono text-muted-foreground">
                                {sp.transactionCount}
                              </TableCell>
                              <TableCell className="text-right font-mono font-medium text-foreground">
                                {formatWeight(sp.totalWeightKg)}
                              </TableCell>
                              <TableCell className="text-right font-mono text-muted-foreground">
                                {formatCurrency(sp.averageRatePerKg)}
                              </TableCell>
                              <TableCell className="text-right font-mono font-bold text-foreground">
                                {formatCurrency(sp.totalAmount)}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                      {ledger.speciesBreakdown.length > 0 && (
                        <tfoot>
                          <tr className="bg-muted/70 font-semibold text-xs border-t border-border">
                            <td className="p-3 font-bold text-foreground" colSpan={3}>
                              TOTAL ALL SPECIES
                            </td>
                            <td className="p-3 text-right font-mono font-bold">
                              {formatWeight(ledger.speciesBreakdown.reduce((s, sp) => s + sp.totalWeightKg, 0))}
                            </td>
                            <td className="p-3" />
                            <td className="p-3 text-right font-mono font-bold text-primary">
                              {formatCurrency(ledger.speciesBreakdown.reduce((s, sp) => s + sp.totalAmount, 0))}
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </Table>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 z-20 flex items-center justify-between px-6 py-3.5 border-t border-border bg-card/95 backdrop-blur-md shadow-xs">
          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            HPS SEA FOODS • Complete Ledger Statements & Cost Breakdowns
          </span>
          <div className="flex items-center gap-2.5 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="h-8.5 text-xs gap-1.5 sm:hidden"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </Button>
            <Button size="sm" variant="default" onClick={onClose} className="h-8.5 text-xs font-semibold px-4">
              Close Ledger
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
