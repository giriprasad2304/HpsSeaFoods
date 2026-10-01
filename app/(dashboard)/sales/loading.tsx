import { TablePageSkeleton } from "@/components/ui/page-skeleton";

export default function SalesLoading() {
  return <TablePageSkeleton columns={7} rows={9} showCards={false} />;
}
