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
import { formatCurrency, formatDate } from "@/lib/utils";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { BalanceSheetData, ReportLookupData, ReportFilterOptions } from "@/types/financial-reports";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

interface BalanceSheetReportViewProps {
  initialData: BalanceSheetData;
  lookups: ReportLookupData;
}

export function BalanceSheetReportView({ initialData, lookups }: BalanceSheetReportViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [data, setData] = React.useState<BalanceSheetData>(initialData);
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

      const res = await fetch(`/api/reports/balance-sheet?${queryString}`);
      if (res.ok) {
        const fresh: BalanceSheetData = await res.json();
        setData(fresh);
      }
    } catch (err) {
      console.error("Failed to refresh balance sheet report:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const { assets, liabilities, equity } = data;

  return (
    <div className="space-y-5">
      <ReportNav />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Statement of Financial Position (Balance Sheet)
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Managerial balance sheet of working assets, supplier liabilities, cold storage inventory valuation, and retained earnings
          </p>
        </div>

        <ReportExportToolbar reportType="balance-sheet" filters={filters} />
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

      {/* Statutory Disclaimer Box */}
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
        <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold">Managerial Data Representation Notice:</span>
          <p className="text-muted-foreground text-[11px] leading-relaxed">
            {data.disclaimer}
          </p>
        </div>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-4 bg-card border-l-4 border-l-sky-500">
          <span className="text-[11px] font-medium text-muted-foreground uppercase">
            Total Working Assets
          </span>
          <div className="text-xl font-bold font-mono text-sky-600 dark:text-sky-400 mt-1">
            {formatCurrency(assets.totalAssets)}
          </div>
          <span className="text-[11px] text-muted-foreground">
            Cash + Receivables + Stock Valuation
          </span>
        </Card>

        <Card className="p-4 bg-card border-l-4 border-l-orange-500">
          <span className="text-[11px] font-medium text-muted-foreground uppercase">
            Total Liabilities
          </span>
          <div className="text-xl font-bold font-mono text-orange-600 dark:text-orange-400 mt-1">
            {formatCurrency(liabilities.totalLiabilities)}
          </div>
          <span className="text-[11px] text-muted-foreground">
            Supplier procurement payables
          </span>
        </Card>

        <Card className="p-4 bg-card border-l-4 border-l-emerald-500">
          <span className="text-[11px] font-medium text-muted-foreground uppercase">
            Retained Earnings & Equity
          </span>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(equity.totalEquity)}
          </div>
          <span className="text-[11px] text-muted-foreground">
            Cumulative business surplus
          </span>
        </Card>
      </div>

      {/* Formal Balance Sheet Table */}
      <Card>
        <CardHeader className="p-4 pb-2 border-b border-border bg-muted/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              Balance Sheet Statement (As of {formatDate(data.asOfDate)})
            </CardTitle>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Statement Calculated</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[500px]">
            <TableHeader>
              <TableRow className="bg-muted/40 text-[11px]">
                <TableHead className="w-2/3 font-semibold">Account / Category</TableHead>
                <TableHead className="text-right font-semibold">Sub-Total ($)</TableHead>
                <TableHead className="text-right font-semibold">Balance Amount ($)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs">
              {/* ASSETS SECTION */}
              <TableRow className="bg-muted/20 font-bold">
                <TableCell colSpan={2} className="text-foreground">
                  ASSETS (CURRENT & OPERATIONAL)
                </TableCell>
                <TableCell className="text-right font-mono text-sky-600 dark:text-sky-400 font-bold">
                  {formatCurrency(assets.totalAssets)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6 text-muted-foreground">
                  Estimated Liquid Cash & Collections on Hand
                </TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">
                  {formatCurrency(assets.cashAndBankEstimated)}
                </TableCell>
                <TableCell />
              </TableRow>
              <TableRow>
                <TableCell className="pl-6 text-muted-foreground">
                  Accounts Receivable (Customer Balances)
                </TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">
                  {formatCurrency(assets.accountsReceivable)}
                </TableCell>
                <TableCell />
              </TableRow>
              <TableRow>
                <TableCell className="pl-6 text-muted-foreground">
                  Cold Storage Seafood Stock Valuation
                </TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">
                  {formatCurrency(assets.inventoryValuation)}
                </TableCell>
                <TableCell />
              </TableRow>
              <TableRow className="border-b-2 font-bold bg-sky-500/5">
                <TableCell className="pl-6 text-foreground">TOTAL CURRENT ASSETS</TableCell>
                <TableCell />
                <TableCell className="text-right font-mono font-bold text-sky-600 dark:text-sky-400">
                  {formatCurrency(assets.totalCurrentAssets)}
                </TableCell>
              </TableRow>

              {/* LIABILITIES SECTION */}
              <TableRow className="bg-muted/20 font-bold">
                <TableCell colSpan={2} className="text-foreground">
                  LIABILITIES (CURRENT OBLIGATIONS)
                </TableCell>
                <TableCell className="text-right font-mono text-orange-600 dark:text-orange-400 font-bold">
                  {formatCurrency(liabilities.totalLiabilities)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6 text-muted-foreground">
                  Accounts Payable (Vessel Supplier Outstandings)
                </TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">
                  {formatCurrency(liabilities.accountsPayable)}
                </TableCell>
                <TableCell />
              </TableRow>
              <TableRow className="border-b-2 font-bold bg-orange-500/5">
                <TableCell className="pl-6 text-foreground">TOTAL LIABILITIES</TableCell>
                <TableCell />
                <TableCell className="text-right font-mono font-bold text-orange-600 dark:text-orange-400">
                  {formatCurrency(liabilities.totalLiabilities)}
                </TableCell>
              </TableRow>

              {/* EQUITY SECTION */}
              <TableRow className="bg-muted/20 font-bold">
                <TableCell colSpan={2} className="text-foreground">
                  OWNER&apos;S EQUITY & RETAINED SURPLUS
                </TableCell>
                <TableCell className="text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {formatCurrency(equity.totalEquity)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6 text-muted-foreground">
                  Retained Earnings (Cumulative Realized Net Profit)
                </TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">
                  {formatCurrency(equity.retainedEarnings)}
                </TableCell>
                <TableCell />
              </TableRow>
              <TableRow className="border-b-2 font-bold bg-emerald-500/5">
                <TableCell className="pl-6 text-foreground">TOTAL EQUITY</TableCell>
                <TableCell />
                <TableCell className="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(equity.totalEquity)}
                </TableCell>
              </TableRow>

              {/* TOTAL LIABILITIES & EQUITY */}
              <TableRow className="bg-primary/10 font-bold text-sm border-t-2 border-b-4 border-primary">
                <TableCell className="text-foreground">
                  TOTAL LIABILITIES & OWNER&apos;S EQUITY
                </TableCell>
                <TableCell />
                <TableCell className="text-right font-mono font-bold text-foreground">
                  {formatCurrency(equity.totalLiabilitiesAndEquity)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
