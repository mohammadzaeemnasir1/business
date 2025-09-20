export interface Dealer {
  id: string;
  name: string;
  contact: string;
  avatarUrl: string;
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  payer: 'Muhammad Faisal' | 'Mr. Hafiz Abdul Rasheed';
}

export interface InventoryItem {
  id:string;
  brand: string;
  description: string;
  quantity: number;
  costPerUnit: number;
  name?: string; // Add name property
  pricePerPiece?: number; // Add pricePerPiece property
}

export interface Bill {
  id: string;
  dealerId: string;
  billNumber: string;
  date: string;
  totalAmount: number;
  payments: Payment[];
  items: InventoryItem[];
}

export interface Customer {
  id: string;
  name: string;
  contact?: string;
  avatarUrl: string;
}

export interface SaleItem {
  inventoryItemId: string;
  quantity: number;
  salePrice: number;
}

export interface Sale {
  id: string;
  customerId: string;
  date: string;
  saleType: "cash" | "credit";
  items: SaleItem[];
  amountPaid: number;
  paymentMethod: "cash" | "card" | "mobile_payment";
}
