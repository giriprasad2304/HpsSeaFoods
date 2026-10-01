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
import { formatCurrency, formatWeight } from "@/lib/utils";
import type { PurchaseTrendPoint } from "@/types/dashboard";

interface PurchaseChartProps {
  data: PurchaseTrendPoint[];
}

export const PurchaseChart = React.memo(function PurchaseChart({ data }: PurchaseChartProps) {
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
              Purchase Trend (14 Days)
            </CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground">
              Dockside trawler procurement costs and raw seafood volume
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3.5 pt-1 flex-1 min-h-[220px]">
        {mounted ? (
          data.length === 0 ? (
            <div className="flex h-full min-h-[190px] items-center justify-center text-xs text-muted-foreground">
              No purchase batches recorded in the last 14 days
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="purchGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                  opacity={0.7}
                />
                <XAxis
                  dataKey="date"
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
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as PurchaseTrendPoint;
                      return (
                        <div className="rounded-md border border-border bg-card p-2 text-xs text-card-foreground shadow-md">
                          <p className="font-semibold text-foreground text-[11px]">{item.date}</p>
                          <p className="font-mono text-foreground font-medium mt-0.5 text-xs">
                            Purchases: {formatCurrency(item.purchaseAmount)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Volume: {formatWeight(item.weightKg)} ({item.batchesCount} {item.batchesCount === 1 ? "batch" : "batches"})
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="purchaseAmount"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#purchGrad)"
                  name="Procurement Spend"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )
        ) : (
          <div className="flex h-full min-h-[190px] items-center justify-center text-xs text-muted-foreground">
            Loading chart...
          </div>
        )}
      </CardContent>
    </Card>
  );
});
