"use client";

import type { Column, ColumnFiltersState, RowData } from "@tanstack/react-table";
import { Subscribe } from "@tanstack/react-table";
import { ListFilter, X } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { DateRangePicker } from "@/components/date-range-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DataTableFeatures } from "@/lib/data-table-features";
import { cn } from "@/lib/utils";

export type ColumnHeaderFilterOption = {
  label: string;
  value: string;
};

type TextFilter = {
  kind: "text";
  placeholder?: string;
};

type SelectFilter = {
  kind: "select";
  options: ColumnHeaderFilterOption[];
  placeholder?: string;
  allValue?: string;
  allLabel?: string;
};

type DateRangeFilter = {
  kind: "date_range";
};

export type ColumnHeaderFilter = TextFilter | SelectFilter | DateRangeFilter;

type DataTableColumnHeaderProps<TData extends RowData> = {
  column: Column<DataTableFeatures, TData, unknown>;
  title: string;
  filter?: ColumnHeaderFilter;
  className?: string;
};

const ALL_VALUE = "__all__";

function selectColumnFilterValue(filters: ColumnFiltersState | undefined, columnId: string) {
  return filters?.find((filter) => filter.id === columnId)?.value as string | undefined;
}

function encodeDateRangeFilterValue(value: DateRange | undefined) {
  if (!value?.from || !value.to) return undefined;
  return `${value.from.toISOString()}|${value.to.toISOString()}`;
}

function decodeDateRangeFilterValue(filterValue: string | undefined): DateRange | undefined {
  if (!filterValue) return undefined;
  const [fromIso, toIso] = filterValue.split("|");
  if (!fromIso || !toIso) return undefined;
  const from = new Date(fromIso);
  const to = new Date(toIso);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return undefined;
  return { from, to };
}

function isActiveFilterValue(value: unknown) {
  return value !== undefined && value !== "" && value !== null;
}

