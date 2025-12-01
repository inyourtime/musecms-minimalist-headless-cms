import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import type { ContentEntry, Media } from '@shared/types';
import { formatDistanceToNow } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { AspectRatio } from './ui/aspect-ratio';
interface ContentCardProps {
  entry: ContentEntry;
  isSelected: boolean;
  onSelectToggle: (id: string) => void;
}
export function ContentCard({ entry, isSelected, onSelectToggle }: ContentCardProps) {
  const coverImageId = entry.data.coverImage;
  const { data: mediaData } = useQuery({
    queryKey: ['media'],
    queryFn: () => api<{ items: Media[] }>('/api/media'),
    enabled: !!coverImageId,
  });
  const coverImage = mediaData?.items.find(m => m.id === coverImageId);
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <Card className={`flex flex-col h-full overflow-hidden rounded-xl shadow-sm transition-all duration-200 hover:shadow-lg ${isSelected ? 'ring-2 ring-primary' : ''}`}>
        {coverImage ? (
          <AspectRatio ratio={16 / 9}>
            <img src={coverImage.url} alt={entry.data.title || 'Cover image'} className="object-cover w-full h-full" />
          </AspectRatio>
        ) : (
          <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        )}
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Checkbox checked={isSelected} onCheckedChange={() => onSelectToggle(entry.id)} />
              <CardTitle className="text-lg leading-tight pr-2">
                <Link to={`/editor/${entry.id}`} className="hover:underline">{entry.data.title || 'Untitled Entry'}</Link>
              </CardTitle>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild><Link to={`/editor/${entry.id}`} className="w-full cursor-pointer"><Edit className="mr-2 h-4 w-4" /> Edit</Link></DropdownMenuItem>
                <DropdownMenuItem><Eye className="mr-2 h-4 w-4" /> Publish</DropdownMenuItem>
                <DropdownMenuItem className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/50"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full self-start ${entry.status === 'published' ? 'bg-primary/10 text-primary' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
            {entry.status}
          </span>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-2">{entry.data.excerpt || 'No excerpt available.'}</p>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            Updated {formatDistanceToNow(new Date(entry.updatedAt), { addSuffix: true })}
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}