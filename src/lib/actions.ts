"use server";

import { revalidatePath } from "next/cache";
import { dealers } from "./data";
import type { Dealer } from "./types";

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
