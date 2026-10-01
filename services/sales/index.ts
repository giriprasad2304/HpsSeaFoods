import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";
import {
  createSaleSchema,
  updateSaleSchema,
  recordSalePaymentSchema,
} from "@/validations/sale.schema";
import type {
  SaleDTO,
  SaleDetailDTO,
  SaleFilterParams,
  CreateSaleInput,
  UpdateSaleInput,
  RecordSalePaymentInput,
  SalesLookupsDTO,
  PaymentStatus,
} from "@/types";

/**
 * Authoritative financial calculation helper for Sales.
 */
export function calculateSaleTotals<
  T extends { weightKg: number; unitPricePerKg: number }
>(
  items: T[],
  taxAmount = 0,
  discountAmount = 0,
  paidAmount = 0
) {
  const calculatedItems = items.map((item) => ({
    ...item,
    totalPrice: Number((item.weightKg * item.unitPricePerKg).toFixed(2)),
  }));

  const totalWeightKg = Number(
    items.reduce((sum, item) => sum + item.weightKg, 0).toFixed(2)
  );

  const subtotal = Number(
    calculatedItems.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)
  );

  const tax = Number((taxAmount || 0).toFixed(2));
  const discount = Number((discountAmount || 0).toFixed(2));

  const totalAmount = Number(
    Math.max(0, subtotal + tax - discount).toFixed(2)
  );
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
    taxAmount: tax,
    discountAmount: discount,
    totalAmount,
    paidAmount: paid,
    balanceAmount,
    paymentStatus,
  };
}

/**
 * Helper to calculate current available stock for a specific fish species.
 */
export async function getAvailableFishStock(
  fishTypeId: string,
  tx: { inventoryTransaction: { findMany: (args: { where: { fishTypeId: string }; select: { quantityKg: true } }) => Promise<Array<{ quantityKg: number }>> } } = prisma
): Promise<number> {
  const transactions = await tx.inventoryTransaction.findMany({
    where: { fishTypeId },
    select: { quantityKg: true },
  });
  const currentStock = transactions.reduce((sum, t) => sum + t.quantityKg, 0);
  return Number(Math.max(0, currentStock).toFixed(2));
}

/**
 * Lists sales with multi-criteria filtering.
 */
