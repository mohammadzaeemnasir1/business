"use client";

import { useState } from "react";
import {
  getFinancialOverview,
  FinancialOverviewOutput,
} from "@/ai/flows/financial-overview-llm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

type FinancialOverviewProps = {
  dealers: {
    name: string;
    outstandingBalance: number;
  }[];
};

export function FinancialOverview({ dealers }: FinancialOverviewProps) {
  const [marketConditions, setMarketConditions] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FinancialOverviewOutput | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const output = await getFinancialOverview({
        dealers,
        marketConditions,
      });
      setResult(output);
    } catch (err) {
      console.error(err);
      setError("Failed to generate financial overview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="text-primary" />
          <span>AI Financial Overview</span>
        </CardTitle>
        <CardDescription>
          Get an AI-powered estimation of outstanding debt based on current
          market conditions.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} className="flex-grow flex flex-col">
        <CardContent className="space-y-4 flex-grow">
          <div className="space-y-2">
            <Label htmlFor="market-conditions">Market Conditions (Optional)</Label>
            <Textarea
              id="market-conditions"
              placeholder="e.g., 'Recession fears are high, potential for delayed payments.'"
              value={marketConditions}
              onChange={(e) => setMarketConditions(e.target.value)}
              disabled={loading}
            />
          </div>
          {result && (
            <div className="space-y-4 pt-4">
              <h3 className="font-semibold text-lg">{result.summary}</h3>
              <div className="space-y-4">
                {result.estimatedDebt.map((debt, index) => (
                    <div key={index} className="space-y-2">
                         <div className="flex justify-between items-baseline">
                            <p className="font-medium">{debt.dealerName}</p>
                            <p className="text-lg font-bold text-primary">{formatCurrency(debt.estimatedOutstanding)}</p>
                         </div>
                         <p className="text-sm text-muted-foreground italic">"{debt.reasoning}"</p>
                         {index < result.estimatedDebt.length - 1 && <Separator className="mt-4" />}
                    </div>
                ))}
              </div>
            </div>
          )}
           {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            {loading ? "Analyzing..." : "Generate Overview"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
