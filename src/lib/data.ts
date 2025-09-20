import type { Dealer, Bill, InventoryItem } from './types';

// Mock Data
export const dealers: Dealer[] = [
  { id: '1', name: 'Sana Safinaz Official', contact: 'sales@sanasafinaz.com', avatarUrl: 'https://picsum.photos/seed/1/40/40' },
  { id: '2', name: 'Sapphire Retail', contact: 'support@sapphire.pk', avatarUrl: 'https://picsum.photos/seed/2/40/40' },
  { id: '3', name: 'Khaadi Fabrics', contact: 'info@khaadi.com', avatarUrl: 'https://picsum.photos/seed/3/40/40' },
  { id: '4', name: 'Gul Ahmed Ideas', contact: 'care@gulahmed.com', avatarUrl: 'https://picsum.photos/seed/4/40/40' },
];

export const bills: Bill[] = [
  {
    id: 'b1',
    dealerId: '1',
    billNumber: 'SS-2024-001',
    date: '2024-05-01',
    totalAmount: 150000,
    payments: [
      { id: 'p1', amount: 100000, date: '2024-05-02', payer: 'Faisal' },
    ],
    items: [
      { id: 'i1', brand: 'Sana Safinaz', description: 'Luxury Lawn Suit', quantity: 20, costPerUnit: 5000 },
      { id: 'i2', brand: 'Sana Safinaz', description: 'Embroidered Unstitched', quantity: 10, costPerUnit: 5000 },
    ],
  },
  {
    id: 'b2',
    dealerId: '2',
    billNumber: 'SAP-2024-005',
    date: '2024-05-10',
    totalAmount: 220000,
    payments: [
      { id: 'p2', amount: 150000, date: '2024-05-11', payer: 'Hafiz' },
      { id: 'p3', amount: 50000, date: '2024-05-20', payer: 'Faisal' },
    ],
    items: [
      { id: 'i3', brand: 'Sapphire', description: 'Printed Lawn 3-Piece', quantity: 50, costPerUnit: 3000 },
      { id: 'i4', brand: 'Sapphire', description: 'West-Pret Kurti', quantity: 20, costPerUnit: 3500 },
    ],
  },
  {
    id: 'b3',
    dealerId: '3',
    billNumber: 'KH-2024-112',
    date: '2024-05-15',
    totalAmount: 80000,
    payments: [],
    items: [
      { id: 'i5', brand: 'Khaadi', description: 'Unstitched 2-Piece', quantity: 20, costPerUnit: 4000 },
    ],
  },
   {
    id: 'b4',
    dealerId: '1',
    billNumber: 'SS-2024-002',
    date: '2024-06-01',
    totalAmount: 75000,
    payments: [
      { id: 'p4', amount: 75000, date: '2024-06-02', payer: 'Faisal' },
    ],
    items: [
      { id: 'i6', brand: 'Sana Safinaz', description: 'Ready-to-wear Kurta', quantity: 15, costPerUnit: 5000 },
    ],
  },
  {
    id: 'b5',
    dealerId: '4',
    billNumber: 'GA-2024-030',
    date: '2024-06-05',
    totalAmount: 300000,
    payments: [
      { id: 'p5', amount: 150000, date: '2024-06-06', payer: 'Hafiz' },
    ],
    items: [
      { id: 'i7', brand: 'Gul Ahmed', description: 'Festive Collection Suit', quantity: 30, costPerUnit: 7000 },
      { id: 'i8', brand: 'Gul Ahmed', description: 'Ideas Home Bedding', quantity: 10, costPerUnit: 9000 },
    ],
  },
];

// Helper Functions
export const getDealers = () => dealers;

export const getDealerById = (id: string) => dealers.find(d => d.id === id);

export const getBillsForDealer = (dealerId: string) => bills.filter(b => b.dealerId === dealerId);

export const getPaidAmountForBill = (bill: Bill) => bill.payments.reduce((acc, p) => acc + p.amount, 0);

export const getOutstandingBalanceForBill = (bill: Bill) => bill.totalAmount - getPaidAmountForBill(bill);

export const getOutstandingBalanceForDealer = (dealerId: string) => {
  const dealerBills = getBillsForDealer(dealerId);
  return dealerBills.reduce((total, bill) => total + getOutstandingBalanceForBill(bill), 0);
};

export const getTotalOutstandingDebt = () => {
  return dealers.reduce((total, dealer) => total + getOutstandingBalanceForDealer(dealer.id), 0);
};

export const getAllInventoryItems = (): InventoryItem[] => {
    return bills.flatMap(b => b.items);
}

export const getTotalInventoryValue = () => {
    return getAllInventoryItems().reduce((total, item) => total + (item.quantity * item.costPerUnit), 0);
}

export const getAllPayments = () => {
    return bills.flatMap(b => {
        const dealer = getDealerById(b.dealerId);
        return b.payments.map(p => ({
            ...p,
            dealerName: dealer?.name || 'Unknown',
            billNumber: b.billNumber,
        }));
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