export async function listSales(
  filterOptions: SaleFilterParams | number = {}
): Promise<SaleDTO[]> {
  const filters: SaleFilterParams =
    typeof filterOptions === "number"
      ? { limit: filterOptions }
      : filterOptions;

  try {
    const where: Record<string, unknown> = {};

    if (filters.customerId && filters.customerId !== "ALL") {
      where.customerId = filters.customerId;
    }

    if (filters.paymentStatus && filters.paymentStatus !== "ALL") {
      where.paymentStatus = filters.paymentStatus;
    }

    if (filters.deliveryStatus && filters.deliveryStatus !== "ALL") {
      where.status = filters.deliveryStatus;
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
      where.saleDate = { gte: startDate, lte: endDate };
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
      where.saleDate = { gte: startDate, lte: endDate };
    }

    if (filters.invoiceNumber || filters.search) {
      const term = filters.invoiceNumber || filters.search;
      where.OR = [
        { saleNumber: { contains: term, mode: "insensitive" } },
        { customer: { name: { contains: term, mode: "insensitive" } } },
        { customer: { companyName: { contains: term, mode: "insensitive" } } },
      ];
    }

    const skip = filters.page && filters.limit ? (filters.page - 1) * filters.limit : 0;
    const take = filters.limit ?? 50;

    const sales = await prisma.sale.findMany({
      where,
      orderBy: { saleDate: "desc" },
      take,
      skip,
      include: {
        customer: true,
        items: true,
      },
    });

    return sales.map((sale) => ({
      id: sale.id,
      saleNumber: sale.saleNumber,
      customerId: sale.customerId,
      customerName: sale.customer.companyName
        ? `${sale.customer.name} (${sale.customer.companyName})`
        : sale.customer.name,
      saleDate: sale.saleDate.toISOString(),
      deliveryDate: sale.deliveryDate?.toISOString() ?? null,
      status: sale.status,
      paymentStatus: sale.paymentStatus,
      subtotal: sale.subtotal,
      taxAmount: sale.taxAmount,
      discountAmount: sale.discountAmount,
      totalAmount: sale.totalAmount,
      paidAmount: sale.paidAmount,
      balanceAmount: sale.balanceAmount,
      totalWeightKg: sale.items.reduce((sum, item) => sum + item.weightKg, 0),
      itemsCount: sale.items.length,
    }));
  } catch {
    // Dynamic fallback for offline/mock preview
    const fallbackList = getMockSalesList();
    return fallbackList.filter((s) => {
      if (filters.customerId && filters.customerId !== "ALL" && s.customerId !== filters.customerId)
        return false;
      if (filters.paymentStatus && filters.paymentStatus !== "ALL" && s.paymentStatus !== filters.paymentStatus)
        return false;
      if (filters.deliveryStatus && filters.deliveryStatus !== "ALL" && s.status !== filters.deliveryStatus)
        return false;
      if (filters.date && !s.saleDate.startsWith(filters.date))
        return false;
      if (filters.month && filters.month !== "ALL" && new Date(s.saleDate).getMonth() + 1 !== parseInt(filters.month, 10))
        return false;
      if (filters.year && filters.year !== "ALL" && new Date(s.saleDate).getFullYear() !== parseInt(filters.year, 10))
        return false;
      if (filters.invoiceNumber && !s.saleNumber.toLowerCase().includes(filters.invoiceNumber.toLowerCase()))
        return false;
      if (
        filters.search &&
        !s.saleNumber.toLowerCase().includes(filters.search.toLowerCase()) &&
        !s.customerName.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      return true;
    });
  }
}

/**
 * Counts total sales matching filter criteria for pagination
 */
export async function countSales(
  filterOptions: SaleFilterParams | number = {}
): Promise<number> {
  const filters: SaleFilterParams =
    typeof filterOptions === "number"
      ? { limit: filterOptions }
      : filterOptions;

  try {
    const where: Record<string, unknown> = {};

    if (filters.customerId && filters.customerId !== "ALL") {
      where.customerId = filters.customerId;
    }

    if (filters.paymentStatus && filters.paymentStatus !== "ALL") {
      where.paymentStatus = filters.paymentStatus;
    }

    if (filters.deliveryStatus && filters.deliveryStatus !== "ALL") {
      where.status = filters.deliveryStatus;
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
      where.saleDate = { gte: startDate, lte: endDate };
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
      where.saleDate = { gte: startDate, lte: endDate };
    }

    if (filters.invoiceNumber || filters.search) {
      const term = filters.invoiceNumber || filters.search;
      where.OR = [
        { saleNumber: { contains: term, mode: "insensitive" } },
        { customer: { name: { contains: term, mode: "insensitive" } } },
        { customer: { companyName: { contains: term, mode: "insensitive" } } },
      ];
    }

    return await prisma.sale.count({ where });
  } catch {
    return 0;
  }
}


/**
 * Retrieves a single sale by ID with full customer, items, and payments.
 */
export async function getSaleById(id: string): Promise<SaleDetailDTO | null> {
  try {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        customer: true,
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

    if (!sale) {
      return getMockSaleDetail(id);
    }

    return {
      id: sale.id,
      saleNumber: sale.saleNumber,
      customerId: sale.customerId,
      customerName: sale.customer.name,
      customerCompany: sale.customer.companyName,
      customerPhone: sale.customer.phone,
      customerEmail: sale.customer.email,
      customerAddress: sale.customer.deliveryAddress,
      saleDate: sale.saleDate.toISOString(),
      deliveryDate: sale.deliveryDate?.toISOString() ?? null,
      status: sale.status,
      subtotal: sale.subtotal,
      taxAmount: sale.taxAmount,
      discountAmount: sale.discountAmount,
      totalAmount: sale.totalAmount,
      paidAmount: sale.paidAmount,
      balanceAmount: sale.balanceAmount,
      paymentStatus: sale.paymentStatus,
      totalWeightKg: sale.items.reduce((sum, item) => sum + item.weightKg, 0),
      notes: sale.notes,
      createdAt: sale.createdAt.toISOString(),
      updatedAt: sale.updatedAt.toISOString(),
      items: sale.items.map((item) => ({
        id: item.id,
        saleId: item.saleId,
        fishTypeId: item.fishTypeId,
        fishTypeName: item.fishType.name,
        fishTypeCode: item.fishType.code,
        grade: item.grade,
        weightKg: item.weightKg,
        unitPricePerKg: item.unitPricePerKg,
        totalPrice: item.totalPrice,
        notes: item.notes,
        createdAt: item.createdAt.toISOString(),
      })),
      payments: sale.payments.map((p) => ({
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
    return getMockSaleDetail(id);
  }
}

/**
 * Creates a sale order, enforces stock availability, and logs negative inventory transaction.
 */
export async function createSale(
  rawInput: CreateSaleInput,
  userId?: string
) {
  const validated = createSaleSchema.parse(rawInput);

  const {
    calculatedItems,
    totalWeightKg,
    subtotal,
    taxAmount,
    discountAmount,
    totalAmount,
    paidAmount,
    balanceAmount,
    paymentStatus,
  } = calculateSaleTotals(
    validated.items,
    validated.taxAmount,
    validated.discountAmount,
    validated.initialPaidAmount
  );

  const saleNumber =
    validated.saleNumber ||
    `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;

  return prisma.$transaction(async (tx) => {
    // 1. Stock verification: Ensure enough stock exists for each fish item
    for (const item of calculatedItems) {
      const availableStock = await getAvailableFishStock(item.fishTypeId, tx);
      if (availableStock < item.weightKg) {
        const fishType = await tx.fishType.findUnique({
          where: { id: item.fishTypeId },
        });
        const fishLabel = fishType ? `${fishType.name} (${fishType.code})` : item.fishTypeId;
        throw new Error(
          `Insufficient inventory for ${fishLabel}. Available: ${availableStock} kg, Requested: ${item.weightKg} kg.`
        );
      }
    }

    // 2. Create Sale Header
    const sale = await tx.sale.create({
      data: {
        saleNumber,
        customerId: validated.customerId,
        saleDate: new Date(validated.saleDate),
        deliveryDate: validated.deliveryDate ? new Date(validated.deliveryDate) : null,
        status: validated.status ?? "CONFIRMED",
        paymentStatus,
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount,
        paidAmount,
        balanceAmount,
        notes: validated.notes,
      },
    });

    // 3. Create Sale Items and corresponding Negative Inventory Transactions (-Quantity kg)
    for (const item of calculatedItems) {
      const saleItem = await tx.saleItem.create({
        data: {
          saleId: sale.id,
          fishTypeId: item.fishTypeId,
          grade: item.grade || "Grade A",
          weightKg: item.weightKg,
          unitPricePerKg: item.unitPricePerKg,
          totalPrice: item.totalPrice,
          notes: item.notes,
        },
      });

      // Negative inventory transaction representing outward sales dispatch
      await tx.inventoryTransaction.create({
        data: {
          fishTypeId: item.fishTypeId,
          transactionType: "SALE_OUTWARD",
          quantityKg: -Math.abs(item.weightKg), // Negative stock movement
          unitCost: item.unitPricePerKg,
          saleItemId: saleItem.id,
          batchLotNumber: `LOT-SALE-${saleNumber}-${item.fishTypeId.slice(-4)}`,
          storageLocation: "Dispatched Cold Logistics",
          notes: `Sales fulfillment dispatch for order ${saleNumber}`,
        },
      });
    }

    // 4. Record initial payment receipt if paidAmount > 0
    if (paidAmount > 0) {
      const paymentNumber = `RCP-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
      await tx.payment.create({
        data: {
          paymentNumber,
          paymentType: "CUSTOMER_RECEIPT",
          amount: paidAmount,
          paymentMethod: validated.paymentMethod || "BANK_TRANSFER",
          paymentDate: new Date(validated.saleDate),
          customerId: validated.customerId,
          saleId: sale.id,
          notes: `Initial customer receipt for ${saleNumber}`,
        },
      });
    }

    // 5. Update Customer outstanding balance
    await tx.customer.update({
      where: { id: validated.customerId },
      data: {
        outstandingBalance: {
          increment: balanceAmount,
        },
      },
    });

    // 6. Audit log
    await logAuditEvent({
      userId,
      action: "SALE_CREATED",
      entity: "SALE",
      entityId: sale.id,
      metadata: {
        saleNumber,
        totalAmount,
        totalWeightKg,
        itemsCount: calculatedItems.length,
      },
    });

    return sale;
  });
}

/**
 * Updates an existing sale order and recalibrates inventory transactions.
 */
export async function updateSale(
  id: string,
  rawInput: UpdateSaleInput,
  userId?: string
) {
  const validated = updateSaleSchema.parse(rawInput);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.sale.findUniqueOrThrow({
      where: { id },
      include: { items: true },
    });

    let subtotal = existing.subtotal;
    let taxAmount = validated.taxAmount ?? existing.taxAmount;
    let discountAmount = validated.discountAmount ?? existing.discountAmount;
    let totalAmount = existing.totalAmount;
    let balanceAmount = existing.balanceAmount;
    let paymentStatus = existing.paymentStatus;

    if (validated.items && validated.items.length > 0) {
      const totals = calculateSaleTotals(
        validated.items,
        taxAmount,
        discountAmount,
        existing.paidAmount
      );
      subtotal = totals.subtotal;
      taxAmount = totals.taxAmount;
      discountAmount = totals.discountAmount;
      totalAmount = totals.totalAmount;
      balanceAmount = totals.balanceAmount;
      paymentStatus = totals.paymentStatus;

      // Clean up previous sale inventory transactions and items
      await tx.inventoryTransaction.deleteMany({
        where: { saleItemId: { in: existing.items.map((i) => i.id) } },
      });
      await tx.saleItem.deleteMany({
        where: { saleId: id },
      });

      // Recreate updated items & negative inventory transactions
      for (const item of totals.calculatedItems) {
        const saleItem = await tx.saleItem.create({
          data: {
            saleId: id,
            fishTypeId: item.fishTypeId,
            grade: item.grade || "Grade A",
            weightKg: item.weightKg,
            unitPricePerKg: item.unitPricePerKg,
            totalPrice: item.totalPrice,
            notes: item.notes,
          },
        });

        await tx.inventoryTransaction.create({
          data: {
            fishTypeId: item.fishTypeId,
            transactionType: "SALE_OUTWARD",
            quantityKg: -Math.abs(item.weightKg),
            unitCost: item.unitPricePerKg,
            saleItemId: saleItem.id,
            batchLotNumber: `LOT-SALE-${existing.saleNumber}-${item.fishTypeId.slice(-4)}`,
            storageLocation: "Dispatched Cold Logistics",
            notes: `Updated sales fulfillment for ${existing.saleNumber}`,
          },
        });
      }
    }

    const updated = await tx.sale.update({
      where: { id },
      data: {
        customerId: validated.customerId ?? existing.customerId,
        saleDate: validated.saleDate ? new Date(validated.saleDate) : existing.saleDate,
        deliveryDate: validated.deliveryDate !== undefined ? (validated.deliveryDate ? new Date(validated.deliveryDate) : null) : existing.deliveryDate,
        status: validated.status ?? existing.status,
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount,
        balanceAmount,
        paymentStatus,
        notes: validated.notes !== undefined ? validated.notes : existing.notes,
      },
    });

    await logAuditEvent({
      userId,
      action: "SALE_UPDATED",
      entity: "SALE",
      entityId: id,
      metadata: { totalAmount, status: updated.status },
    });

    return updated;
  });
}

