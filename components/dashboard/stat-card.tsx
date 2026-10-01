import * as React from "react";
import { type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  highlight?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

const highlightBadgeClasses = {
  default: "bg-muted text-muted-foreground ring-1 ring-border",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20",
  danger: "bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/20",
  info: "bg-primary/10 text-primary ring-1 ring-primary/20",
};

const highlightValueClasses = {
  default: "text-foreground",
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-rose-600 dark:text-rose-400",
  info: "text-primary",
};

export const StatCard = React.memo(function StatCard({
  title,
  value,
  subValue,
  icon: Icon,
  trend,
  highlight = "default",
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 relative overflow-hidden group",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </span>
          <div
            className={cn(
              "text-2xl sm:text-[1.65rem] font-bold tracking-tight font-mono transition-colors",
              highlightValueClasses[highlight]
            )}
          >
            {value}
          </div>
        </div>

        {Icon && (
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110",
              highlightBadgeClasses[highlight]
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      {(subValue || trend) && (
        <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between gap-2 text-xs text-muted-foreground">
          {subValue && <span className="truncate font-medium">{subValue}</span>}
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-1 font-semibold shrink-0 px-2 py-0.5 rounded-full text-[11px]",
                trend.isPositive === true
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : trend.isPositive === false
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </Card>
  );
});
