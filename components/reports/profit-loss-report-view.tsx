"use client";

import * as React from "react";
import { ReportNav } from "./report-nav";
import { ReportFilters } from "./report-filters";
import { ReportExportToolbar } from "./report-export-toolbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import type { ProfitLossStatementData, ReportLookupData, ReportFilterOptions } from "@/types/financial-reports";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

interface ProfitLossReportViewProps {
  initialData: ProfitLossStatementData;
  lookups: ReportLookupData;
}

export function ProfitLossReportView({ initialData, lookups }: ProfitLossReportViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [data, setData] = React.useState<ProfitLossStatementData>(initialData);
  const [filters, setFilters] = React.useState<ReportFilterOptions>(() => {
    const fromUrl: ReportFilterOptions = { ...initialData.filters };
    if (searchParams) {
      if (searchParams.get("startDate")) fromUrl.startDate = searchParams.get("startDate")!;
      if (searchParams.get("endDate")) fromUrl.endDate = searchParams.get("endDate")!;
      if (searchParams.get("month")) fromUrl.month = parseInt(searchParams.get("month")!, 10);
      if (searchParams.get("year")) fromUrl.year = parseInt(searchParams.get("year")!, 10);
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

      const res = await fetch(`/api/reports/profit-loss?${queryString}`);
      if (res.ok) {
        const fresh: ProfitLossStatementData = await res.json();
        setData(fresh);
      }
    } catch (err) {
      console.error("Failed to refresh P&L report:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <ReportNav />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Profit & Loss Statement (P&L)
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Formal managerial income statement reconciling operating revenue, direct seafood COGS, and operating overheads
          </p>
        </div>

        <ReportExportToolbar reportType="profit-loss" filters={filters} />
      </div>

      <div className="print:hidden">
        <ReportFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          lookups={lookups}
          showCustomer={false}
          showSupplier={false}
          showFishType={false}
          showPaymentStatus={false}
          showInvoiceSearch={false}
          isLoading={isLoading}
        />
      </div>

      {/* 4 Key P&L KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 bg-card">
          <span className="text-[11px] font-medium text-muted-foreground uppercase">Net Operating Revenue</span>
          <div className="text-lg font-bold font-mono text-sky-600 dark:text-sky-400 mt-1">
            {formatCurrency(data.netRevenue)}
          </div>
          <span className="text-[11px] text-muted-foreground">Period: {data.periodLabel}</span>
        </Card>

        <Card className="p-3.5 bg-card">
          <span className="text-[11px] font-medium text-muted-foreground uppercase">Total COGS</span>
          <div className="text-lg font-bold font-mono text-orange-600 dark:text-orange-400 mt-1">
            {formatCurrency(data.totalCOGS)}
          </div>
          <span className="text-[11px] text-muted-foreground">Procurement + Ice + Packing</span>
        </Card>

        <Card className="p-3.5 bg-card">
          <span className="text-[11px] font-medium text-muted-foreground uppercase">Gross Profit</span>
          <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(data.grossProfit)}
          </div>
          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            {data.grossProfitMargin.toFixed(1)}% Gross Margin
          </span>
        </Card>

        <Card className="p-3.5 bg-card">
          <span className="text-[11px] font-medium text-muted-foreground uppercase">Net Realized Profit</span>
          <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(data.netProfit)}
          </div>
          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            {data.netProfitMargin.toFixed(1)}% Net Margin
          </span>
        </Card>
      </div>

      {/* Formal Table-First Statement */}
      <Card>
        <CardHeader className="p-4 pb-2 border-b border-border bg-muted/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              Income Statement Ledger ({data.periodLabel})
            </CardTitle>
            <span className="text-xs text-muted-foreground font-mono">
              In base currency (INR)
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 text-[11px]">
                <TableHead className="w-2/3 font-semibold">Financial Line Item</TableHead>
                <TableHead className="text-right font-semibold">Sub-Amount (₹)</TableHead>
                <TableHead className="text-right font-semibold">Total Amount (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs">
              {/* Revenue Section */}
              <TableRow className="bg-muted/10 font-bold">
                <TableCell colSpan={2} className="text-foreground">
                  1. OPERATING REVENUE
                </TableCell>
                <TableCell className="text-right font-mono text-sky-600 dark:text-sky-400">
                  {formatCurrency(data.netRevenue)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6 text-muted-foreground">Gross Sales Invoices</TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">
                  {formatCurrency(data.grossSales)}
                </TableCell>
                <TableCell />
              </TableRow>
              <TableRow>
                <TableCell className="pl-6 text-muted-foreground">Less: Deductions & Discounts</TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">
                  ({formatCurrency(data.discounts)})
                </TableCell>
                <TableCell />
              </TableRow>
              <TableRow className="border-b-2 font-semibold">
                <TableCell className="pl-6 text-foreground">Net Realized Revenue</TableCell>
                <TableCell />
                <TableCell className="text-right font-mono font-bold text-foreground">
                  {formatCurrency(data.netRevenue)}
                </TableCell>
              </TableRow>

              {/* COGS Section */}
              <TableRow className="bg-muted/10 font-bold">
                <TableCell colSpan={2} className="text-foreground">
                  2. COST OF GOODS SOLD (COGS)
                </TableCell>
                <TableCell className="text-right font-mono text-orange-600 dark:text-orange-400">
                  ({formatCurrency(data.totalCOGS)})
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6 text-muted-foreground">Raw Seafood Dockside Purchases</TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">
                  {formatCurrency(data.rawFishProcurementCost)}
                </TableCell>
                <TableCell />
              </TableRow>
              <TableRow>
                <TableCell className="pl-6 text-muted-foreground">Freight & Transport Inward</TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">
                  {formatCurrency(data.transportCharges)}
                </TableCell>
                <TableCell />
              </TableRow>
              <TableRow>
                <TableCell className="pl-6 text-muted-foreground">Ice Preservation Charges</TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">
                  {formatCurrency(data.iceCharges)}
                </TableCell>
                <TableCell />
              </TableRow>
              <TableRow>
                <TableCell className="pl-6 text-muted-foreground">Direct Procurement Labour</TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">
                  {formatCurrency(data.labourCharges)}
                </TableCell>
                <TableCell />
              </TableRow>
              <TableRow>
                <TableCell className="pl-6 text-muted-foreground">Thermocol & Packaging Materials</TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">
                  {formatCurrency(data.packingAndThermocolCosts)}
                </TableCell>
                <TableCell />
              </TableRow>
              <TableRow className="border-b-2 font-semibold">
                <TableCell className="pl-6 text-foreground">Total Cost of Goods Sold</TableCell>
                <TableCell />
                <TableCell className="text-right font-mono font-bold text-foreground">
                  ({formatCurrency(data.totalCOGS)})
                </TableCell>
              </TableRow>

              {/* Gross Profit Subtotal */}
              <TableRow className="bg-emerald-500/10 font-bold text-emerald-700 dark:text-emerald-400 border-b-2">
                <TableCell>
                  GROSS PROFIT ({data.grossProfitMargin.toFixed(1)}% Gross Margin)
                </TableCell>
                <TableCell />
                <TableCell className="text-right font-mono text-sm">
                  {formatCurrency(data.grossProfit)}
                </TableCell>
              </TableRow>

              {/* Operating Expenses Section */}
              <TableRow className="bg-muted/10 font-bold">
                <TableCell colSpan={2} className="text-foreground">
                  3. OPERATING OVERHEADS & EXPENSES
                </TableCell>
                <TableCell className="text-right font-mono text-violet-600 dark:text-violet-400">
                  ({formatCurrency(data.totalOperatingExpenses)})
                </TableCell>
              </TableRow>
              {data.operatingExpenses.map((exp, idx) => (
                <TableRow key={idx}>
                  <TableCell className="pl-6 text-muted-foreground">
                    {exp.categoryName} ({exp.percentage}%)
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
                    {formatCurrency(exp.amount)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              ))}
              <TableRow className="border-b-2 font-semibold">
                <TableCell className="pl-6 text-foreground">Total Operating Expenses</TableCell>
                <TableCell />
                <TableCell className="text-right font-mono font-bold text-foreground">
                  ({formatCurrency(data.totalOperatingExpenses)})
                </TableCell>
              </TableRow>

              {/* Net Profit Grand Total */}
              <TableRow className="bg-primary/10 font-bold text-sm border-t-2 border-b-4 border-primary">
                <TableCell className="text-foreground">
                  NET REALIZED PROFIT ({data.netProfitMargin.toFixed(1)}% Net Margin)
                </TableCell>
                <TableCell />
                <TableCell className="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(data.netProfit)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
