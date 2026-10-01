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
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const stockData = [
  { species: "Tuna", stockKg: 4200 },
  { species: "Kingfish", stockKg: 2800 },
  { species: "Pomfret", stockKg: 3400 },
  { species: "Snapper", stockKg: 1900 },
  { species: "Mackerel", stockKg: 5100 },
  { species: "Prawns", stockKg: 2200 },
];

export function InventoryDistributionChart() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card className="h-96">
        <CardHeader>
          <CardTitle>Cold Room Stock by Fish Variety</CardTitle>
        </CardHeader>
        <CardContent className="h-72 flex items-center justify-center text-xs text-muted-foreground">
          Loading inventory metrics...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-96">
      <CardHeader>
        <CardTitle>Cold Room Stock by Fish Variety (kg)</CardTitle>
        <CardDescription>
          Real-time physical net weight held across all blast and holding freezers
        </CardDescription>
      </CardHeader>
      <CardContent className="h-72 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stockData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
            <XAxis dataKey="species" tickLine={false} axisLine={false} fontSize={12} tickMargin={8} />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tickFormatter={(val) => `${val}kg`}
            />
            <Tooltip
              formatter={(value: unknown) => {
                if (typeof value === "number") {
                  return [`${value.toLocaleString()} kg`, "In Stock"];
                }
                return [String(value ?? ""), "In Stock"];
              }}
              contentStyle={{
                backgroundColor: "#0f172a",
                borderRadius: "6px",
                color: "#f8fafc",
                fontSize: "12px",
                border: "1px solid #334155",
              }}
            />
            <Bar dataKey="stockKg" fill="#0284c7" radius={[4, 4, 0, 0]} maxBarSize={45} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
