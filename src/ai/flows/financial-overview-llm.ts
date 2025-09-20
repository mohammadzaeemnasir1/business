// Financial Overview with LLM flow to estimate outstanding amounts owed to dealers.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FinancialOverviewInputSchema = z.object({
  dealers: z
    .array(
      z.object({
        name: z.string().describe('Name of the dealer.'),
        outstandingBalance: z
          .number()
          .describe('The raw outstanding balance for the dealer.'),
      })
    )
    .describe('List of dealers and their outstanding balances.'),
  marketConditions: z
    .string()
    .optional()
    .describe('Current market conditions that might affect debt repayment.'),
});
export type FinancialOverviewInput = z.infer<typeof FinancialOverviewInputSchema>;

const FinancialOverviewOutputSchema = z.object({
  estimatedDebt: z.array(
    z.object({
      dealerName: z.string().describe('Name of the dealer.'),
      estimatedOutstanding: z
        .number()
        .describe('The LLM-estimated outstanding balance for the dealer taking into account market conditions.'),
      reasoning: z
        .string()
        .describe('The reasoning behind the estimated outstanding balance.'),
    })
  ),
  summary: z
    .string()
    .describe('A brief summary of the overall financial health of the shop.'),
});
export type FinancialOverviewOutput = z.infer<typeof FinancialOverviewOutputSchema>;

export async function getFinancialOverview(input: FinancialOverviewInput): Promise<FinancialOverviewOutput> {
  return financialOverviewFlow(input);
}

const financialOverviewPrompt = ai.definePrompt({
  name: 'financialOverviewPrompt',
  input: {schema: FinancialOverviewInputSchema},
  output: {schema: FinancialOverviewOutputSchema},
  prompt: `You are a financial analyst providing insights into the financial health of Alpha by ZaeemAI, a cloth shop.

  Dealers and Outstanding Balances:
  {{#each dealers}}
  - Dealer: {{name}}, Outstanding Balance: {{outstandingBalance}}
  {{/each}}

  Current Market Conditions: {{marketConditions}}

  Based on the outstanding balances for each dealer and the current market conditions, estimate the actual outstanding amount owed to each dealer, taking into account factors like potential delays in payments due to a recession or other global events. Provide reasoning for each dealer's estimated outstanding balance and a summary of Alpha by ZaeemAI's overall financial health.

  Output the estimated debt for each dealer, including dealer name, estimated outstanding balance, and the reasoning behind the estimation.  Also provide a summary of the overall financial health of the shop.
  `,
});

const financialOverviewFlow = ai.defineFlow(
  {
    name: 'financialOverviewFlow',
    inputSchema: FinancialOverviewInputSchema,
    outputSchema: FinancialOverviewOutputSchema,
  },
  async input => {
    const {output} = await financialOverviewPrompt(input);
    return output!;
  }
);
