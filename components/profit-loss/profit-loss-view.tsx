"use client";

import * as React from "react";
import { SummaryCards } from "./summary-cards";
import { PeriodSelector } from "./period-selector";
import { FinancialBreakdown } from "./financial-breakdown";
import { ProfitChart } from "./profit-chart";
import { CustomerProfitabilityTable } from "./customer-profitability-table";
import { FishProfitabilityTable } from "./fish-profitability-table";
import type { ProfitLossDashboardData, ProfitLossPeriod } from "@/types/report";

interface ProfitLossViewProps {
  initialData: ProfitLossDashboardData;
}

export function ProfitLossView({ initialData }: ProfitLossViewProps) {
  const [data, setData] = React.useState<ProfitLossDashboardData>(initialData);
  const [period, setPeriod] = React.useState<ProfitLossPeriod>("this_month");
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"overview" | "breakdown" | "customers" | "species">("overview");

  const handlePeriodChange = async (
    newPeriod: ProfitLossPeriod,
    startDate?: string,
    endDate?: string
  ) => {
    setPeriod(newPeriod);
    setIsLoading(true);

    try {
      const params = new URLSearchParams({ period: newPeriod });
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const res = await fetch(`/api/profit-loss?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch P&L data");
      const result: ProfitLossDashboardData = await res.json();
      setData(result);
    } catch (err) {
      console.error("Error refreshing P&L data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar with Period Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">
              Period: {data.report.periodLabel}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-mono">
              Server-Calculated
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Deterministic gross margin and net profit reconciliation across all seafood batches & operations
          </p>
        </div>

        <PeriodSelector
          currentPeriod={period}
          onPeriodChange={handlePeriodChange}
          isLoading={isLoading}
        />
      </div>

      {/* Top 4 KPI Metric Cards */}
      <SummaryCards report={data.report} />

      {/* Navigation sub-tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-1 overflow-x-auto no-scrollbar scroll-smooth">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeTab === "overview"
              ? "bg-primary text-primary-foreground font-semibold shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          Financial Overview & Trajectory
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("breakdown")}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeTab === "breakdown"
              ? "bg-primary text-primary-foreground font-semibold shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          COGS & Expense Breakdown
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("customers")}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeTab === "customers"
              ? "bg-primary text-primary-foreground font-semibold shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          Profit by Customer ({data.customerProfitability.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("species")}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeTab === "species"
              ? "bg-primary text-primary-foreground font-semibold shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          Profit by Fish Species ({data.fishTypeProfitability.length})
        </button>
      </div>

      {/* View Content according to selected tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <ProfitChart trends={data.trends} />
          <FinancialBreakdown report={data.report} />
        </div>
      )}

      {activeTab === "breakdown" && (
        <FinancialBreakdown report={data.report} />
      )}

      {activeTab === "customers" && (
        <CustomerProfitabilityTable customers={data.customerProfitability} />
      )}

      {activeTab === "species" && (
        <FishProfitabilityTable fishTypes={data.fishTypeProfitability} />
      )}
    </div>
  );
}
