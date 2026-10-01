import * as React from "react";
import { type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export const MetricCard = React.memo(function MetricCard({
  title,
  value,
  subValue,
  icon: Icon,
  trend,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-md will-change-transform", className)}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
          {value}
        </div>
        {(subValue || trend) && (
          <div className="mt-1.5 flex items-center gap-2 text-xs">
            {trend && (
              <span
                className={cn(
                  "font-medium",
                  trend.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                )}
              >
                {trend.isPositive ? "+" : ""}{trend.value}
              </span>
            )}
            {subValue && (
              <span className="text-muted-foreground">{subValue}</span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
});
