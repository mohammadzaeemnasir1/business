import type { Dealer, Bill, InventoryItem, Customer, Sale, User, Session } from './types';
import fs from 'fs';
import path from 'path';

const dealersPath = path.join(process.cwd(), 'src', 'lib', 'dealers.json');
const billsPath = path.join(process.cwd(), 'src', 'lib', 'bills.json');
const customersPath = path.join(process.cwd(), 'src', 'lib', 'customers.json');
const salesPath = path.join(process.cwd(), 'src', 'lib', 'sales.json');
const usersPath = path.join(process.cwd(), 'src', 'lib', 'users.json');
const sessionPath = path.join(process.cwd(), 'src', 'lib', 'session.json');


function readData<T>(filePath: string): T {
  try {
    // Create the file with an empty array/object if it doesn't exist.
    if (!fs.existsSync(filePath)) {
        const initialData = filePath.endsWith('session.json') ? '{}' : '[]';
        fs.writeFileSync(filePath, initialData, 'utf-8');
    }
    const jsonString = fs.readFileSync(filePath, 'utf-8');
    // If the file is empty, return an empty array/object to prevent JSON parsing errors.
    if (jsonString.trim() === '') {
        return (filePath.endsWith('session.json') ? {} : []) as T;
    }
    return JSON.parse(jsonString);
  } catch (error) {
    console.error(`Error reading or parsing ${filePath}:`, error);
     if (error instanceof SyntaxError) {
        // If JSON is invalid, return empty array/object
        return (filePath.endsWith('session.json') ? {} : []) as T;
    }
    throw error;
  }
}

function writeDealers(data: Dealer[]) {
  fs.writeFileSync(dealersPath, JSON.stringify(data, null, 2));
}

function writeBills(data: Bill[]) {
  fs.writeFileSync(billsPath, JSON.stringify(data, null, 2));
}

function writeCustomers(data: Customer[]) {
  fs.writeFileSync(customersPath, JSON.stringify(data, null, 2));
}

function writeSales(data: Sale[]) {
  fs.writeFileSync(salesPath, JSON.stringify(data, null, 2));
}

function writeUsers(data: User[]) {
    fs.writeFileSync(usersPath, JSON.stringify(data, null, 2));
}

function writeSession(data: Session) {
    fs.writeFileSync(sessionPath, JSON.stringify(data, null, 2));
}


// Mock Data - This will now be read from JSON files
export const getDealers = (): Dealer[] => readData<Dealer[]>(dealersPath);
export const getBills = (): Bill[] => readData<Bill[]>(billsPath);
export const getCustomers = (): Customer[] => readData<Customer[]>(customersPath);
export const getSales = (): Sale[] => readData<Sale[]>(salesPath);
export const getUsers = (): User[] => readData<User[]>(usersPath);
export const getSession = (): Session => readData<Session>(sessionPath);


export function saveDealer(dealer: Dealer) {
    const dealers = getDealers();
    const existingIndex = dealers.findIndex(d => d.id === dealer.id);
    if (existingIndex > -1) {
        dealers[existingIndex] = dealer;
    } else {
        dealers.push(dealer);
    }
    writeDealers(dealers);
}

export function saveBill(bill: Bill) {
    const bills = getBills();
    const existingIndex = bills.findIndex(b => b.id === bill.id);
    if (existingIndex > -1) {
        bills[existingIndex] = bill;
    } else {
        bills.push(bill);
    }
    writeBills(bills);
}

export function saveCustomer(customer: Customer) {
    const customers = getCustomers();
    const existingIndex = customers.findIndex(c => c.id === customer.id);
    if (existingIndex > -1) {
        customers[existingIndex] = customer;
    } else {
        customers.push(customer);
    }
    writeCustomers(customers);
}

export function saveSale(sale: Sale) {
    const sales = getSales();
    const existingIndex = sales.findIndex(s => s.id === sale.id);
     if (existingIndex > -1) {
        sales[existingIndex] = sale;
    } else {
       sales.push(sale);
    }
    writeSales(sales);
}

