import { TablePageSkeleton } from "@/components/ui/page-skeleton";

export default function Loading() {
  return <TablePageSkeleton columns={6} rows={8} showCards={true} />;
}
