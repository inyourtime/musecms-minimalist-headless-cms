import { useState, useMemo } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useDebounce } from 'react-use';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { api } from '@/lib/api-client';
import type { ContentEntry } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2 } from 'lucide-react';
import { ContentCard } from '@/components/ContentCard';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
export function ContentLibrary() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['entries', { search: debouncedSearchTerm }],
    queryFn: ({ pageParam }) => api<{ items: ContentEntry[]; next: string | null }>(`/api/entries?limit=12&cursor=${pageParam || ''}`),
    getNextPageParam: (lastPage) => lastPage.next,
    initialPageParam: '',
  });
  const entries = useMemo(() => data?.pages.flatMap(page => page.items) ?? [], [data]);
  const filteredEntries = useMemo(() => {
    if (!debouncedSearchTerm) return entries;
    return entries.filter(entry => entry.data.title?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
  }, [entries, debouncedSearchTerm]);
  const deleteMutation = useMutation({
    mutationFn: (ids: string[]) => api('/api/entries/deleteMany', { method: 'POST', body: JSON.stringify({ ids }) }),
    onSuccess: () => {
      toast.success('Entries deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      setSelectedIds(new Set());
    },
    onError: (err) => toast.error(`Failed to delete entries: ${err.message}`),
  });
  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    deleteMutation.mutate(Array.from(selectedIds));
  };
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <h1 className="text-3xl font-bold">Content Library</h1>
            <div className="flex items-center gap-2">
              {selectedIds.size > 0 && (
                <Button variant="destructive" onClick={handleBulkDelete} disabled={deleteMutation.isPending}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete ({selectedIds.size})
                </Button>
              )}
              <Button asChild>
                <Link to="/editor"><PlusCircle className="mr-2 h-4 w-4" /> New Entry</Link>
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <Input
              placeholder="Search entries..."
              className="max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {error && <div className="text-red-500">Failed to load entries: {error.message}</div>}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.05 },
              },
            }}
            initial="hidden"
            animate="show"
          >
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3"><Skeleton className="h-40 w-full" /><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/2" /></div>
              ))
            ) : filteredEntries.length > 0 ? (
              filteredEntries.map((entry) => (
                <ContentCard
                  key={entry.id}
                  entry={entry}
                  isSelected={selectedIds.has(entry.id)}
                  onSelectToggle={(id) => {
                    setSelectedIds(prev => {
                      const newSet = new Set(prev);
                      if (newSet.has(id)) newSet.delete(id);
                      else newSet.add(id);
                      return newSet;
                    });
                  }}
                />
              ))
            ) : (
              <div className="md:col-span-2 lg:col-span-3 text-center py-16">
                <h2 className="text-xl font-medium">No entries found</h2>
                <p className="text-muted-foreground mt-2">Get started by creating a new entry.</p>
              </div>
            )}
          </motion.div>
          {hasNextPage && (
            <div className="mt-8 text-center">
              <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                {isFetchingNextPage ? 'Loading more...' : 'Load More'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}