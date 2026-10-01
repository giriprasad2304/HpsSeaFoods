import { prisma } from "@/lib/prisma";
import type { ReportLookupData } from "@/types/financial-reports";

export async function getReportLookups(): Promise<ReportLookupData> {
  try {
    const [fishTypes, suppliers, customers, categories] = await Promise.all([
      prisma.fishType.findMany({
        where: { isActive: true },
        select: { id: true, name: true, code: true },
        orderBy: { name: "asc" },
      }),
      prisma.supplier.findMany({
        where: { isActive: true },
        select: { id: true, name: true, code: true },
        orderBy: { name: "asc" },
      }),
      prisma.customer.findMany({
        where: { isActive: true },
        select: { id: true, name: true, code: true },
        orderBy: { name: "asc" },
      }),
      prisma.expenseCategory.findMany({
        where: { isActive: true },
        select: { id: true, name: true, code: true },
        orderBy: { name: "asc" },
      }),
    ]);

    return { fishTypes, suppliers, customers, categories };
  } catch (error) {
    console.error("Failed to load report lookups:", error);
    return { fishTypes: [], suppliers: [], customers: [], categories: [] };
  }
}
