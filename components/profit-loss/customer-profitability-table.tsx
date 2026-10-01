"use client";

import * as React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { CustomerProfitItem } from "@/types/report";

interface CustomerProfitabilityTableRowProps {
  customer: CustomerProfitItem;
}

const CustomerProfitabilityTableRow = React.memo(function CustomerProfitabilityTableRow({
  customer,
}: CustomerProfitabilityTableRowProps) {
  const isProfit = customer.grossProfit >= 0;

  return (
    <TableRow className="text-xs hover:bg-muted/40 transition-colors">
      <TableCell className="font-medium">
        <div className="font-semibold text-foreground">{customer.customerName}</div>
        {customer.companyName && (
          <div className="text-[11px] text-muted-foreground">{customer.companyName}</div>
        )}
      </TableCell>
      <TableCell className="hidden sm:table-cell text-right font-mono text-muted-foreground">
        {customer.salesCount}
      </TableCell>
      <TableCell className="text-right font-mono font-medium text-foreground">
        {formatCurrency(customer.revenue)}
      </TableCell>
      <TableCell className="hidden md:table-cell text-right font-mono text-muted-foreground">
        {formatCurrency(customer.cogs)}
      </TableCell>
      <TableCell className={`text-right font-mono font-bold ${isProfit ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
        {formatCurrency(customer.grossProfit)}
      </TableCell>
      <TableCell className="text-right">
        <Badge
          variant={customer.margin >= 20 ? "default" : customer.margin >= 10 ? "secondary" : "destructive"}
          className="font-mono text-[10px]"
        >
          {customer.margin.toFixed(1)}%
        </Badge>
      </TableCell>
    </TableRow>
  );
});

interface CustomerProfitabilityTableProps {
  customers: CustomerProfitItem[];
}

export const CustomerProfitabilityTable = React.memo(function CustomerProfitabilityTable({
  customers,
}: CustomerProfitabilityTableProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">Customer Profitability Ranking</CardTitle>
            <CardDescription>
              Margin analysis per client calculated from total revenue against estimated raw fish procurement cost
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            {customers.length} Active {customers.length === 1 ? "Customer" : "Customers"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="rounded-md border border-border overflow-hidden overflow-x-auto">
          <Table className="min-w-[500px]">
            <TableHeader>
              <TableRow className="bg-muted/50 text-xs">
                <TableHead className="font-semibold">Customer / Company</TableHead>
                <TableHead className="hidden sm:table-cell text-right font-semibold">Sales Count</TableHead>
                <TableHead className="text-right font-semibold">Total Revenue</TableHead>
                <TableHead className="hidden md:table-cell text-right font-semibold">Est. COGS</TableHead>
                <TableHead className="text-right font-semibold">Gross Profit</TableHead>
                <TableHead className="text-right font-semibold">Margin %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                    No customer sales recorded for this period.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((c) => (
                  <CustomerProfitabilityTableRow key={c.customerId} customer={c} />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
});
