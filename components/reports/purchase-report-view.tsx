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
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, formatWeight } from "@/lib/utils";
import type { PurchaseReportData, ReportLookupData, ReportFilterOptions } from "@/types/financial-reports";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

interface PurchaseReportViewProps {
  initialData: PurchaseReportData;
  lookups: ReportLookupData;
}

export function PurchaseReportView({ initialData, lookups }: PurchaseReportViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [data, setData] = React.useState<PurchaseReportData>(initialData);
  const [filters, setFilters] = React.useState<ReportFilterOptions>(() => {
    const fromUrl: ReportFilterOptions = { ...initialData.filters };
    if (searchParams) {
      if (searchParams.get("startDate")) fromUrl.startDate = searchParams.get("startDate")!;
      if (searchParams.get("endDate")) fromUrl.endDate = searchParams.get("endDate")!;
      if (searchParams.get("month")) fromUrl.month = parseInt(searchParams.get("month")!, 10);
      if (searchParams.get("year")) fromUrl.year = parseInt(searchParams.get("year")!, 10);
      if (searchParams.get("supplierId")) fromUrl.supplierId = searchParams.get("supplierId")!;
      if (searchParams.get("fishTypeId")) fromUrl.fishTypeId = searchParams.get("fishTypeId")!;
      if (searchParams.get("paymentStatus")) fromUrl.paymentStatus = searchParams.get("paymentStatus")! as ReportFilterOptions["paymentStatus"];
      if (searchParams.get("invoiceNumber")) fromUrl.invoiceNumber = searchParams.get("invoiceNumber")!;
      if (searchParams.get("search")) fromUrl.search = searchParams.get("search")!;
    }
    return fromUrl;
  });
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

      const res = await fetch(`/api/reports/purchases?${queryString}`);
      if (res.ok) {
        const fresh: PurchaseReportData = await res.json();
        setData(fresh);
      }
    } catch (err) {
      console.error("Failed to refresh purchase report:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const { summary, rows } = data;

  return (
    <div className="space-y-5">
      <ReportNav />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Purchase & Dockside Inward Report
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Trawler catch procurement logs, landed weights, auxiliary ice/transport/labour charges, and supplier liabilities
          </p>
        </div>

        <ReportExportToolbar reportType="purchases" filters={filters} />
      </div>

      <div className="print:hidden">
        <ReportFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          lookups={lookups}
          showSupplier={true}
          showFishType={true}
          showPaymentStatus={true}
          showInvoiceSearch={true}
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 bg-card">
          <span className="text-[11px] font-medium text-muted-foreground uppercase">Total Purchase Spend</span>
          <div className="text-lg font-bold font-mono text-orange-600 dark:text-orange-400 mt-1">
            {formatCurrency(summary.totalPurchaseSpend)}
          </div>
          <span className="text-[11px] text-muted-foreground">{summary.totalRecords} trawler batches</span>
        </Card>

        <Card className="p-3.5 bg-card">
          <span className="text-[11px] font-medium text-muted-foreground uppercase">Total Landed Volume</span>
          <div className="text-lg font-bold font-mono text-foreground mt-1">
            {formatWeight(summary.totalWeightKg)}
          </div>
          <span className="text-[11px] text-muted-foreground">Dockside intake</span>
        </Card>

        <Card className="p-3.5 bg-card">
          <span className="text-[11px] font-medium text-muted-foreground uppercase">Supplier Payments Made</span>
          <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(summary.totalPaid)}
          </div>
          <span className="text-[11px] text-muted-foreground">Disbursed to boat owners</span>
        </Card>

        <Card className="p-3.5 bg-card">
          <span className="text-[11px] font-medium text-muted-foreground uppercase">Outstanding Payables</span>
          <div className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            {formatCurrency(summary.totalOutstandingPayable)}
          </div>
          <span className="text-[11px] text-muted-foreground">Liabilities to settle</span>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="rounded-lg overflow-x-auto border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 text-[11px]">
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Batch #</TableHead>
                  <TableHead className="font-semibold">Supplier / Vessel</TableHead>
                  <TableHead className="font-semibold">Landing Harbor</TableHead>
                  <TableHead className="font-semibold">Species Details</TableHead>
                  <TableHead className="text-right font-semibold">Weight (kg)</TableHead>
                  <TableHead className="text-right font-semibold">Subtotal</TableHead>
                  <TableHead className="text-right font-semibold">Transport</TableHead>
                  <TableHead className="text-right font-semibold">Ice & Labour</TableHead>
                  <TableHead className="text-right font-semibold">Total Spend</TableHead>
                  <TableHead className="text-right font-semibold">Paid</TableHead>
                  <TableHead className="text-right font-semibold">Balance Due</TableHead>
                  <TableHead className="text-center font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center py-10 text-xs text-muted-foreground">
                      No purchase batches match the selected filter criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.id} className="text-xs hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium whitespace-nowrap">
                        {formatDate(row.purchaseDate)}
                      </TableCell>
                      <TableCell className="font-mono font-medium text-foreground">
                        {row.purchaseNumber}
                      </TableCell>
                      <TableCell className="font-medium max-w-[160px] truncate">
                        {row.supplierName}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-[11px]">
                        {row.boatOrHarbor || "-"}
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate text-muted-foreground text-[11px]">
                        {row.fishSummary}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatWeight(row.totalWeightKg)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {formatCurrency(row.subtotal)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {formatCurrency(row.transportCharges)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {formatCurrency(row.iceCharges + row.labourCharges)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold text-foreground">
                        {formatCurrency(row.totalAmount)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                        {formatCurrency(row.paidAmount)}
                      </TableCell>
                      <TableCell className={`text-right font-mono font-semibold ${row.balanceAmount > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}>
                        {formatCurrency(row.balanceAmount)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={row.paymentStatus === "PAID" ? "default" : row.paymentStatus === "PARTIAL" ? "secondary" : "destructive"}
                          className="text-[10px] font-mono"
                        >
                          {row.paymentStatus}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              {rows.length > 0 && (
                <tfoot>
                  <tr className="bg-muted/70 font-semibold text-xs border-t border-border">
                    <td className="p-3 font-bold text-foreground" colSpan={5}>
                      TOTALS ({summary.totalRecords} Batches)
                    </td>
                    <td className="p-3 text-right font-mono font-bold">
                      {formatWeight(summary.totalWeightKg)}
                    </td>
                    <td className="p-3 text-right font-mono">
                      {formatCurrency(summary.totalSubtotal)}
                    </td>
                    <td className="p-3 text-right font-mono">
                      {formatCurrency(summary.totalTransportCharges)}
                    </td>
                    <td className="p-3 text-right font-mono">
                      {formatCurrency(summary.totalIceCharges + summary.totalLabourCharges)}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-orange-600 dark:text-orange-400">
                      {formatCurrency(summary.totalPurchaseSpend)}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(summary.totalPaid)}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                      {formatCurrency(summary.totalOutstandingPayable)}
                    </td>
                    <td className="p-3" />
                  </tr>
                </tfoot>
              )}
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
