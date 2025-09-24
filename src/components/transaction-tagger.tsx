'use client';

import { useState, useTransition, useEffect } from 'react';
import { INITIAL_CATEGORIES } from '@/lib/data';
import type { Transaction, Category } from '@/lib/types';
import { getCategorySuggestion } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Wand2, Check } from 'lucide-react';
import TransactionsTable from './transactions-table';
import CategoryManager from './category-manager';
import { useToast } from "@/hooks/use-toast";
import FileUploader from './file-uploader';

const IGNORED_KEYWORDS = ['salary', 'interest', 'atm withdrawal'];

export default function TransactionTagger() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
  
  const handleTransactionsLoaded = (newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
    toast({
      title: 'Transactions Loaded',
      description: `${newTransactions.length} transactions have been loaded from the file.`,
    });
  };

  const runCategorization = () => {
    startTransition(async () => {
      const transactionsToProcess = transactions.filter(t => {
        if (t.status !== 'unprocessed') return false;
        if (t.type === 'deposit') return false;
        if (t.amount < 10) return false;
        if (IGNORED_KEYWORDS.some(keyword => t.narration.toLowerCase().includes(keyword))) {
          return false;
        }
        return true;
      });

      if (transactionsToProcess.length === 0) {
        toast({
            title: "No new transactions to process",
            description: "All applicable transactions have already been categorized.",
            variant: "default",
        });
        return;
      }

      toast({
        title: "Categorizing Transactions",
        description: `AI is suggesting categories for ${transactionsToProcess.length} transactions. Please wait...`,
      });
      
      const categoryValues = categories.map(c => c.value);
      
      const promises = transactionsToProcess.map(async (t) => {
          const transactionDetails = `Date: ${t.date}, Narration: ${t.narration}, Amount: ${t.amount}, Type: ${t.type}`;
          const suggestion = await getCategorySuggestion(transactionDetails, categoryValues);
          return {
            ...t,
            suggestedCategory: suggestion,
            category: suggestion,
            status: 'pending' as const,
          };
      });

      const categorizedTransactions = await Promise.all(promises);

      setTransactions(prev => {
        const updated = [...prev];
        categorizedTransactions.forEach(categorized => {
          const index = updated.findIndex(t => t.id === categorized.id);
          if (index !== -1) {
            updated[index] = categorized;
          }
        });
        return updated;
      });

      toast({
        title: "Categorization Complete!",
        description: "Review the suggestions and approve them.",
      });
    });
  };

  const hasPending = transactions.some(t => t.status === 'pending');
  const hasUnprocessed = transactions.some(t => t.status === 'unprocessed');

  if (!isClient) {
    return null; // Don't render anything on the server
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="space-y-8 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Transactions</CardTitle>
            <CardDescription>
              {transactions.length > 0 ? 'Review, edit, and approve the categories for your transactions.' : 'Upload a file to get started.'}
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
        <FileUploader onTransactionsLoaded={handleTransactionsLoaded} />
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
