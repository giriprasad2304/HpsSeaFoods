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

const chartData = [
  { month: "Mon", revenue: 14200, purchases: 9800 },
  { month: "Tue", revenue: 18900, purchases: 12400 },
  { month: "Wed", revenue: 23400, purchases: 16100 },
  { month: "Thu", revenue: 19800, purchases: 14000 },
  { month: "Fri", revenue: 31200, purchases: 21500 },
  { month: "Sat", revenue: 28500, purchases: 19000 },
  { month: "Sun", revenue: 12000, purchases: 8400 },
];

export function SalesRevenueChart() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card className="h-96">
        <CardHeader>
          <CardTitle>Weekly Revenue vs Inward Purchases</CardTitle>
        </CardHeader>
        <CardContent className="h-72 flex items-center justify-center text-xs text-muted-foreground">
          Loading chart telemetry...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-96">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Weekly Revenue vs Inward Purchases</CardTitle>
            <CardDescription>
              Comparing daily billing volume with raw seafood inward procurement cost
            </CardDescription>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-xs bg-sky-600" />
              <span className="text-muted-foreground">Sales Revenue ($)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-xs bg-slate-400" />
              <span className="text-muted-foreground">Procurement ($)</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-72 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} tickMargin={8} />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tickFormatter={(val) => `₹${val / 1000}k`}
            />
            <Tooltip
              formatter={(value: unknown) => {
                if (typeof value === "number") {
                  return [`₹${value.toLocaleString("en-IN")}`, ""];
                }
                return [String(value ?? ""), ""];
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
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
            <Area
              type="monotone"
              dataKey="purchases"
              stroke="#64748b"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPurchases)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
