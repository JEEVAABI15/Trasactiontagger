'use client';

import { useState, useTransition, useEffect, useMemo } from 'react';
import type { Transaction, Category } from '@/lib/types';
import { getCategorySuggestion } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Wand2, Check } from 'lucide-react';
import TransactionsTable from './transactions-table';
import CategoryManager from './category-manager';
import { useToast } from "@/hooks/use-toast";
import FileUploader from './file-uploader';
import TransactionFilters from './transaction-filters';
import type { FilterState } from './transaction-filters';
import TransactionExporter from './transaction-exporter';

export default function TransactionTagger() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    query: '',
    minAmount: '',
    maxAmount: '',
    type: 'all',
  });

  useEffect(() => {
    setIsClient(true);
    // Load initial categories from a client-safe source only once
    import('@/lib/data').then(data => setCategories(data.INITIAL_CATEGORIES));
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const { query, minAmount, maxAmount, type } = filters;
      const min = parseFloat(minAmount);
      const max = parseFloat(maxAmount);

      if (query && !t.narration.toLowerCase().includes(query.toLowerCase())) {
        return false;
      }
      if (!isNaN(min) && t.amount < min) {
        return false;
      }
      if (!isNaN(max) && t.amount > max) {
        return false;
      }
      if (type !== 'all' && t.type !== type) {
        return false;
      }
      return true;
    });
  }, [transactions, filters]);

  const handleUpdateCategory = (transactionId: string, newCategory: string) => {
    setTransactions(prev =>
      prev.map(t =>
        t.id === transactionId ? { ...t, category: newCategory, status: 'pending' } : t
      )
    );
  };
  
  const handleUpdateNotes = (transactionId: string, newNotes: string) => {
    setTransactions(prev =>
      prev.map(t =>
        t.id === transactionId ? { ...t, notes: newNotes } : t
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
      const transactionsToProcess = filteredTransactions.filter(t => t.status === 'unprocessed');

      if (transactionsToProcess.length === 0) {
        toast({
            title: "No transactions to process",
            description: "All transactions in the current view have been processed.",
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
            id: t.id,
            suggestedCategory: suggestion,
          };
      });

      const categorizedResults = await Promise.all(promises);

      setTransactions(prev => {
        const updated = [...prev];
        categorizedResults.forEach(result => {
          const index = updated.findIndex(t => t.id === result.id);
          if (index !== -1) {
            updated[index] = {
              ...updated[index],
              category: result.suggestedCategory,
              status: 'pending'
            };
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

  const hasPending = filteredTransactions.some(t => t.status === 'pending');
  const hasUnprocessed = filteredTransactions.some(t => t.status === 'unprocessed');
  const hasTransactions = transactions.length > 0;

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
              {transactions.length > 0 ? 'Filter, review, and approve your transactions.' : 'Upload a file to get started.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <TransactionFilters filters={filters} setFilters={setFilters} disabled={isPending || !hasTransactions} />
            <TransactionsTable
              transactions={filteredTransactions}
              categories={categories}
              onUpdateCategory={handleUpdateCategory}
              onUpdateNotes={handleUpdateNotes}
              onApproveTransaction={handleApproveTransaction}
              disabled={isPending}
            />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8 lg:col-span-1">
        <FileUploader onTransactionsLoaded={handleTransactionsLoaded} />
        {hasTransactions && (
          <>
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
            <TransactionExporter transactions={transactions} categories={categories} />
          </>
        )}
        <CategoryManager categories={categories} setCategories={setCategories} />
      </div>
    </div>
  );
}
