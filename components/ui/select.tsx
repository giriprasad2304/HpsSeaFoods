import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectOption = {
  value?: string | number;
  label?: string | number;
  id?: string | number;
  name?: string | number;
  code?: string | number;
};

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: SelectOption[];
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, options, placeholder, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          className={cn(
            "flex h-9 w-full appearance-none rounded-lg border border-input bg-background px-3 py-2 pr-9 text-sm text-foreground transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        >
          {placeholder && (
            <option key="__select_placeholder__" value="" disabled={props.required}>
              {placeholder}
            </option>
          )}
          {options
            ? options.map((opt, idx) => {
                const val = opt.value !== undefined ? opt.value : opt.id !== undefined ? opt.id : `opt-${idx}`;
                const label = opt.label !== undefined ? opt.label : opt.name !== undefined ? opt.name : String(val);
                return (
                  <option key={`${val}_${idx}`} value={val}>
                    {label}
                  </option>
                );
              })
            : children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-muted-foreground">
          <ChevronDown className="h-4 w-4 opacity-50" />
        </div>
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
