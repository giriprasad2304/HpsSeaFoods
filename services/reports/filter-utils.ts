import type { ReportFilterOptions } from "@/types/financial-reports";

export function buildDateFilter(filters: ReportFilterOptions & { date?: string }): { gte?: Date; lte?: Date } | undefined {
  if (filters.date) {
    const s = new Date(filters.date);
    s.setHours(0, 0, 0, 0);
    const e = new Date(filters.date);
    e.setHours(23, 59, 59, 999);
    return { gte: s, lte: e };
  }

  if (filters.startDate || filters.endDate) {
    const condition: { gte?: Date; lte?: Date } = {};
    if (filters.startDate) {
      const s = new Date(filters.startDate);
      s.setHours(0, 0, 0, 0);
      condition.gte = s;
    }
    if (filters.endDate) {
      const e = new Date(filters.endDate);
      e.setHours(23, 59, 59, 999);
      condition.lte = e;
    }
    return condition;
  }

  if (filters.year) {
    const y = filters.year;
    if (filters.month) {
      const m = filters.month - 1; // 0-indexed
      const start = new Date(y, m, 1, 0, 0, 0, 0);
      const end = new Date(y, m + 1, 0, 23, 59, 59, 999);
      return { gte: start, lte: end };
    }
    const start = new Date(y, 0, 1, 0, 0, 0, 0);
    const end = new Date(y, 11, 31, 23, 59, 59, 999);
    return { gte: start, lte: end };
  }

  if (filters.month) {
    const currentYear = new Date().getFullYear();
    const m = filters.month - 1;
    const start = new Date(currentYear, m, 1, 0, 0, 0, 0);
    const end = new Date(currentYear, m + 1, 0, 23, 59, 59, 999);
    return { gte: start, lte: end };
  }

  return undefined;
}
