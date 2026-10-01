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
import {
  Receipt,
  Trash2,
  ExternalLink,
  Box,
  Snowflake,
  PackageCheck,
  Users,
  Truck,
  Wind,
  Layers,
} from "lucide-react";
import type { ExpenseDTO } from "@/types";

const getCategoryBadge = (name: string, code?: string) => {
  const c = (code || name).toUpperCase();
  if (c.includes("BOX") || c.includes("THERMOCOL")) {
    return (
      <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1 text-xs">
        <Box className="h-3.5 w-3.5" /> {name}
      </Badge>
    );
  }
  if (c.includes("ICE")) {
    return (
      <Badge variant="outline" className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30 gap-1 text-xs">
        <Snowflake className="h-3.5 w-3.5" /> {name}
      </Badge>
    );
  }
  if (c.includes("PKG") || c.includes("PACKING")) {
    return (
      <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 gap-1 text-xs">
        <PackageCheck className="h-3.5 w-3.5" /> {name}
      </Badge>
    );
  }
  if (c.includes("LAB") || c.includes("LABOUR")) {
    return (
      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 text-xs">
        <Users className="h-3.5 w-3.5" /> {name}
      </Badge>
    );
  }
  if (c.includes("TRN") || c.includes("TRANSPORT")) {
    return (
      <Badge variant="outline" className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30 gap-1 text-xs">
        <Truck className="h-3.5 w-3.5" /> {name}
      </Badge>
    );
  }
  if (c.includes("OXY") || c.includes("OXYGEN")) {
    return (
      <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 gap-1 text-xs">
        <Wind className="h-3.5 w-3.5" /> {name}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-muted text-muted-foreground border-border gap-1 text-xs">
      <Layers className="h-3.5 w-3.5" /> {name}
    </Badge>
  );
};

const getPaymentMethodBadge = (method: string) => {
  switch (method) {
    case "CASH":
      return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs font-semibold">CASH</Badge>;
    case "UPI":
      return <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 text-xs font-semibold">UPI</Badge>;
    case "BANK_TRANSFER":
      return <Badge variant="outline" className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30 text-xs font-semibold">BANK TRANSFER</Badge>;
    case "CHEQUE":
      return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs font-semibold">CHEQUE</Badge>;
    case "CREDIT_CARD":
      return <Badge variant="outline" className="bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30 text-xs font-semibold">CARD</Badge>;
    default:
      return <Badge variant="outline" className="bg-muted text-muted-foreground text-xs">{method}</Badge>;
  }
};

interface ExpenseTableRowProps {
  expense: ExpenseDTO;
  onDelete?: (id: string) => Promise<void>;
  isDeleting?: boolean;
}

const ExpenseTableRow = React.memo(function ExpenseTableRow({
  expense,
  onDelete,
  isDeleting,
}: ExpenseTableRowProps) {
  const invoiceUrl = expense.invoiceUrl || expense.receiptUrl;

  return (
    <TableRow className="hover:bg-muted/40 transition-colors">
      <TableCell className="font-mono text-xs font-semibold text-primary py-3.5">
        {expense.expenseNumber}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground py-3.5 whitespace-nowrap">
        {formatDate(expense.expenseDate)}
      </TableCell>
      <TableCell className="py-3.5">
        {getCategoryBadge(expense.categoryName, expense.categoryCode)}
      </TableCell>
      <TableCell className="py-3.5">
        <div className="space-y-0.5">
          <div className="text-xs sm:text-sm font-medium text-foreground line-clamp-1">{expense.title}</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {expense.paidTo && (
              <span>
                Payee: <strong className="text-foreground font-medium">{expense.paidTo}</strong>
              </span>
            )}
            {expense.description && (
              <span className="truncate max-w-xs text-muted-foreground">· {expense.description}</span>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell py-3.5 whitespace-nowrap">
        {getPaymentMethodBadge(expense.paymentMethod)}
      </TableCell>
      <TableCell className="text-right py-3.5 font-mono text-xs sm:text-sm font-bold text-foreground">
        {formatCurrency(expense.amount)}
      </TableCell>
      <TableCell className="text-center py-3.5">
        {invoiceUrl ? (
          <a
            href={invoiceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 hover:underline bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>View</span>
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>
      {onDelete && (
        <TableCell className="text-right py-3.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isDeleting}
            onClick={() => onDelete(expense.id)}
            className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="Delete voucher"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </TableCell>
      )}
    </TableRow>
  );
});

interface ExpenseTableProps {
  expenses: ExpenseDTO[];
  onDelete?: (id: string) => Promise<void>;
  isDeleting?: string | null;
}

export const ExpenseTable = React.memo(function ExpenseTable({
  expenses,
  onDelete,
  isDeleting,
}: ExpenseTableProps) {
  if (expenses.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/40 p-12 text-center animate-fade-in">
        <Receipt className="mx-auto h-12 w-12 text-muted-foreground/60 mb-3" />
        <h3 className="text-sm font-semibold text-foreground">No expense vouchers found</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          No matching operational or direct cost expenses. Click &quot;Record Expense Voucher&quot; to log a new disbursement.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/40 border-b border-border/80">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5">Voucher #</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5">Date</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5">Category</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5">Description / Payee</TableHead>
              <TableHead className="hidden sm:table-cell text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5">Payment Method</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5 text-right">Amount</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5 text-center">Invoice</TableHead>
              {onDelete && (
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3.5 text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/50">
            {expenses.map((expense) => (
              <ExpenseTableRow
                key={expense.id}
                expense={expense}
                onDelete={onDelete}
                isDeleting={isDeleting === expense.id}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
});
