/**
 * Reusable filter utilities for parsing, serializing, and querying filters.
 */

export interface BaseFilterParams {
  date?: string;
  startDate?: string;
  endDate?: string;
  month?: string;
  year?: string;
  fishTypeId?: string;
  supplierId?: string;
  customerId?: string;
  paymentStatus?: string;
  invoiceNumber?: string;
  search?: string;
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

/**
 * Builds Prisma DateTime condition for date/month/year/startDate/endDate.
 */
export function buildPrismaDateFilter(filters: {
  date?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  month?: string | null;
  year?: string | null;
}): { gte?: Date; lte?: Date } | undefined {
  // 1. Exact Date
  if (filters.date && filters.date.trim() !== "") {
    const start = new Date(filters.date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(filters.date);
    end.setHours(23, 59, 59, 999);
    return { gte: start, lte: end };
  }

  // 2. Custom Date Range (startDate & endDate)
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

  // 3. Month and/or Year
  const hasMonth = Boolean(filters.month && filters.month !== "ALL" && filters.month !== "");
  const hasYear = Boolean(filters.year && filters.year !== "ALL" && filters.year !== "");

  if (hasYear || hasMonth) {
    const year = hasYear ? parseInt(String(filters.year), 10) : new Date().getFullYear();
    const month = hasMonth ? parseInt(String(filters.month), 10) - 1 : 0;
    const startMonth = hasMonth ? month : 0;
    const endMonth = hasMonth ? month + 1 : 12;

    const startDate = new Date(year, startMonth, 1, 0, 0, 0, 0);
    const endDate = new Date(year, endMonth, 0, 23, 59, 59, 999);
    return { gte: startDate, lte: endDate };
  }

  return undefined;
}

/**
 * Serializes filter object into URLSearchParams string, removing empty/default values.
 */
export function serializeFiltersToQueryString(
  filters: Record<string, unknown>,
  page?: number,
  limit?: number
): string {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== "ALL"
    ) {
      params.set(key, String(value));
    }
  });

  if (page && page > 1) {
    params.set("page", String(page));
  }
  if (limit && limit !== 50) {
    params.set("limit", String(limit));
  }

  return params.toString();
}

/**
 * Checks whether any filter in the object is active (non-empty, non-default).
 */
export function hasActiveFilterValues(
  filters: Record<string, unknown>,
  defaultValues: Record<string, unknown> = {}
): boolean {
  for (const [key, value] of Object.entries(filters)) {
    if (key === "page" || key === "limit") continue;
    const defaultVal = defaultValues[key];
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== "ALL" &&
      value !== defaultVal
    ) {
      return true;
    }
  }
  return false;
}
