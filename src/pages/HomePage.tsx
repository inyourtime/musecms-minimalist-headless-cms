import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';
import type { ContentEntry, ContentType, Media } from '@shared/types';
import { FileText, Image, Layers, PlusCircle } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { format } from 'date-fns';
const StatCard = ({ title, value, icon, isLoading }: { title: string; value: number; icon: React.ReactNode; isLoading: boolean }) => (
  <Card className="transition-all hover:shadow-md hover:-translate-y-0.5">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Skeleton className="h-8 w-1/2" />
      ) : (
        <div className="text-2xl font-bold">{value}</div>
      )}
    </CardContent>
  </Card>
);
export function HomePage() {
  const { data: entriesData, isLoading: isLoadingEntries } = useQuery({
    queryKey: ['entries', { limit: 3 }],
    queryFn: () => api<{ items: ContentEntry[] }>('/api/entries?limit=3'),
  });
  const { data: typesData, isLoading: isLoadingTypes } = useQuery({
    queryKey: ['content-types'],
    queryFn: () => api<{ items: ContentType[] }>('/api/content-types'),
  });
  const { data: mediaData, isLoading: isLoadingMedia } = useQuery({
    queryKey: ['media'],
    queryFn: () => api<{ items: Media[] }>('/api/media'),
  });
  const recentEntries = entriesData?.items ?? [];
  return (
    <AppLayout>
      <div className="relative min-h-screen">
        <ThemeToggle className="absolute top-6 right-6" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8 md:py-10 lg:py-12">
            <section className="relative text-center py-20 md:py-28 rounded-2xl overflow-hidden bg-background">
              <div className="absolute inset-0 bg-gradient-mesh opacity-20 dark:opacity-30"></div>
              <div className="relative z-10">
                <h1 className="text-5xl md:text-6xl font-display font-bold text-balance leading-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
                  MuseCMS
                </h1>
                <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
                  A minimalist, visually-polished headless CMS for content teams who love to create.
                </p>
              </div>
            </section>
            <section className="mt-12 space-y-12">
              {/* Quick Stats */}
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard title="Total Entries" value={entriesData?.items.length || 0} icon={<FileText className="h-4 w-4 text-muted-foreground" />} isLoading={isLoadingEntries} />
                <StatCard title="Content Types" value={typesData?.items.length || 0} icon={<Layers className="h-4 w-4 text-muted-foreground" />} isLoading={isLoadingTypes} />
                <StatCard title="Media Items" value={mediaData?.items.length || 0} icon={<Image className="h-4 w-4 text-muted-foreground" />} isLoading={isLoadingMedia} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Entries */}
                <div className="lg:col-span-2">
                  <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
                  <Card>
                    <CardContent className="p-0">
                      <div className="divide-y">
                        {isLoadingEntries ? (
                          Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="p-4 flex items-center space-x-4">
                              <Skeleton className="h-10 w-10 rounded-md" />
                              <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                              </div>
                            </div>
                          ))
                        ) : recentEntries.length > 0 ? (
                          recentEntries.map((entry) => (
                            <Link key={entry.id} to={`/editor/${entry.id}`} className="flex items-center justify-between p-4 hover:bg-accent transition-colors">
                              <div>
                                <p className="font-medium">{entry.data.title || 'Untitled Entry'}</p>
                                <p className="text-sm text-muted-foreground">
                                  Updated {format(new Date(entry.updatedAt), "MMM d, yyyy")}
                                </p>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full ${entry.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                                {entry.status}
                              </span>
                            </Link>
                          ))
                        ) : (
                          <p className="p-6 text-center text-muted-foreground">No entries yet. Create one!</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                {/* Shortcuts */}
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Shortcuts</h2>
                  <div className="space-y-3">
                    <Button asChild size="lg" className="w-full justify-start">
                      <Link to="/editor"><PlusCircle className="mr-2 h-4 w-4" /> Create New Entry</Link>
                    </Button>
                    <Button asChild variant="secondary" size="lg" className="w-full justify-start">
                      <Link to="/library"><FileText className="mr-2 h-4 w-4" /> Content Library</Link>
                    </Button>
                    <Button asChild variant="secondary" size="lg" className="w-full justify-start">
                      <Link to="/media"><Image className="mr-2 h-4 w-4" /> Media Library</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
        <footer className="text-center py-6 text-sm text-muted-foreground">
          Built with ❤️ at Cloudflare
        </footer>
        <Toaster richColors />
      </div>
    </AppLayout>
  );
}