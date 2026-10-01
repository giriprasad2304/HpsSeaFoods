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
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ExpenseReportData, ReportLookupData, ReportFilterOptions } from "@/types/financial-reports";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

interface ExpenseReportViewProps {
  initialData: ExpenseReportData;
  lookups: ReportLookupData;
}

export function ExpenseReportView({ initialData, lookups }: ExpenseReportViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [data, setData] = React.useState<ExpenseReportData>(initialData);
  const [filters, setFilters] = React.useState<ReportFilterOptions>(() => {
    const fromUrl: ReportFilterOptions = { ...initialData.filters };
    if (searchParams) {
      if (searchParams.get("startDate")) fromUrl.startDate = searchParams.get("startDate")!;
      if (searchParams.get("endDate")) fromUrl.endDate = searchParams.get("endDate")!;
      if (searchParams.get("month")) fromUrl.month = parseInt(searchParams.get("month")!, 10);
      if (searchParams.get("year")) fromUrl.year = parseInt(searchParams.get("year")!, 10);
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

      const res = await fetch(`/api/reports/expenses?${queryString}`);
      if (res.ok) {
        const fresh: ExpenseReportData = await res.json();
        setData(fresh);
      }
    } catch (err) {
      console.error("Failed to refresh expense report:", err);
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
            Operating Expenses Register
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Disbursement register for thermocol packing, ice supplies, transport freight, harbour labour, and facility overheads
          </p>
        </div>

        <ReportExportToolbar reportType="expenses" filters={filters} />
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
          showInvoiceSearch={true}
          isLoading={isLoading}
        />
      </div>

      {/* Category Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="p-4 bg-card md:col-span-1 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-medium text-muted-foreground uppercase">
              Total Expenses
            </span>
            <div className="text-2xl font-bold font-mono text-violet-600 dark:text-violet-400 mt-2">
              {formatCurrency(summary.totalExpenses)}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
            {summary.totalRecords} disbursement vouchers recorded
          </div>
        </Card>

        <Card className="p-4 bg-card md:col-span-2">
          <span className="text-xs font-semibold text-foreground block mb-2">
            Expense Allocation by Category
          </span>
          <div className="space-y-2">
            {summary.byCategory.length === 0 ? (
              <div className="text-xs text-muted-foreground py-2">No category data recorded</div>
            ) : (
              summary.byCategory.slice(0, 4).map((cat) => (
                <div key={cat.categoryId} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground font-medium">{cat.categoryName}</span>
                    <span className="font-mono font-semibold text-foreground">
                      {formatCurrency(cat.amount)} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(0, cat.percentage))}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Table-First Expenses Ledger */}
      <Card>
        <CardContent className="p-0">
          <div className="rounded-lg overflow-x-auto border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 text-[11px]">
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Expense #</TableHead>
                  <TableHead className="font-semibold">Category</TableHead>
                  <TableHead className="font-semibold">Title / Description</TableHead>
                  <TableHead className="font-semibold">Vendor / Recipient</TableHead>
                  <TableHead className="font-semibold">Method</TableHead>
                  <TableHead className="text-right font-semibold">Disbursed Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-xs text-muted-foreground">
                      No expense records found for the selected period.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.id} className="text-xs hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium whitespace-nowrap">
                        {formatDate(row.expenseDate)}
                      </TableCell>
                      <TableCell className="font-mono font-medium text-foreground">
                        {row.expenseNumber}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {row.categoryName}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>{row.title}</div>
                        {row.description && (
                          <div className="text-[11px] text-muted-foreground truncate max-w-xs">
                            {row.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-[11px]">
                        {row.paidTo || "-"}
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-muted-foreground">
                        {row.paymentMethod}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold text-foreground">
                        {formatCurrency(row.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              {rows.length > 0 && (
                <tfoot>
                  <tr className="bg-muted/70 font-semibold text-xs border-t border-border">
                    <td className="p-3 font-bold text-foreground" colSpan={6}>
                      TOTAL EXPENSES ({summary.totalRecords} Vouchers)
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-violet-600 dark:text-violet-400">
                      {formatCurrency(summary.totalExpenses)}
                    </td>
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
