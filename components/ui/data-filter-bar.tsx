"use client";

import * as React from "react";
import { Search, SlidersHorizontal, RotateCcw, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  MONTH_OPTIONS,
  YEAR_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  type FilterOption,
} from "@/lib/filter-constants";

export interface DataFilterBarProps {
  // Search
  search?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;

  // Primary Quick Filter (shown next to search)
  primarySelect?: {
    value: string;
    onChange: (val: string) => void;
    options: FilterOption[] | Array<{ label: string; value: string }>;
    className?: string;
  };

  // Secondary Quick Filter (optional)
  secondarySelect?: {
    value: string;
    onChange: (val: string) => void;
    options: FilterOption[] | Array<{ label: string; value: string }>;
    className?: string;
  };

  // Advanced Filter Configurations
  showAdvancedToggle?: boolean;
  hasActiveFilters?: boolean;
  onResetFilters?: () => void;
  isLoading?: boolean;

  // Supported Filter Inputs
  date?: {
    value?: string;
    onChange: (val: string) => void;
    label?: string;
  };

  dateRange?: {
    startDate?: string;
    endDate?: string;
    onStartDateChange: (val: string) => void;
    onEndDateChange: (val: string) => void;
  };

  month?: {
    value?: string;
    onChange: (val: string) => void;
  };

  year?: {
    value?: string;
    onChange: (val: string) => void;
  };

  fishType?: {
    value?: string;
    onChange: (val: string) => void;
    options: Array<{ id: string; name: string; code?: string }>;
  };

  supplier?: {
    value?: string;
    onChange: (val: string) => void;
    options: Array<{ id: string; name: string; harbor?: string }>;
  };

  customer?: {
    value?: string;
    onChange: (val: string) => void;
    options: Array<{ id: string; name: string; companyName?: string | null }>;
  };

  paymentStatus?: {
    value?: string;
    onChange: (val: string) => void;
  };

  invoiceNumber?: {
    value?: string;
    onChange: (val: string) => void;
    placeholder?: string;
  };

  category?: {
    value?: string;
    onChange: (val: string) => void;
    options: Array<{ id: string; name: string }>;
    label?: string;
  };

  // Additional custom controls
  extraAdvancedContent?: React.ReactNode;
}

