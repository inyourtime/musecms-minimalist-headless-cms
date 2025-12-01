import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { api } from '@/lib/api-client';
import type { Media } from '@shared/types';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast, Toaster } from '@/components/ui/sonner';
import { Upload, Trash2, Copy } from 'lucide-react';
export function MediaLibrary() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [uploadUrl, setUploadUrl] = useState('');
  const { data, isLoading, error } = useQuery({
    queryKey: ['media'],
    queryFn: () => api<{ items: Media[] }>('/api/media'),
  });
  const mediaItems = useMemo(() => data?.items.sort((a, b) => b.createdAt - a.createdAt) ?? [], [data]);
  const filteredMedia = useMemo(() => {
    if (!searchTerm) return mediaItems;
    return mediaItems.filter(m => m.filename.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [mediaItems, searchTerm]);
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/api/media/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Media item deleted.');
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
    onError: (err) => toast.error(`Deletion failed: ${err.message}`),
  });
  const uploadMutation = useMutation({
    mutationFn: (newMedia: Partial<Media>) => api('/api/media', { method: 'POST', body: JSON.stringify(newMedia) }),
    onSuccess: () => {
      toast.success('Media uploaded successfully.');
      queryClient.invalidateQueries({ queryKey: ['media'] });
      setUploadUrl('');
    },
    onError: (err) => toast.error(`Upload failed: ${err.message}`),
  });
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Image URL copied to clipboard!');
  };
  const handleMockUpload = () => {
    if (!uploadUrl) return toast.warning('Please enter a URL.');
    const filename = uploadUrl.split('/').pop() || 'new-image.jpg';
    uploadMutation.mutate({ url: uploadUrl, filename });
  };
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <h1 className="text-3xl font-bold">Media Library</h1>
            <Dialog>
              <DialogTrigger asChild><Button><Upload className="mr-2 h-4 w-4" /> Upload Media</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Upload New Media (Mock)</DialogTitle><DialogDescription>Enter an image URL to add it to the library.</DialogDescription></DialogHeader>
                <div className="flex gap-2 mt-4">
                  <Input placeholder="https://images.unsplash.com/..." value={uploadUrl} onChange={(e) => setUploadUrl(e.target.value)} />
                  <Button onClick={handleMockUpload} disabled={uploadMutation.isPending}>Add</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Input placeholder="Search media..." className="max-w-sm mb-6" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          {error && <div className="text-red-500">Failed to load media: {error.message}</div>}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4"
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
            initial="hidden" animate="show"
          >
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="w-full aspect-square" />)
            ) : filteredMedia.length > 0 ? (
              filteredMedia.map((media) => (
                <motion.div key={media.id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                  <Card className="overflow-hidden group relative">
                    <AspectRatio ratio={1} onClick={() => setSelectedMedia(media)}>
                      <img src={media.url} alt={media.filename} className="object-cover w-full h-full cursor-pointer" />
                    </AspectRatio>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" onClick={() => handleCopyUrl(media.url)}><Copy className="h-4 w-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button size="icon" variant="ghost" className="text-white hover:bg-white/20"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete the media item.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMutation.mutate(media.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <div className="p-2 text-xs truncate"><p className="font-medium">{media.filename}</p></div>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-16"><h2 className="text-xl font-medium">No media found</h2><p className="text-muted-foreground mt-2">Upload your first media item.</p></div>
            )}
          </motion.div>
        </div>
      </div>
      <Dialog open={!!selectedMedia} onOpenChange={(isOpen) => !isOpen && setSelectedMedia(null)}>
        <DialogContent className="max-w-4xl"><img src={selectedMedia?.url} alt={selectedMedia?.filename} className="rounded-md max-h-[80vh] w-auto" /></DialogContent>
      </Dialog>
      <Toaster richColors />
    </AppLayout>
  );
}