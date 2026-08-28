"use client";

import { useCallback, useMemo, useState } from "react";

import Link from "next/link";

import { useTable } from "@tanstack/react-table";
import { endOfDay, startOfDay } from "date-fns";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { createProductsColumns } from "@/app/(main)/dashboard/example/products/_components/products-columns";
import { ProductsTable } from "@/app/(main)/dashboard/example/products/_components/products-table";
import { Can, useApiErrorHandler, usePermission } from "@/components/auth/permission-guards";
import { ConfirmDialog } from "@/components/crud/confirm-dialog";
import { CrudListPage } from "@/components/crud/crud-list-page";
import { Button } from "@/components/ui/button";
import type { Product } from "@/data/products";
import { formatApiError } from "@/lib/api/client";
import { productsApi } from "@/lib/api/products";
import { PERMISSIONS } from "@/lib/auth/constants";
import { dataTableFeatures } from "@/lib/data-table-features";
import { columnFilterValue, useServerListQuery } from "@/lib/hooks/use-server-list-query";

function parseDateRangeFilter(value: string | undefined) {
  if (!value) return {};
  const [fromIso, toIso] = value.split("|");
  if (!fromIso || !toIso) return {};
  const from = new Date(fromIso);
  const to = new Date(toIso);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return {};
  return {
    from: startOfDay(from).toISOString(),
    to: endOfDay(to).toISOString(),
  };
}

export default function ProductsPage() {
  const canWrite = usePermission(PERMISSIONS.productsWrite);
  const handleApiError = useApiErrorHandler();
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const buildParams = useCallback(
    ({ debouncedFilters, pagination, refreshKey }: { debouncedFilters: Parameters<typeof columnFilterValue>[0]; pagination: { pageIndex: number; pageSize: number }; refreshKey: number }) => {
      void refreshKey;
      const category = columnFilterValue(debouncedFilters, "category");
      const status = columnFilterValue(debouncedFilters, "status");

      return {
        name: columnFilterValue(debouncedFilters, "name"),
        sku: columnFilterValue(debouncedFilters, "sku"),
        category: category as Product["category"] | undefined,
        status: status as Product["status"] | undefined,
        ...parseDateRangeFilter(columnFilterValue(debouncedFilters, "created_at")),
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
      };
    },
    [],
  );

  const fetcher = useCallback(
    async (params: ReturnType<typeof buildParams>) => {
      const response = await productsApi.list(params);
      return { items: response.items, total: response.total };
    },
    [],
  );

  const onError = useCallback(
    (error: unknown) => {
      handleApiError(error);
      toast.error(formatApiError(error, "Failed to load products"));
    },
    [handleApiError],
  );

  const { items, total, loading, refetch, columnFilters, setColumnFilters, pagination, setPagination, pageCount } =
    useServerListQuery({
      initialPageSize: 10,
      buildParams,
      fetcher,
      onError,
    });

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await productsApi.delete(deleteTarget.id);
      toast.success(`Deleted ${deleteTarget.name}`);
      setDeleteTarget(null);
      refetch();
    } catch (error) {
      handleApiError(error);
      toast.error(formatApiError(error, "Failed to delete product"));
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, handleApiError, refetch]);

  const columns = useMemo(
    () =>
      createProductsColumns({
        canWrite,
        onDelete: (product) => setDeleteTarget(product),
      }),
    [canWrite],
  );

  const table = useTable({
    features: dataTableFeatures,
    data: items,
    columns,
    pageCount,
    manualFiltering: true,
    manualPagination: true,
    state: {
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
  });

  return (
    <>
      <CrudListPage
        title="Products"
        description={
          <>
            Example CRUD with server-side pagination and column filters
            {total > 0 ? ` · ${total.toLocaleString()} results` : ""}
          </>
        }
        actions={
          <Can permission={PERMISSIONS.productsWrite}>
            <Button asChild>
              <Link href="/dashboard/example/products/new">
                <Plus data-icon="inline-start" />
                Add product
              </Link>
            </Button>
          </Can>
        }
      >
        <ProductsTable table={table} loading={loading} canWrite={canWrite} />
      </CrudListPage>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete product?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be soft-deleted and removed from the list.`
            : undefined
        }
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
      />
    </>
  );
}
