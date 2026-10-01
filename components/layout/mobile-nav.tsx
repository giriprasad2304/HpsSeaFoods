"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fish, X, LogOut } from "lucide-react";
import { SIDEBAR_NAV_ITEMS } from "@/constants/navigation";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav = React.memo(function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />
      {/* Slideout panel */}
      <div className="fixed inset-y-0 left-0 w-72 bg-sidebar text-sidebar-foreground p-4 flex flex-col justify-between shadow-2xl animate-slide-in-left border-r border-sidebar-border">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-sidebar-border mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Fish className="h-5 w-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm tracking-tight text-sidebar-foreground">
                  HPS SEA FOODS
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">
                  Management ERP
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              Menu
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
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className={cn("h-4.5 w-4.5", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                  <span>{item.title}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        "ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold",
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

        {/* Footer */}
        <div className="pt-4 border-t border-sidebar-border">
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-card border border-border/40">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary text-xs font-bold shrink-0">
                HPS
              </div>
              <div className="flex flex-col min-w-0">
                <span className="truncate font-semibold text-foreground text-xs">HPS SEA FOODS</span>
                <span className="text-[10px] text-muted-foreground truncate font-mono">admin@hpsseafoods.com</span>
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
      </div>
    </div>
  );
});
