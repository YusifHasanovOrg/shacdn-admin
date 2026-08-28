"use client";

import Link from "next/link";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Package } from "lucide-react";

import { DataTableColumnHeader } from "@/components/data-table";
import type { ColumnHeaderFilterOption } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Product } from "@/data/products";
import type { TranslateFn } from "@/lib/i18n";
import { localeToIntl, type Locale } from "@/lib/i18n";
import type { DataTableFeatures } from "@/lib/data-table-features";
import { cn } from "@/lib/utils";

function statusVariant(status: Product["status"]) {
  if (status === "ACTIVE") return "default";
  if (status === "DRAFT") return "secondary";
  return "outline";
}

type CreateProductsColumnsOptions = {
  canWrite?: boolean;
  onDelete: (product: Product) => void;
  t: TranslateFn;
  locale: Locale;
  categoryOptions: ColumnHeaderFilterOption[];
  statusOptions: ColumnHeaderFilterOption[];
  categoryLabel: (category: Product["category"]) => string;
  statusLabel: (status: Product["status"]) => string;
};

export function createProductsColumns({
  canWrite = false,
  onDelete,
  t,
  locale,
  categoryOptions,
  statusOptions,
  categoryLabel,
  statusLabel,
}: CreateProductsColumnsOptions): ColumnDef<DataTableFeatures, Product>[] {
  const intlLocale = localeToIntl(locale);

  const columns: ColumnDef<DataTableFeatures, Product>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("example.products.columns.name")}
          filter={{ kind: "text", placeholder: t("example.products.columns.searchName") }}
        />
      ),
      cell: ({ row }) => (
        <Link
          href={`/dashboard/example/products/${row.original.id}/edit`}
          className="flex items-center gap-3 font-medium underline-offset-4 hover:underline"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Package className="size-3.5" />
          </span>
          <span className="truncate">{row.original.name}</span>
        </Link>
      ),
      filterFn: "includesString",
      size: 240,
    },
    {
      id: "sku",
      accessorFn: (row) => row.sku,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("example.products.columns.sku")}
          filter={{ kind: "text", placeholder: t("example.products.columns.searchSku") }}
        />
      ),
      cell: ({ row }) => <span className="font-mono text-muted-foreground text-xs">{row.original.sku}</span>,
      filterFn: "includesString",
      size: 120,
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("example.products.columns.category")}
          filter={{
            kind: "multiselect",
            options: categoryOptions,
            placeholder: t("example.products.columns.allCategories"),
          }}
        />
      ),
      cell: ({ row }) => <Badge variant="outline">{categoryLabel(row.original.category)}</Badge>,
      filterFn: "equalsString",
      size: 130,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("example.products.columns.status")}
          filter={{
            kind: "select",
            options: statusOptions,
            allLabel: t("common.all"),
          }}
        />
      ),
      cell: ({ row }) => (
        <Badge
          variant={statusVariant(row.original.status)}
          className={cn(row.original.status === "ARCHIVED" && "text-muted-foreground")}
        >
          {statusLabel(row.original.status)}
        </Badge>
      ),
      filterFn: "equalsString",
      size: 110,
    },
    {
      accessorKey: "price",
      header: () => <span className="font-medium text-sm">{t("example.products.columns.price")}</span>,
      cell: ({ row }) => (
        <span className="tabular-nums">
          {row.original.price.toLocaleString(intlLocale, { style: "currency", currency: "USD" })}
        </span>
      ),
      size: 100,
    },
    {
      id: "created_at",
      accessorFn: (row) => row.created_at,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("example.products.columns.created")} filter={{ kind: "date_range" }} />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {new Date(row.original.created_at).toLocaleDateString(intlLocale, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
      size: 120,
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
                aria-label={t("example.products.columns.openActions", { name: row.original.name })}
                className="size-8 rounded-md text-muted-foreground hover:bg-muted/50"
                size="icon-sm"
                variant="ghost"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/example/products/${row.original.id}/edit`}>{t("common.edit")}</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(row.original)}>
                {t("common.delete")}
              </DropdownMenuItem>
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
