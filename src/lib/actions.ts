"use server";

import { revalidatePath } from "next/cache";
import { getDealers, saveDealer, getBills, saveBill, deleteDealerById, getCustomers, saveCustomer, getSales, saveSale, getInventoryItemById, updateInventoryItem, saveUser, getUserByEmail, getUsers, saveSession, clearSession, getUserById, deleteUserById, deleteSaleById } from "./data";
import type { Dealer, Bill, InventoryItem, Payment, Sale, Customer, SaleItem, User } from "./types";
import { format } from "date-fns";
import { redirect } from "next/navigation";

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
  payer: string | null;
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
  revalidatePath("/inventory");


  return newBill;
}

export async function deleteDealer(dealerId: string) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    deleteDealerById(dealerId);

    revalidatePath("/dealers");
    revalidatePath("/dashboard");
    revalidatePath("/inventory");
}

export async function addSale(data: {
    customerId: string;
    customerName: string;
    customerContact?: string;
    saleType: 'cash' | 'credit';
    items: { inventoryItemId: string; quantity: number; salePrice: number }[];
    amountPaid: number;
    paymentMethod: 'cash' | 'card' | 'mobile_payment';
}) {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const customers = getCustomers();
    // customerId can be an ID or a new customer name
    let customer = customers.find(c => c.id === data.customerId);

    if (!customer) {
        // It's a new customer, create them. The ID is the name.
        const newId = (customers.length > 0 ? Math.max(...customers.map(c => parseInt(c.id))) : 0) + 1;
        customer = {
            id: newId.toString(),
            name: data.customerName,
            contact: data.customerContact,
            avatarUrl: `https://picsum.photos/seed/cust${newId}/40/40`,
        };
        saveCustomer(customer);
    } else {
        if (data.customerContact && customer.contact !== data.customerContact) {
            customer.contact = data.customerContact;
            saveCustomer(customer);
        }
    }
    
    const sales = getSales();
    const newSaleId = (sales.length > 0 ? Math.max(...sales.map(s => parseInt(s.id.replace('s', '')))) : 0) + 1;

    const newSale: Sale = {
        id: `s${newSaleId}`,
        customerId: customer.id,
        date: format(new Date(), "yyyy-MM-dd"),
        saleType: data.saleType,
        items: data.items,
        amountPaid: data.amountPaid,
        paymentMethod: data.paymentMethod,
    };

    saveSale(newSale);

    // Update inventory
    for (const item of data.items) {
        const inventoryItem = getInventoryItemById(item.inventoryItemId);
        if (inventoryItem) {
            inventoryItem.quantity -= item.quantity;
            updateInventoryItem(inventoryItem);
        }
    }
    
    revalidatePath("/customers");
    revalidatePath("/inventory");
    revalidatePath("/dashboard");

    return newSale;
}

export async function deleteSale(saleId: string) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    deleteSaleById(saleId);
    revalidatePath("/customers");
    revalidatePath("/inventory");
    revalidatePath("/dashboard");
}


export async function registerUser(data: { name: string, email: string, password?: string, role?: "admin" | "sales" | "Pending" }) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const { name, email, password, role } = data;

    const users = getUsers();
    const existingUser = getUserByEmail(email);

    if (existingUser) {
        return { error: "User with this email already exists." };
    }

    const newId = (users.length > 0 ? Math.max(...users.map(u => parseInt(u.id))) : 0) + 1;

    // In a real app, you MUST hash the password. Storing plain text is insecure.
    const newUser: User = {
        id: newId.toString(),
        name,
        email,
        password, // This is insecure, for demonstration only.
        role: role || "Pending",
    };

    saveUser(newUser);

    revalidatePath("/login");
    revalidatePath("/admin");
    
    return { success: true };
}

export async function updateUser(data: { id: string, name: string, email: string, password?: string, role: "admin" | "sales" | "Pending" }) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const { id, name, email, password, role } = data;

    const user = getUserById(id);
    if (!user) {
        return { error: "User not found." };
    }

    const otherUser = getUserByEmail(email);
    if (otherUser && otherUser.id !== id) {
        return { error: "Another user with this username already exists." };
    }
    
    user.name = name;
    user.email = email;
    user.role = role;
    if (password) {
        user.password = password;
    }
    
    saveUser(user);

    revalidatePath("/admin");
    
    return { success: true };
}

export async function deleteUser(userId: string) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    deleteUserById(userId);
    revalidatePath("/admin");
}


export async function signIn(data: {email: string, password?: string}) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const { email, password } = data;

    const user = getUserByEmail(email);

    if (!user || user.password !== password) {
        return "Invalid username or password.";
    }

    saveSession({ userId: user.id });

    revalidatePath("/", "layout");
    redirect('/dashboard');
}

export async function signOut() {
    clearSession();
    revalidatePath("/", "layout");
    redirect('/login');
}
