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
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { ProfitTrendPoint } from "@/types/report";

interface ProfitChartProps {
  trends: ProfitTrendPoint[];
}

export function ProfitChart({ trends }: ProfitChartProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Card className="h-96">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Financial Trend & Margin Trajectory</CardTitle>
        <CardDescription>
          Time-series performance showing Top-Line Revenue, Cost of Goods (COGS), Operating Overheads, and Net Realized Profit
        </CardDescription>
      </CardHeader>
      <CardContent className="h-72 pt-2">
        {mounted ? (
          trends.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              No trend data available for the selected period.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trends}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCogs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} tickMargin={8} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  formatter={(val: unknown) => {
                    if (typeof val === "number") {
                      return [formatCurrency(val), ""];
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
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0ea5e9"
                  fillOpacity={1}
                  fill="url(#colorRev)"
                  name="Revenue"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="cogs"
                  stroke="#f97316"
                  fillOpacity={1}
                  fill="url(#colorCogs)"
                  name="COGS"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="netProfit"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                  name="Net Profit"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            Loading chart trends...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
