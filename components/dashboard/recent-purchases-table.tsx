import * as React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatCurrency, formatWeight } from "@/lib/utils";
import { STATUS_BADGE_VARIANTS } from "@/constants";
import type { PurchaseDTO } from "@/types";

interface RecentPurchasesTableProps {
  batches: PurchaseDTO[];
}

export const RecentPurchasesTable = React.memo(function RecentPurchasesTable({ batches }: RecentPurchasesTableProps) {
  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <div>
          <CardTitle className="text-xs font-semibold">Recent Harbor Inward Purchases</CardTitle>
          <CardDescription className="text-[11px] text-muted-foreground">
            Latest raw seafood lots weighed at harbor weighbridge
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Purchase #</TableHead>
              <TableHead>Supplier / Vessel</TableHead>
              <TableHead>Harbor Location</TableHead>
              <TableHead className="text-right">Total Weight</TableHead>
              <TableHead className="text-right">Total Cost</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches.map((batch) => (
              <TableRow key={batch.id}>
                <TableCell className="font-mono text-xs text-primary font-medium">
                  {batch.purchaseNumber}
                </TableCell>
                <TableCell className="font-medium text-xs text-foreground">{batch.supplierName}</TableCell>
                <TableCell className="text-muted-foreground text-[11px]">
                  {batch.landingHarbor ?? "Cochin Harbor"}
                </TableCell>
                <TableCell className="text-right font-mono text-xs text-muted-foreground">
                  {formatWeight(batch.totalWeightKg)}
                </TableCell>
                <TableCell className="text-right font-mono text-xs font-semibold text-foreground">
                  {formatCurrency(batch.totalAmount)}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_BADGE_VARIANTS[batch.status] ?? "secondary"}>
                    {batch.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
});
