"use client";

import Link from "next/link";

import type { ReactTable } from "@tanstack/react-table";
import { Plus } from "lucide-react";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import type { Product } from "@/data/products";
import type { DataTableFeatures } from "@/lib/data-table-features";

type ProductsTableProps = {
  table: ReactTable<DataTableFeatures, Product>;
  loading?: boolean;
  canWrite?: boolean;
};

export function ProductsTable({ table, loading, canWrite = false }: ProductsTableProps) {
  return (
    <DataTable
      table={table}
      loading={loading}
      emptyMessage="No products yet"
      emptyDescription={canWrite ? "Create your first product to get started." : "No products match your filters."}
      emptyAction={
        canWrite ? (
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/example/products/new">
              <Plus data-icon="inline-start" />
              Add product
            </Link>
          </Button>
        ) : undefined
      }
    />
  );
}
