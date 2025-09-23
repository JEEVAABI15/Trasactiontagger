'use server';

import { suggestTransactionCategory } from '@/ai/flows/suggest-transaction-category';

export async function getCategorySuggestion(
  transactionDetails: string,
  availableCategories: string[]
) {
  try {
    const result = await suggestTransactionCategory({
      transactionDetails,
      availableCategories,
    });
    // Ensure the suggested category is one of the available ones.
    if (availableCategories.includes(result.suggestedCategory)) {
        return result.suggestedCategory;
    }
  } catch (error) {
    console.error('Error suggesting category:', error);
  }
  
  // Fallback to a random category if AI fails or suggests an invalid one.
  return availableCategories[Math.floor(Math.random() * availableCategories.length)];
}
