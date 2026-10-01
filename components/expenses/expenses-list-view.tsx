"use client";

import * as React from "react";
import { formatCurrency } from "@/lib/utils";
import { ExpenseFilters, INITIAL_EXPENSE_FILTERS, type ExpenseFiltersState } from "./expense-filters";
import { ExpenseTable } from "./expense-table";
import { Pagination } from "@/components/ui/pagination";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Calendar, Tag, FileText } from "lucide-react";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { serializeFiltersToQueryString } from "@/lib/filter-utils";
import type { ExpenseDTO, ExpenseCategoryDTO } from "@/types";

interface ExpensesListViewProps {
  initialExpenses: ExpenseDTO[];
  categories: ExpenseCategoryDTO[];
  metrics?: {
    totalAmount: number;
    totalCount: number;
    thisMonthAmount: number;
    thisMonthCount: number;
    categoryBreakdown: Array<{
      categoryId: string;
      categoryName: string;
      totalAmount: number;
      count: number;
    }>;
  };
}

export function ExpensesListView({
  initialExpenses,
  categories,
  metrics,
}: ExpensesListViewProps) {
  const {
    filters,
    page,
    limit,
    updateFilter,
    resetFilters,
    setPage,
    setLimit,
    hasActiveFilters,
  } = useUrlFilters<ExpenseFiltersState>({
    initialValues: INITIAL_EXPENSE_FILTERS,
    debounceMs: 300,
  });

  const [expenses, setExpenses] = React.useState<ExpenseDTO[]>(initialExpenses);
  const [total, setTotal] = React.useState<number>(metrics?.totalCount ?? initialExpenses.length);
  const [isLoading, setIsLoading] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const isFirstMount = React.useRef(true);

  // Compute live summary from current list
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalCount = expenses.length;

  const topCategory = React.useMemo<{ name: string; amount: number } | null>(() => {
    if (metrics?.categoryBreakdown && metrics.categoryBreakdown.length > 0) {
      const sorted = [...metrics.categoryBreakdown].sort((a, b) => b.totalAmount - a.totalAmount);
      const top = sorted[0];
      return top ? { name: top.categoryName, amount: top.totalAmount } : null;
    }
    const catMap = new Map<string, { name: string; amount: number }>();
    for (const exp of expenses) {
      const prev = catMap.get(exp.categoryId) || { name: exp.categoryName, amount: 0 };
      catMap.set(exp.categoryId, { name: exp.categoryName, amount: prev.amount + exp.amount });
    }
    const list = Array.from(catMap.values()).sort((a, b) => b.amount - a.amount);
    return list[0] || null;
  }, [expenses, metrics]);

  // Fetch filtered expenses from server
  const fetchExpenses = React.useCallback(
    async (appliedFilters: ExpenseFiltersState, pageNum: number, pageSize: number) => {
      setIsLoading(true);
      try {
        const query = serializeFiltersToQueryString(
          appliedFilters as unknown as Record<string, unknown>,
          pageNum,
          pageSize
        );
        const res = await fetch(`/api/expenses?${query}`);
        if (res.ok) {
          const json = await res.json();
          setExpenses(json.data || []);
          if (typeof json.total === "number") {
            setTotal(json.total);
          }
        }
      } catch (err) {
        console.error("Failed to load filtered expenses:", err);
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
        fetchExpenses(filters, page, limit);
      }
      return;
    }

    const timer = setTimeout(() => {
      fetchExpenses(filters, page, limit);
    }, 250);

    return () => clearTimeout(timer);
  }, [filters, page, limit, fetchExpenses, hasActiveFilters]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this expense voucher? This action cannot be undone.")) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setExpenses((prev) => prev.filter((e) => e.id !== id));
        setTotal((prev) => Math.max(0, prev - 1));
      } else {
        const json = await res.json();
        alert(json.error || "Failed to delete expense");
      }
    } catch (err) {
      console.error("Error deleting expense:", err);
      alert("Failed to delete expense. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Filtered Total</p>
              <p className="text-2xl font-bold font-mono text-foreground mt-1">{formatCurrency(totalAmount)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{totalCount} vouchers in view</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/20">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">This Month MTD</p>
              <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {formatCurrency(metrics?.thisMonthAmount ?? totalAmount)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {metrics?.thisMonthCount ?? totalCount} vouchers
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20">
              <Calendar className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Top Category</p>
              <p className="text-sm font-semibold text-foreground mt-1 truncate max-w-[140px]">
                {topCategory ? topCategory.name : "N/A"}
              </p>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                {topCategory ? formatCurrency(topCategory.amount) : "—"}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 ring-1 ring-purple-500/20">
              <Tag className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Recorded</p>
              <p className="text-2xl font-bold font-mono text-foreground mt-1">
                {total}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">All-time vouchers</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20">
              <FileText className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Control Bar */}
      <ExpenseFilters
        categories={categories}
        filters={filters}
        onFilterChange={updateFilter}
        onResetFilters={resetFilters}
        hasActiveFilters={hasActiveFilters}
        isLoading={isLoading}
      />

      {/* Expenses Table */}
      <div className={`transition-opacity duration-150 ${isLoading ? "opacity-60 pointer-events-none" : "opacity-100"}`}>
        <ExpenseTable
          expenses={expenses}
          onDelete={handleDelete}
          isDeleting={deletingId}
        />
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
