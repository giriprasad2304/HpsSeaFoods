"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { TopHeader } from "./top-header";
import { MobileNav } from "./mobile-nav";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  const handleOpenNav = React.useCallback(() => {
    setMobileNavOpen(true);
  }, []);

  const handleCloseNav = React.useCallback(() => {
    setMobileNavOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Nav Drawer */}
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={handleCloseNav}
      />

      {/* Main Layout Area */}
      <div className="flex flex-1 flex-col md:pl-60 transition-[padding] duration-200">
        <TopHeader onMenuClick={handleOpenNav} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <div className="animate-fade-in space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