export function saveUser(user: User) {
    const users = getUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    if (existingIndex > -1) {
        users[existingIndex] = user;
    } else {
        users.push(user);
    }
    writeUsers(users);
}

export function saveSession(session: Session) {
    writeSession(session);
}

export function clearSession() {
    writeSession({});
}


export function deleteDealerById(dealerId: string) {
    const dealers = getDealers();
    const bills = getBills();

    const updatedDealers = dealers.filter(d => d.id !== dealerId);
    const updatedBills = bills.filter(b => b.dealerId !== dealerId);

    writeDealers(updatedDealers);
    writeBills(updatedBills);
}

export function deleteUserById(userId: string) {
    const users = getUsers();
    const updatedUsers = users.filter(u => u.id !== userId);
    writeUsers(updatedUsers);
}

export function deleteSaleById(saleId: string) {
    const sales = getSales();
    const saleToDelete = sales.find(s => s.id === saleId);

    if (!saleToDelete) {
        return; // Or throw an error
    }

    // Restock inventory
    for (const item of saleToDelete.items) {
        const inventoryItem = getInventoryItemById(item.inventoryItemId);
        if (inventoryItem) {
            inventoryItem.quantity += item.quantity;
            updateInventoryItem(inventoryItem);
        }
    }

    const updatedSales = sales.filter(s => s.id !== saleId);
    writeSales(updatedSales);
}


// Helper Functions
export const getDealerById = (id: string) => getDealers().find(d => d.id === id);

export const getSaleById = (id: string) => getSales().find(s => s.id === id);

export const getCustomerById = (id: string) => getCustomers().find(c => c.id === id);
export const getCustomerByName = (name: string) => getCustomers().find(c => c.name.toLowerCase() === name.toLowerCase());

export const getSalesByCustomerId = (customerId: string) => getSales().filter(s => s.customerId === customerId);

export const getUserById = (id: string) => getUsers().find(u => u.id === id);

export const getUserByEmail = (email: string) => getUsers().find(u => u.email?.toLowerCase() === email.toLowerCase());

export const getBillsForDealer = (dealerId: string) => getBills().filter(b => b.dealerId === dealerId);

export const getPaidAmountForBill = (bill: Bill) => bill.payments.reduce((acc, p) => acc + p.amount, 0);

export const getOutstandingBalanceForBill = (bill: Bill) => bill.totalAmount - getPaidAmountForBill(bill);

export const getOutstandingBalanceForDealer = (dealerId: string) => {
  const dealerBills = getBillsForDealer(dealerId);
  return dealerBills.reduce((total, bill) => total + getOutstandingBalanceForBill(bill), 0);
};

export const getTotalOutstandingDebt = () => {
  return getDealers().reduce((total, dealer) => total + getOutstandingBalanceForDealer(dealer.id), 0);
};

export const getAllInventoryItems = (): InventoryItem[] => {
    return getBills().flatMap(b => b.items);
}

export const getInventoryItemById = (id: string): InventoryItem | undefined => {
    const bills = getBills();
    for (const bill of bills) {
        const item = bill.items.find(i => i.id === id);
        if (item) {
            return item;
        }
    }
    return undefined;
}

export function updateInventoryItem(updatedItem: InventoryItem) {
    const bills = getBills();
    for (const bill of bills) {
        const itemIndex = bill.items.findIndex(i => i.id === updatedItem.id);
        if (itemIndex > -1) {
            bill.items[itemIndex] = updatedItem;
            writeBills(bills);
            return;
        }
    }
}


export const getTotalInventoryValue = () => {
    return getAllInventoryItems().reduce((total, item) => total + (item.quantity * item.costPerUnit), 0);
}

export const getAllPayments = () => {
    return getBills().flatMap(b => {
        const dealer = getDealerById(b.dealerId);
        return b.payments.map(p => ({
            ...p,
            dealerName: dealer?.name || 'Unknown',
            billNumber: b.billNumber,
        }));
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
