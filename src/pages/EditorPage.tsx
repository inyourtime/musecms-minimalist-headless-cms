import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from 'react-use';
import { AppLayout } from '@/components/layout/AppLayout';
import { api } from '@/lib/api-client';
import type { ContentEntry, ContentType } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster, toast } from '@/components/ui/sonner';
import { Save, Trash2 } from 'lucide-react';
export function EditorPage() {
  const { entryId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [slug, setSlug] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { data: entry, isLoading: isLoadingEntry } = useQuery({
    queryKey: ['entry', entryId],
    queryFn: () => api<ContentEntry>(`/api/entries/${entryId}`),
    enabled: !!entryId,
    onSuccess: (data) => {
      setFormData(data.data);
      setStatus(data.status);
      setSlug(data.slug);
    },
  });
  const { data: contentType, isLoading: isLoadingContentType } = useQuery({
    queryKey: ['contentType', entry?.contentTypeId],
    queryFn: () => api<ContentType>(`/api/content-types/${entry?.contentTypeId}`),
    enabled: !!entry?.contentTypeId,
  });
  const mutation = useMutation({
    mutationFn: (updatedEntry: Partial<ContentEntry> & { version?: number }) => {
      setIsSaving(true);
      if (entryId) {
        return api<ContentEntry>(`/api/entries/${entryId}`, {
          method: 'PUT',
          body: JSON.stringify(updatedEntry),
        });
      }
      // Create new logic would go here
      return Promise.reject('Create not implemented yet');
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['entry', entryId], data);
      toast.success('Saved!');
    },
    onError: (error) => {
      toast.error(`Save failed: ${error.message}`);
    },
    onSettled: () => {
      setIsSaving(false);
    }
  });
  const handleSave = useCallback(() => {
    if (!entry) return;
    mutation.mutate({
      data: formData,
      status,
      slug,
      version: entry.version,
    });
  }, [entry, formData, status, slug, mutation]);
  useDebounce(handleSave, 1500, [formData, status, slug]);
  const renderField = (field: ContentType['fields'][0]) => {
    const value = formData[field.name] || '';
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData(prev => ({ ...prev, [field.name]: e.target.value }));
    };
    switch (field.type) {
      case 'text':
      case 'slug':
        return <Input value={value} onChange={handleChange} />;
      case 'markdown':
        return <Textarea value={value} onChange={handleChange} rows={15} />;
      default:
        return <Input value={value} onChange={handleChange} disabled placeholder={`Unsupported field type: ${field.type}`} />;
    }
  };
  if (isLoadingEntry || (entryId && isLoadingContentType)) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-10 w-1/3 mb-8" />
          <div className="grid grid-cols-2 gap-8">
            <div><Skeleton className="h-96 w-full" /></div>
            <div><Skeleton className="h-96 w-full" /></div>
          </div>
        </div>
      </AppLayout>
    );
  }
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">{entry?.data.title || 'New Entry'}</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{isSaving ? 'Saving...' : 'Saved'}</span>
              <Button onClick={handleSave} disabled={isSaving}><Save className="mr-2 h-4 w-4" /> Save</Button>
              <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              {contentType?.fields.map(field => (
                <div key={field.id}>
                  <Label htmlFor={field.id} className="text-lg mb-2 block">{field.label}</Label>
                  {renderField(field)}
                </div>
              ))}
            </div>
            <div className="space-y-6">
              <div>
                <Label className="text-lg mb-2 block">Status</Label>
                <Select value={status} onValueChange={(v: 'draft' | 'published') => setStatus(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="slug" className="text-lg mb-2 block">Slug</Label>
                <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
              </div>
              <div className="prose dark:prose-invert bg-muted/50 p-4 rounded-md border min-h-64">
                <h2>Preview</h2>
                <p>{formData.body || 'Start typing in the markdown field to see a preview.'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster richColors />
    </AppLayout>
  );
}