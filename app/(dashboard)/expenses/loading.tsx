import { TablePageSkeleton } from "@/components/ui/page-skeleton";

export default function ExpensesLoading() {
  return <TablePageSkeleton columns={7} rows={9} showCards={true} />;
}
