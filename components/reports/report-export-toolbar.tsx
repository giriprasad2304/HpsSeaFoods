"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Printer } from "lucide-react";
import type { ReportFilterOptions } from "@/types/financial-reports";

interface ReportExportToolbarProps {
  reportType: "sales" | "purchases" | "expenses" | "outstanding" | "profit-loss" | "balance-sheet";
  filters: ReportFilterOptions;
  isExporting?: boolean;
}

export function ReportExportToolbar({
  reportType,
  filters,
}: ReportExportToolbarProps) {
  const [downloading, setDownloading] = React.useState(false);

  const handleExcelExport = () => {
    setDownloading(true);
    try {
      const params = new URLSearchParams({ reportType });
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          params.set(key, String(val));
        }
      });
      window.location.href = `/api/reports/export/excel?${params.toString()}`;
    } catch (err) {
      console.error("Excel export error:", err);
    } finally {
      setTimeout(() => setDownloading(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex items-center gap-2 print:hidden">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExcelExport}
        disabled={downloading}
        className="h-8 text-xs gap-1.5"
      >
        <FileSpreadsheet className="h-3.5 w-3.5 text-success" />
        {downloading ? "Exporting..." : "Export Excel"}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handlePrint}
        className="h-8 text-xs gap-1.5"
      >
        <Printer className="h-3.5 w-3.5" />
        Print / PDF
      </Button>
    </div>
  );
}
