"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fish, LogOut } from "lucide-react";
import { SIDEBAR_NAV_ITEMS } from "@/constants/navigation";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export const Sidebar = React.memo(function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 z-40 bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-xs",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center px-5 border-b border-sidebar-border gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20">
          <Fish className="h-5 w-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-sm tracking-tight text-sidebar-foreground truncate">
            HPS SEA FOODS
          </span>
          <span className="text-[11px] text-muted-foreground truncate font-medium">
            Management ERP
          </span>
        </div>
      </div>

      {/* Navigation list */}
      <div className="flex-1 flex flex-col justify-between overflow-y-auto px-3 py-4">
        <nav className="space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Main Navigation
          </div>
          {SIDEBAR_NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25 font-semibold"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-4.5 w-4.5 shrink-0 transition-transform duration-150 group-hover:scale-105",
                    isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
                  )}
                />
                <span className="truncate">{item.title}</span>
                {item.badge && (
                  <span
                    className={cn(
                      "ml-auto rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Info & Sign Out */}
      <div className="p-3 border-t border-sidebar-border bg-sidebar/50 space-y-2">
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-card border border-border/40 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary text-xs font-bold ring-1 ring-primary/25 shrink-0">
              HPS
            </div>
            <div className="flex flex-col min-w-0">
              <span className="truncate font-semibold text-foreground text-xs">HPS SEA FOODS</span>
              <span className="text-[10px] text-muted-foreground truncate font-mono">
                admin@hpsseafoods.com
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={async () => {
              try {
                await fetch("/api/auth/logout", { method: "POST" });
              } catch {}
              document.cookie = "auth_session=; path=/; max-age=0";
              document.cookie = "demo_session=; path=/; max-age=0";
              window.location.href = "/login";
            }}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
});
