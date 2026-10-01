"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Receipt,
} from "lucide-react";
import type { ProfitLossReport } from "@/types/report";

interface SummaryCardsProps {
  report: ProfitLossReport;
}

interface MetricCardProps {
  label: string;
  value: number;
  subtitle?: string;
  icon: React.ReactNode;
  colorClass: string;
  isCurrency?: boolean;
  isPercentage?: boolean;
}

const MetricCard = React.memo(function MetricCard({
  label,
  value,
  subtitle,
  icon,
  colorClass,
  isCurrency = true,
  isPercentage = false,
}: MetricCardProps) {
  const isPositive = value >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <Card className="relative overflow-hidden p-5 transition-all duration-200 hover:shadow-md will-change-transform">
      {/* Gradient accent */}
      <div className={`absolute top-0 left-0 w-full h-1 ${colorClass}`} />

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </p>
          <p className={`text-2xl font-bold font-mono ${
            isPositive ? "text-foreground" : "text-red-500"
          }`}>
            {isCurrency && formatCurrency(value)}
            {isPercentage && `${value.toFixed(1)}%`}
            {!isCurrency && !isPercentage && value.toLocaleString()}
          </p>
          {subtitle && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendIcon className={`h-3 w-3 ${isPositive ? "text-emerald-500" : "text-red-500"}`} />
              <span>{subtitle}</span>
            </div>
          )}
        </div>
        <div className="p-2 rounded-lg bg-muted/50">
          {icon}
        </div>
      </div>
    </Card>
  );
});

export const SummaryCards = React.memo(function SummaryCards({ report }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        label="Total Revenue"
        value={report.totalRevenue}
        subtitle={`${report.totalSalesCount} sales this period`}
        icon={<DollarSign className="h-5 w-5 text-sky-500" />}
        colorClass="bg-gradient-to-r from-sky-500 to-blue-600"
      />
      <MetricCard
        label="Cost of Goods Sold"
        value={report.cogs.totalCOGS}
        subtitle="Raw + Transport + Ice + Packing"
        icon={<ShoppingCart className="h-5 w-5 text-orange-500" />}
        colorClass="bg-gradient-to-r from-orange-500 to-amber-600"
      />
      <MetricCard
        label="Gross Profit"
        value={report.grossProfit}
        subtitle={`${report.grossProfitMargin.toFixed(1)}% margin`}
        icon={<Package className="h-5 w-5 text-emerald-500" />}
        colorClass="bg-gradient-to-r from-emerald-500 to-teal-600"
      />
      <MetricCard
        label="Net Profit"
        value={report.netProfit}
        subtitle={`${report.netProfitMargin.toFixed(1)}% margin`}
        icon={<Receipt className="h-5 w-5 text-violet-500" />}
        colorClass="bg-gradient-to-r from-violet-500 to-purple-600"
      />
    </div>
  );
});