/**
 * Deletes a sale order, rolls back negative inventory transactions, and removes payments.
 */
export async function deleteSale(id: string, userId?: string) {
  return prisma.$transaction(async (tx) => {
    const sale = await tx.sale.findUniqueOrThrow({
      where: { id },
      include: { items: true },
    });

    // Delete linked inventory transactions
    await tx.inventoryTransaction.deleteMany({
      where: { saleItemId: { in: sale.items.map((i) => i.id) } },
    });

    // Delete linked payments
    await tx.payment.deleteMany({
      where: { saleId: id },
    });

    // Delete sale items and sale record
    await tx.sale.delete({
      where: { id },
    });

    // Adjust customer balance
    await tx.customer.update({
      where: { id: sale.customerId },
      data: {
        outstandingBalance: {
          decrement: sale.balanceAmount,
        },
      },
    });

    await logAuditEvent({
      userId,
      action: "SALE_DELETED",
      entity: "SALE",
      entityId: id,
      metadata: { saleNumber: sale.saleNumber },
    });

    return true;
  });
}

/**
 * Records a customer receipt payment against a sale.
 */
export async function recordSalePayment(
  saleId: string,
  rawPayment: RecordSalePaymentInput,
  userId?: string
) {
  const validated = recordSalePaymentSchema.parse(rawPayment);

  return prisma.$transaction(async (tx) => {
    const sale = await tx.sale.findUniqueOrThrow({
      where: { id: saleId },
    });

    const newPaidAmount = Number((sale.paidAmount + validated.amount).toFixed(2));
    const newBalanceAmount = Number(
      Math.max(0, sale.totalAmount - newPaidAmount).toFixed(2)
    );
    const newPaymentStatus: PaymentStatus =
      newBalanceAmount <= 0 ? "PAID" : "PARTIAL";

    const paymentNumber =
      validated.referenceNumber ||
      `RCP-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;

    const payment = await tx.payment.create({
      data: {
        paymentNumber,
        paymentType: "CUSTOMER_RECEIPT",
        amount: validated.amount,
        paymentMethod: validated.paymentMethod,
        paymentDate: new Date(validated.paymentDate),
        customerId: sale.customerId,
        saleId: sale.id,
        referenceNumber: validated.referenceNumber,
        notes: validated.notes,
      },
    });

    await tx.sale.update({
      where: { id: saleId },
      data: {
        paidAmount: newPaidAmount,
        balanceAmount: newBalanceAmount,
        paymentStatus: newPaymentStatus,
      },
    });

    // Decrement customer outstanding balance
    await tx.customer.update({
      where: { id: sale.customerId },
      data: {
        outstandingBalance: {
          decrement: validated.amount,
        },
      },
    });

    await logAuditEvent({
      userId,
      action: "SALE_PAYMENT_RECORDED",
      entity: "SALE",
      entityId: saleId,
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
 * Fetches lookup data for the sales entry form (Customers and Fish species with live inventory stock).
 */
export async function getCustomersAndFishTypes(): Promise<SalesLookupsDTO> {
  try {
    const [customers, fishTypes] = await Promise.all([
      prisma.customer.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      }),
      prisma.fishType.findMany({
        where: { isActive: true },
        include: {
          inventoryTransactions: true,
        },
        orderBy: { name: "asc" },
      }),
    ]);

    return {
      customers: customers.map((c) => ({
        id: c.id,
        code: c.code,
        name: c.name,
        companyName: c.companyName,
        customerType: c.customerType,
        phone: c.phone,
        email: c.email,
        deliveryAddress: c.deliveryAddress,
        outstandingBalance: c.outstandingBalance,
        creditLimit: c.creditLimit,
        isActive: c.isActive,
      })),
      fishTypes: fishTypes.map((f) => {
        const availableStockKg = f.inventoryTransactions.reduce(
          (sum, t) => sum + t.quantityKg,
          0
        );
        return {
          id: f.id,
          code: f.code,
          name: f.name,
          scientificName: f.scientificName,
          category: f.category,
          grade: f.grade,
          description: f.description,
          imageUrl: f.imageUrl,
          isActive: f.isActive,
          availableStockKg: Number(Math.max(0, availableStockKg).toFixed(2)),
        };
      }),
    };
  } catch {
    return {
      customers: [
        {
          id: "cust-1",
          code: "CUST-001",
          name: "Pacific Ocean Harvesters Ltd",
          companyName: "Pacific Ocean Harvesters Ltd",
          customerType: "Wholesale Export",
          phone: "+971 4 391 2000",
          email: "procurement@pacificharvest.ae",
          deliveryAddress: "Dubai Cargo Village, Gate 4",
          outstandingBalance: 8450.0,
          creditLimit: 100000.0,
          isActive: true,
        },
        {
          id: "cust-2",
          code: "CUST-002",
          name: "Marina Bay Seafood Distributors",
          companyName: "Marina Bay Seafood Distributors",
          customerType: "Regional Wholesale",
          phone: "+91 94471 88990",
          email: "orders@marinabay.in",
          deliveryAddress: "Plot 14, Willingdon Island, Cochin",
          outstandingBalance: 0.0,
          creditLimit: 50000.0,
          isActive: true,
        },
        {
          id: "cust-3",
          code: "CUST-003",
          name: "Golden Coral Export Corp",
          companyName: "Golden Coral Export Corp",
          customerType: "Overseas Client",
          phone: "+65 6789 0123",
          email: "trade@goldencoral.sg",
          deliveryAddress: "Jurong Port Logistics Complex",
          outstandingBalance: 12500.0,
          creditLimit: 150000.0,
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
          availableStockKg: 3450.0,
          isActive: true,
        },
        {
          id: "ft-2",
          code: "KGF-002",
          name: "Kingfish / Seer (Scomberomorus commerson)",
          category: "Coastal Prime",
          grade: "Grade A",
          availableStockKg: 820.0,
          isActive: true,
        },
        {
          id: "ft-3",
          code: "PMF-003",
          name: "Silver Pomfret (Pampus argenteus)",
          category: "Demersal White",
          grade: "Grade A Export",
          availableStockKg: 2400.0,
          isActive: true,
        },
        {
          id: "ft-4",
          code: "RSP-004",
          name: "Red Snapper (Lutjanus campechanus)",
          category: "Reef Fish",
          grade: "Grade A",
          availableStockKg: 1100.0,
          isActive: true,
        },
      ],
    };
  }
}

// Mock Sales list helper
function getMockSalesList(): SaleDTO[] {
  return [
    {
      id: "sale-1",
      saleNumber: "INV-2026-0089",
      customerId: "cust-1",
      customerName: "Pacific Ocean Harvesters Ltd",
      saleDate: new Date().toISOString(),
      deliveryDate: new Date(Date.now() + 86400000).toISOString(),
      status: "CONFIRMED",
      paymentStatus: "PARTIAL",
      subtotal: 18450.0,
      taxAmount: 0.0,
      discountAmount: 0.0,
      totalAmount: 18450.0,
      paidAmount: 10000.0,
      balanceAmount: 8450.0,
      totalWeightKg: 1250.0,
      itemsCount: 2,
    },
    {
      id: "sale-2",
      saleNumber: "INV-2026-0088",
      customerId: "cust-2",
      customerName: "Marina Bay Seafood Distributors",
      saleDate: new Date(Date.now() - 86400000).toISOString(),
      deliveryDate: new Date().toISOString(),
      status: "SHIPPED",
      paymentStatus: "PAID",
      subtotal: 29800.0,
      taxAmount: 0.0,
      discountAmount: 0.0,
      totalAmount: 29800.0,
      paidAmount: 29800.0,
      balanceAmount: 0.0,
      totalWeightKg: 2100.0,
      itemsCount: 2,
    },
    {
      id: "sale-3",
      saleNumber: "INV-2026-0087",
      customerId: "cust-3",
      customerName: "Golden Coral Export Corp",
      saleDate: new Date(Date.now() - 172800000).toISOString(),
      deliveryDate: new Date(Date.now() - 86400000).toISOString(),
      status: "DELIVERED",
      paymentStatus: "PAID",
      subtotal: 42150.0,
      taxAmount: 0.0,
      discountAmount: 0.0,
      totalAmount: 42150.0,
      paidAmount: 42150.0,
      balanceAmount: 0.0,
      totalWeightKg: 3400.0,
      itemsCount: 3,
    },
  ];
}

function getMockSaleDetail(id: string): SaleDetailDTO | null {
  const mock = getMockSalesList().find((s) => s.id === id);
  if (!mock) return null;

  return {
    ...mock,
    customerCompany: "Pacific Ocean Harvesters Ltd",
    customerPhone: "+971 4 391 2000",
    customerEmail: "procurement@pacificharvest.ae",
    customerAddress: "Dubai Cargo Village, Gate 4",
    createdAt: mock.saleDate,
    updatedAt: mock.saleDate,
    items: [
      {
        id: "sitem-1",
        saleId: mock.id,
        fishTypeId: "ft-1",
        fishTypeName: "Yellowfin Tuna (Thunnus albacares)",
        fishTypeCode: "YFT-001",
        grade: "Grade AAA Export",
        weightKg: 850,
        unitPricePerKg: 14.5,
        totalPrice: 12325,
        notes: "Chilled export cut",
        createdAt: mock.saleDate,
      },
      {
        id: "sitem-2",
        saleId: mock.id,
        fishTypeId: "ft-2",
        fishTypeName: "Kingfish / Seer (Scomberomorus commerson)",
        fishTypeCode: "KGF-002",
        grade: "Grade A",
        weightKg: 400,
        unitPricePerKg: 15.3125,
        totalPrice: 6125,
        notes: "Cleaned and iced",
        createdAt: mock.saleDate,
      },
    ],
    payments: [
      {
        id: "pay-1",
        paymentNumber: "RCP-2026-0045",
        amount: mock.paidAmount,
        paymentMethod: "BANK_TRANSFER",
        paymentDate: mock.saleDate,
        referenceNumber: "SWIFT-DXB-88392",
        notes: "Export order advance payment",
      },
    ],
  };
}

// Backward compatibility alias
export const getSalesList = listSales;
