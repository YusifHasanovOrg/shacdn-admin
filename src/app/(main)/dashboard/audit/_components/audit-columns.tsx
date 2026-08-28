"use client";

import Link from "next/link";

import type { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table";
import type { ColumnHeaderFilterOption } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import type { AuditLog } from "@/lib/api/audit";
import type { DataTableFeatures } from "@/lib/data-table-features";
import type { TranslateFn } from "@/lib/i18n";
import { localeToIntl, type Locale } from "@/lib/i18n";
import { getInitials } from "@/lib/utils";

type CreateAuditColumnsOptions = {
  t: TranslateFn;
  locale: Locale;
  actionOptions: ColumnHeaderFilterOption[];
  resourceOptions: ColumnHeaderFilterOption[];
};

function actionVariant(action: string) {
  if (action === "create") return "default" as const;
  if (action === "delete") return "destructive" as const;
  return "secondary" as const;
}

function resourceHref(log: AuditLog) {
  if (log.resource_type === "product") {
    return `/dashboard/example/products/${log.resource_id}/edit`;
  }
  if (log.resource_type === "role") {
    return `/dashboard/roles/${encodeURIComponent(log.resource_id)}/edit`;
  }
  if (log.resource_type === "user") {
    return "/dashboard/users";
  }
  return null;
}

function metaString(log: AuditLog, key: string) {
  const value = log.metadata?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function resourceTitle(log: AuditLog) {
  return metaString(log, "name") || metaString(log, "email") || metaString(log, "code") || log.resource_id;
}

function resourceSubtitle(log: AuditLog) {
  const sku = metaString(log, "sku");
  if (sku) return sku;
  const email = metaString(log, "email");
  if (email && metaString(log, "name")) return email;
  return "";
}

function metadataPreview(log: AuditLog) {
  const skip = new Set(["name", "sku", "email", "code"]);
  const entries = Object.entries(log.metadata ?? {}).filter(([key, value]) => {
    if (skip.has(key)) return false;
    return value !== null && value !== undefined && value !== "";
  });
  if (!entries.length) return null;
  return entries.slice(0, 3).map(([key, value]) => `${key}: ${String(value)}`);
}

export function createAuditColumns({
  t,
  locale,
  actionOptions,
  resourceOptions,
}: CreateAuditColumnsOptions): ColumnDef<DataTableFeatures, AuditLog>[] {
  const intlLocale = localeToIntl(locale);

  return [
    {
      id: "created_at",
      accessorFn: (row) => row.created_at,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("audit.columns.time")} filter={{ kind: "date_range" }} />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm tabular-nums">
          {new Date(row.original.created_at).toLocaleString(intlLocale, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
      size: 168,
    },
    {
      id: "actor",
      accessorFn: (row) => row.user_name ?? row.user_email ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("audit.columns.actor")}
          filter={{ kind: "text", placeholder: t("audit.columns.searchActor") }}
        />
      ),
      cell: ({ row }) => {
        const name = row.original.user_name;
        const email = row.original.user_email;
        if (!name && !email) {
          return <span className="text-muted-foreground text-sm">{t("audit.system")}</span>;
        }
        return (
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-medium text-primary text-xs">
              {getInitials(name ?? email ?? "")}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-medium text-sm">{name ?? email}</span>
              {name && email ? <span className="block truncate text-muted-foreground text-xs">{email}</span> : null}
            </span>
          </div>
        );
      },
      size: 200,
    },
    {
      accessorKey: "action",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("audit.columns.action")}
          filter={{ kind: "select", options: actionOptions, allLabel: t("common.all") }}
        />
      ),
      cell: ({ row }) => (
        <Badge variant={actionVariant(row.original.action)} className="capitalize">
          {t(`audit.actions.${row.original.action}`)}
        </Badge>
      ),
      size: 112,
    },
    {
      accessorKey: "resource_type",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("audit.columns.resource")}
          filter={{ kind: "select", options: resourceOptions, allLabel: t("common.all") }}
        />
      ),
      cell: ({ row }) => {
        const href = resourceHref(row.original);
        const typeLabel = t(`audit.resources.${row.original.resource_type}`);
        const resolvedType =
          typeLabel === `audit.resources.${row.original.resource_type}` ? row.original.resource_type : typeLabel;
        const title = resourceTitle(row.original);
        const subtitle = resourceSubtitle(row.original);
        const content = (
          <span className="grid min-w-0 gap-0.5">
            <span className="flex min-w-0 items-center gap-1.5">
              <Badge variant="outline" className="w-fit shrink-0 capitalize">
                {resolvedType}
              </Badge>
              <span className="truncate font-medium text-sm" title={title}>
                {title}
              </span>
            </span>
            {subtitle ? <span className="truncate font-mono text-muted-foreground text-xs">{subtitle}</span> : null}
          </span>
        );
        if (!href) return content;
        return (
          <Link href={href} className="min-w-0 underline-offset-4 hover:underline">
            {content}
          </Link>
        );
      },
      size: 240,
    },
    {
      id: "details",
      accessorFn: (row) => JSON.stringify(row.metadata ?? {}),
      header: () => <span className="font-medium text-sm">{t("audit.columns.details")}</span>,
      cell: ({ row }) => {
        const preview = metadataPreview(row.original);
        if (!preview) return <span className="text-muted-foreground text-sm">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {preview.map((item) => (
              <Badge key={item} variant="secondary" className="font-normal">
                {item}
              </Badge>
            ))}
          </div>
        );
      },
      size: 160,
    },
  ];
}
