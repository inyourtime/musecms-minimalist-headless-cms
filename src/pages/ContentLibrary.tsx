import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { api } from '@/lib/api-client';
import type { ContentEntry } from '@shared/types';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ContentCard } from '@/components/ContentCard';
import { Skeleton } from '@/components/ui/skeleton';
export function ContentLibrary() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['entries'],
    queryFn: () => api<{ items: ContentEntry[] }>('/api/entries?limit=24'),
  });
  const entries = data?.items ?? [];
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Content Library</h1>
            <Button asChild>
              <Link to="/editor"><PlusCircle className="mr-2 h-4 w-4" /> New Entry</Link>
            </Button>
          </div>
          {error && <div className="text-red-500">Failed to load entries: {error.message}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            ) : entries.length > 0 ? (
              entries.map((entry) => <ContentCard key={entry.id} entry={entry} />)
            ) : (
              <div className="md:col-span-2 lg:col-span-3 text-center py-16">
                <h2 className="text-xl font-medium">No entries found</h2>
                <p className="text-muted-foreground mt-2">Get started by creating a new entry.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}