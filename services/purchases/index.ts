import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";
import {
  createPurchaseSchema,
  updatePurchaseSchema,
  recordPurchasePaymentSchema,
} from "@/validations/purchase.schema";
import type {
  PurchaseDTO,
  PurchaseDetailDTO,
  PurchaseFilterParams,
  CreatePurchaseInput,
  UpdatePurchaseInput,
  UpdatePurchaseSpoilageInput,
  RecordPurchasePaymentInput,
  PurchaseLookupsDTO,
  PaymentStatus,
} from "@/types";

/**
 * Authoritative financial calculation helper.
 */
export function calculatePurchaseTotals<
  T extends { weightKg: number; unitPricePerKg: number }
>(
  items: T[],
  transportCharges = 0,
  iceCharges = 0,
  labourCharges = 0,
  paidAmount = 0
) {
  const calculatedItems = items.map((item) => ({
    ...item,
    totalCost: Number((item.weightKg * item.unitPricePerKg).toFixed(2)),
  }));

  const totalWeightKg = Number(
    items.reduce((sum, item) => sum + item.weightKg, 0).toFixed(2)
  );

  const subtotal = Number(
    calculatedItems.reduce((sum, item) => sum + item.totalCost, 0).toFixed(2)
  );

  const transport = Number((transportCharges || 0).toFixed(2));
  const ice = Number((iceCharges || 0).toFixed(2));
  const labour = Number((labourCharges || 0).toFixed(2));

  const totalAmount = Number((subtotal + transport + ice + labour).toFixed(2));
  const paid = Number((paidAmount || 0).toFixed(2));
  const balanceAmount = Number(Math.max(0, totalAmount - paid).toFixed(2));

  let paymentStatus: PaymentStatus = "UNPAID";
  if (balanceAmount <= 0 && totalAmount > 0) {
    paymentStatus = "PAID";
  } else if (paid > 0 && paid < totalAmount) {
    paymentStatus = "PARTIAL";
  }

  return {
    calculatedItems,
    totalWeightKg,
    subtotal,
    transportCharges: transport,
    iceCharges: ice,
    labourCharges: labour,
    totalAmount,
    paidAmount: paid,
    balanceAmount,
    paymentStatus,
  };
}

/**
 * Lists purchases with multi-criteria filtering.
 */
