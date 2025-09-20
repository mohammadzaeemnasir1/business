"use server";

import { revalidatePath } from "next/cache";
import { dealers, bills } from "./data";
import type { Dealer, Bill } from "./types";
import { format } from "date-fns";

export async function addDealer(data: { name: string; contact: string }) {
  // In a real app, you'd be saving this to a database.
  // Here, we're just adding to the in-memory array.
  
  // Create a delay to simulate db call
  await new Promise(resolve => setTimeout(resolve, 1000));

  const newId = (dealers.length + 1).toString();
  const newDealer: Dealer = {
    id: newId,
    name: data.name,
    contact: data.contact,
    avatarUrl: `https://picsum.photos/seed/${newId}/40/40`,
  };

  dealers.push(newDealer);

  // Revalidate the dealers page to show the new dealer
  revalidatePath("/dealers");

  return newDealer;
}

export async function addBill(data: {
  dealerId: string;
  billNumber: string;
  date: Date;
  totalAmount: number;
}) {
  // In a real app, you'd be saving this to a database.
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const newBill: Bill = {
    id: `b${bills.length + 1}`,
    dealerId: data.dealerId,
    billNumber: data.billNumber,
    date: format(data.date, "yyyy-MM-dd"),
    totalAmount: data.totalAmount,
    payments: [],
    items: [], // For now, we don't add items when creating a bill
  };

  bills.push(newBill);

  // Revalidate the dealer detail page to show the new bill
  revalidatePath(`/dealers/${data.dealerId}`);
  // Also revalidate dashboard page as it might be affected
  revalidatePath("/dashboard");

  return newBill;
}
