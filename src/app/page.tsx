import TransactionTagger from '@/components/transaction-tagger';
import { BotMessageSquare } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 w-full border-b bg-card shadow-sm">
        <div className="container mx-auto flex h-20 items-center justify-start gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <BotMessageSquare className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="font-headline text-3xl font-bold text-foreground">
            Transaction Tagger
          </h1>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <TransactionTagger />
      </main>
    </div>
  );
}
