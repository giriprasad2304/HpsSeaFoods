"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "./theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
        title="Switch theme"
        aria-label="Switch theme"
      >
        {resolvedTheme === "dark" ? (
          <Moon className="h-4 w-4 transition-transform" />
        ) : (
          <Sun className="h-4 w-4 transition-transform" />
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-32 origin-top-right rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md z-50 animate-scale-in">
          <button
            type="button"
            onClick={() => {
              setTheme("light");
              setIsOpen(false);
            }}
            className={`flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-xs font-medium transition-colors ${
              theme === "light"
                ? "bg-accent text-accent-foreground font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Sun className="h-3.5 w-3.5" />
            <span>Light</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTheme("dark");
              setIsOpen(false);
            }}
            className={`flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-xs font-medium transition-colors ${
              theme === "dark"
                ? "bg-accent text-accent-foreground font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Moon className="h-3.5 w-3.5" />
            <span>Dark</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTheme("system");
              setIsOpen(false);
            }}
            className={`flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-xs font-medium transition-colors ${
              theme === "system"
                ? "bg-accent text-accent-foreground font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Monitor className="h-3.5 w-3.5" />
            <span>System</span>
          </button>
        </div>
      )}
    </div>
  );
}
