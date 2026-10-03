"use client";

import * as React from "react";
import {
  ShoppingCart,
  Anchor,
  TrendingUp,
  Receipt,
  DollarSign,
  Scale,
  CreditCard,
  Building2,
  Package,
  RefreshCw,
  Radio,
  AlertTriangle,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { PurchaseChart } from "@/components/dashboard/purchase-chart";
import { ProfitLossChart } from "@/components/dashboard/profit-loss-chart";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatWeight } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { DashboardData } from "@/types/dashboard";

interface DashboardViewProps {
  initialData: DashboardData;
}

export function DashboardView({ initialData }: DashboardViewProps) {
  const [data, setData] = React.useState<DashboardData>(initialData);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [lastSyncTime, setLastSyncTime] = React.useState<string>("");
  const [realtimeConnected, setRealtimeConnected] = React.useState(false);

  React.useEffect(() => {
    setLastSyncTime(new Date(initialData.lastUpdated).toLocaleTimeString());
  }, [initialData.lastUpdated]);

  const refreshTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const fetchDashboardData = React.useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/dashboard", { cache: "no-store" });
      if (res.ok) {
        const freshData: DashboardData = await res.json();
        setData(freshData);
        setLastSyncTime(new Date(freshData.lastUpdated).toLocaleTimeString());
      }
    } catch (err) {
      console.error("Failed to refresh dashboard data:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const triggerDebouncedRefresh = React.useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    refreshTimeoutRef.current = setTimeout(() => {
      fetchDashboardData();
    }, 400);
  }, [fetchDashboardData]);

  // Supabase Realtime Subscription setup & cleanup
  React.useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("dashboard-realtime-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sales" },
        () => triggerDebouncedRefresh()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sale_items" },
        () => triggerDebouncedRefresh()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "purchases" },
        () => triggerDebouncedRefresh()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "purchase_items" },
        () => triggerDebouncedRefresh()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        () => triggerDebouncedRefresh()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expenses" },
        () => triggerDebouncedRefresh()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "inventory_transactions" },
        () => triggerDebouncedRefresh()
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setRealtimeConnected(true);
        } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          setRealtimeConnected(false);
        }
      });

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [triggerDebouncedRefresh]);

  const { metrics } = data;

  return (
    <div className="space-y-6">
      {/* Top Header & Status Strip */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/70">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Business Overview
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Today&apos;s summary of your buying, selling, stock, and profit numbers
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Realtime Live Pulse Indicator */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card px-3 py-1.5 rounded-lg border border-border/70 shadow-2xs">
            <Radio
              className={`h-3.5 w-3.5 ${
                realtimeConnected ? "text-emerald-500 animate-pulse" : "text-amber-500"
              }`}
            />
            <span className="font-medium text-xs">
              {realtimeConnected ? "Realtime Sync" : "Connecting..."}
            </span>
          </div>

          {lastSyncTime ? (
            <span
              suppressHydrationWarning
              className="text-xs text-muted-foreground font-mono hidden md:inline"
            >
              Updated: {lastSyncTime}
            </span>
          ) : null}

          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            disabled={isRefreshing}
            className="h-8 text-xs gap-2 font-medium"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Row 1: Today's Operations, Live Valuation & Spoilage Loss */}
        <StatCard
          title="Today's Sales"
          value={formatCurrency(metrics.todaySalesAmount)}
          subValue={`${metrics.todaySalesCount} orders (${formatWeight(metrics.todaySalesWeightKg)})`}
          icon={ShoppingCart}
          highlight="info"
        />

        <StatCard
          title="Today's Purchases"
          value={formatCurrency(metrics.todayPurchasesAmount)}
          subValue={`${metrics.todayPurchasesCount} purchases (${formatWeight(metrics.todayPurchasesWeightKg)})`}
          icon={Anchor}
          highlight="default"
        />

        <StatCard
          title="Inventory Value"
          value={formatCurrency(metrics.inventoryValue)}
          subValue={`${formatWeight(metrics.totalStockKg)} in stock`}
          icon={Package}
          highlight="default"
        />

        <StatCard
          title="Fish Spoilage Loss"
          value={formatCurrency(metrics.totalSpoilageLoss)}
          subValue={
            metrics.todaySpoilageLoss > 0
              ? `Today: ${formatCurrency(metrics.todaySpoilageLoss)} (${formatWeight(metrics.todaySpoiledWeightKg)})`
              : `${formatWeight(metrics.totalSpoiledWeightKg)} spoiled & discarded`
          }
          icon={AlertTriangle}
          highlight={metrics.totalSpoilageLoss > 0 ? "danger" : "default"}
        />

        {/* Row 2: Cumulative Profitability & Operating Financials */}
        <StatCard
          title="Total Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          subValue="Total money received from customers"
          icon={DollarSign}
          highlight="info"
        />

        <StatCard
          title="Total Expenses"
          value={formatCurrency(metrics.totalExpenses)}
          subValue="All business spending (ice, packing, transport, etc.)"
          icon={Receipt}
          highlight="default"
        />

        <StatCard
          title="Gross Profit"
          value={formatCurrency(metrics.grossProfit)}
          subValue={`${metrics.grossProfitMargin.toFixed(1)}% Gross Margin`}
          icon={TrendingUp}
          highlight={metrics.grossProfit >= 0 ? "success" : "danger"}
        />

        <StatCard
          title="Net Profit"
          value={formatCurrency(metrics.netProfit)}
          subValue={`${metrics.netProfitMargin.toFixed(1)}% Net Margin after expenses`}
          icon={Scale}
          highlight={metrics.netProfit >= 0 ? "success" : "danger"}
        />

        {/* Row 3: Outstanding Balances */}
        <StatCard
          title="Outstanding Receivables"
          value={formatCurrency(metrics.outstandingReceivables)}
          subValue="Money customers owe you"
          icon={Building2}
          highlight={metrics.outstandingReceivables > 0 ? "warning" : "default"}
          className="xl:col-span-2"
        />

        <StatCard
          title="Outstanding Payables"
          value={formatCurrency(metrics.outstandingPayables)}
          subValue="Money you owe to suppliers"
          icon={CreditCard}
          highlight={metrics.outstandingPayables > 0 ? "warning" : "default"}
          className="xl:col-span-2"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Sales Trend (14 Days) */}
        <SalesChart data={data.salesTrend} />

        {/* Purchase Trend (14 Days) */}
        <PurchaseChart data={data.purchaseTrend} />
      </div>

      {/* Monthly Profit & Loss (Full Width) */}
      <ProfitLossChart data={data.monthlyProfitLoss} />
    </div>
  );
}
