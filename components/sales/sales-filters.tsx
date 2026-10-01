"use client";

import * as React from "react";
import { DataFilterBar } from "@/components/ui/data-filter-bar";
import {
  PAYMENT_STATUS_OPTIONS,
  DELIVERY_STATUS_OPTIONS,
} from "@/lib/filter-constants";
import type { CustomerDTO, FishTypeDTO } from "@/types";

export interface SaleFilterValues {
  search: string;
  customerId: string;
  fishTypeId: string;
  paymentStatus: string;
  deliveryStatus: string;
  date: string;
  month: string;
  year: string;
  invoiceNumber: string;
}

export const INITIAL_SALE_FILTERS: SaleFilterValues = {
  search: "",
  customerId: "ALL",
  fishTypeId: "ALL",
  paymentStatus: "ALL",
  deliveryStatus: "ALL",
  date: "",
  month: "ALL",
  year: "ALL",
  invoiceNumber: "",
};

interface SalesFiltersProps {
  customers: CustomerDTO[];
  fishTypes?: FishTypeDTO[];
  filters: SaleFilterValues;
  onFilterChange: (field: keyof SaleFilterValues, value: string) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  isLoading?: boolean;
}

export function SalesFilters({
  customers,
  fishTypes = [],
  filters,
  onFilterChange,
  onResetFilters,
  hasActiveFilters,
  isLoading = false,
}: SalesFiltersProps) {
  return (
    <DataFilterBar
      search={filters.search}
      onSearchChange={(val) => onFilterChange("search", val)}
      searchPlaceholder="Search invoice #, customer name, company..."
      primarySelect={{
        value: filters.paymentStatus,
        onChange: (val) => onFilterChange("paymentStatus", val),
        options: PAYMENT_STATUS_OPTIONS,
        className: "w-36",
      }}
      secondarySelect={{
        value: filters.deliveryStatus,
        onChange: (val) => onFilterChange("deliveryStatus", val),
        options: DELIVERY_STATUS_OPTIONS,
        className: "w-36",
      }}
      customer={{
        value: filters.customerId,
        onChange: (val) => onFilterChange("customerId", val),
        options: customers,
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
        placeholder: "Search by invoice #...",
      }}
      hasActiveFilters={hasActiveFilters}
      onResetFilters={onResetFilters}
      isLoading={isLoading}
    />
  );
}
