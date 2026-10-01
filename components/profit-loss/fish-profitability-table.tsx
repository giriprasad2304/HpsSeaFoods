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
import { formatCurrency, formatWeight } from "@/lib/utils";
import type { FishTypeProfitItem } from "@/types/report";

interface FishProfitabilityTableRowProps {
  item: FishTypeProfitItem;
}

const FishProfitabilityTableRow = React.memo(function FishProfitabilityTableRow({
  item,
}: FishProfitabilityTableRowProps) {
  const isProfit = item.grossProfit >= 0;

  return (
    <TableRow className="text-xs hover:bg-muted/40 transition-colors">
      <TableCell className="font-semibold text-foreground">
        {item.fishTypeName}
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <Badge variant="outline" className="text-[10px] font-normal">
          {item.category}
        </Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell text-right font-mono text-muted-foreground">
        {formatWeight(item.quantitySoldKg)}
      </TableCell>
      <TableCell className="text-right font-mono text-foreground font-medium">
        {formatCurrency(item.averageSellingPrice)}/kg
      </TableCell>
      <TableCell className="hidden md:table-cell text-right font-mono text-muted-foreground">
        {formatCurrency(item.averagePurchaseCost)}/kg
      </TableCell>
      <TableCell className="hidden lg:table-cell text-right font-mono font-medium text-foreground">
        {formatCurrency(item.revenue)}
      </TableCell>
      <TableCell className={`text-right font-mono font-bold ${isProfit ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
        {formatCurrency(item.grossProfit)}
      </TableCell>
      <TableCell className="text-right">
        <Badge
          variant={item.margin >= 20 ? "default" : item.margin >= 10 ? "secondary" : "destructive"}
          className="font-mono text-[10px]"
        >
          {item.margin.toFixed(1)}%
        </Badge>
      </TableCell>
    </TableRow>
  );
});

interface FishProfitabilityTableProps {
  fishTypes: FishTypeProfitItem[];
}

export const FishProfitabilityTable = React.memo(function FishProfitabilityTable({
  fishTypes,
}: FishProfitabilityTableProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">Fish Type & Species Profitability</CardTitle>
            <CardDescription>
              Unit economics comparing average realized selling rate/kg vs. procurement cost/kg
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            {fishTypes.length} Species Sold
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="rounded-md border border-border overflow-hidden overflow-x-auto">
          <Table className="min-w-[500px]">
            <TableHeader>
              <TableRow className="bg-muted/50 text-xs">
                <TableHead className="font-semibold">Fish Species</TableHead>
                <TableHead className="hidden sm:table-cell font-semibold">Category</TableHead>
                <TableHead className="hidden md:table-cell text-right font-semibold">Qty Sold</TableHead>
                <TableHead className="text-right font-semibold">Avg Sell Rate / kg</TableHead>
                <TableHead className="hidden md:table-cell text-right font-semibold">Avg Cost / kg</TableHead>
                <TableHead className="hidden lg:table-cell text-right font-semibold">Total Revenue</TableHead>
                <TableHead className="text-right font-semibold">Gross Profit</TableHead>
                <TableHead className="text-right font-semibold">Margin %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fishTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-xs text-muted-foreground">
                    No fish sales recorded for this period.
                  </TableCell>
                </TableRow>
              ) : (
                fishTypes.map((f) => (
                  <FishProfitabilityTableRow key={f.fishTypeId} item={f} />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
});
