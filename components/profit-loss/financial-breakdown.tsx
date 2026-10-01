"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { ProfitLossReport } from "@/types/report";

interface FinancialBreakdownProps {
  report: ProfitLossReport;
}

export function FinancialBreakdown({ report }: FinancialBreakdownProps) {
  const { cogs, expenses, totalRevenue, grossProfit, grossProfitMargin, netProfit, netProfitMargin } = report;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* COGS Detailed Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center justify-between">
            <span>Cost of Goods Sold (COGS) Breakdown</span>
            <span className="font-mono text-orange-600 dark:text-orange-400 font-bold">
              {formatCurrency(cogs.totalCOGS)}
            </span>
          </CardTitle>
          <CardDescription>Direct procurement, post-harvest processing, and cold chain costs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-0 text-xs">
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Raw Seafood Purchases (Dockside / Boats)</span>
            <span className="font-mono font-medium text-foreground">{formatCurrency(cogs.rawMaterialCost)}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Transport & Freight Inward</span>
            <span className="font-mono font-medium text-foreground">{formatCurrency(cogs.transportCharges)}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Ice Charges (Catch Preserving)</span>
            <span className="font-mono font-medium text-foreground">{formatCurrency(cogs.iceCharges)}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Direct Procurement Labour</span>
            <span className="font-mono font-medium text-foreground">{formatCurrency(cogs.labourCharges)}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Thermocol & Packaging Materials</span>
            <span className="font-mono font-medium text-foreground">{formatCurrency(cogs.packingCost)}</span>
          </div>

          <div className="pt-2 flex items-center justify-between font-semibold">
            <span>Total COGS</span>
            <span className="font-mono text-foreground">{formatCurrency(cogs.totalCOGS)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Operating Expenses Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center justify-between">
            <span>Operating Expenses Breakdown</span>
            <span className="font-mono text-violet-600 dark:text-violet-400 font-bold">
              {formatCurrency(expenses.totalExpenses)}
            </span>
          </CardTitle>
          <CardDescription>General business expenses, facility upkeep, and administrative overheads</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-0 text-xs">
          {expenses.items.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No operating expenses recorded in this period.
            </div>
          ) : (
            expenses.items.map((item) => (
              <div key={item.categoryId} className="space-y-1.5 py-1.5 border-b border-border last:border-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{item.categoryName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-mono">({item.percentage.toFixed(1)}%)</span>
                    <span className="font-mono font-semibold text-foreground">{formatCurrency(item.amount)}</span>
                  </div>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, item.percentage))}%` }}
                  />
                </div>
              </div>
            ))
          )}

          <div className="pt-2 flex items-center justify-between font-semibold">
            <span>Total Expenses</span>
            <span className="font-mono text-foreground">{formatCurrency(expenses.totalExpenses)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Financial Statement Summary Banner */}
      <Card className="lg:col-span-2 bg-muted/30 border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Summary Financial Calculation Statement</CardTitle>
          <CardDescription>Mathematical formula applied according to standard financial accounting logic</CardDescription>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center text-center font-mono">
            <div className="p-3 bg-background rounded-lg border">
              <div className="text-[10px] text-muted-foreground uppercase">1. Revenue</div>
              <div className="font-bold text-sky-600 dark:text-sky-400 text-sm mt-1">{formatCurrency(totalRevenue)}</div>
            </div>
            <div className="text-lg font-bold text-muted-foreground">-</div>
            <div className="p-3 bg-background rounded-lg border">
              <div className="text-[10px] text-muted-foreground uppercase">2. Total COGS</div>
              <div className="font-bold text-orange-600 dark:text-orange-400 text-sm mt-1">{formatCurrency(cogs.totalCOGS)}</div>
            </div>
            <div className="text-lg font-bold text-muted-foreground">=</div>
            <div className="p-3 bg-background rounded-lg border">
              <div className="text-[10px] text-muted-foreground uppercase">Gross Profit ({grossProfitMargin.toFixed(1)}%)</div>
              <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm mt-1">{formatCurrency(grossProfit)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center text-center font-mono mt-3">
            <div className="p-3 bg-background rounded-lg border">
              <div className="text-[10px] text-muted-foreground uppercase">Gross Profit</div>
              <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm mt-1">{formatCurrency(grossProfit)}</div>
            </div>
            <div className="text-lg font-bold text-muted-foreground">-</div>
            <div className="p-3 bg-background rounded-lg border">
              <div className="text-[10px] text-muted-foreground uppercase">3. Operating Expenses</div>
              <div className="font-bold text-violet-600 dark:text-violet-400 text-sm mt-1">{formatCurrency(expenses.totalExpenses)}</div>
            </div>
            <div className="text-lg font-bold text-muted-foreground">=</div>
            <div className="p-3 bg-background rounded-lg border shadow-xs">
              <div className="text-[10px] text-muted-foreground uppercase font-bold">Net Profit ({netProfitMargin.toFixed(1)}%)</div>
              <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm mt-1">{formatCurrency(netProfit)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
