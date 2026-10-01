"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileSpreadsheet,
  TrendingUp,
  Scale,
  ShoppingCart,
  Anchor,
  Receipt,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { title: "Reports Hub", href: "/reports", icon: FileSpreadsheet },
  { title: "Profit & Loss", href: "/reports/profit-loss", icon: TrendingUp },
  { title: "Balance Sheet", href: "/reports/balance-sheet", icon: Scale },
  { title: "Sales Ledger", href: "/reports/sales", icon: ShoppingCart },
  { title: "Purchases", href: "/reports/purchases", icon: Anchor },
  { title: "Expenses", href: "/reports/expenses", icon: Receipt },
  { title: "Outstanding", href: "/reports/outstanding", icon: Users },
];

export function ReportNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1.5 border-b border-border pb-2 overflow-x-auto">
      {NAV_LINKS.map((link) => {
        const isActive =
          pathname === link.href || (link.href !== "/reports" && pathname.startsWith(link.href));
        const Icon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors",
              isActive
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span>{link.title}</span>
          </Link>
        );
      })}
    </div>
  );
}
