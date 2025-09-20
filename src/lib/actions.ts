"use server";

import { revalidatePath } from "next/cache";
import { getDealers, saveDealer, getBills, saveBill } from "./data";
import type { Dealer, Bill } from "./types";
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

export async function addBill(data: {
  dealerId: string;
  billNumber: string;
  date: Date;
  totalAmount: number;
}) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  const bills = getBills();
  const newId = (bills.length > 0 ? Math.max(...bills.map(b => parseInt(b.id.replace('b', '')))) : 0) + 1;

  const newBill: Bill = {
    id: `b${newId}`,
    dealerId: data.dealerId,
    billNumber: data.billNumber,
    date: format(data.date, "yyyy-MM-dd"),
    totalAmount: data.totalAmount,
    payments: [],
    items: [], // For now, we don't add items when creating a bill
  };

  saveBill(newBill);

  revalidatePath(`/dealers/${data.dealerId}`);
  revalidatePath("/dashboard");

  return newBill;
}
