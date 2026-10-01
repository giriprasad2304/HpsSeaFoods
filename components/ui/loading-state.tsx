import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  description?: string;
  className?: string;
}

export function LoadingState({
  message = "Loading records...",
  description = "Fetching data from central database.",
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center rounded-xl border border-border/70 bg-card/60 backdrop-blur-xs shadow-xs animate-fade-in my-2",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-8 ring-primary/5 mb-3.5">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
      <h4 className="text-sm font-semibold text-foreground tracking-tight">{message}</h4>
      {description && (
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          {description}
        </p>
      )}
    </div>
  );
}
