"use client";

import * as React from "react";
import { Plus, Download, Warehouse } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InventoryHeaderProps {
  onAddStock?: () => void;
  onExportReport?: () => void;
}

export function InventoryHeader({ onAddStock, onExportReport }: InventoryHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-border">
      <div>
        <div className="flex items-center gap-2">
          <Warehouse className="h-4 w-4 text-primary" />
          <h1 className="text-base font-bold tracking-tight text-foreground">
            Current Stock
          </h1>
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          See how much fish you have right now
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={onExportReport}>
          <Download className="h-3.5 w-3.5" />
          Stock Report
        </Button>
        <Button size="sm" className="gap-1.5 h-8 text-xs" onClick={onAddStock}>
          <Plus className="h-3.5 w-3.5" />
          Stock Adjustment
        </Button>
      </div>
    </div>
  );
}
