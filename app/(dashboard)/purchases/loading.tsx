import { TablePageSkeleton } from "@/components/ui/page-skeleton";

export default function PurchasesLoading() {
  return <TablePageSkeleton columns={8} rows={9} showCards={false} />;
}
