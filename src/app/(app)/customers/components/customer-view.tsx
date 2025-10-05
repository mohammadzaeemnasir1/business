"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { SalesList } from "./sales-list";
import { CustomerList } from "./customer-list";
import type { Customer, Sale, InventoryItem } from "@/lib/types";

type CustomerViewProps = {
    customers: Customer[];
    sales: Sale[];
    inventoryItems: InventoryItem[];
}

export function CustomerView({ customers, sales, inventoryItems }: CustomerViewProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCustomers = useMemo(() => {
    if (!searchQuery) {
      return customers;
    }
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.contact?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [customers, searchQuery]);

  return (
    <Tabs defaultValue="sales">
      <TabsList>
        <TabsTrigger value="sales">All Sales</TabsTrigger>
        <TabsTrigger value="customers">All Customers</TabsTrigger>
      </TabsList>
      <TabsContent value="sales">
        <SalesList
          sales={sales}
          customers={customers}
          inventoryItems={inventoryItems}
        />
      </TabsContent>
      <TabsContent value="customers" className="space-y-4">
        <div className="flex justify-end">
          <Input
            placeholder="Search by name or contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <CustomerList customers={filteredCustomers} sales={sales} />
      </TabsContent>
    </Tabs>
  );
}
