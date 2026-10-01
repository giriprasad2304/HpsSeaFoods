"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { PAGE_SIZE_OPTIONS } from "@/lib/filter-constants";

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  isLoading?: boolean;
}

export function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, currentPage * pageSize);

  if (totalItems <= pageSize && totalPages <= 1 && !onPageSizeChange) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-3 py-3.5 border-t border-border/80 text-xs text-muted-foreground">
      {/* Item Range Info */}
      <div className="flex flex-wrap items-center gap-3">
        <span>
          Showing <strong className="text-foreground font-semibold">{startItem}</strong> to{" "}
          <strong className="text-foreground font-semibold">{endItem}</strong> of{" "}
          <strong className="text-foreground font-semibold">{totalItems}</strong> entries
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-2 sm:border-l sm:border-border/60 sm:pl-3">
            <span>Rows per page:</span>
            <div className="w-24">
              <Select
                value={String(pageSize)}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                options={PAGE_SIZE_OPTIONS}
                className="h-8 text-xs py-0"
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1 || isLoading}
          className="h-8 w-8 p-0 rounded-lg"
          title="First page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
          className="h-8 w-8 p-0 rounded-lg"
          title="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="px-3 text-xs font-medium text-foreground bg-muted/50 py-1.5 rounded-lg border border-border/60">
          Page {currentPage} of {totalPages}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isLoading}
          className="h-8 w-8 p-0 rounded-lg"
          title="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages || isLoading}
          className="h-8 w-8 p-0 rounded-lg"
          title="Last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
