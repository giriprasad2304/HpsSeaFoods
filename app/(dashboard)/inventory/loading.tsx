import { TablePageSkeleton } from "@/components/ui/page-skeleton";

export default function InventoryLoading() {
  return <TablePageSkeleton columns={7} rows={9} showCards={true} />;
}
