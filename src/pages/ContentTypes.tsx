import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { api } from '@/lib/api-client';
import type { ContentType } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Layers } from 'lucide-react';
import { Toaster, toast } from '@/components/ui/sonner';
export function ContentTypes() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['content-types'],
    queryFn: () => api<{ items: ContentType[] }>('/api/content-types'),
  });
  const contentTypes = data?.items ?? [];
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Content Types</h1>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> New Type
            </Button>
          </div>
          {error && <div className="text-red-500">Failed to load content types: {error.message}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))
            ) : contentTypes.length > 0 ? (
              contentTypes.map((type) => (
                <Card key={type.id} className="transition-all hover:shadow-lg hover:-translate-y-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="h-5 w-5 text-muted-foreground" />
                      {type.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{type.fields.length} fields</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="md:col-span-2 lg:col-span-3 text-center py-16">
                <h2 className="text-xl font-medium">No content types found</h2>
                <p className="text-muted-foreground mt-2">Get started by creating a new content type.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Toaster richColors />
    </AppLayout>
  );
}