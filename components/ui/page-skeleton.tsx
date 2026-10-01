import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function TablePageSkeleton({
  columns = 7,
  rows = 8,
  showCards = true,
}: {
  columns?: number;
  rows?: number;
  showCards?: boolean;
}) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/70">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56 sm:w-72" />
          <Skeleton className="h-4 w-72 sm:w-96" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-36 rounded-lg" />
        </div>
      </div>

      {/* Metric Cards Skeleton (optional) */}
      {showCards && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-7 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-10 w-10 rounded-xl" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Filter Bar Skeleton */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <Skeleton className="h-9.5 flex-1 rounded-lg" />
        <Skeleton className="h-9.5 w-36 rounded-lg" />
        <Skeleton className="h-9.5 w-36 rounded-lg" />
        <Skeleton className="h-9.5 w-24 rounded-lg" />
      </div>

      {/* Table Skeleton */}
      <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-border/80 bg-muted/40 flex items-center justify-between gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1 max-w-[120px]" />
          ))}
        </div>
        <div className="divide-y divide-border/50 p-2 space-y-2">
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="py-3 px-3 flex items-center justify-between gap-4">
              {Array.from({ length: columns }).map((_, c) => (
                <Skeleton
                  key={c}
                  className={`h-4 flex-1 ${c === 0 ? "max-w-[80px]" : c === 1 ? "max-w-[120px]" : "max-w-[100px]"}`}
                />
              ))}
            </div>
          ))}
        </div>
        {/* Pagination bar skeleton */}
        <div className="p-3 border-t border-border/80 flex items-center justify-between">
          <Skeleton className="h-4 w-48" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/70">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64 sm:w-80" />
          <Skeleton className="h-4 w-80 sm:w-[480px]" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </div>

      {/* 9 Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <Card key={i} className="p-5 shadow-2xs">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-8 w-36" />
              </div>
              <Skeleton className="h-10 w-10 rounded-xl" />
            </div>
            <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
          </Card>
        ))}
      </div>

      {/* 2 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-5 shadow-2xs">
          <div className="space-y-2 mb-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="h-[220px] w-full rounded-lg" />
        </Card>
        <Card className="p-5 shadow-2xs">
          <div className="space-y-2 mb-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="h-[220px] w-full rounded-lg" />
        </Card>
      </div>

      {/* Wide Chart */}
      <Card className="p-5 shadow-2xs">
        <div className="space-y-2 mb-4">
          <Skeleton className="h-5 w-52" />
          <Skeleton className="h-3 w-72" />
        </div>
        <Skeleton className="h-[260px] w-full rounded-lg" />
      </Card>
    </div>
  );
}

export function FormPageSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-36 rounded-lg" />
        <Skeleton className="h-9 w-44 rounded-lg" />
      </div>

      <Card>
        <CardHeader className="border-b border-border/70 pb-4 space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="pt-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9.5 w-full rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9.5 w-full rounded-lg" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9.5 w-full rounded-lg" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9.5 w-full rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9.5 w-full rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9.5 w-full rounded-lg" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function PackingPageSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/70">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-8 w-44 rounded-lg" />
      </div>

      {/* 2-col calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <Card className="p-5 space-y-4">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-9.5 w-full rounded-lg" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-9.5 w-full rounded-lg" />
              <Skeleton className="h-9.5 w-full rounded-lg" />
              <Skeleton className="h-9.5 w-full rounded-lg" />
              <Skeleton className="h-9.5 w-full rounded-lg" />
            </div>
          </Card>
        </div>
        <div className="lg:col-span-5">
          <Card className="p-5 space-y-4">
            <Skeleton className="h-5 w-36" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
            <Skeleton className="h-40 w-full rounded-lg" />
          </Card>
        </div>
      </div>
    </div>
  );
}
