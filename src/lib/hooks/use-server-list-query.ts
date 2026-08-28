"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ColumnFiltersState, PaginationState } from "@tanstack/react-table";

import {
  columnFilterValue,
  columnFilterValues,
  pageCountFromTotal,
  useServerTableState,
} from "@/lib/data-table-server";

export type ServerListResult<TItem> = {
  items: TItem[];
  total: number;
};

export type ServerListQueryContext = {
  debouncedFilters: ColumnFiltersState;
  pagination: PaginationState;
  refreshKey: number;
};

type UseServerListQueryOptions<TItem, TParams> = {
  initialPageSize?: number;
  buildParams: (ctx: ServerListQueryContext) => TParams;
  fetcher: (params: TParams) => Promise<ServerListResult<TItem>>;
  onError?: (error: unknown) => void;
};

export function useServerListQuery<TItem, TParams>({
  initialPageSize = 20,
  buildParams,
  fetcher,
  onError,
}: UseServerListQueryOptions<TItem, TParams>) {
  const { columnFilters, setColumnFilters, debouncedFilters, pagination, setPagination } =
    useServerTableState(initialPageSize);
  const [items, setItems] = useState<TItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const params = useMemo(
    () => buildParams({ debouncedFilters, pagination, refreshKey }),
    [buildParams, debouncedFilters, pagination, refreshKey],
  );

  const fetcherRef = useRef(fetcher);
  const onErrorRef = useRef(onError);
  fetcherRef.current = fetcher;
  onErrorRef.current = onError;

  const paramsKey = useMemo(() => JSON.stringify(params), [params]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const response = await fetcherRef.current(params);
        if (cancelled) return;
        setItems(response.items);
        setTotal(response.total);
      } catch (error) {
        if (cancelled) return;
        onErrorRef.current?.(error);
        setItems([]);
        setTotal(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [paramsKey]);

  const refetch = useCallback(() => {
    setRefreshKey((key) => key + 1);
  }, []);

  return {
    items,
    total,
    loading,
    refetch,
    columnFilters,
    setColumnFilters,
    pagination,
    setPagination,
    pageCount: pageCountFromTotal(total, pagination.pageSize),
  };
}

export { columnFilterValue, columnFilterValues, pageCountFromTotal };
