"use client";

import * as React from "react";
import { DataFilterBar } from "@/components/ui/data-filter-bar";
import { PAYMENT_STATUS_OPTIONS } from "@/lib/filter-constants";
import type { SupplierDTO, FishTypeDTO } from "@/types";

export interface PurchaseFilterValues {
  search: string;
  supplierId: string;
  fishTypeId: string;
  paymentStatus: string;
  date: string;
  month: string;
  year: string;
  invoiceNumber: string;
}

export const INITIAL_PURCHASE_FILTERS: PurchaseFilterValues = {
  search: "",
  supplierId: "ALL",
  fishTypeId: "ALL",
  paymentStatus: "ALL",
  date: "",
  month: "ALL",
  year: "ALL",
  invoiceNumber: "",
};

interface PurchaseFiltersProps {
  suppliers: SupplierDTO[];
  fishTypes?: FishTypeDTO[];
  filters: PurchaseFilterValues;
  onFilterChange: (field: keyof PurchaseFilterValues, value: string) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  isLoading?: boolean;
}

export function PurchaseFilters({
  suppliers,
  fishTypes = [],
  filters,
  onFilterChange,
  onResetFilters,
  hasActiveFilters,
  isLoading = false,
}: PurchaseFiltersProps) {
  return (
    <DataFilterBar
      search={filters.search}
      onSearchChange={(val) => onFilterChange("search", val)}
      searchPlaceholder="Search purchase #, supplier, harbor..."
      primarySelect={{
        value: filters.paymentStatus,
        onChange: (val) => onFilterChange("paymentStatus", val),
        options: PAYMENT_STATUS_OPTIONS,
        className: "w-36",
      }}
      supplier={{
        value: filters.supplierId,
        onChange: (val) => onFilterChange("supplierId", val),
        options: suppliers.map((s) => ({
          id: s.id,
          name: s.name,
          harbor: s.harborLocation || undefined,
        })),
      }}
      fishType={{
        value: filters.fishTypeId,
        onChange: (val) => onFilterChange("fishTypeId", val),
        options: fishTypes,
      }}
      date={{
        value: filters.date,
        onChange: (val) => onFilterChange("date", val),
        label: "Exact Date",
      }}
      month={{
        value: filters.month,
        onChange: (val) => onFilterChange("month", val),
      }}
      year={{
        value: filters.year,
        onChange: (val) => onFilterChange("year", val),
      }}
      invoiceNumber={{
        value: filters.invoiceNumber,
        onChange: (val) => onFilterChange("invoiceNumber", val),
        placeholder: "Filter by invoice or file name...",
      }}
      hasActiveFilters={hasActiveFilters}
      onResetFilters={onResetFilters}
      isLoading={isLoading}
    />
  );
}
