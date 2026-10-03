"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Receipt, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddCategoryDialog } from "./add-category-dialog";
import { useRouter } from "next/navigation";

interface ExpensesHeaderProps {
  totalCount?: number;
}

export function ExpensesHeader({ totalCount = 0 }: ExpensesHeaderProps) {
  const [showAddCategory, setShowAddCategory] = React.useState(false);
  const router = useRouter();

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
              <Receipt className="h-4.5 w-4.5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Daily Expenses
            </h1>
            {totalCount > 0 && (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold font-mono text-primary">
                {totalCount} entries
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Track all your daily spending — ice, boxes, transport, labour, etc.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddCategory(true)}
            className="gap-1.5 h-9 text-xs sm:text-sm font-medium"
          >
            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
            New Category
          </Button>
          <Link href="/expenses/new">
            <Button size="sm" className="gap-2 h-9 text-xs sm:text-sm font-medium shadow-xs">
              <Plus className="h-4 w-4" />
              Add Expense
            </Button>
          </Link>
        </div>
      </div>

      <AddCategoryDialog
        open={showAddCategory}
        onOpenChange={setShowAddCategory}
        onCategoryCreated={() => {
          router.refresh();
        }}
      />
    </>
  );
}