export async function listPurchases(
  filterOptions: PurchaseFilterParams | number = {}
): Promise<PurchaseDTO[]> {
  const filters: PurchaseFilterParams =
    typeof filterOptions === "number"
      ? { limit: filterOptions }
      : filterOptions;
  try {
    const where: Record<string, unknown> = {};

    if (filters.supplierId && filters.supplierId !== "ALL") {
      where.supplierId = filters.supplierId;
    }

    if (filters.paymentStatus && filters.paymentStatus !== "ALL") {
      where.paymentStatus = filters.paymentStatus;
    }

    if (filters.fishTypeId && filters.fishTypeId !== "ALL") {
      where.items = {
        some: {
          fishTypeId: filters.fishTypeId,
        },
      };
    }

    // Date / Month / Year filter handling
    if (filters.date) {
      const startDate = new Date(filters.date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(filters.date);
      endDate.setHours(23, 59, 59, 999);
      where.purchaseDate = { gte: startDate, lte: endDate };
    } else if (
      (filters.year && filters.year !== "ALL") ||
      (filters.month && filters.month !== "ALL")
    ) {
      const year =
        filters.year && filters.year !== "ALL"
          ? parseInt(filters.year, 10)
          : new Date().getFullYear();
      const hasMonth = Boolean(filters.month && filters.month !== "ALL");
      const month =
        hasMonth && filters.month ? parseInt(filters.month, 10) - 1 : 0;
      const startMonth = hasMonth ? month : 0;
      const endMonth = hasMonth ? month + 1 : 12;

      const startDate = new Date(year, startMonth, 1);
      const endDate = new Date(year, endMonth, 0, 23, 59, 59, 999);
      where.purchaseDate = { gte: startDate, lte: endDate };
    }

    if (filters.invoiceNumber || filters.search) {
      const term = filters.invoiceNumber || filters.search;
      where.OR = [
        { purchaseNumber: { contains: term, mode: "insensitive" } },
        { invoiceFileName: { contains: term, mode: "insensitive" } },
        { supplier: { name: { contains: term, mode: "insensitive" } } },
        { landingHarbor: { contains: term, mode: "insensitive" } },
      ];
    }

    const skip = filters.page && filters.limit ? (filters.page - 1) * filters.limit : 0;
    const take = filters.limit ?? 50;

    const purchases = await prisma.purchase.findMany({
      where,
      orderBy: { purchaseDate: "desc" },
      take,
      skip,
      include: {
        supplier: true,
        items: true,
      },
    });

    return purchases.map((p) => ({
      id: p.id,
      purchaseNumber: p.purchaseNumber,
      supplierId: p.supplierId,
      supplierName: p.supplier.name,
      purchaseDate: p.purchaseDate.toISOString(),
      status: p.status,
      totalWeightKg: p.totalWeightKg,
      subtotal: p.subtotal,
      transportCharges: p.transportCharges,
      iceCharges: p.iceCharges,
      labourCharges: p.labourCharges,
      totalAmount: p.totalAmount,
      paidAmount: p.paidAmount,
      balanceAmount: p.balanceAmount,
      paymentStatus: p.paymentStatus,
      paymentMethod: p.paymentMethod,
      landingHarbor: p.landingHarbor,
      truckNumber: p.truckNumber,
      invoiceUrl: p.invoiceUrl,
      itemsCount: p.items.length,
    }));
  } catch (error) {
    console.error("Failed to fetch purchases list:", error);
    return [];
  }
}

/**
 * Counts total purchases matching filter criteria for pagination
 */
export async function countPurchases(
  filterOptions: PurchaseFilterParams | number = {}
): Promise<number> {
  const filters: PurchaseFilterParams =
    typeof filterOptions === "number"
      ? { limit: filterOptions }
      : filterOptions;
  try {
    const where: Record<string, unknown> = {};

    if (filters.supplierId && filters.supplierId !== "ALL") {
      where.supplierId = filters.supplierId;
    }

    if (filters.paymentStatus && filters.paymentStatus !== "ALL") {
      where.paymentStatus = filters.paymentStatus;
    }

    if (filters.fishTypeId && filters.fishTypeId !== "ALL") {
      where.items = {
        some: {
          fishTypeId: filters.fishTypeId,
        },
      };
    }

    if (filters.date) {
      const startDate = new Date(filters.date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(filters.date);
      endDate.setHours(23, 59, 59, 999);
      where.purchaseDate = { gte: startDate, lte: endDate };
    } else if (
      (filters.year && filters.year !== "ALL") ||
      (filters.month && filters.month !== "ALL")
    ) {
      const year =
        filters.year && filters.year !== "ALL"
          ? parseInt(filters.year, 10)
          : new Date().getFullYear();
      const hasMonth = Boolean(filters.month && filters.month !== "ALL");
      const month =
        hasMonth && filters.month ? parseInt(filters.month, 10) - 1 : 0;
      const startMonth = hasMonth ? month : 0;
      const endMonth = hasMonth ? month + 1 : 12;

      const startDate = new Date(year, startMonth, 1);
      const endDate = new Date(year, endMonth, 0, 23, 59, 59, 999);
      where.purchaseDate = { gte: startDate, lte: endDate };
    }

    if (filters.invoiceNumber || filters.search) {
      const term = filters.invoiceNumber || filters.search;
      where.OR = [
        { purchaseNumber: { contains: term, mode: "insensitive" } },
        { invoiceFileName: { contains: term, mode: "insensitive" } },
        { supplier: { name: { contains: term, mode: "insensitive" } } },
        { landingHarbor: { contains: term, mode: "insensitive" } },
      ];
    }

    return await prisma.purchase.count({ where });
  } catch {
    return 0;
  }
}


/**
 * Retrieves a single purchase by ID with all details, items, payments, and invoice info.
 */
export async function getPurchaseById(id: string): Promise<PurchaseDetailDTO | null> {
  try {
    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        supplier: true,
        items: {
          include: {
            fishType: true,
          },
        },
        payments: {
          orderBy: { paymentDate: "desc" },
        },
      },
    });

    if (!purchase) {
      return null;
    }

    return {
      id: purchase.id,
      purchaseNumber: purchase.purchaseNumber,
      supplierId: purchase.supplierId,
      supplierName: purchase.supplier.name,
      supplierPhone: purchase.supplier.phone,
      supplierBoatName: purchase.supplier.boatName,
      purchaseDate: purchase.purchaseDate.toISOString(),
      status: purchase.status,
      totalWeightKg: purchase.totalWeightKg,
      subtotal: purchase.subtotal,
      transportCharges: purchase.transportCharges,
      iceCharges: purchase.iceCharges,
      labourCharges: purchase.labourCharges,
      totalAmount: purchase.totalAmount,
      paidAmount: purchase.paidAmount,
      balanceAmount: purchase.balanceAmount,
      paymentStatus: purchase.paymentStatus,
      paymentMethod: purchase.paymentMethod,
      landingHarbor: purchase.landingHarbor,
      truckNumber: purchase.truckNumber,
      invoiceUrl: purchase.invoiceUrl,
      invoiceFileName: purchase.invoiceFileName,
      invoiceFileType: purchase.invoiceFileType,
      invoiceFileSize: purchase.invoiceFileSize,
      notes: purchase.notes,
      createdAt: purchase.createdAt.toISOString(),
      updatedAt: purchase.updatedAt.toISOString(),
      items: purchase.items.map((item) => ({
        id: item.id,
        purchaseId: item.purchaseId,
        fishTypeId: item.fishTypeId,
        fishTypeName: item.fishType.name,
        fishTypeCode: item.fishType.code,
        grade: item.grade,
        fishCount: item.fishCount,
        weightKg: item.weightKg,
        spoiledWeightKg: item.spoiledWeightKg ?? 0,
        spoilageReason: item.spoilageReason ?? null,
        effectiveWeightKg: Math.max(0, Number((item.weightKg - (item.spoiledWeightKg ?? 0)).toFixed(2))),
        unitPricePerKg: item.unitPricePerKg,
        totalCost: item.totalCost,
        temperatureC: item.temperatureC,
        notes: item.notes,
        createdAt: item.createdAt.toISOString(),
      })),
      payments: purchase.payments.map((p) => ({
        id: p.id,
        paymentNumber: p.paymentNumber,
        amount: p.amount,
        paymentMethod: p.paymentMethod,
        paymentDate: p.paymentDate.toISOString(),
        referenceNumber: p.referenceNumber,
        notes: p.notes,
      })),
    };
  } catch (error) {
    console.error(`Failed to fetch purchase detail for ${id}:`, error);
    return null;
  }
}

