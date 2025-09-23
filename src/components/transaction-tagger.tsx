'use client';

import { useState, useTransition } from 'react';
import { MOCK_TRANSACTIONS, INITIAL_CATEGORIES } from '@/lib/data';
import type { Transaction, Category } from '@/lib/types';
import { getCategorySuggestion } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Wand2, Check } from 'lucide-react';
import TransactionsTable from './transactions-table';
import CategoryManager from './category-manager';
import { useToast } from "@/hooks/use-toast";

export default function TransactionTagger() {
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleUpdateCategory = (transactionId: string, newCategory: string) => {
    setTransactions(prev =>
      prev.map(t =>
        t.id === transactionId ? { ...t, category: newCategory, status: 'pending' } : t
      )
    );
  };

  const handleApproveTransaction = (transactionId: string) => {
    setTransactions(prev =>
      prev.map(t => (t.id === transactionId ? { ...t, status: 'approved' } : t))
    );
  };

  const handleApproveAll = () => {
    setTransactions(prev =>
      prev.map(t => (t.status === 'pending' ? { ...t, status: 'approved' } : t))
    );
     toast({
      title: "All transactions approved!",
      description: "All pending transactions have been successfully approved.",
    });
  };

  const runCategorization = () => {
    startTransition(async () => {
      const unprocessedTransactions = transactions.filter(t => t.status === 'unprocessed');
      if (unprocessedTransactions.length === 0) {
        toast({
            title: "No transactions to process",
            description: "All transactions have already been categorized.",
            variant: "default",
        });
        return;
      }

      toast({
        title: "Categorizing Transactions",
        description: "AI is suggesting categories for your transactions. Please wait...",
      });
      
      const categoryValues = categories.map(c => c.value);
      
      const updatedTransactions = await Promise.all(
        transactions.map(async (t) => {
          if (t.status === 'unprocessed') {
            const transactionDetails = `Date: ${t.date}, Narration: ${t.narration}, Amount: ${t.amount}, Type: ${t.type}`;
            const suggestion = await getCategorySuggestion(transactionDetails, categoryValues);
            return {
              ...t,
              suggestedCategory: suggestion,
              category: suggestion,
              status: 'pending' as const,
            };
          }
          return t;
        })
      );
      setTransactions(updatedTransactions);
      toast({
        title: "Categorization Complete!",
        description: "Review the suggestions and approve them.",
      });
    });
  };

  const hasPending = transactions.some(t => t.status === 'pending');
  const hasUnprocessed = transactions.some(t => t.status === 'unprocessed');

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="space-y-8 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Transactions</CardTitle>
            <CardDescription>
              {hasUnprocessed ? 'Click "Categorize Transactions" to begin.' : 'Review, edit, and approve the categories for your transactions.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionsTable
              transactions={transactions}
              categories={categories}
              onUpdateCategory={handleUpdateCategory}
              onApproveTransaction={handleApproveTransaction}
              disabled={isPending}
            />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8 lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Controls</CardTitle>
            <CardDescription>Process your file and manage categories.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runCategorization} disabled={isPending || !hasUnprocessed} className="w-full">
              {isPending ? (
                <Wand2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              { isPending ? 'Categorizing...' : 'Categorize Transactions' }
            </Button>
            { hasPending && (
              <Button onClick={handleApproveAll} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                <Check className="mr-2 h-4 w-4" />
                Approve All
              </Button>
            )}
          </CardContent>
        </Card>
        <CategoryManager categories={categories} setCategories={setCategories} />
      </div>
    </div>
  );
}
