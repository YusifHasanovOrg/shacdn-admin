"use client";

import Link from "next/link";

import type { ColumnDef } from "@tanstack/react-table";
import { Lock, MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { RoleResponse } from "@/lib/api/auth";
import type { DataTableFeatures } from "@/lib/data-table-features";
import type { TranslateFn } from "@/lib/i18n";

type CreateRolesColumnsOptions = {
  canWrite: boolean;
  onDelete: (role: RoleResponse) => void;
  t: TranslateFn;
};

function permissionPreview(permissions: string[], t: TranslateFn) {
  if (!permissions.length) {
    return <span className="text-muted-foreground text-sm">—</span>;
  }

  const visible = permissions.slice(0, 3);
  const rest = permissions.length - visible.length;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {visible.map((permission) => (
        <Badge key={permission} variant="outline" className="font-mono font-normal">
          {permission}
        </Badge>
      ))}
      {rest > 0 ? (
        <span className="text-muted-foreground text-xs tabular-nums">{t("roles.columns.morePermissions", { count: rest })}</span>
      ) : null}
    </div>
  );
}

export function createRolesColumns({
  canWrite,
  onDelete,
  t,
}: CreateRolesColumnsOptions): ColumnDef<DataTableFeatures, RoleResponse>[] {
  const columns: ColumnDef<DataTableFeatures, RoleResponse>[] = [
    {
      accessorKey: "name",
      header: () => <span className="font-medium text-sm">{t("roles.columns.name")}</span>,
      cell: ({ row }) => (
        <Link
          href={`/dashboard/roles/${encodeURIComponent(row.original.code)}/edit`}
          className="flex items-center gap-3 font-medium underline-offset-4 hover:underline"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="size-3.5" />
          </span>
          <span className="min-w-0 truncate">{row.original.name}</span>
        </Link>
      ),
      size: 200,
    },
    {
      accessorKey: "code",
      header: () => <span className="font-medium text-sm">{t("roles.columns.code")}</span>,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-muted-foreground text-xs">{row.original.code}</span>
          {row.original.system ? (
            <Badge variant="secondary" className="text-xs">
              {t("roles.system")}
            </Badge>
          ) : null}
        </div>
      ),
      size: 160,
    },
    {
      id: "permissions",
      accessorFn: (row) => row.permissions.join(", "),
      header: () => <span className="font-medium text-sm">{t("roles.columns.permissions")}</span>,
      cell: ({ row }) => permissionPreview(row.original.permissions, t),
      size: 360,
    },
  ];

  if (canWrite) {
    columns.push({
      id: "actions",
      header: () => <div className="text-right font-medium text-sm">{t("common.actions")}</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label={t("roles.columns.openActions", { name: row.original.name })}
                className="size-8 rounded-md text-muted-foreground hover:bg-muted/50"
                size="icon-sm"
                variant="ghost"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/roles/${encodeURIComponent(row.original.code)}/edit`}>{t("common.edit")}</Link>
              </DropdownMenuItem>
              {!row.original.system ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={() => onDelete(row.original)}>
                    {t("common.delete")}
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      enableSorting: false,
      size: 80,
    });
  }

  return columns;
}
