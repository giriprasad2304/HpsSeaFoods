import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ═══════════════════════════════════════════════════════════════════
// Coastal Fresh Seafood — Demo Seed Data
// September 2026 • INR (₹) • Indian Business Context
// ═══════════════════════════════════════════════════════════════════

function dt(day: number, hour = 8, min = 0): Date {
  return new Date(2026, 8, day, hour, min, 0, 0); // month is 0-indexed, 8 = September
}

async function main() {
  console.log("🐟 Seeding Coastal Fresh Seafood demo data...\n");

  // ─── CLEANUP ────────────────────────────────────────────────────
  console.log("  Cleaning existing data...");
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
  console.log("  ✓ Cleaned\n");

  // ═══════════════════════════════════════════════════════════════
  // 1. DEMO ADMIN USER
  // ═══════════════════════════════════════════════════════════════
  console.log("  Creating admin user...");
  await prisma.user.create({
    data: {
      supabaseId: "demo-admin-supabase-id-001",
      email: "hpsfooods@gmail.com",
      name: "HPS Admin",
      role: "ADMIN",
      phone: "+91 90000 00001",
      isActive: true,
    },
  });
  console.log("  ✓ Admin user created\n");

  // ═══════════════════════════════════════════════════════════════
  // 2. FISH TYPES (10)
  // ═══════════════════════════════════════════════════════════════
  console.log("  Creating fish types...");
  const fishTypesData = [
    { code: "FISH-ROH", name: "Rohu",      scientificName: "Labeo rohita",           category: "Freshwater",  grade: "Grade A" },
    { code: "FISH-KAT", name: "Katla",     scientificName: "Catla catla",            category: "Freshwater",  grade: "Grade A" },
    { code: "FISH-POM", name: "Pomfret",   scientificName: "Pampus argenteus",       category: "Pelagic",     grade: "Grade A" },
    { code: "FISH-SER", name: "Seer Fish", scientificName: "Scomberomorus commerson", category: "Pelagic",     grade: "Grade A" },
    { code: "FISH-TUN", name: "Tuna",      scientificName: "Thunnus albacares",      category: "Pelagic",     grade: "Grade A" },
    { code: "FISH-MCK", name: "Mackerel",  scientificName: "Rastrelliger kanagurta", category: "Pelagic",     grade: "Grade A" },
    { code: "FISH-PRW", name: "Prawns",    scientificName: "Penaeus monodon",        category: "Crustacean",  grade: "Grade A" },
    { code: "FISH-SRD", name: "Sardines",  scientificName: "Sardinella longiceps",   category: "Pelagic",     grade: "Grade B" },
    { code: "FISH-HIL", name: "Hilsa",     scientificName: "Tenualosa ilisha",       category: "Anadromous",  grade: "Grade A" },
    { code: "FISH-KNG", name: "King Fish", scientificName: "Scomberomorus guttatus",  category: "Pelagic",     grade: "Grade A" },
  ];

  const fishTypeMap: Record<string, string> = {};
  for (const ft of fishTypesData) {
    const created = await prisma.fishType.create({ data: ft });
    fishTypeMap[ft.name] = created.id;
  }
  console.log(`  ✓ ${fishTypesData.length} fish types created\n`);

  // ═══════════════════════════════════════════════════════════════
  // 3. SUPPLIERS (5)
  // ═══════════════════════════════════════════════════════════════
  console.log("  Creating suppliers...");
  const suppliersData = [
    { code: "SUP-001", name: "Vizag Marine Traders",   harborLocation: "Visakhapatnam Fishing Harbor", boatName: "Sea Star I",       contactPerson: "Ravi Kumar",     phone: "+91 98765 10001", email: "ravi@vizagmarine.com",    taxNumber: "37AABCV1234E1Z5", address: "Harbor Road, Visakhapatnam, AP" },
    { code: "SUP-002", name: "Coastal Fish Suppliers",  harborLocation: "Kakinada Fishing Harbor",      boatName: "Matsya Deep",      contactPerson: "Suresh Reddy",   phone: "+91 98765 10002", email: "suresh@coastalfish.com",  taxNumber: "37BBCDF2345G1Z3", address: "Port Area, Kakinada, AP" },
    { code: "SUP-003", name: "Andhra Sea Foods",        harborLocation: "Bheemili Beach Harbor",        boatName: "Ocean Rider",      contactPerson: "Venkat Rao",     phone: "+91 98765 10003", email: "venkat@andhrasea.com",    taxNumber: "37CCDEF3456H1Z8", address: "Beach Road, Bheemili, AP" },
    { code: "SUP-004", name: "Ocean Fresh Suppliers",   harborLocation: "Srikakulam Harbor",            boatName: "Blue Marlin II",   contactPerson: "Prakash Naidu",  phone: "+91 98765 10004", email: "prakash@oceanfresh.com",  taxNumber: "37DDEFG4567I1Z2", address: "Fish Market Road, Srikakulam, AP" },
    { code: "SUP-005", name: "Blue Wave Fisheries",     harborLocation: "Nellore Fishing Harbor",       boatName: "Wave Catcher",     contactPerson: "Ramana Murthy",  phone: "+91 98765 10005", email: "ramana@bluewave.com",     taxNumber: "37EEFGH5678J1Z6", address: "Harbor Junction, Nellore, AP" },
  ];

  const supplierMap: Record<string, string> = {};
  for (const s of suppliersData) {
    const created = await prisma.supplier.create({ data: s });
    supplierMap[s.name] = created.id;
  }
  console.log(`  ✓ ${suppliersData.length} suppliers created\n`);

  // ═══════════════════════════════════════════════════════════════
  // 4. CUSTOMERS (10)
  // ═══════════════════════════════════════════════════════════════
  console.log("  Creating customers...");
  const customersData = [
    { code: "CUST-001", name: "Sri Lakshmi Hotels",       companyName: "Sri Lakshmi Hotels Pvt Ltd",       customerType: "Wholesale",          email: "purchase@srilakshmihotels.com",   phone: "+91 91000 20001", deliveryAddress: "MG Road, Visakhapatnam",       creditLimit: 200000, paymentTermsDays: 15 },
    { code: "CUST-002", name: "Ocean Pearl Restaurant",    companyName: "Ocean Pearl Dining Group",         customerType: "Wholesale",          email: "orders@oceanpearl.com",           phone: "+91 91000 20002", deliveryAddress: "Beach Road, Vizag",            creditLimit: 150000, paymentTermsDays: 15 },
    { code: "CUST-003", name: "Vizag Fish Market",         companyName: "Vizag Central Fish Market",        customerType: "Retail Distributor", email: "procurement@vizagfish.com",       phone: "+91 91000 20003", deliveryAddress: "Jagadamba Junction, Vizag",     creditLimit: 300000, paymentTermsDays: 7 },
    { code: "CUST-004", name: "Coastal Foods Pvt Ltd",     companyName: "Coastal Foods Processing Ltd",     customerType: "Export",             email: "buying@coastalfoods.com",         phone: "+91 91000 20004", deliveryAddress: "Industrial Area, Kakinada",    creditLimit: 500000, paymentTermsDays: 30 },
    { code: "CUST-005", name: "Sea View Restaurant",       companyName: "Sea View Hospitality",             customerType: "Wholesale",          email: "kitchen@seaview.com",             phone: "+91 91000 20005", deliveryAddress: "RK Beach, Vizag",              creditLimit: 100000, paymentTermsDays: 15 },
    { code: "CUST-006", name: "Andhra Fresh Mart",         companyName: "Andhra Fresh Mart Chain",          customerType: "Retail Distributor", email: "supply@andhrafresh.com",          phone: "+91 91000 20006", deliveryAddress: "Dwaraka Nagar, Vizag",         creditLimit: 250000, paymentTermsDays: 15 },
    { code: "CUST-007", name: "Blue Ocean Exports",        companyName: "Blue Ocean Seafood Exports Ltd",   customerType: "Export",             email: "imports@blueoceanexports.com",    phone: "+91 91000 20007", deliveryAddress: "SEZ, Duvvada, Vizag",          creditLimit: 800000, paymentTermsDays: 30 },
    { code: "CUST-008", name: "Haritha Supermarket",       companyName: "Haritha Retail Solutions",         customerType: "Retail Distributor", email: "fresh@harithasuper.com",          phone: "+91 91000 20008", deliveryAddress: "MVP Colony, Vizag",            creditLimit: 120000, paymentTermsDays: 10 },
    { code: "CUST-009", name: "Royal Caterers",            companyName: "Royal Caterers & Events",          customerType: "Wholesale",          email: "orders@royalcaterers.com",        phone: "+91 91000 20009", deliveryAddress: "Siripuram, Vizag",             creditLimit: 100000, paymentTermsDays: 7 },
    { code: "CUST-010", name: "Fresh Catch Retail",        companyName: "Fresh Catch Fish Retail",          customerType: "Retail Distributor", email: "buy@freshcatch.com",              phone: "+91 91000 20010", deliveryAddress: "Seethammadhara, Vizag",        creditLimit: 80000,  paymentTermsDays: 7 },
  ];

  const customerMap: Record<string, string> = {};
  for (const c of customersData) {
    const created = await prisma.customer.create({ data: c });
    customerMap[c.name] = created.id;
  }
  console.log(`  ✓ ${customersData.length} customers created\n`);

  // ═══════════════════════════════════════════════════════════════
  // 5. EXPENSE CATEGORIES (10)
  // ═══════════════════════════════════════════════════════════════
  console.log("  Creating expense categories...");
  const expenseCatsData = [
    { code: "EXP-CAT-ICE", name: "Ice Cost",              description: "Tube ice, crushed ice & dry ice" },
    { code: "EXP-CAT-TRN", name: "Transport Cost",        description: "Reefer truck freight & local transport" },
    { code: "EXP-CAT-LAB", name: "Labour Cost",           description: "Harbor unloading, grading & loading labour" },
    { code: "EXP-CAT-BOX", name: "Thermocol Boxes Cost",  description: "Insulated thermocol packaging boxes" },
    { code: "EXP-CAT-OTH", name: "Others",                description: "General other operational expenses" },
    { code: "EXP-CAT-PKG", name: "Packing Materials",     description: "Polythene liners, sealing tape & gel packs" },
    { code: "EXP-CAT-ELC", name: "Electricity",           description: "Monthly electricity & generator fuel" },
    { code: "EXP-CAT-CLD", name: "Cold Storage",          description: "Cold storage rental & maintenance" },
    { code: "EXP-CAT-MNT", name: "Maintenance",           description: "Equipment maintenance & repairs" },
    { code: "EXP-CAT-FUL", name: "Fuel",                  description: "Vehicle fuel & diesel for generators" },
  ];

  const expCatMap: Record<string, string> = {};
  for (const ec of expenseCatsData) {
    const created = await prisma.expenseCategory.create({ data: ec });
    expCatMap[ec.name] = created.id;
    expCatMap[ec.code] = created.id;
    if (ec.name === "Ice Cost") expCatMap["Ice"] = created.id;
    if (ec.name === "Transport Cost") expCatMap["Transport"] = created.id;
    if (ec.name === "Labour Cost") expCatMap["Labour"] = created.id;
    if (ec.name === "Thermocol Boxes Cost") expCatMap["Thermocol Boxes"] = created.id;
    if (ec.name === "Others") expCatMap["Miscellaneous"] = created.id;
  }
  console.log(`  ✓ ${expenseCatsData.length} expense categories created\n`);


  // ═══════════════════════════════════════════════════════════════
  // 6. PURCHASES (35 records)
  // ═══════════════════════════════════════════════════════════════
  console.log("  Creating purchases with items & inventory...");

  interface PurchaseSpec {
    num: string; day: number; hour: number; supplier: string;
    fish: string; qty: number; rate: number;
    payStatus: "PAID" | "PARTIAL" | "UNPAID";
    paidPct: number; // percentage paid (100=full, 0=unpaid)
    payMethod: "CASH" | "UPI" | "BANK_TRANSFER" | "CHEQUE";
    transport: number; ice: number; labour: number;
    status: "RECEIVED" | "COMPLETED" | "INSPECTED";
  }

  const purchases: PurchaseSpec[] = [
    // Week 1 (Sep 1-7)
    { num: "PUR-2026-001", day: 1,  hour: 6,  supplier: "Vizag Marine Traders",   fish: "Rohu",      qty: 200, rate: 280, payStatus: "PAID",    paidPct: 100, payMethod: "BANK_TRANSFER", transport: 1800, ice: 900,  labour: 1400 , status: "COMPLETED" },
    { num: "PUR-2026-002", day: 1,  hour: 7,  supplier: "Coastal Fish Suppliers",  fish: "Katla",     qty: 150, rate: 260, payStatus: "PAID",    paidPct: 100, payMethod: "UPI",           transport: 1500, ice: 700,  labour: 1100 , status: "COMPLETED" },
    { num: "PUR-2026-003", day: 2,  hour: 5,  supplier: "Andhra Sea Foods",        fish: "Mackerel",  qty: 350, rate: 220, payStatus: "PAID",    paidPct: 100, payMethod: "CASH",          transport: 2400, ice: 1300, labour: 1900 , status: "COMPLETED" },
    { num: "PUR-2026-004", day: 3,  hour: 6,  supplier: "Coastal Fish Suppliers",  fish: "Pomfret",   qty: 90,  rate: 540, payStatus: "PARTIAL", paidPct: 60,  payMethod: "CHEQUE",        transport: 1200, ice: 600,  labour: 900  , status: "RECEIVED"  },
    { num: "PUR-2026-005", day: 4,  hour: 7,  supplier: "Ocean Fresh Suppliers",   fish: "Sardines",  qty: 420, rate: 190, payStatus: "PAID",    paidPct: 100, payMethod: "BANK_TRANSFER", transport: 2600, ice: 1500, labour: 2200 , status: "COMPLETED" },
    { num: "PUR-2026-006", day: 5,  hour: 6,  supplier: "Andhra Sea Foods",        fish: "Tuna",      qty: 260, rate: 360, payStatus: "UNPAID",  paidPct: 0,   payMethod: "BANK_TRANSFER", transport: 2200, ice: 1100, labour: 1600 , status: "RECEIVED"  },
    { num: "PUR-2026-007", day: 6,  hour: 5,  supplier: "Blue Wave Fisheries",     fish: "Hilsa",     qty: 60,  rate: 480, payStatus: "PAID",    paidPct: 100, payMethod: "UPI",           transport: 900,  ice: 450,  labour: 600  , status: "COMPLETED" },
    { num: "PUR-2026-008", day: 7,  hour: 6,  supplier: "Vizag Marine Traders",    fish: "Prawns",    qty: 140, rate: 620, payStatus: "PARTIAL", paidPct: 50,  payMethod: "BANK_TRANSFER", transport: 1600, ice: 850,  labour: 1200 , status: "INSPECTED" },

    // Week 2 (Sep 8-14)
    { num: "PUR-2026-009", day: 8,  hour: 6,  supplier: "Ocean Fresh Suppliers",   fish: "Prawns",    qty: 150, rate: 620, payStatus: "PAID",    paidPct: 100, payMethod: "CASH",          transport: 1800, ice: 900,  labour: 1300 , status: "COMPLETED" },
    { num: "PUR-2026-010", day: 9,  hour: 7,  supplier: "Coastal Fish Suppliers",  fish: "Rohu",      qty: 240, rate: 285, payStatus: "PAID",    paidPct: 100, payMethod: "UPI",           transport: 2000, ice: 1000, labour: 1500 , status: "COMPLETED" },
    { num: "PUR-2026-011", day: 10, hour: 5,  supplier: "Andhra Sea Foods",        fish: "King Fish", qty: 90,  rate: 640, payStatus: "PARTIAL", paidPct: 70,  payMethod: "CHEQUE",        transport: 1200, ice: 600,  labour: 800  , status: "RECEIVED"  },
    { num: "PUR-2026-012", day: 11, hour: 6,  supplier: "Blue Wave Fisheries",     fish: "Mackerel",  qty: 320, rate: 220, payStatus: "PAID",    paidPct: 100, payMethod: "BANK_TRANSFER", transport: 2400, ice: 1300, labour: 1900 , status: "COMPLETED" },
    { num: "PUR-2026-013", day: 12, hour: 7,  supplier: "Vizag Marine Traders",    fish: "Seer Fish", qty: 130, rate: 580, payStatus: "PAID",    paidPct: 100, payMethod: "UPI",           transport: 1600, ice: 800,  labour: 1100 , status: "COMPLETED" },
    { num: "PUR-2026-014", day: 13, hour: 6,  supplier: "Ocean Fresh Suppliers",   fish: "Katla",     qty: 160, rate: 270, payStatus: "UNPAID",  paidPct: 0,   payMethod: "BANK_TRANSFER", transport: 1600, ice: 800,  labour: 1200 , status: "RECEIVED"  },
    { num: "PUR-2026-015", day: 14, hour: 5,  supplier: "Vizag Marine Traders",    fish: "Seer Fish", qty: 130, rate: 580, payStatus: "PARTIAL", paidPct: 40,  payMethod: "CHEQUE",        transport: 1600, ice: 800,  labour: 1200 , status: "INSPECTED" },

    // Week 3 (Sep 15-21)
    { num: "PUR-2026-016", day: 15, hour: 6,  supplier: "Blue Wave Fisheries",     fish: "Tuna",      qty: 200, rate: 370, payStatus: "PAID",    paidPct: 100, payMethod: "BANK_TRANSFER", transport: 1900, ice: 950,  labour: 1400 , status: "COMPLETED" },
    { num: "PUR-2026-017", day: 16, hour: 7,  supplier: "Coastal Fish Suppliers",  fish: "Pomfret",   qty: 80,  rate: 550, payStatus: "PAID",    paidPct: 100, payMethod: "UPI",           transport: 1100, ice: 550,  labour: 800  , status: "COMPLETED" },
    { num: "PUR-2026-018", day: 17, hour: 6,  supplier: "Andhra Sea Foods",        fish: "Rohu",      qty: 220, rate: 290, payStatus: "PARTIAL", paidPct: 75,  payMethod: "BANK_TRANSFER", transport: 1800, ice: 900,  labour: 1400 , status: "RECEIVED"  },
    { num: "PUR-2026-019", day: 18, hour: 5,  supplier: "Coastal Fish Suppliers",  fish: "Sardines",  qty: 340, rate: 190, payStatus: "UNPAID",  paidPct: 0,   payMethod: "BANK_TRANSFER", transport: 2200, ice: 1200, labour: 1700 , status: "RECEIVED"  },
    { num: "PUR-2026-020", day: 19, hour: 6,  supplier: "Vizag Marine Traders",    fish: "Prawns",    qty: 160, rate: 630, payStatus: "PAID",    paidPct: 100, payMethod: "CASH",          transport: 1800, ice: 900,  labour: 1300 , status: "COMPLETED" },
    { num: "PUR-2026-021", day: 20, hour: 7,  supplier: "Ocean Fresh Suppliers",   fish: "Hilsa",     qty: 70,  rate: 490, payStatus: "PAID",    paidPct: 100, payMethod: "UPI",           transport: 1000, ice: 500,  labour: 700  , status: "COMPLETED" },
    { num: "PUR-2026-022", day: 21, hour: 6,  supplier: "Blue Wave Fisheries",     fish: "Katla",     qty: 150, rate: 265, payStatus: "PARTIAL", paidPct: 55,  payMethod: "CHEQUE",        transport: 1500, ice: 750,  labour: 1100 , status: "INSPECTED" },

    // Week 4 (Sep 22-28)
    { num: "PUR-2026-023", day: 22, hour: 6,  supplier: "Andhra Sea Foods",        fish: "King Fish", qty: 100, rate: 650, payStatus: "PAID",    paidPct: 100, payMethod: "BANK_TRANSFER", transport: 1300, ice: 650,  labour: 900  , status: "COMPLETED" },
    { num: "PUR-2026-024", day: 22, hour: 8,  supplier: "Vizag Marine Traders",    fish: "Mackerel",  qty: 340, rate: 225, payStatus: "PAID",    paidPct: 100, payMethod: "UPI",           transport: 2300, ice: 1200, labour: 1700 , status: "COMPLETED" },
    { num: "PUR-2026-025", day: 23, hour: 6,  supplier: "Coastal Fish Suppliers",  fish: "Tuna",      qty: 190, rate: 365, payStatus: "UNPAID",  paidPct: 0,   payMethod: "BANK_TRANSFER", transport: 1800, ice: 900,  labour: 1300 , status: "RECEIVED"  },
    { num: "PUR-2026-026", day: 24, hour: 5,  supplier: "Ocean Fresh Suppliers",   fish: "Pomfret",   qty: 70,  rate: 560, payStatus: "PAID",    paidPct: 100, payMethod: "CASH",          transport: 1000, ice: 500,  labour: 700  , status: "COMPLETED" },
    { num: "PUR-2026-027", day: 25, hour: 6,  supplier: "Ocean Fresh Suppliers",   fish: "Rohu",      qty: 220, rate: 290, payStatus: "PARTIAL", paidPct: 65,  payMethod: "BANK_TRANSFER", transport: 1800, ice: 900,  labour: 1400 , status: "RECEIVED"  },
    { num: "PUR-2026-028", day: 26, hour: 7,  supplier: "Vizag Marine Traders",    fish: "Seer Fish", qty: 110, rate: 590, payStatus: "PAID",    paidPct: 100, payMethod: "UPI",           transport: 1400, ice: 700,  labour: 1000 , status: "COMPLETED" },
    { num: "PUR-2026-029", day: 27, hour: 6,  supplier: "Blue Wave Fisheries",     fish: "Sardines",  qty: 280, rate: 195, payStatus: "PAID",    paidPct: 100, payMethod: "BANK_TRANSFER", transport: 2100, ice: 1100, labour: 1500 , status: "COMPLETED" },
    { num: "PUR-2026-030", day: 28, hour: 5,  supplier: "Blue Wave Fisheries",     fish: "Tuna",      qty: 180, rate: 370, payStatus: "PAID",    paidPct: 100, payMethod: "CASH",          transport: 1800, ice: 900,  labour: 1300 , status: "COMPLETED" },

    // Week 5 (Sep 29-30) + extra edge cases
    { num: "PUR-2026-031", day: 29, hour: 6,  supplier: "Andhra Sea Foods",        fish: "Prawns",    qty: 130, rate: 610, payStatus: "PARTIAL", paidPct: 80,  payMethod: "BANK_TRANSFER", transport: 1500, ice: 750,  labour: 1100 , status: "INSPECTED" },
    { num: "PUR-2026-032", day: 29, hour: 8,  supplier: "Vizag Marine Traders",    fish: "Rohu",      qty: 160, rate: 275, payStatus: "PAID",    paidPct: 100, payMethod: "UPI",           transport: 1400, ice: 700,  labour: 1000 , status: "COMPLETED" },
    { num: "PUR-2026-033", day: 30, hour: 6,  supplier: "Coastal Fish Suppliers",  fish: "Hilsa",     qty: 55,  rate: 500, payStatus: "UNPAID",  paidPct: 0,   payMethod: "BANK_TRANSFER", transport: 850,  ice: 400,  labour: 550  , status: "RECEIVED"  },
    // Edge: very small transaction
    { num: "PUR-2026-034", day: 30, hour: 9,  supplier: "Ocean Fresh Suppliers",   fish: "King Fish", qty: 50,  rate: 650, payStatus: "PAID",    paidPct: 100, payMethod: "CASH",          transport: 700,  ice: 350,  labour: 450  , status: "COMPLETED" },
    // Edge: large transaction
    { num: "PUR-2026-035", day: 30, hour: 10, supplier: "Blue Wave Fisheries",     fish: "Mackerel",  qty: 400, rate: 215, payStatus: "PARTIAL", paidPct: 45,  payMethod: "CHEQUE",        transport: 2900, ice: 1700, labour: 2500 , status: "RECEIVED"  },
  ];

  // Track inventory per fish type: purchased qty and sold qty
  const inventoryPurchased: Record<string, number> = {};
  const inventorySold: Record<string, number> = {};
  for (const ft of fishTypesData) {
    inventoryPurchased[ft.name] = 0;
    inventorySold[ft.name] = 0;
  }

  // Totals for summary
  let totalPurchaseAmount = 0;
  let totalPurchasePaid = 0;
  let totalPurchaseBalance = 0;
  let paymentCounter = 0;

  for (const p of purchases) {
    const subtotal = p.qty * p.rate;
    const totalAmount = subtotal + p.transport + p.ice + p.labour;
    const paidAmount = p.payStatus === "PAID" ? totalAmount : p.payStatus === "UNPAID" ? 0 : Math.round(totalAmount * p.paidPct / 100);
    const balanceAmount = totalAmount - paidAmount;

    totalPurchaseAmount += totalAmount;
    totalPurchasePaid += paidAmount;
    totalPurchaseBalance += balanceAmount;

    inventoryPurchased[p.fish] = (inventoryPurchased[p.fish] || 0) + p.qty;

    const purchase = await prisma.purchase.create({
      data: {
        purchaseNumber: p.num,
        supplierId: supplierMap[p.supplier],
        purchaseDate: dt(p.day, p.hour),
        status: p.status,
        totalWeightKg: p.qty,
        subtotal,
        transportCharges: p.transport,
        iceCharges: p.ice,
        labourCharges: p.labour,
        totalAmount,
        paidAmount,
        balanceAmount,
        paymentStatus: p.payStatus,
        paymentMethod: p.payMethod,
        landingHarbor: suppliersData.find(s => s.name === p.supplier)?.harborLocation || "Visakhapatnam",
        notes: `Purchase of ${p.qty}kg ${p.fish} from ${p.supplier}`,
      },
    });

    // Create PurchaseItem
    const purchaseItem = await prisma.purchaseItem.create({
      data: {
        purchaseId: purchase.id,
        fishTypeId: fishTypeMap[p.fish],
        grade: "Grade A",
        weightKg: p.qty,
        unitPricePerKg: p.rate,
        totalCost: subtotal,
        temperatureC: -(Math.floor(Math.random() * 10) + 1), // -1 to -10
      },
    });

    // Create Inventory Transaction (PURCHASE_INWARD)
    await prisma.inventoryTransaction.create({
      data: {
        fishTypeId: fishTypeMap[p.fish],
        transactionType: "PURCHASE_INWARD",
        quantityKg: p.qty,
        unitCost: p.rate,
        purchaseItemId: purchaseItem.id,
        batchLotNumber: `LOT-${p.num.replace("PUR-", "")}`,
        storageLocation: "Cold Storage A",
        notes: `Inward from ${p.supplier}`,
        createdAt: dt(p.day, p.hour, 30),
      },
    });

    // Create Payment record if any amount paid
    if (paidAmount > 0) {
      paymentCounter++;
      await prisma.payment.create({
        data: {
          paymentNumber: `PAY-SUP-${String(paymentCounter).padStart(3, "0")}`,
          paymentType: "SUPPLIER_PAYMENT",
          amount: paidAmount,
          paymentMethod: p.payMethod,
          paymentDate: dt(p.day, p.hour + 1),
          referenceNumber: `REF-${p.num}`,
          notes: `Payment for ${p.num}`,
          supplierId: supplierMap[p.supplier],
          purchaseId: purchase.id,
        },
      });
    }
  }
  console.log(`  ✓ ${purchases.length} purchases created\n`);

  // ═══════════════════════════════════════════════════════════════
  // 7. SALES (50 records)
  // Target: ~₹33L+ revenue to produce positive gross/net profit
  // Purchased totals: Rohu 1310, Katla 600, Pomfret 300, Seer 390,
  //   Tuna 970, Mackerel 1650, Prawns 690, Sardines 1150, Hilsa 240, King 250
  // ═══════════════════════════════════════════════════════════════
  console.log("  Creating sales with items, invoices & inventory...");

  interface SaleSpec {
    num: string; day: number; hour: number; customer: string;
    fish: string; qty: number; sellRate: number;
    payStatus: "PAID" | "PARTIAL" | "UNPAID";
    paidPct: number;
    saleStatus: "DRAFT" | "CONFIRMED" | "PACKED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  }

  // Sell targets (kg): Rohu ~1000, Katla ~450, Pomfret ~230, Seer ~310,
  //   Tuna ~780, Mackerel ~1300, Prawns ~530, Sardines ~900, Hilsa ~180, King ~200
  // Total revenue target: ~₹33.5L → Gross ≈ ₹5.6L, Net ≈ ₹4.3L
  const sales: SaleSpec[] = [
    // Week 1 (Sep 1-7) — 10 sales
    { num: "SAL-2026-001", day: 1,  hour: 10, customer: "Sri Lakshmi Hotels",       fish: "Rohu",      qty: 130, sellRate: 380,  payStatus: "PAID",    paidPct: 100, saleStatus: "DELIVERED"  },
    { num: "SAL-2026-002", day: 1,  hour: 14, customer: "Vizag Fish Market",         fish: "Mackerel",  qty: 210, sellRate: 320,  payStatus: "PAID",    paidPct: 100, saleStatus: "DELIVERED"  },
    { num: "SAL-2026-003", day: 2,  hour: 10, customer: "Ocean Pearl Restaurant",    fish: "Rohu",      qty: 90,  sellRate: 375,  payStatus: "PAID",    paidPct: 100, saleStatus: "DELIVERED"  },
    { num: "SAL-2026-004", day: 2,  hour: 14, customer: "Coastal Foods Pvt Ltd",     fish: "Sardines",  qty: 260, sellRate: 280,  payStatus: "PAID",    paidPct: 100, saleStatus: "DELIVERED"  },
    { num: "SAL-2026-005", day: 3,  hour: 10, customer: "Haritha Supermarket",       fish: "Katla",     qty: 95,  sellRate: 365,  payStatus: "PAID",    paidPct: 100, saleStatus: "DELIVERED"  },
    { num: "SAL-2026-006", day: 4,  hour: 11, customer: "Ocean Pearl Restaurant",    fish: "Pomfret",   qty: 65,  sellRate: 740,  payStatus: "PARTIAL", paidPct: 70,  saleStatus: "DELIVERED"  },
    { num: "SAL-2026-007", day: 5,  hour: 10, customer: "Blue Ocean Exports",        fish: "Tuna",      qty: 190, sellRate: 515,  payStatus: "PAID",    paidPct: 100, saleStatus: "DELIVERED"  },
    { num: "SAL-2026-008", day: 5,  hour: 14, customer: "Fresh Catch Retail",        fish: "Mackerel",  qty: 160, sellRate: 315,  payStatus: "PARTIAL", paidPct: 60,  saleStatus: "DELIVERED"  },
    { num: "SAL-2026-009", day: 6,  hour: 10, customer: "Andhra Fresh Mart",         fish: "Prawns",    qty: 85,  sellRate: 840,  payStatus: "PAID",    paidPct: 100, saleStatus: "DELIVERED"  },
    { num: "SAL-2026-010", day: 7,  hour: 10, customer: "Sea View Restaurant",       fish: "Hilsa",     qty: 45,  sellRate: 675,  payStatus: "PAID",    paidPct: 100, saleStatus: "DELIVERED"  },

    // Week 2 (Sep 8-14) — 10 sales
    { num: "SAL-2026-011", day: 8,  hour: 10, customer: "Sri Lakshmi Hotels",       fish: "Prawns",    qty: 100, sellRate: 850,  payStatus: "PAID",    paidPct: 100, saleStatus: "DELIVERED"  },
    { num: "SAL-2026-012", day: 8,  hour: 14, customer: "Vizag Fish Market",         fish: "Mackerel",  qty: 180, sellRate: 315,  payStatus: "PAID",    paidPct: 100, saleStatus: "DELIVERED"  },
    { num: "SAL-2026-013", day: 9,  hour: 10, customer: "Coastal Foods Pvt Ltd",     fish: "Prawns",    qty: 120, sellRate: 830,  payStatus: "UNPAID",  paidPct: 0,   saleStatus: "SHIPPED"   },
    { num: "SAL-2026-014", day: 9,  hour: 14, customer: "Royal Caterers",            fish: "Rohu",      qty: 130, sellRate: 380,  payStatus: "PAID",    paidPct: 100, saleStatus: "DELIVERED"  },
    { num: "SAL-2026-015", day: 10, hour: 10, customer: "Andhra Fresh Mart",         fish: "King Fish", qty: 55,  sellRate: 880,  payStatus: "PAID",    paidPct: 100, saleStatus: "DELIVERED"  },
    { num: "SAL-2026-016", day: 11, hour: 10, customer: "Sea View Restaurant",       fish: "Mackerel",  qty: 150, sellRate: 320,  payStatus: "PAID",    paidPct: 100, saleStatus: "DELIVERED"  },
    { num: "SAL-2026-017", day: 12, hour: 10, customer: "Vizag Fish Market",         fish: "Seer Fish", qty: 85,  sellRate: 775,  payStatus: "PARTIAL", paidPct: 75,  saleStatus: "DELIVERED"  },
    { num: "SAL-2026-018", day: 13, hour: 10, customer: "Haritha Supermarket",       fish: "Katla",     qty: 95,  sellRate: 365,  payStatus: "PAID",    paidPct: 100, saleStatus: "DELIVERED"  },
    { num: "SAL-2026-019", day: 13, hour: 14, customer: "Blue Ocean Exports",        fish: "Seer Fish", qty: 105, sellRate: 785,  payStatus: "PAID",    paidPct: 100, saleStatus: "DELIVERED"  },
    { num: "SAL-2026-020", day: 14, hour: 10, customer: "Fresh Catch Retail",        fish: "Sardines",  qty: 190, sellRate: 275,  payStatus: "PAID",    paidPct: 100, saleStatus: "DELIVERED"  },

    // Week 3 (Sep 15-21) — 10 sales
    { num: "SAL-2026-021", day: 15, hour: 10, customer: "Andhra Fresh Mart",         fish: "Seer Fish", qty: 85,  sellRate: 770,  payStatus: "PARTIAL", paidPct: 80,  saleStatus: "DELIVERED"  },
    { num: "SAL-2026-022", day: 15, hour: 14, customer: "Sri Lakshmi Hotels",       fish: "Tuna",      qty: 130, sellRate: 510,  payStatus: "PAID",    paidPct: 100, saleStatus: "DELIVERED"  },
    { num: "SAL-2026-023", day: 16, hour: 10, customer: "Ocean Pearl Restaurant",    fish: "Pomfret",   qty: 65,  sellRate: 745,  payStatus: "PAID",    paidPct: 100, saleStatus: "DELIVERED"  },
    { num: "SAL-2026-024", day: 17, hour: 10, customer: "Vizag Fish Market",         fish: "Rohu",      qty: 160, sellRate: 385,  payStatus: "PAID",    paidPct: 100, saleStatus: "DELIVERED"  },
    { num: "SAL-2026-025", day: 18, hour: 10, customer: "Blue Ocean Exports",        fish: "King Fish", qty: 85,  sellRate: 890,  payStatus: "PAID",    paidPct: 100, saleStatus: "DELIVERED"  },
    { num: "SAL-2026-026", day: 18, hour: 14, customer: "Coastal Foods Pvt Ltd",     fish: "Sardines",  qty: 210, sellRate: 280,  payStatus: "PAID",    paidPct: 100, saleStatus: "DELIVERED"  },
    { num: "SAL-2026-027", day: 19, hour: 10, customer: "Royal Caterers",            fish: "Prawns",    qty: 80,  sellRate: 855,  payStatus: "PARTIAL", paidPct: 50,  saleStatus: "DELIVERED"  },
    { num: "SAL-2026-028", day: 19, hour: 14, customer: "Haritha Supermarket",       fish: "Mackerel",  qty: 200, sellRate: 315,  payStatus: "PAID",    paidPct: 100, saleStatus: "DELIVERED"  },
    { num: "SAL-2026-029", day: 20, hour: 10, customer: "Sea View Restaurant",       fish: "Hilsa",     qty: 55,  sellRate: 680,  payStatus: "PAID",    paidPct: 100, saleStatus: "DELIVERED"  },
    { num: "SAL-2026-030", day: 21, hour: 10, customer: "Fresh Catch Retail",        fish: "Sardines",  qty: 150, sellRate: 275,  payStatus: "UNPAID",  paidPct: 0,   saleStatus: "SHIPPED"   },

    // Week 4 (Sep 22-28) — 12 sales
    { num: "SAL-2026-031", day: 22, hour: 10, customer: "Coastal Foods Pvt Ltd",     fish: "Tuna",      qty: 155, sellRate: 520,  payStatus: "PAID",    paidPct: 100, saleStatus: "DELIVERED"  },
    { num: "SAL-2026-032", day: 22, hour: 14, customer: "Sri Lakshmi Hotels",       fish: "Mackerel",  qty: 130, sellRate: 325,  payStatus: "PAID",    paidPct: 100, saleStatus: "DELIVERED"  },
    { num: "SAL-2026-033", day: 23, hour: 10, customer: "Vizag Fish Market",         fish: "Prawns",    qty: 85,  sellRate: 855,  payStatus: "PARTIAL", paidPct: 65,  saleStatus: "DELIVERED"  },
    { num: "SAL-2026-034", day: 23, hour: 14, customer: "Andhra Fresh Mart",         fish: "Rohu",      qty: 130, sellRate: 380,  payStatus: "PAID",    paidPct: 100, saleStatus: "DELIVERED"  },
    { num: "SAL-2026-035", day: 24, hour: 10, customer: "Royal Caterers",            fish: "Rohu",      qty: 160, sellRate: 385,  payStatus: "PAID",    paidPct: 100, saleStatus: "DELIVERED"  },
    { num: "SAL-2026-036", day: 24, hour: 14, customer: "Ocean Pearl Restaurant",    fish: "King Fish", qty: 45,  sellRate: 890,  payStatus: "PAID",    paidPct: 100, saleStatus: "DELIVERED"  },
    { num: "SAL-2026-037", day: 25, hour: 10, customer: "Blue Ocean Exports",        fish: "Tuna",      qty: 155, sellRate: 525,  payStatus: "PAID",    paidPct: 100, saleStatus: "DELIVERED"  },
    { num: "SAL-2026-038", day: 25, hour: 14, customer: "Fresh Catch Retail",        fish: "Katla",     qty: 85,  sellRate: 370,  payStatus: "PARTIAL", paidPct: 55,  saleStatus: "DELIVERED"  },
    { num: "SAL-2026-039", day: 26, hour: 10, customer: "Sea View Restaurant",       fish: "Pomfret",   qty: 55,  sellRate: 750,  payStatus: "PAID",    paidPct: 100, saleStatus: "DELIVERED"  },
    { num: "SAL-2026-040", day: 26, hour: 14, customer: "Haritha Supermarket",       fish: "Mackerel",  qty: 160, sellRate: 315,  payStatus: "PAID",    paidPct: 100, saleStatus: "DELIVERED"  },
    { num: "SAL-2026-041", day: 27, hour: 10, customer: "Fresh Catch Retail",        fish: "Tuna",      qty: 130, sellRate: 510,  payStatus: "PARTIAL", paidPct: 60,  saleStatus: "DELIVERED"  },
    { num: "SAL-2026-042", day: 28, hour: 10, customer: "Coastal Foods Pvt Ltd",     fish: "Seer Fish", qty: 55,  sellRate: 785,  payStatus: "PAID",    paidPct: 100, saleStatus: "DELIVERED"  },

    // Week 4 continued + Week 5 (Sep 28-30) — 8 sales including edge cases
    { num: "SAL-2026-043", day: 28, hour: 14, customer: "Vizag Fish Market",         fish: "Sardines",  qty: 130, sellRate: 280,  payStatus: "PAID",    paidPct: 100, saleStatus: "DELIVERED"  },
    { num: "SAL-2026-044", day: 28, hour: 16, customer: "Sri Lakshmi Hotels",       fish: "Hilsa",     qty: 55,  sellRate: 685,  payStatus: "PAID",    paidPct: 100, saleStatus: "DELIVERED"  },
    { num: "SAL-2026-045", day: 29, hour: 10, customer: "Andhra Fresh Mart",         fish: "Prawns",    qty: 70,  sellRate: 850,  payStatus: "PAID",    paidPct: 100, saleStatus: "DELIVERED"  },
    { num: "SAL-2026-046", day: 29, hour: 12, customer: "Ocean Pearl Restaurant",    fish: "Rohu",      qty: 110, sellRate: 375,  payStatus: "UNPAID",  paidPct: 0,   saleStatus: "CONFIRMED" },
    { num: "SAL-2026-047", day: 29, hour: 14, customer: "Royal Caterers",            fish: "Mackerel",  qty: 130, sellRate: 325,  payStatus: "PAID",    paidPct: 100, saleStatus: "DELIVERED"  },
    { num: "SAL-2026-048", day: 30, hour: 10, customer: "Coastal Foods Pvt Ltd",     fish: "King Fish", qty: 35,  sellRate: 900,  payStatus: "PARTIAL", paidPct: 50,  saleStatus: "PACKED"    },
    // Edge: cancelled sale
    { num: "SAL-2026-049", day: 30, hour: 12, customer: "Fresh Catch Retail",        fish: "Hilsa",     qty: 20,  sellRate: 680,  payStatus: "UNPAID",  paidPct: 0,   saleStatus: "CANCELLED" },
    // Edge: very small transaction
    { num: "SAL-2026-050", day: 30, hour: 14, customer: "Sea View Restaurant",       fish: "Katla",     qty: 30,  sellRate: 370,  payStatus: "PAID",    paidPct: 100, saleStatus: "DELIVERED"  },
  ];

  let totalSalesAmount = 0;
  let totalSalesPaid = 0;
  let totalSalesBalance = 0;
  let salePaymentCounter = 0;
  let invoiceCounter = 0;

  for (const s of sales) {
    const totalAmount = s.qty * s.sellRate;
    const paidAmount = s.payStatus === "PAID" ? totalAmount : s.payStatus === "UNPAID" ? 0 : Math.round(totalAmount * s.paidPct / 100);
    const balanceAmount = totalAmount - paidAmount;

    // Only count non-cancelled sales for totals
    if (s.saleStatus !== "CANCELLED") {
      totalSalesAmount += totalAmount;
      totalSalesPaid += paidAmount;
      totalSalesBalance += balanceAmount;
      inventorySold[s.fish] = (inventorySold[s.fish] || 0) + s.qty;
    }

    const sale = await prisma.sale.create({
      data: {
        saleNumber: s.num,
        customerId: customerMap[s.customer],
        saleDate: dt(s.day, s.hour),
        deliveryDate: s.saleStatus === "DELIVERED" ? dt(s.day, s.hour + 3) : undefined,
        status: s.saleStatus,
        paymentStatus: s.payStatus,
        subtotal: totalAmount,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount,
        paidAmount,
        balanceAmount,
        notes: `Sale of ${s.qty}kg ${s.fish} to ${s.customer}`,
      },
    });

    // Create SaleItem
    const saleItem = await prisma.saleItem.create({
      data: {
        saleId: sale.id,
        fishTypeId: fishTypeMap[s.fish],
        grade: "Grade A",
        weightKg: s.qty,
        unitPricePerKg: s.sellRate,
        totalPrice: totalAmount,
      },
    });

    // Create Inventory Transaction (SALE_OUTWARD) — skip for cancelled
    if (s.saleStatus !== "CANCELLED") {
      await prisma.inventoryTransaction.create({
        data: {
          fishTypeId: fishTypeMap[s.fish],
          transactionType: "SALE_OUTWARD",
          quantityKg: -s.qty, // negative for outward
          unitCost: s.sellRate,
          saleItemId: saleItem.id,
          batchLotNumber: `LOT-${s.num.replace("SAL-", "")}`,
          storageLocation: "Cold Storage A",
          notes: `Outward to ${s.customer}`,
          createdAt: dt(s.day, s.hour, 15),
        },
      });
    }

    // Create Invoice
    invoiceCounter++;
    const invoiceStatus = s.saleStatus === "CANCELLED" ? "CANCELLED" : s.payStatus === "PAID" ? "PAID" : s.payStatus === "PARTIAL" ? "PARTIAL" : "ISSUED";
    await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-2026-${String(invoiceCounter).padStart(3, "0")}`,
        saleId: sale.id,
        customerId: customerMap[s.customer],
        invoiceDate: dt(s.day, s.hour),
        dueDate: dt(Math.min(s.day + 15, 30), s.hour),
        subtotal: totalAmount,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount,
        paidAmount,
        balanceAmount,
        status: invoiceStatus,
        notes: `Invoice for ${s.num}`,
      },
    });

    // Create Payment record if any amount paid and not cancelled
    if (paidAmount > 0 && s.saleStatus !== "CANCELLED") {
      salePaymentCounter++;
      const methods: Array<"CASH" | "UPI" | "BANK_TRANSFER" | "CHEQUE"> = ["CASH", "UPI", "BANK_TRANSFER", "CHEQUE"];
      await prisma.payment.create({
        data: {
          paymentNumber: `PAY-CUST-${String(salePaymentCounter).padStart(3, "0")}`,
          paymentType: "CUSTOMER_RECEIPT",
          amount: paidAmount,
          paymentMethod: methods[salePaymentCounter % methods.length],
          paymentDate: dt(s.day, s.hour + 2),
          referenceNumber: `REF-${s.num}`,
          notes: `Receipt for ${s.num}`,
          customerId: customerMap[s.customer],
          saleId: sale.id,
        },
      });
    }
  }
  console.log(`  ✓ ${sales.length} sales created\n`);

  // ═══════════════════════════════════════════════════════════════
  // 8. EXPENSES (35 records)
  // ═══════════════════════════════════════════════════════════════
  console.log("  Creating expenses...");

  interface ExpenseSpec {
    num: string; day: number; category: string; title: string;
    amount: number; paidTo: string; payMethod: "CASH" | "UPI" | "BANK_TRANSFER";
  }

  const expenses: ExpenseSpec[] = [
    { num: "EXP-2026-001", day: 1,  category: "Ice",               title: "Daily ice supply",                    amount: 2500,  paidTo: "Vizag Ice Factory",        payMethod: "CASH" },
    { num: "EXP-2026-002", day: 2,  category: "Labour",            title: "Unloading & sorting labour",          amount: 4500,  paidTo: "Harbor Labour Union",      payMethod: "CASH" },
    { num: "EXP-2026-003", day: 3,  category: "Transport",         title: "Reefer truck to Kakinada",            amount: 3200,  paidTo: "AP Reefer Logistics",      payMethod: "UPI" },
    { num: "EXP-2026-004", day: 4,  category: "Thermocol Boxes",   title: "Thermocol boxes 25 nos",              amount: 2800,  paidTo: "Sri Balaji Packings",      payMethod: "CASH" },
    { num: "EXP-2026-005", day: 5,  category: "Packing Materials", title: "Polythene liners & tape",             amount: 1700,  paidTo: "National Plastics",        payMethod: "UPI" },
    { num: "EXP-2026-006", day: 7,  category: "Cold Storage",      title: "Weekly cold storage rental",          amount: 5000,  paidTo: "Vizag Cold Storage",       payMethod: "BANK_TRANSFER" },
    { num: "EXP-2026-007", day: 8,  category: "Fuel",              title: "Diesel for delivery van",             amount: 3500,  paidTo: "Indian Oil Petrol Bunk",   payMethod: "CASH" },
    { num: "EXP-2026-008", day: 9,  category: "Ice",               title: "Bulk ice for storage",                amount: 3000,  paidTo: "Vizag Ice Factory",        payMethod: "CASH" },
    { num: "EXP-2026-009", day: 10, category: "Electricity",       title: "Monthly electricity advance",         amount: 3500,  paidTo: "APSPDCL",                  payMethod: "BANK_TRANSFER" },
    { num: "EXP-2026-010", day: 11, category: "Labour",            title: "Grading & filleting labour",          amount: 4800,  paidTo: "Harbor Labour Union",      payMethod: "CASH" },
    { num: "EXP-2026-011", day: 12, category: "Transport",         title: "Local delivery transport",            amount: 2800,  paidTo: "City Logistics",           payMethod: "UPI" },
    { num: "EXP-2026-012", day: 13, category: "Thermocol Boxes",   title: "Thermocol boxes 30 nos",              amount: 3200,  paidTo: "Sri Balaji Packings",      payMethod: "CASH" },
    { num: "EXP-2026-013", day: 14, category: "Cold Storage",      title: "Weekly cold storage rental",          amount: 5000,  paidTo: "Vizag Cold Storage",       payMethod: "BANK_TRANSFER" },
    { num: "EXP-2026-014", day: 15, category: "Transport",         title: "Reefer truck to Srikakulam",          amount: 4200,  paidTo: "AP Reefer Logistics",      payMethod: "UPI" },
    { num: "EXP-2026-015", day: 16, category: "Ice",               title: "Ice supply for packing",              amount: 2800,  paidTo: "Vizag Ice Factory",        payMethod: "CASH" },
    { num: "EXP-2026-016", day: 17, category: "Electricity",       title: "Generator diesel",                    amount: 3500,  paidTo: "Indian Oil Petrol Bunk",   payMethod: "CASH" },
    { num: "EXP-2026-017", day: 18, category: "Labour",            title: "Loading & packing labour",            amount: 5200,  paidTo: "Harbor Labour Union",      payMethod: "CASH" },
    { num: "EXP-2026-018", day: 19, category: "Maintenance",       title: "Freezer compressor repair",           amount: 2000,  paidTo: "Sri Refrigeration Works",  payMethod: "UPI" },
    { num: "EXP-2026-019", day: 20, category: "Packing Materials", title: "Gel packs & sealing tape",            amount: 2100,  paidTo: "National Plastics",        payMethod: "CASH" },
    { num: "EXP-2026-020", day: 21, category: "Cold Storage",      title: "Weekly cold storage rental",          amount: 5000,  paidTo: "Vizag Cold Storage",       payMethod: "BANK_TRANSFER" },
    { num: "EXP-2026-021", day: 21, category: "Thermocol Boxes",   title: "Thermocol boxes 35 nos",              amount: 3700,  paidTo: "Sri Balaji Packings",      payMethod: "CASH" },
    { num: "EXP-2026-022", day: 22, category: "Fuel",              title: "Vehicle fuel & maintenance",          amount: 4000,  paidTo: "Indian Oil Petrol Bunk",   payMethod: "CASH" },
    { num: "EXP-2026-023", day: 23, category: "Packing Materials", title: "Poly crates & strapping",             amount: 2100,  paidTo: "National Plastics",        payMethod: "UPI" },
    { num: "EXP-2026-024", day: 24, category: "Labour",            title: "Sorting & dispatch labour",           amount: 4600,  paidTo: "Harbor Labour Union",      payMethod: "CASH" },
    { num: "EXP-2026-025", day: 25, category: "Labour",            title: "Extra shift packing labour",          amount: 5200,  paidTo: "Harbor Labour Union",      payMethod: "CASH" },
    { num: "EXP-2026-026", day: 26, category: "Transport",         title: "Reefer truck to Nellore",             amount: 4500,  paidTo: "AP Reefer Logistics",      payMethod: "UPI" },
    { num: "EXP-2026-027", day: 27, category: "Ice",               title: "Dry ice for exports",                 amount: 3200,  paidTo: "Vizag Ice Factory",        payMethod: "CASH" },
    { num: "EXP-2026-028", day: 28, category: "Cold Storage",      title: "Weekly cold storage rental",          amount: 5000,  paidTo: "Vizag Cold Storage",       payMethod: "BANK_TRANSFER" },
    { num: "EXP-2026-029", day: 28, category: "Maintenance",       title: "Weighing scale calibration",          amount: 1500,  paidTo: "Precision Instruments",    payMethod: "CASH" },
    { num: "EXP-2026-030", day: 29, category: "Miscellaneous",     title: "Stationery & printing",               amount: 1500,  paidTo: "Sai Xerox & Stationery",   payMethod: "CASH" },
    { num: "EXP-2026-031", day: 29, category: "Transport",         title: "Airport drop for export shipment",    amount: 5500,  paidTo: "AP Reefer Logistics",      payMethod: "BANK_TRANSFER" },
    { num: "EXP-2026-032", day: 30, category: "Labour",            title: "End-of-month cleaning labour",        amount: 3500,  paidTo: "Harbor Labour Union",      payMethod: "CASH" },
    { num: "EXP-2026-033", day: 30, category: "Fuel",              title: "Generator & vehicle fuel",            amount: 3800,  paidTo: "Indian Oil Petrol Bunk",   payMethod: "CASH" },
    { num: "EXP-2026-034", day: 30, category: "Miscellaneous",     title: "Port dues & weighing fees",           amount: 1800,  paidTo: "Port Authority",           payMethod: "BANK_TRANSFER" },
    { num: "EXP-2026-035", day: 30, category: "Electricity",       title: "Month-end electricity payment",       amount: 4200,  paidTo: "APSPDCL",                  payMethod: "BANK_TRANSFER" },
  ];

  let totalExpenseAmount = 0;
  let expPaymentCounter = 0;

  for (const e of expenses) {
    totalExpenseAmount += e.amount;

    const expense = await prisma.expense.create({
      data: {
        expenseNumber: e.num,
        categoryId: expCatMap[e.category],
        title: e.title,
        description: e.title,
        amount: e.amount,
        paidTo: e.paidTo,
        paymentMethod: e.payMethod,
        expenseDate: dt(e.day, 9),
      },
    });

    // Create Payment record
    expPaymentCounter++;
    await prisma.payment.create({
      data: {
        paymentNumber: `PAY-EXP-${String(expPaymentCounter).padStart(3, "0")}`,
        paymentType: "EXPENSE_PAYMENT",
        amount: e.amount,
        paymentMethod: e.payMethod,
        paymentDate: dt(e.day, 9, 30),
        notes: `Payment for ${e.title}`,
        expenseId: expense.id,
      },
    });
  }
  console.log(`  ✓ ${expenses.length} expenses created\n`);

  // ═══════════════════════════════════════════════════════════════
  // 9. PACKING COSTS (10 shipments)
  // ═══════════════════════════════════════════════════════════════
  console.log("  Creating packing cost records...");

  interface PackingSpec {
    day: number; qty: number; boxes: number; costPerBox: number;
    ice: number; oxygen: number; material: number; labour: number; transport: number;
    packingType: string;
  }

  const packingShipments: PackingSpec[] = [
    // Specified shipments
    { day: 3,  qty: 250, boxes: 20, costPerBox: 85,  ice: 1200, oxygen: 300,  material: 450,  labour: 800,  transport: 1500, packingType: "Thermocol Export Packing" },
    { day: 8,  qty: 150, boxes: 12, costPerBox: 90,  ice: 850,  oxygen: 200,  material: 300,  labour: 600,  transport: 1000, packingType: "Thermocol Export Packing" },
    { day: 12, qty: 400, boxes: 30, costPerBox: 80,  ice: 1600, oxygen: 450,  material: 700,  labour: 1100, transport: 2000, packingType: "Thermocol Export Packing" },
    // Small shipments
    { day: 5,  qty: 80,  boxes: 6,  costPerBox: 85,  ice: 400,  oxygen: 100,  material: 150,  labour: 300,  transport: 500,  packingType: "Standard Retail Packing" },
    { day: 15, qty: 60,  boxes: 5,  costPerBox: 90,  ice: 350,  oxygen: 80,   material: 120,  labour: 250,  transport: 400,  packingType: "Standard Retail Packing" },
    // Medium shipments
    { day: 18, qty: 200, boxes: 16, costPerBox: 85,  ice: 1000, oxygen: 250,  material: 380,  labour: 650,  transport: 1200, packingType: "Thermocol Export Packing" },
    { day: 22, qty: 180, boxes: 14, costPerBox: 88,  ice: 900,  oxygen: 220,  material: 340,  labour: 580,  transport: 1100, packingType: "Thermocol Export Packing" },
    // Large shipments
    { day: 25, qty: 350, boxes: 28, costPerBox: 82,  ice: 1500, oxygen: 400,  material: 620,  labour: 1000, transport: 1800, packingType: "Thermocol Export Packing" },
    { day: 28, qty: 300, boxes: 24, costPerBox: 85,  ice: 1300, oxygen: 350,  material: 550,  labour: 900,  transport: 1600, packingType: "Thermocol Export Packing" },
    { day: 30, qty: 450, boxes: 35, costPerBox: 80,  ice: 1800, oxygen: 500,  material: 750,  labour: 1200, transport: 2200, packingType: "Thermocol Export Packing" },
  ];

  let totalPackingCost = 0;

  for (const pk of packingShipments) {
    const boxCost = pk.boxes * pk.costPerBox;
    const total = boxCost + pk.ice + pk.oxygen + pk.material + pk.labour + pk.transport;
    const costPerKg = total / pk.qty;
    totalPackingCost += total;

    await prisma.packingCost.create({
      data: {
        packingType: pk.packingType,
        thermocolBoxesCount: pk.boxes,
        costPerBox: pk.costPerBox,
        thermocolCost: boxCost,
        iceCost: pk.ice,
        oxygenCost: pk.oxygen,
        packingMaterialCost: pk.material,
        labourCost: pk.labour,
        transportCost: pk.transport,
        quantityKg: pk.qty,
        totalCost: total,
        costPerKg: Math.round(costPerKg * 100) / 100,
        notes: `${pk.qty}kg shipment — ${pk.boxes} boxes`,
        createdAt: dt(pk.day, 16),
        updatedAt: dt(pk.day, 16),
      },
    });
  }
  console.log(`  ✓ ${packingShipments.length} packing shipments created\n`);

  // ═══════════════════════════════════════════════════════════════
  // UPDATE SUPPLIER BALANCES
  // ═══════════════════════════════════════════════════════════════
  console.log("  Updating supplier balances...");
  const supplierBalances: Record<string, number> = {};
  for (const p of purchases) {
    const subtotal = p.qty * p.rate;
    const totalAmount = subtotal + p.transport + p.ice + p.labour;
    const paidAmount = p.payStatus === "PAID" ? totalAmount : p.payStatus === "UNPAID" ? 0 : Math.round(totalAmount * p.paidPct / 100);
    const balance = totalAmount - paidAmount;
    supplierBalances[p.supplier] = (supplierBalances[p.supplier] || 0) + balance;
  }
  for (const [name, balance] of Object.entries(supplierBalances)) {
    await prisma.supplier.update({
      where: { id: supplierMap[name] },
      data: { balance },
    });
  }
  console.log("  ✓ Supplier balances updated\n");

  // ═══════════════════════════════════════════════════════════════
  // UPDATE CUSTOMER OUTSTANDING BALANCES
  // ═══════════════════════════════════════════════════════════════
  console.log("  Updating customer outstanding balances...");
  const customerBalances: Record<string, number> = {};
  for (const s of sales) {
    if (s.saleStatus === "CANCELLED") continue;
    const totalAmount = s.qty * s.sellRate;
    const paidAmount = s.payStatus === "PAID" ? totalAmount : s.payStatus === "UNPAID" ? 0 : Math.round(totalAmount * s.paidPct / 100);
    const balance = totalAmount - paidAmount;
    customerBalances[s.customer] = (customerBalances[s.customer] || 0) + balance;
  }
  for (const [name, balance] of Object.entries(customerBalances)) {
    if (customerMap[name]) {
      await prisma.customer.update({
        where: { id: customerMap[name] },
        data: { outstandingBalance: balance },
      });
    }
  }
  console.log("  ✓ Customer balances updated\n");

  // ═══════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════
  const purchaseCharges = purchases.reduce((sum, p) => sum + p.transport + p.ice + p.labour, 0);
  const purchaseSubtotal = purchases.reduce((sum, p) => sum + (p.qty * p.rate), 0);
  const totalCOGS = purchaseSubtotal + purchaseCharges + totalPackingCost;
  const grossProfit = totalSalesAmount - totalCOGS;
  const netProfit = grossProfit - totalExpenseAmount;

  console.log("═══════════════════════════════════════════════════════════");
  console.log("  🐟 COASTAL FRESH SEAFOOD — SEED DATA SUMMARY");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("");
  console.log("  RECORD COUNTS:");
  console.log(`    Admin Users:        1`);
  console.log(`    Suppliers:          ${suppliersData.length}`);
  console.log(`    Customers:          ${customersData.length}`);
  console.log(`    Fish Types:         ${fishTypesData.length}`);
  console.log(`    Purchases:          ${purchases.length}`);
  console.log(`    Sales:              ${sales.length}`);
  console.log(`    Expenses:           ${expenses.length}`);
  console.log(`    Expense Categories: ${expenseCatsData.length}`);
  console.log(`    Packing Shipments:  ${packingShipments.length}`);
  console.log("");
  console.log("  FINANCIAL TOTALS:");
  console.log(`    Total Purchases:          ₹${totalPurchaseAmount.toLocaleString("en-IN")}`);
  console.log(`    Total Sales:              ₹${totalSalesAmount.toLocaleString("en-IN")}`);
  console.log(`    Total Expenses:           ₹${totalExpenseAmount.toLocaleString("en-IN")}`);
  console.log(`    Total Packing Costs:      ₹${totalPackingCost.toLocaleString("en-IN")}`);
  console.log(`    Purchase Subtotal (COGS): ₹${purchaseSubtotal.toLocaleString("en-IN")}`);
  console.log(`    Purchase Charges:         ₹${purchaseCharges.toLocaleString("en-IN")}`);
  console.log(`    Total COGS:               ₹${totalCOGS.toLocaleString("en-IN")}`);
  console.log(`    Gross Profit:             ₹${grossProfit.toLocaleString("en-IN")}`);
  console.log(`    Net Profit:               ₹${netProfit.toLocaleString("en-IN")}`);
  console.log("");
  console.log("  OUTSTANDING:");
  console.log(`    Outstanding Payables:     ₹${totalPurchaseBalance.toLocaleString("en-IN")}`);
  console.log(`    Outstanding Receivables:  ₹${totalSalesBalance.toLocaleString("en-IN")}`);
  console.log("");
  console.log("  INVENTORY (Purchased → Sold → Remaining):");
  for (const ft of fishTypesData) {
    const purchased = inventoryPurchased[ft.name] || 0;
    const sold = inventorySold[ft.name] || 0;
    const remaining = purchased - sold;
    console.log(`    ${ft.name.padEnd(12)} ${String(purchased).padStart(6)} kg → ${String(sold).padStart(6)} kg → ${String(remaining).padStart(6)} kg`);
  }
  console.log("");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  ✅ Database seeded successfully!");
  console.log("═══════════════════════════════════════════════════════════");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
