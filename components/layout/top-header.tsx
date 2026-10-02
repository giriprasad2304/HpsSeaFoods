"use client";

import * as React from "react";
import { Search, Bell, Building2, UserCircle, Menu, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";

interface TopHeaderProps {
  onMenuClick?: () => void;
}

export const TopHeader = React.memo(function TopHeader({ onMenuClick }: TopHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/80 bg-background/80 px-4 sm:px-6 lg:px-8 backdrop-blur-md transition-colors">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="md:hidden h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground"
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Harbor Facility Selector / Business Badge */}
        <div className="flex items-center gap-2.5 rounded-lg bg-card/80 px-3 py-1.5 text-xs border border-border/70 shadow-2xs">
          <Building2 className="h-4 w-4 text-primary shrink-0" />
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground hidden sm:inline text-xs font-normal">Hub:</span>
            <span className="font-semibold text-foreground text-xs">Visakhapatnam Harbor</span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        </div>
      </div>

      {/* Global Quick Search, Theme Toggle, Notifications & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative hidden md:block w-60 lg:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search batches, sales, suppliers..."
            className="pl-9 pr-9 h-9 text-xs bg-muted/40 border-border/70 focus:bg-background transition-all"
          />
          <kbd className="absolute right-2.5 top-2.5 hidden sm:inline-flex h-4 items-center rounded border border-border/60 bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </div>

        {/* Theme Toggle (Light / Dark / System) */}
        <ThemeToggle />

        {/* Realtime Alert Indicator */}
        <Button
          variant="outline"
          size="icon"
          className="relative h-9 w-9 rounded-lg border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/50"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
        </Button>

        {/* User Account / Profile & Logout */}
        <div className="flex items-center gap-2 sm:gap-2.5 pl-2 sm:pl-3 border-l border-border/70">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20 shadow-2xs">
            <UserCircle className="h-5 w-5" />
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold text-foreground leading-tight">Admin</span>
            <span className="text-[11px] text-muted-foreground font-mono">hpsfooods@gmail.com</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={async () => {
              try {
                await fetch("/api/auth/logout", { method: "POST" });
              } catch {}
              document.cookie = "auth_session=; path=/; max-age=0";
              document.cookie = "demo_session=; path=/; max-age=0";
              window.location.href = "/login";
            }}
            className="h-9 w-9 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
});
