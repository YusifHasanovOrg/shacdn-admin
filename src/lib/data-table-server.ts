"use client";

import { useEffect, useState } from "react";

import type { ColumnFiltersState, PaginationState } from "@tanstack/react-table";

export function columnFilterValue(filters: ColumnFiltersState, id: string) {
  const value = filters.find((filter) => filter.id === id)?.value;
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function useServerTableState(initialPageSize = 20) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [debouncedFilters, setDebouncedFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedFilters((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(columnFilters)) return prev;
        return columnFilters;
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [columnFilters]);

  // Reset to first page when debounced filters change.
  // biome-ignore lint/correctness/useExhaustiveDependencies: debouncedFilters is the intentional trigger.
  useEffect(() => {
    setPagination((prev) => (prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }));
  }, [debouncedFilters]);

  return {
    columnFilters,
    setColumnFilters,
    debouncedFilters,
    pagination,
    setPagination,
  };
}

export function pageCountFromTotal(total: number, pageSize: number) {
  return Math.max(1, Math.ceil(total / pageSize) || 1);
}
