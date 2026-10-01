"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Download, Anchor } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PurchasesHeader() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-border">
      <div>
        <div className="flex items-center gap-2">
          <Anchor className="h-4 w-4 text-primary" />
          <h1 className="text-base font-bold tracking-tight text-foreground">
            Fish Buying
          </h1>
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Record all the fish you buy from boats & suppliers
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
        <Link href="/purchases/new">
          <Button size="sm" className="gap-1.5 h-8 text-xs">
            <Plus className="h-3.5 w-3.5" />
            New Purchase
          </Button>
        </Link>
      </div>
    </div>
  );
}
