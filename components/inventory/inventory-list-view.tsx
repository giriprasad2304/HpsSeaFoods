"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatWeight } from "@/lib/utils";
import { STATUS_BADGE_VARIANTS } from "@/constants";
import { STOCK_STATUS_OPTIONS } from "@/lib/filter-constants";
import { DataFilterBar } from "@/components/ui/data-filter-bar";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { InventoryHeader } from "./inventory-header";
import { StockAdjustmentDialog } from "./stock-adjustment-dialog";
import { SlidersHorizontal } from "lucide-react";
import type { InventoryStockSummaryDTO } from "@/types";

interface InventoryFiltersState {
  search: string;
  status: string;
  category: string;
  fishTypeId: string;
}

const INITIAL_INVENTORY_FILTERS: InventoryFiltersState = {
  search: "",
  status: "ALL",
  category: "ALL",
  fishTypeId: "ALL",
};

interface InventoryListViewProps {
  initialItems: InventoryStockSummaryDTO[];
}

export function InventoryListView({ initialItems }: InventoryListViewProps) {
  const router = useRouter();
  const [items, setItems] = React.useState<InventoryStockSummaryDTO[]>(initialItems);
  const [isAdjustmentOpen, setIsAdjustmentOpen] = React.useState(false);
  const [selectedFishTypeId, setSelectedFishTypeId] = React.useState<string>("");

  React.useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const {
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters,
  } = useUrlFilters<InventoryFiltersState>({
    initialValues: INITIAL_INVENTORY_FILTERS,
    debounceMs: 300,
  });

  // Extract unique categories and fish species
  const categories = React.useMemo(() => {
    const cats = Array.from(new Set(items.map((i) => i.category))).filter(Boolean);
    return cats.map((c) => ({ id: c, name: c }));
  }, [items]);

  const speciesOptions = React.useMemo(() => {
    return items.map((i) => ({
      id: i.fishTypeId,
      name: i.name,
      code: i.code,
    }));
  }, [items]);

  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      // Search
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matches =
          item.code.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.grade.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Status
      if (filters.status !== "ALL" && item.stockStatus !== filters.status) {
        return false;
      }

      // Category
      if (filters.category !== "ALL" && item.category !== filters.category) {
        return false;
      }

      // Fish Type
      if (filters.fishTypeId !== "ALL" && item.fishTypeId !== filters.fishTypeId) {
        return false;
      }

      return true;
    });
  }, [items, filters]);

  // Aggregate stats
  const totalStockKg = filteredItems.reduce((sum, i) => sum + i.currentStockKg, 0);
  const totalValuation = filteredItems.reduce(
    (sum, i) => sum + i.currentStockKg * i.averageCostPerKg,
    0
  );

  const handleOpenAdjustment = (fishId?: string) => {
    setSelectedFishTypeId(fishId || "");
    setIsAdjustmentOpen(true);
  };

  const handleAdjustmentSuccess = (updatedSummary?: InventoryStockSummaryDTO[]) => {
    if (updatedSummary && updatedSummary.length > 0) {
      setItems(updatedSummary);
    }
    router.refresh();
  };

  const handleExportStockReport = () => {
    const headers = [
      "Code",
      "Species Name",
      "Grade",
      "Category",
      "Purchased (kg)",
      "Sold (kg)",
      "Current Stock (kg)",
      "Avg Cost (INR/kg)",
      "Stock Valuation (INR)",
      "Stock Status",
    ];

    const rows = filteredItems.map((item) => [
      item.code,
      `"${item.name}"`,
      `"${item.grade}"`,
      `"${item.category}"`,
      item.totalPurchasedKg.toFixed(2),
      item.totalSoldKg.toFixed(2),
      item.currentStockKg.toFixed(2),
      item.averageCostPerKg.toFixed(2),
      (item.currentStockKg * item.averageCostPerKg).toFixed(2),
      item.stockStatus,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Coastal_Fresh_Stock_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Header with Functional Actions */}
      <InventoryHeader
        onAddStock={() => handleOpenAdjustment()}
        onExportReport={handleExportStockReport}
      />

      {/* Top Filter Bar */}
      <DataFilterBar
        search={filters.search}
        onSearchChange={(val) => updateFilter("search", val)}
        searchPlaceholder="Search code, species, category, grade..."
        primarySelect={{
          value: filters.status,
          onChange: (val) => updateFilter("status", val),
          options: STOCK_STATUS_OPTIONS,
          className: "w-44",
        }}
        category={{
          value: filters.category,
          onChange: (val) => updateFilter("category", val),
          options: categories,
          label: "Category",
        }}
        fishType={{
          value: filters.fishTypeId,
          onChange: (val) => updateFilter("fishTypeId", val),
          options: speciesOptions,
        }}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-border bg-card p-3 shadow-xs">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Fish Varieties
          </p>
          <p className="text-lg font-bold font-mono text-foreground">
            {filteredItems.length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 shadow-xs">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Total Net Stock
          </p>
          <p className="text-lg font-bold font-mono text-foreground">
            {formatWeight(totalStockKg)}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 shadow-xs">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Stock Valuation
          </p>
          <p className="text-lg font-bold font-mono text-primary">
            {formatCurrency(totalValuation)}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 shadow-xs">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Low / Depleted
          </p>
          <p className="text-lg font-bold font-mono text-amber-600">
            {filteredItems.filter((i) => i.stockStatus !== "IN_STOCK").length} items
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Dynamic Inventory Ledger</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Current stock computed automatically from transaction receipts, sales, and wastage
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleOpenAdjustment()}
              className="h-7 text-xs gap-1.5"
            >
              <SlidersHorizontal className="h-3 w-3" />
              Adjust Stock
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[650px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Fish Variety & Grade</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="hidden lg:table-cell text-right">Total Inward</TableHead>
                  <TableHead className="hidden lg:table-cell text-right">Total Dispatched</TableHead>
                  <TableHead className="text-right">Net Current Stock</TableHead>
                  <TableHead className="hidden sm:table-cell text-right">Avg Unit Cost</TableHead>
                  <TableHead className="text-right">Stock Valuation</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-xs text-muted-foreground">
                      No inventory records match the selected filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.fishTypeId}>
                      <TableCell className="font-mono text-xs font-semibold text-primary">
                        {item.code}
                      </TableCell>
                      <TableCell className="font-medium text-xs">
                        <div>{item.name}</div>
                        <span className="text-[11px] text-muted-foreground">{item.grade}</span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                        {item.category}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-right font-mono text-xs text-muted-foreground">
                        {formatWeight(item.totalPurchasedKg)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-right font-mono text-xs text-muted-foreground">
                        {formatWeight(item.totalSoldKg)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-bold text-foreground">
                        {formatWeight(item.currentStockKg)}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-right font-mono text-xs text-muted-foreground">
                        {formatCurrency(item.averageCostPerKg)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-semibold">
                        {formatCurrency(item.currentStockKg * item.averageCostPerKg)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_BADGE_VARIANTS[item.stockStatus] ?? "secondary"}>
                          {item.stockStatus.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenAdjustment(item.fishTypeId)}
                          className="h-7 px-2 text-[11px] gap-1 text-primary hover:text-primary hover:bg-primary/10"
                          title="Adjust Stock"
                        >
                          <SlidersHorizontal className="h-3 w-3" />
                          Adjust
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Stock Adjustment Dialog */}
      <StockAdjustmentDialog
        open={isAdjustmentOpen}
        onOpenChange={setIsAdjustmentOpen}
        items={items}
        selectedFishTypeId={selectedFishTypeId}
        onSuccess={handleAdjustmentSuccess}
      />
    </div>
  );
}
