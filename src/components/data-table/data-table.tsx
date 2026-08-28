"use client";

import type { ReactNode } from "react";

import type { ReactTable, RowData } from "@tanstack/react-table";
import { Inbox } from "lucide-react";

import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { DataTableFeatures } from "@/lib/data-table-features";
import { cn } from "@/lib/utils";

type DataTableProps<TData extends RowData> = {
  table: ReactTable<DataTableFeatures, TData>;
  loading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  loadingMessage?: string;
};

export function DataTable<TData extends RowData>({
  table,
  loading,
  emptyMessage = "No results found",
  emptyDescription,
  emptyAction,
  loadingMessage = "Loading…",
}: DataTableProps<TData>) {
  const rows = table.getRowModel().rows;
  const leafColumns = table.getVisibleLeafColumns();
  const columnCount = leafColumns.length;
  const keepRowsWhileLoading = Boolean(loading && rows.length > 0);
  const skeletonRows = ["skeleton-a", "skeleton-b", "skeleton-c", "skeleton-d", "skeleton-e"];

  function renderTableBody() {
    if (loading && rows.length === 0) {
      return (
        <>
          <TableRow className="sr-only">
            <TableCell colSpan={columnCount}>{loadingMessage}</TableCell>
          </TableRow>
          {skeletonRows.map((rowKey) => (
            <TableRow key={rowKey} aria-hidden>
              {leafColumns.map((column) => (
                <TableCell key={column.id} className="p-3" style={{ width: `${column.getSize()}px` }}>
                  <div className="h-4 w-full max-w-[80%] animate-pulse rounded bg-muted" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </>
      );
    }

    if (rows.length) {
      return rows.map((row) => (
        <TableRow key={row.id} className="hover:bg-muted/30">
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id} className="p-3" style={{ width: `${cell.column.getSize()}px` }}>
              <table.FlexRender cell={cell} />
            </TableCell>
          ))}
        </TableRow>
      ));
    }

    return (
      <TableRow className="hover:bg-transparent">
        <TableCell colSpan={columnCount} className="h-auto p-0">
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
              <Inbox className="size-6 text-muted-foreground/60" />
            </div>
            <p className="mt-4 font-medium text-sm">{emptyMessage}</p>
            {emptyDescription ? (
              <p className="mt-1 max-w-sm text-muted-foreground text-sm">{emptyDescription}</p>
            ) : null}
            {emptyAction ? <div className="mt-5">{emptyAction}</div> : null}
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
        <Table className="table-fixed" aria-busy={loading ? true : undefined}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/40 hover:bg-muted/40">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="p-3 align-top" style={{ width: `${header.getSize()}px` }}>
                    {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className={cn(keepRowsWhileLoading && "pointer-events-none opacity-60")}>
            {renderTableBody()}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  );
}
