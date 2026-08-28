"use client";

import type { MouseEvent } from "react";

import type { ReactTable, RowData } from "@tanstack/react-table";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DataTableFeatures } from "@/lib/data-table-features";

function preventPaginationNavigation(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
}

function getPageNumbers(currentPage: number, pageCount: number) {
  if (pageCount <= 3) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  if (currentPage <= 2) return [1, 2, 3];
  if (currentPage >= pageCount - 1) return [pageCount - 2, pageCount - 1, pageCount];

  return [currentPage - 1, currentPage, currentPage + 1];
}

type DataTablePaginationProps<TData extends RowData> = {
  table: ReactTable<DataTableFeatures, TData>;
  pageSizeOptions?: number[];
  labels?: {
    rowsPerPage?: string;
    pageOf?: (current: number, total: number) => string;
  };
};

export function DataTablePagination<TData extends RowData>({
  table,
  pageSizeOptions = [10, 20, 30, 40, 50],
  labels,
}: DataTablePaginationProps<TData>) {
  const pageCount = Math.max(table.getPageCount(), 1);
  const currentPage = Math.min(table.state.pagination.pageIndex + 1, pageCount);
  const pageNumbers = getPageNumbers(currentPage, pageCount);
  const rowsPerPage = `${table.state.pagination.pageSize}`;
  const rowsPerPageLabel = labels?.rowsPerPage ?? "Rows per page";
  const pageOfLabel = labels?.pageOf?.(currentPage, pageCount) ?? `Page ${currentPage} of ${pageCount}`;

  return (
    <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-sm">
        <div className="flex items-center gap-2">
          <span>{rowsPerPageLabel}</span>
          <Select value={rowsPerPage} onValueChange={(value) => table.setPageSize(Number(value))}>
            <SelectTrigger size="sm" className="w-20">
              <SelectValue placeholder={rowsPerPage} />
            </SelectTrigger>
            <SelectContent side="top">
              <SelectGroup>
                {pageSizeOptions.map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <span>{pageOfLabel}</span>
      </div>

      <Pagination className="mx-0 w-auto justify-start sm:justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              text=""
              className={!table.getCanPreviousPage() ? "pointer-events-none opacity-50" : undefined}
              onClick={(event) => {
                preventPaginationNavigation(event);
                table.previousPage();
              }}
            />
          </PaginationItem>
          {pageNumbers[0] > 1 ? (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          ) : null}
          {pageNumbers.map((pageNumber) => (
            <PaginationItem key={`page-${pageNumber}`}>
              <PaginationLink
                href="#"
                isActive={table.state.pagination.pageIndex === pageNumber - 1}
                onClick={(event) => {
                  preventPaginationNavigation(event);
                  table.setPageIndex(pageNumber - 1);
                }}
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          ))}
          {pageNumbers[pageNumbers.length - 1] < pageCount ? (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          ) : null}
          <PaginationItem>
            <PaginationNext
              href="#"
              text=""
              className={!table.getCanNextPage() ? "pointer-events-none opacity-50" : undefined}
              onClick={(event) => {
                preventPaginationNavigation(event);
                table.nextPage();
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
