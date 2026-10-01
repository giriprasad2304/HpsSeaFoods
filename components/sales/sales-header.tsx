import * as React from "react";
import Link from "next/link";
import { Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SalesHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border">
      <div>
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-primary" />
          <h1 className="text-base font-bold tracking-tight text-foreground">
            Fish Selling
          </h1>
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Track all the fish you sell to customers
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/sales/new">
          <Button size="sm" className="gap-1.5 h-8">
            <Plus className="h-3.5 w-3.5" />
            New Sale
          </Button>
        </Link>
      </div>
    </div>
  );
}