/**
 * Creates a purchase and safely updates transaction-based inventory in a single DB transaction.
 */
export async function createPurchase(
  rawInput: CreatePurchaseInput,
  userId?: string
) {
  const validated = createPurchaseSchema.parse(rawInput);

  const {
    calculatedItems,
    totalWeightKg,
    subtotal,
    transportCharges,
    iceCharges,
    labourCharges,
    totalAmount,
    paidAmount,
    balanceAmount,
    paymentStatus,
  } = calculatePurchaseTotals(
    validated.items,
    validated.transportCharges,
    validated.iceCharges,
    validated.labourCharges,
    validated.initialPaidAmount
  );

  const purchaseNumber =
    validated.purchaseNumber ||
    `PUR-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;

  return prisma.$transaction(async (tx) => {
    // 1. Create Purchase
    const purchase = await tx.purchase.create({
      data: {
        purchaseNumber,
        supplierId: validated.supplierId,
        purchaseDate: new Date(validated.purchaseDate),
        status: "RECEIVED",
        totalWeightKg,
        subtotal,
        transportCharges,
        iceCharges,
        labourCharges,
        totalAmount,
        paidAmount,
        balanceAmount,
        paymentStatus,
        paymentMethod: validated.paymentMethod,
        landingHarbor: validated.landingHarbor,
        truckNumber: validated.truckNumber,
        invoiceUrl: validated.invoiceUrl,
        invoiceFileName: validated.invoiceFileName,
        invoiceFileType: validated.invoiceFileType,
        invoiceFileSize: validated.invoiceFileSize,
        notes: validated.notes,
      },
    });

    // 2. Create Purchase Items & matching InventoryTransactions (+Quantity)
    for (const item of calculatedItems) {
      const purchaseItem = await tx.purchaseItem.create({
        data: {
          purchaseId: purchase.id,
          fishTypeId: item.fishTypeId,
          grade: item.grade || "Grade A",
          weightKg: item.weightKg,
          unitPricePerKg: item.unitPricePerKg,
          totalCost: item.totalCost,
          temperatureC: item.temperatureC,
          notes: item.notes,
        },
      });

      // Transaction-based inventory entry: Inward Purchase (+Kg)
      await tx.inventoryTransaction.create({
        data: {
          fishTypeId: item.fishTypeId,
          transactionType: "PURCHASE_INWARD",
          quantityKg: item.weightKg,
          unitCost: item.unitPricePerKg,
          purchaseItemId: purchaseItem.id,
          batchLotNumber: `LOT-${purchaseNumber}-${item.fishTypeId.slice(-4)}`,
          storageLocation: validated.landingHarbor || "Cold Storage Bay",
          notes: `Harbor inward intake from ${purchaseNumber}`,
        },
      });
    }

    // 3. If initial payment recorded, create Payment voucher
    if (paidAmount > 0) {
      const paymentNumber = `VCH-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
      await tx.payment.create({
        data: {
          paymentNumber,
          paymentType: "SUPPLIER_PAYMENT",
          amount: paidAmount,
          paymentMethod: validated.paymentMethod,
          paymentDate: new Date(validated.purchaseDate),
          supplierId: validated.supplierId,
          purchaseId: purchase.id,
          notes: `Initial payment at intake for ${purchaseNumber}`,
        },
      });
    }

    // 4. Update Supplier outstanding balance
    await tx.supplier.update({
      where: { id: validated.supplierId },
      data: {
        balance: {
          increment: balanceAmount,
        },
      },
    });

    // 5. Audit log
    await logAuditEvent({
      userId,
      action: "PURCHASE_CREATED",
      entity: "PURCHASE",
      entityId: purchase.id,
      metadata: {
        purchaseNumber,
        totalAmount,
        totalWeightKg,
        itemsCount: calculatedItems.length,
      },
    });

    return purchase;
  });
}

