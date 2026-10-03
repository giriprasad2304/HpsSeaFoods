export type PartyType = "SUPPLIER" | "CUSTOMER";

export interface FishItemDTO {
  fishTypeId: string;
  fishName: string;
  fishCode: string;
  category: string;
  grade: string;
  weightKg: number;
  unitPricePerKg: number;
  totalCost: number;
  fishCount?: number | null;
  notes?: string | null;
}

export interface CostBreakdownDTO {
  rawFishCost: number;
  iceCost: number;
  transportCost: number;
  labourCost: number;
  packingCost: number;
  thermocolBoxCost: number;
  oxygenCost: number;
  taxAmount: number;
  discountAmount: number;
  otherCost: number;
  totalCost: number;
}

export interface LinkedExpenseDTO {
  id: string;
  expenseNumber: string;
  categoryName: string;
  categoryCode?: string;
  title: string;
  amount: number;
  paidTo?: string | null;
  paymentMethod: string;
  expenseDate: string;
  notes?: string | null;
}

export interface PartyTransactionDTO {
  id: string;
  transactionNumber: string; // e.g., PUR-2026-001 or SAL-2026-001
  date: string;
  type: "PURCHASE" | "SALE";
  status: string;
  totalWeightKg: number;
  costs: CostBreakdownDTO;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: "UNPAID" | "PARTIAL" | "PAID" | "REFUNDED";
  paymentMethod?: string | null;
  items: FishItemDTO[];
  expenses?: LinkedExpenseDTO[];
  notes?: string | null;
  metadata?: {
    harborLocation?: string | null;
    boatName?: string | null;
    truckNumber?: string | null;
    deliveryDate?: string | null;
    invoiceNumber?: string | null;
    thermocolBoxesCount?: number;
    costPerBox?: number;
  };
}

export interface PartyPaymentRecordDTO {
  id: string;
  paymentNumber: string;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string | null;
  relatedTransactionNumber?: string | null;
  notes?: string | null;
}

export interface FishSpeciesVolumeDTO {
  fishName: string;
  fishCode: string;
  category: string;
  totalWeightKg: number;
  totalAmount: number;
  averageRatePerKg: number;
  transactionCount: number;
}

export interface PartyLedgerDTO {
  partyType: PartyType;
  party: {
    id: string;
    code: string;
    name: string;
    companyName?: string | null;
    phone: string;
    email?: string | null;
    address?: string | null;
    boatName?: string | null;
    harborLocation?: string | null;
    creditLimit?: number;
    rating?: number;
    isActive: boolean;
  };
  financialSummary: {
    totalTransactionsCount: number;
    totalWeightKg: number;
    totalBilledAmount: number;
    totalPaidAmount: number;
    totalOutstandingAmount: number; // Balance to Pay for Supplier, Balance to Get for Customer
    costBreakdown: CostBreakdownDTO;
  };
  transactions: PartyTransactionDTO[];
  payments: PartyPaymentRecordDTO[];
  speciesBreakdown: FishSpeciesVolumeDTO[];
  generatedAt: string;
}
