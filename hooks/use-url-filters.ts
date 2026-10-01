"use client";

import * as React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { serializeFiltersToQueryString, hasActiveFilterValues } from "@/lib/filter-utils";

export interface UseUrlFiltersOptions<T extends Record<string, any>> {
  initialValues: T;
  debounceMs?: number;
  syncToUrl?: boolean;
}

export function useUrlFilters<T extends Record<string, any>>({
  initialValues,
  debounceMs = 300,
  syncToUrl = true,
}: UseUrlFiltersOptions<T>) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Initialize state from URL search params or initialValues
  const parseFromUrl = React.useCallback((): { filters: T; page: number; limit: number } => {
    const loadedFilters = { ...initialValues };
    let page = 1;
    let limit = 50;

    if (searchParams) {
      Object.keys(initialValues).forEach((key) => {
        const val = searchParams.get(key);
        if (val !== null && val !== undefined) {
          (loadedFilters as Record<string, unknown>)[key] = val;
        }
      });

      const pageParam = searchParams.get("page");
      if (pageParam) {
        const parsedPage = parseInt(pageParam, 10);
        if (!isNaN(parsedPage) && parsedPage > 0) page = parsedPage;
      }

      const limitParam = searchParams.get("limit");
      if (limitParam) {
        const parsedLimit = parseInt(limitParam, 10);
        if (!isNaN(parsedLimit) && parsedLimit > 0) limit = parsedLimit;
      }
    }

    return { filters: loadedFilters, page, limit };
  }, [searchParams, initialValues]);

  const [state, setState] = React.useState<{ filters: T; page: number; limit: number }>(() =>
    parseFromUrl()
  );

  const isInitialMount = React.useRef(true);
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Sync to URL when state changes
  React.useEffect(() => {
    if (!syncToUrl) return;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const queryString = serializeFiltersToQueryString(
        state.filters as Record<string, unknown>,
        state.page,
        state.limit
      );
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(targetUrl, { scroll: false });
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [state, pathname, router, syncToUrl, debounceMs]);

  const updateFilter = React.useCallback(
    (key: keyof T, value: unknown) => {
      setState((prev) => ({
        ...prev,
        page: 1, // Reset to page 1 on filter change
        filters: {
          ...prev.filters,
          [key]: value,
        },
      }));
    },
    []
  );

  const setFilters = React.useCallback(
    (newFilters: T | ((prev: T) => T)) => {
      setState((prev) => ({
        ...prev,
        page: 1,
        filters: typeof newFilters === "function" ? newFilters(prev.filters) : newFilters,
      }));
    },
    []
  );

  const resetFilters = React.useCallback(() => {
    setState({
      filters: { ...initialValues },
      page: 1,
      limit: 50,
    });
  }, [initialValues]);

  const setPage = React.useCallback((page: number) => {
    setState((prev) => ({ ...prev, page }));
  }, []);

  const setLimit = React.useCallback((limit: number) => {
    setState((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  const hasActiveFilters = React.useMemo(() => {
    return hasActiveFilterValues(state.filters as Record<string, unknown>, initialValues);
  }, [state.filters, initialValues]);

  return {
    filters: state.filters,
    page: state.page,
    limit: state.limit,
    updateFilter,
    setFilters,
    resetFilters,
    setPage,
    setLimit,
    hasActiveFilters,
  };
}
