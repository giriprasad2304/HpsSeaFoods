"use client";

import * as React from "react";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalendarDays, RefreshCw } from "lucide-react";
import type { ProfitLossPeriod } from "@/types/report";

interface PeriodSelectorProps {
  currentPeriod: ProfitLossPeriod;
  onPeriodChange: (period: ProfitLossPeriod, startDate?: string, endDate?: string) => void;
  isLoading?: boolean;
}

const PERIOD_OPTIONS = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "this_week" },
  { label: "This Month", value: "this_month" },
  { label: "This Quarter", value: "this_quarter" },
  { label: "This Year", value: "this_year" },
  { label: "Custom Range", value: "custom" },
];

export function PeriodSelector({ currentPeriod, onPeriodChange, isLoading }: PeriodSelectorProps) {
  const [showCustom, setShowCustom] = React.useState(currentPeriod === "custom");
  const [customStart, setCustomStart] = React.useState("");
  const [customEnd, setCustomEnd] = React.useState("");

  const handlePeriodSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const period = e.target.value as ProfitLossPeriod;
    if (period === "custom") {
      setShowCustom(true);
    } else {
      setShowCustom(false);
      onPeriodChange(period);
    }
  };

  const handleCustomApply = () => {
    if (customStart && customEnd) {
      onPeriodChange("custom", customStart, customEnd);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
        <Select
          value={currentPeriod}
          onChange={handlePeriodSelect}
          options={PERIOD_OPTIONS}
          className="w-40 text-xs"
        />
      </div>

      {showCustom && (
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="w-36 text-xs h-9"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <Input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="w-36 text-xs h-9"
          />
          <Button
            size="sm"
            onClick={handleCustomApply}
            disabled={!customStart || !customEnd}
            className="h-9 text-xs"
          >
            Apply
          </Button>
        </div>
      )}

      {isLoading && (
        <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />
      )}
    </div>
  );
}
