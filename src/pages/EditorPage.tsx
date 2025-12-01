import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from 'react-use';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { AppLayout } from '@/components/layout/AppLayout';
import { api } from '@/lib/api-client';
import type { ContentEntry, ContentType, EntryStatus } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster, toast } from '@/components/ui/sonner';
import { Save, Trash2, Eye, PlusCircle } from 'lucide-react';
const slugify = (str: string) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
export function EditorPage() {
  const { entryId } = useParams<{ entryId?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNewEntry = !entryId;
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [status, setStatus] = useState<EntryStatus>('draft');
  const [slug, setSlug] = useState('');
  const [selectedContentTypeId, setSelectedContentTypeId] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [version, setVersion] = useState(0);
  const { data: entry, isLoading: isLoadingEntry } = useQuery({
    queryKey: ['entry', entryId],
    queryFn: () => api<ContentEntry>(`/api/entries/${entryId}`),
    enabled: !!entryId,
  });
  useEffect(() => {
    if (entry) {
      setFormData(entry.data);
      setStatus(entry.status);
      setSlug(entry.slug);
      setSelectedContentTypeId(entry.contentTypeId);
      setVersion(entry.version);
    }
  }, [entry]);
  const { data: contentTypes, isLoading: isLoadingContentTypes } = useQuery({
    queryKey: ['content-types'],
    queryFn: () => api<{ items: ContentType[] }>('/api/content-types'),
  });
  const contentType = useMemo(() => {
    return contentTypes?.items.find(ct => ct.id === (entry?.contentTypeId || selectedContentTypeId));
  }, [contentTypes, entry, selectedContentTypeId]);
  const mutation = useMutation({
    mutationFn: (updatedEntry: Partial<ContentEntry> & { version?: number }) => {
      setIsSaving(true);
      if (entryId) {
        return api<ContentEntry>(`/api/entries/${entryId}`, {
          method: 'PUT',
          body: JSON.stringify(updatedEntry),
        });
      }
      return api<ContentEntry>('/api/entries', {
        method: 'POST',
        body: JSON.stringify(updatedEntry),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      if (isNewEntry) {
        toast.success('Entry created!');
        navigate(`/editor/${data.id}`, { replace: true });
      } else {
        queryClient.setQueryData(['entry', entryId], data);
        setVersion(data.version);
        toast.success('Saved!');
      }
    },
    onError: (error) => {
      toast.error(`Save failed: ${error.message}`);
    },
    onSettled: () => {
      setIsSaving(false);
    }
  });
  const handleSave = useCallback(() => {
    if (!contentType) return;
    const payload = {
      data: formData,
      status,
      slug,
      contentTypeId: contentType.id,
      version: isNewEntry ? 0 : version,
    };
    mutation.mutate(payload);
  }, [contentType, formData, status, slug, mutation, isNewEntry, version]);
  useDebounce(handleSave, 2000, [formData, status, slug]);
  useEffect(() => {
    if (formData.title && isNewEntry) {
      setSlug(slugify(formData.title));
    }
  }, [formData.title, isNewEntry]);
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
        return <Textarea value={value} onChange={handleChange} rows={15} className="font-mono" />;
      case 'date':
        return <Input type="date" value={value} onChange={handleChange} />;
      default:
        return <Input value={value} onChange={handleChange} disabled placeholder={`Unsupported field type: ${field.type}`} />;
    }
  };
  if (isLoadingEntry || isLoadingContentTypes) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
          <Skeleton className="h-10 w-1/3 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4"><Skeleton className="h-64 w-full" /></div>
            <div><Skeleton className="h-32 w-full" /></div>
          </div>
        </div>
      </AppLayout>
    );
  }
  if (isNewEntry && !contentType) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8 md:py-10 lg:py-12 text-center">
            <h1 className="text-3xl font-bold mb-4">Create New Entry</h1>
            <p className="text-muted-foreground mb-6">Select a content type to begin.</p>
            <Select onValueChange={setSelectedContentTypeId}>
              <SelectTrigger className="w-full max-w-sm mx-auto">
                <SelectValue placeholder="Choose a content type..." />
              </SelectTrigger>
              <SelectContent>
                {contentTypes?.items.map(ct => (
                  <SelectItem key={ct.id} value={ct.id}>{ct.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </AppLayout>
    );
  }
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <h1 className="text-3xl font-bold text-balance">{formData.title || 'New Entry'}</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{isSaving ? 'Saving...' : 'Saved'}</span>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" /> {isNewEntry ? 'Create' : 'Save'}
              </Button>
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
                <Select value={status} onValueChange={(v: EntryStatus) => setStatus(v)}>
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
              <div className="prose dark:prose-invert bg-muted/30 p-4 rounded-md border min-h-64 max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                  {formData.body || '*Start typing in the markdown field to see a preview.*'}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster richColors />
    </AppLayout>
  );
}