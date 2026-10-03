import { prisma } from "@/lib/prisma";
import type {
  PartyLedgerDTO,
  PartyTransactionDTO,
  PartyPaymentRecordDTO,
  FishSpeciesVolumeDTO,
  CostBreakdownDTO,
  FishItemDTO,
} from "@/types/party-ledger";

export async function getSupplierLedger(supplierId: string): Promise<PartyLedgerDTO | null> {
  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId },
    include: {
      purchases: {
        where: { status: { notIn: ["CANCELLED"] } },
        include: {
          items: {
            include: {
              fishType: true,
            },
          },
          payments: true,
        },
        orderBy: { purchaseDate: "desc" },
      },
      payments: {
        orderBy: { paymentDate: "desc" },
        include: {
          purchase: {
            select: { purchaseNumber: true },
          },
        },
      },
    },
  });

  if (!supplier) {
    return null;
  }

  let totalWeightKg = 0;
  let totalBilledAmount = 0;
  let totalPaidAmount = 0;
  let totalOutstandingAmount = 0;

  const costBreakdown: CostBreakdownDTO = {
    rawFishCost: 0,
    iceCost: 0,
    transportCost: 0,
    labourCost: 0,
    packingCost: 0,
    thermocolBoxCost: 0,
    oxygenCost: 0,
    taxAmount: 0,
    discountAmount: 0,
    otherCost: 0,
    totalCost: 0,
  };

  const speciesMap = new Map<string, {
    fishName: string;
    fishCode: string;
    category: string;
    totalWeightKg: number;
    totalAmount: number;
    transactionCount: number;
  }>();

  const transactions: PartyTransactionDTO[] = supplier.purchases.map((p) => {
    const rawFishCost = p.subtotal || p.items.reduce((s, it) => s + it.totalCost, 0);
    const iceCost = p.iceCharges || 0;
    const transportCost = p.transportCharges || 0;
    const labourCost = p.labourCharges || 0;
    const totalCost = p.totalAmount;

    costBreakdown.rawFishCost += rawFishCost;
    costBreakdown.iceCost += iceCost;
    costBreakdown.transportCost += transportCost;
    costBreakdown.labourCost += labourCost;
    costBreakdown.totalCost += totalCost;

    totalWeightKg += p.totalWeightKg;
    totalBilledAmount += p.totalAmount;
    totalPaidAmount += p.paidAmount;
    totalOutstandingAmount += p.balanceAmount;

    const items: FishItemDTO[] = p.items.map((it) => {
      const spKey = it.fishTypeId;
      const existing = speciesMap.get(spKey) || {
        fishName: it.fishType.name,
        fishCode: it.fishType.code,
        category: it.fishType.category,
        totalWeightKg: 0,
        totalAmount: 0,
        transactionCount: 0,
      };
      existing.totalWeightKg += it.weightKg;
      existing.totalAmount += it.totalCost;
      existing.transactionCount += 1;
      speciesMap.set(spKey, existing);

      return {
        fishTypeId: it.fishTypeId,
        fishName: it.fishType.name,
        fishCode: it.fishType.code,
        category: it.fishType.category,
        grade: it.grade,
        weightKg: it.weightKg,
        unitPricePerKg: it.unitPricePerKg,
        totalCost: it.totalCost,
        fishCount: it.fishCount,
        notes: it.notes,
      };
    });

    const txCosts: CostBreakdownDTO = {
      rawFishCost,
      iceCost,
      transportCost,
      labourCost,
      packingCost: 0,
      thermocolBoxCost: 0,
      oxygenCost: 0,
      taxAmount: 0,
      discountAmount: 0,
      otherCost: 0,
      totalCost,
    };

    return {
      id: p.id,
      transactionNumber: p.purchaseNumber,
      date: p.purchaseDate.toISOString(),
      type: "PURCHASE",
      status: p.status,
      totalWeightKg: p.totalWeightKg,
      costs: txCosts,
      totalAmount: p.totalAmount,
      paidAmount: p.paidAmount,
      balanceAmount: p.balanceAmount,
      paymentStatus: p.paymentStatus,
      paymentMethod: p.paymentMethod,
      items,
      notes: p.notes,
      metadata: {
        harborLocation: p.landingHarbor || supplier.harborLocation,
        boatName: supplier.boatName,
        truckNumber: p.truckNumber,
      },
    };
  });

  const payments: PartyPaymentRecordDTO[] = supplier.payments.map((pm) => ({
    id: pm.id,
    paymentNumber: pm.paymentNumber,
    paymentDate: pm.paymentDate.toISOString(),
    amount: pm.amount,
    paymentMethod: pm.paymentMethod,
    referenceNumber: pm.referenceNumber,
    relatedTransactionNumber: pm.purchase?.purchaseNumber || null,
    notes: pm.notes,
  }));

  const speciesBreakdown: FishSpeciesVolumeDTO[] = Array.from(speciesMap.values()).map((sp) => ({
    fishName: sp.fishName,
    fishCode: sp.fishCode,
    category: sp.category,
    totalWeightKg: Number(sp.totalWeightKg.toFixed(2)),
    totalAmount: Number(sp.totalAmount.toFixed(2)),
    averageRatePerKg: sp.totalWeightKg > 0 ? Number((sp.totalAmount / sp.totalWeightKg).toFixed(2)) : 0,
    transactionCount: sp.transactionCount,
  })).sort((a, b) => b.totalAmount - a.totalAmount);

  return {
    partyType: "SUPPLIER",
    party: {
      id: supplier.id,
      code: supplier.code,
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
      boatName: supplier.boatName,
      harborLocation: supplier.harborLocation,
      rating: supplier.rating,
      isActive: supplier.isActive,
    },
    financialSummary: {
      totalTransactionsCount: transactions.length,
      totalWeightKg: Number(totalWeightKg.toFixed(2)),
      totalBilledAmount: Number(totalBilledAmount.toFixed(2)),
      totalPaidAmount: Number(totalPaidAmount.toFixed(2)),
      totalOutstandingAmount: Number(totalOutstandingAmount.toFixed(2)),
      costBreakdown: {
        rawFishCost: Number(costBreakdown.rawFishCost.toFixed(2)),
        iceCost: Number(costBreakdown.iceCost.toFixed(2)),
        transportCost: Number(costBreakdown.transportCost.toFixed(2)),
        labourCost: Number(costBreakdown.labourCost.toFixed(2)),
        packingCost: 0,
        thermocolBoxCost: 0,
        oxygenCost: 0,
        taxAmount: 0,
        discountAmount: 0,
        otherCost: 0,
        totalCost: Number(costBreakdown.totalCost.toFixed(2)),
      },
    },
    transactions,
    payments,
    speciesBreakdown,
    generatedAt: new Date().toISOString(),
  };
}

