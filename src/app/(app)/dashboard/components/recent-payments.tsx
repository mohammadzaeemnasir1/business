import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

type RecentPaymentsProps = {
  payments: {
    id: string;
    amount: number;
    date: string;
    payer: "Muhammad Faisal" | "Mr. Hafiz Abdul Rasheed";
    dealerName: string;
    billNumber: string;
  }[];
};

export function RecentPayments({ payments }: RecentPaymentsProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Payments</CardTitle>
        <CardDescription>The 5 most recent payments made.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dealer</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  <div className="font-medium">{payment.dealerName}</div>
                  <div className="text-sm text-muted-foreground">
                    by {payment.payer} on {new Date(payment.date).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(payment.amount)}
                </TableCell>
              </TableRow>
            ))}
            {payments.length === 0 && (
                <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                        No payments found.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