/**
 * Updates an existing purchase and recalibrates inventory transactions.
 */
export async function updatePurchase(
  id: string,
  rawInput: UpdatePurchaseInput,
  userId?: string
) {
  const validated = updatePurchaseSchema.parse(rawInput);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.purchase.findUniqueOrThrow({
      where: { id },
      include: { items: true },
    });

    let totalWeightKg = existing.totalWeightKg;
    let subtotal = existing.subtotal;
    let transportCharges = validated.transportCharges ?? existing.transportCharges;
    let iceCharges = validated.iceCharges ?? existing.iceCharges;
    let labourCharges = validated.labourCharges ?? existing.labourCharges;
    let totalAmount = existing.totalAmount;
    let balanceAmount = existing.balanceAmount;
    let paymentStatus = existing.paymentStatus;

    if (validated.items && validated.items.length > 0) {
      const totals = calculatePurchaseTotals(
        validated.items,
        transportCharges,
        iceCharges,
        labourCharges,
        existing.paidAmount
      );
      totalWeightKg = totals.totalWeightKg;
      subtotal = totals.subtotal;
      transportCharges = totals.transportCharges;
      iceCharges = totals.iceCharges;
      labourCharges = totals.labourCharges;
      totalAmount = totals.totalAmount;
      balanceAmount = totals.balanceAmount;
      paymentStatus = totals.paymentStatus;

      // Clean up previous inventory transactions & items
      await tx.inventoryTransaction.deleteMany({
        where: { purchaseItemId: { in: existing.items.map((i) => i.id) } },
      });
      await tx.purchaseItem.deleteMany({
        where: { purchaseId: id },
      });

      // Recreate updated items & transactions
      for (const item of totals.calculatedItems) {
        const purchaseItem = await tx.purchaseItem.create({
          data: {
            purchaseId: id,
            fishTypeId: item.fishTypeId,
            grade: item.grade || "Grade A",
            weightKg: item.weightKg,
            unitPricePerKg: item.unitPricePerKg,
            totalCost: item.totalCost,
            temperatureC: item.temperatureC,
            notes: item.notes,
          },
        });

        await tx.inventoryTransaction.create({
          data: {
            fishTypeId: item.fishTypeId,
            transactionType: "PURCHASE_INWARD",
            quantityKg: item.weightKg,
            unitCost: item.unitPricePerKg,
            purchaseItemId: purchaseItem.id,
            batchLotNumber: `LOT-${existing.purchaseNumber}-${item.fishTypeId.slice(-4)}`,
            storageLocation: validated.landingHarbor || existing.landingHarbor || "Cold Storage Bay",
            notes: `Updated inward intake for ${existing.purchaseNumber}`,
          },
        });
      }
    }

    const updated = await tx.purchase.update({
      where: { id },
      data: {
        supplierId: validated.supplierId ?? existing.supplierId,
        purchaseDate: validated.purchaseDate ? new Date(validated.purchaseDate) : existing.purchaseDate,
        status: validated.status ?? existing.status,
        totalWeightKg,
        subtotal,
        transportCharges,
        iceCharges,
        labourCharges,
        totalAmount,
        balanceAmount,
        paymentStatus,
        paymentMethod: validated.paymentMethod ?? existing.paymentMethod,
        landingHarbor: validated.landingHarbor !== undefined ? validated.landingHarbor : existing.landingHarbor,
        truckNumber: validated.truckNumber !== undefined ? validated.truckNumber : existing.truckNumber,
        invoiceUrl: validated.invoiceUrl !== undefined ? validated.invoiceUrl : existing.invoiceUrl,
        invoiceFileName: validated.invoiceFileName !== undefined ? validated.invoiceFileName : existing.invoiceFileName,
        invoiceFileType: validated.invoiceFileType !== undefined ? validated.invoiceFileType : existing.invoiceFileType,
        invoiceFileSize: validated.invoiceFileSize !== undefined ? validated.invoiceFileSize : existing.invoiceFileSize,
        notes: validated.notes !== undefined ? validated.notes : existing.notes,
      },
    });

    await logAuditEvent({
      userId,
      action: "PURCHASE_UPDATED",
      entity: "PURCHASE",
      entityId: id,
      metadata: { totalAmount, totalWeightKg },
    });

    return updated;
  });
}

