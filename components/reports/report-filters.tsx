"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw, X } from "lucide-react";
import {
  MONTH_OPTIONS,
  YEAR_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
} from "@/lib/filter-constants";
import type { ReportFilterOptions, ReportLookupData } from "@/types/financial-reports";

interface ReportFiltersProps {
  filters: ReportFilterOptions;
  onFilterChange: (newFilters: ReportFilterOptions) => void;
  lookups?: ReportLookupData;
  showFishType?: boolean;
  showSupplier?: boolean;
  showCustomer?: boolean;
  showPaymentStatus?: boolean;
  showInvoiceSearch?: boolean;
  isLoading?: boolean;
}

export function ReportFilters({
  filters,
  onFilterChange,
  lookups,
  showFishType = true,
  showSupplier = false,
  showCustomer = false,
  showPaymentStatus = true,
  showInvoiceSearch = true,
  isLoading = false,
}: ReportFiltersProps) {
  const [searchDoc, setSearchDoc] = React.useState(filters.invoiceNumber || filters.search || "");

  // Sync internal search input with incoming filters
  React.useEffect(() => {
    setSearchDoc(filters.invoiceNumber || filters.search || "");
  }, [filters.invoiceNumber, filters.search]);

  const update = (key: keyof ReportFilterOptions, val: unknown) => {
    onFilterChange({
      ...filters,
      [key]: val === "" || val === "ALL" ? undefined : val,
    });
  };

  const handleReset = () => {
    setSearchDoc("");
    onFilterChange({});
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({
      ...filters,
      invoiceNumber: searchDoc.trim() || undefined,
      search: searchDoc.trim() || undefined,
    });
  };

  const hasFilters = Object.values(filters).some(
    (v) => v !== undefined && v !== null && v !== "" && v !== "ALL"
  );

  return (
    <div className="rounded-lg border border-border bg-card p-3.5 space-y-3 shadow-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {/* Start Date */}
        <div>
          <label className="text-[11px] font-medium text-muted-foreground block mb-1">
            Start Date
          </label>
          <Input
            type="date"
            value={filters.startDate || ""}
            onChange={(e) => update("startDate", e.target.value)}
            className="h-8 text-xs bg-background"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="text-[11px] font-medium text-muted-foreground block mb-1">
            End Date
          </label>
          <Input
            type="date"
            value={filters.endDate || ""}
            onChange={(e) => update("endDate", e.target.value)}
            className="h-8 text-xs bg-background"
          />
        </div>

        {/* Month */}
        <div>
          <label className="text-[11px] font-medium text-muted-foreground block mb-1">
            Month
          </label>
          <Select
            value={filters.month ? String(filters.month) : "ALL"}
            onChange={(e) => {
              const val = e.target.value;
              update("month", val === "ALL" || val === "" ? undefined : parseInt(val, 10));
            }}
            options={MONTH_OPTIONS}
            className="h-8 text-xs bg-background"
          />
        </div>

        {/* Year */}
        <div>
          <label className="text-[11px] font-medium text-muted-foreground block mb-1">
            Year
          </label>
          <Select
            value={filters.year ? String(filters.year) : "ALL"}
            onChange={(e) => {
              const val = e.target.value;
              update("year", val === "ALL" || val === "" ? undefined : parseInt(val, 10));
            }}
            options={YEAR_OPTIONS}
            className="h-8 text-xs bg-background"
          />
        </div>

        {/* Customer Filter */}
        {showCustomer && (
          <div>
            <label className="text-[11px] font-medium text-muted-foreground block mb-1">
              Customer
            </label>
            <Select
              value={filters.customerId || "ALL"}
              onChange={(e) => update("customerId", e.target.value)}
              className="h-8 text-xs bg-background"
            >
              <option value="ALL">All Customers</option>
              {lookups?.customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
        )}

        {/* Supplier Filter */}
        {showSupplier && (
          <div>
            <label className="text-[11px] font-medium text-muted-foreground block mb-1">
              Supplier / Vessel
            </label>
            <Select
              value={filters.supplierId || "ALL"}
              onChange={(e) => update("supplierId", e.target.value)}
              className="h-8 text-xs bg-background"
            >
              <option value="ALL">All Suppliers</option>
              {lookups?.suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>
        )}

        {/* Fish Species Filter */}
        {showFishType && (
          <div>
            <label className="text-[11px] font-medium text-muted-foreground block mb-1">
              Fish Species
            </label>
            <Select
              value={filters.fishTypeId || "ALL"}
              onChange={(e) => update("fishTypeId", e.target.value)}
              className="h-8 text-xs bg-background"
            >
              <option value="ALL">All Species</option>
              {lookups?.fishTypes.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </Select>
          </div>
        )}

        {/* Payment Status Filter */}
        {showPaymentStatus && (
          <div>
            <label className="text-[11px] font-medium text-muted-foreground block mb-1">
              Payment Status
            </label>
            <Select
              value={filters.paymentStatus || "ALL"}
              onChange={(e) => update("paymentStatus", e.target.value)}
              options={PAYMENT_STATUS_OPTIONS}
              className="h-8 text-xs bg-background"
            />
          </div>
        )}
      </div>

      {/* Second row: Document Search & Action buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border">
        {showInvoiceSearch ? (
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5 flex-1 max-w-sm">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search invoice / batch # / keyword..."
                value={searchDoc}
                onChange={(e) => setSearchDoc(e.target.value)}
                className="h-8 text-xs bg-background pr-6"
              />
              {searchDoc && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchDoc("");
                    onFilterChange({
                      ...filters,
                      invoiceNumber: undefined,
                      search: undefined,
                    });
                  }}
                  className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <Button type="submit" size="sm" variant="secondary" className="h-8 px-2.5 text-xs">
              <Search className="h-3.5 w-3.5" />
            </Button>
          </form>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2">
          {hasFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={isLoading}
              className="h-8 text-xs text-destructive hover:text-destructive gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
