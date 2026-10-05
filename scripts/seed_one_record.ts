import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌊 Resetting & populating 1 record per table in the database...\n");

  // Clean existing tables in order to maintain referential integrity
  await prisma.auditLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.inventoryTransaction.deleteMany();
  await prisma.packingCost.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.purchaseItem.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.expenseCategory.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.fishType.deleteMany();
  await prisma.user.deleteMany();

  // 1. User
  const user = await prisma.user.create({
    data: {
      supabaseId: "user_branch2_001",
      email: "admin@branch2seafood.com",
      name: "Branch 2 Administrator",
      role: "ADMIN",
      phone: "+91 9876543210",
      isActive: true,
    },
  });
  console.log("✓ User created:", user.id);

  // 2. FishType
  const fishType = await prisma.fishType.create({
    data: {
      code: "FISH-POM-01",
      name: "Silver Pomfret",
      scientificName: "Pampus argenteus",
      category: "Pelagic",
      grade: "Grade A",
      description: "Premium grade silver pomfret fresh catch",
      isActive: true,
    },
  });
  console.log("✓ FishType created:", fishType.id);

  // 3. Supplier
  const supplier = await prisma.supplier.create({
    data: {
      code: "SUP-001",
      name: "Bay Coastal Fisheries",
      harborLocation: "Kasimedu Harbor",
      boatName: "Sea Queen IX",
      contactPerson: "K. Raman",
      phone: "+91 9123456780",
      email: "baycoastal@example.com",
      balance: 15000.0,
      rating: 4.8,
      isActive: true,
    },
  });
  console.log("✓ Supplier created:", supplier.id);

  // 4. Customer
  const customer = await prisma.customer.create({
    data: {
      code: "CUST-001",
      name: "Grand Ocean Resorts & Dining",
      companyName: "Grand Ocean Hospitality Pvt Ltd",
      customerType: "Wholesale",
      email: "procurement@grandocean.com",
      phone: "+91 9840123456",
      deliveryAddress: "ECR Road, Chennai, Tamil Nadu",
      creditLimit: 100000.0,
      outstandingBalance: 25000.0,
      paymentTermsDays: 15,
      isActive: true,
    },
  });
  console.log("✓ Customer created:", customer.id);

  // 5. Purchase
  const purchase = await prisma.purchase.create({
    data: {
      purchaseNumber: "PO-2026-0001",
      supplierId: supplier.id,
      purchaseDate: new Date("2026-10-01T06:30:00Z"),
      status: "COMPLETED",
      totalWeightKg: 100.0,
      subtotal: 45000.0,
      transportCharges: 1500.0,
      iceCharges: 800.0,
      labourCharges: 700.0,
      totalAmount: 48000.0,
      paidAmount: 33000.0,
      balanceAmount: 15000.0,
      paymentStatus: "PARTIAL",
      paymentMethod: "BANK_TRANSFER",
      landingHarbor: "Kasimedu Harbor Pier 2",
      truckNumber: "TN-04-AB-1234",
      notes: "First batch high grade silver pomfret",
    },
  });
  console.log("✓ Purchase created:", purchase.id);

  // 6. PurchaseItem
  const purchaseItem = await prisma.purchaseItem.create({
    data: {
      purchaseId: purchase.id,
      fishTypeId: fishType.id,
      grade: "Grade A",
      fishCount: 120,
      weightKg: 100.0,
      spoiledWeightKg: 0.0,
      unitPricePerKg: 450.0,
      totalCost: 45000.0,
      temperatureC: -2.5,
      notes: "Inspected at landing point. Excellent condition.",
    },
  });
  console.log("✓ PurchaseItem created:", purchaseItem.id);

  // 7. Sale
  const sale = await prisma.sale.create({
    data: {
      saleNumber: "SO-2026-0001",
      customerId: customer.id,
      saleDate: new Date("2026-10-02T10:00:00Z"),
      deliveryDate: new Date("2026-10-02T14:30:00Z"),
      status: "DELIVERED",
      paymentStatus: "PARTIAL",
      subtotal: 55000.0,
      taxAmount: 2750.0,
      discountAmount: 1000.0,
      totalAmount: 56750.0,
      paidAmount: 31750.0,
      balanceAmount: 25000.0,
      notes: "Priority delivery for weekend dinner banquet",
    },
  });
  console.log("✓ Sale created:", sale.id);

  // 8. SaleItem
  const saleItem = await prisma.saleItem.create({
    data: {
      saleId: sale.id,
      fishTypeId: fishType.id,
      grade: "Grade A",
      weightKg: 80.0,
      spoiledWeightKg: 0.0,
      unitPricePerKg: 687.5,
      totalPrice: 55000.0,
      notes: "Custom packed in 10kg thermocol boxes",
    },
  });
  console.log("✓ SaleItem created:", saleItem.id);

  // 9. InventoryTransaction
  const inventoryTransaction = await prisma.inventoryTransaction.create({
    data: {
      fishTypeId: fishType.id,
      transactionType: "PURCHASE_INWARD",
      quantityKg: 100.0,
      unitCost: 450.0,
      purchaseItemId: purchaseItem.id,
      batchLotNumber: "LOT-20261001-01",
      storageLocation: "Cold Room 1 - Rack A3",
      notes: "Inward transaction from PO-2026-0001",
    },
  });
  console.log("✓ InventoryTransaction created:", inventoryTransaction.id);

  // 10. PackingCost
  const packingCost = await prisma.packingCost.create({
    data: {
      saleId: sale.id,
      packingType: "Thermocol Export Grade Box",
      thermocolBoxesCount: 8,
      costPerBox: 120.0,
      thermocolCost: 960.0,
      iceCost: 400.0,
      oxygenCost: 150.0,
      packingMaterialCost: 200.0,
      labourCost: 350.0,
      transportCost: 600.0,
      quantityKg: 80.0,
      totalCost: 2660.0,
      costPerKg: 33.25,
      notes: "Packaged for Grand Ocean Resorts delivery",
    },
  });
  console.log("✓ PackingCost created:", packingCost.id);

  // 11. Invoice
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-2026-0001",
      saleId: sale.id,
      customerId: customer.id,
      invoiceDate: new Date("2026-10-02T11:00:00Z"),
      dueDate: new Date("2026-10-17T11:00:00Z"),
      subtotal: 55000.0,
      taxAmount: 2750.0,
      discountAmount: 1000.0,
      totalAmount: 56750.0,
      paidAmount: 31750.0,
      balanceAmount: 25000.0,
      status: "PARTIAL",
      notes: "Generated electronic tax invoice",
    },
  });
  console.log("✓ Invoice created:", invoice.id);

  // 12. ExpenseCategory
  const expenseCategory = await prisma.expenseCategory.create({
    data: {
      code: "EXP-LOGISTICS",
      name: "Cold Chain & Logistics",
      description: "Freight, refrigerated vehicle fuel, and toll expenses",
      isActive: true,
    },
  });
  console.log("✓ ExpenseCategory created:", expenseCategory.id);

  // 13. Expense
  const expense = await prisma.expense.create({
    data: {
      expenseNumber: "EXP-2026-0001",
      categoryId: expenseCategory.id,
      title: "Refrigerated Van Fuel & Tolls",
      description: "Fuel and highway toll charges for Chennai - ECR delivery run",
      amount: 1850.0,
      paidTo: "Indian Oil Petrol Station",
      paymentMethod: "UPI",
      expenseDate: new Date("2026-10-02T13:00:00Z"),
      saleId: sale.id,
      notes: "Logistics expense attached to SO-2026-0001",
    },
  });
  console.log("✓ Expense created:", expense.id);

  // 14. Payment
  const payment = await prisma.payment.create({
    data: {
      paymentNumber: "PAY-2026-0001",
      paymentType: "CUSTOMER_RECEIPT",
      amount: 31750.0,
      paymentMethod: "BANK_TRANSFER",
      paymentDate: new Date("2026-10-02T16:00:00Z"),
      referenceNumber: "NEFT-HDFC-99120348",
      customerId: customer.id,
      saleId: sale.id,
      notes: "Initial 55% advance transfer for SO-2026-0001",
    },
  });
  console.log("✓ Payment created:", payment.id);

  // 15. AuditLog
  const auditLog = await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "DATABASE_INITIALIZED",
      entity: "SYSTEM",
      entityId: "BRANCH-02",
      metadata: { environment: "branch_2", initializedAt: new Date().toISOString() },
      ipAddress: "127.0.0.1",
      userAgent: "Antigravity/2.0 Migration Engine",
    },
  });
  console.log("✓ AuditLog created:", auditLog.id);

  console.log("\n🎉 Successfully populated 1 sample record in all 15 tables!");
}

main()
  .catch((e) => {
    console.error("Error seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
