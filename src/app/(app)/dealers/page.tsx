import { PageHeader } from "@/components/page-header";
import { getDealers, getOutstandingBalanceForDealer } from "@/lib/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AddDealerForm } from "./components/add-dealer-form";
import { DeleteDealerDialog } from "./components/delete-dealer-dialog";

export default function DealersPage() {
  const dealers = getDealers();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Dealers"
          description="Manage your relationships with suppliers."
        />
        <AddDealerForm />
      </div>
      
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dealer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">Outstanding Balance</TableHead>
              <TableHead className="w-[180px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dealers.map((dealer) => {
              const outstandingBalance = getOutstandingBalanceForDealer(dealer.id);
              return (
                <TableRow key={dealer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={dealer.avatarUrl} alt={dealer.name} data-ai-hint="portrait person" />
                        <AvatarFallback>{dealer.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{dealer.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{dealer.contact}</TableCell>
                  <TableCell className={`text-right font-semibold ${outstandingBalance > 0 ? 'text-destructive' : 'text-green-600'}`}>
                    {formatCurrency(outstandingBalance)}
                  </TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dealers/${dealer.id}`}>View Details</Link>
                    </Button>
                    <DeleteDealerDialog dealerId={dealer.id} />
                  </TableCell>
                </TableRow>
              );
            })}
             {dealers.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                        No dealers found.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