export async function getCustomerLedger(customerId: string): Promise<PartyLedgerDTO | null> {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      sales: {
        where: { status: { notIn: ["CANCELLED"] } },
        include: {
          items: {
            include: {
              fishType: true,
            },
          },
          packingCosts: true,
          expenses: {
            include: {
              category: true,
            },
            orderBy: { expenseDate: "desc" },
          },
          payments: true,
          invoice: true,
        },
        orderBy: { saleDate: "desc" },
      },
      payments: {
        orderBy: { paymentDate: "desc" },
        include: {
          sale: {
            select: { saleNumber: true },
          },
        },
      },
    },
  });

  if (!customer) {
    return null;
  }

  let totalWeightKg = 0;
  let totalBilledAmount = 0;
  let totalPaidAmount = 0;
  let totalOutstandingAmount = 0;

  const costBreakdown: CostBreakdownDTO = {
    rawFishCost: 0,
    iceCost: 0,
    transportCost: 0,
    labourCost: 0,
    packingCost: 0,
    thermocolBoxCost: 0,
    oxygenCost: 0,
    taxAmount: 0,
    discountAmount: 0,
    otherCost: 0,
    totalCost: 0,
  };

  const speciesMap = new Map<string, {
    fishName: string;
    fishCode: string;
    category: string;
    totalWeightKg: number;
    totalAmount: number;
    transactionCount: number;
  }>();

  const transactions: PartyTransactionDTO[] = customer.sales.map((s) => {
    const rawFishCost = s.subtotal || s.items.reduce((sum, it) => sum + it.totalPrice, 0);
    const saleWeight = s.items.reduce((sum, it) => sum + it.weightKg, 0);

    // Aggregate packing cost records attached to this sale
    let txIceCost = 0;
    let txTransportCost = 0;
    let txLabourCost = 0;
    let txThermocolCost = 0;
    let txPackingMaterialCost = 0;
    let txOxygenCost = 0;
    let txOtherCost = 0;
    let boxesCount = 0;
    let costPerBox = 0;

    s.packingCosts.forEach((pc) => {
      txIceCost += pc.iceCost;
      txTransportCost += pc.transportCost;
      txLabourCost += pc.labourCost;
      txThermocolCost += pc.thermocolCost;
      txPackingMaterialCost += pc.packingMaterialCost;
      txOxygenCost += pc.oxygenCost;
      boxesCount += pc.thermocolBoxesCount;
      if (pc.costPerBox > 0) costPerBox = pc.costPerBox;
    });

    // Aggregate linked direct expenses attached to this sale
    const linkedExpenses = (s.expenses || []).map((exp) => {
      const catName = exp.category?.name?.toLowerCase() || "";
      const catCode = exp.category?.code?.toLowerCase() || "";
      const title = exp.title?.toLowerCase() || "";

      if (catName.includes("ice") || catCode.includes("ice") || title.includes("ice")) {
        txIceCost += exp.amount;
      } else if (
        catName.includes("transport") ||
        catCode.includes("trn") ||
        catCode.includes("trans") ||
        catName.includes("freight") ||
        catName.includes("fuel") ||
        title.includes("truck") ||
        title.includes("transport") ||
        title.includes("freight")
      ) {
        txTransportCost += exp.amount;
      } else if (
        catName.includes("labour") ||
        catCode.includes("lab") ||
        catName.includes("labor") ||
        title.includes("labour") ||
        title.includes("loading") ||
        title.includes("unloading")
      ) {
        txLabourCost += exp.amount;
      } else if (
        catName.includes("box") ||
        catName.includes("thermocol") ||
        catCode.includes("box") ||
        title.includes("thermocol") ||
        title.includes("box")
      ) {
        txThermocolCost += exp.amount;
      } else if (
        catName.includes("pack") ||
        catCode.includes("pkg") ||
        catCode.includes("pack") ||
        title.includes("packing")
      ) {
        txPackingMaterialCost += exp.amount;
      } else {
        txOtherCost += exp.amount;
      }

      return {
        id: exp.id,
        expenseNumber: exp.expenseNumber,
        categoryName: exp.category?.name || "General Expense",
        categoryCode: exp.category?.code,
        title: exp.title,
        amount: exp.amount,
        paidTo: exp.paidTo,
        paymentMethod: exp.paymentMethod,
        expenseDate: exp.expenseDate.toISOString(),
        notes: exp.notes,
      };
    });

    const txPackingTotal = txThermocolCost + txPackingMaterialCost;

    costBreakdown.rawFishCost += rawFishCost;
    costBreakdown.iceCost += txIceCost;
    costBreakdown.transportCost += txTransportCost;
    costBreakdown.labourCost += txLabourCost;
    costBreakdown.thermocolBoxCost += txThermocolCost;
    costBreakdown.packingCost += txPackingTotal;
    costBreakdown.oxygenCost += txOxygenCost;
    costBreakdown.otherCost += txOtherCost;
    costBreakdown.taxAmount += s.taxAmount;
    costBreakdown.discountAmount += s.discountAmount;
    costBreakdown.totalCost += s.totalAmount;


    totalWeightKg += saleWeight;
    totalBilledAmount += s.totalAmount;
    totalPaidAmount += s.paidAmount;
    totalOutstandingAmount += s.balanceAmount;

    const items: FishItemDTO[] = s.items.map((it) => {
      const spKey = it.fishTypeId;
      const existing = speciesMap.get(spKey) || {
        fishName: it.fishType.name,
        fishCode: it.fishType.code,
        category: it.fishType.category,
        totalWeightKg: 0,
        totalAmount: 0,
        transactionCount: 0,
      };
      existing.totalWeightKg += it.weightKg;
      existing.totalAmount += it.totalPrice;
      existing.transactionCount += 1;
      speciesMap.set(spKey, existing);

      return {
        fishTypeId: it.fishTypeId,
        fishName: it.fishType.name,
        fishCode: it.fishType.code,
        category: it.fishType.category,
        grade: it.grade,
        weightKg: it.weightKg,
        unitPricePerKg: it.unitPricePerKg,
        totalCost: it.totalPrice,
        notes: it.notes,
      };
    });

    const txCosts: CostBreakdownDTO = {
      rawFishCost,
      iceCost: txIceCost,
      transportCost: txTransportCost,
      labourCost: txLabourCost,
      packingCost: txPackingTotal,
      thermocolBoxCost: txThermocolCost,
      oxygenCost: txOxygenCost,
      taxAmount: s.taxAmount,
      discountAmount: s.discountAmount,
      otherCost: txOtherCost,
      totalCost: s.totalAmount,
    };

    return {
      id: s.id,
      transactionNumber: s.saleNumber,
      date: s.saleDate.toISOString(),
      type: "SALE",
      status: s.status,
      totalWeightKg: Number(saleWeight.toFixed(2)),
      costs: txCosts,
      totalAmount: s.totalAmount,
      paidAmount: s.paidAmount,
      balanceAmount: s.balanceAmount,
      paymentStatus: s.paymentStatus,
      items,
      expenses: linkedExpenses,
      notes: s.notes,
      metadata: {
        deliveryDate: s.deliveryDate ? s.deliveryDate.toISOString() : null,
        invoiceNumber: s.invoice?.invoiceNumber || null,
        thermocolBoxesCount: boxesCount,
        costPerBox,
      },
    };
  });

  const payments: PartyPaymentRecordDTO[] = customer.payments.map((pm) => ({
    id: pm.id,
    paymentNumber: pm.paymentNumber,
    paymentDate: pm.paymentDate.toISOString(),
    amount: pm.amount,
    paymentMethod: pm.paymentMethod,
    referenceNumber: pm.referenceNumber,
    relatedTransactionNumber: pm.sale?.saleNumber || null,
    notes: pm.notes,
  }));

  const speciesBreakdown: FishSpeciesVolumeDTO[] = Array.from(speciesMap.values()).map((sp) => ({
    fishName: sp.fishName,
    fishCode: sp.fishCode,
    category: sp.category,
    totalWeightKg: Number(sp.totalWeightKg.toFixed(2)),
    totalAmount: Number(sp.totalAmount.toFixed(2)),
    averageRatePerKg: sp.totalWeightKg > 0 ? Number((sp.totalAmount / sp.totalWeightKg).toFixed(2)) : 0,
    transactionCount: sp.transactionCount,
  })).sort((a, b) => b.totalAmount - a.totalAmount);

  return {
    partyType: "CUSTOMER",
    party: {
      id: customer.id,
      code: customer.code,
      name: customer.name,
      companyName: customer.companyName,
      phone: customer.phone,
      email: customer.email,
      address: customer.deliveryAddress,
      creditLimit: customer.creditLimit,
      isActive: customer.isActive,
    },
    financialSummary: {
      totalTransactionsCount: transactions.length,
      totalWeightKg: Number(totalWeightKg.toFixed(2)),
      totalBilledAmount: Number(totalBilledAmount.toFixed(2)),
      totalPaidAmount: Number(totalPaidAmount.toFixed(2)),
      totalOutstandingAmount: Number(totalOutstandingAmount.toFixed(2)),
      costBreakdown: {
        rawFishCost: Number(costBreakdown.rawFishCost.toFixed(2)),
        iceCost: Number(costBreakdown.iceCost.toFixed(2)),
        transportCost: Number(costBreakdown.transportCost.toFixed(2)),
        labourCost: Number(costBreakdown.labourCost.toFixed(2)),
        packingCost: Number(costBreakdown.packingCost.toFixed(2)),
        thermocolBoxCost: Number(costBreakdown.thermocolBoxCost.toFixed(2)),
        oxygenCost: Number(costBreakdown.oxygenCost.toFixed(2)),
        taxAmount: Number(costBreakdown.taxAmount.toFixed(2)),
        discountAmount: Number(costBreakdown.discountAmount.toFixed(2)),
        otherCost: Number(costBreakdown.otherCost.toFixed(2)),
        totalCost: Number(costBreakdown.totalCost.toFixed(2)),
      },
    },
    transactions,
    payments,
    speciesBreakdown,
    generatedAt: new Date().toISOString(),
  };
}
