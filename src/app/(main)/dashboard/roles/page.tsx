"use client";

import { useEffect, useMemo, useState } from "react";

import { useTable } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

import { RequirePermission, useApiErrorHandler } from "@/components/auth/permission-guards";
import { CrudListPage } from "@/components/crud/crud-list-page";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { rbacApi, type RoleResponse } from "@/lib/api/auth";
import { formatApiError } from "@/lib/api/client";
import { PERMISSIONS } from "@/lib/auth/constants";
import { dataTableFeatures } from "@/lib/data-table-features";
import type { DataTableFeatures } from "@/lib/data-table-features";

const rolesColumns: ColumnDef<DataTableFeatures, RoleResponse>[] = [
  {
    accessorKey: "code",
    header: () => <span className="font-medium text-sm">Code</span>,
    cell: ({ row }) => <span className="font-mono text-sm">{row.original.code}</span>,
    size: 120,
  },
  {
    accessorKey: "name",
    header: () => <span className="font-medium text-sm">Name</span>,
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    size: 160,
  },
  {
    id: "permissions",
    accessorFn: (row) => row.permissions.join(", "),
    header: () => <span className="font-medium text-sm">Permissions</span>,
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.permissions.map((permission) => (
          <Badge key={permission} variant="outline">
            {permission}
          </Badge>
        ))}
      </div>
    ),
    size: 420,
  },
];

function RolesPageContent() {
  const handleApiError = useApiErrorHandler();
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const data = await rbacApi.listRoles();
        if (cancelled) return;
        setRoles(data);
      } catch (error) {
        if (cancelled) return;
        handleApiError(error);
        toast.error(formatApiError(error, "Failed to load roles"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [handleApiError]);

  const table = useTable({
    features: dataTableFeatures,
    data: roles,
    columns: rolesColumns,
    getRowId: (row) => row.code,
  });

  const description = useMemo(() => {
    if (loading) return "Loading roles and permissions…";
    return `${roles.length} roles · read-only view from RBAC API`;
  }, [loading, roles.length]);

  return (
    <CrudListPage title="Roles & Permissions" description={description}>
      {loading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <DataTable table={table} emptyMessage="No roles configured" />
      )}
    </CrudListPage>
  );
}

export default function Page() {
  return (
    <RequirePermission permission={PERMISSIONS.rolesRead}>
      <RolesPageContent />
    </RequirePermission>
  );
}
