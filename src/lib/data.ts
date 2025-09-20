import type { Dealer, Bill, InventoryItem, Customer, Sale } from './types';
import fs from 'fs';
import path from 'path';

const dealersPath = path.join(process.cwd(), 'src', 'lib', 'dealers.json');
const billsPath = path.join(process.cwd(), 'src', 'lib', 'bills.json');
const customersPath = path.join(process.cwd(), 'src', 'lib', 'customers.json');
const salesPath = path.join(process.cwd(), 'src', 'lib', 'sales.json');

function readData<T>(filePath: string): T {
  try {
    const jsonString = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(jsonString);
  } catch (error) {
    console.error(`Error reading or parsing ${filePath}:`, error);
    // If file doesn't exist or is empty, return empty array.
    if ((error as NodeJS.ErrnoException).code === 'ENOENT' || error instanceof SyntaxError) {
      // Create the file if it doesn't exist.
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        fs.writeFileSync(filePath, '[]');
      }
      return [] as T;
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


// Mock Data - This will now be read from JSON files
export const getDealers = (): Dealer[] => readData<Dealer[]>(dealersPath);
export const getBills = (): Bill[] => readData<Bill[]>(billsPath);
export const getCustomers = (): Customer[] => readData<Customer[]>(customersPath);
export const getSales = (): Sale[] => readData<Sale[]>(salesPath);


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

export function deleteDealerById(dealerId: string) {
    const dealers = getDealers();
    const bills = getBills();

    const updatedDealers = dealers.filter(d => d.id !== dealerId);
    const updatedBills = bills.filter(b => b.dealerId !== dealerId);

    writeDealers(updatedDealers);
    writeBills(updatedBills);
}


// Helper Functions
export const getDealerById = (id: string) => getDealers().find(d => d.id === id);

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
