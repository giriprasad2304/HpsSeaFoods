"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { MonthlyProfitLossPoint } from "@/types/dashboard";

interface ProfitLossChartProps {
  data: MonthlyProfitLossPoint[];
}

export const ProfitLossChart = React.memo(function ProfitLossChart({ data }: ProfitLossChartProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Card className="flex flex-col">
      <CardHeader className="p-3.5 pb-1.5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xs font-semibold text-foreground">
              Monthly Profit & Loss
            </CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground">
              6-month comparison of Top-Line Revenue, COGS, and Net Realized Profit
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3.5 pt-1 flex-1 min-h-[240px]">
        {mounted ? (
          data.length === 0 ? (
            <div className="flex h-full min-h-[200px] items-center justify-center text-xs text-muted-foreground">
              No historical data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                  opacity={0.7}
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  fontSize={10}
                  tickMargin={6}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={10}
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(val) =>
                    `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`
                  }
                />
                <Tooltip
                  formatter={(val: unknown) => {
                    if (typeof val === "number") {
                      return [formatCurrency(val), ""];
                    }
                    return [String(val ?? ""), ""];
                  }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderRadius: "6px",
                    color: "hsl(var(--card-foreground))",
                    fontSize: "11px",
                    border: "1px solid hsl(var(--border))",
                    padding: "6px 10px",
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: "11px", paddingTop: "4px" }}
                />
                <Bar
                  dataKey="revenue"
                  name="Revenue"
                  fill="hsl(var(--primary))"
                  radius={[2, 2, 0, 0]}
                  maxBarSize={24}
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="cogs"
                  name="COGS"
                  fill="hsl(var(--muted-foreground))"
                  radius={[2, 2, 0, 0]}
                  maxBarSize={24}
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="netProfit"
                  name="Net Profit"
                  fill="hsl(var(--success))"
                  radius={[2, 2, 0, 0]}
                  maxBarSize={24}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          )
        ) : (
          <div className="flex h-full min-h-[200px] items-center justify-center text-xs text-muted-foreground">
            Loading chart...
          </div>
        )}
      </CardContent>
    </Card>
  );
});
