/**
 * Date utilities for Profit & Loss date-range filtering.
 */
import type { ProfitLossPeriod, ProfitLossDateFilter } from "@/types/report";

export interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

/**
 * Resolve a ProfitLossDateFilter into a concrete start/end Date pair with a label.
 */
export function resolveDateRange(filter?: ProfitLossDateFilter): DateRange {
  const now = new Date();

  if (!filter || filter.period === "this_month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
    const monthName = now.toLocaleString("en-US", { month: "long", year: "numeric" });
    return { start, end, label: monthName };
  }

  switch (filter.period) {
    case "today": {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return { start, end, label: now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) };
    }

    case "this_week": {
      const dayOfWeek = now.getDay();
      const start = new Date(now);
      start.setDate(now.getDate() - dayOfWeek);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return {
        start,
        end,
        label: `Week of ${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
      };
    }

    case "this_quarter": {
      const quarter = Math.floor(now.getMonth() / 3);
      const start = new Date(now.getFullYear(), quarter * 3, 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
      end.setHours(23, 59, 59, 999);
      return { start, end, label: `Q${quarter + 1} ${now.getFullYear()}` };
    }

    case "this_year": {
      const start = new Date(now.getFullYear(), 0, 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now.getFullYear(), 11, 31);
      end.setHours(23, 59, 59, 999);
      return { start, end, label: `FY ${now.getFullYear()}` };
    }

    case "custom": {
      const start = filter.startDate ? new Date(filter.startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      const end = filter.endDate ? new Date(filter.endDate) : new Date();
      end.setHours(23, 59, 59, 999);
      const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      return { start, end, label: `${fmt(start)} – ${fmt(end)}` };
    }

    default: {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      return { start, end, label: now.toLocaleString("en-US", { month: "long", year: "numeric" }) };
    }
  }
}
