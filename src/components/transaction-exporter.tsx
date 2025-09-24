'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { Transaction, Category } from '@/lib/types';

interface TransactionExporterProps {
  transactions: Transaction[];
  categories: Category[];
}

export default function TransactionExporter({ transactions, categories }: TransactionExporterProps) {
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'unprocessed'>('all');

  const getCategoryLabel = (value: string) => {
    return categories.find(c => c.value === value)?.label || value;
  };
  
  const convertToCSV = (data: Transaction[]) => {
    const headers = ['ID', 'Date', 'Narration', 'Amount', 'Type', 'Category', 'Notes', 'Status'];
    const rows = data.map(t => [
      t.id,
      t.date,
      `"${t.narration.replace(/"/g, '""')}"`, // Handle quotes in narration
      t.amount,
      t.type,
      getCategoryLabel(t.category),
      `"${t.notes.replace(/"/g, '""')}"`, // Handle quotes in notes
      t.status
    ].join(','));
    return [headers.join(','), ...rows].join('\n');
  };

  const handleExport = () => {
    const filteredTransactions = transactions.filter(t => filter === 'all' || t.status === filter);
    
    if (filteredTransactions.length === 0) {
        alert(`No ${filter} transactions to export.`);
        return;
    }

    const csvData = convertToCSV(filteredTransactions);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `transactions_${filter}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Export</CardTitle>
        <CardDescription>Download your categorized transactions.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="export-filter">Filter by status</Label>
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger id="export-filter">
                    <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Transactions</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="unprocessed">Unprocessed</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <Button onClick={handleExport} className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Export to CSV
        </Button>
      </CardContent>
    </Card>
  );
}
