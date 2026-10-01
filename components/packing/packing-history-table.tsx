"use client";

import * as React from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Package, Trash2, History } from "lucide-react";
import type { PackingCostDTO } from "@/types";

interface PackingHistoryTableProps {
  records: PackingCostDTO[];
  onDelete?: (id: string) => Promise<void>;
  isDeleting?: string | null;
}

export function PackingHistoryTable({
  records,
  onDelete,
  isDeleting,
}: PackingHistoryTableProps) {
  if (records.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/40 p-12 text-center animate-fade-in">
        <Package className="mx-auto h-12 w-12 text-muted-foreground/60 mb-3" />
        <h3 className="text-sm font-semibold text-foreground">No packing calculations recorded yet</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          Use the calculator above to compute and save your consignment packing cost breakdowns.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          Recent Packing Calculations ({records.length})
        </h3>
      </div>

      <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40 border-b border-border/80">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5">Date</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5">Packing Type / Ref</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5 text-right">Quantity (kg)</TableHead>
                <TableHead className="hidden md:table-cell text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5">Boxes & Consumables</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5 text-right">Total Cost</TableHead>
                <TableHead className="hidden sm:table-cell text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5 text-right">Cost / kg</TableHead>
                {onDelete && (
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5 text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/50">
              {records.map((r) => (
                <TableRow
                  key={r.id}
                  className="hover:bg-muted/40 transition-colors"
                >
                  <TableCell className="text-xs text-muted-foreground py-3.5 whitespace-nowrap">
                    {formatDate(r.createdAt)}
                  </TableCell>
                  <TableCell className="py-3.5">
                    <div className="space-y-0.5">
                      <div className="text-xs sm:text-sm font-semibold text-foreground">{r.packingType}</div>
                      {r.saleNumber && (
                        <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                          Sale: {r.saleNumber}
                        </Badge>
                      )}
                      {r.notes && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{r.notes}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-3.5 font-mono text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400">
                    {(r.quantityKg ?? 0).toLocaleString()} kg
                  </TableCell>
                  <TableCell className="hidden md:table-cell py-3.5">
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      {(r.thermocolBoxesCount ?? 0) > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium">
                          {r.thermocolBoxesCount} boxes ({formatCurrency(r.thermocolCost ?? 0)})
                        </span>
                      )}
                      {(r.iceCost ?? 0) > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 font-medium">
                          Ice: {formatCurrency(r.iceCost ?? 0)}
                        </span>
                      )}
                      {(r.oxygenCost ?? 0) > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-medium">
                          O2: {formatCurrency(r.oxygenCost ?? 0)}
                        </span>
                      )}
                      {(r.labourCost ?? 0) > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                          Labour: {formatCurrency(r.labourCost ?? 0)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-3.5 font-mono text-xs sm:text-sm font-bold text-foreground">
                    {formatCurrency(r.totalCost ?? 0)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-right py-3.5 font-mono text-xs sm:text-sm font-bold text-primary">
                    {formatCurrency(r.costPerKg ?? 0)}/kg
                  </TableCell>
                  {onDelete && (
                    <TableCell className="text-right py-3.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isDeleting === r.id}
                        onClick={() => onDelete(r.id)}
                        className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Delete calculation"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
