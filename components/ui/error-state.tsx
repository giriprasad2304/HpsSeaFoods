import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Failed to load data",
  message = "An error occurred while communicating with the database.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center rounded-xl border border-destructive/25 bg-destructive/5 backdrop-blur-xs animate-fade-in my-2",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/15 text-destructive ring-8 ring-destructive/10 mb-3.5">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h4 className="text-sm font-semibold text-foreground tracking-tight">{title}</h4>
      <p className="text-xs text-muted-foreground mt-1 max-w-sm mb-4 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="shadow-xs">
          Retry Request
        </Button>
      )}
    </div>
  );
}
