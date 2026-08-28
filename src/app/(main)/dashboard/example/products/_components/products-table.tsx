"use client";

import Link from "next/link";

import type { ReactTable } from "@tanstack/react-table";
import { Plus } from "lucide-react";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import type { Product } from "@/data/products";
import type { DataTableFeatures } from "@/lib/data-table-features";
import { useTranslation } from "@/stores/locale/locale-provider";

type ProductsTableProps = {
  table: ReactTable<DataTableFeatures, Product>;
  loading?: boolean;
  canWrite?: boolean;
};

export function ProductsTable({ table, loading, canWrite = false }: ProductsTableProps) {
  const { t } = useTranslation();

  return (
    <DataTable
      table={table}
      loading={loading}
      emptyMessage={t("example.products.emptyTitle")}
      emptyDescription={
        canWrite ? t("example.products.emptyDescriptionWrite") : t("example.products.emptyDescriptionRead")
      }
      emptyAction={
        canWrite ? (
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/example/products/new">
              <Plus data-icon="inline-start" />
              {t("example.products.add")}
            </Link>
          </Button>
        ) : undefined
      }
    />
  );
}
