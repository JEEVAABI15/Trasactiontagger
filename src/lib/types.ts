import type { LucideIcon } from 'lucide-react';

export type Transaction = {
  id: string;
  date: string;
  narration: string;
  amount: number;
  type: 'withdrawal' | 'deposit';
  closingBalance: number;
  category: string;
  suggestedCategory?: string;
  status: 'unprocessed' | 'pending' | 'approved';
};

export type Category = {
  value: string;
  label: string;
  icon: LucideIcon;
};
