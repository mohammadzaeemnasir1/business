"use server";

import { revalidatePath } from "next/cache";
import { getDealers, saveDealer, getBills, saveBill, deleteDealerById } from "./data";
import type { Dealer, Bill, InventoryItem, Payment } from "./types";
import { format } from "date-fns";

export async function addDealer(data: { name: string; contact: string }) {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const dealers = getDealers();
  const newId = (dealers.length > 0 ? Math.max(...dealers.map(d => parseInt(d.id))) : 0) + 1;
  const newDealer: Dealer = {
    id: newId.toString(),
    name: data.name,
    contact: data.contact,
    avatarUrl: `https://picsum.photos/seed/${newId}/40/40`,
  };

  saveDealer(newDealer);

  revalidatePath("/dealers");
  revalidatePath("/dashboard");

  return newDealer;
}

type BillItem = {
    name: string;
    pricePerPiece: number;
    quantity: number;
};

export async function addBill(data: {
  dealerId: string;
  billNumber: string;
  date: Date;
  items: BillItem[];
  paidAmount: number;
  payer: 'Muhammad Faisal' | 'Mr. Hafiz Abdul Rasheed' | null;
}) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  const bills = getBills();
  const allItems = bills.flatMap(b => b.items);
  const newBillId = (bills.length > 0 ? Math.max(...bills.map(b => parseInt(b.id.replace('b', '')))) : 0) + 1;
  const newItemIdBase = (allItems.length > 0 ? Math.max(...allItems.map(i => parseInt(i.id.replace('i', '')))) : 0) + 1;
  const newPaymentIdBase = (bills.flatMap(b => b.payments).length > 0 ? Math.max(...bills.flatMap(b => b.payments).map(p => parseInt(p.id.replace('p', '')))) : 0) + 1;

  const totalAmount = data.items.reduce((acc, item) => acc + item.pricePerPiece * item.quantity, 0);

  const newItems: InventoryItem[] = data.items.map((item, index) => ({
      id: `i${newItemIdBase + index}`,
      brand: item.name, // Using name as brand for now
      description: item.name,
      quantity: item.quantity,
      costPerUnit: item.pricePerPiece,
  }));

  const newPayments: Payment[] = [];
  if (data.paidAmount > 0 && data.payer) {
      newPayments.push({
          id: `p${newPaymentIdBase}`,
          amount: data.paidAmount,
          date: format(data.date, "yyyy-MM-dd"),
          payer: data.payer,
      });
  }

  const newBill: Bill = {
    id: `b${newBillId}`,
    dealerId: data.dealerId,
    billNumber: data.billNumber,
    date: format(data.date, "yyyy-MM-dd"),
    totalAmount: totalAmount,
    payments: newPayments,
    items: newItems,
  };

  saveBill(newBill);

  revalidatePath(`/dealers/${data.dealerId}`);
  revalidatePath("/dashboard");

  return newBill;
}

export async function deleteDealer(dealerId: string) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    deleteDealerById(dealerId);

    revalidatePath("/dealers");
    revalidatePath("/dashboard");
}
