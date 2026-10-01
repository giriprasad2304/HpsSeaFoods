"use client";

import * as React from "react";
import {
  FileText,
  FileSpreadsheet,
  Download,
  Calendar,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FINANCIAL_REPORTS_LIST, type ReportTemplateDTO } from "@/services/reports";

export function ReportsOverview() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Operational & Financial Reports</h1>
          <p className="text-xs text-muted-foreground">
            Generate Excel data sheets, PDF tax manifests, and batch traceability certificates
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Calendar className="h-3.5 w-3.5" />
            Custom Date Range
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FINANCIAL_REPORTS_LIST.map((report: ReportTemplateDTO) => (
          <Card key={report.id} className="flex flex-col justify-between p-5 hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <Badge variant={report.format === "EXCEL" ? "success" : "default"}>
                  {report.format}
                </Badge>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  {report.frequency}
                </span>
              </div>

              <h3 className="text-sm font-semibold text-foreground mb-1.5 flex items-center gap-2">
                {report.format === "EXCEL" ? (
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <FileText className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />
                )}
                {report.title}
              </h3>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {report.description}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">
                Category: <strong className="text-foreground">{report.category}</strong>
              </span>
              <Button size="sm" variant="outline" className="gap-1 text-xs h-7 px-2.5">
                <Download className="h-3 w-3" /> Generate
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
