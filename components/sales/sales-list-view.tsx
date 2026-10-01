"use client";

import * as React from "react";
import { formatCurrency, formatWeight } from "@/lib/utils";
import type { SaleDTO, CustomerDTO, FishTypeDTO } from "@/types";
import {
  SalesFilters,
  INITIAL_SALE_FILTERS,
  type SaleFilterValues,
} from "./sales-filters";
import { SalesTable } from "./sales-table";
import { Pagination } from "@/components/ui/pagination";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { serializeFiltersToQueryString } from "@/lib/filter-utils";

interface SalesListViewProps {
  initialSales: SaleDTO[];
  customers?: CustomerDTO[];
  fishTypes?: FishTypeDTO[];
}

export function SalesListView({
  initialSales,
  customers = [],
  fishTypes = [],
}: SalesListViewProps) {
  const {
    filters,
    page,
    limit,
    updateFilter,
    resetFilters,
    setPage,
    setLimit,
    hasActiveFilters,
  } = useUrlFilters<SaleFilterValues>({
    initialValues: INITIAL_SALE_FILTERS,
    debounceMs: 300,
  });

  const [sales, setSales] = React.useState<SaleDTO[]>(initialSales);
  const [total, setTotal] = React.useState<number>(initialSales.length);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const isFirstMount = React.useRef(true);

  // Fetch sales from server with current active filters & pagination
  const fetchSales = React.useCallback(
    async (appliedFilters: SaleFilterValues, pageNum: number, pageSize: number) => {
      setIsLoading(true);
      try {
        const query = serializeFiltersToQueryString(
          appliedFilters as unknown as Record<string, unknown>,
          pageNum,
          pageSize
        );
        const res = await fetch(`/api/sales?${query}`);
        if (res.ok) {
          const json = await res.json();
          setSales(json.data || []);
          if (typeof json.total === "number") {
            setTotal(json.total);
          }
        }
      } catch (err) {
        console.error("Failed to load sales list:", err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  React.useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      // If URL had initial active filters, fetch right away to reflect them
      if (hasActiveFilters || page > 1 || limit !== 50) {
        fetchSales(filters, page, limit);
      }
      return;
    }

    const timer = setTimeout(() => {
      fetchSales(filters, page, limit);
    }, 250);

    return () => clearTimeout(timer);
  }, [filters, page, limit, fetchSales, hasActiveFilters]);

  // Summary statistics from current visible filtered sales
  const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalWeight = sales.reduce((sum, s) => sum + s.totalWeightKg, 0);
  const totalDueAmount = sales.reduce((sum, s) => sum + s.balanceAmount, 0);

  return (
    <div className="space-y-4">
      <SalesFilters
        customers={customers}
        fishTypes={fishTypes}
        filters={filters}
        onFilterChange={updateFilter}
        onResetFilters={resetFilters}
        hasActiveFilters={hasActiveFilters}
        isLoading={isLoading}
      />

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-border bg-card p-3 shadow-xs">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Total Orders
          </p>
          <p className="text-lg font-bold font-mono text-foreground">
            {total}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 shadow-xs">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Total Revenue
          </p>
          <p className="text-lg font-bold font-mono text-primary">
            {formatCurrency(totalRevenue)}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 shadow-xs">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Weight Dispatched
          </p>
          <p className="text-lg font-bold font-mono text-foreground">
            {formatWeight(totalWeight)}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 shadow-xs">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Outstanding Due
          </p>
          <p className="text-lg font-bold font-mono text-amber-600">
            {formatCurrency(totalDueAmount)}
          </p>
        </div>
      </div>

      {/* Sales Table with loading state and pagination */}
      <div className={`transition-opacity duration-150 ${isLoading ? "opacity-60 pointer-events-none" : "opacity-100"}`}>
        <SalesTable sales={sales} />
      </div>

      <Pagination
        currentPage={page}
        totalItems={total}
        pageSize={limit}
        onPageChange={setPage}
        onPageSizeChange={setLimit}
        isLoading={isLoading}
      />
    </div>
  );
}