export function DataFilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Search records, invoices, parties...",
  primarySelect,
  secondarySelect,
  showAdvancedToggle = true,
  hasActiveFilters = false,
  onResetFilters,
  isLoading = false,
  date,
  dateRange,
  month,
  year,
  fishType,
  supplier,
  customer,
  paymentStatus,
  invoiceNumber,
  category,
  extraAdvancedContent,
}: DataFilterBarProps) {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const hasAnyAdvancedFilter = Boolean(
    date ||
      dateRange ||
      month ||
      year ||
      fishType ||
      supplier ||
      customer ||
      paymentStatus ||
      invoiceNumber ||
      category ||
      extraAdvancedContent
  );

  return (
    <div className="space-y-3">
      {/* Primary Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {onSearchChange !== undefined && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={search || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 pr-9 h-9.5 text-xs sm:text-sm bg-card"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {primarySelect && (
            <div className={primarySelect.className || "w-36 sm:w-40"}>
              <Select
                value={primarySelect.value}
                onChange={(e) => primarySelect.onChange(e.target.value)}
                options={primarySelect.options}
                className="h-9.5 text-xs sm:text-sm bg-card"
              />
            </div>
          )}

          {secondarySelect && (
            <div className={secondarySelect.className || "w-36 sm:w-40"}>
              <Select
                value={secondarySelect.value}
                onChange={(e) => secondarySelect.onChange(e.target.value)}
                options={secondarySelect.options}
                className="h-9.5 text-xs sm:text-sm bg-card"
              />
            </div>
          )}

          {showAdvancedToggle && hasAnyAdvancedFilter && (
            <Button
              type="button"
              variant={showAdvanced ? "default" : "outline"}
              size="sm"
              className="gap-2 text-xs h-9.5 font-medium shadow-2xs"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-foreground text-primary text-[10px] font-bold">
                  !
                </span>
              )}
            </Button>
          )}

          {hasActiveFilters && onResetFilters && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-9.5 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
              onClick={onResetFilters}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RotateCcw className="h-3.5 w-3.5" />
              )}
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filter Panel */}
      {showAdvanced && hasAnyAdvancedFilter && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 p-4 rounded-xl border border-border/80 bg-card/70 shadow-sm backdrop-blur-xs animate-slide-down">
          {/* Customer */}
          {customer && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Customer
              </label>
              <Select
                value={customer.value || "ALL"}
                onChange={(e) => customer.onChange(e.target.value)}
                className="h-9 text-xs bg-background"
              >
                <option value="ALL">All Customers</option>
                {customer.options.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.companyName ? `(${c.companyName})` : ""}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {/* Supplier */}
          {supplier && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Supplier / Vessel
              </label>
              <Select
                value={supplier.value || "ALL"}
                onChange={(e) => supplier.onChange(e.target.value)}
                className="h-9 text-xs bg-background"
              >
                <option value="ALL">All Suppliers</option>
                {supplier.options.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.harbor ? `(${s.harbor})` : ""}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {/* Fish Variety / Type */}
          {fishType && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Fish Species
              </label>
              <Select
                value={fishType.value || "ALL"}
                onChange={(e) => fishType.onChange(e.target.value)}
                className="h-9 text-xs bg-background"
              >
                <option value="ALL">All Fish Species</option>
                {fishType.options.map((ft) => (
                  <option key={ft.id} value={ft.id}>
                    {ft.name} {ft.code ? `(${ft.code})` : ""}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {/* Category */}
          {category && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {category.label || "Category"}
              </label>
              <Select
                value={category.value || "ALL"}
                onChange={(e) => category.onChange(e.target.value)}
                className="h-9 text-xs bg-background"
              >
                <option value="ALL">All Categories</option>
                {category.options.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {/* Payment Status (if in advanced) */}
          {paymentStatus && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Payment Status
              </label>
              <Select
                value={paymentStatus.value || "ALL"}
                onChange={(e) => paymentStatus.onChange(e.target.value)}
                options={PAYMENT_STATUS_OPTIONS}
                className="h-9 text-xs bg-background"
              />
            </div>
          )}

          {/* Date (Exact) */}
          {date && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {date.label || "Exact Date"}
              </label>
              <Input
                type="date"
                value={date.value || ""}
                onChange={(e) => date.onChange(e.target.value)}
                className="h-9 text-xs bg-background"
              />
            </div>
          )}

          {/* Date Range */}
          {dateRange && (
            <>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={dateRange.startDate || ""}
                  onChange={(e) => dateRange.onStartDateChange(e.target.value)}
                  className="h-9 text-xs bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  End Date
                </label>
                <Input
                  type="date"
                  value={dateRange.endDate || ""}
                  onChange={(e) => dateRange.onEndDateChange(e.target.value)}
                  className="h-9 text-xs bg-background"
                />
              </div>
            </>
          )}

          {/* Month / Year */}
          {(month || year) && (
            <div className="grid grid-cols-2 gap-2">
              {month && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Month
                  </label>
                  <Select
                    value={month.value || "ALL"}
                    onChange={(e) => month.onChange(e.target.value)}
                    options={MONTH_OPTIONS}
                    className="h-9 text-xs bg-background"
                  />
                </div>
              )}
              {year && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Year
                  </label>
                  <Select
                    value={year.value || "ALL"}
                    onChange={(e) => year.onChange(e.target.value)}
                    options={YEAR_OPTIONS}
                    className="h-9 text-xs bg-background"
                  />
                </div>
              )}
            </div>
          )}

          {/* Invoice Number */}
          {invoiceNumber && (
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Invoice / Document Number
              </label>
              <Input
                placeholder={invoiceNumber.placeholder || "Search by invoice or bill number..."}
                value={invoiceNumber.value || ""}
                onChange={(e) => invoiceNumber.onChange(e.target.value)}
                className="h-9 text-xs bg-background"
              />
            </div>
          )}

          {extraAdvancedContent}
        </div>
      )}
    </div>
  );
}
