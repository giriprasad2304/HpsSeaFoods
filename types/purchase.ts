import type {
  PaymentMethod,
  PaymentStatus,
  PurchaseStatus,
  SupplierDTO,
  FishTypeDTO,
} from "./index";

export interface PurchaseItemInput {
  fishTypeId: string;
  grade?: string;
  weightKg: number; // Quantity in kg
  unitPricePerKg: number; // Rate per kg
  totalCost?: number; // Calculated: Quantity * Rate/kg
  temperatureC?: number | null;
  notes?: string | null;
}

export interface PurchaseItemDetailDTO {
  id: string;
  purchaseId: string;
  fishTypeId: string;
  fishTypeName: string;
  fishTypeCode: string;
  grade: string;
  fishCount?: number | null;
  weightKg: number; // Landed gross weight
  spoiledWeightKg?: number; // Rejected / spoiled weight
  spoilageReason?: string | null;
  effectiveWeightKg?: number; // weightKg - spoiledWeightKg
  unitPricePerKg: number;
  totalCost: number;
  temperatureC?: number | null;
  notes?: string | null;
  createdAt: string;
}

export interface UpdatePurchaseSpoilageItemInput {
  itemId: string;
  spoiledWeightKg: number;
  spoilageReason?: string | null;
}

export interface UpdatePurchaseSpoilageInput {
  items: UpdatePurchaseSpoilageItemInput[];
}

export interface CreatePurchaseInput {
  purchaseNumber?: string;
  supplierId: string;
  purchaseDate: string;
  landingHarbor?: string | null;
  truckNumber?: string | null;
  transportCharges?: number;
  iceCharges?: number;
  labourCharges?: number;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  initialPaidAmount?: number;
  notes?: string | null;
  invoiceUrl?: string | null;
  invoiceFileName?: string | null;
  invoiceFileType?: string | null;
  invoiceFileSize?: number | null;
  items: PurchaseItemInput[];
}

export interface UpdatePurchaseInput extends Partial<CreatePurchaseInput> {
  status?: PurchaseStatus;
}

export interface RecordPurchasePaymentInput {
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  referenceNumber?: string | null;
  notes?: string | null;
}

export interface PurchaseDetailDTO {
  id: string;
  purchaseNumber: string;
  supplierId: string;
  supplierName: string;
  supplierPhone: string;
  supplierBoatName?: string | null;
  purchaseDate: string;
  status: PurchaseStatus;
  totalWeightKg: number;
  subtotal: number;
  transportCharges: number;
  iceCharges: number;
  labourCharges: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  landingHarbor?: string | null;
  truckNumber?: string | null;
  invoiceUrl?: string | null;
  invoiceFileName?: string | null;
  invoiceFileType?: string | null;
  invoiceFileSize?: number | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  items: PurchaseItemDetailDTO[];
  payments: Array<{
    id: string;
    paymentNumber: string;
    amount: number;
    paymentMethod: PaymentMethod;
    paymentDate: string;
    referenceNumber?: string | null;
    notes?: string | null;
  }>;
}

export interface PurchaseFilterParams {
  date?: string;
  month?: string; // e.g. "09" or "9"
  year?: string; // e.g. "2026"
  supplierId?: string;
  fishTypeId?: string;
  paymentStatus?: PaymentStatus | "ALL";
  invoiceNumber?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PurchaseLookupsDTO {
  suppliers: SupplierDTO[];
  fishTypes: FishTypeDTO[];
}
