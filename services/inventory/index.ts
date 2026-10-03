import { prisma } from "@/lib/prisma";
import type {
  InventoryStockSummaryDTO,
  InventoryTransactionDTO,
  InventoryTransactionType,
} from "@/types";

/**
 * Calculates current stock dynamically from the ledger of inventory transactions.
 * Current Stock = Sum of all (quantityKg) transactions for each FishType.
 * (e.g. Purchase +500kg, Sale -100kg, Sale -50kg, Adjustment -10kg = 340kg)
 */
export async function getInventoryStockSummary(): Promise<InventoryStockSummaryDTO[]> {
  try {
    const fishTypes = await prisma.fishType.findMany({
      where: { isActive: true },
      include: {
        inventoryTransactions: true,
      },
      orderBy: { name: "asc" },
    });

    return fishTypes.map((fish) => {
      let currentStockKg = 0;
      let totalPurchasedKg = 0;
      let totalSoldKg = 0;
      let totalWastageKg = 0;
      let totalCostPurchased = 0;

      for (const tx of fish.inventoryTransactions) {
        currentStockKg += tx.quantityKg;

        if (tx.transactionType === "PURCHASE_INWARD" || tx.quantityKg > 0) {
          totalPurchasedKg += tx.quantityKg;
          if (tx.unitCost) {
            totalCostPurchased += tx.quantityKg * tx.unitCost;
          }
        } else if (tx.transactionType === "SALE_OUTWARD") {
          totalSoldKg += Math.abs(tx.quantityKg);
        } else if (tx.transactionType === "WASTAGE_OUTWARD") {
          totalWastageKg += Math.abs(tx.quantityKg);
        }
      }

      const avgCost = totalPurchasedKg > 0 ? totalCostPurchased / totalPurchasedKg : 7.5;
      const stockStatus =
        currentStockKg <= 0
          ? "DEPLETED"
          : currentStockKg < 500
          ? "LOW_STOCK"
          : "IN_STOCK";

      return {
        fishTypeId: fish.id,
        code: fish.code,
        name: fish.name,
        category: fish.category,
        grade: fish.grade ?? "Grade A",
        currentStockKg: Math.max(0, currentStockKg),
        totalPurchasedKg,
        totalSoldKg,
        totalWastageKg,
        averageCostPerKg: avgCost,
        stockStatus,
      };
    });
  } catch (error) {
    console.error("Failed to fetch inventory status:", error);
    return [];
  }
}

/**
 * Retrieves the chronological list of inventory transactions.
 */
export async function getInventoryTransactionsList(limit = 25): Promise<InventoryTransactionDTO[]> {
  try {
    const transactions = await prisma.inventoryTransaction.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        fishType: true,
      },
    });

    return transactions.map((tx) => ({
      id: tx.id,
      fishTypeId: tx.fishTypeId,
      fishTypeName: tx.fishType.name,
      transactionType: tx.transactionType,
      quantityKg: tx.quantityKg,
      unitCost: tx.unitCost,
      batchLotNumber: tx.batchLotNumber,
      storageLocation: tx.storageLocation,
      notes: tx.notes,
      createdAt: tx.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Failed to fetch inventory transactions:", error);
    return [];
  }
}

/**
 * Creates an immutable inventory transaction record.
 */
export async function recordInventoryTransaction(params: {
  fishTypeId: string;
  transactionType: InventoryTransactionType;
  quantityKg: number;
  unitCost?: number;
  purchaseItemId?: string;
  saleItemId?: string;
  batchLotNumber?: string;
  storageLocation?: string;
  notes?: string;
}) {
  return prisma.inventoryTransaction.create({
    data: {
      fishTypeId: params.fishTypeId,
      transactionType: params.transactionType,
      quantityKg: params.quantityKg,
      unitCost: params.unitCost,
      purchaseItemId: params.purchaseItemId,
      saleItemId: params.saleItemId,
      batchLotNumber: params.batchLotNumber,
      storageLocation: params.storageLocation,
      notes: params.notes,
    },
  });
}

/**
 * Creates a stock adjustment transaction (Inward, Outward, or Wastage).
 */
export async function createStockAdjustment(data: {
  fishTypeId: string;
  adjustmentType: "ADJUSTMENT_INWARD" | "ADJUSTMENT_OUTWARD" | "WASTAGE_OUTWARD";
  quantityKg: number;
  unitCost?: number;
  batchLotNumber?: string;
  storageLocation?: string;
  notes?: string;
}) {
  const qty = Math.abs(data.quantityKg);
  const signedQty = data.adjustmentType === "ADJUSTMENT_INWARD" ? qty : -qty;

  const transaction = await prisma.inventoryTransaction.create({
    data: {
      fishTypeId: data.fishTypeId,
      transactionType: data.adjustmentType,
      quantityKg: signedQty,
      unitCost: data.unitCost,
      batchLotNumber: data.batchLotNumber || `ADJ-${Date.now().toString().slice(-6)}`,
      storageLocation: data.storageLocation || "Cold Storage A",
      notes: data.notes || `Stock ${data.adjustmentType.replace("_", " ").toLowerCase()}`,
    },
    include: {
      fishType: true,
    },
  });

  return transaction;
}

/**
 * Creates a new fish species/type in the master catalogue.
 */
export async function createFishType(data: {
  name: string;
  code?: string;
  category?: string;
  grade?: string;
  scientificName?: string;
  description?: string;
  initialStockKg?: number;
  initialCostPerKg?: number;
  storageLocation?: string;
}) {
  const cleanedName = data.name.trim();
  const baseCode = (data.code?.trim() || `FISH-${cleanedName.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase()}`).toUpperCase();
  
  // Ensure unique code
  let finalCode = baseCode;
  const existingWithCode = await prisma.fishType.findUnique({ where: { code: finalCode } });
  if (existingWithCode) {
    finalCode = `${baseCode}-${Date.now().toString().slice(-4)}`;
  }

  const created = await prisma.fishType.create({
    data: {
      code: finalCode,
      name: cleanedName,
      category: data.category?.trim() || "Pelagic",
      grade: data.grade?.trim() || "Grade A",
      scientificName: data.scientificName?.trim() || null,
      description: data.description?.trim() || null,
      isActive: true,
    },
  });

  const initialStock = data.initialStockKg && data.initialStockKg > 0 ? data.initialStockKg : 0;
  const initialCost = data.initialCostPerKg && data.initialCostPerKg > 0 ? data.initialCostPerKg : 0;

  if (initialStock > 0) {
    await prisma.inventoryTransaction.create({
      data: {
        fishTypeId: created.id,
        transactionType: "ADJUSTMENT_INWARD",
        quantityKg: initialStock,
        unitCost: initialCost > 0 ? initialCost : undefined,
        batchLotNumber: `INIT-${Date.now().toString().slice(-6)}`,
        storageLocation: data.storageLocation?.trim() || "Cold Storage A",
        notes: `Initial opening stock recorded for ${created.name}`,
      },
    });
  }

  const stockStatus =
    initialStock <= 0
      ? "DEPLETED"
      : initialStock < 500
      ? "LOW_STOCK"
      : "IN_STOCK";

  return {
    id: created.id,
    fishTypeId: created.id,
    code: created.code,
    name: created.name,
    category: created.category,
    grade: created.grade || "Grade A",
    scientificName: created.scientificName,
    description: created.description,
    isActive: created.isActive,
    currentStockKg: initialStock,
    totalPurchasedKg: initialStock,
    totalSoldKg: 0,
    totalWastageKg: 0,
    averageCostPerKg: initialCost,
    stockStatus,
  };
}

