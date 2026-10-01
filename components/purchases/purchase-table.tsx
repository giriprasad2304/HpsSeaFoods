"use client";

import * as React from "react";
import Link from "next/link";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatWeight, formatDate } from "@/lib/utils";
import { STATUS_BADGE_VARIANTS } from "@/constants";
import { EmptyState } from "@/components/ui/empty-state";
import type { PurchaseDTO } from "@/types";

interface PurchaseTableRowProps {
  purchase: PurchaseDTO;
}

const PurchaseTableRow = React.memo(function PurchaseTableRow({ purchase }: PurchaseTableRowProps) {
  return (
    <TableRow className="cursor-pointer hover:bg-muted/50 transition-colors">
      <TableCell>
        <Link
          href={`/purchases/${purchase.id}`}
          className="font-mono text-xs font-semibold text-primary hover:underline underline-offset-4"
        >
          {purchase.purchaseNumber}
        </Link>
      </TableCell>
      <TableCell className="font-medium text-xs">
        {purchase.supplierName}
      </TableCell>
      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
        {purchase.landingHarbor ?? "—"}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {formatDate(purchase.purchaseDate)}
      </TableCell>
      <TableCell className="hidden sm:table-cell text-right font-mono text-xs text-muted-foreground">
        {purchase.itemsCount}
      </TableCell>
      <TableCell className="hidden sm:table-cell text-right font-mono text-xs font-medium">
        {formatWeight(purchase.totalWeightKg)}
      </TableCell>
      <TableCell className="text-right font-mono text-xs font-semibold">
        {formatCurrency(purchase.totalAmount)}
      </TableCell>
      <TableCell>
        <Badge
          variant={
            STATUS_BADGE_VARIANTS[purchase.paymentStatus] ??
            "secondary"
          }
        >
          {purchase.paymentStatus}
        </Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <Badge
          variant={
            STATUS_BADGE_VARIANTS[purchase.status] ?? "secondary"
          }
        >
          {purchase.status}
        </Badge>
      </TableCell>
    </TableRow>
  );
});

interface PurchaseTableProps {
  purchases: PurchaseDTO[];
}

export const PurchaseTable = React.memo(function PurchaseTable({ purchases }: PurchaseTableProps) {
  if (purchases.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <EmptyState
            title="No purchases found"
            description="No purchases match the specified filter criteria. Try clearing or adjusting your filters."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className="min-w-[550px]">
            <TableHeader>
              <TableRow>
                <TableHead>Purchase #</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="hidden md:table-cell">Harbor</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead className="hidden sm:table-cell text-right">Items</TableHead>
                <TableHead className="hidden sm:table-cell text-right">Quantity (kg)</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((purchase) => (
                <PurchaseTableRow key={purchase.id} purchase={purchase} />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
});
