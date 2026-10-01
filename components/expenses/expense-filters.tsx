"use client";

import * as React from "react";
import { DataFilterBar } from "@/components/ui/data-filter-bar";
import { EXPENSE_PAYMENT_METHOD_OPTIONS } from "@/lib/filter-constants";
import type { ExpenseCategoryDTO } from "@/types";

export interface ExpenseFiltersState {
  search: string;
  categoryId: string;
  paymentMethod: string;
  date: string;
  startDate: string;
  endDate: string;
  month: string;
  year: string;
}

export const INITIAL_EXPENSE_FILTERS: ExpenseFiltersState = {
  search: "",
  categoryId: "ALL",
  paymentMethod: "ALL",
  date: "",
  startDate: "",
  endDate: "",
  month: "ALL",
  year: "ALL",
};

interface ExpenseFiltersProps {
  categories: ExpenseCategoryDTO[];
  filters: ExpenseFiltersState;
  onFilterChange: (field: keyof ExpenseFiltersState, value: string) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  isLoading?: boolean;
}

export function ExpenseFilters({
  categories,
  filters,
  onFilterChange,
  onResetFilters,
  hasActiveFilters,
  isLoading = false,
}: ExpenseFiltersProps) {
  return (
    <DataFilterBar
      search={filters.search}
      onSearchChange={(val) => onFilterChange("search", val)}
      searchPlaceholder="Search title, payee, voucher #, category..."
      primarySelect={{
        value: filters.categoryId,
        onChange: (val) => onFilterChange("categoryId", val),
        options: [
          { label: "All Categories", value: "ALL" },
          ...categories.map((c) => ({ label: c.name, value: c.id })),
        ],
        className: "w-48",
      }}
      secondarySelect={{
        value: filters.paymentMethod,
        onChange: (val) => onFilterChange("paymentMethod", val),
        options: EXPENSE_PAYMENT_METHOD_OPTIONS,
        className: "w-36",
      }}
      date={{
        value: filters.date,
        onChange: (val) => onFilterChange("date", val),
        label: "Exact Date",
      }}
      dateRange={{
        startDate: filters.startDate,
        endDate: filters.endDate,
        onStartDateChange: (val) => onFilterChange("startDate", val),
        onEndDateChange: (val) => onFilterChange("endDate", val),
      }}
      month={{
        value: filters.month,
        onChange: (val) => onFilterChange("month", val),
      }}
      year={{
        value: filters.year,
        onChange: (val) => onFilterChange("year", val),
      }}
      hasActiveFilters={hasActiveFilters}
      onResetFilters={onResetFilters}
      isLoading={isLoading}
    />
  );
}
