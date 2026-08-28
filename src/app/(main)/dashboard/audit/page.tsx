"use client";

import { useCallback, useMemo } from "react";

import { useTable } from "@tanstack/react-table";
import { endOfDay, startOfDay } from "date-fns";
import { ScrollText } from "lucide-react";
import { toast } from "sonner";

import { createAuditColumns } from "@/app/(main)/dashboard/audit/_components/audit-columns";
import { RequirePermission, useApiErrorHandler } from "@/components/auth/permission-guards";
import { CrudListPage } from "@/components/crud/crud-list-page";
import { DataTable } from "@/components/data-table";
import { auditApi } from "@/lib/api/audit";
import { formatApiError } from "@/lib/api/client";
import { PERMISSIONS } from "@/lib/auth/constants";
import { dataTableFeatures } from "@/lib/data-table-features";
import { columnFilterValue, useServerListQuery } from "@/lib/hooks/use-server-list-query";
import { useTranslation } from "@/stores/locale/locale-provider";

const ACTIONS = ["create", "update", "delete"] as const;
const RESOURCES = ["product", "user", "role"] as const;

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

function AuditPageContent() {
  const { t, locale } = useTranslation();
  const handleApiError = useApiErrorHandler();

  const actionOptions = useMemo(
    () => ACTIONS.map((value) => ({ value, label: t(`audit.actions.${value}`) })),
    [t],
  );
  const resourceOptions = useMemo(
    () => RESOURCES.map((value) => ({ value, label: t(`audit.resources.${value}`) })),
    [t],
  );

  const buildParams = useCallback(
    ({
      debouncedFilters,
      pagination,
      refreshKey,
    }: {
      debouncedFilters: Parameters<typeof columnFilterValue>[0];
      pagination: { pageIndex: number; pageSize: number };
      refreshKey: number;
    }) => {
      void refreshKey;
      return {
        actor: columnFilterValue(debouncedFilters, "actor"),
        action: columnFilterValue(debouncedFilters, "action"),
        resource_type: columnFilterValue(debouncedFilters, "resource_type"),
        ...parseDateRangeFilter(columnFilterValue(debouncedFilters, "created_at")),
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
      };
    },
    [],
  );

  const fetcher = useCallback(async (params: ReturnType<typeof buildParams>) => {
    const response = await auditApi.list(params);
    return { items: response.items, total: response.total };
  }, []);

  const onError = useCallback(
    (error: unknown) => {
      handleApiError(error);
      toast.error(formatApiError(error, t("audit.loadError")));
    },
    [handleApiError, t],
  );

  const { items, total, loading, columnFilters, setColumnFilters, pagination, setPagination, pageCount } =
    useServerListQuery({
      initialPageSize: 20,
      buildParams,
      fetcher,
      onError,
    });

  const columns = useMemo(
    () =>
      createAuditColumns({
        t,
        locale,
        actionOptions,
        resourceOptions,
      }),
    [actionOptions, locale, resourceOptions, t],
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
    <CrudListPage
      icon={ScrollText}
      title={t("audit.title")}
      description={
        <>
          {t("audit.description")}
          {total > 0 ? ` · ${t("common.results", { count: total.toLocaleString() })}` : ""}
        </>
      }
    >
      <DataTable
        table={table}
        loading={loading}
        emptyMessage={t("audit.empty")}
        emptyDescription={t("audit.emptyDescription")}
      />
    </CrudListPage>
  );
}

export default function Page() {
  return (
    <RequirePermission permission={PERMISSIONS.auditRead}>
      <AuditPageContent />
    </RequirePermission>
  );
}
