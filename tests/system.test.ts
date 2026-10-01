import { loginSchema, saleSchema, purchaseSchema, inventoryTransactionSchema } from "../validations";

export function testValidations() {
  const validLogin = loginSchema.safeParse({
    email: "manager@fisheries-erp.com",
    password: "securepassword123",
  });
  console.assert(validLogin.success, "Login schema validation should pass");

  const validPurchase = purchaseSchema.safeParse({
    purchaseNumber: "PB-2026-001",
    supplierId: "sup-1",
    purchaseDate: new Date().toISOString(),
    items: [
      {
        fishTypeId: "ft-1",
        grade: "Grade A",
        weightKg: 1000,
        unitPricePerKg: 5.5,
      },
    ],
  });
  console.assert(validPurchase.success, "Purchase validation should pass");

  const validSale = saleSchema.safeParse({
    saleNumber: "INV-2026-001",
    customerId: "cust-1",
    saleDate: new Date().toISOString(),
    discountAmount: 0,
    taxAmount: 0,
    items: [
      {
        fishTypeId: "ft-1",
        grade: "Grade A",
        weightKg: 500,
        unitPricePerKg: 8.5,
      },
    ],
  });
  console.assert(validSale.success, "Sale validation should pass");

  const validInventoryTx = inventoryTransactionSchema.safeParse({
    fishTypeId: "ft-1",
    transactionType: "PURCHASE_INWARD",
    quantityKg: 500.0,
    unitCost: 7.2,
  });
  console.assert(validInventoryTx.success, "Inventory transaction validation should pass");

  return true;
}
