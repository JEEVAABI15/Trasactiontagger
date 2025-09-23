'use server';

/**
 * @fileOverview Transaction category suggestion flow.
 *
 * - suggestTransactionCategory - Suggests a category for a given transaction.
 * - SuggestTransactionCategoryInput - The input type for the suggestTransactionCategory function.
 * - SuggestTransactionCategoryOutput - The return type for the suggestTransactionCategory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTransactionCategoryInputSchema = z.object({
  transactionDetails: z
    .string()
    .describe('The details of the transaction, including date, narration, and amount.'),
  availableCategories: z
    .array(z.string())
    .describe('A list of available categories to choose from.'),
});
export type SuggestTransactionCategoryInput = z.infer<typeof SuggestTransactionCategoryInputSchema>;

const SuggestTransactionCategoryOutputSchema = z.object({
  suggestedCategory: z
    .string()
    .describe('The suggested category for the transaction.'),
});
export type SuggestTransactionCategoryOutput = z.infer<typeof SuggestTransactionCategoryOutputSchema>;

export async function suggestTransactionCategory(
  input: SuggestTransactionCategoryInput
): Promise<SuggestTransactionCategoryOutput> {
  return suggestTransactionCategoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTransactionCategoryPrompt',
  input: {schema: SuggestTransactionCategoryInputSchema},
  output: {schema: SuggestTransactionCategoryOutputSchema},
  prompt: `Given the following transaction details and available categories, suggest the most appropriate category for the transaction.

Transaction Details: {{{transactionDetails}}}

Available Categories:
{{#each availableCategories}}- {{{this}}}
{{/each}}

Ensure that the suggested category is one of the available categories provided.
`,
});

const suggestTransactionCategoryFlow = ai.defineFlow(
  {
    name: 'suggestTransactionCategoryFlow',
    inputSchema: SuggestTransactionCategoryInputSchema,
    outputSchema: SuggestTransactionCategoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
