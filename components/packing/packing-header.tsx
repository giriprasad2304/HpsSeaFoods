"use client";

import * as React from "react";
import { Package, Calculator } from "lucide-react";

interface PackingHeaderProps {
  totalCount?: number;
}

export function PackingHeader({ totalCount = 0 }: PackingHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/70">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
            <Package className="h-4.5 w-4.5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Packing Cost Calculator
          </h1>
          {totalCount > 0 && (
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold font-mono text-primary">
              {totalCount} saved
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Calculate how much it costs to pack each kg of fish
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border/80 text-xs font-medium text-foreground shadow-2xs">
          <Calculator className="h-4 w-4 text-primary" />
          <span>Cost per kg</span>
        </div>
      </div>
    </div>
  );
}
