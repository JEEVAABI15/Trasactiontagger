'use client';

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Transaction, Category } from '@/lib/types';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransactionsTableProps {
  transactions: Transaction[];
  categories: Category[];
  onUpdateCategory: (transactionId: string, newCategory: string) => void;
  onApproveTransaction: (transactionId: string) => void;
  disabled: boolean;
}

export default function TransactionsTable({
  transactions,
  categories,
  onUpdateCategory,
  onApproveTransaction,
  disabled,
}: TransactionsTableProps) {
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  if (transactions.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
        <p className="text-muted-foreground">No transactions match the current filters.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Narration</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((t) => (
            <TableRow key={t.id} className={cn(t.status === 'approved' && 'bg-accent/10')}>
              <TableCell className="font-medium">{t.date}</TableCell>
              <TableCell className="max-w-[250px] break-words">{t.narration}</TableCell>
              <TableCell className={cn("text-right font-mono", t.type === 'withdrawal' ? 'text-destructive' : 'text-foreground')}>
                {t.type === 'withdrawal' ? '-' : '+'}
                {formatCurrency(t.amount)}
              </TableCell>
              <TableCell>
                {t.status === 'unprocessed' ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4" />
                    <span>Awaiting process...</span>
                  </div>
                ) : (
                  <Select
                    value={t.category}
                    onValueChange={(value) => onUpdateCategory(t.id, value)}
                    disabled={t.status === 'approved' || disabled}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          <div className="flex items-center gap-2">
                            <cat.icon className="h-4 w-4" />
                            {cat.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </TableCell>
              <TableCell className="text-center">
                {t.status === 'approved' && (
                  <Badge className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Check className="mr-1 h-3 w-3" />
                    Approved
                  </Badge>
                )}
                {t.status === 'pending' && <Badge variant="secondary">Pending</Badge>}
                {t.status === 'unprocessed' && <Badge variant="outline">Unprocessed</Badge>}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant={t.status === 'approved' ? 'ghost' : 'default'}
                  className={t.status === 'pending' ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}
                  onClick={() => onApproveTransaction(t.id)}
                  disabled={t.status !== 'pending' || disabled}
                >
                  <Check className="h-4 w-4" />
                  <span className="ml-2 hidden sm:inline">{t.status === 'approved' ? 'Approved' : 'Approve'}</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
