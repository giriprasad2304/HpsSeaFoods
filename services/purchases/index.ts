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
  } catch {
    // Dynamic fallback for dev preview
    const fallbackList = getMockPurchasesList();
    return fallbackList.filter((b) => {
      if (filters.supplierId && filters.supplierId !== "ALL" && b.supplierId !== filters.supplierId) return false;
      if (filters.paymentStatus && filters.paymentStatus !== "ALL" && b.paymentStatus !== filters.paymentStatus) return false;
      if (filters.date && !b.purchaseDate.startsWith(filters.date)) return false;
      if (filters.month && filters.month !== "ALL" && new Date(b.purchaseDate).getMonth() + 1 !== parseInt(filters.month, 10)) return false;
      if (filters.year && filters.year !== "ALL" && new Date(b.purchaseDate).getFullYear() !== parseInt(filters.year, 10)) return false;
      if (filters.invoiceNumber && !b.purchaseNumber.toLowerCase().includes(filters.invoiceNumber.toLowerCase())) return false;
      if (filters.search && !b.purchaseNumber.toLowerCase().includes(filters.search.toLowerCase()) && !b.supplierName.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
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
      const mock = getMockPurchasesList().find((p) => p.id === id);
      if (mock) {
        return {
          ...mock,
          supplierPhone: "+91 98470 11223",
          supplierBoatName: "St. Peter Trawler #4",
          createdAt: mock.purchaseDate,
          updatedAt: mock.purchaseDate,
          items: [
            {
              id: "item-1",
              purchaseId: mock.id,
              fishTypeId: "ft-1",
              fishTypeName: "Yellowfin Tuna (Thunnus albacares)",
              fishTypeCode: "YFT-001",
              grade: "Grade AAA Export",
              weightKg: 2500,
              unitPricePerKg: 7.5,
              totalCost: 18750,
              temperatureC: -1.5,
              notes: "Pristine ocean-chilled grade",
              createdAt: mock.purchaseDate,
            },
            {
              id: "item-2",
              purchaseId: mock.id,
              fishTypeId: "ft-2",
              fishTypeName: "Kingfish / Seer (Scomberomorus commerson)",
              fishTypeCode: "KGF-002",
              grade: "Grade A",
              weightKg: 2000,
              unitPricePerKg: 6.0,
              totalCost: 12000,
              temperatureC: -0.8,
              notes: "Whole round",
              createdAt: mock.purchaseDate,
            },
          ],
          payments: [
            {
              id: "pay-1",
              paymentNumber: "VCH-2026-0089",
              amount: mock.paidAmount,
              paymentMethod: mock.paymentMethod,
              paymentDate: mock.purchaseDate,
              referenceNumber: "NEFT-SBI-991203",
              notes: "Initial harbor bank transfer",
            },
          ],
        };
      }
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
  } catch {
    const mock = getMockPurchasesList().find((p) => p.id === id);
    if (mock) {
      return {
        ...mock,
        supplierPhone: "+91 98470 11223",
        supplierBoatName: "St. Peter Trawler #4",
        createdAt: mock.purchaseDate,
        updatedAt: mock.purchaseDate,
        items: [
          {
            id: "item-1",
            purchaseId: mock.id,
            fishTypeId: "ft-1",
            fishTypeName: "Yellowfin Tuna (Thunnus albacares)",
            fishTypeCode: "YFT-001",
            grade: "Grade AAA Export",
            weightKg: 2500,
            unitPricePerKg: 7.5,
            totalCost: 18750,
            temperatureC: -1.5,
            notes: "Pristine ocean-chilled grade",
            createdAt: mock.purchaseDate,
          },
          {
            id: "item-2",
            purchaseId: mock.id,
            fishTypeId: "ft-2",
            fishTypeName: "Kingfish / Seer (Scomberomorus commerson)",
            fishTypeCode: "KGF-002",
            grade: "Grade A",
            weightKg: 2000,
            unitPricePerKg: 6.0,
            totalCost: 12000,
            temperatureC: -0.8,
            notes: "Whole round",
            createdAt: mock.purchaseDate,
          },
        ],
        payments: [
          {
            id: "pay-1",
            paymentNumber: "VCH-2026-0089",
            amount: mock.paidAmount,
            paymentMethod: mock.paymentMethod,
            paymentDate: mock.purchaseDate,
            referenceNumber: "NEFT-SBI-991203",
            notes: "Initial harbor bank transfer",
          },
        ],
      };
    }
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
  } catch {
    return {
      suppliers: [
        {
          id: "sup-1",
          code: "SUP-001",
          name: "St. Peter Deep Sea Trawlers",
          boatName: "St. Peter IV",
          harborLocation: "Cochin Fisheries Harbour",
          phone: "+91 98470 11223",
          email: "peter.trawlers@oceanic.in",
          balance: 8450.0,
          rating: 4.9,
          isActive: true,
        },
        {
          id: "sup-2",
          code: "SUP-002",
          name: "Blue Ocean Longliners Co.",
          boatName: "Blue Wave IX",
          harborLocation: "Munambam Harbor",
          phone: "+91 94460 22334",
          email: "blueocean@gmail.com",
          balance: 0.0,
          rating: 4.8,
          isActive: true,
        },
        {
          id: "sup-3",
          code: "SUP-003",
          name: "Mangalore Coastal Fishermen Union",
          boatName: "Matsya Vahini 02",
          harborLocation: "Old Port Dock 3",
          phone: "+91 824 241908",
          email: "mcfu.mangalore@gov.in",
          balance: 14200.0,
          rating: 4.7,
          isActive: true,
        },
      ],
      fishTypes: [
        {
          id: "ft-1",
          code: "YFT-001",
          name: "Yellowfin Tuna (Thunnus albacares)",
          category: "Pelagic Export",
          grade: "Grade AAA Export",
          isActive: true,
        },
        {
          id: "ft-2",
          code: "KGF-002",
          name: "Kingfish / Seer (Scomberomorus commerson)",
          category: "Coastal Prime",
          grade: "Grade A",
          isActive: true,
        },
        {
          id: "ft-3",
          code: "PMF-003",
          name: "Silver Pomfret (Pampus argenteus)",
          category: "Demersal White",
          grade: "Grade A Export",
          isActive: true,
        },
        {
          id: "ft-4",
          code: "RSP-004",
          name: "Red Snapper (Lutjanus campechanus)",
          category: "Reef Fish",
          grade: "Grade A",
          isActive: true,
        },
        {
          id: "ft-5",
          code: "MKR-005",
          name: "Indian Mackerel (Rastrelliger kanagurta)",
          category: "Pelagic Small",
          grade: "Grade B",
          isActive: true,
        },
      ],
    };
  }
}

// Mock purchases helper
function getMockPurchasesList(): PurchaseDTO[] {
  return [
    {
      id: "batch-1",
      purchaseNumber: "PB-2026-0142",
      supplierId: "sup-1",
      supplierName: "St. Peter Deep Sea Trawlers",
      purchaseDate: new Date().toISOString(),
      status: "COMPLETED",
      totalWeightKg: 4500.0,
      subtotal: 30750.0,
      transportCharges: 350.0,
      iceCharges: 250.0,
      labourCharges: 150.0,
      totalAmount: 31500.0,
      paidAmount: 31500.0,
      balanceAmount: 0.0,
      paymentStatus: "PAID",
      paymentMethod: "BANK_TRANSFER",
      landingHarbor: "Cochin Fisheries Harbour",
      truckNumber: "KL-07-CD-8921",
      invoiceUrl: "https://res.cloudinary.com/placeholder/doc1.pdf",
      itemsCount: 2,
    },
    {
      id: "batch-2",
      purchaseNumber: "PB-2026-0141",
      supplierId: "sup-2",
      supplierName: "Blue Ocean Longliners Co.",
      purchaseDate: new Date(Date.now() - 86400000).toISOString(),
      status: "INSPECTED",
      totalWeightKg: 2800.0,
      subtotal: 21800.0,
      transportCharges: 300.0,
      iceCharges: 200.0,
      labourCharges: 100.0,
      totalAmount: 22400.0,
      paidAmount: 15000.0,
      balanceAmount: 7400.0,
      paymentStatus: "PARTIAL",
      paymentMethod: "BANK_TRANSFER",
      landingHarbor: "Munambam Harbor",
      truckNumber: "KL-07-AZ-1102",
      invoiceUrl: null,
      itemsCount: 2,
    },
    {
      id: "batch-3",
      purchaseNumber: "PB-2026-0140",
      supplierId: "sup-3",
      supplierName: "Mangalore Coastal Fishermen Union",
      purchaseDate: new Date(Date.now() - 172800000).toISOString(),
      status: "RECEIVED",
      totalWeightKg: 6200.0,
      subtotal: 39500.0,
      transportCharges: 450.0,
      iceCharges: 200.0,
      labourCharges: 150.0,
      totalAmount: 40300.0,
      paidAmount: 0.0,
      balanceAmount: 40300.0,
      paymentStatus: "UNPAID",
      paymentMethod: "CHEQUE",
      landingHarbor: "Old Port Dock 3",
      truckNumber: "KA-19-M-9043",
      invoiceUrl: null,
      itemsCount: 3,
    },
  ];
}

// Backward compatibility alias
export const getPurchasesList = listPurchases;
