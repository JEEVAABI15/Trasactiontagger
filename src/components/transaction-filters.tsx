'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export interface FilterState {
  query: string;
  minAmount: string;
  maxAmount: string;
  type: 'all' | 'withdrawal' | 'deposit';
}

interface TransactionFiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  disabled: boolean;
}

export default function TransactionFilters({ filters, setFilters, disabled }: TransactionFiltersProps) {
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="grid grid-cols-1 gap-4 rounded-md border p-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-2">
        <Label htmlFor="search">Search Narration</Label>
        <Input
          id="search"
          placeholder="e.g. Swiggy, Uber..."
          value={filters.query}
          onChange={e => handleFilterChange('query', e.target.value)}
          disabled={disabled}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="minAmount">Min Amount</Label>
        <Input
          id="minAmount"
          type="number"
          placeholder="0.00"
          value={filters.minAmount}
          onChange={e => handleFilterChange('minAmount', e.target.value)}
          disabled={disabled}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="maxAmount">Max Amount</Label>
        <Input
          id="maxAmount"
          type="number"
          placeholder="1000.00"
          value={filters.maxAmount}
          onChange={e => handleFilterChange('maxAmount', e.target.value)}
          disabled={disabled}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="type">Transaction Type</Label>
        <Select
          value={filters.type}
          onValueChange={(value: FilterState['type']) => handleFilterChange('type', value)}
          disabled={disabled}
        >
          <SelectTrigger id="type">
            <SelectValue placeholder="Select type..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="withdrawal">Withdrawal</SelectItem>
            <SelectItem value="deposit">Deposit</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
