"use client";

import * as React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { ProfitLossSummary } from "@/services/profit-loss";

interface ProfitLossOverviewProps {
  summary: ProfitLossSummary;
}

export function ProfitLossOverview({ summary }: ProfitLossOverviewProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-6">
      {/* High-level Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="text-xs font-medium text-muted-foreground uppercase">
            Gross Sales Revenue
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-foreground">
            {formatCurrency(summary.totalRevenue)}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Period: {summary.period}
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-xs font-medium text-muted-foreground uppercase">
            Cost of Goods (Raw Seafood)
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-foreground">
            {formatCurrency(summary.cogsPurchases)}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Procurement + Ice + Packing
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-xs font-medium text-muted-foreground uppercase">
            Gross Profit (Margin)
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {formatCurrency(summary.grossProfit)}
          </div>
          <div className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {summary.grossProfitMargin.toFixed(1)}% Gross Margin
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-xs font-medium text-muted-foreground uppercase">
            Net Realized Profit
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-sky-600 dark:text-sky-400">
            {formatCurrency(summary.netProfit)}
          </div>
          <div className="mt-1 text-xs font-semibold text-sky-600 dark:text-sky-400">
            {summary.netProfitMargin.toFixed(1)}% Net Margin
          </div>
        </Card>
      </div>

      {/* Monthly Trends Chart */}
      <Card className="h-96">
        <CardHeader>
          <CardTitle>Net Profit & Cost Trajectory</CardTitle>
          <CardDescription>
            Monthly financial run-rate comparing top-line revenue against direct fish purchases and operational overheads
          </CardDescription>
        </CardHeader>
        <CardContent className="h-72 pt-2">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={summary.monthlyTrends}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} tickMargin={8} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val: unknown) => {
                    if (typeof val === "number") {
                      return [`₹${val.toLocaleString("en-IN")}`, ""];
                    }
                    return [String(val ?? ""), ""];
                  }}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "6px",
                    color: "#f8fafc",
                    fontSize: "12px",
                    border: "1px solid #334155",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0284c7"
                  fill="#0284c7"
                  fillOpacity={0.15}
                  name="Revenue"
                />
                <Area
                  type="monotone"
                  dataKey="netProfit"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.2}
                  name="Net Profit"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              Loading financial trajectory...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
