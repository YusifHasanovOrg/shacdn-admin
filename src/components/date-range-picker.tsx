"use client";

import * as React from "react";

import { format, subDays } from "date-fns";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (value: DateRange | undefined) => void;
  placeholder?: string;
  size?: "default" | "sm";
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Select date",
  size = "default",
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [internalDateRange, setInternalDateRange] = React.useState<DateRange | undefined>(() => {
    if (onChange) return undefined;
    const to = new Date();
    const from = subDays(to, 29);
    return { from, to };
  });
  const dateRange = onChange ? value : (value ?? internalDateRange);
  let dateRangeLabel = placeholder;

  if (dateRange?.from) {
    dateRangeLabel = format(dateRange.from, "d MMM yyyy");
  }

  if (dateRange?.from && dateRange.to) {
    dateRangeLabel = `${format(dateRange.from, "d MMM yyyy")} - ${format(dateRange.to, "d MMM yyyy")}`;
  }

  const handleDateChange = (nextValue: DateRange | undefined) => {
    if (!onChange) {
      setInternalDateRange(nextValue);
    }
    onChange?.(nextValue);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={size === "sm" ? "sm" : "default"}
          id="date"
          className={
            size === "sm"
              ? "h-7 w-full min-w-0 justify-start px-2 font-normal text-xs"
              : "font-normal"
          }
          onClick={(event) => event.stopPropagation()}
        >
          <span className="truncate">{dateRangeLabel}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={dateRange?.from}
          selected={dateRange}
          onSelect={handleDateChange}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
