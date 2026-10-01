import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";
import { packingCalculatorSchema, type PackingCalculatorValues } from "@/validations/packing.schema";
import type { PackingCostDTO } from "@/types";

export interface PackingCalculationResult {
  thermocolBoxesCount: number;
  costPerBox: number;
  thermocolCost: number;
  iceCost: number;
  oxygenCost: number;
  packingMaterialCost: number;
  labourCost: number;
  transportCost: number;
  quantityKg: number;
  totalPackingCost: number;
  costPerKg: number;
}

/**
 * Pure deterministic packing cost calculation function
 * Used both client-side and server-side.
 */
export function calculatePacking(inputs: {
  thermocolBoxesCount?: number;
  costPerBox?: number;
  iceCost?: number;
  oxygenCost?: number;
  packingMaterialCost?: number;
  labourCost?: number;
  transportCost?: number;
  quantityKg?: number;
}): PackingCalculationResult {
  const boxes = Math.max(0, Math.floor(inputs.thermocolBoxesCount || 0));
  const boxRate = Math.max(0, inputs.costPerBox || 0);
  const thermocolCost = Number((boxes * boxRate).toFixed(2));

  const ice = Math.max(0, inputs.iceCost || 0);
  const oxygen = Math.max(0, inputs.oxygenCost || 0);
  const packingMat = Math.max(0, inputs.packingMaterialCost || 0);
  const labour = Math.max(0, inputs.labourCost || 0);
  const transport = Math.max(0, inputs.transportCost || 0);
  const qty = Math.max(0, inputs.quantityKg || 0);

  const totalPackingCost = Number(
    (thermocolCost + ice + oxygen + packingMat + labour + transport).toFixed(2)
  );

  const costPerKg = qty > 0 ? Number((totalPackingCost / qty).toFixed(2)) : 0;

  return {
    thermocolBoxesCount: boxes,
    costPerBox: boxRate,
    thermocolCost,
    iceCost: ice,
    oxygenCost: oxygen,
    packingMaterialCost: packingMat,
    labourCost: labour,
    transportCost: transport,
    quantityKg: qty,
    totalPackingCost,
    costPerKg,
  };
}

/**
 * Save packing calculation to the database after authoritative server-side recalculation
 */
export async function savePackingCalculation(
  data: PackingCalculatorValues,
  userId?: string
): Promise<PackingCostDTO> {
  const validated = packingCalculatorSchema.parse(data);

  // Authoritative server-side recalculation
  const calc = calculatePacking({
    thermocolBoxesCount: validated.thermocolBoxesCount,
    costPerBox: validated.costPerBox,
    iceCost: validated.iceCost,
    oxygenCost: validated.oxygenCost,
    packingMaterialCost: validated.packingMaterialCost,
    labourCost: validated.labourCost,
    transportCost: validated.transportCost,
    quantityKg: validated.quantityKg,
  });

  const created = await prisma.packingCost.create({
    data: {
      saleId: validated.saleId || null,
      packingType: validated.packingType.trim(),
      thermocolBoxesCount: calc.thermocolBoxesCount,
      costPerBox: calc.costPerBox,
      thermocolCost: calc.thermocolCost,
      iceCost: calc.iceCost,
      oxygenCost: calc.oxygenCost,
      packingMaterialCost: calc.packingMaterialCost,
      labourCost: calc.labourCost,
      transportCost: calc.transportCost,
      quantityKg: calc.quantityKg,
      totalCost: calc.totalPackingCost,
      costPerKg: calc.costPerKg,
      notes: validated.notes?.trim() || null,
    },
    include: {
      sale: {
        select: {
          saleNumber: true,
        },
      },
    },
  });

  await logAuditEvent({
    action: "SAVE_PACKING_CALCULATION",
    entity: "PACKING_COST",
    entityId: created.id,
    userId,
    metadata: {
      packingType: created.packingType,
      totalCost: created.totalCost,
      costPerKg: created.costPerKg,
      quantityKg: created.quantityKg,
    },
  });

  return {
    id: created.id,
    saleId: created.saleId,
    saleNumber: created.sale?.saleNumber || null,
    packingType: created.packingType,
    thermocolBoxesCount: created.thermocolBoxesCount,
    costPerBox: created.costPerBox,
    thermocolCost: created.thermocolCost,
    iceCost: created.iceCost,
    oxygenCost: created.oxygenCost,
    packingMaterialCost: created.packingMaterialCost,
    labourCost: created.labourCost,
    transportCost: created.transportCost,
    quantityKg: created.quantityKg,
    totalCost: created.totalCost,
    costPerKg: created.costPerKg,
    notes: created.notes,
    createdAt: created.createdAt.toISOString(),
  };
}

/**
 * Fetch packing calculations history list
 */
export async function getPackingCostsList(limit = 30): Promise<PackingCostDTO[]> {
  try {
    const records = await prisma.packingCost.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        sale: {
          select: {
            saleNumber: true,
          },
        },
      },
    });

    return records.map((r) => ({
      id: r.id,
      saleId: r.saleId,
      saleNumber: r.sale?.saleNumber || null,
      packingType: r.packingType,
      thermocolBoxesCount: r.thermocolBoxesCount,
      costPerBox: r.costPerBox,
      thermocolCost: r.thermocolCost,
      iceCost: r.iceCost,
      oxygenCost: r.oxygenCost,
      packingMaterialCost: r.packingMaterialCost,
      labourCost: r.labourCost,
      transportCost: r.transportCost,
      quantityKg: r.quantityKg,
      totalCost: r.totalCost,
      costPerKg: r.costPerKg,
      notes: r.notes,
      createdAt: r.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Failed to fetch packing costs list:", error);
    return [];
  }
}

/**
 * Delete a packing cost calculation
 */
export async function deletePackingCalculation(id: string, userId?: string): Promise<boolean> {
  try {
    const existing = await prisma.packingCost.findUnique({
      where: { id },
    });

    if (!existing) return false;

    await prisma.packingCost.delete({
      where: { id },
    });

    await logAuditEvent({
      action: "DELETE_PACKING_CALCULATION",
      entity: "PACKING_COST",
      entityId: id,
      userId,
      metadata: {
        totalCost: existing.totalCost,
      },
    });

    return true;
  } catch (error) {
    console.error(`Failed to delete packing calculation ${id}:`, error);
    throw error;
  }
}
