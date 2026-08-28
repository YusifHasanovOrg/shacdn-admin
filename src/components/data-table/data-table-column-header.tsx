"use client";

import type { Column, ColumnFiltersState, RowData } from "@tanstack/react-table";
import { Subscribe } from "@tanstack/react-table";
import { ChevronDown, ListFilter, X } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { DateRangePicker } from "@/components/date-range-picker";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

type MultiselectFilter = {
  kind: "multiselect";
  options: ColumnHeaderFilterOption[];
  placeholder?: string;
};

type DateRangeFilter = {
  kind: "date_range";
};

export type ColumnHeaderFilter = TextFilter | SelectFilter | MultiselectFilter | DateRangeFilter;

type DataTableColumnHeaderProps<TData extends RowData> = {
  column: Column<DataTableFeatures, TData, unknown>;
  title: string;
  filter?: ColumnHeaderFilter;
  className?: string;
};

const ALL_VALUE = "__all__";

function readColumnFilterValue(filters: ColumnFiltersState | undefined, columnId: string) {
  return filters?.find((filter) => filter.id === columnId)?.value;
}

function readStringFilterValue(filters: ColumnFiltersState | undefined, columnId: string) {
  const value = readColumnFilterValue(filters, columnId);
  return typeof value === "string" ? value : undefined;
}

function readMultiselectFilterValue(filters: ColumnFiltersState | undefined, columnId: string) {
  const value = readColumnFilterValue(filters, columnId);
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.length > 0);
  }
  if (typeof value === "string" && value.length > 0) {
    return [value];
  }
  return [];
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
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== "" && value !== null;
}

