import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { api } from '@/lib/api-client';
import type { ContentType, ContentField, FieldType } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Layers, GripVertical, Trash2, Edit } from 'lucide-react';
import { Toaster, toast } from '@/components/ui/sonner';
const fieldSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(['text', 'slug', 'markdown', 'number', 'date', 'reference']),
});
const contentTypeSchema = z.object({
  id: z.string().min(1, "ID is required"),
  title: z.string().min(1, "Title is required"),
  fields: z.array(fieldSchema).min(1, "At least one field is required"),
});
const fieldTypes: FieldType[] = ['text', 'slug', 'markdown', 'number', 'date', 'reference'];
const SortableField = ({ field, index, onRemove }: { field: ContentField, index: number, onRemove: (index: number) => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: field.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-3 bg-secondary rounded-md">
      <button {...attributes} {...listeners} className="cursor-grab"><GripVertical className="h-5 w-5 text-muted-foreground" /></button>
      <div className="flex-1 grid grid-cols-3 gap-2">
        <Input defaultValue={field.label} placeholder="Label" disabled />
        <Input defaultValue={field.name} placeholder="API Name" disabled />
        <Input defaultValue={field.type} placeholder="Type" disabled />
      </div>
      <Button variant="ghost" size="icon" onClick={() => onRemove(index)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
    </div>
  );
};
const ContentTypeForm = ({ type, onFinished }: { type?: ContentType, onFinished: () => void }) => {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof contentTypeSchema>>({
    resolver: zodResolver(contentTypeSchema),
    defaultValues: type || { id: '', title: '', fields: [{ id: 'title', name: 'title', label: 'Title', type: 'text' }] },
  });
  const { fields, append, remove, move } = useFieldArray({ control: form.control, name: 'fields' });
  const mutation = useMutation({
    mutationFn: (data: ContentType) => {
      return type
        ? api(`/api/content-types/${type.id}`, { method: 'PUT', body: JSON.stringify(data) })
        : api('/api/content-types', { method: 'POST', body: JSON.stringify(data) });
    },
    onSuccess: () => {
      toast.success(`Content type ${type ? 'updated' : 'created'}!`);
      queryClient.invalidateQueries({ queryKey: ['content-types'] });
      onFinished();
    },
    onError: (err) => toast.error(`Failed: ${err.message}`),
  });
  const sensors = useSensors(useSensor(PointerSensor));
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active?.id;
    const overId = over?.id;
    if (!activeId || !overId || activeId === overId) return;
    const oldIndex = fields.findIndex((f) => f.id === activeId);
    const newIndex = fields.findIndex((f) => f.id === overId);
    if (oldIndex === -1 || newIndex === -1) return;
    move(oldIndex, newIndex);
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(data => mutation.mutate({ ...data, slug: data.id }))} className="space-y-6">
        <FormField control={form.control} name="title" render={({ field }) => <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
        <FormField control={form.control} name="id" render={({ field }) => <FormItem><FormLabel>API ID</FormLabel><FormControl><Input {...field} disabled={!!type} /></FormControl><FormMessage /></FormItem>} />
        <div>
          <FormLabel>Fields</FormLabel>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2 mt-2">
                {fields.map((field, index) => (
                  <SortableField key={field.id} field={field as ContentField} index={index} onRemove={remove} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ id: `field-${Date.now()}`, name: '', label: '', type: 'text' })}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Field
          </Button>
        </div>
        <Button type="submit" disabled={mutation.isPending}>{type ? 'Update' : 'Create'} Content Type</Button>
      </form>
    </Form>
  );
};
export function ContentTypes() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> New Type</Button></DialogTrigger>
              <DialogContent><DialogHeader><DialogTitle>Create New Content Type</DialogTitle><DialogDescription>Create a new content type with fields and settings.</DialogDescription></DialogHeader><ContentTypeForm onFinished={() => setIsDialogOpen(false)} /></DialogContent>
            </Dialog>
          </div>
          {error && <div className="text-red-500">Failed to load content types: {error.message}</div>}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
            initial="hidden" animate="show"
          >
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Card key={i}><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-4 w-1/2" /></CardContent></Card>)
            ) : contentTypes.length > 0 ? (
              contentTypes.map((type) => (
                <motion.div key={type.id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                  <Card className="transition-all hover:shadow-lg hover:-translate-y-1 h-full">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="flex items-center gap-2"><Layers className="h-5 w-5 text-muted-foreground" />{type.title}</CardTitle>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                      </div>
                    </CardHeader>
                    <CardContent><p className="text-sm text-muted-foreground">{type.fields.length} fields</p></CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="md:col-span-2 lg:col-span-3 text-center py-16">
                <h2 className="text-xl font-medium">No content types found</h2>
                <p className="text-muted-foreground mt-2">Get started by creating a new content type.</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
      <Toaster richColors />
    </AppLayout>
  );
}