/**
 * Deletes a purchase and clears associated inventory movements.
 */
export async function deletePurchase(id: string, userId?: string) {
  return prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.findUniqueOrThrow({
      where: { id },
      include: { items: true },
    });

    // Remove linked inventory transactions
    await tx.inventoryTransaction.deleteMany({
      where: { purchaseItemId: { in: purchase.items.map((i) => i.id) } },
    });

    // Delete linked payments
    await tx.payment.deleteMany({
      where: { purchaseId: id },
    });

    // Delete purchase items and purchase
    await tx.purchase.delete({
      where: { id },
    });

    await logAuditEvent({
      userId,
      action: "PURCHASE_DELETED",
      entity: "PURCHASE",
      entityId: id,
      metadata: { purchaseNumber: purchase.purchaseNumber },
    });

    return true;
  });
}

/**
 * Records a partial or full payment for an existing purchase.
 */
export async function recordPurchasePayment(
  purchaseId: string,
  rawPayment: RecordPurchasePaymentInput,
  userId?: string
) {
  const validated = recordPurchasePaymentSchema.parse(rawPayment);

  return prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.findUniqueOrThrow({
      where: { id: purchaseId },
    });

    const newPaidAmount = Number((purchase.paidAmount + validated.amount).toFixed(2));
    const newBalanceAmount = Number(Math.max(0, purchase.totalAmount - newPaidAmount).toFixed(2));

    const newPaymentStatus: PaymentStatus =
      newBalanceAmount <= 0 ? "PAID" : "PARTIAL";

    const paymentNumber =
      validated.referenceNumber ||
      `VCH-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;

    const payment = await tx.payment.create({
      data: {
        paymentNumber,
        paymentType: "SUPPLIER_PAYMENT",
        amount: validated.amount,
        paymentMethod: validated.paymentMethod,
        paymentDate: new Date(validated.paymentDate),
        supplierId: purchase.supplierId,
        purchaseId: purchase.id,
        referenceNumber: validated.referenceNumber,
        notes: validated.notes,
      },
    });

    await tx.purchase.update({
      where: { id: purchaseId },
      data: {
        paidAmount: newPaidAmount,
        balanceAmount: newBalanceAmount,
        paymentStatus: newPaymentStatus,
      },
    });

    // Decrement supplier balance
    await tx.supplier.update({
      where: { id: purchase.supplierId },
      data: {
        balance: {
          decrement: validated.amount,
        },
      },
    });

    await logAuditEvent({
      userId,
      action: "PURCHASE_PAYMENT_RECORDED",
      entity: "PURCHASE",
      entityId: purchaseId,
      metadata: {
        paymentNumber,
        amount: validated.amount,
        newBalance: newBalanceAmount,
      },
    });

    return payment;
  });
}

/**
 * Fetches lookup options (Suppliers and Fish Types) for the purchase entry form.
 */
export async function getSuppliersAndFishTypes(): Promise<PurchaseLookupsDTO> {
  try {
    const [suppliers, fishTypes] = await Promise.all([
      prisma.supplier.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      }),
      prisma.fishType.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      }),
    ]);

    return {
      suppliers: suppliers.map((s) => ({
        id: s.id,
        code: s.code,
        name: s.name,
        harborLocation: s.harborLocation,
        boatName: s.boatName,
        contactPerson: s.contactPerson,
        phone: s.phone,
        email: s.email,
        balance: s.balance,
        rating: s.rating,
        isActive: s.isActive,
      })),
      fishTypes: fishTypes.map((f) => ({
        id: f.id,
        code: f.code,
        name: f.name,
        scientificName: f.scientificName,
        category: f.category,
        grade: f.grade,
        description: f.description,
        imageUrl: f.imageUrl,
        isActive: f.isActive,
      })),
    };
  } catch (error) {
    console.error("Failed to fetch purchase lookups:", error);
    return {
      suppliers: [],
      fishTypes: [],
    };
  }
}

// Backward compatibility alias
export const getPurchasesList = listPurchases;

/**
 * Creates a new supplier / boat / company on the fly
 */
export async function createSupplier(data: {
  name: string;
  phone: string;
  boatName?: string;
  harborLocation?: string;
  contactPerson?: string;
  email?: string;
  taxNumber?: string;
  address?: string;
}) {
  const count = await prisma.supplier.count();
  const code = `SUP-${String(count + 1).padStart(3, "0")}-${Date.now().toString().slice(-4)}`;

  const supplier = await prisma.supplier.create({
    data: {
      code,
      name: data.name.trim(),
      phone: data.phone.trim(),
      boatName: data.boatName?.trim() || null,
      harborLocation: data.harborLocation?.trim() || null,
      contactPerson: data.contactPerson?.trim() || null,
      email: data.email?.trim() || null,
      taxNumber: data.taxNumber?.trim() || null,
      address: data.address?.trim() || null,
      balance: 0,
      rating: 5.0,
      isActive: true,
    },
  });

  return {
    id: supplier.id,
    code: supplier.code,
    name: supplier.name,
    harborLocation: supplier.harborLocation,
    boatName: supplier.boatName,
    contactPerson: supplier.contactPerson,
    phone: supplier.phone,
    email: supplier.email,
    taxNumber: supplier.taxNumber,
    address: supplier.address,
    balance: supplier.balance,
    rating: supplier.rating,
    isActive: supplier.isActive,
  };
}

/**
 * Updates spoilage / rejected quantities and reasons for items within a purchase batch.
 * Recalculates payable subtotal, total amount, balance amount, payment status, and updates supplier balance.
 */
export async function updatePurchaseSpoilage(
  purchaseId: string,
  input: UpdatePurchaseSpoilageInput,
  userId?: string
) {
  return await prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        supplier: true,
        items: true,
      },
    });

    if (!purchase) {
      throw new Error(`Purchase with ID ${purchaseId} not found`);
    }

    // Apply spoilage updates to each specified item
    for (const itemInput of input.items) {
      const existingItem = purchase.items.find((i) => i.id === itemInput.itemId);
      if (!existingItem) continue;

      const spoiledKg = Math.max(
        0,
        Math.min(existingItem.weightKg, Number(itemInput.spoiledWeightKg) || 0)
      );
      const effectiveKg = Math.max(0, existingItem.weightKg - spoiledKg);
      const newTotalCost = Number(
        (effectiveKg * existingItem.unitPricePerKg).toFixed(2)
      );

      await tx.purchaseItem.update({
        where: { id: itemInput.itemId },
        data: {
          spoiledWeightKg: spoiledKg,
          spoilageReason: itemInput.spoilageReason ? itemInput.spoilageReason.trim() : null,
          totalCost: newTotalCost,
        },
      });
    }

    // Fetch updated items to recalculate totals
    const updatedItems = await tx.purchaseItem.findMany({
      where: { purchaseId },
    });

    const newSubtotal = Number(
      updatedItems.reduce((sum, item) => sum + item.totalCost, 0).toFixed(2)
    );
    const newTotalAmount = Number(
      Math.max(
        0,
        newSubtotal +
          purchase.transportCharges +
          purchase.iceCharges +
          purchase.labourCharges
      ).toFixed(2)
    );
    const newBalanceAmount = Number(
      Math.max(0, newTotalAmount - purchase.paidAmount).toFixed(2)
    );

    let newPaymentStatus: PaymentStatus = purchase.paymentStatus as PaymentStatus;
    if (purchase.paidAmount >= newTotalAmount && newTotalAmount > 0) {
      newPaymentStatus = "PAID";
    } else if (purchase.paidAmount > 0) {
      newPaymentStatus = "PARTIAL";
    } else {
      newPaymentStatus = "UNPAID";
    }

    const deltaTotal = Number((newTotalAmount - purchase.totalAmount).toFixed(2));

    const updatedPurchase = await tx.purchase.update({
      where: { id: purchaseId },
      data: {
        subtotal: newSubtotal,
        totalAmount: newTotalAmount,
        balanceAmount: newBalanceAmount,
        paymentStatus: newPaymentStatus,
      },
      include: {
        supplier: true,
        items: {
          include: {
            fishType: true,
          },
        },
        payments: true,
      },
    });

    // Update supplier balance if financial total changed
    if (deltaTotal !== 0) {
      await tx.supplier.update({
        where: { id: purchase.supplierId },
        data: {
          balance: {
            increment: deltaTotal,
          },
        },
      });
    }

    if (userId) {
      await logAuditEvent({
        userId,
        action: "UPDATE",
        entity: "Purchase",
        entityId: purchaseId,
        metadata: {
          event: "Purchase spoilage / rejection recorded",
          purchaseNumber: purchase.purchaseNumber,
          oldTotal: purchase.totalAmount,
          newTotal: newTotalAmount,
          delta: deltaTotal,
        },
      });
    }

    return updatedPurchase;
  });
}

