import * as React from "react";
import { Inbox, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border/80 bg-card/40 animate-fade-in my-2",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground ring-8 ring-muted/20 mb-4">
        <Icon className="h-6 w-6 opacity-80" />
      </div>
      <h3 className="text-sm font-semibold text-foreground tracking-tight">{title}</h3>
      <p className="text-xs text-muted-foreground mt-1.5 max-w-sm leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" className="mt-5 shadow-xs">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
