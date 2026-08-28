"use client";

import { useCallback, useMemo, useState } from "react";

import type { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { RequirePermission, useApiErrorHandler, usePermission } from "@/components/auth/permission-guards";
import { ConfirmDialog } from "@/components/crud/confirm-dialog";
import { CrudListPage } from "@/components/crud/crud-list-page";
import { DataTable, DataTableColumnHeader } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatApiError } from "@/lib/api/client";
import type { User } from "@/lib/api/users";
import { usersApi } from "@/lib/api/users";
import { PERMISSIONS } from "@/lib/auth/constants";
import { dataTableFeatures } from "@/lib/data-table-features";
import type { DataTableFeatures } from "@/lib/data-table-features";
import { columnFilterValue, useServerListQuery } from "@/lib/hooks/use-server-list-query";
import { getInitials } from "@/lib/utils";

import { ManageUserRolesDialog } from "./_components/manage-user-roles-dialog";

function createUsersColumns(options: {
  canWrite: boolean;
  onDelete: (user: User) => void;
  onManageRoles: (user: User) => void;
}): ColumnDef<DataTableFeatures, User>[] {
  const columns: ColumnDef<DataTableFeatures, User>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" filter={{ kind: "text", placeholder: "Search name..." }} />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-medium text-primary text-xs">
            {getInitials(row.original.name)}
          </span>
          <span className="truncate font-medium">{row.original.name}</span>
        </div>
      ),
      size: 220,
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" filter={{ kind: "text", placeholder: "Search email..." }} />
      ),
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.email}</span>,
      size: 240,
    },
    {
      id: "roles",
      accessorFn: (row) => row.roles.join(", "),
      header: () => <span className="font-medium text-sm">Roles</span>,
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.roles.length ? (
            row.original.roles.map((role) => (
              <Badge key={role} variant="outline">
                {role}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-sm">—</span>
          )}
        </div>
      ),
      size: 200,
    },
    {
      accessorKey: "created_at",
      header: () => <span className="font-medium text-sm">Created</span>,
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {new Date(row.original.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
      size: 120,
    },
  ];

  if (options.canWrite) {
    columns.push({
      id: "actions",
      header: () => <div className="text-right font-medium text-sm">Actions</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-label={`Open actions for ${row.original.name}`} size="icon-sm" variant="ghost">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => options.onManageRoles(row.original)}>Manage roles</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => options.onDelete(row.original)}>
                Delete user
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      size: 80,
    });
  }

  return columns;
}

function UsersPageContent() {
  const canWrite = usePermission(PERMISSIONS.usersWrite);
  const handleApiError = useApiErrorHandler();
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [rolesTarget, setRolesTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const buildParams = useCallback(
    ({ debouncedFilters, pagination, refreshKey }: { debouncedFilters: Parameters<typeof columnFilterValue>[0]; pagination: { pageIndex: number; pageSize: number }; refreshKey: number }) => {
      void refreshKey;
      return {
        name: columnFilterValue(debouncedFilters, "name"),
        email: columnFilterValue(debouncedFilters, "email"),
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
      };
    },
    [],
  );

  const fetcher = useCallback(async (params: ReturnType<typeof buildParams>) => {
    const response = await usersApi.list(params);
    return { items: response.items, total: response.total };
  }, []);

  const onError = useCallback(
    (error: unknown) => {
      handleApiError(error);
      toast.error(formatApiError(error, "Failed to load users"));
    },
    [handleApiError],
  );

  const { items, total, loading, refetch, columnFilters, setColumnFilters, pagination, setPagination, pageCount } =
    useServerListQuery({
      buildParams,
      fetcher,
      onError,
    });

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await usersApi.delete(deleteTarget.id);
      toast.success(`Deleted ${deleteTarget.name}`);
      setDeleteTarget(null);
      refetch();
    } catch (error) {
      handleApiError(error);
      toast.error(formatApiError(error, "Failed to delete user"));
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, handleApiError, refetch]);

  const columns = useMemo(
    () =>
      createUsersColumns({
        canWrite,
        onDelete: setDeleteTarget,
        onManageRoles: setRolesTarget,
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
    state: { columnFilters, pagination },
    getRowId: (row) => row.id,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
  });

  return (
    <>
      <CrudListPage
        title="Users"
        description={
          <>
            Organization members and role assignments
            {total > 0 ? ` · ${total.toLocaleString()} results` : ""}
          </>
        }
      >
        <DataTable table={table} loading={loading} emptyMessage="No users found" />
      </CrudListPage>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete user?"
        description={
          deleteTarget ? `"${deleteTarget.name}" will be soft-deleted and lose access.` : undefined
        }
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
      />

      <ManageUserRolesDialog
        user={rolesTarget}
        open={Boolean(rolesTarget)}
        onOpenChange={(open) => {
          if (!open) setRolesTarget(null);
        }}
        onSaved={() => {
          setRolesTarget(null);
          refetch();
        }}
      />
    </>
  );
}

export default function Page() {
  return (
    <RequirePermission permission={PERMISSIONS.usersRead}>
      <UsersPageContent />
    </RequirePermission>
  );
}