function renderFilterField<TData extends RowData>(
  column: Column<DataTableFeatures, TData, unknown>,
  filter: ColumnHeaderFilter,
  filterValue: string | undefined,
) {
  if (filter.kind === "text") {
    return (
      <Input
        className="h-7 bg-background text-xs md:text-xs"
        placeholder={filter.placeholder ?? "Search..."}
        value={filterValue ?? ""}
        onChange={(event) => {
          column.setFilterValue(event.target.value || undefined);
        }}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      />
    );
  }

  if (filter.kind === "select") {
    return (
      <Select
        value={filterValue ?? filter.allValue ?? ALL_VALUE}
        onValueChange={(value) => {
          const all = filter.allValue ?? ALL_VALUE;
          column.setFilterValue(value === all ? undefined : value);
        }}
      >
        <SelectTrigger
          size="sm"
          className="h-7 w-full min-w-0 bg-background text-xs"
          onClick={(event) => event.stopPropagation()}
        >
          <SelectValue placeholder={filter.placeholder ?? "All"} />
        </SelectTrigger>
        <SelectContent align="start">
          <SelectItem value={filter.allValue ?? ALL_VALUE}>{filter.allLabel ?? "All"}</SelectItem>
          {filter.options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <DateRangePicker
      value={decodeDateRangeFilterValue(filterValue)}
      onChange={(nextValue) => column.setFilterValue(encodeDateRangeFilterValue(nextValue))}
    />
  );
}

function ColumnFilterControls<TData extends RowData>({
  column,
  title,
  filter,
  filterValue,
}: {
  column: Column<DataTableFeatures, TData, unknown>;
  title: string;
  filter: ColumnHeaderFilter;
  filterValue: string | undefined;
}) {
  const isFiltered = isActiveFilterValue(filterValue);

  return (
    <>
      <div className="flex items-center gap-1">
        <span className="font-medium text-sm">{title}</span>
        {isFiltered ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-6 text-muted-foreground"
            aria-label={`Clear ${title} filter`}
            onClick={() => column.setFilterValue(undefined)}
          >
            <X className="size-3.5" />
          </Button>
        ) : (
          <ListFilter className="size-3.5 text-muted-foreground/70" aria-hidden />
        )}
      </div>

      {renderFilterField(column, filter, filterValue)}
    </>
  );
}

export function DataTableColumnHeader<TData extends RowData>({
  column,
  title,
  filter,
  className,
}: DataTableColumnHeaderProps<TData>) {
  if (!filter) {
    return <span className={cn("font-medium text-sm", className)}>{title}</span>;
  }

  const columnFiltersAtom = column.table.atoms.columnFilters;

  if (!columnFiltersAtom) {
    const filterValue = column.getFilterValue() as string | undefined;
    return (
      <div className={cn("flex min-w-0 flex-col gap-1.5 py-0.5", className)}>
        <ColumnFilterControls column={column} title={title} filter={filter} filterValue={filterValue} />
      </div>
    );
  }

  return (
    <Subscribe source={columnFiltersAtom} selector={(filters) => selectColumnFilterValue(filters, column.id)}>
      {(filterValue) => (
        <div className={cn("flex min-w-0 flex-col gap-1.5 py-0.5", className)}>
          <ColumnFilterControls column={column} title={title} filter={filter} filterValue={filterValue} />
        </div>
      )}
    </Subscribe>
  );
}

function renderCompactPopoverContent<TData extends RowData>(
  column: Column<DataTableFeatures, TData, unknown>,
  filter: ColumnHeaderFilter,
  filterValue: string | undefined,
  isFiltered: boolean,
) {
  if (filter.kind === "text") {
    return (
      <div className="flex flex-col gap-2">
        <Input
          className="h-8"
          placeholder={filter.placeholder ?? "Search..."}
          value={filterValue ?? ""}
          onChange={(event) => {
            column.setFilterValue(event.target.value || undefined);
          }}
          autoFocus
        />
        {isFiltered ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => column.setFilterValue(undefined)}>
            Clear
          </Button>
        ) : null}
      </div>
    );
  }

  if (filter.kind === "select") {
    return (
      <div className="flex flex-col gap-2">
        <Select
          value={filterValue ?? filter.allValue ?? ALL_VALUE}
          onValueChange={(value) => {
            const all = filter.allValue ?? ALL_VALUE;
            column.setFilterValue(value === all ? undefined : value);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={filter.placeholder ?? "All"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={filter.allValue ?? ALL_VALUE}>{filter.allLabel ?? "All"}</SelectItem>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isFiltered ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => column.setFilterValue(undefined)}>
            Clear
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <DateRangePicker
        value={decodeDateRangeFilterValue(filterValue)}
        onChange={(nextValue) => column.setFilterValue(encodeDateRangeFilterValue(nextValue))}
      />
      {isFiltered ? (
        <Button type="button" variant="ghost" size="sm" onClick={() => column.setFilterValue(undefined)}>
          Clear
        </Button>
      ) : null}
    </div>
  );
}

export function DataTableColumnHeaderCompact<TData extends RowData>({
  column,
  title,
  filter,
  className,
}: DataTableColumnHeaderProps<TData>) {
  if (!filter) {
    return <span className={cn("font-medium text-sm", className)}>{title}</span>;
  }

  const columnFiltersAtom = column.table.atoms.columnFilters;

  const renderCompact = (filterValue: string | undefined) => {
    const isFiltered = isActiveFilterValue(filterValue);

    return (
      <div className={cn("flex items-center gap-1", className)}>
        <span className="font-medium text-sm">{title}</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className={cn("size-6", isFiltered && "bg-muted text-foreground")}
              aria-label={`${title} filter`}
            >
              <ListFilter className="size-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-56 p-2">
            {renderCompactPopoverContent(column, filter, filterValue, isFiltered)}
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  if (!columnFiltersAtom) {
    return renderCompact(column.getFilterValue() as string | undefined);
  }

  return (
    <Subscribe source={columnFiltersAtom} selector={(filters) => selectColumnFilterValue(filters, column.id)}>
      {(filterValue) => renderCompact(filterValue)}
    </Subscribe>
  );
}
