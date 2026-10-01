"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DatePickerProps {
  value?: string;
  onChange?: (date: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  className,
  placeholder = "Select date",
  disabled = false,
}: DatePickerProps) {
  return (
    <div className={cn("relative flex items-center", className)}>
      <input
        type="date"
        value={value ? value.split("T")[0] : ""}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        aria-label={placeholder}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      />
      <CalendarIcon className="pointer-events-none absolute right-3 h-4 w-4 text-muted-foreground" />
    </div>
  );
}
