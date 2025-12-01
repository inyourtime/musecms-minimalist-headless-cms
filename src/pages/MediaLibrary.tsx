import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { api } from '@/lib/api-client';
import type { Media } from '@shared/types';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { toast, Toaster } from '@/components/ui/sonner';
export function MediaLibrary() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['media'],
    queryFn: () => api<{ items: Media[] }>('/api/media'),
  });
  const mediaItems = data?.items ?? [];
  const handleCardClick = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Image URL copied to clipboard!');
  };
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Media Library</h1>
            {/* Mock upload button for now */}
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md">Upload (mock)</button>
          </div>
          {error && <div className="text-red-500">Failed to load media: {error.message}</div>}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="w-full aspect-[16/9]" />
              ))
            ) : mediaItems.length > 0 ? (
              mediaItems.map((media) => (
                <Card key={media.id} className="overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1" onClick={() => handleCardClick(media.url)}>
                  <CardContent className="p-0">
                    <AspectRatio ratio={16 / 9}>
                      <img src={media.url} alt={media.filename} className="object-cover w-full h-full" />
                    </AspectRatio>
                    <div className="p-2 text-xs truncate">
                      <p className="font-medium">{media.filename}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <h2 className="text-xl font-medium">No media found</h2>
                <p className="text-muted-foreground mt-2">Upload your first media item.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Toaster richColors />
    </AppLayout>
  );
}