"use client";

import * as React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { PackingCostDTO } from "@/types";
import { Search } from "lucide-react";

interface PackingListViewProps {
  initialJobs: PackingCostDTO[];
}

export function PackingListView({ initialJobs }: PackingListViewProps) {
  const [search, setSearch] = React.useState("");

  const filteredJobs = initialJobs.filter((job) => {
    return (
      job.packingType.toLowerCase().includes(search.toLowerCase()) ||
      (job.notes && job.notes.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <Card className="shadow-2xs">
      <CardHeader className="border-b border-border/70 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-base font-semibold">Packaging & Material Ledger</CardTitle>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search packaging spec, remarks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs sm:text-sm bg-background"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40 border-b border-border/80">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5">Packaging Spec</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5">Notes / Target Shipment</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5 text-right">Quantity (kg)</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5 text-right">Cost / kg</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5 text-right">Total Cost</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5">Recorded Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/50">
              {filteredJobs.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell className="font-semibold text-xs sm:text-sm text-primary py-3.5">
                    {item.packingType}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground py-3.5">
                    {item.notes ?? "General Packing Run"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs sm:text-sm py-3.5 font-bold text-foreground">
                    {(item.quantityKg ?? 0).toLocaleString()} kg
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs sm:text-sm text-primary py-3.5 font-bold">
                    {formatCurrency(item.costPerKg ?? 0)}/kg
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs sm:text-sm font-bold text-foreground py-3.5">
                    {formatCurrency(item.totalCost ?? 0)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground py-3.5 whitespace-nowrap">
                    {formatDate(item.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
