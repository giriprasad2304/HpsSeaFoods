import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function ReportsLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/70">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-8 w-36 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-5 space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-12 w-full" />
            <div className="pt-3 border-t border-border flex justify-between items-center">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-7 w-20 rounded-lg" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
