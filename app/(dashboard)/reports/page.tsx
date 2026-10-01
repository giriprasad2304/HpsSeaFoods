import * as React from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  TrendingUp,
  Scale,
  ShoppingCart,
  Anchor,
  Receipt,
  Users,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReportNav } from "@/components/reports/report-nav";
import { FINANCIAL_REPORTS_LIST } from "@/services/reports";

export const metadata = {
  title: "Reports | HPS SEA FOODS",
  description: "Download and view all your business reports.",
};

export const dynamic = "force-dynamic";

export default function ReportsPage() {
  const getIcon = (id: string) => {
    switch (id) {
      case "rep-profit-loss":
        return <TrendingUp className="h-5 w-5 text-emerald-500" />;
      case "rep-balance-sheet":
        return <Scale className="h-5 w-5 text-sky-500" />;
      case "rep-sales-ledger":
        return <ShoppingCart className="h-5 w-5 text-blue-500" />;
      case "rep-purchase-inward":
        return <Anchor className="h-5 w-5 text-orange-500" />;
      case "rep-expenses-register":
        return <Receipt className="h-5 w-5 text-violet-500" />;
      case "rep-outstanding-aging":
        return <Users className="h-5 w-5 text-amber-500" />;
      default:
        return <FileSpreadsheet className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      <ReportNav />

      <div className="flex flex-col gap-1 pb-2 border-b border-border">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Reports & Downloads
        </h1>
        <p className="text-xs text-muted-foreground">
          Download and view all your business reports
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FINANCIAL_REPORTS_LIST.map((rep) => (
          <Link key={rep.id} href={rep.href} className="group block">
            <Card className="h-full p-4 flex flex-col justify-between hover:border-sky-500/50 hover:shadow-sm transition-all">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="p-2 rounded-md bg-muted/60">
                    {getIcon(rep.id)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px]">
                      {rep.frequency}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {rep.format}
                    </Badge>
                  </div>
                </div>

                <div className="mt-3">
                  <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                    {rep.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {rep.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground group-hover:text-primary font-medium">
                <span>Open Report</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
