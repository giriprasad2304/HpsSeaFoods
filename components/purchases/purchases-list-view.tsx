"use client";

import * as React from "react";
import { formatCurrency, formatWeight } from "@/lib/utils";
import type { PurchaseDTO, SupplierDTO, FishTypeDTO } from "@/types";
import {
  PurchaseFilters,
  INITIAL_PURCHASE_FILTERS,
  type PurchaseFilterValues,
} from "./purchase-filters";
import { PurchaseTable } from "./purchase-table";
import { Pagination } from "@/components/ui/pagination";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { serializeFiltersToQueryString } from "@/lib/filter-utils";

interface PurchasesListViewProps {
  initialBatches: PurchaseDTO[];
  suppliers?: SupplierDTO[];
  fishTypes?: FishTypeDTO[];
}

export function PurchasesListView({
  initialBatches,
  suppliers = [],
  fishTypes = [],
}: PurchasesListViewProps) {
  const {
    filters,
    page,
    limit,
    updateFilter,
    resetFilters,
    setPage,
    setLimit,
    hasActiveFilters,
  } = useUrlFilters<PurchaseFilterValues>({
    initialValues: INITIAL_PURCHASE_FILTERS,
    debounceMs: 300,
  });

  const [purchases, setPurchases] = React.useState<PurchaseDTO[]>(initialBatches);
  const [total, setTotal] = React.useState<number>(initialBatches.length);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const isFirstMount = React.useRef(true);

  // Fetch purchases from server with current active filters & pagination
  const fetchPurchases = React.useCallback(
    async (appliedFilters: PurchaseFilterValues, pageNum: number, pageSize: number) => {
      setIsLoading(true);
      try {
        const query = serializeFiltersToQueryString(
          appliedFilters as unknown as Record<string, unknown>,
          pageNum,
          pageSize
        );
        const res = await fetch(`/api/purchases?${query}`);
        if (res.ok) {
          const json = await res.json();
          setPurchases(json.data || []);
          if (typeof json.total === "number") {
            setTotal(json.total);
          }
        }
      } catch (err) {
        console.error("Failed to load purchases list:", err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  React.useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      if (hasActiveFilters || page > 1 || limit !== 50) {
        fetchPurchases(filters, page, limit);
      }
      return;
    }

    const timer = setTimeout(() => {
      fetchPurchases(filters, page, limit);
    }, 250);

    return () => clearTimeout(timer);
  }, [filters, page, limit, fetchPurchases, hasActiveFilters]);

  // Summary statistics from current visible purchases
  const totalAmount = purchases.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalWeight = purchases.reduce((sum, b) => sum + b.totalWeightKg, 0);
  const pendingPaymentsCount = purchases.filter(
    (b) => b.paymentStatus === "UNPAID" || b.paymentStatus === "PARTIAL"
  ).length;

  return (
    <div className="space-y-4">
      <PurchaseFilters
        suppliers={suppliers}
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
            Total Landings
          </p>
          <p className="text-lg font-bold font-mono text-foreground">
            {total}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 shadow-xs">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Total Purchase Cost
          </p>
          <p className="text-lg font-bold font-mono text-primary">
            {formatCurrency(totalAmount)}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 shadow-xs">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Total Weight Inward
          </p>
          <p className="text-lg font-bold font-mono text-foreground">
            {formatWeight(totalWeight)}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 shadow-xs">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Pending Settlements
          </p>
          <p className="text-lg font-bold font-mono text-amber-600">
            {pendingPaymentsCount} Batches
          </p>
        </div>
      </div>

      {/* Purchase Table with loading state and pagination */}
      <div className={`transition-opacity duration-150 ${isLoading ? "opacity-60 pointer-events-none" : "opacity-100"}`}>
        <PurchaseTable purchases={purchases} />
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
