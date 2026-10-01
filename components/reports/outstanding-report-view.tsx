"use client";

import * as React from "react";
import { ReportNav } from "./report-nav";
import { ReportFilters } from "./report-filters";
import { ReportExportToolbar } from "./report-export-toolbar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import type { OutstandingReportData, ReportLookupData, ReportFilterOptions } from "@/types/financial-reports";
import { PartyLedgerDialog } from "./party-ledger-dialog";
import { ExternalLink } from "lucide-react";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

interface OutstandingReportViewProps {
  initialData: OutstandingReportData;
  lookups: ReportLookupData;
}

export function OutstandingReportView({ initialData, lookups }: OutstandingReportViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [data, setData] = React.useState<OutstandingReportData>(initialData);
  const [selectedParty, setSelectedParty] = React.useState<{
    type: "SUPPLIER" | "CUSTOMER";
    id: string;
    name: string;
  } | null>(null);
  const [filters, setFilters] = React.useState<ReportFilterOptions>(() => {
    const fromUrl: ReportFilterOptions = { ...initialData.filters };
    if (searchParams) {
      if (searchParams.get("startDate")) fromUrl.startDate = searchParams.get("startDate")!;
      if (searchParams.get("endDate")) fromUrl.endDate = searchParams.get("endDate")!;
      if (searchParams.get("month")) fromUrl.month = parseInt(searchParams.get("month")!, 10);
      if (searchParams.get("year")) fromUrl.year = parseInt(searchParams.get("year")!, 10);
      if (searchParams.get("customerId")) fromUrl.customerId = searchParams.get("customerId")!;
      if (searchParams.get("supplierId")) fromUrl.supplierId = searchParams.get("supplierId")!;
      if (searchParams.get("paymentStatus")) fromUrl.paymentStatus = searchParams.get("paymentStatus")! as ReportFilterOptions["paymentStatus"];
      if (searchParams.get("invoiceNumber")) fromUrl.invoiceNumber = searchParams.get("invoiceNumber")!;
      if (searchParams.get("search")) fromUrl.search = searchParams.get("search")!;
    }
    return fromUrl;
  });
  const [activeTab, setActiveTab] = React.useState<"receivables" | "payables">("receivables");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleFilterChange = async (newFilters: ReportFilterOptions) => {
    setFilters(newFilters);
    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      Object.entries(newFilters).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "" && val !== "ALL") {
          params.set(key, String(val));
        }
      });

      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });

      const res = await fetch(`/api/reports/outstanding?${queryString}`);
      if (res.ok) {
        const fresh: OutstandingReportData = await res.json();
        setData(fresh);
      }
    } catch (err) {
      console.error("Failed to refresh outstanding report:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const { summary, receivables, payables } = data;

  return (
    <div className="space-y-5">
      <ReportNav />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Outstanding Balances & Working Capital Aging
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Credit exposure monitoring: Customer accounts receivable vs fishing vessel procurement liabilities
          </p>
        </div>

        <ReportExportToolbar reportType="outstanding" filters={filters} />
      </div>

      <div className="print:hidden">
        <ReportFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          lookups={lookups}
          showCustomer={true}
          showSupplier={true}
          showFishType={false}
          showPaymentStatus={true}
          showInvoiceSearch={true}
          isLoading={isLoading}
        />
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-4 bg-card border-l-4 border-l-sky-500">
          <span className="text-[11px] font-medium text-muted-foreground uppercase">
            Total Customer Receivables
          </span>
          <div className="text-xl font-bold font-mono text-sky-600 dark:text-sky-400 mt-1">
            {formatCurrency(summary.totalReceivables)}
          </div>
          <span className="text-[11px] text-muted-foreground">
            {summary.activeDebtorCount} customers with due balances
          </span>
        </Card>

        <Card className="p-4 bg-card border-l-4 border-l-orange-500">
          <span className="text-[11px] font-medium text-muted-foreground uppercase">
            Total Supplier Payables
          </span>
          <div className="text-xl font-bold font-mono text-orange-600 dark:text-orange-400 mt-1">
            {formatCurrency(summary.totalPayables)}
          </div>
          <span className="text-[11px] text-muted-foreground">
            {summary.activeCreditorCount} vessel suppliers to settle
          </span>
        </Card>

        <Card className="p-4 bg-card border-l-4 border-l-emerald-500">
          <span className="text-[11px] font-medium text-muted-foreground uppercase">
            Net Working Capital Position
          </span>
          <div className={`text-xl font-bold font-mono mt-1 ${summary.netWorkingCapital >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
            {formatCurrency(summary.netWorkingCapital)}
          </div>
          <span className="text-[11px] text-muted-foreground">
            Receivables minus payables
          </span>
        </Card>
      </div>

      {/* Sub-tab Switcher */}
      <div className="flex items-center gap-2 border-b border-border pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("receivables")}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === "receivables"
              ? "bg-primary text-primary-foreground font-semibold shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          Customer Receivables ({receivables.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("payables")}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === "payables"
              ? "bg-primary text-primary-foreground font-semibold shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          Supplier Payables ({payables.length})
        </button>
      </div>

      {/* Receivables Table */}
      {activeTab === "receivables" && (
        <Card>
          <CardContent className="p-0">
            <div className="rounded-lg overflow-x-auto border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 text-[11px]">
                    <TableHead className="font-semibold">Customer Code</TableHead>
                    <TableHead className="font-semibold">Customer / Company</TableHead>
                    <TableHead className="font-semibold">Phone</TableHead>
                    <TableHead className="text-right font-semibold">Orders Count</TableHead>
                    <TableHead className="text-right font-semibold">Total Billed</TableHead>
                    <TableHead className="text-right font-semibold">Total Collected</TableHead>
                    <TableHead className="text-right font-semibold">Outstanding Due</TableHead>
                    <TableHead className="text-right font-semibold">Credit Limit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receivables.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10 text-xs text-muted-foreground">
                        No customer accounts with outstanding balances.
                      </TableCell>
                    </TableRow>
                  ) : (
                      receivables.map((r) => (
                      <TableRow
                        key={r.customerId}
                        className="text-xs hover:bg-muted/40 transition-colors group"
                      >
                        <TableCell className="font-mono font-medium">{r.customerCode}</TableCell>
                        <TableCell>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedParty({
                                type: "CUSTOMER",
                                id: r.customerId,
                                name: r.customerName,
                              })
                            }
                            className="text-left group-hover:text-primary transition-colors flex flex-col items-start focus:outline-none"
                          >
                            <span className="font-semibold text-foreground group-hover:text-primary group-hover:underline flex items-center gap-1.5">
                              {r.customerName}
                              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                            </span>
                            {r.companyName && (
                              <span className="text-[11px] text-muted-foreground">{r.companyName}</span>
                            )}
                          </button>
                        </TableCell>
                        <TableCell className="font-mono text-muted-foreground">{r.phone}</TableCell>
                        <TableCell className="text-right font-mono text-muted-foreground">{r.totalSalesCount}</TableCell>
                        <TableCell className="text-right font-mono text-muted-foreground">{formatCurrency(r.totalBilled)}</TableCell>
                        <TableCell className="text-right font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                          {formatCurrency(r.totalPaid)}
                        </TableCell>
                        <TableCell className={`text-right font-mono font-bold ${r.outstandingBalance > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}>
                          {formatCurrency(r.outstandingBalance)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-muted-foreground">
                          {formatCurrency(r.creditLimit)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
                {receivables.length > 0 && (
                  <tfoot>
                    <tr className="bg-muted/70 font-semibold text-xs border-t border-border">
                      <td className="p-3 font-bold text-foreground" colSpan={4}>
                        TOTAL RECEIVABLES ({receivables.length} Accounts)
                      </td>
                      <td className="p-3 text-right font-mono">
                        {formatCurrency(receivables.reduce((s, r) => s + r.totalBilled, 0))}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(receivables.reduce((s, r) => s + r.totalPaid, 0))}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                        {formatCurrency(summary.totalReceivables)}
                      </td>
                      <td className="p-3" />
                    </tr>
                  </tfoot>
                )}
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payables Table */}
      {activeTab === "payables" && (
        <Card>
          <CardContent className="p-0">
            <div className="rounded-lg overflow-x-auto border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 text-[11px]">
                    <TableHead className="font-semibold">Supplier Code</TableHead>
                    <TableHead className="font-semibold">Supplier / Owner</TableHead>
                    <TableHead className="font-semibold">Vessel / Harbor</TableHead>
                    <TableHead className="font-semibold">Phone</TableHead>
                    <TableHead className="text-right font-semibold">Batches Count</TableHead>
                    <TableHead className="text-right font-semibold">Total Procured</TableHead>
                    <TableHead className="text-right font-semibold">Total Paid</TableHead>
                    <TableHead className="text-right font-semibold">Outstanding Payable</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payables.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10 text-xs text-muted-foreground">
                        No supplier accounts with outstanding payables.
                      </TableCell>
                    </TableRow>
                  ) : (
                    payables.map((p) => (
                      <TableRow
                        key={p.supplierId}
                        className="text-xs hover:bg-muted/40 transition-colors group"
                      >
                        <TableCell className="font-mono font-medium">{p.supplierCode}</TableCell>
                        <TableCell>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedParty({
                                type: "SUPPLIER",
                                id: p.supplierId,
                                name: p.supplierName,
                              })
                            }
                            className="text-left group-hover:text-primary transition-colors flex items-center gap-1.5 font-semibold text-foreground group-hover:underline focus:outline-none"
                          >
                            {p.supplierName}
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                          </button>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-[11px]">
                          {p.boatName || p.harborLocation || "-"}
                        </TableCell>
                        <TableCell className="font-mono text-muted-foreground">{p.phone}</TableCell>
                        <TableCell className="text-right font-mono text-muted-foreground">{p.totalPurchasesCount}</TableCell>
                        <TableCell className="text-right font-mono text-muted-foreground">{formatCurrency(p.totalProcured)}</TableCell>
                        <TableCell className="text-right font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                          {formatCurrency(p.totalPaid)}
                        </TableCell>
                        <TableCell className={`text-right font-mono font-bold ${p.outstandingPayable > 0 ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground"}`}>
                          {formatCurrency(p.outstandingPayable)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
                {payables.length > 0 && (
                  <tfoot>
                    <tr className="bg-muted/70 font-semibold text-xs border-t border-border">
                      <td className="p-3 font-bold text-foreground" colSpan={5}>
                        TOTAL PAYABLES ({payables.length} Accounts)
                      </td>
                      <td className="p-3 text-right font-mono">
                        {formatCurrency(payables.reduce((s, p) => s + p.totalProcured, 0))}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(payables.reduce((s, p) => s + p.totalPaid, 0))}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-orange-600 dark:text-orange-400">
                        {formatCurrency(summary.totalPayables)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Party Ledger Drilldown Modal */}
      <PartyLedgerDialog
        isOpen={!!selectedParty}
        onClose={() => setSelectedParty(null)}
        partyType={selectedParty?.type || null}
        partyId={selectedParty?.id || null}
        partyName={selectedParty?.name}
      />
    </div>
  );
}
