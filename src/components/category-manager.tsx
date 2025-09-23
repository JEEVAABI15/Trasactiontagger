'use client';

import { useState } from 'react';
import { Plus, Tag, X } from 'lucide-react';
import type { Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CategoryManagerProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

export default function CategoryManager({ categories, setCategories }: CategoryManagerProps) {
  const [newCategory, setNewCategory] = useState('');

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.some(c => c.label.toLowerCase() === newCategory.trim().toLowerCase())) {
      const newCat: Category = {
        value: newCategory.trim().toLowerCase().replace(/\s+/g, '-'),
        label: newCategory.trim(),
        icon: Tag, // Default icon for new categories
      };
      setCategories(prev => [...prev, newCat]);
      setNewCategory('');
    }
  };
  
  const handleRemoveCategory = (value: string) => {
    setCategories(prev => prev.filter(c => c.value !== value));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Categories</CardTitle>
        <CardDescription>Add or remove transaction categories.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category name"
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
            />
            <Button onClick={handleAddCategory} size="icon" aria-label="Add category">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge key={category.value} variant="secondary" className="flex items-center gap-1.5 pr-1">
                <category.icon className="h-3.5 w-3.5" />
                <span>{category.label}</span>
                <button
                  onClick={() => handleRemoveCategory(category.value)}
                  className="rounded-full p-0.5 text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
                  aria-label={`Remove ${category.label}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