function MultiselectFilterField<TData extends RowData>({
  column,
  filter,
  selectedValues,
}: {
  column: Column<DataTableFeatures, TData, unknown>;
  filter: MultiselectFilter;
  selectedValues: string[];
}) {
  const selected = new Set(selectedValues);

  function toggle(value: string) {
    const next = new Set(selected);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    const values = Array.from(next);
    column.setFilterValue(values.length ? values : undefined);
  }

  const label =
    selected.size === 0
      ? (filter.placeholder ?? "All")
      : selected.size === 1
        ? (filter.options.find((option) => option.value === selectedValues[0])?.label ?? "1 selected")
        : `${selected.size} selected`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "h-7 w-full min-w-0 justify-between bg-background px-2 font-normal text-xs",
            selected.size > 0 && "border-solid bg-muted/40",
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <span className="truncate">{label}</span>
          <ChevronDown className="size-3.5 shrink-0 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuGroup>
          {filter.options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={selected.has(option.value)}
              onCheckedChange={() => toggle(option.value)}
              onSelect={(event) => event.preventDefault()}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
        {selected.size > 0 ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="justify-center text-center"
              onSelect={() => column.setFilterValue(undefined)}
            >
              <X data-icon="inline-start" />
              Clear
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function renderFilterField<TData extends RowData>(
  column: Column<DataTableFeatures, TData, unknown>,
  filter: ColumnHeaderFilter,
  filterValue: unknown,
) {
  if (filter.kind === "text") {
    const value = typeof filterValue === "string" ? filterValue : "";
    return (
      <Input
        className="h-7 bg-background text-xs md:text-xs"
        placeholder={filter.placeholder ?? "Search..."}
        value={value}
        onChange={(event) => {
          column.setFilterValue(event.target.value || undefined);
        }}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      />
    );
  }

  if (filter.kind === "select") {
    const value = typeof filterValue === "string" ? filterValue : undefined;
    return (
      <Select
        value={value ?? filter.allValue ?? ALL_VALUE}
        onValueChange={(nextValue) => {
          const all = filter.allValue ?? ALL_VALUE;
          column.setFilterValue(nextValue === all ? undefined : nextValue);
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

  if (filter.kind === "multiselect") {
    const selectedValues = Array.isArray(filterValue)
      ? filterValue.filter((item): item is string => typeof item === "string")
      : typeof filterValue === "string" && filterValue
        ? [filterValue]
        : [];

    return <MultiselectFilterField column={column} filter={filter} selectedValues={selectedValues} />;
  }

  const value = typeof filterValue === "string" ? filterValue : undefined;
  return (
    <DateRangePicker
      value={decodeDateRangeFilterValue(value)}
      onChange={(nextValue) => column.setFilterValue(encodeDateRangeFilterValue(nextValue))}
      size="sm"
      placeholder="All dates"
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
  filterValue: unknown;
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

  if (filter.kind === "multiselect") {
    if (!columnFiltersAtom) {
      const filterValue = readMultiselectFilterValue(undefined, column.id);
      return (
        <div className={cn("flex min-w-0 flex-col gap-1.5 py-0.5", className)}>
          <ColumnFilterControls column={column} title={title} filter={filter} filterValue={filterValue} />
        </div>
      );
    }

    return (
      <Subscribe
        source={columnFiltersAtom}
        selector={(filters) => readMultiselectFilterValue(filters, column.id)}
      >
        {(filterValue) => (
          <div className={cn("flex min-w-0 flex-col gap-1.5 py-0.5", className)}>
            <ColumnFilterControls column={column} title={title} filter={filter} filterValue={filterValue} />
          </div>
        )}
      </Subscribe>
    );
  }

  if (!columnFiltersAtom) {
    const filterValue = column.getFilterValue() as string | undefined;
    return (
      <div className={cn("flex min-w-0 flex-col gap-1.5 py-0.5", className)}>
        <ColumnFilterControls column={column} title={title} filter={filter} filterValue={filterValue} />
      </div>
    );
  }

  return (
    <Subscribe source={columnFiltersAtom} selector={(filters) => readStringFilterValue(filters, column.id)}>
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
  filterValue: unknown,
  isFiltered: boolean,
) {
  if (filter.kind === "text") {
    const value = typeof filterValue === "string" ? filterValue : "";
    return (
      <div className="flex flex-col gap-2">
        <Input
          className="h-8"
          placeholder={filter.placeholder ?? "Search..."}
          value={value}
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
    const value = typeof filterValue === "string" ? filterValue : undefined;
    return (
      <div className="flex flex-col gap-2">
        <Select
          value={value ?? filter.allValue ?? ALL_VALUE}
          onValueChange={(nextValue) => {
            const all = filter.allValue ?? ALL_VALUE;
            column.setFilterValue(nextValue === all ? undefined : nextValue);
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

  if (filter.kind === "multiselect") {
    const selectedValues = Array.isArray(filterValue)
      ? filterValue.filter((item): item is string => typeof item === "string")
      : typeof filterValue === "string" && filterValue
        ? [filterValue]
        : [];

    return (
      <div className="flex flex-col gap-2">
        <MultiselectFilterField column={column} filter={filter} selectedValues={selectedValues} />
        {isFiltered ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => column.setFilterValue(undefined)}>
            Clear
          </Button>
        ) : null}
      </div>
    );
  }

  const value = typeof filterValue === "string" ? filterValue : undefined;
  return (
    <div className="flex flex-col gap-2">
      <DateRangePicker
        value={decodeDateRangeFilterValue(value)}
        onChange={(nextValue) => column.setFilterValue(encodeDateRangeFilterValue(nextValue))}
        size="sm"
        placeholder="All dates"
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

  const renderCompact = (filterValue: unknown) => {
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

  if (filter.kind === "multiselect") {
    if (!columnFiltersAtom) {
      return renderCompact(readMultiselectFilterValue(undefined, column.id));
    }

    return (
      <Subscribe
        source={columnFiltersAtom}
        selector={(filters) => readMultiselectFilterValue(filters, column.id)}
      >
        {(filterValue) => renderCompact(filterValue)}
      </Subscribe>
    );
  }

  if (!columnFiltersAtom) {
    return renderCompact(column.getFilterValue());
  }

  return (
    <Subscribe source={columnFiltersAtom} selector={(filters) => readStringFilterValue(filters, column.id)}>
      {(filterValue) => renderCompact(filterValue)}
    </Subscribe>
  );
}
